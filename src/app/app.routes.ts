import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'issues',
    pathMatch: 'full',
  },
  {
    path: 'issues',
    loadComponent: () =>
      import('./features/issues/issues-list/issues-list').then(
        (m) => m.IssuesListComponent
      ),
  },
  {
    path: 'issues/new',
    loadComponent: () =>
      import('./features/issues/issue-form/issue-form').then(
        (m) => m.IssueFormComponent
      ),
  },
  {
    path: 'issues/edit/:id',
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

