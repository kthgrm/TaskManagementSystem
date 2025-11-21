import type { Task } from '@/api/task.service';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { EditTaskDialog } from './EditTaskDialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronDown, MessageCircle, MessageCircleMore } from 'lucide-react';
import { taskService } from '@/api/task.service';
import toast from 'react-hot-toast';

interface ListViewProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    groupBy: 'none' | 'status' | 'priority' | 'assignee';
    projectMembers?: any[];
}

export function ListView({ tasks, onTaskUpdate, groupBy, projectMembers = [] }: ListViewProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [dialogTab, setDialogTab] = useState<'details' | 'comments' | 'activity'>('details');
    const [editingCell, setEditingCell] = useState<{ taskId: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [originalValue, setOriginalValue] = useState<string>('');
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Group tasks based on groupBy prop
    const groupedTasks = useMemo(() => {
        if (groupBy === 'none') {
            return { 'All Tasks': tasks };
        }

        if (groupBy === 'status') {
            return {
                'To Do': tasks.filter(t => t.status === 'todo'),
                'In Progress': tasks.filter(t => t.status === 'in_progress'),
                'Completed': tasks.filter(t => t.status === 'completed'),
            };
        }

        if (groupBy === 'priority') {
            return {
                'High Priority': tasks.filter(t => t.priority === 'high'),
                'Medium Priority': tasks.filter(t => t.priority === 'medium'),
                'Low Priority': tasks.filter(t => t.priority === 'low'),
            };
        }

        if (groupBy === 'assignee') {
            const groups: Record<string, Task[]> = {
                'Unassigned': tasks.filter(t => !t.assigned_to),
            };
            tasks.forEach(task => {
                if (task.assigned_to_details) {
                    const name = `${task.assigned_to_details.first_name} ${task.assigned_to_details.last_name}`;
                    if (!groups[name]) {
                        groups[name] = [];
                    }
                    groups[name].push(task);
                }
            });
            return groups;
        }

        return { 'All Tasks': tasks };
    }, [tasks, groupBy]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'todo':
                return 'bg-gray-100 text-gray-700';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'completed':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'bg-blue-100 text-blue-700';
            case 'medium':
                return 'bg-yellow-100 text-yellow-700';
            case 'high':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'todo':
                return 'To Do';
            case 'in_progress':
                return 'In Progress';
            case 'completed':
                return 'Completed';
            default:
                return status;
        }
    };

    const getPriorityLabel = (priority: string) => {
        switch (priority) {
            case 'low':
                return 'Low';
            case 'medium':
                return 'Medium';
            case 'high':
                return 'High';
            default:
                return priority;
        }
    };

    const handleCellDoubleClick = (task: Task, field: string, currentValue: string) => {
        setEditingCell({ taskId: task.id, field });
        setEditValue(currentValue);
        setOriginalValue(currentValue);
    };

    const handleCellUpdate = async (task: Task, field: string) => {
        // Check if value actually changed
        if (editValue === originalValue) {
            setEditingCell(null);
            return;
        }

        if (!editValue.trim() && field === 'title') {
            toast.error('Title cannot be empty');
            setEditingCell(null);
            return;
        }

        try {
            const updates: any = {
                title: task.title,
                description: task.description,
                project: task.project,
                assigned_to: task.assigned_to,
                priority: task.priority,
                status: task.status,
                due_date: task.due_date || undefined,
            };

            updates[field] = editValue;

            await taskService.updateTask(task.id, updates);
            toast.success('Task updated');
            setEditingCell(null);
            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleSelectChange = async (task: Task, field: string, value: string) => {
        // Check if value actually changed
        let currentValue: any;
        if (field === 'assigned_to') {
            currentValue = task.assigned_to?.toString() || 'unassigned';
        } else {
            currentValue = task[field as keyof Task];
        }

        if (value === currentValue) {
            return; // No change, don't update
        }

        try {
            const updates: any = {
                title: task.title,
                description: task.description,
                project: task.project,
                assigned_to: task.assigned_to,
                priority: task.priority,
                status: task.status,
                due_date: task.due_date || undefined,
            };

            if (field === 'assigned_to') {
                updates[field] = value === 'unassigned' ? null : parseInt(value);
            } else {
                updates[field] = value;
            }

            await taskService.updateTask(task.id, updates);
            toast.success('Task updated');
            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const TaskRow = ({ task }: { task: Task }) => {
        const isEditingTitle = editingCell?.taskId === task.id && editingCell?.field === 'title';
        const isEditingDescription = editingCell?.taskId === task.id && editingCell?.field === 'description';
        const isEditingDueDate = editingCell?.taskId === task.id && editingCell?.field === 'due_date';

        return (
            <tr className="border-b hover:bg-muted/30 transition-colors group">
                <td className="py-3 px-4 w-8">
                    <input type="checkbox" className="rounded" onClick={(e) => e.stopPropagation()} />
                </td>
                <td
                    className="py-3 px-4 max-w-xs cursor-pointer"
                    onDoubleClick={() => handleCellDoubleClick(task, 'title', task.title)}
                >
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellUpdate(task, 'title')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellUpdate(task, 'title');
                                    if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="h-8"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-sm truncate">{task.title}</span>
                        </div>
                    )}
                </td>
                <td className="py-3 px-4">
                    <Select
                        value={task.assigned_to?.toString() || 'unassigned'}
                        onValueChange={(value) => handleSelectChange(task, 'assigned_to', value)}
                    >
                        <SelectTrigger className="h-8 w-auto border-0 bg-transparent p-0 shadow-none">
                            <div className="flex items-center gap-2 cursor-pointer">
                                {task.assigned_to_details ? (
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-xs bg-primary/10">
                                            {task.assigned_to_details.first_name[0]}
                                            {task.assigned_to_details.last_name[0]}
                                        </AvatarFallback>
                                    </Avatar>
                                ) : (
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {projectMembers.map((member) => (
                                <SelectItem key={member.id} value={member.id.toString()}>
                                    {member.first_name} {member.last_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </td>
                <td className="py-3 px-4">
                    <Select
                        value={task.priority}
                        onValueChange={(value) => handleSelectChange(task, 'priority', value)}
                    >
                        <SelectTrigger className="h-8 w-auto border-0 bg-transparent p-0 shadow-none">
                            <Badge className={`${getPriorityColor(task.priority)} border-0 font-normal cursor-pointer`}>
                                {getPriorityLabel(task.priority)}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>
                </td>
                <td
                    className="py-3 px-4 cursor-pointer"
                    onDoubleClick={() => handleCellDoubleClick(task, 'due_date', task.due_date || '')}
                >
                    {isEditingDueDate ? (
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellUpdate(task, 'due_date')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellUpdate(task, 'due_date');
                                    if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="h-8 w-auto"
                            />
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">
                            {task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                        </span>
                    )}
                </td>
                <td className="py-3 px-4">
                    <Select
                        value={task.status}
                        onValueChange={(value) => handleSelectChange(task, 'status', value)}
                    >
                        <SelectTrigger className="h-8 w-auto border-0 bg-transparent p-0 shadow-none">
                            <Badge className={`${getStatusColor(task.status)} border-0 font-normal cursor-pointer`}>
                                {getStatusLabel(task.status)}
                            </Badge>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </td>
                <td
                    className="py-3 px-4 cursor-pointer"
                    onDoubleClick={() => handleCellDoubleClick(task, 'description', task.description || '')}
                >
                    {isEditingDescription ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={() => handleCellUpdate(task, 'description')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCellUpdate(task, 'description');
                                    if (e.key === 'Escape') setEditingCell(null);
                                }}
                                autoFocus
                                className="h-8"
                            />
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground truncate">{task.description || '-'}</span>
                    )}
                </td>
                <td className="py-3 px-4">
                    <button
                        onClick={() => {
                            setDialogTab('comments');
                            setSelectedTask(task);
                        }}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View comments"
                    >
                        <MessageCircleMore className='w-4 h-4' />
                    </button>
                </td>
            </tr>
        );
    };

    const toggleGroup = (label: string) => {
        const newCollapsed = new Set(collapsedGroups);
        if (newCollapsed.has(label)) {
            newCollapsed.delete(label);
        } else {
            newCollapsed.add(label);
        }
        setCollapsedGroups(newCollapsed);
    };

    const StatusGroup = ({ label, tasks, color }: { label: string; tasks: Task[]; color: string }) => {
        if (tasks.length === 0) return null;

        const isCollapsed = collapsedGroups.has(label);

        return (
            <div className="mb-4">
                {/* Group Header */}
                <div
                    className={`bg-muted/30 border-l-4 ${color} px-4 py-2 rounded-sm mb-1 cursor-pointer hover:bg-muted/50 transition-colors`}
                    onClick={() => toggleGroup(label)}
                >
                    <div className="flex items-center gap-2">
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                        <span className="font-semibold text-sm text-purple-600">{label}</span>
                        <span className="text-xs text-muted-foreground">({tasks.length})</span>
                    </div>
                </div>

                {/* Group Table */}
                {!isCollapsed && (
                    <div className="border rounded-lg overflow-hidden bg-background">
                        <table className="w-full border-collapse">
                            <thead className="bg-muted/20 border-b">
                                <tr className='bg-gray-100'>
                                    <th className="py-3 px-4 w-8"></th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Task
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Assignee
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Due Date
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Description
                                    </th>
                                    <th className="py-3 px-4 w-8"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => <TaskRow key={task.id} task={task} />)}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    };

    if (tasks.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                No tasks in this project yet.
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {Object.entries(groupedTasks).map(([label, groupTasks]) => (
                    <StatusGroup
                        key={label}
                        label={label}
                        tasks={groupTasks}
                        color="border-purple-400"
                    />
                ))}
            </div>

            {selectedTask && (
                <EditTaskDialog
                    open={!!selectedTask}
                    onOpenChange={(open: boolean) => {
                        if (!open) {
                            setSelectedTask(null);
                            setDialogTab('details');
                        }
                    }}
                    task={selectedTask}
                    onSuccess={() => {
                        onTaskUpdate();
                        setSelectedTask(null);
                        setDialogTab('details');
                    }}
                    defaultTab={dialogTab}
                />
            )}
        </>
    );
}
