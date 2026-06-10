import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IssueService } from '../../../core/services/issue.service';
import { IssueStatus, ISSUE_STATUSES } from '../../../core/models/issue.model';
import { SanitizeInputDirective } from '../../../shared/directives/sanitize-input.directive';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  templateUrl: './issue-form.html',
  styleUrl: './issue-form.css',
  imports: [ReactiveFormsModule, CommonModule, SanitizeInputDirective],
})
export class IssueFormComponent implements OnInit, OnDestroy {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private issueService = inject(IssueService);
  private fb           = inject(FormBuilder);

  // Subject to trigger cleanup on component destruction
  private destroy$ = new Subject<void>();

  // Mode detection, same form for create and update
  editId       = signal<number | null>(null);
  isEditMode   = signal(false);
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  readonly statusOptions = ISSUE_STATUSES;

  // nonNullable form definition using FormBuilder
  issueForm = this.fb.nonNullable.group({
    title:       ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    status:      ['Open' as IssueStatus],
  });


  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.isEditMode.set(true);
      this.loadIssue(id);
    }
    // else → create mode, form stays empty
  }

  ngOnDestroy(): void {
    // Emit and complete the Subject to clean up all active subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadIssue(id: number): void {
    this.isLoading.set(true);

    this.issueService.getById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (issue) => {
          this.issueForm.patchValue({
            title:       issue.title,
            description: issue.description ?? '',
            status:      issue.status,
          });
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set(err.message ?? 'Failed to load issue.');
          this.isLoading.set(false);
        },
      });
  }

  onSubmit(): void {
    if (this.issueForm.invalid) return;

    const { title, description, status } = this.issueForm.getRawValue();
    const payload = { title, description: description || undefined };

    // Pick the right Observable from edit or create
    const request$ = this.isEditMode()
      ? this.issueService.update(this.editId()!, { ...payload, status })
      : this.issueService.create(payload);

    this.isLoading.set(true);
    this.errorMessage.set(null);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next:  ()    => this.router.navigate(['/issues']),
        error: (err) => {
          this.errorMessage.set(err.message ?? 'Failed to save issue.');
          this.isLoading.set(false);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/issues']);
  }
}