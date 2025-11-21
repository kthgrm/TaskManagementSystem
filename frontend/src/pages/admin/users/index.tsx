import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground">Manage system users and their roles</p>
                </div>
                <Button onClick={() => navigate('/admin/users/create')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add User
                </Button>
            </div>

            <DataTable columns={columns} data={users} />

            <DeleteUserDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                onConfirm={handleConfirmDelete}
                userName={selectedUser?.username || ''}
            />
        </div>
    );
}