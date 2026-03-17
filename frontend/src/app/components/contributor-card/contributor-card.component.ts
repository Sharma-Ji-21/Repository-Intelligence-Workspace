import { Component, Input } from '@angular/core';
import { RepoContributor } from '../../models/repo.model';

@Component({
  selector: 'app-contributor-card',
  standalone: false,
  templateUrl: './contributor-card.component.html',
  styleUrls: ['./contributor-card.component.css'],
})
export class ContributorCardComponent {
  @Input() contributor!: RepoContributor;
}
