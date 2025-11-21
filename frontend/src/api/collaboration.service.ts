import api from './axios';

export interface Comment {
    id: number;
    task: number;
    user: number;
    user_details: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    content: string;
    created_at: string;
    updated_at: string;
    parent: number | null;
    is_edited: boolean;
    replies: Comment[];
    replies_count: number;
}

export interface Notification {
    id: number;
    recipient: number;
    sender: number | null;
    sender_details: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    } | null;
    notification_type: 'comment' | 'mention' | 'task_assigned' | 'task_updated' | 'project_added';
    task: number | null;
    task_title: string | null;
    comment: number | null;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface ActivityLog {
    id: number;
    user: number;
    user_details: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    };
    action_type: 'created' | 'updated' | 'deleted' | 'commented' | 'status_changed' | 'assigned';
    task: number | null;
    task_title: string | null;
    project: number | null;
    project_name: string | null;
    description: string;
    metadata: any;
    created_at: string;
}

export const commentService = {
    // Get comments for a task
    getTaskComments: async (taskId: number): Promise<Comment[]> => {
        const response = await api.get(`/comments/?task=${taskId}`);
        return response.data;
    },

    // Create a comment
    createComment: async (data: { task: number; content: string; parent?: number }): Promise<Comment> => {
        const response = await api.post('/comments/', data);
        return response.data;
    },

    // Update a comment
    updateComment: async (id: number, data: { content: string }): Promise<Comment> => {
        const response = await api.patch(`/comments/${id}/`, data);
        return response.data;
    },

    // Delete a comment
    deleteComment: async (id: number): Promise<void> => {
        await api.delete(`/comments/${id}/`);
    },
};

export const notificationService = {
    // Get user notifications
    getNotifications: async (isRead?: boolean): Promise<Notification[]> => {
        const params = isRead !== undefined ? { is_read: isRead } : {};
        const response = await api.get('/notifications/', { params });
        return response.data;
    },

    // Mark notification as read
    markAsRead: async (id: number): Promise<void> => {
        await api.post(`/notifications/${id}/mark_read/`);
    },

    // Mark all notifications as read
    markAllAsRead: async (): Promise<void> => {
        await api.post('/notifications/mark_all_read/');
    },

    // Get unread count
    getUnreadCount: async (): Promise<number> => {
        const response = await api.get('/notifications/unread_count/');
        return response.data.count;
    },

    // Delete notification
    deleteNotification: async (id: number): Promise<void> => {
        await api.delete(`/notifications/${id}/`);
    },
};

export const activityService = {
    // Get project activities
    getProjectActivities: async (projectId: number): Promise<ActivityLog[]> => {
        const response = await api.get(`/activities/?project=${projectId}`);
        return response.data;
    },

    // Get task activities
    getTaskActivities: async (taskId: number): Promise<ActivityLog[]> => {
        const response = await api.get(`/activities/?task=${taskId}`);
        return response.data;
    },

    // Get all user activities
    getAllActivities: async (): Promise<ActivityLog[]> => {
        const response = await api.get('/activities/');
        return response.data;
    },
};
