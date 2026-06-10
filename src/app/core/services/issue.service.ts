import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Issue, CreateIssueDto, UpdateIssueDto } from '../models/issue.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IssueService {

  private readonly apiUrl = `${environment.apiBaseUrl}/api/issues`;

  constructor(private http: HttpClient) {}

  // GET /api/issues — fetch all issues
  getAll(): Observable<Issue[]> {
    return this.http.get<Issue[]>(this.apiUrl);
  }

  // GET /api/issues/:id — fetch a single issue
  getById(id: number): Observable<Issue> {
    return this.http.get<Issue>(`${this.apiUrl}/${id}`);
  }

  // POST /api/issues — create a new issue
  create(data: CreateIssueDto): Observable<Issue> {
    return this.http.post<Issue>(this.apiUrl, data);
  }

  // PUT /api/issues/:id — update an existing issue
  update(id: number, data: UpdateIssueDto): Observable<Issue> {
    return this.http.put<Issue>(`${this.apiUrl}/${id}`, data);
  }

  // DELETE /api/issues/:id — returns 204 No Content
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}