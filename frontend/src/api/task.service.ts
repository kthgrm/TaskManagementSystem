import api from './axios';

export interface Task {
    id: number;
    title: string;
    description: string;
    project: number;
    project_name?: string;
    assigned_to: number | null;
    assigned_to_username?: string | null;
    assigned_to_details?: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        profile_picture: string | null;
    };
    created_by: number;
    created_by_username: string;
    priority: 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'completed';
    due_date: string | null;
    created_at: string;
    updated_at: string;
}

export interface CreateTaskData {
    title: string;
    description?: string;
    project: number;
    assigned_to?: number | null;
    priority?: 'low' | 'medium' | 'high';
    status?: 'todo' | 'in_progress' | 'completed';
    due_date?: string;
}

export interface UpdateTaskData extends CreateTaskData {}

class TaskService {
    async getAllTasks(params?: {
        project_id?: number;
        assigned_to?: number;
        status?: string;
        priority?: string;
    }): Promise<Task[]> {
        const response = await api.get('tasks/', { params });
        // Handle paginated response from DRF
        return response.data.results || response.data;
    }

    async getTask(id: number): Promise<Task> {
        const response = await api.get(`tasks/${id}/`);
        return response.data;
    }

    async createTask(data: CreateTaskData): Promise<Task> {
        const response = await api.post('tasks/', data);
        return response.data;
    }

    async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
        const response = await api.put(`tasks/${id}/`, data);
        return response.data;
    }

    async deleteTask(id: number): Promise<void> {
        await api.delete(`tasks/${id}/`);
    }

    async getMyTasks(): Promise<Task[]> {
        const response = await api.get('tasks/my_tasks/');
        // Handle paginated response from DRF
        return response.data.results || response.data;
    }

    async getTasksByProject(projectId: number): Promise<Task[]> {
        const response = await api.get('tasks/by_project/', {
            params: { project_id: projectId },
        });
        // Handle paginated response from DRF
        return response.data.results || response.data;
    }

    async assignTask(taskId: number, userId: number): Promise<Task> {
        const response = await api.post(`tasks/${taskId}/assign/`, {
            user_id: userId,
        });
        return response.data.task;
    }
}

export const taskService = new TaskService();
