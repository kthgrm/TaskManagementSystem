import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { userService, type User } from '@/api/user.service';
import { DeleteUserDialog } from './components/DeleteUserDialog';
import toast from 'react-hot-toast';

export default function ViewUserPage() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const users = await userService.getAllUsers();
            const foundUser = users.find(u => u.id === parseInt(userId));
            if (foundUser) {
                setUser(foundUser);
            } else {
                toast.error('User not found');
                navigate('/admin/users');
            }
        } catch (error: any) {
            console.error('Error loading user:', error);
            toast.error(error.response?.data?.detail || 'Failed to load user');
            navigate('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!user) return;

        try {
            await userService.toggleUserStatus(user.id);
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            loadUser();
        } catch (error: any) {
            console.error('Error toggling user status:', error);
            toast.error(error.response?.data?.error || 'Failed to toggle user status');
        }
    };

    const handleConfirmDelete = async () => {
        if (!user) return;

        try {
            await userService.deleteUser(user.id);
            toast.success('User deleted successfully');
            navigate('/admin/users');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    const isActive = user.status === 'active' || user.is_active;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/users')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                        <p className="text-muted-foreground">View user information and statistics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleToggleStatus}
                    >
                        {isActive ? (
                            <>
                                <UserX className="mr-2 h-4 w-4" />
                                Deactivate
                            </>
                        ) : (
                            <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                Activate
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Personal details and account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Username</Label>
                            <p className="text-lg font-medium">{user.username}</p>
                        </div>
                        <div>
                            <Label>Email</Label>
                            <p className="text-lg font-medium">{user.email}</p>
                        </div>
                        <div>
                            <Label>Full Name</Label>
                            <p className="text-lg font-medium">{user.full_name || '-'}</p>
                        </div>
                        <div>
                            <Label>Phone</Label>
                            <p className="text-lg font-medium">{user.phone || '-'}</p>
                        </div>
                        <div>
                            <Label>Role</Label>
                            <div className="mt-1">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <Label>Status</Label>
                            <div className="mt-1">
                                <Badge variant={isActive ? 'default' : 'outline'}>
                                    {user.status}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Activity & Statistics</CardTitle>
                        <CardDescription>User engagement and activity metrics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>Projects</Label>
                            <p className="text-3xl font-bold">{user.project_count || 0}</p>
                            <p className="text-sm text-muted-foreground">Total projects assigned</p>
                        </div>
                        <div>
                            <Label>Tasks</Label>
                            <p className="text-3xl font-bold">{user.task_count || 0}</p>
                            <p className="text-sm text-muted-foreground">Total tasks assigned</p>
                        </div>
                        <div>
                            <Label>Date Joined</Label>
                            <p className="text-lg font-medium">
                                {new Date(user.date_joined).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>User avatar and display picture</CardDescription>
                </CardHeader>
                <CardContent>
                    <Avatar className="h-32 w-32">
                        <AvatarImage src={user.profile_picture || undefined} alt={user.username} />
                        <AvatarFallback className="text-4xl">
                            {user.first_name && user.last_name
                                ? `${user.first_name[0]}${user.last_name[0]}`
                                : user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <p className="text-sm text-muted-foreground mt-2">
                        {user.profile_picture ? 'Custom profile picture' : 'Default avatar with initials'}
                    </p>
                </CardContent>
            </Card>

            <DeleteUserDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleConfirmDelete}
                userName={user.username}
            />
        </div>
    );
}

function Label({ children }: { children: React.ReactNode }) {
    return <p className="text-sm font-medium text-muted-foreground mb-1">{children}</p>;
}
