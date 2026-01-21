'use client';

import { useState, useEffect } from 'react';
import { Plus, FolderKanban, Users, Flag, CheckCircle, Clock, Trash2, Edit2 } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    description?: string;
    status: 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
    color: string;
    tasksCount: number;
    completedTasks: number;
    milestones: Milestone[];
    members: Member[];
}

interface Milestone {
    id: string;
    title: string;
    dueDate?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

interface Member {
    id: string;
    name: string;
    role: string;
}

const colors = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6'];

export default function ProjectLitePage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(colors[0]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const demo: Project[] = [
            {
                id: '1', name: 'Website Redesign', description: 'Complete overhaul of company website', status: 'ACTIVE', color: '#6366F1',
                tasksCount: 24, completedTasks: 18,
                milestones: [
                    { id: 'm1', title: 'Design Phase', dueDate: '2026-01-15', status: 'COMPLETED' },
                    { id: 'm2', title: 'Development', dueDate: '2026-02-01', status: 'IN_PROGRESS' },
                    { id: 'm3', title: 'Launch', dueDate: '2026-02-15', status: 'PENDING' }
                ],
                members: [{ id: 'u1', name: 'Alice', role: 'OWNER' }, { id: 'u2', name: 'Bob', role: 'MEMBER' }]
            },
            {
                id: '2', name: 'Mobile App v2', description: 'Version 2 with new features', status: 'ACTIVE', color: '#EC4899',
                tasksCount: 42, completedTasks: 12,
                milestones: [
                    { id: 'm4', title: 'Planning', status: 'COMPLETED' },
                    { id: 'm5', title: 'MVP', dueDate: '2026-03-01', status: 'IN_PROGRESS' }
                ],
                members: [{ id: 'u1', name: 'Alice', role: 'MEMBER' }, { id: 'u3', name: 'Carol', role: 'OWNER' }]
            },
            {
                id: '3', name: 'Q1 Marketing', description: 'Marketing campaigns for Q1', status: 'ON_HOLD', color: '#10B981',
                tasksCount: 15, completedTasks: 5,
                milestones: [{ id: 'm6', title: 'Campaign Launch', status: 'PENDING' }],
                members: [{ id: 'u4', name: 'David', role: 'OWNER' }]
            },
            {
                id: '4', name: 'Internal Tools', status: 'COMPLETED', color: '#F59E0B',
                tasksCount: 8, completedTasks: 8,
                milestones: [],
                members: []
            }
        ];
        setProjects(demo);
        setLoading(false);
    };

    const handleSubmit = () => {
        const newProject: Project = {
            id: Date.now().toString(),
            name,
            description,
            status: 'ACTIVE',
            color,
            tasksCount: 0,
            completedTasks: 0,
            milestones: [],
            members: []
        };
        setProjects([newProject, ...projects]);
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setName('');
        setDescription('');
        setColor(colors[0]);
    };

    const updateStatus = (id: string, status: Project['status']) => {
        setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
    };

    const deleteProject = (id: string) => {
        if (confirm('Delete this project?')) {
            setProjects(projects.filter(p => p.id !== id));
            if (selectedProject?.id === id) setSelectedProject(null);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: 'bg-green-100 text-green-700',
            ON_HOLD: 'bg-yellow-100 text-yellow-700',
            COMPLETED: 'bg-blue-100 text-blue-700',
            ARCHIVED: 'bg-gray-100 text-gray-700'
        };
        return colors[status] || colors.ACTIVE;
    };

