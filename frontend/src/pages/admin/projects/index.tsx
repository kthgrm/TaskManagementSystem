import { useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { projectService, type Project } from '@/api/project.service';
import { userService } from '@/api/user.service';
import toast from 'react-hot-toast';
import { CreateProjectDialog } from './components/CreateProjectDialog';
import { EditProjectDialog } from './components/EditProjectDialog';





export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editProject, setEditProject] = useState<Project | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            const data = await projectService.getAllProjects();
            setProjects(data);
        } catch (error) {
            console.error('Error loading projects:', error);
            toast.error('Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (project: Project) => {
        if (!confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await projectService.deleteProject(project.id);
            toast.success('Project deleted successfully');
            loadProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        }
    };

    const columns: ColumnDef<Project>[] = [
        {
            accessorKey: 'name',
            header: 'Project Name',
            cell: ({ row }) => {
                return (
                    <div>
                        <div className="font-medium">{row.getValue('name')}</div>
                        <div className="text-sm text-muted-foreground">{row.original.description}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'created_by',
            header: 'Created By',
            cell: ({ row }) => {
                const creator = row.original.created_by_details;
                return creator ? `${creator.first_name} ${creator.last_name}` : 'N/A';
            },
        },

        {
            accessorKey: 'members',
            header: 'Members',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {row.original.members?.length || 0}
                </div>
            ),
        },
        {
            accessorKey: 'created_at',
            header: 'Created',
            cell: ({ row }) => {
                return new Date(row.getValue('created_at')).toLocaleDateString();
            },
        },
        {
            id: 'actions',
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
                            <DropdownMenuItem onClick={() => setEditProject(project)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit project
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(project)}
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


    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage all projects in the system</p>
                </div>
                <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>
            <DataTable columns={columns} data={projects} />

            <CreateProjectDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSuccess={loadProjects}
            />

            {editProject && (
                <EditProjectDialog
                    open={!!editProject}
                    onOpenChange={(open) => !open && setEditProject(null)}
                    project={editProject}
                    onSuccess={() => {
                        loadProjects();
                        setEditProject(null);
                    }}
                />
            )}
        </div>
    );
}