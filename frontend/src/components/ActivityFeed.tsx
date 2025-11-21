import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { activityService, type ActivityLog } from '@/api/collaboration.service';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ActivityFeedProps {
    projectId?: number;
    taskId?: number;
}

export function ActivityFeed({ projectId, taskId }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [projectId, taskId]);

    const loadActivities = async () => {
        try {
            let response: any;
            if (taskId) {
                response = await activityService.getTaskActivities(taskId);
            } else if (projectId) {
                response = await activityService.getProjectActivities(projectId);
            } else {
                response = await activityService.getAllActivities();
            }
            // Handle paginated response - API returns { results: [], count: n }
            const data = Array.isArray(response) ? response : (response.results || []);
            setActivities(data);
        } catch (error) {
            console.error('Error loading activities:', error);
            toast.error('Failed to load activity feed');
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'created':
                return '✨';
            case 'updated':
                return '✏️';
            case 'deleted':
                return '🗑️';
            case 'commented':
                return '💬';
            case 'status_changed':
                return '🔄';
            case 'assigned':
                return '👤';
            default:
                return '📋';
        }
    };

    const getActionColor = (actionType: string) => {
        switch (actionType) {
            case 'created':
                return 'text-green-600';
            case 'updated':
                return 'text-blue-600';
            case 'deleted':
                return 'text-red-600';
            case 'commented':
                return 'text-purple-600';
            case 'status_changed':
                return 'text-yellow-600';
            case 'assigned':
                return 'text-cyan-600';
            default:
                return 'text-gray-600';
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent activity and changes</CardDescription>
            </CardHeader>
            <CardContent>
                {activities.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No activity yet</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity) => {
                            const initials = `${activity.user_details.first_name[0]}${activity.user_details.last_name[0]}`;
                            return (
                                <div key={activity.id} className="flex gap-3">
                                    <div className="relative">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 text-lg">
                                            {getActionIcon(activity.action_type)}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm">
                                            <span className="font-semibold">
                                                {activity.user_details.first_name} {activity.user_details.last_name}
                                            </span>
                                            {' '}
                                            <span className={getActionColor(activity.action_type)}>
                                                {activity.action_type.replace('_', ' ')}
                                            </span>
                                            {' '}
                                            {activity.description}
                                        </p>
                                        {(activity.task_title || activity.project_name) && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {activity.task_title && `Task: ${activity.task_title}`}
                                                {activity.task_title && activity.project_name && ' • '}
                                                {activity.project_name && `Project: ${activity.project_name}`}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(activity.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
