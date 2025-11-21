import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { commentService, type Comment } from '@/api/collaboration.service';
import { taskService } from '@/api/task.service';
import { projectService } from '@/api/project.service';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { Loader2, Send, Edit2, Trash2, Reply, MoreVertical } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CommentsProps {
    taskId: number;
}

export function Comments({ taskId }: CommentsProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState('');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState('');
    const [projectMembers, setProjectMembers] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionSearch, setMentionSearch] = useState('');
    const [cursorPosition, setCursorPosition] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        loadComments();
        loadProjectMembers();
    }, [taskId]);

    const loadComments = async () => {
        try {
            const response: any = await commentService.getTaskComments(taskId);
            // Handle paginated response - API returns { results: [], count: n }
            const data = Array.isArray(response) ? response : (response.results || []);
            setComments(data);
        } catch (error) {
            console.error('Error loading comments:', error);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const loadProjectMembers = async () => {
        try {
            const task = await taskService.getTask(taskId);
            const project = await projectService.getProject(task.project);

            // Combine project creator and members for mentions
            const allUsers: any[] = [...(project.members_details || [])];

            // Add creator if not already in members list
            if (project.created_by_details) {
                const creatorExists = allUsers.some(member => member.id === project.created_by_details!.id);
                if (!creatorExists) {
                    allUsers.push(project.created_by_details);
                }
            }

            setProjectMembers(allUsers);
        } catch (error) {
            console.error('Error loading project members:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await commentService.createComment({
                task: taskId,
                content: newComment,
            });
            setNewComment('');
            toast.success('Comment added');
            loadComments();
        } catch (error) {
            console.error('Error adding comment:', error);
            toast.error('Failed to add comment');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (commentId: number) => {
        if (!editContent.trim()) return;

        try {
            await commentService.updateComment(commentId, { content: editContent });
            setEditingId(null);
            setEditContent('');
            toast.success('Comment updated');
            loadComments();
        } catch (error) {
            console.error('Error updating comment:', error);
            toast.error('Failed to update comment');
        }
    };

    const handleDelete = async (commentId: number) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            await commentService.deleteComment(commentId);
            toast.success('Comment deleted');
            loadComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Failed to delete comment');
        }
    };

    const handleReply = async (parentId: number) => {
        if (!replyContent.trim()) return;

        try {
            await commentService.createComment({
                task: taskId,
                content: replyContent,
                parent: parentId,
            });
            setReplyingTo(null);
            setReplyContent('');
            toast.success('Reply added');
            loadComments();
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Failed to add reply');
        }
    };

    const handleCommentChange = (value: string) => {
        setNewComment(value);

        // Check for @ mention
        const cursorPos = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = value.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
            // Check if there's a space after @, if so, don't show suggestions
            if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
                setMentionSearch(textAfterAt.toLowerCase());
                setShowSuggestions(true);
                setCursorPosition(cursorPos);
                return;
            }
        }

        setShowSuggestions(false);
    };

    const insertMention = (username: string) => {
        const cursorPos = textareaRef.current?.selectionStart || 0;
        const textBeforeCursor = newComment.substring(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf('@');
        const textAfterCursor = newComment.substring(cursorPos);

        const newText = newComment.substring(0, lastAtIndex) + `@${username} ` + textAfterCursor;
        setNewComment(newText);
        setShowSuggestions(false);

        // Focus back on textarea
        setTimeout(() => {
            textareaRef.current?.focus();
            const newCursorPos = lastAtIndex + username.length + 2;
            textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const filteredMembers = projectMembers.filter(member =>
        member.username.toLowerCase().includes(mentionSearch) ||
        member.first_name.toLowerCase().includes(mentionSearch) ||
        member.last_name.toLowerCase().includes(mentionSearch)
    );

    const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
        const initials = `${comment.user_details.first_name[0]}${comment.user_details.last_name[0]}`;
        const isOwner = user?.id === comment.user;

        return (
            <div className={`${isReply ? 'ml-12 mt-2' : 'mt-4'}`}>
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <div className="bg-muted rounded-lg p-3">
                            <div className="flex items-start justify-between mb-1">
                                <div>
                                    <span className="font-semibold text-sm">
                                        {comment.user_details.first_name} {comment.user_details.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                        {new Date(comment.created_at).toLocaleString()}
                                    </span>
                                    {comment.is_edited && (
                                        <span className="text-xs text-muted-foreground ml-1">(edited)</span>
                                    )}
                                </div>
                                {isOwner && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setEditContent(comment.content);
                                                }}
                                            >
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-destructive"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                            {editingId === comment.id ? (
                                <div className="mt-2">
                                    <Textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        rows={2}
                                    />
                                    <div className="flex gap-2 mt-2">
                                        <Button size="sm" onClick={() => handleEdit(comment.id)}>
                                            Save
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditContent('');
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                            )}
                        </div>
                        {!isReply && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-1 h-7 text-xs"
                                onClick={() => setReplyingTo(comment.id)}
                            >
                                <Reply className="mr-1 h-3 w-3" />
                                Reply {comment.replies_count > 0 && `(${comment.replies_count})`}
                            </Button>
                        )}
                        {replyingTo === comment.id && (
                            <div className="mt-2 ml-3">
                                <Textarea
                                    placeholder="Write a reply..."
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                    rows={2}
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" onClick={() => handleReply(comment.id)}>
                                        Reply
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setReplyingTo(null);
                                            setReplyContent('');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-2">
                                {comment.replies.map((reply) => (
                                    <CommentItem key={reply.id} comment={reply} isReply />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Comments</CardTitle>
                <CardDescription>Discuss this task with your team</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            placeholder="Write a comment... (Use @username to mention someone)"
                            value={newComment}
                            onChange={(e) => handleCommentChange(e.target.value)}
                            rows={3}
                            className="mb-2"
                        />
                        {showSuggestions && filteredMembers.length > 0 && (
                            <div className="absolute z-10 w-full max-w-xs bg-background border rounded-md shadow-lg">
                                <div className="py-1 max-h-48 overflow-y-auto">
                                    {filteredMembers.slice(0, 5).map((member) => (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => insertMention(member.username)}
                                            className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2 transition-colors"
                                        >
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">
                                                    {member.first_name[0]}{member.last_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">@{member.username}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <Button type="submit" disabled={submitting || !newComment.trim()}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Send className="mr-2 h-4 w-4" />
                        Comment
                    </Button>
                </form>

                <div className="space-y-1">
                    {comments.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                            No comments yet. Be the first to comment!
                        </p>
                    ) : (
                        comments.map((comment) => <CommentItem key={comment.id} comment={comment} />)
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
