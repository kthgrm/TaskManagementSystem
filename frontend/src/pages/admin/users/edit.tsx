import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { userService, type User, type UpdateUserData } from '@/api/user.service';
import toast from 'react-hot-toast';

export default function EditUserPage() {
    const navigate = useNavigate();
    const { userId } = useParams<{ userId: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [isActive, setIsActive] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
    } = useForm<UpdateUserData>();

    const password = watch('password');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfilePicture(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        loadUser();
    }, [userId]);

    const loadUser = async () => {
        if (!userId) return;

        try {
            setPageLoading(true);
            const users = await userService.getAllUsers();
            const foundUser = users.find(u => u.id === parseInt(userId));

            if (foundUser) {
                setUser(foundUser);
                setRole(foundUser.role);
                setIsActive(foundUser.is_active);
                setPreviewUrl(foundUser.profile_picture || '');
                reset({
                    username: foundUser.username,
                    email: foundUser.email,
                    first_name: foundUser.first_name || '',
                    last_name: foundUser.last_name || '',
                    phone: foundUser.phone || '',
                    role: foundUser.role,
                });
            } else {
                toast.error('User not found');
                navigate('/admin/users');
            }
        } catch (error: any) {
            console.error('Error loading user:', error);
            toast.error(error.response?.data?.detail || 'Failed to load user');
            navigate('/admin/users');
        } finally {
            setPageLoading(false);
        }
    };

    const onSubmit = async (data: UpdateUserData) => {
        if (!userId || !user) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', data.username || '');
            formData.append('email', data.email || '');
            formData.append('role', role);
            formData.append('is_active', isActive ? '1' : '0');
            if (data.first_name) formData.append('first_name', data.first_name);
            if (data.last_name) formData.append('last_name', data.last_name);
            if (data.phone) formData.append('phone', data.phone);
            if (data.password) {
                formData.append('password', data.password);
                if (data.password2) formData.append('password2', data.password2);
            }
            if (profilePicture) formData.append('profile_picture', profilePicture);

            await userService.updateUser(user.id, formData as any);
            toast.success('User updated successfully');
            navigate('/admin/users');
        } catch (error: any) {
            console.error('Error updating user:', error);
            const errorData = error.response?.data;
            if (errorData) {
                // Handle validation errors
                Object.entries(errorData).forEach(([field, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(`${field}: ${message}`);
                });
            } else {
                toast.error('Failed to update user');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (pageLoading) {
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
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/admin/users')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">Update user information and permissions</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Modify the user details below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    {...register('username', { required: 'Username is required' })}
                                    placeholder="johndoe"
                                    disabled={isLoading}
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address',
                                        },
                                    })}
                                    placeholder="john@example.com"
                                    disabled={isLoading}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                    id="first_name"
                                    {...register('first_name')}
                                    placeholder="John"
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                    id="last_name"
                                    {...register('last_name')}
                                    placeholder="Doe"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                {...register('phone')}
                                placeholder="+1234567890"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile_picture">Profile Picture</Label>
                            <div className="flex items-center gap-4 mt-2">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage
                                        src={previewUrl || user.profile_picture || undefined}
                                        alt={user.username}
                                    />
                                    <AvatarFallback className="text-2xl">
                                        {user.first_name && user.last_name
                                            ? `${user.first_name[0]}${user.last_name[0]}`
                                            : user.username.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <Input
                                        id="profile_picture"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={isLoading}
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {previewUrl && previewUrl !== user.profile_picture
                                            ? 'New picture selected'
                                            : user.profile_picture
                                                ? 'Current picture'
                                                : 'No picture uploaded'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="role">Role *</Label>
                                <Select value={role} onValueChange={(value) => setRole(value as 'admin' | 'user')}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="user">User</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={isActive ? 'active' : 'inactive'}
                                    onValueChange={(value) => setIsActive(value === 'active')}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password (leave blank to keep current)</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                    })}
                                    placeholder="Enter new password"
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password2">Confirm Password</Label>
                                <Input
                                    id="password2"
                                    type="password"
                                    {...register('password2', {
                                        validate: (value) =>
                                            !password || value === password || 'Passwords do not match',
                                    })}
                                    placeholder="Confirm new password"
                                    disabled={isLoading}
                                />
                                {errors.password2 && (
                                    <p className="text-sm text-destructive">{errors.password2.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-end pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/admin/users')}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update User'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
