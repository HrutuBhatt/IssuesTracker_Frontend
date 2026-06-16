import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Issue, CreateIssueDto, UpdateIssueDto, IssueHistory } from '../models/issue.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IssueService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // GET /api/projects/:projectId/issues — fetch all issues for a project
  getProjectIssues(projectId: number): Observable<Issue[]> {
    return this.http.get<Issue[]>(`${this.baseUrl}/api/projects/${projectId}/issues`);
  }

  // GET /api/issues/:id — fetch a single issue
  getById(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.baseUrl}/api/issues/${id}`);
  }

  // POST /api/projects/:projectId/issues — create a new issue in a project
  create(projectId: number, data: CreateIssueDto): Observable<Issue> {
    return this.http.post<Issue>(`${this.baseUrl}/api/projects/${projectId}/issues`, data);
  }

  // PUT /api/issues/:id — update an existing issue
  update(id: number, data: UpdateIssueDto): Observable<Issue> {
    return this.http.put<Issue>(`${this.baseUrl}/api/issues/${id}`, data);
  }

  // DELETE /api/issues/:id — delete an issue
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/issues/${id}`);
  }

  // GET /api/issues/:id/history — fetch issue audit trail
  getHistory(id: number): Observable<IssueHistory[]> {
    return this.http.get<IssueHistory[]>(`${this.baseUrl}/api/issues/${id}/history`);
  }
}