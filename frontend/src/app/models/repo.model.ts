export interface Repo {
  id: number;
  github_id: number;
  name: string;
  owner: string;
  full_name: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  open_issues: number;
  contributors_count: number;
  recent_commits?: number;
  pull_requests?: number;
  language_count?: number;
  dependency_count?: number;
  repo_url: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
}

export interface RepoInsight {
  repository: string;
  stars: number;
  forks: number;
  activityScore: number;
  complexityScore: number;
  difficultyLevel: string;
}

export interface RepoContributor {
  id: number;
  repo_id: number;
  username: string;
  profile_url: string | null;
  avatar_url: string | null;
  contributions: number;
}

export interface AddRepositoryRequest {
  repoUrl: string;
}
