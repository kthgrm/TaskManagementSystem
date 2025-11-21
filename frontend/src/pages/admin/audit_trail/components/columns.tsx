import type { ColumnDef } from "@tanstack/react-table";
import { Activity, ClipboardList, FolderKanban, Settings, User } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { SortableHeader } from '@/components/data-table';
import type { AuditLog } from "@/types";


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

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: 'timestamp',
        header: ({ column }) => <SortableHeader column={column}>Timestamp</SortableHeader>,
        cell: ({ row }) => {
            const date = new Date(row.getValue('timestamp'));
            return (
                <div className="text-sm">
                    {date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                    })}{' '}
                    {date.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            );
        },
    },
    {
        accessorKey: 'user',
        header: ({ column }) => <SortableHeader column={column}>User</SortableHeader>,
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue('user')}</div>
        ),
    },
    {
        accessorKey: 'action',
        header: ({ column }) => <SortableHeader column={column}>Action</SortableHeader>,
        cell: ({ row }) => {
            const action = row.getValue('action') as string;
            const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
                created: 'default',
                updated: 'secondary',
                deleted: 'destructive',
                commented: 'outline',
                status_changed: 'secondary',
                assigned: 'outline',
            };
            const labels: Record<string, string> = {
                status_changed: 'Status Changed',
                created: 'Created',
                updated: 'Updated',
                deleted: 'Deleted',
                commented: 'Commented',
                assigned: 'Assigned',
            };
            return <Badge variant={variants[action] || 'default'}>{labels[action] || action}</Badge>;
        },
    },
    {
        accessorKey: 'resource',
        header: ({ column }) => <SortableHeader column={column}>Resource</SortableHeader>,
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
                <div className="text-sm text-muted-foreground wrap-break-word">{row.getValue('description')}</div>
            </div>
        ),
    },
];