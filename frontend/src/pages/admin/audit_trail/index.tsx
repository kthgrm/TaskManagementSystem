import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { activityService, type ActivityLog as ActivityLogType } from '@/api/collaboration.service';
import { Skeleton } from '@/components/ui/skeleton';
import type { AuditLog } from '@/types';
import { columns } from './components/columns';

const getResourceType = (log: ActivityLogType): 'user' | 'project' | 'task' | 'system' => {
    if (log.task) return 'task';
    if (log.project) return 'project';
    return 'system';
};

export default function AuditTrailPage() {
    const [activities, setActivities] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, []);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await activityService.getAllActivities();

            // Transform ActivityLog to AuditLog format
            const auditLogs: AuditLog[] = data.map((log: ActivityLogType) => ({
                id: log.id,
                user: `${log.user_details.first_name} ${log.user_details.last_name}`,
                action: log.action_type,
                resource: getResourceType(log),
                resourceName: log.task_title || log.project_name || 'System',
                description: log.description,
                timestamp: log.created_at,
            }));

            setActivities(auditLogs);
        } catch (error) {
            console.error('Failed to load activities:', error);
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                    <p className="text-muted-foreground">
                        Track all system activities and changes
                    </p>
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
                <p className="text-muted-foreground">
                    Track all system activities and changes
                </p>
            </div>
            <DataTable
                columns={columns}
                data={activities}
                searchKey="user"
                searchPlaceholder="Search by user, action, or description..."
            />
        </div>
    );
}