import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export type ProjectRole = 'admin' | 'developer' | 'client';

export interface Project {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  created_at: string;
  role?: ProjectRole;
}

export interface ProjectCreate {
  name: string;
  description?: string;
}

export interface ProjectMember {
  id: number;
  project_id: number;
  user_id: number;
  email: string;
  role: ProjectRole;
  invited_by?: number;
  joined_at: string;
}

export interface ProjectMemberAdd {
  user_id: number;
  role: ProjectRole;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  getProjectById(id: number): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  createProject(project: ProjectCreate): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, project);
  }

  getMembers(projectId: number): Observable<ProjectMember[]> {
    return this.http.get<ProjectMember[]>(`${this.baseUrl}/${projectId}/members`);
  }

  addMember(projectId: number, member: ProjectMemberAdd): Observable<ProjectMember> {
    return this.http.post<ProjectMember>(`${this.baseUrl}/${projectId}/members`, member);
  }

  updateMemberRole(projectId: number, userId: number, role: ProjectRole): Observable<ProjectMember> {
    const params = new HttpParams().set('role', role);
    return this.http.put<ProjectMember>(`${this.baseUrl}/${projectId}/members/${userId}`, {}, { params });
  }

  removeMember(projectId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}/members/${userId}`);
  }

  deleteProject(projectId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${projectId}`);
  }
}
