'use client';

import { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    date: string;
    clockIn?: string;
    clockOut?: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'LEAVE';
    totalHours?: number;
}

export default function AttendancePage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const today = new Date().toISOString().split('T')[0];
        const demo: AttendanceRecord[] = [
            { id: '1', date: today, status: 'PRESENT' },
            { id: '2', date: '2026-01-20', clockIn: '2026-01-20T09:05:00', clockOut: '2026-01-20T18:15:00', status: 'PRESENT', totalHours: 9.17 },
            { id: '3', date: '2026-01-19', status: 'LEAVE' },
            { id: '4', date: '2026-01-18', status: 'LEAVE' },
            { id: '5', date: '2026-01-17', clockIn: '2026-01-17T09:32:00', clockOut: '2026-01-17T18:00:00', status: 'LATE', totalHours: 8.47 },
            { id: '6', date: '2026-01-16', clockIn: '2026-01-16T08:55:00', clockOut: '2026-01-16T18:30:00', status: 'PRESENT', totalHours: 9.58 },
            { id: '7', date: '2026-01-15', clockIn: '2026-01-15T09:00:00', clockOut: '2026-01-15T13:00:00', status: 'HALF_DAY', totalHours: 4 },
            { id: '8', date: '2026-01-14', clockIn: '2026-01-14T09:00:00', clockOut: '2026-01-14T18:00:00', status: 'PRESENT', totalHours: 9 },
            { id: '9', date: '2026-01-13', clockIn: '2026-01-13T09:15:00', clockOut: '2026-01-13T18:00:00', status: 'LATE', totalHours: 8.75 },
        ];

        const todayRec = demo.find(r => r.date === today);
        setTodayRecord(todayRec || null);
        setRecords(demo.filter(r => r.date !== today));
        setLoading(false);
    };

    const clockIn = () => {
        const now = new Date();
        const expectedStart = new Date();
        expectedStart.setHours(9, 0, 0, 0);
        const isLate = now > expectedStart;

        const newRecord: AttendanceRecord = {
            id: Date.now().toString(),
            date: now.toISOString().split('T')[0],
            clockIn: now.toISOString(),
            status: isLate ? 'LATE' : 'PRESENT'
        };
        setTodayRecord(newRecord);
    };

    const clockOut = () => {
        if (!todayRecord?.clockIn) return;

        const now = new Date();
        const clockInTime = new Date(todayRecord.clockIn);
        const totalHours = (now.getTime() - clockInTime.getTime()) / (1000 * 60 * 60);

        setTodayRecord({
            ...todayRecord,
            clockOut: now.toISOString(),
            totalHours: Math.round(totalHours * 100) / 100,
            status: totalHours < 4 ? 'HALF_DAY' : todayRecord.status
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            PRESENT: 'bg-green-100 text-green-700',
            ABSENT: 'bg-red-100 text-red-700',
            LATE: 'bg-yellow-100 text-yellow-700',
            HALF_DAY: 'bg-orange-100 text-orange-700',
            LEAVE: 'bg-blue-100 text-blue-700'
        };
        return colors[status] || colors.PRESENT;
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            PRESENT: <CheckCircle className="w-4 h-4" />,
            ABSENT: <XCircle className="w-4 h-4" />,
            LATE: <AlertCircle className="w-4 h-4" />,
            HALF_DAY: <Clock className="w-4 h-4" />,
            LEAVE: <Calendar className="w-4 h-4" />
        };
        return icons[status];
    };

    const allRecords = todayRecord ? [todayRecord, ...records] : records;
    const monthRecords = allRecords.filter(r => r.date.startsWith(selectedMonth));

    const summary = {
        present: monthRecords.filter(r => r.status === 'PRESENT').length,
        late: monthRecords.filter(r => r.status === 'LATE').length,
        halfDay: monthRecords.filter(r => r.status === 'HALF_DAY').length,
        leave: monthRecords.filter(r => r.status === 'LEAVE').length,
        absent: monthRecords.filter(r => r.status === 'ABSENT').length,
        totalHours: monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0)
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground">Attendance Tracker</h1>
                <p className="text-muted-foreground">Track your work attendance</p>
            </div>

            {/* Clock In/Out Card */}
            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="text-center">
                    <p className="text-5xl font-mono font-bold text-foreground mb-2">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-muted-foreground mb-6">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    {!todayRecord?.clockIn ? (
                        <button
                            onClick={clockIn}
                            className="px-8 py-4 bg-green-500 text-white rounded-xl text-lg font-medium hover:bg-green-600 transition-colors flex items-center gap-3 mx-auto"
                        >
                            <LogIn className="w-6 h-6" />
                            Clock In
                        </button>
                    ) : !todayRecord?.clockOut ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-center gap-4 text-muted-foreground">
                                <span>Clocked in at {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(todayRecord.status)}`}>{todayRecord.status}</span>
                            </div>
                            <button
                                onClick={clockOut}
                                className="px-8 py-4 bg-red-500 text-white rounded-xl text-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-3 mx-auto"
                            >
                                <LogOut className="w-6 h-6" />
                                Clock Out
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-green-600 font-medium">Day Complete!</p>
                            <p className="text-muted-foreground">
                                {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-2xl font-bold text-foreground">{todayRecord.totalHours?.toFixed(1)}h</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Monthly Summary */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Monthly Report</h2>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={e => setSelectedMonth(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                    <p className="text-sm text-muted-foreground">Present</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-yellow-600">{summary.late}</p>
                    <p className="text-sm text-muted-foreground">Late</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-orange-600">{summary.halfDay}</p>
                    <p className="text-sm text-muted-foreground">Half Day</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-blue-600">{summary.leave}</p>
                    <p className="text-sm text-muted-foreground">Leave</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-red-600">{summary.absent}</p>
                    <p className="text-sm text-muted-foreground">Absent</p>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border text-center">
                    <p className="text-2xl font-bold text-foreground">{summary.totalHours.toFixed(1)}h</p>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Clock In</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Clock Out</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Hours</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthRecords.map(record => (
                            <tr key={record.id} className="border-t border-border">
                                <td className="p-4 font-medium text-foreground">
                                    {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="p-4 font-medium text-foreground">
                                    {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${getStatusColor(record.status)}`}>
                                        {getStatusIcon(record.status)}
                                        {record.status.replace('_', ' ')}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
