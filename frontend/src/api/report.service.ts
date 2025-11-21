import axios from './axios';

export interface ProjectSummary {
    project_id: number;
    project_name: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    todo_tasks: number;
    completion_percentage: number;
    created_by: string;
    member_count: number;
    is_owner?: boolean;
    your_tasks?: number;
    your_completed?: number;
}

export interface TaskCompletionRates {
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    todo_tasks: number;
    overall_completion_rate: number;
    by_priority?: {
        high: { total: number; completed: number; rate: number };
        medium: { total: number; completed: number; rate: number };
        low: { total: number; completed: number; rate: number };
    };
    my_tasks?: {
        total: number;
        completed: number;
        in_progress: number;
        completion_rate: number;
    };
}

export interface MemberProductivity {
    user_id: number;
    name: string;
    email: string;
    total_tasks_assigned: number;
    completed_tasks: number;
    in_progress_tasks: number;
    completion_rate: number;
    projects_created?: number;
    projects_member?: number;
}

export interface ReportData {
    project_summaries: ProjectSummary[];
    task_completion_rates: TaskCompletionRates;
    member_productivity: MemberProductivity[];
    filters: {
        start_date: string | null;
        end_date: string | null;
        project_id: string | null;
    };
}

export interface ReportFilters {
    start_date?: string;
    end_date?: string;
    project_id?: string;
}

class ReportService {
    async getAdminReports(filters?: ReportFilters): Promise<ReportData> {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.project_id) params.append('project_id', filters.project_id);

        const response = await axios.get(`/reports/admin/?${params.toString()}`);
        return response.data;
    }

    async getUserReports(filters?: ReportFilters): Promise<ReportData> {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.project_id) params.append('project_id', filters.project_id);

        const response = await axios.get(`/reports/user/?${params.toString()}`);
        return response.data;
    }
}

export const reportService = new ReportService();
