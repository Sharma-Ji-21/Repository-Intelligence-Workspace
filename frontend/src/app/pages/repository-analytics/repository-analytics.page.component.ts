import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Chart from 'chart.js/auto';
import { Repo, RepoContributor, RepoInsight } from '../../models/repo.model';
import { RepoService } from '../../services/repo.service';

@Component({
  selector: 'app-repository-analytics-page',
  standalone: false,
  templateUrl: './repository-analytics.page.component.html',
  styleUrls: ['./repository-analytics.page.component.css'],
})
export class RepositoryAnalyticsPageComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('insightsChart') insightsChartRef?: ElementRef<HTMLCanvasElement>;

  repository: Repo | null = null;
  insight: RepoInsight | null = null;
  contributors: RepoContributor[] = [];
  showAllContributors = false;
  loading = true;
  insightsChartReady = false;

  private chart: Chart | null = null;
  private routeSubscription?: Subscription;
  private pendingChartRender = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly repoService: RepoService,
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));

      if (Number.isNaN(id)) {
        this.router.navigate(['/dashboard']);
        return;
      }

      this.loadRepositoryAnalytics(id);
    });
  }


  ngAfterViewChecked(): void {
    if (this.pendingChartRender && this.insightsChartRef?.nativeElement && this.insight) {
      this.pendingChartRender = false;
      this.renderChart(this.insight);
    }
  }

  get topContributor(): RepoContributor | null {
    return this.contributors[0] ?? null;
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.chart?.destroy();
  }

  get visibleContributors(): RepoContributor[] {
    return this.showAllContributors ? this.contributors : this.contributors.slice(0, 10);
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleContributors(): void {
    if (!this.repository) {
      return;
    }

    if (!this.showAllContributors) {
      this.repoService.getContributors(this.repository.id).subscribe({
        next: (contributors) => {
          this.contributors = contributors;
          this.showAllContributors = true;
        },
        error: (error) => {
          console.error('Failed to load all contributors', error);
        },
      });
      return;
    }

    this.showAllContributors = false;
  }

  private loadRepositoryAnalytics(id: number): void {
    this.loading = true;
    this.showAllContributors = false;
    this.insightsChartReady = false;
    this.pendingChartRender = false;

    forkJoin({
      repository: this.repoService.getRepository(id),
      insight: this.repoService.getInsights(id).pipe(catchError(() => of(null))),
      contributors: this.repoService.getContributors(id).pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ repository, insight, contributors }) => {
        this.repository = repository;
        this.insight = insight;
        this.contributors = contributors;
        this.loading = false;

        if (insight) {
          this.chart?.destroy();
          this.chart = null;
          this.pendingChartRender = true;
        } else {
          this.insightsChartReady = false;
          this.chart?.destroy();
          this.chart = null;
        }
      },
      error: (error) => {
        console.error('Failed to load repository analytics', error);
        this.loading = false;
      },
    });
  }

  private renderChart(insight: RepoInsight): void {
    const canvas = this.insightsChartRef?.nativeElement;

    if (!canvas) {
      this.insightsChartReady = false;
      return;
    }

    this.chart?.destroy();
    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Activity Score', 'Complexity Score'],
        datasets: [
          {
            label: 'Repository Analytics',
            data: [insight.activityScore, insight.complexityScore],
            backgroundColor: ['#0f766e', '#b45309'],
            borderRadius: 10,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#57534e',
              font: {
                family: 'Manrope',
                size: 12,
                weight: 600,
              },
            },
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#78716c',
            },
            grid: {
              color: 'rgba(120, 53, 15, 0.12)',
            },
          },
        },
      },
    });
    this.insightsChartReady = true;
  }
}
