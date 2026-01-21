'use client';

import { useState, useEffect } from 'react';
import { Plus, FileEdit, Search, Tag, Calendar, Clock, Trash2, Users, CheckSquare } from 'lucide-react';

interface Meeting {
    id: string;
    title: string;
    date: string;
    duration?: number;
    attendees: string[];
    tags: string[];
    content: string;
    summary?: string;
    actionItems: string[];
}

export default function MeetingNotesPage() {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [duration, setDuration] = useState('60');
    const [attendees, setAttendees] = useState('');
    const [tags, setTags] = useState('');
    const [content, setContent] = useState('');
    const [summary, setSummary] = useState('');
    const [actionItems, setActionItems] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const demo: Meeting[] = [
            {
                id: '1',
                title: 'Q1 Planning Session',
                date: '2026-01-21T10:00:00',
                duration: 90,
                attendees: ['Alice', 'Bob', 'Carol'],
                tags: ['planning', 'quarterly'],
                content: `## Agenda\n- Review Q4 results\n- Set Q1 objectives\n- Assign team leads\n\n## Discussion\n- Q4 exceeded targets by 15%\n- New product launch successful\n- Customer satisfaction improved\n\n## Next Steps\n- Finalize roadmap by Friday`,
                summary: 'Reviewed Q4 results and set Q1 objectives with team leads assigned.',
                actionItems: ['Finalize roadmap by Friday', 'Schedule 1:1s with new leads', 'Send Q4 report']
            },
            {
                id: '2',
                title: 'Product Review',
                date: '2026-01-20T14:00:00',
                duration: 60,
                attendees: ['David', 'Eve', 'Frank'],
                tags: ['product', 'review'],
                content: `## Features Reviewed\n- New dashboard\n- Analytics module\n- Export functionality\n\n## Feedback\n- Dashboard looks great\n- Need more chart options\n- Export needs CSV support`,
                summary: 'Reviewed new features, gathered feedback for improvements.',
                actionItems: ['Add more chart types', 'Implement CSV export']
            },
            {
                id: '3',
                title: 'Weekly Standup',
                date: '2026-01-20T09:00:00',
                duration: 30,
                attendees: ['Team'],
                tags: ['standup', 'weekly'],
                content: `## Updates\n- Frontend: Completed auth flow\n- Backend: API optimization done\n- QA: Running regression tests\n\n## Blockers\n- Waiting for design assets`,
                actionItems: ['Follow up on design assets']
            },
            {
                id: '4',
                title: 'Client Demo - Acme Corp',
                date: '2026-01-19T15:00:00',
                duration: 45,
                attendees: ['Alice', 'John (Client)', 'Sarah (Client)'],
                tags: ['client', 'demo'],
                content: `## Demo Contents\n- Product overview\n- Key features walkthrough\n- Q&A session\n\n## Client Feedback\n- Very interested in analytics\n- Asked about custom reports\n- Timeline for implementation`,
                summary: 'Positive demo, client interested in analytics and custom reports.',
                actionItems: ['Send proposal', 'Schedule follow-up', 'Prepare custom report mockups']
            }
        ];
        setMeetings(demo);
        setLoading(false);
    };

    const handleSubmit = () => {
        const newMeeting: Meeting = {
            id: Date.now().toString(),
            title,
            date,
            duration: parseInt(duration) || undefined,
            attendees: attendees.split(',').map(a => a.trim()).filter(Boolean),
            tags: tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
            content,
            summary: summary || undefined,
            actionItems: actionItems.split('\n').map(a => a.trim()).filter(Boolean)
        };
        setMeetings([newMeeting, ...meetings]);
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setTitle('');
        setDate(new Date().toISOString().slice(0, 16));
        setDuration('60');
        setAttendees('');
        setTags('');
        setContent('');
        setSummary('');
        setActionItems('');
    };

    const deleteMeeting = (id: string) => {
        if (confirm('Delete this meeting?')) {
            setMeetings(meetings.filter(m => m.id !== id));
            if (selectedMeeting?.id === id) setSelectedMeeting(null);
        }
    };

    const getAllTags = () => {
        const tagSet = new Set<string>();
        meetings.forEach(m => m.tags.forEach(t => tagSet.add(t)));
        return Array.from(tagSet).sort();
    };

    const filteredMeetings = meetings.filter(m => {
        if (searchTerm && !m.title.toLowerCase().includes(searchTerm.toLowerCase()) && !m.content.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }
        if (selectedTag && !m.tags.includes(selectedTag)) {
            return false;
        }
        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Meeting Notes</h1>
                    <p className="text-muted-foreground">Capture and organize your meeting notes</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    New Meeting
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search meetings..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                </div>
                <select
                    value={selectedTag}
                    onChange={e => setSelectedTag(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                    <option value="">All Tags</option>
                    {getAllTags().map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                    ))}
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <FileEdit className="w-5 h-5 text-blue-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{meetings.length}</p>
                    <p className="text-sm text-muted-foreground">Total Meetings</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <Calendar className="w-5 h-5 text-green-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{meetings.filter(m => new Date(m.date).toDateString() === new Date().toDateString()).length}</p>
                    <p className="text-sm text-muted-foreground">Today</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <Tag className="w-5 h-5 text-purple-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{getAllTags().length}</p>
                    <p className="text-sm text-muted-foreground">Tags</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <CheckSquare className="w-5 h-5 text-orange-500 mb-2" />
                    <p className="text-2xl font-bold text-foreground">{meetings.reduce((s, m) => s + m.actionItems.length, 0)}</p>
                    <p className="text-sm text-muted-foreground">Action Items</p>
                </div>
            </div>

            {/* Meeting List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredMeetings.map(meeting => (
                    <div
                        key={meeting.id}
                        className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedMeeting(meeting)}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <h3 className="font-semibold text-foreground">{meeting.title}</h3>
                            <button
                                onClick={(e) => { e.stopPropagation(); deleteMeeting(meeting.id); }}
                                className="p-1 hover:bg-destructive/10 rounded"
                            >
                                <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(meeting.date)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(meeting.date)}
                            </span>
                            {meeting.duration && (
                                <span>{meeting.duration} min</span>
                            )}
                        </div>

                        {meeting.summary && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{meeting.summary}</p>
                        )}

                        <div className="flex flex-wrap gap-2 mb-3">
                            {meeting.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">{tag}</span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                {meeting.attendees.length} attendee{meeting.attendees.length !== 1 ? 's' : ''}
                            </div>
                            {meeting.actionItems.length > 0 && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                    {meeting.actionItems.length} action item{meeting.actionItems.length !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Meeting Detail Modal */}
            {selectedMeeting && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">{selectedMeeting.title}</h2>
                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                                <span>{formatDate(selectedMeeting.date)}</span>
                                <span>{formatTime(selectedMeeting.date)}</span>
                                {selectedMeeting.duration && <span>{selectedMeeting.duration} min</span>}
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Attendees */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Attendees
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMeeting.attendees.map(a => (
                                        <span key={a} className="px-2 py-1 bg-secondary rounded text-sm">{a}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                    <Tag className="w-4 h-4" /> Tags
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedMeeting.tags.map(t => (
                                        <span key={t} className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">{t}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            {selectedMeeting.summary && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2">Summary</h4>
                                    <p className="text-muted-foreground bg-secondary/30 p-3 rounded-lg">{selectedMeeting.summary}</p>
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <h4 className="text-sm font-medium text-foreground mb-2">Notes</h4>
                                <div className="prose prose-sm dark:prose-invert max-w-none bg-secondary/20 p-4 rounded-lg">
                                    <pre className="whitespace-pre-wrap font-sans text-foreground">{selectedMeeting.content}</pre>
                                </div>
                            </div>

                            {/* Action Items */}
                            {selectedMeeting.actionItems.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <CheckSquare className="w-4 h-4" /> Action Items
                                    </h4>
                                    <ul className="space-y-2">
                                        {selectedMeeting.actionItems.map((item, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm">
                                                <input type="checkbox" className="w-4 h-4" />
                                                <span className="text-foreground">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-border flex justify-end">
                            <button onClick={() => setSelectedMeeting(null)} className="px-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:text-foreground">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Meeting Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">New Meeting</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Title *</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Meeting title" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Date & Time</label>
                                    <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Duration (min)</label>
                                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Attendees (comma separated)</label>
                                <input type="text" value={attendees} onChange={e => setAttendees(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Alice, Bob, Carol" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Tags (comma separated)</label>
                                <input type="text" value={tags} onChange={e => setTags(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="planning, weekly, client" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Notes *</label>
                                <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={6} placeholder="Meeting notes..." />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Summary</label>
                                <input type="text" value={summary} onChange={e => setSummary(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Brief summary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Action Items (one per line)</label>
                                <textarea value={actionItems} onChange={e => setActionItems(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={3} placeholder="Action item 1&#10;Action item 2" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!title || !content} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50">Create Meeting</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
