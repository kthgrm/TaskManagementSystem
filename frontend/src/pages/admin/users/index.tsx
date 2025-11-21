import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2 } from 'lucide-react';
import { createColumns } from './components/columns';
import { DeleteUserDialog } from './components/DeleteUserDialog';
import { userService, type User } from '@/api/user.service';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error: any) {
            console.error('Error loading users:', error);
            toast.error(error.response?.data?.detail || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await userService.toggleUserStatus(user.id);
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            loadUsers();
        } catch (error: any) {
            console.error('Error toggling user status:', error);
            toast.error(error.response?.data?.error || 'Failed to toggle user status');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        try {
            await userService.deleteUser(selectedUser.id);
            toast.success('User deleted successfully');
            loadUsers();
            setShowDeleteDialog(false);
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.error || 'Failed to delete user');
        }
    };

    const columns = createColumns({
        onDelete: handleDeleteUser,
        onToggleStatus: handleToggleStatus,
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
                    <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-violet-800 to-violet-600 bg-clip-text text-transparent">Users Management</h1>
                    <p className="text-muted-foreground mt-1">Manage system users, roles, and permissions</p>
                </div>
                <Button
                    onClick={() => navigate('/admin/users/create')}
                    className="bg-violet-800 hover:bg-violet-900 text-white shadow-md hover:shadow-lg transition-all"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New User
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-violet-800 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
                                <p className="text-3xl font-bold text-violet-800">{users.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-violet-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-violet-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-600 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Active Users</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {users.filter(u => u.is_active || u.status === 'active').length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-600 hover:shadow-md transition-shadow">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Administrators</p>
                                <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'admin').length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-violet-800">User Directory</CardTitle>
                    <CardDescription>View and manage all registered users in the system</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={users}
                        searchKey="username"
                        searchPlaceholder="Search by username or email..."
                    />
                </CardContent>
            </Card>

            <DeleteUserDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleConfirmDelete}
                userName={selectedUser?.username || ''}
            />
        </div>
    );
}