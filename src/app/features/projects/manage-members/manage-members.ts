import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectService, ProjectMember, ProjectRole } from '../../../core/services/project.service';
import { AuthService, User } from '../../../core/services/auth.service';
import { ProjectLayoutComponent } from '../project-layout/project-layout';
import { Subject, of } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SanitizeInputDirective } from '../../../shared/directives/sanitize-input.directive';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-members',
  standalone: true,
  templateUrl: './manage-members.html',
  styleUrl: './manage-members.css',
  imports: [CommonModule, ReactiveFormsModule, SanitizeInputDirective],
})
export class ManageMembersComponent implements OnInit {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private parent = inject(ProjectLayoutComponent);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  projectId = this.parent.projectId;
  currentUser = this.authService.currentUser;
  isAdmin = this.parent.isAdmin;

  members = signal<ProjectMember[]>([]);
  isLoading = signal(true);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Search User Auto-complete
  searchQuery = signal('');
  suggestions = signal<User[]>([]);
  selectedUser = signal<User | null>(null);
  searchSubject = new Subject<string>();

  availableRoles: ProjectRole[] = ['client', 'developer', 'admin'];

  // Form for adding new member
  addMemberForm = this.fb.nonNullable.group({
    role: ['client' as ProjectRole, Validators.required],
  });

  ngOnInit(): void {
    this.loadMembers();
    this.setupSearchDebounce();
  }

  loadMembers(): void {
    this.isLoading.set(true);
    this.projectService.getMembers(this.projectId()).subscribe({
      next: (data) => {
        this.members.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to load project members.');
        this.isLoading.set(false);
      },
    });
  }

  setupSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      switchMap((query) => {
        if (!query.trim()) return of([]);
        return this.authService.searchUsers(query);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (users) => {
        // Filter out users who are already members
        const memberIds = new Set(this.members().map((m) => m.user_id));
        const filtered = users.filter((u) => !memberIds.has(u.id));
        this.suggestions.set(filtered);
      },
    });
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
    this.selectedUser.set(null); // Clear selected user as they typed
    this.searchSubject.next(val);
  }

  selectUser(user: User): void {
    this.selectedUser.set(user);
    this.searchQuery.set(user.email);
    this.suggestions.set([]); // Hide suggestions
  }

  onAddMemberSubmit(): void {
    const user = this.selectedUser();
    if (!user) return;

    this.isSubmitting.set(true);
    const { role } = this.addMemberForm.getRawValue();

    this.projectService.addMember(this.projectId(), { user_id: user.id, role }).subscribe({
      next: (newMember) => {
        // Append member with email to list
        const completeMember: ProjectMember = {
          ...newMember,
          email: user.email,
        };
        this.members.update((list) => [...list, completeMember]);
        
        // Reset search states
        this.selectedUser.set(null);
        this.searchQuery.set('');
        this.addMemberForm.reset({ role: 'client' });
        this.isSubmitting.set(false);
      },
      error: (err) => {
        alert(err.error?.detail || 'Failed to add member.');
        this.isSubmitting.set(false);
      },
    });
  }

  onRoleChange(member: ProjectMember, event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value as ProjectRole;
    
    this.projectService.updateMemberRole(this.projectId(), member.user_id, newRole).subscribe({
      next: (updated) => {
        this.members.update((list) =>
          list.map((m) => (m.user_id === member.user_id ? { ...m, role: updated.role } : m))
        );
      },
      error: (err) => {
        alert(err.error?.detail || 'Failed to update member role.');
        this.loadMembers(); // Revert on failure
      },
    });
  }

  onRemoveMember(member: ProjectMember): void {
    if (confirm(`Are you sure you want to remove ${member.email} from this project?`)) {
      this.projectService.removeMember(this.projectId(), member.user_id).subscribe({
        next: () => {
          this.members.update((list) => list.filter((m) => m.user_id !== member.user_id));
        },
        error: (err) => alert(err.error?.detail || 'Failed to remove member.'),
      });
    }
  }

  isSelf(member: ProjectMember): boolean {
    return member.user_id === Number(this.currentUser()?.sub);
  }

  // onDeleteProject(): void {
  //   if (confirm('WARNING: Are you sure you want to delete this project? All issues, history, and user associations will be permanently erased. This action cannot be undone.')) {
  //     this.projectService.deleteProject(this.projectId()).subscribe({
  //       next: () => {
  //         this.router.navigate(['/projects']);
  //       },
  //       error: (err) => {
  //         this.errorMessage.set(err.error?.detail || 'Failed to delete project.');
  //       }
  //     });
  //   }
  // }
}
