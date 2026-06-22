import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IssueService } from '../../../core/services/issue.service';
import { ProjectService, ProjectMember } from '../../../core/services/project.service';
import { AssistantService } from '../../../core/services/assistant.service';
import { ProjectLayoutComponent } from '../project-layout/project-layout';
import { Issue, IssueHistory, IssueStatus, ISSUE_STATUSES, STATUS_LABELS } from '../../../core/models/issue.model';
import { SanitizeInputDirective } from '../../../shared/directives/sanitize-input.directive';

@Component({
  selector: 'app-issues-workspace',
  standalone: true,
  templateUrl: './issues-workspace.html',
  styleUrl: './issues-workspace.css',
  imports: [CommonModule, ReactiveFormsModule, SanitizeInputDirective],
})
export class IssuesWorkspaceComponent implements OnInit {
  private issueService = inject(IssueService);
  private projectService = inject(ProjectService);
  private assistantService = inject(AssistantService);
  private parent = inject(ProjectLayoutComponent);
  private fb = inject(FormBuilder);

  // Expose signals from parent layout
  projectId = this.parent.projectId;
  userRole = this.parent.userRole;

  issues = signal<Issue[]>([]);
  selectedIssue = signal<Issue | null>(null);
  issueHistory = signal<IssueHistory[]>([]);
  members = signal<ProjectMember[]>([]);

  memberMap = computed(() => {
    const map = new Map<number, string>();
    for (const member of this.members()) {
      map.set(member.user_id, member.email);
    }
    return map;
  });

  isLoadingList = signal(true);
  isLoadingDetails = signal(false);
  errorMessage = signal<string | null>(null);

  // Modal Control Signals
  showCreateModal = signal(false);
  showEditModal = signal(false);
  isSaving = signal(false);

  // Assistant Panel
  assistantOpen = signal(false);
  assistantPrompt = signal('');
  assistantReply = signal<string | null>(null);
  assistantLoading = signal(false);
  assistantError = signal<string | null>(null);

  // Role Permissions
  canCreateOrUpdate = computed(() => this.userRole() === 'admin' || this.userRole() === 'developer');
  canDelete = computed(() => this.userRole() === 'admin');
  isClient = computed(() => this.userRole() === 'client');

  statusOptions = ISSUE_STATUSES;
  statusLabels = STATUS_LABELS;

