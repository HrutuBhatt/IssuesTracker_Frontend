import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { IssueCardComponent } from '../issue-card/issue-card';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-issues-list',
  standalone: true,
  imports: [IssueCardComponent, ConfirmDialogComponent],
  templateUrl: './issues-list.html',
  styleUrl: './issues-list.css',
})
export class IssuesListComponent implements OnInit {
  private issueService = inject(IssueService);
  private router       = inject(Router);

  issues       = signal<Issue[]>([]);
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  // Dialog state before delete confirmation
  pendingDeleteIssue = signal<Issue | null>(null);

  ngOnInit(): void {
    this.loadIssues();
  }

  loadIssues(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.issueService.getAll().subscribe({
      next: (data) => {
        this.issues.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.message ?? 'Failed to load issues.');
        this.isLoading.set(false);
      },
    });
  }

  onEdit(issue: Issue): void {
    this.router.navigate(['/issues/edit', issue.id]);
  }

  onDelete(issue: Issue): void {
    this.pendingDeleteIssue.set(issue);
  }

  onDeleteConfirmed(): void {
    const issue = this.pendingDeleteIssue();
    if (!issue) return;

    this.pendingDeleteIssue.set(null)
    this.issueService.delete(issue.id).subscribe({
      next: () => {
        this.issues.update((list) => list.filter((i) => i.id !== issue.id));
      },
      error: (err) => {
        this.errorMessage.set(err.message ?? 'Failed to delete issue.');
      },
    });
  }

  onDeleteCancelled(): void {
    this.pendingDeleteIssue.set(null);  
  }

  navigateToCreate(): void {
    this.router.navigate(['/issues/new']);
  }
}