    const getMilestoneColor = (status: string) => {
        const colors: Record<string, string> = {
            PENDING: 'border-gray-300',
            IN_PROGRESS: 'border-yellow-400',
            COMPLETED: 'border-green-400'
        };
        return colors[status] || colors.PENDING;
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
                    <p className="text-muted-foreground">Organize projects, milestones, and tasks</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <FolderKanban className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                    <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <CheckCircle className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{projects.filter(p => p.status === 'ACTIVE').length}</p>
                    <p className="text-sm text-muted-foreground">Active</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <Flag className="w-5 h-5 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{projects.reduce((s, p) => s + p.milestones.length, 0)}</p>
                    <p className="text-sm text-muted-foreground">Milestones</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <Users className="w-5 h-5 text-orange-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{new Set(projects.flatMap(p => p.members.map(m => m.id))).size}</p>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                    <div
                        key={project.id}
                        className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedProject(project)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                                <h3 className="font-semibold text-foreground">{project.name}</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status.replace('_', ' ')}
                            </span>
                        </div>

                        {project.description && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.description}</p>
                        )}

                        {/* Progress Bar */}
                        <div className="mb-4">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>{project.completedTasks}/{project.tasksCount} tasks</span>
                                <span>{project.tasksCount > 0 ? Math.round((project.completedTasks / project.tasksCount) * 100) : 0}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${project.tasksCount > 0 ? (project.completedTasks / project.tasksCount) * 100 : 0}%`,
                                        backgroundColor: project.color
                                    }}
                                />
                            </div>
                        </div>

                        {/* Milestones Preview */}
                        {project.milestones.length > 0 && (
                            <div className="flex gap-2 mb-3">
                                {project.milestones.slice(0, 3).map(m => (
                                    <div key={m.id} className={`flex-1 h-1 rounded border-b-2 ${getMilestoneColor(m.status)}`} title={m.title} />
                                ))}
                            </div>
                        )}

                        {/* Members */}
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {project.members.slice(0, 4).map(member => (
                                    <div
                                        key={member.id}
                                        className="w-7 h-7 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-xs font-medium text-primary"
                                        title={member.name}
                                    >
                                        {member.name[0]}
                                    </div>
                                ))}
                                {project.members.length > 4 && (
                                    <div className="w-7 h-7 rounded-full bg-secondary border-2 border-card flex items-center justify-center text-xs text-muted-foreground">
                                        +{project.members.length - 4}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                                className="p-1 hover:bg-destructive/10 rounded"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Project Detail Modal */}
            {selectedProject && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedProject.color }} />
                                <h2 className="text-xl font-bold text-foreground">{selectedProject.name}</h2>
                            </div>
                            <select
                                value={selectedProject.status}
                                onChange={e => { updateStatus(selectedProject.id, e.target.value as Project['status']); setSelectedProject({ ...selectedProject, status: e.target.value as Project['status'] }); }}
                                className={`px-3 py-1 rounded-lg text-sm font-medium ${getStatusColor(selectedProject.status)}`}
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>

                        <div className="p-6 space-y-6">
                            {selectedProject.description && (
                                <p className="text-muted-foreground">{selectedProject.description}</p>
                            )}

                            {/* Milestones */}
                            <div>
                                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Flag className="w-4 h-4" /> Milestones
                                </h3>
                                <div className="space-y-2">
                                    {selectedProject.milestones.map(m => (
                                        <div key={m.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${m.status === 'COMPLETED' ? 'bg-green-500' : m.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-300'}`} />
                                                <span className="text-foreground">{m.title}</span>
                                            </div>
                                            {m.dueDate && <span className="text-sm text-muted-foreground">{new Date(m.dueDate).toLocaleDateString()}</span>}
                                        </div>
                                    ))}
                                    {selectedProject.milestones.length === 0 && (
                                        <p className="text-muted-foreground text-sm">No milestones yet</p>
                                    )}
                                </div>
                            </div>

                            {/* Members */}
                            <div>
                                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Team Members
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.members.map(m => (
                                        <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-secondary/30 rounded-lg">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">{m.name[0]}</div>
                                            <span className="text-sm text-foreground">{m.name}</span>
                                            <span className="text-xs text-muted-foreground">({m.role})</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end">
                            <button onClick={() => setSelectedProject(null)} className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:text-foreground">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">New Project</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Project Name *</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Enter project name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={3} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Color</label>
                                <div className="flex gap-2">
                                    {colors.map(c => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!name} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Create Project</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
