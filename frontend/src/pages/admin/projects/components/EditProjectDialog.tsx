import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectService, type Project } from '@/api/project.service';
import { userService, type User } from '@/api/user.service';
import toast from 'react-hot-toast';
import { Loader2, X } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface EditProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project: Project;
    onSuccess: () => void;
}

export function EditProjectDialog({ open, onOpenChange, project, onSuccess }: EditProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        title: project.title,
        description: project.description || '',
        created_by: project.created_by || 0,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
    });

    useEffect(() => {
        if (open && project) {
            setFormData({
                title: project.title,
                description: project.description || '',
                created_by: project.created_by || 0,
                start_date: project.start_date || '',
                end_date: project.end_date || '',
            });
            loadUsers();
        }
    }, [open, project]);

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            const regularUsers = data.filter((u: User) => u.role === 'user' && (u.is_active || u.status === 'active'));
            setUsers(regularUsers);

            // Only set members that are regular users (exclude admins and creator)
            const regularUserIds = regularUsers.map(u => u.id);
            const filteredMembers = (project.members || []).filter(id => regularUserIds.includes(id));
            setSelectedMembers(filteredMembers);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const projectData: any = {
                title: formData.title,
                description: formData.description,
                members: selectedMembers,
            };

            // Include created_by if it has changed
            if (formData.created_by > 0) {
                projectData.created_by = formData.created_by;
            }

            // Include dates if provided
            if (formData.start_date) {
                projectData.start_date = formData.start_date;
            }
            if (formData.end_date) {
                projectData.end_date = formData.end_date;
            }

            await projectService.updateProject(project.id, projectData);
            toast.success('Project updated successfully');
            onSuccess();
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
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] border-t-4 border-t-violet-800">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="bg-linear-to-r from-violet-50 to-transparent pb-4 -mx-6 px-6 -mt-6 pt-6 mb-4 rounded-t-lg">
                        <DialogTitle className="text-xl text-violet-800">Edit Project</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">Update project information</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-base font-semibold">Project Name *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                className="border-violet-200 focus:border-violet-800 resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_date" className="text-base font-semibold">Start Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="border-violet-200 focus:border-violet-800"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="end_date" className="text-base font-semibold">End Date</Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    className="border-violet-200 focus:border-violet-800"
                                    min={formData.start_date || undefined}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="created_by" className="text-base font-semibold">Project Owner</Label>
                            <Select
                                value={formData.created_by.toString()}
                                onValueChange={(value) => setFormData({ ...formData, created_by: parseInt(value) })}
                            >
                                <SelectTrigger className="border-violet-200 focus:border-violet-800 w-full">
                                    <SelectValue placeholder="Select project owner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.first_name} {user.last_name} (@{user.username})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">Change the project owner if needed</p>
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-base font-semibold">Team Members</Label>
                            <p className="text-xs text-muted-foreground mb-2">Manage project team members</p>

                            {/* Selected Members */}
                            {selectedMembers.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                                    {selectedMembers.map(memberId => {
                                        const member = users.find(u => u.id === memberId);
                                        if (!member) return null;
                                        return (
                                            <Badge key={memberId} variant="secondary" className="pl-2 pr-1 py-1">
                                                <Avatar className="h-4 w-4 mr-1">
                                                    <AvatarImage src={getMediaUrl(member.profile_picture)} />
                                                    <AvatarFallback className="text-xs">
                                                        {member.first_name?.[0]}{member.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs">
                                                    {member.first_name} {member.last_name}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-4 w-4 p-0 ml-1 hover:bg-transparent"
                                                    onClick={() => setSelectedMembers(prev => prev.filter(id => id !== memberId))}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </Badge>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Available Users */}
                            <div className="border rounded-lg max-h-48 overflow-y-auto">
                                {users.length === 0 ? (
                                    <p className="text-sm text-muted-foreground p-4 text-center">No users available</p>
                                ) : (
                                    <div className="divide-y">
                                        {users.map(user => (
                                            <label
                                                key={user.id}
                                                className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                            >
                                                <Checkbox
                                                    checked={selectedMembers.includes(user.id)}
                                                    onCheckedChange={(checked: boolean) => {
                                                        setSelectedMembers(prev =>
                                                            checked
                                                                ? [...prev, user.id]
                                                                : prev.filter(id => id !== user.id)
                                                        );
                                                    }}
                                                />
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={getMediaUrl(user.profile_picture)} />
                                                    <AvatarFallback>
                                                        {user.first_name?.[0]}{user.last_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {user.first_name} {user.last_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="mt-6 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="border-gray-300 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-violet-800 hover:bg-violet-900 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Saving...' : (
                                <>
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
