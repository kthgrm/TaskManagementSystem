import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { projectService } from '@/api/project.service';
import { userService, type User } from '@/api/user.service';
import toast from 'react-hot-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface CreateProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateProjectDialog({ open, onOpenChange, onSuccess }: CreateProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        created_by: '',
    });

    useEffect(() => {
        if (open) {
            loadUsers();
            setFormData({
                name: '',
                description: '',
                created_by: '',
            });
            setSelectedMembers([]);
        }
    }, [open]);

    const loadUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data.filter((u: User) => u.role === 'user' && (u.is_active || u.status === 'active')));
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await projectService.createProject({
                title: formData.name,
                description: formData.description,
                members: selectedMembers,
            });
            toast.success('Project created successfully');
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error('Error creating project:', error);
            if (error.response?.data) {
                Object.entries(error.response.data).forEach(([field, messages]) => {
                    if (Array.isArray(messages)) {
                        messages.forEach((msg) => toast.error(`${field}: ${msg}`));
                    } else {
                        toast.error(`${field}: ${messages}`);
                    }
                });
            } else {
                toast.error('Failed to create project');
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
                        <DialogTitle className="text-xl text-violet-800">Create New Project</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-1">Add a new project to the system</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-base font-semibold">Project Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter project name"
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
                                placeholder="Enter project description"
                                className="border-violet-200 focus:border-violet-800 resize-none"
                                rows={4}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label className="text-base font-semibold">Team Members</Label>
                            <p className="text-xs text-muted-foreground mb-2">Select users to add to this project</p>

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
                            {loading ? 'Creating...' : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Project
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
