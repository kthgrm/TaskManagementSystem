import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back, {user?.first_name || user?.username}!
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <span className="text-xs font-medium text-primary">Admin</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Coming soon
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Coming soon
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Coming soon
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Admin Overview</CardTitle>
                    <CardDescription>
                        Manage your task management system from here
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        You have admin access to all features and settings.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};
