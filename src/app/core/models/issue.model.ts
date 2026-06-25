export type IssueStatus = 'open' | 'in_progress' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueType = 'bug' | 'feature' | 'change-request' | 'triage';

// Runtime arrays - used in dropdowns/templates
export const ISSUE_STATUSES: IssueStatus[] = ['open', 'in_progress', 'closed'];
export const ISSUE_PRIORITIES: IssuePriority[] = ['low', 'medium', 'high', 'critical'];
export const ISSUE_TYPES: IssueType[] = ['bug', 'feature', 'change-request', 'triage'];

export const STATUS_LABELS: Record<IssueStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const TYPE_LABELS: Record<IssueType, string> = {
  bug: 'Bug',
  feature: 'Feature',
  'change-request': 'Change Request',
  triage: 'Triage',
};

// Matches IssueResponse schema from the backend
export interface Issue {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  issue_type: IssueType;
  created_by: number;
  assigned_to: number | null;
  created_at: string;
  updated_at: string | null;
}

// Matches IssueCreate schema — used for POST /api/projects/:id/issues
export interface CreateIssueDto {
  title: string;
  description?: string;
  priority: IssuePriority;
  issue_type: IssueType;
  assigned_to?: number | null;
}

// Matches IssueUpdate schema — used for PUT /api/issues/:id
export interface UpdateIssueDto {
  title?: string;
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  issue_type?: IssueType | null;
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
