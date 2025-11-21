import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { notificationService, type Notification } from '@/api/collaboration.service';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const [notifsResponse, count] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount(),
            ]);
            // Handle paginated response - API returns { results: [], count: n }
            const notifs = Array.isArray(notifsResponse) ? notifsResponse : (notifsResponse.results || []);
            setNotifications(notifs.slice(0, 10)); // Show latest 10
            setUnreadCount(count);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await notificationService.markAsRead(id);
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        setLoading(true);
        try {
            await notificationService.markAllAsRead();
            toast.success('All notifications marked as read');
            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Failed to mark all as read');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            loadNotifications();
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Failed to delete notification');
        }
    };

    const handleNotificationClick = async (notification: Notification) => {
        // Mark as read
        if (!notification.is_read) {
            await handleMarkAsRead(notification.id);
        }

        // Navigate to task if applicable
        if (notification.task) {
            try {
                const { taskService } = await import('@/api/task.service');
                const task = await taskService.getTask(notification.task);

                // Navigate to user's project detail page with the task
                navigate(`/user/projects/${task.project}`);

                // Small delay to ensure page loads before showing message
                setTimeout(() => {
                    toast.success(`Navigated to: ${task.title}`);
                }, 300);
            } catch (error) {
                console.error('Error navigating to task:', error);
                toast.error('Failed to navigate to task');
            }
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'comment':
                return '💬';
            case 'mention':
                return '@';
            case 'task_assigned':
                return '📋';
            case 'task_updated':
                return '🔄';
            case 'project_added':
                return '➕';
            default:
                return '🔔';
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={handleMarkAllAsRead}
                            disabled={loading}
                        >
                            <CheckCheck className="h-3 w-3 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`cursor-pointer p-3 ${!notification.is_read ? 'bg-muted/50' : ''
                                    }`}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex gap-3 w-full">
                                    <div className="text-lg">{getNotificationIcon(notification.notification_type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">{notification.message}</p>
                                        {notification.task_title && (
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.task_title}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(notification.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {!notification.is_read && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMarkAsRead(notification.id);
                                                }}
                                            >
                                                <Check className="h-3 w-3" />
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-destructive"
                                            onClick={(e) => handleDelete(notification.id, e)}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
