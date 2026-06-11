import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'issues',
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
    path: 'issues',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/issues-list/issues-list').then(
        (m) => m.IssuesListComponent
      ),
  },
  {
    path: 'issues/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/issue-form/issue-form').then(
        (m) => m.IssueFormComponent
      ),
  },
  {
    path: 'issues/edit/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/issues/issue-form/issue-form').then(
        (m) => m.IssueFormComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'issues',
  },
];


