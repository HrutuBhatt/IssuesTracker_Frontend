import { Component, OnInit, inject, signal, computed, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService, Project, ProjectRole } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-project-layout',
  standalone: true,
  templateUrl: './project-layout.html',
  styleUrl: './project-layout.css',
  imports: [CommonModule, RouterModule],
})
export class ProjectLayoutComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  projectId = signal<number>(0);
  project = signal<Project | null>(null);
  userRole = signal<ProjectRole | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  isAdmin = computed(() => this.userRole() === 'admin');

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const idParam = params.get('id');
      if (idParam) {
        const id = Number(idParam);
        this.projectId.set(id);
        this.loadProjectDetails(id);
      }
    });
  }

  loadProjectDetails(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Fetch Project Details (which now contains the user's role)
    this.projectService.getProjectById(id).subscribe({
      next: (proj) => {
        this.project.set(proj);
        if (proj.role) {
          this.userRole.set(proj.role);
        } else {
          this.errorMessage.set('You do not have access to this project.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to load project details.');
        this.isLoading.set(false);
      },
    });
  }
}
