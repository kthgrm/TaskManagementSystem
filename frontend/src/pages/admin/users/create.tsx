import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ArrowLeft } from 'lucide-react';
import { userService, type CreateUserData } from '@/api/user.service';
import toast from 'react-hot-toast';

export default function CreateUserPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm<CreateUserData>({
        defaultValues: {
            role: 'user',
        },
    });

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

    const onSubmit = async (data: CreateUserData) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('username', data.username);
            formData.append('email', data.email);
            formData.append('password', data.password);
            formData.append('password2', data.password2);
            formData.append('role', role);
            if (data.first_name) formData.append('first_name', data.first_name);
            if (data.last_name) formData.append('last_name', data.last_name);
            if (data.phone) formData.append('phone', data.phone);
            if (profilePicture) formData.append('profile_picture', profilePicture);

            await userService.createUser(formData as any);
            toast.success('User created successfully');
            navigate('/admin/users');
        } catch (error: any) {
            console.error('Error creating user:', error);
            const errorData = error.response?.data;
            if (errorData) {
                // Handle validation errors
                Object.entries(errorData).forEach(([field, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(`${field}: ${message}`);
                });
            } else {
                toast.error('Failed to create user');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight">Add New User</h1>
                    <p className="text-muted-foreground">Create a new user account with their details</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                    <CardDescription>
                        Fill in the details below to create a new user account
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
                            <Input
                                id="profile_picture"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isLoading}
                            />
                            {previewUrl && (
                                <div className="mt-2">
                                    <img
                                        src={previewUrl}
                                        alt="Profile preview"
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">Password *</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: {
                                            value: 8,
                                            message: 'Password must be at least 8 characters',
                                        },
                                    })}
                                    placeholder="Enter password"
                                    disabled={isLoading}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password2">Confirm Password *</Label>
                                <Input
                                    id="password2"
                                    type="password"
                                    {...register('password2', {
                                        required: 'Please confirm password',
                                        validate: (value) =>
                                            value === password || 'Passwords do not match',
                                    })}
                                    placeholder="Confirm password"
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
                                        Creating...
                                    </>
                                ) : (
                                    'Create User'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
