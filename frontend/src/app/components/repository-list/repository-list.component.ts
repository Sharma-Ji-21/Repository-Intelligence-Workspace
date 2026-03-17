import { Component, OnInit } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { Repo, RepoContributor, RepoInsight } from '../../models/repo.model';
import { RepoService } from '../../services/repo.service';

@Component({
  selector: 'app-repository-list',
  standalone: false,
  templateUrl: './repository-list.component.html',
  styleUrls: ['./repository-list.component.css'],
})
export class RepositoryListComponent implements OnInit {
  repositories: Repo[] = [];
  selectedRepositoryId: number | null = null;
  selectedRepository: Repo | null = null;
  insight: RepoInsight | null = null;
  contributors: RepoContributor[] = [];
  loadingDetails = false;

  constructor(private readonly repoService: RepoService) {}

  ngOnInit(): void {
    this.loadRepositories();
  }

  loadRepositories(): void {
    this.repoService.getRepositories().subscribe({
      next: (repositories) => {
        this.repositories = repositories;
      },
      error: (error) => {
        console.error('Failed to load repositories', error);
      },
    });
  }

  selectRepository(id: number): void {
    this.selectedRepositoryId = id;
    this.loadingDetails = true;

    forkJoin({
      selectedRepository: this.repoService.getRepository(id),
      insight: this.repoService.getInsights(id).pipe(catchError(() => of(null))),
      contributors: this.repoService.getContributors(id).pipe(catchError(() => of([]))),
    })
      .pipe(
        finalize(() => {
          this.loadingDetails = false;
        }),
      )
      .subscribe({
        next: ({ selectedRepository, insight, contributors }) => {
          this.selectedRepository = selectedRepository;
          this.insight = insight;
          this.contributors = contributors;
        },
        error: (error) => {
          console.error('Failed to load repository details', error);
        },
      });
  }
}
