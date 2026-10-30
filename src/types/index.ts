export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export type StepType = 'trigger' | 'condition' | 'ai_transform' | 'action';

export interface WorkflowStep {
  step_order: number;
  type: StepType;
  name: string;
  config: Record<string, any>;
}

export interface WorkflowDefinition {
  steps: WorkflowStep[];
}

export interface WorkflowMetrics {
  total_executions: number;
  success_rate: number;
  last_execution_at?: string | null;
}

export interface Workflow {
  id: number;
  user_id: number;
  name: string;
  problem_statement: string;
  solution_description?: string;
  is_active: boolean;
  definition: WorkflowDefinition;
  created_at: string;
  updated_at: string;
  metrics?: WorkflowMetrics;
}

export interface StepTrace {
  step_order: number;
  name: string;
  type: string;
  status: 'success' | 'failed' | 'skipped';
  duration_ms: number;
  details: any;
}

export interface Execution {
  id: number;
  workflow_id: number;
  workflow_name?: string;
  status: 'success' | 'failed' | 'running';
  input_payload: any;
  output_payload: any;
  error_message?: string | null;
  execution_time_ms: number;
  created_at: string;
}

export interface TelemetryMetrics {
  total_workflows: number;
  active_workflows: number;
  total_runs: number;
  success_rate: number;
  avg_duration_ms: number;
  estimated_hours_saved: string;
}

export interface AiAdvice {
  efficiency_score: number;
  estimated_hours_saved_weekly: number;
  bottlenecks: string[];
  recommendations: string[];
  risk_assessment: string;
}
