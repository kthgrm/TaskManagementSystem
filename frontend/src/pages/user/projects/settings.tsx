import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Trash2, UserPlus, ChevronLeft, Users, Info, Save } from 'lucide-react';
import { projectService, type Project } from '@/api/project.service';
import { userService } from '@/api/user.service';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProjectRefresh } from '@/contexts/ProjectContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function ProjectSettingsPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { triggerProjectRefresh } = useProjectRefresh();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [addingMember, setAddingMember] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
    });

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadUsers();
        }
    }, [projectId]);

    const loadProject = async () => {
        if (!projectId) return;
        try {
            const data = await projectService.getProject(parseInt(projectId));

            // Check if user is owner
            if (user?.id !== data.created_by) {
                toast.error('You do not have permission to edit this project');
                navigate(`/user/projects/${projectId}`);
                return;
            }

            setProject(data);
            setFormData({
                title: data.title,
                description: data.description || '',
                start_date: data.start_date || '',
                end_date: data.end_date || '',
            });
        } catch (error: any) {
            console.error('Error loading project:', error);
            toast.error('Failed to load project');
            navigate('/user/projects');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await userService.getAvailableUsers();
            setAllUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!projectId) return;

        setSaving(true);
        try {
            const data: any = {
                title: formData.title,
                description: formData.description,
            };

            if (formData.start_date) data.start_date = formData.start_date;
            if (formData.end_date) data.end_date = formData.end_date;

            await projectService.updateProject(parseInt(projectId), data);
            toast.success('Project updated successfully');
            triggerProjectRefresh(); // Refresh sidebar projects
            loadProject();
        } catch (error: any) {
            console.error('Error updating project:', error);
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error('Failed to update project');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!projectId || !confirm('Are you sure you want to delete this project? This action cannot be undone and will delete all associated tasks.')) {
            return;
        }

        setDeleting(true);
        try {
            await projectService.deleteProject(parseInt(projectId));
            toast.success('Project deleted successfully');
            triggerProjectRefresh(); // Refresh sidebar projects
            navigate('/user/projects');
        } catch (error: any) {
            console.error('Error deleting project:', error);
            toast.error('Failed to delete project');
        } finally {
            setDeleting(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedUser || !projectId) return;

        setAddingMember(true);
        try {
            await projectService.addMember(parseInt(projectId), parseInt(selectedUser));
            toast.success('Member added successfully');
            setSelectedUser('');
            triggerProjectRefresh(); // Refresh sidebar projects
            loadProject();
        } catch (error: any) {
            console.error('Error adding member:', error);
            toast.error(error.response?.data?.detail || 'Failed to add member');
        } finally {
            setAddingMember(false);
        }
    };

    const handleRemoveMember = async (userId: number) => {
        if (!projectId || !confirm('Are you sure you want to remove this member?')) {
            return;
        }

        try {
            await projectService.removeMember(parseInt(projectId), userId);
            toast.success('Member removed successfully');
            triggerProjectRefresh(); // Refresh sidebar projects
            loadProject();
        } catch (error: any) {
            console.error('Error removing member:', error);
            toast.error(error.response?.data?.detail || 'Failed to remove member');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    const availableUsers = allUsers.filter(
        u => !project.members?.includes(u.id) && u.id !== project.created_by
    );

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="bg-white border-b pb-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/user/projects/${projectId}`)}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-orange-500 flex items-center justify-center text-white font-semibold text-lg">
                            {project.title[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold">{project.title}</h1>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <Tabs defaultValue="general" className="w-full">
                    <TabsList className="bg-transparent border-b p-0 h-auto gap-1 w-full rounded-none justify-start">
                        <TabsTrigger
                            value="general"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-violet-800 rounded-none px-4 py-2 hover:bg-accent hover:text-accent-foreground max-w-xs"
                        >
                            <Info className="h-4 w-4 mr-2" />
                            General
                        </TabsTrigger>
                        <TabsTrigger
                            value="members"
                            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-b-violet-800 rounded-none px-4 py-2 hover:bg-accent hover:text-accent-foreground max-w-xs"
                        >
                            <Users className="h-4 w-4 mr-2" />
                            Members
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="mt-0 space-y-6">
                        <Card className='p-0 max-w-3xl mx-auto'>
                            <CardHeader className='bg-violet-800 rounded-t-lg px-6 py-2 pt-4'>
                                <h3 className="text-base font-semibold text-white">Project Settings</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between flex-col">
                                    <div className="mb-4">
                                        <Label htmlFor="title" className="text-sm font-medium">
                                            Title
                                        </Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <Label htmlFor="description" className="text-sm font-medium">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            placeholder="Add project description..."
                                        />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="mb-4">
                                            <Label htmlFor="start_date" className="text-sm font-medium">
                                                Start date
                                            </Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={formData.start_date}
                                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-4">
                                            <Label htmlFor="end_date" className="text-sm font-medium">
                                                End date
                                            </Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={formData.end_date}
                                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="ml-auto pb-6 mt-2">
                                        <Button onClick={handleSubmit} disabled={saving} className="bg-violet-800 hover:bg-violet-600">
                                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='pt-0 max-w-3xl mx-auto'>
                            <CardHeader className='bg-red-800 rounded-t-lg px-6 py-2 pt-4'>
                                <h3 className="text-base font-semibold text-white">Danger zone</h3>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Delete this project</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Once you delete a project, there is no going back. Please be certain.
                                        </p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className='bg-red-800 hover:bg-red-900'
                                    >
                                        {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="members" className="mt-0">
                        <Card className='pt-0 max-w-3xl mx-auto'>
                            <CardHeader className='bg-violet-800 rounded-t-lg px-6 pt-4 pb-4'>
                                <h3 className="text-base font-semibold text-white">Team Members</h3>
                                <p className="text-sm text-white">Manage who has access to this project</p>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="flex justify-between flex-col w-full">
                                        <div className="flex gap-2">
                                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select a member to add" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableUsers.map((user) => (
                                                        <SelectItem key={user.id} value={user.id.toString()}>
                                                            {user.first_name} {user.last_name} ({user.username})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={handleAddMember}
                                                disabled={!selectedUser || addingMember}
                                                className="bg-violet-800 hover:bg-violet-900"
                                            >
                                                {addingMember && <Loader2 className="h-4 w-4 animate-spin" />}
                                                <UserPlus className="h-4 w-4" />
                                                Add
                                            </Button>
                                        </div>

                                        {/* Members List */}
                                        <div className="border rounded-lg divide-y mt-6">
                                            {project.members_details && project.members_details.length > 0 ? (
                                                project.members_details.map((member) => (
                                                    <div
                                                        key={member.id}
                                                        className="flex items-center justify-between p-4 hover:bg-muted/50"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                                    {member.first_name[0]}{member.last_name[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {member.first_name} {member.last_name}
                                                                </div>
                                                                <div className="text-sm text-muted-foreground">
                                                                    {member.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveMember(member.id)}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    No members added yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    );
}
