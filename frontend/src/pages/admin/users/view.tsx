import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { userService, type User } from '@/api/user.service';
import { DeleteUserDialog } from './components/DeleteUserDialog';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/utils';

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

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/admin/users')}
                        className="hover:bg-violet-100"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">User Details</h1>
                        <p className="text-muted-foreground">View user information and statistics</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        className="bg-violet-800 hover:bg-violet-900 text-white"
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit User
                    </Button>
                    <Button
                        onClick={() => setShowDeleteDialog(true)}
                        className="bg-red-800 hover:bg-red-900 text-white"
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                    </Button>
                </div>
            </div>

            {/* Profile Overview Card */}
            <Card className="border-l-4 border-l-violet-800">
                <CardContent>
                    <div className="flex items-start gap-6">
                        <Avatar className="h-24 w-24 border-4 border-violet-100">
                            <AvatarImage src={getMediaUrl(user.profile_picture)} alt={user.username} />
                            <AvatarFallback className="text-2xl bg-violet-100 text-violet-800">
                                {user.first_name && user.last_name
                                    ? `${user.first_name[0]}${user.last_name[0]}`
                                    : user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-2xl font-bold">
                                    {user.first_name && user.last_name
                                        ? `${user.first_name} ${user.last_name}`
                                        : user.full_name || user.username}
                                </h2>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="bg-violet-800 hover:bg-violet-900 text-white">
                                    {user.role.toUpperCase()}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground mb-1">@{user.username}</p>
                            <p className="text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-t-4 border-t-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Projects</p>
                                <p className="text-4xl font-bold text-violet-800">{user.project_count || 0}</p>
                            </div>
                            <div className="h-14 w-14 rounded-lg bg-violet-100 flex items-center justify-center">
                                <svg className="h-7 w-7 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Tasks</p>
                                <p className="text-4xl font-bold text-violet-800">{user.task_count || 0}</p>
                            </div>
                            <div className="h-14 w-14 rounded-lg bg-violet-100 flex items-center justify-center">
                                <svg className="h-7 w-7 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-t-4 border-t-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Member Since</p>
                                <p className="text-xl font-bold text-violet-800">
                                    {new Date(user.date_joined).toLocaleDateString('en-US', {
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div className="h-14 w-14 rounded-lg bg-violet-100 flex items-center justify-center">
                                <svg className="h-7 w-7 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Information */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className='pt-0'>
                    <CardHeader className="bg-linear-to-r from-violet-50 to-transparent border-b pt-8">
                        <CardTitle className="text-violet-800">Contact Information</CardTitle>
                        <CardDescription>How to reach this user</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <Label>Email Address</Label>
                                <p className="text-lg font-medium">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <Label>Phone Number</Label>
                                <p className="text-lg font-medium">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className='pt-0'>
                    <CardHeader className="bg-linear-to-r from-violet-50 to-transparent border-b pt-8">
                        <CardTitle className="text-violet-800">Account Details</CardTitle>
                        <CardDescription>User account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <Label>Username</Label>
                                <p className="text-lg font-medium">@{user.username}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                                <svg className="h-5 w-5 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <Label>Joined</Label>
                                <p className="text-lg font-medium">
                                    {new Date(user.date_joined).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

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
