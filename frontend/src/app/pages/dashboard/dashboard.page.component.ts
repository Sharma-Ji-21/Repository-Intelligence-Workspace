import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { Repo, RepoInsight } from '../../models/repo.model';
import { RepoService } from '../../services/repo.service';

@Component({
  selector: 'app-dashboard-page',
  standalone: false,
  templateUrl: './dashboard.page.component.html',
  styleUrls: ['./dashboard.page.component.css'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  private portfolioScatterChartCanvas?: ElementRef<HTMLCanvasElement>;

  @ViewChild('portfolioScatterChart')
  set portfolioScatterChartRef(value: ElementRef<HTMLCanvasElement> | undefined) {
    this.portfolioScatterChartCanvas = value;

    if (value && this.repoInsights.size > 0) {
      this.schedulePortfolioChartRender();
    }
  }

  repositories: Repo[] = [];
  loading = false;
  insightsLoading = false;
  portfolioChartReady = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'info';
  showToast = false;

  private repoInsights: Map<number, RepoInsight> = new Map();
  private portfolioChart: Chart | null = null;

  constructor(
    private readonly repoService: RepoService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.loadRepositories();
  }

  ngOnDestroy(): void {
    this.portfolioChart?.destroy();
  }

  get totalStars(): number {
    return this.repositories.reduce((total, repository) => total + repository.stars, 0);
  }

  get totalForks(): number {
    return this.repositories.reduce((total, repository) => total + repository.forks, 0);
  }

  get trackedLanguages(): number {
    return new Set(
      this.repositories
        .map((repository) => repository.language)
        .filter((language): language is string => Boolean(language)),
    ).size;
  }

  get featuredRepository(): Repo | null {
    return this.repositories.length > 0
      ? [...this.repositories].sort(
          (left, right) => this.getRepoRecency(right) - this.getRepoRecency(left),
        )[0]
      : null;
  }

  get featuredRepositoryUpdatedAt(): string | null {
    if (!this.featuredRepository) {
      return null;
    }

    return (
      this.featuredRepository.last_synced_at ||
      this.featuredRepository.updated_at ||
      this.featuredRepository.created_at ||
      null
    );
  }

  get hasInsightsData(): boolean {
    return this.repoInsights.size > 0;
  }

  loadRepositories(): void {
    this.loading = true;
    this.portfolioChartReady = false;
    this.repoInsights = new Map();
    this.portfolioChart?.destroy();
    this.portfolioChart = null;

    this.repoService.getRepositories().subscribe({
      next: (repositories) => {
        this.repositories = repositories;
        this.loading = false;

        if (repositories.length === 0) {
          return;
        }

        this.insightsLoading = true;
        forkJoin(
          repositories.map((repo) =>
            this.repoService.getInsights(repo.id).pipe(catchError(() => of(null))),
          ),
        ).subscribe({
          next: (insights) => {
            insights.forEach((insight, index) => {
              if (insight !== null) {
                this.repoInsights.set(repositories[index].id, insight);
              }
            });
            this.insightsLoading = false;
            this.schedulePortfolioChartRender();
          },
          error: () => {
            this.insightsLoading = false;
          },
        });
      },
      error: (error) => {
        console.error('Failed to load repositories', error);
        this.loading = false;
      },
    });
  }

  handleAddRepository(repoUrl: string): void {
    this.repoService.addRepository({ repoUrl }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.notify('This repository already exists in the database.', 'info');
        } else {
          this.notify('Repository added successfully.', 'success');
        }

        this.loadRepositories();
      },
      error: (error) => {
        console.error('Failed to add repository', error);

        if (error?.status === 404) {
          this.notify('Repository does not exist on GitHub (404).', 'error');
          return;
        }

        if (error?.status === 400) {
          this.notify(error?.error?.error || 'Invalid repository URL.', 'error');
          return;
        }

        this.notify(error?.error?.error || 'Failed to add repository.', 'error');
      },
    });
  }

  dismissToast(): void {
    this.showToast = false;
  }

  private notify(message: string, type: 'success' | 'error' | 'info'): void {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 3500);
  }

  openRepository(id: number): void {
    this.router.navigate(['/repository', id]);
  }

  private schedulePortfolioChartRender(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.renderPortfolioChart();
      });
    });
  }

  private getRepoRecency(repo: Repo): number {
    const recency = repo.last_synced_at || repo.updated_at || repo.created_at;

    if (!recency) {
      return 0;
    }

    const parsed = new Date(recency).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private renderPortfolioChart(): void {
    const canvas = this.portfolioScatterChartCanvas?.nativeElement;

    if (!canvas || this.repoInsights.size === 0) {
      this.portfolioChartReady = false;
      this.portfolioChart?.destroy();
      this.portfolioChart = null;
      return;
    }

    const palette = [
      '#0f766e',
      '#b45309',
      '#7c3aed',
      '#dc2626',
      '#2563eb',
      '#059669',
      '#c2410c',
      '#be185d',
      '#0891b2',
      '#65a30d',
    ];

    const datasets = this.repositories
      .filter((repo) => this.repoInsights.has(repo.id))
      .map((repo, index) => {
        const insight = this.repoInsights.get(repo.id)!;
        return {
          label: repo.full_name,
          data: [{ x: insight.activityScore, y: insight.complexityScore }],
          backgroundColor: palette[index % palette.length],
          borderColor: '#fffdf8',
          borderWidth: 2,
          clip: 14,
          pointRadius: 8,
          pointHoverRadius: 9,
        };
      });

    this.portfolioChart?.destroy();
    this.portfolioChart = new Chart(canvas, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 10,
              color: '#57534e',
              padding: 18,
              font: {
                family: 'Manrope',
                size: 12,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const repository = context.dataset.label;
                const point = context.raw as { x: number; y: number };
                return `${repository} — activity: ${point.x}, complexity: ${point.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Activity score',
              color: '#1c1917',
              font: {
                family: 'Manrope',
                size: 13,
                weight: 700,
              },
            },
            ticks: { color: '#57534e' },
            grid: { color: 'rgba(120, 53, 15, 0.12)' },
          },
          y: {
            min: 0,
            max: 100,
            title: {
              display: true,
              text: 'Complexity score',
              color: '#1c1917',
              font: {
                family: 'Manrope',
                size: 13,
                weight: 700,
              },
            },
            ticks: { color: '#57534e' },
            grid: { color: 'rgba(120, 53, 15, 0.12)' },
          },
        },
      },
    });
    this.portfolioChartReady = true;
  }
}
