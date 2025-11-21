import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { taskService, type Task } from '@/api/task.service';
import { projectService } from '@/api/project.service';
import toast from 'react-hot-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { Comments } from '@/components/Comments';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Card, CardContent } from '@/components/ui/card';

interface EditTaskDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    task: Task;
    onSuccess: () => void;
    defaultTab?: 'details' | 'comments' | 'activity';
}

export function EditTaskDialog({ open, onOpenChange, task, onSuccess, defaultTab = 'details' }: EditTaskDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [members, setMembers] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        title: task.title,
        description: task.description || '',
        assigned_to: task.assigned_to?.toString() || 'unassigned',
        priority: task.priority,
        status: task.status,
        due_date: task.due_date || '',
    });

    useEffect(() => {
        if (open && task) {
            setFormData({
                title: task.title,
                description: task.description || '',
                assigned_to: task.assigned_to?.toString() || 'unassigned',
                priority: task.priority,
                status: task.status,
                due_date: task.due_date || '',
            });
            loadProjectMembers();
        }
    }, [open, task]);

    const loadProjectMembers = async () => {
        try {
            const project = await projectService.getProject(task.project);
            const allMembers = [...(project.members_details || [])];

            // Add project creator if not already in members list
            if (project.created_by_details) {
                const creatorExists = allMembers.some(m => m.id === project.created_by_details!.id);
                if (!creatorExists) {
                    allMembers.push(project.created_by_details);
                }
            }

            setMembers(allMembers);
        } catch (error: any) {
            console.error('Error loading members:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data: any = {
                title: formData.title,
                description: formData.description,
                project: task.project,
                priority: formData.priority,
                status: formData.status,
            };

            if (formData.assigned_to && formData.assigned_to !== 'unassigned') {
                data.assigned_to = parseInt(formData.assigned_to);
            }

            if (formData.due_date) {
                data.due_date = formData.due_date;
            }

            await taskService.updateTask(task.id, data);
            toast.success('Task updated successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Error updating task:', error);
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error('Failed to update task');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            await taskService.deleteTask(task.id);
            toast.success('Task deleted successfully');
            onSuccess();
        } catch (error: any) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-[700px] overflow-hidden flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-4 border-b">
                    <SheetTitle>Edit Task</SheetTitle>
                </SheetHeader>
                <Tabs defaultValue={defaultTab} className="flex-1 overflow-hidden flex flex-col px-6">
                    <TabsList className="w-full">
                        <TabsTrigger value="details" className='data-[active=true]:bg-violet-800 data-[active=true]:text-white'>Details</TabsTrigger>
                        <TabsTrigger value="comments" className='data-[active=true]:bg-violet-800 data-[active=true]:text-white'>Comments</TabsTrigger>
                        <TabsTrigger value="activity" className='data-[active=true]:bg-violet-800 data-[active=true]:text-white'>Activity</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="flex-1 overflow-y-auto">
                        <Card>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                                    <div className="grid gap-4 py-4 flex-1">
                                        <div className="grid gap-2">
                                            <Label htmlFor="title">Title *</Label>
                                            <Input
                                                id="title"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="description">Description</Label>
                                            <Textarea
                                                id="description"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows={3}
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="assigned_to">Assign To</Label>
                                                <Select
                                                    value={formData.assigned_to}
                                                    onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}
                                                >
                                                    <SelectTrigger className='w-full'>
                                                        <SelectValue placeholder="Select member" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {members.map((member) => (
                                                            <SelectItem key={member.id} value={member.id.toString()}>
                                                                {member.first_name} {member.last_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="priority">Priority</Label>
                                                <Select
                                                    value={formData.priority}
                                                    onValueChange={(value: 'low' | 'medium' | 'high') => setFormData({ ...formData, priority: value })}
                                                >
                                                    <SelectTrigger className='w-full'>
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
                                                <Label htmlFor="status">Status</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value: 'todo' | 'in_progress' | 'completed') => setFormData({ ...formData, status: value })}
                                                >
                                                    <SelectTrigger className='w-full'>
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
                                            <Label htmlFor="due_date">Due Date</Label>
                                            <Input
                                                id="due_date"
                                                type="date"
                                                value={formData.due_date}
                                                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between border-t py-4">
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className='bg-red-800 hover:bg-red-700'
                                        >
                                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </Button>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit" disabled={loading} className='bg-violet-800 hover:bg-violet-700'>
                                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="comments" className="flex-1 overflow-y-auto">
                        <Comments taskId={task.id} />
                    </TabsContent>
                    <TabsContent value="activity" className="flex-1 overflow-y-auto">
                        <ActivityFeed taskId={task.id} />
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
}
