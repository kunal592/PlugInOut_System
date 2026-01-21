'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Clock, AlertCircle, Trash2, Edit2, Filter, Tag } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    dueDate?: string;
    tags: string[];
    createdAt: string;
}

const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
const statuses = ['TODO', 'IN_PROGRESS', 'DONE'];

export default function TaskManagerPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('MEDIUM');
    const [dueDate, setDueDate] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = () => {
        const demoTasks: Task[] = [
            { id: '1', title: 'Review project proposal', description: 'Go through the Q1 proposal document', status: 'TODO', priority: 'HIGH', dueDate: '2026-01-25', tags: ['work', 'urgent'], createdAt: '2026-01-15' },
            { id: '2', title: 'Update documentation', description: 'Update API docs for v2', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: '2026-01-28', tags: ['docs'], createdAt: '2026-01-16' },
            { id: '3', title: 'Fix login bug', status: 'DONE', priority: 'URGENT', tags: ['bug', 'auth'], createdAt: '2026-01-10' },
            { id: '4', title: 'Design new landing page', description: 'Create mockups for marketing', status: 'TODO', priority: 'MEDIUM', dueDate: '2026-02-01', tags: ['design'], createdAt: '2026-01-18' },
            { id: '5', title: 'Team sync meeting prep', status: 'TODO', priority: 'LOW', dueDate: '2026-01-22', tags: ['meeting'], createdAt: '2026-01-20' },
            { id: '6', title: 'Deploy to production', status: 'IN_PROGRESS', priority: 'HIGH', tags: ['devops'], createdAt: '2026-01-19' },
        ];
        setTasks(demoTasks);
        setLoading(false);
    };

    const handleSubmit = () => {
        const newTask: Task = {
            id: editingTask?.id || Date.now().toString(),
            title,
            description,
            status: editingTask?.status || 'TODO',
            priority: priority as Task['priority'],
            dueDate: dueDate || undefined,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            createdAt: editingTask?.createdAt || new Date().toISOString()
        };

        if (editingTask) {
            setTasks(tasks.map(t => t.id === editingTask.id ? newTask : t));
        } else {
            setTasks([newTask, ...tasks]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setDueDate('');
        setTags('');
    };

    const editTask = (task: Task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueDate(task.dueDate || '');
        setTags(task.tags.join(', '));
        setShowModal(true);
    };

    const updateStatus = (id: string, status: Task['status']) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
    };

    const deleteTask = (id: string) => {
        if (confirm('Delete this task?')) {
            setTasks(tasks.filter(t => t.id !== id));
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filterStatus !== 'all' && t.status !== filterStatus) return false;
        if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
        return true;
    });

    const stats = {
        total: tasks.length,
        todo: tasks.filter(t => t.status === 'TODO').length,
        inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
        done: tasks.filter(t => t.status === 'DONE').length,
        overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE').length
    };

    const getPriorityColor = (p: string) => {
        const colors: Record<string, string> = {
            LOW: 'bg-gray-100 text-gray-700',
            MEDIUM: 'bg-blue-100 text-blue-700',
            HIGH: 'bg-orange-100 text-orange-700',
            URGENT: 'bg-red-100 text-red-700'
        };
        return colors[p] || colors.MEDIUM;
    };

    const getStatusColor = (s: string) => {
        const colors: Record<string, string> = {
            TODO: 'bg-gray-100 text-gray-700',
            IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
            DONE: 'bg-green-100 text-green-700'
        };
        return colors[s] || colors.TODO;
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading tasks...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Task Manager</h1>
                    <p className="text-muted-foreground">Organize and track your tasks</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    Add Task
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2"><CheckSquare className="w-5 h-5 text-blue-500" /><span className="text-muted-foreground">Total</span></div>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.total}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded-full" /><span className="text-muted-foreground">To Do</span></div>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.todo}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded-full" /><span className="text-muted-foreground">In Progress</span></div>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.inProgress}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-full" /><span className="text-muted-foreground">Done</span></div>
                    <p className="text-2xl font-bold text-foreground mt-1">{stats.done}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2"><AlertCircle className="w-5 h-5 text-red-500" /><span className="text-muted-foreground">Overdue</span></div>
                    <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option value="all">All Status</option>
                    {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                    <option value="all">All Priority</option>
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {filteredTasks.map(task => (
                    <div key={task.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={task.status === 'DONE'}
                                        onChange={() => updateStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                                        className="w-5 h-5 rounded"
                                    />
                                    <h3 className={`font-medium ${task.status === 'DONE' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                                        {task.title}
                                    </h3>
                                </div>
                                {task.description && <p className="text-sm text-muted-foreground mt-1 ml-8">{task.description}</p>}
                                <div className="flex flex-wrap gap-2 mt-2 ml-8">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                                    <select
                                        value={task.status}
                                        onChange={e => updateStatus(task.id, e.target.value as Task['status'])}
                                        className={`px-2 py-0.5 rounded text-xs font-medium border-0 ${getStatusColor(task.status)}`}
                                    >
                                        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                    {task.dueDate && (
                                        <span className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'DONE' ? 'bg-red-100 text-red-700' : 'bg-secondary text-muted-foreground'}`}>
                                            <Clock className="w-3 h-3" />
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                    {task.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs flex items-center gap-1">
                                            <Tag className="w-3 h-3" />{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => editTask(task)} className="p-2 hover:bg-secondary rounded-lg">
                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                </button>
                                <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">{editingTask ? 'Edit Task' : 'Add Task'}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Task title" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={2} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Priority</label>
                                    <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                        {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Due Date</label>
                                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Tags (comma separated)</label>
                                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="work, urgent, bug" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!title} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                {editingTask ? 'Update' : 'Add'} Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
