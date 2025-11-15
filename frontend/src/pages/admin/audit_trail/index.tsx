import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Activity, User, FolderKanban, ClipboardList, Settings } from 'lucide-react';

type AuditLog = {
    id: number;
    user: string;
    action: 'created' | 'updated' | 'deleted' | 'login' | 'logout';
    resource: 'user' | 'project' | 'task' | 'system';
    resourceName: string;
    description: string;
    ipAddress: string;
    timestamp: string;
    details?: string;
};

const testAuditLogs: AuditLog[] = [
    {
        id: 1,
        user: 'John Doe',
        action: 'created',
        resource: 'project',
        resourceName: 'E-Commerce Platform',
        description: 'Created new project "E-Commerce Platform"',
        ipAddress: '192.168.1.100',
        timestamp: '2024-11-15 14:30:22',
    },
    {
        id: 2,
        user: 'Jane Smith',
        action: 'updated',
        resource: 'task',
        resourceName: 'Implement user authentication',
        description: 'Changed task status from "todo" to "in_progress"',
        ipAddress: '192.168.1.101',
        timestamp: '2024-11-15 14:25:18',
    },
    {
        id: 3,
        user: 'Bob Wilson',
        action: 'deleted',
        resource: 'user',
        resourceName: 'old_user@example.com',
        description: 'Deleted inactive user account',
        ipAddress: '192.168.1.102',
        timestamp: '2024-11-15 13:45:10',
    },
    {
        id: 4,
        user: 'Alice Brown',
        action: 'login',
        resource: 'system',
        resourceName: 'System Access',
        description: 'User logged into the system',
        ipAddress: '192.168.1.103',
        timestamp: '2024-11-15 13:20:05',
    },
    {
        id: 5,
        user: 'Charlie Davis',
        action: 'updated',
        resource: 'project',
        resourceName: 'Mobile App Development',
        description: 'Updated project end date',
        ipAddress: '192.168.1.104',
        timestamp: '2024-11-15 12:55:33',
    },
    {
        id: 6,
        user: 'John Doe',
        action: 'created',
        resource: 'task',
        resourceName: 'Setup CI/CD pipeline',
        description: 'Created new task and assigned to Bob Wilson',
        ipAddress: '192.168.1.100',
        timestamp: '2024-11-15 12:30:45',
    },
    {
        id: 7,
        user: 'Jane Smith',
        action: 'logout',
        resource: 'system',
        resourceName: 'System Access',
        description: 'User logged out from the system',
        ipAddress: '192.168.1.101',
        timestamp: '2024-11-15 11:45:20',
    },
    {
        id: 8,
        user: 'Bob Wilson',
        action: 'updated',
        resource: 'user',
        resourceName: 'alice.brown@example.com',
        description: 'Changed user role from "user" to "admin"',
        ipAddress: '192.168.1.102',
        timestamp: '2024-11-15 10:15:12',
    },
];

const getResourceIcon = (resource: string) => {
    const icons = {
        user: User,
        project: FolderKanban,
        task: ClipboardList,
        system: Settings,
    };
    const Icon = icons[resource as keyof typeof icons] || Activity;
    return <Icon className="h-4 w-4" />;
};

const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: 'timestamp',
        header: 'Timestamp',
        cell: ({ row }) => (
            <div className="text-sm">{row.getValue('timestamp')}</div>
        ),
    },
    {
        accessorKey: 'user',
        header: 'User',
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('user')}</div>
        ),
    },
    {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => {
            const action = row.getValue('action') as string;
            const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
                created: 'default',
                updated: 'secondary',
                deleted: 'destructive',
                login: 'outline',
                logout: 'outline',
            };
            return <Badge variant={variants[action]}>{action}</Badge>;
        },
    },
    {
        accessorKey: 'resource',
        header: 'Resource',
        cell: ({ row }) => {
            const resource = row.getValue('resource') as string;
            return (
                <div className="flex items-center gap-2">
                    {getResourceIcon(resource)}
                    <span className="capitalize">{resource}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
            <div className="max-w-[400px]">
                <div className="font-medium text-sm">{row.original.resourceName}</div>
                <div className="text-sm text-muted-foreground">{row.getValue('description')}</div>
            </div>
        ),
    },
    {
        accessorKey: 'ipAddress',
        header: 'IP Address',
        cell: ({ row }) => (
            <code className="text-xs bg-muted px-2 py-1 rounded">
                {row.getValue('ipAddress')}
            </code>
        ),
    },
];

export default function AuditTrailPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
                <p className="text-muted-foreground">
                    Track all system activities and changes
                </p>
            </div>
            <DataTable columns={columns} data={testAuditLogs} />
        </div>
    );
}