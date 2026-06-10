import { Component, OnInit, inject, signal } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IssueService } from '../../../core/services/issue.service';
import { IssueStatus, ISSUE_STATUSES } from '../../../core/models/issue.model';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  templateUrl: './issue-form.html',
  styleUrl: './issue-form.css',
  imports: [ReactiveFormsModule, CommonModule],
})
export class IssueFormComponent implements OnInit {
  private route        = inject(ActivatedRoute);
  private router       = inject(Router);
  private issueService = inject(IssueService);

  // Mode detection, same form for create and update
  editId       = signal<number | null>(null);
  isEditMode   = signal(false);
  isLoading    = signal(false);
  errorMessage = signal<string | null>(null);

  readonly statusOptions = ISSUE_STATUSES;

  // nonNullable: true — getRawValue() returns string/IssueStatus, never null
  issueForm = new FormGroup({
    title:       new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    description: new FormControl(''),
    status:      new FormControl<IssueStatus>('Open', { nonNullable: true }),
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

  loadIssue(id: number): void {
    this.isLoading.set(true);

    this.issueService.getById(id).subscribe({
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

    request$.subscribe({
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