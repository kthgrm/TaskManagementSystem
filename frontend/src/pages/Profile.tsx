import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/api/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Camera, Save, Lock, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMediaUrl } from '@/lib/utils';

export default function Profile() {
    const navigate = useNavigate();
    const { user, logout, updateUser, isAuthenticated } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [profileData, setProfileData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
    });

    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        new_password_confirm: '',
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (user) {
            setProfileData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                phone: user.phone || '',
            });

            if (user.profile_picture) {
                setPreviewImage(getMediaUrl(user.profile_picture));
            }
        }
    }, [user, isAuthenticated, navigate]);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileData({
            ...profileData,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const updateData: any = { ...profileData };
            if (selectedFile) {
                updateData.profile_picture = selectedFile;
            }

            const response = await authService.updateProfile(updateData);
            updateUser(response.user);
            toast.success(response.message || 'Profile updated successfully');
            setSelectedFile(null);
        } catch (error: any) {
            const errors = error.response?.data;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(`${field}: ${message}`);
                });
            } else {
                toast.error('Failed to update profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await authService.changePassword(passwordData);
            // Update token after password change
            localStorage.setItem('token', response.token);
            toast.success(response.message || 'Password changed successfully');
            setPasswordData({
                old_password: '',
                new_password: '',
                new_password_confirm: '',
            });
            setShowPasswordChange(false);
        } catch (error: any) {
            const errors = error.response?.data;
            if (errors) {
                Object.entries(errors).forEach(([field, messages]: [string, any]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    toast.error(`${field}: ${message}`);
                });
            } else {
                toast.error('Failed to change password');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await authService.deleteAccount();
                toast.success('Account deleted successfully');
                await logout();
                navigate('/login');
            } catch (error) {
                toast.error('Failed to delete account');
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Profile Settings</h1>
                        <p className="text-muted-foreground">Manage your account settings and preferences</p>
                    </div>
                </div>

                {/* Profile Picture */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                        <CardDescription>Update your profile picture</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="h-16 w-16 text-gray-400" />
                                )}
                            </div>
                            <Button
                                size="sm"
                                className="absolute bottom-0 right-0 rounded-full"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="first_name"
                                            name="first_name"
                                            value={profileData.first_name}
                                            onChange={handleProfileChange}
                                            className="pl-10"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="last_name"
                                            name="last_name"
                                            value={profileData.last_name}
                                            onChange={handleProfileChange}
                                            className="pl-10"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={profileData.email}
                                        onChange={handleProfileChange}
                                        className="pl-10"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={profileData.phone}
                                        onChange={handleProfileChange}
                                        className="pl-10"
                                        placeholder="+1234567890"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={isLoading} className="w-full bg-violet-800 hover:bg-violet-700">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Change */}
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Update your password to keep your account secure</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!showPasswordChange ? (
                            <Button onClick={() => setShowPasswordChange(true)} variant="outline">
                                <Lock className="mr-2 h-4 w-4" />
                                Change Password
                            </Button>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="old_password">Current Password</Label>
                                    <Input
                                        id="old_password"
                                        name="old_password"
                                        type="password"
                                        value={passwordData.old_password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password">New Password</Label>
                                    <Input
                                        id="new_password"
                                        name="new_password"
                                        type="password"
                                        value={passwordData.new_password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new_password_confirm">Confirm New Password</Label>
                                    <Input
                                        id="new_password_confirm"
                                        name="new_password_confirm"
                                        type="password"
                                        value={passwordData.new_password_confirm}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Password'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setShowPasswordChange(false);
                                            setPasswordData({
                                                old_password: '',
                                                new_password: '',
                                                new_password_confirm: '',
                                            });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Danger Zone</CardTitle>
                        <CardDescription>Irreversible actions for your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Account
                        </Button>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                    <p>Member since {new Date(user.date_joined).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}
