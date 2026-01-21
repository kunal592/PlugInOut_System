'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Plus, Trash2, Calendar, BarChart3 } from 'lucide-react';

interface TimeEntry {
    id: string;
    description: string;
    startTime: string;
    endTime?: string;
    duration?: number;
    isRunning: boolean;
    tags: string[];
}

export default function TimeTrackerPage() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [runningEntry, setRunningEntry] = useState<TimeEntry | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Form state
    const [description, setDescription] = useState('');
    const [manualStart, setManualStart] = useState('');
    const [manualEnd, setManualEnd] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        loadData();
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    useEffect(() => {
        if (runningEntry) {
            timerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - new Date(runningEntry.startTime).getTime()) / 1000);
                setCurrentTime(elapsed);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setCurrentTime(0);
        }
    }, [runningEntry]);

    const loadData = () => {
        const now = new Date();
        const demo: TimeEntry[] = [
            { id: '1', description: 'Client meeting - Project kickoff', startTime: '2026-01-21T09:00:00', endTime: '2026-01-21T10:30:00', duration: 5400, isRunning: false, tags: ['meeting', 'client'] },
            { id: '2', description: 'Development - Feature implementation', startTime: '2026-01-21T10:45:00', endTime: '2026-01-21T12:30:00', duration: 6300, isRunning: false, tags: ['development'] },
            { id: '3', description: 'Code review', startTime: '2026-01-21T14:00:00', endTime: '2026-01-21T15:15:00', duration: 4500, isRunning: false, tags: ['review'] },
            { id: '4', description: 'Documentation update', startTime: '2026-01-20T09:30:00', endTime: '2026-01-20T11:00:00', duration: 5400, isRunning: false, tags: ['docs'] },
            { id: '5', description: 'Team standup', startTime: '2026-01-20T09:00:00', endTime: '2026-01-20T09:15:00', duration: 900, isRunning: false, tags: ['meeting'] },
        ];
        setEntries(demo);
        setLoading(false);
    };

    const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatHours = (seconds: number) => {
        const hrs = seconds / 3600;
        return `${hrs.toFixed(1)}h`;
    };

    const startTimer = () => {
        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            description: description || 'Working...',
            startTime: new Date().toISOString(),
            isRunning: true,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };
        setRunningEntry(newEntry);
        setDescription('');
        setTags('');
    };

    const stopTimer = () => {
        if (!runningEntry) return;

        const endTime = new Date();
        const duration = Math.floor((endTime.getTime() - new Date(runningEntry.startTime).getTime()) / 1000);

        const completedEntry: TimeEntry = {
            ...runningEntry,
            endTime: endTime.toISOString(),
            duration,
            isRunning: false
        };

        setEntries([completedEntry, ...entries]);
        setRunningEntry(null);
    };

    const addManualEntry = () => {
        if (!manualStart || !manualEnd) return;

        const start = new Date(manualStart);
        const end = new Date(manualEnd);
        const duration = Math.floor((end.getTime() - start.getTime()) / 1000);

        if (duration <= 0) return;

        const newEntry: TimeEntry = {
            id: Date.now().toString(),
            description: description || 'Manual entry',
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            duration,
            isRunning: false,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        setEntries([newEntry, ...entries]);
        setShowModal(false);
        setDescription('');
        setManualStart('');
        setManualEnd('');
        setTags('');
    };

    const deleteEntry = (id: string) => {
        if (confirm('Delete this time entry?')) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    const getTodayTotal = () => {
        const today = new Date().toDateString();
        return entries
            .filter(e => new Date(e.startTime).toDateString() === today)
            .reduce((sum, e) => sum + (e.duration || 0), 0) + currentTime;
    };

    const getWeekTotal = () => {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return entries
            .filter(e => new Date(e.startTime) >= weekAgo)
            .reduce((sum, e) => sum + (e.duration || 0), 0) + currentTime;
    };

    const groupByDate = () => {
        const groups: Record<string, TimeEntry[]> = {};
        entries.forEach(e => {
            const date = new Date(e.startTime).toDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(e);
        });
        return groups;
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Time Tracker</h1>
                    <p className="text-muted-foreground">Track your work hours</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:text-foreground">
                    <Plus className="w-5 h-5" />
                    Manual Entry
                </button>
            </div>

            {/* Timer Section */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center md:text-left flex-1">
                        <p className="text-6xl font-mono font-bold text-foreground">
                            {formatDuration(runningEntry ? currentTime : 0)}
                        </p>
                        {runningEntry && (
                            <p className="text-muted-foreground mt-2">
                                {runningEntry.description}
                            </p>
                        )}
                    </div>

                    {!runningEntry ? (
                        <div className="flex-1 flex items-center gap-4">
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground"
                                placeholder="What are you working on?"
                            />
                            <button
                                onClick={startTimer}
                                className="p-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                            >
                                <Play className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={stopTimer}
                            className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                            <Square className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Clock className="w-4 h-4" />
                        Today
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatHours(getTodayTotal())}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        This Week
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatHours(getWeekTotal())}</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BarChart3 className="w-4 h-4" />
                        Entries
                    </div>
                    <p className="text-2xl font-bold text-foreground">{entries.length}</p>
                </div>
            </div>

            {/* Time Entries */}
            <div className="space-y-6">
                {Object.entries(groupByDate()).map(([date, dayEntries]) => (
                    <div key={date}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-foreground">
                                {date === new Date().toDateString() ? 'Today' : date}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                                {formatHours(dayEntries.reduce((s, e) => s + (e.duration || 0), 0))}
                            </span>
                        </div>
                        <div className="space-y-2">
                            {dayEntries.map(entry => (
                                <div key={entry.id} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-foreground">{entry.description}</p>
                                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                            <span>{new Date(entry.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>-</span>
                                            <span>{entry.endTime ? new Date(entry.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Running'}</span>
                                            {entry.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-medium text-foreground">{formatDuration(entry.duration || 0)}</span>
                                        <button onClick={() => deleteEntry(entry.id)} className="p-1 hover:bg-destructive/10 rounded">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Manual Entry Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">Add Manual Entry</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Start Time</label>
                                    <input type="datetime-local" value={manualStart} onChange={e => setManualStart(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">End Time</label>
                                    <input type="datetime-local" value={manualEnd} onChange={e => setManualEnd(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Tags</label>
                                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="meeting, dev, review" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={addManualEntry} disabled={!manualStart || !manualEnd} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Add Entry</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
