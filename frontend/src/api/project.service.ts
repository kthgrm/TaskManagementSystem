import api from './axios';

export interface Project {
    id: number;
    title: string;
    description: string;
    status: 'in_progress' | 'completed' | 'on_hold';
    start_date: string | null;
    end_date: string | null;
    created_by: number;
    created_by_username: string;
    created_by_details?: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    members: number[];
    members_details: Array<{
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    }>;
    task_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateProjectData {
    title: string;
    description?: string;
    status?: 'in_progress' | 'completed' | 'on_hold';
    start_date?: string;
    end_date?: string;
    members?: number[];
}

export interface UpdateProjectData extends CreateProjectData {}

class ProjectService {
    async getAllProjects(): Promise<Project[]> {
        const response = await api.get('projects/');
        // Handle paginated response from DRF
        return response.data.results || response.data;
    }

    async getProject(id: number): Promise<Project> {
        const response = await api.get(`projects/${id}/`);
        return response.data;
    }

    async createProject(data: CreateProjectData): Promise<Project> {
        const response = await api.post('projects/', data);
        return response.data;
    }

    async updateProject(id: number, data: UpdateProjectData): Promise<Project> {
        const response = await api.put(`projects/${id}/`, data);
        return response.data;
    }

    async deleteProject(id: number): Promise<void> {
        await api.delete(`projects/${id}/`);
    }

    async addMember(projectId: number, userId: number): Promise<void> {
        await api.post(`projects/${projectId}/add_member/`, {
            user_id: userId,
        });
    }

    async removeMember(projectId: number, userId: number): Promise<void> {
        await api.post(`projects/${projectId}/remove_member/`, {
            user_id: userId,
        });
    }
}

export const projectService = new ProjectService();
