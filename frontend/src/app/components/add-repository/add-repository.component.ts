import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-add-repository',
  standalone: false,
  templateUrl: './add-repository.component.html',
  styleUrls: ['./add-repository.component.css'],
})
export class AddRepositoryComponent {
  @Output() addRepository = new EventEmitter<string>();

  repoUrl = '';

  submit(): void {
    const value = this.repoUrl.trim();

    if (!value) {
      return;
    }

    this.addRepository.emit(value);
    this.repoUrl = '';
  }
}