  // Form definition
  issueForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    assigned_to: [null as number | null],
  });

  ngOnInit(): void {
    this.loadIssues();
    this.loadProjectMembers();
  }

  loadIssues(): void {
    this.isLoadingList.set(true);
    this.issueService.getProjectIssues(this.projectId()).subscribe({
      next: (data) => {
        this.issues.set(data);
        this.isLoadingList.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to load issues.');
        this.isLoadingList.set(false);
      },
    });
  }

  loadProjectMembers(): void {
    this.projectService.getMembers(this.projectId()).subscribe({
      next: (data) => this.members.set(data),
      error: () => console.error('Failed to load project members for assignment dropdown.'),
    });
  }

  selectIssue(issue: Issue): void {
    this.isLoadingDetails.set(true);
    this.selectedIssue.set(issue);
    this.issueHistory.set([]);

    // Fetch latest details and history in parallel
    this.issueService.getById(issue.id).subscribe({
      next: (currentIssue) => {
        this.selectedIssue.set(currentIssue);
        this.issueService.getHistory(currentIssue.id).subscribe({
          next: (history) => {
            this.issueHistory.set(history);
            this.isLoadingDetails.set(false);
          },
          error: () => {
            this.isLoadingDetails.set(false);
          },
        });
      },
      error: () => {
        this.isLoadingDetails.set(false);
      },
    });
  }

  // Inline Quick Updates for Status and Assignee (Admins/Developers only)
  onQuickStatusChange(event: Event): void {
    const newStatus = (event.target as HTMLSelectElement).value as IssueStatus;
    const issue = this.selectedIssue();
    if (!issue || this.isClient()) return;

    this.issueService.update(issue.id, {
      title: issue.title,
      status: newStatus
    }).subscribe({
      next: (updated) => {
        this.selectedIssue.set(updated);
        this.refreshIssuesList(updated);
        this.selectIssue(updated); // Reload history logs
      },
      error: (err) => alert(err.error?.detail || 'Failed to update status.'),
    });
  }

  onQuickAssigneeChange(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    const assigneeId = val === 'null' ? null : Number(val);
    const issue = this.selectedIssue();
    if (!issue || this.isClient()) return;

    this.issueService.update(issue.id, {
      title: issue.title,
      assigned_to: assigneeId
    }).subscribe({
      next: (updated) => {
        this.selectedIssue.set(updated);
        this.refreshIssuesList(updated);
        this.selectIssue(updated); // Reload history logs
      },
      error: (err) => alert(err.error?.detail || 'Failed to update assignee.'),
    });
  }

  // Modals operations
  openCreateModal(): void {
    this.issueForm.reset({
      title: '',
      description: '',
      assigned_to: null,
    });
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onCreateSubmit(): void {
    if (this.issueForm.invalid) return;
    this.isSaving.set(true);

    const { title, description, assigned_to } = this.issueForm.getRawValue();
    const payload = {
      title,
      description: description || undefined,
      assigned_to: assigned_to || undefined,
    };

    this.issueService.create(this.projectId(), payload).subscribe({
      next: (newIssue) => {
        this.issues.update((list) => [...list, newIssue]);
        this.selectIssue(newIssue);
        this.closeCreateModal();
        this.isSaving.set(false);
      },
      error: (err) => {
        alert(err.error?.detail || 'Failed to create issue.');
        this.isSaving.set(false);
      },
    });
  }

  openEditModal(): void {
    const issue = this.selectedIssue();
    if (!issue) return;

    this.issueForm.setValue({
      title: issue.title,
      description: issue.description || '',
      assigned_to: issue.assigned_to,
    });
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onEditSubmit(): void {
    const issue = this.selectedIssue();
    if (this.issueForm.invalid || !issue) return;
    this.isSaving.set(true);

    const { title, description, assigned_to } = this.issueForm.getRawValue();
    const payload = {
      title,
      description: description || undefined,
      assigned_to: assigned_to || null,
    };

    this.issueService.update(issue.id, payload).subscribe({
      next: (updated) => {
        this.selectedIssue.set(updated);
        this.refreshIssuesList(updated);
        this.selectIssue(updated);
        this.closeEditModal();
        this.isSaving.set(false);
      },
      error: (err) => {
        alert(err.error?.detail || 'Failed to update issue.');
        this.isSaving.set(false);
      },
    });
  }

  onDeleteIssue(): void {
    const issue = this.selectedIssue();
    if (!issue || !this.canDelete()) return;

    if (confirm('Are you sure you want to delete this issue? This cannot be undone.')) {
      this.issueService.delete(issue.id).subscribe({
        next: () => {
          this.issues.update((list) => list.filter((i) => i.id !== issue.id));
          this.selectedIssue.set(null);
        },
        error: (err) => alert(err.error?.detail || 'Failed to delete issue.'),
      });
    }
  }

  toggleAssistant(): void {
    this.assistantOpen.update((v) => !v);
    if (!this.assistantOpen()) {
      this.assistantReply.set(null);
      this.assistantError.set(null);
    }
  }

  submitAssistantPrompt(): void {
    const prompt = this.assistantPrompt().trim();
    if (!prompt || this.assistantLoading()) return;

    this.assistantLoading.set(true);
    this.assistantReply.set(null);
    this.assistantError.set(null);

    this.assistantService.ask(this.projectId(), prompt).subscribe({
      next: (res) => {
        this.assistantReply.set(res.reply);
        this.assistantPrompt.set('');
        this.assistantLoading.set(false);
        if (res.issues_modified) {
          this.loadIssues();
        }
      },
      error: (err) => {
        this.assistantError.set(err.error?.detail || 'Assistant request failed.');
        this.assistantLoading.set(false);
      },
    });
  }

  // Helper Methods
  private refreshIssuesList(updated: Issue): void {
    this.issues.update((list) =>
      list.map((i) => (i.id === updated.id ? updated : i))
    );
  }

  getMemberEmail(userId: number | null): string {
    if (userId === null) return 'Unassigned';
    return this.memberMap().get(userId) || `User #${userId}`;
  }
}
