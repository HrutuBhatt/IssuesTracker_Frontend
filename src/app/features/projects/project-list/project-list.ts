import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProjectService, Project } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
})
export class ProjectListComponent implements OnInit {
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  projects = signal<Project[]>([]);
  isLoading = signal(false);
  isCreating = signal(false);
  errorMessage = signal<string | null>(null);

  // Form for creating a project
  projectForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: [''],
  });

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.isLoading.set(true);
    this.projectService.getProjects().subscribe({
      next: (data) => {
        this.projects.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to load projects.');
        this.isLoading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.projectForm.invalid) return;

    this.isCreating.set(true);
    this.errorMessage.set(null);
    const { name, description } = this.projectForm.getRawValue();

    this.projectService.createProject({ name, description: description || undefined }).subscribe({
      next: (newProject) => {
        this.projects.update((list) => [...list, newProject]);
        this.projectForm.reset();
        this.isCreating.set(false);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.detail || 'Failed to create project.');
        this.isCreating.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
