import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/signup/signup').then((m) => m.SignupComponent),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-list/project-list').then(
        (m) => m.ProjectListComponent
      ),
  },
  {
    path: 'projects/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/projects/project-layout/project-layout').then(
        (m) => m.ProjectLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'issues',
        pathMatch: 'full',
      },
      {
        path: 'issues',
        loadComponent: () =>
          import('./features/projects/issues-workspace/issues-workspace').then(
            (m) => m.IssuesWorkspaceComponent
          ),
      },
      {
        path: 'members',
        loadComponent: () =>
          import('./features/projects/manage-members/manage-members').then(
            (m) => m.ManageMembersComponent
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'projects',
  },
];
