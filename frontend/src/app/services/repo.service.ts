import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Repo, RepoInsight, RepoContributor, AddRepositoryRequest } from '../models/repo.model';

@Injectable({
  providedIn: 'root',
})
export class RepoService {

  private readonly baseUrl = 'https://repository-intelligence-workspace.onrender.com/api';
  // private readonly baseUrl = 'http://localhost:5050/api';

  constructor(private readonly http: HttpClient) {}

  getRepositories(): Observable<Repo[]> {
    return this.http.get<Repo[]>(`${this.baseUrl}/repos`);
  }

  addRepository(payload: AddRepositoryRequest): Observable<HttpResponse<Repo>> {
    return this.http.post<Repo>(`${this.baseUrl}/repos`, payload, {
      observe: 'response',
    });
  }

  getRepository(id: number | string): Observable<Repo> {
    return this.http.get<Repo>(`${this.baseUrl}/repos/${id}`);
  }

  getInsights(id: number | string): Observable<RepoInsight> {
    return this.http.get<RepoInsight>(`${this.baseUrl}/repos/${id}/insights`);
  }

  getContributors(id: number | string): Observable<RepoContributor[]> {
    return this.http.get<RepoContributor[]>(`${this.baseUrl}/repos/${id}/contributors`);
  }
}
