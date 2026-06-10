import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Issue } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-card.html',
  styleUrl: './issue-card.css',
})
export class IssueCardComponent {

  issue = input.required<Issue>();

  edit   = output<Issue>();
  delete = output<Issue>();

  onEdit():   void { this.edit.emit(this.issue()); }
  onDelete(): void { this.delete.emit(this.issue()); }
}

