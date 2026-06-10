export type IssueStatus = 'Open' | 'In Progress' | 'Closed';

// Runtime array - used in dropdowns/templates (types are erased at runtime)
export const ISSUE_STATUSES: IssueStatus[] = ['Open', 'In Progress', 'Closed'];

// Matches IssueResponse schema from the backend
export interface Issue {
  id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  created_at: string;
  updated_at: string | null;
}

// Matches IssueCreate schema — used for POST /api/issues
export interface CreateIssueDto {
  title: string;
  description?: string;
  status?: IssueStatus;
}

// Matches IssueUpdate schema — used for PUT /api/issues/:id
export interface UpdateIssueDto {
  title?: string;
  description?: string;
  status?: IssueStatus;
}
