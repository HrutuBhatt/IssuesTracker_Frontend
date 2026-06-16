export type IssueStatus = 'open' | 'in_progress' | 'closed';

// Runtime array - used in dropdowns/templates
export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'closed'];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed'
};

// Matches IssueResponse schema from the backend
export interface Issue {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string | null;
}

// Matches IssueCreate schema — used for POST /api/projects/:id/issues
export interface CreateIssueDto {
  title: string;
  description?: string;
  assigned_to?: number | null;
}

// Matches IssueUpdate schema — used for PUT /api/issues/:id
export interface UpdateIssueDto {
  title?: string;
  description?: string;
  status?: IssueStatus;
  assigned_to?: number | null;
}

// Matches IssueHistoryResponse schema from the backend
export interface IssueHistory {
  id: number;
  issue_id: number;
  changed_by: number;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
}
