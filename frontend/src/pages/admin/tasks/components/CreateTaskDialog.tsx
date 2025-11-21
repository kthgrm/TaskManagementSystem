import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { taskService } from '@/api/task.service';
import { projectService } from '@/api/project.service';
import { userService } from '@/api/user.service';
import toast from 'react-hot-toast';
import { Loader2, Plus } from 'lucide-react';

interface CreateTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateTaskDialog({ open, onOpenChange, onSuccess }: CreateTaskDialogProps) {
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [availableUsers, setAvailableUsers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: '',
        assigned_to: '',
        priority: 'medium' as 'low' | 'medium' | 'high',
        status: 'todo' as 'todo' | 'in_progress' | 'completed',
        due_date: '',
    });

    useEffect(() => {
        if (open) {
            loadData();
            setFormData({
                title: '',
                description: '',
                project: '',
                assigned_to: '',
                priority: 'medium',
                status: 'todo',
                due_date: '',
            });
        }
    }, [open]);

    const loadData = async () => {
        try {
            const [projectsData, usersData] = await Promise.all([
                projectService.getAllProjects(),
                userService.getAllUsers(),
            ]);
            setProjects(projectsData);
            setUsers(usersData.filter((u: any) => u.role === 'user'));
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // Update available users when project changes
    useEffect(() => {
        if (formData.project && projects.length > 0 && users.length > 0) {
            const selectedProject = projects.find(p => p.id.toString() === formData.project);
            if (selectedProject) {
                // Get members from the project (including creator)
                const memberIds = [...(selectedProject.members || []), selectedProject.created_by];
                const projectMembers = users.filter(u => memberIds.includes(u.id));
                setAvailableUsers(projectMembers);

                // Clear assigned_to if current user is not in project members
                if (formData.assigned_to && !memberIds.includes(parseInt(formData.assigned_to))) {
                    setFormData(prev => ({ ...prev, assigned_to: '' }));
                }
            }
        } else {
            setAvailableUsers([]);
        }
    }, [formData.project, projects, users]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: any = {
                title: formData.title,
                description: formData.description,
                project: parseInt(formData.project),
                priority: formData.priority,
                status: formData.status,
            };

            if (formData.assigned_to) {
                data.assigned_to = parseInt(formData.assigned_to);
            }

            if (formData.due_date) {
                data.due_date = formData.due_date;
            }

            await taskService.createTask(data);
            toast.success('Task created successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error creating task:', error);
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error('Failed to create task');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] border-t-4 border-t-violet-800">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="bg-linear-to-r from-violet-50 to-transparent pb-4 -mx-6 px-6 -mt-6 pt-6 mb-4 rounded-t-lg">
                        <DialogTitle className="text-xl text-violet-800">Create New Task</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">Add a new task to a project</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-base font-semibold">Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter task title"
                                className="border-violet-200 focus:border-violet-800"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter task description"
                                className="border-violet-200 focus:border-violet-800 resize-none"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="project" className="text-base font-semibold">Project *</Label>
                            <Select
                                value={formData.project}
                                onValueChange={(value) => setFormData({ ...formData, project: value })}
                                required
                            >
                                <SelectTrigger className='w-full border-violet-200 focus:border-violet-800'>
                                    <SelectValue placeholder="Select project" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project) => (
                                        <SelectItem key={project.id} value={project.id.toString()}>
                                            {project.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="assigned_to" className="text-base font-semibold">Assign To</Label>
                            <Select
                                value={formData.assigned_to}
                                onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                                disabled={!formData.project}
                            >
                                <SelectTrigger className='w-full border-violet-200 focus:border-violet-800'>
                                    <SelectValue placeholder={formData.project ? "Unassigned" : "Select project first"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableUsers.map((user) => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.first_name} {user.last_name} ({user.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="priority" className="text-base font-semibold">Priority</Label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                                >
                                    <SelectTrigger className='w-full border-violet-200 focus:border-violet-800'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status" className="text-base font-semibold">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value: 'todo' | 'in_progress' | 'completed') => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger className='w-full border-violet-200 focus:border-violet-800'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="todo">To Do</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="due_date" className="text-base font-semibold">Due Date</Label>
                            <Input
                                id="due_date"
                                type="date"
                                value={formData.due_date}
                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                className="border-violet-200 focus:border-violet-800"
                            />
                        </div>
                    </div>
                    <DialogFooter className="mt-6 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-gray-300 hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-violet-800 hover:bg-violet-900 text-white shadow-md hover:shadow-lg transition-all">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating...' : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Task
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
