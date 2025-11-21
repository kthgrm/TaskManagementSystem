import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Calendar, Users, ListChecks } from 'lucide-react';
import { projectService, type Project } from '@/api/project.service';
import toast from 'react-hot-toast';
import { CreateProjectDialog } from './components/CreateProjectDialog';

export default function ProjectsPage() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getAllProjects();
            setProjects(data);
        } catch (error: any) {
            console.error('Error loading projects:', error);
            toast.error(error.response?.data?.detail || 'Failed to load projects');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = () => {
        loadProjects();
        setShowCreateDialog(false);
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'completed':
                return 'default';
            case 'in_progress':
                return 'secondary';
            case 'on_hold':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
                    <p className="text-muted-foreground">
                        Manage and track your projects
                    </p>
                </div>
                <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Project
                </Button>
            </div>

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <ListChecks className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Get started by creating your first project
                        </p>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {projects.map((project) => (
                        <Card
                            key={project.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => navigate(`/user/projects/${project.id}`)}
                        >
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                                    <Badge variant={getStatusVariant(project.status)}>
                                        {getStatusLabel(project.status)}
                                    </Badge>
                                </div>
                                <CardDescription className="line-clamp-2">
                                    {project.description || 'No description'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <ListChecks className="mr-2 h-4 w-4" />
                                        {project.task_count} {project.task_count === 1 ? 'task' : 'tasks'}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Users className="mr-2 h-4 w-4" />
                                        {project.members_details.length} {project.members_details.length === 1 ? 'member' : 'members'}
                                    </div>
                                    {project.end_date && (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Calendar className="mr-2 h-4 w-4" />
                                            Due {new Date(project.end_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <CreateProjectDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleCreateProject}
            />
        </div>
    );
}
