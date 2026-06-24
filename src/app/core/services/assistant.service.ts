import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistantResponse {
  reply: string;
  issues_modified: boolean;
}

@Injectable({ providedIn: 'root' })
export class AssistantService {
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  ask(projectId: number, prompt: string, history: ConversationMessage[] = []): Observable<AssistantResponse> {
    return this.http.post<AssistantResponse>(
      `${this.baseUrl}/api/projects/${projectId}/assistant`,
      { prompt, history },
    );
  }
}
