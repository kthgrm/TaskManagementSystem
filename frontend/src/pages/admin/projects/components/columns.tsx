import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenu,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Project } from '@/api/project.service';
import { SortableHeader } from '@/components/data-table';
import { Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnActions {
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
}

export const createColumns = (actions: ColumnActions): ColumnDef<Project>[] => [
    {
        accessorKey: 'title',
        header: ({ column }) => <SortableHeader column={column}>Project Title</SortableHeader>,
        cell: ({ row }) => {
            return (
                <div>
                    <div className="font-semibold text-violet-800">{row.getValue('title')}</div>
                    <div className="text-sm text-muted-foreground line-clamp-1">{row.original.description || 'No description'}</div>
                </div>
            );
        },
    },
    {
        accessorKey: 'created_by',
        header: ({ column }) => <SortableHeader column={column}>Owner</SortableHeader>,
        cell: ({ row }) => {
            const creator = row.original.created_by_details;
            return creator ? `${creator.first_name} ${creator.last_name}` : 'N/A';
        },
    },
    {
        accessorKey: 'members',
        header: ({ column }) => <SortableHeader column={column}>Members</SortableHeader>,
        cell: ({ row }) => {
            const memberCount = (row.original.members_details?.length || 0); // members + creator
            return (
                <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {memberCount}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'created_at',
        header: ({ column }) => <SortableHeader column={column}>Created</SortableHeader>,
        cell: ({ row }) => {
            return new Date(row.getValue('created_at')).toLocaleDateString();
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
            const project = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => actions.onEdit(project)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit project
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => actions.onDelete(project)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];