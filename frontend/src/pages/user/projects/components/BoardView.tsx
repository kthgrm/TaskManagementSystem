import type { Task } from '@/api/task.service';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { EditTaskDialog } from './EditTaskDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { taskService } from '@/api/task.service';
import toast from 'react-hot-toast';
import {
    DndContext,
    type DragEndEvent,
    DragOverlay,
    type DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { GripVertical, Check, X, MessageCircleMore, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { getMediaUrl } from '@/lib/utils';

interface BoardViewProps {
    tasks: Task[];
    onTaskUpdate: () => void;
    projectMembers?: any[];
}

export function BoardView({ tasks, onTaskUpdate, projectMembers = [] }: BoardViewProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [dialogTab, setDialogTab] = useState<'details' | 'comments' | 'activity'>('details');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [editingCard, setEditingCard] = useState<{ taskId: number; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const todoTasks = tasks.filter(t => t.status === 'todo');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const completedTasks = tasks.filter(t => t.status === 'completed');

    const getPriorityBadgeColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'bg-red-500';
            case 'medium':
                return 'bg-orange-500';
            case 'low':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    const handleDragStart = (event: DragStartEvent) => {
        const task = tasks.find(t => t.id.toString() === event.active.id);
        setActiveTask(task || null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const taskId = parseInt(active.id as string);
        const newStatus = over.id as 'todo' | 'in_progress' | 'completed';
        const task = tasks.find(t => t.id === taskId);

        if (!task || task.status === newStatus) return;

        try {
            await taskService.updateTask(taskId, {
                title: task.title,
                description: task.description,
                project: task.project,
                assigned_to: task.assigned_to,
                priority: task.priority,
                status: newStatus,
                due_date: task.due_date || undefined,
            });
            toast.success('Task status updated');
            onTaskUpdate();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task status');
        }
    };

    const handleCardDoubleClick = (task: Task, field: string, value: string) => {
        setEditingCard({ taskId: task.id, field });
        setEditValue(value);
    };

    const handleSaveEdit = async (task: Task) => {
        if (!editingCard) return;

        const { field } = editingCard;

        if (field === 'title' && !editValue.trim()) {
            toast.error('Title cannot be empty');
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
            onTaskUpdate();
            setEditingCard(null);
            setEditValue('');
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task');
        }
    };

    const handleCancelEdit = () => {
        setEditingCard(null);
        setEditValue('');
    };

    const handleSelectChange = async (task: Task, field: string, value: string) => {
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

    const handleDeleteTask = async (task: Task) => {
        if (!window.confirm(`Delete task "${task.title}"?`)) return;

        try {
            await taskService.deleteTask(task.id);
            toast.success('Task deleted');
            onTaskUpdate();
        } catch (error) {
            console.error('Error deleting task:', error);
            toast.error('Failed to delete task');
        }
    };

    const TaskCard = ({ task }: { task: Task }) => {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
            isDragging,
        } = useSortable({ id: task.id.toString() });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
            opacity: isDragging ? 0.5 : 1,
        };

        const isEditingTitle = editingCard?.taskId === task.id && editingCard?.field === 'title';
        const isEditingDescription = editingCard?.taskId === task.id && editingCard?.field === 'description';
        const isEditingDueDate = editingCard?.taskId === task.id && editingCard?.field === 'due_date';

        return (
            <div
                ref={setNodeRef}
                style={style}
                className="bg-white border rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow group"
            >
                <div className="flex items-start gap-2">
                    <button
                        className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className='flex flex-row justify-between'>
                            <div>
                                {/* Title */}
                                {isEditingTitle ? (
                                    <div className="flex items-center gap-1 mb-1">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-7 text-sm"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(task);
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                        />
                                        <button onClick={() => handleSaveEdit(task)} className="text-green-600 hover:text-green-700">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="font-medium text-sm mb-1 cursor-text hover:bg-gray-50 px-1 -mx-1 rounded"
                                        onDoubleClick={() => handleCardDoubleClick(task, 'title', task.title)}
                                    >
                                        {task.title}
                                    </div>
                                )}

                                {/* Description */}
                                {isEditingDescription ? (
                                    <div className="flex items-center gap-1 mb-2">
                                        <Input
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="h-7 text-xs"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveEdit(task);
                                                if (e.key === 'Escape') handleCancelEdit();
                                            }}
                                        />
                                        <button onClick={() => handleSaveEdit(task)} className="text-green-600 hover:text-green-700">
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    task.description && (
                                        <div
                                            className="text-xs text-muted-foreground line-clamp-2 mb-2 cursor-text hover:bg-gray-50 px-1 -mx-1 rounded"
                                            onDoubleClick={() => handleCardDoubleClick(task, 'description', task.description || '')}
                                        >
                                            {task.description}
                                        </div>
                                    )
                                )}
                            </div>
                            {/* Priority */}
                            <Select
                                value={task.priority}
                                onValueChange={(value) => handleSelectChange(task, 'priority', value)}
                            >
                                <SelectTrigger className="h-auto border-0 p-0 hover:bg-gray-100 rounded-full px-2 shadow-none">
                                    <div className="flex items-center gap-1 text-xs">
                                        <div className={`w-2 h-2 rounded-full ${getPriorityBadgeColor(task.priority)}`} />
                                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between">
                            {/* Assignee */}
                            <Select
                                value={task.assigned_to?.toString() || 'unassigned'}
                                onValueChange={(value) => handleSelectChange(task, 'assigned_to', value)}
                            >
                                <SelectTrigger className="h-6 border-0 hover:bg-gray-100 rounded-full shadow-none p-0">
                                    {task.assigned_to_details ? (
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={getMediaUrl(task.assigned_to_details.profile_picture)} alt={`${task.assigned_to_details.first_name} ${task.assigned_to_details.last_name}`} />
                                            <AvatarFallback className="text-xs bg-primary/10">
                                                {task.assigned_to_details.first_name[0]}
                                                {task.assigned_to_details.last_name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <Avatar className="h-6 w-6">
                                            <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
                                        </Avatar>
                                    )}
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

                            {/* Due Date */}
                            {isEditingDueDate ? (
                                <div className="flex items-center gap-1">
                                    <Input
                                        type="date"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="h-6 text-xs w-32"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSaveEdit(task);
                                            if (e.key === 'Escape') handleCancelEdit();
                                        }}
                                    />
                                    <button onClick={() => handleSaveEdit(task)} className="text-green-600 hover:text-green-700">
                                        <Check className="h-3 w-3" />
                                    </button>
                                    <button onClick={handleCancelEdit} className="text-red-600 hover:text-red-700">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <span
                                    className="text-xs text-muted-foreground cursor-text hover:bg-gray-50 -mx-1 rounded px-4"
                                    onDoubleClick={() => handleCardDoubleClick(task, 'due_date', task.due_date || '')}
                                >
                                    {task.due_date
                                        ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                        : '-'
                                    }
                                </span>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 justify-end px-2">
                            <button
                                onClick={() => {
                                    setDialogTab('comments');
                                    setSelectedTask(task);
                                }}
                                className="p-1 text-muted-foreground hover:text-primary hover:bg-gray-100 rounded transition-colors"
                                title="View comments"
                            >
                                <MessageCircleMore className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => handleDeleteTask(task)}
                                className="p-1 text-muted-foreground hover:text-destructive hover:bg-red-50 rounded transition-colors"
                                title="Delete task"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const Column = ({ title, tasks, color, status }: { title: string; tasks: Task[]; color: string; status: 'todo' | 'in_progress' | 'completed' }) => {
        const { setNodeRef, isOver } = useDroppable({ id: status });

        return (
            <div ref={setNodeRef} className="flex-1 min-w-[320px] h-full">
                <div className={`rounded-t-lg px-4 py-3 ${color}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm">{title}</h3>
                        </div>
                        <Badge variant="secondary" className="rounded-full">
                            {tasks.length}
                        </Badge>
                    </div>
                </div>
                <div className={`border border-t-0 rounded-b-lg bg-background/50 min-h-[200px] h-[calc(100%-52px)] p-2 overflow-y-auto transition-colors ${isOver ? 'bg-blue-50 border-blue-300' : ''}`}>
                    {tasks.length === 0 ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">
                            Drop tasks here
                        </div>
                    ) : (
                        tasks.map(task => <TaskCard key={task.id} task={task} />)
                    )}
                </div>
            </div>
        );
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* Kanban Columns */}
                <div className="flex gap-4 overflow-x-auto h-full pb-4">
                    <Column
                        title="To Do"
                        tasks={todoTasks}
                        color="bg-gray-300"
                        status="todo"
                    />
                    <Column
                        title="In Progress"
                        tasks={inProgressTasks}
                        color="bg-yellow-400"
                        status="in_progress"
                    />
                    <Column
                        title="Completed"
                        tasks={completedTasks}
                        color="bg-green-400"
                        status="completed"
                    />
                </div>

                <DragOverlay>
                    {activeTask && (
                        <div className="bg-white border rounded-lg p-3 shadow-lg rotate-3">
                            <div className="font-medium text-sm">{activeTask.title}</div>
                        </div>
                    )}
                </DragOverlay>
            </DndContext>

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
