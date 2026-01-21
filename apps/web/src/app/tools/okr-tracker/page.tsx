'use client';

import { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

interface KeyResult {
    id: string;
    title: string;
    targetValue: number;
    currentValue: number;
    unit: string;
}

interface Objective {
    id: string;
    title: string;
    description?: string;
    period: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED';
    progress: number;
    keyResults: KeyResult[];
}

export default function OkrTrackerPage() {
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
    const [selectedPeriod, setSelectedPeriod] = useState('Q1-2026');

    // Form state
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [period, setPeriod] = useState('Q1-2026');
    const [keyResults, setKeyResults] = useState<{ title: string; target: string; unit: string }[]>([
        { title: '', target: '100', unit: '%' }
    ]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const demo: Objective[] = [
            {
                id: '1', title: 'Increase Monthly Revenue', description: 'Grow revenue through new channels', period: 'Q1-2026', status: 'IN_PROGRESS', progress: 65,
                keyResults: [
                    { id: 'kr1', title: 'Launch 3 new product lines', targetValue: 3, currentValue: 2, unit: '#' },
                    { id: 'kr2', title: 'Increase conversion rate', targetValue: 5, currentValue: 3.2, unit: '%' },
                    { id: 'kr3', title: 'Reach $500K MRR', targetValue: 500000, currentValue: 350000, unit: '$' }
                ]
            },
            {
                id: '2', title: 'Improve Product Quality', description: 'Reduce bugs and improve UX', period: 'Q1-2026', status: 'IN_PROGRESS', progress: 80,
                keyResults: [
                    { id: 'kr4', title: 'Reduce critical bugs', targetValue: 0, currentValue: 2, unit: '#' },
                    { id: 'kr5', title: 'Increase NPS score', targetValue: 50, currentValue: 42, unit: '#' },
                    { id: 'kr6', title: 'Achieve 99.9% uptime', targetValue: 99.9, currentValue: 99.7, unit: '%' }
                ]
            },
            {
                id: '3', title: 'Build World-Class Team', period: 'Q1-2026', status: 'AT_RISK', progress: 40,
                keyResults: [
                    { id: 'kr7', title: 'Hire 10 engineers', targetValue: 10, currentValue: 4, unit: '#' },
                    { id: 'kr8', title: 'Complete leadership training', targetValue: 100, currentValue: 30, unit: '%' }
                ]
            },
            {
                id: '4', title: 'Launch Mobile App', period: 'Q1-2026', status: 'COMPLETED', progress: 100,
                keyResults: [
                    { id: 'kr9', title: 'App Store launch', targetValue: 1, currentValue: 1, unit: '#' },
                    { id: 'kr10', title: 'Reach 10K downloads', targetValue: 10000, currentValue: 12500, unit: '#' }
                ]
            }
        ];
        setObjectives(demo);
        setExpandedIds(new Set(demo.map(o => o.id)));
        setLoading(false);
    };

    const toggleExpand = (id: string) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedIds(newSet);
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            NOT_STARTED: 'bg-gray-100 text-gray-700',
            IN_PROGRESS: 'bg-blue-100 text-blue-700',
            AT_RISK: 'bg-red-100 text-red-700',
            COMPLETED: 'bg-green-100 text-green-700'
        };
        return colors[status] || colors.IN_PROGRESS;
    };

    const getProgressColor = (progress: number) => {
        if (progress >= 70) return 'bg-green-500';
        if (progress >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const formatValue = (value: number, unit: string) => {
        if (unit === '$') return `$${value.toLocaleString()}`;
        if (unit === '%') return `${value}%`;
        return value.toLocaleString();
    };

    const handleAddKeyResult = () => {
        setKeyResults([...keyResults, { title: '', target: '100', unit: '%' }]);
    };

    const handleRemoveKeyResult = (index: number) => {
        if (keyResults.length > 1) {
            setKeyResults(keyResults.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        const newObjective: Objective = {
            id: Date.now().toString(),
            title,
            description,
            period,
            status: 'NOT_STARTED',
            progress: 0,
            keyResults: keyResults.filter(kr => kr.title).map((kr, i) => ({
                id: `kr-${Date.now()}-${i}`,
                title: kr.title,
                targetValue: parseFloat(kr.target) || 100,
                currentValue: 0,
                unit: kr.unit
            }))
        };
        setObjectives([newObjective, ...objectives]);
        setExpandedIds(new Set([...expandedIds, newObjective.id]));
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setTitle('');
        setDescription('');
        setPeriod('Q1-2026');
        setKeyResults([{ title: '', target: '100', unit: '%' }]);
    };

    const updateKeyResultProgress = (objId: string, krId: string, newValue: number) => {
        setObjectives(objectives.map(obj => {
            if (obj.id !== objId) return obj;

            const updatedKRs = obj.keyResults.map(kr =>
                kr.id === krId ? { ...kr, currentValue: newValue } : kr
            );

            const avgProgress = updatedKRs.reduce((sum, kr) => {
                const krProgress = Math.min(100, (kr.currentValue / kr.targetValue) * 100);
                return sum + krProgress;
            }, 0) / updatedKRs.length;

            return { ...obj, keyResults: updatedKRs, progress: Math.round(avgProgress) };
        }));
    };

    const deleteObjective = (id: string) => {
        if (confirm('Delete this objective?')) {
            setObjectives(objectives.filter(o => o.id !== id));
        }
    };

    const filteredObjectives = objectives.filter(o => o.period === selectedPeriod);
    const overallProgress = filteredObjectives.length > 0
        ? Math.round(filteredObjectives.reduce((sum, o) => sum + o.progress, 0) / filteredObjectives.length)
        : 0;

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">OKR Tracker</h1>
                    <p className="text-muted-foreground">Track objectives and key results</p>
                </div>
                <div className="flex gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={e => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    >
                        <option value="Q1-2026">Q1 2026</option>
                        <option value="Q2-2026">Q2 2026</option>
                        <option value="Q3-2026">Q3 2026</option>
                        <option value="Q4-2026">Q4 2026</option>
                    </select>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        <Plus className="w-5 h-5" />
                        Add Objective
                    </button>
                </div>
            </div>

            {/* Overall Progress */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-muted-foreground">Overall Progress</p>
                        <p className="text-4xl font-bold text-foreground">{overallProgress}%</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">Objectives</p>
                        <p className="text-2xl font-bold text-foreground">{filteredObjectives.length}</p>
                    </div>
                </div>
                <div className="h-3 bg-secondary rounded-full mt-4 overflow-hidden">
                    <div className={`h-full rounded-full ${getProgressColor(overallProgress)}`} style={{ width: `${overallProgress}%` }} />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-green-600">{filteredObjectives.filter(o => o.status === 'COMPLETED').length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-blue-600">{filteredObjectives.filter(o => o.status === 'IN_PROGRESS').length}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-red-600">{filteredObjectives.filter(o => o.status === 'AT_RISK').length}</p>
                    <p className="text-sm text-muted-foreground">At Risk</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{filteredObjectives.reduce((s, o) => s + o.keyResults.length, 0)}</p>
                    <p className="text-sm text-muted-foreground">Key Results</p>
                </div>
            </div>

            {/* Objectives List */}
            <div className="space-y-4">
                {filteredObjectives.map(obj => (
                    <div key={obj.id} className="bg-card rounded-xl border border-border overflow-hidden">
                        {/* Objective Header */}
                        <div
                            className="p-4 cursor-pointer hover:bg-secondary/20"
                            onClick={() => toggleExpand(obj.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {expandedIds.has(obj.id) ? (
                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                                    )}
                                    <Target className="w-5 h-5 text-primary" />
                                    <div>
                                        <h3 className="font-semibold text-foreground">{obj.title}</h3>
                                        {obj.description && <p className="text-sm text-muted-foreground">{obj.description}</p>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(obj.status)}`}>
                                        {obj.status.replace('_', ' ')}
                                    </span>
                                    <div className="w-24">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-muted-foreground">{obj.progress}%</span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${getProgressColor(obj.progress)}`} style={{ width: `${obj.progress}%` }} />
                                        </div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); deleteObjective(obj.id); }} className="p-1 hover:bg-destructive/10 rounded">
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Key Results */}
                        {expandedIds.has(obj.id) && (
                            <div className="border-t border-border p-4 bg-secondary/10 space-y-3">
                                {obj.keyResults.map(kr => {
                                    const krProgress = Math.min(100, (kr.currentValue / kr.targetValue) * 100);
                                    return (
                                        <div key={kr.id} className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="text-sm text-foreground">{kr.title}</span>
                                                    <span className="text-sm font-medium">
                                                        {formatValue(kr.currentValue, kr.unit)} / {formatValue(kr.targetValue, kr.unit)}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full ${getProgressColor(krProgress)}`} style={{ width: `${krProgress}%` }} />
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                value={kr.currentValue}
                                                onChange={e => updateKeyResultProgress(obj.id, kr.id, parseFloat(e.target.value) || 0)}
                                                className="w-20 px-2 py-1 rounded border border-input bg-background text-foreground text-sm text-center"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Add Objective Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">New Objective</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Objective *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="What do you want to achieve?" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={2} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Period</label>
                                <select value={period} onChange={e => setPeriod(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                    <option value="Q1-2026">Q1 2026</option>
                                    <option value="Q2-2026">Q2 2026</option>
                                    <option value="Q3-2026">Q3 2026</option>
                                    <option value="Q4-2026">Q4 2026</option>
                                </select>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-foreground">Key Results</label>
                                    <button onClick={handleAddKeyResult} className="text-sm text-primary hover:underline">+ Add KR</button>
                                </div>
                                <div className="space-y-2">
                                    {keyResults.map((kr, i) => (
                                        <div key={i} className="flex gap-2 items-center">
                                            <input
                                                value={kr.title}
                                                onChange={e => setKeyResults(keyResults.map((k, j) => j === i ? { ...k, title: e.target.value } : k))}
                                                className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                                placeholder="Key result description"
                                            />
                                            <input
                                                type="number"
                                                value={kr.target}
                                                onChange={e => setKeyResults(keyResults.map((k, j) => j === i ? { ...k, target: e.target.value } : k))}
                                                className="w-20 px-2 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                            />
                                            <select
                                                value={kr.unit}
                                                onChange={e => setKeyResults(keyResults.map((k, j) => j === i ? { ...k, unit: e.target.value } : k))}
                                                className="w-16 px-2 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                            >
                                                <option value="%">%</option>
                                                <option value="#">#</option>
                                                <option value="$">$</option>
                                            </select>
                                            <button onClick={() => handleRemoveKeyResult(i)} className="p-1 text-destructive" disabled={keyResults.length <= 1}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!title} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Create Objective</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
