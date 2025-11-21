import { useState, useEffect } from 'react';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Loader2, FolderKanban } from 'lucide-react';
import { projectService, type Project } from '@/api/project.service';
import toast from 'react-hot-toast';
import { CreateProjectDialog } from './components/CreateProjectDialog';
import { EditProjectDialog } from './components/EditProjectDialog';
import { createColumns } from './components/columns';

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
        if (!confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
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

    const columns = createColumns({
        onEdit: setEditProject,
        onDelete: handleDelete,
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">Projects Management</h1>
                    <p className="text-muted-foreground mt-1">Manage and monitor all system projects</p>
                </div>
                <Button
                    onClick={() => setCreateDialogOpen(true)}
                    className="bg-violet-800 hover:bg-violet-900 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Projects</p>
                                <p className="text-3xl font-bold text-violet-800">{projects.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <FolderKanban className="h-6 w-6 text-violet-800" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-violet-800">All Projects</CardTitle>
                    <CardDescription>View and manage project details, members, and settings</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={projects}
                        searchKey="title"
                        searchPlaceholder="Search projects by title..."
                    />
                </CardContent>
            </Card>

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