import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Repo } from '../../models/repo.model';

@Component({
  selector: 'app-repo-card',
  standalone: false,
  templateUrl: './repo-card.component.html',
  styleUrls: ['./repo-card.component.css'],
})
export class RepoCardComponent {
  @Input() repo!: Repo;
  @Output() open = new EventEmitter<number>();

  openRepository(): void {
    this.open.emit(this.repo.id);
  }

  openGithub(event: MouseEvent): void {
    event.stopPropagation();
  }
}
