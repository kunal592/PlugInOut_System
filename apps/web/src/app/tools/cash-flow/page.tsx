'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, DollarSign, Calendar, Wallet } from 'lucide-react';

interface CashFlowEntry {
    id: string;
    type: 'inflow' | 'outflow';
    category: string;
    description: string;
    amount: number;
    date: string;
    isRecurring: boolean;
    recurringFrequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

const inflowCategories = ['Sales', 'Investments', 'Loans Received', 'Interest', 'Other Income'];
const outflowCategories = ['Operating Expenses', 'Payroll', 'Rent', 'Loan Payments', 'Equipment', 'Taxes', 'Other Expenses'];

export default function CashFlowPage() {
    const [entries, setEntries] = useState<CashFlowEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('2026-01');

    // Form state
    const [type, setType] = useState<'inflow' | 'outflow'>('inflow');
    const [category, setCategory] = useState(inflowCategories[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setCategory(type === 'inflow' ? inflowCategories[0] : outflowCategories[0]);
    }, [type]);

    const loadData = () => {
        const demo: CashFlowEntry[] = [
            { id: '1', type: 'inflow', category: 'Sales', description: 'Customer payments received', amount: 8500000, date: '2026-01-05', isRecurring: false },
            { id: '2', type: 'inflow', category: 'Sales', description: 'Product sales batch', amount: 3200000, date: '2026-01-12', isRecurring: false },
            { id: '3', type: 'inflow', category: 'Interest', description: 'Bank interest', amount: 25000, date: '2026-01-15', isRecurring: true, recurringFrequency: 'monthly' },
            { id: '4', type: 'outflow', category: 'Payroll', description: 'Employee salaries', amount: 4500000, date: '2026-01-01', isRecurring: true, recurringFrequency: 'monthly' },
            { id: '5', type: 'outflow', category: 'Rent', description: 'Office rent', amount: 750000, date: '2026-01-01', isRecurring: true, recurringFrequency: 'monthly' },
            { id: '6', type: 'outflow', category: 'Operating Expenses', description: 'Server & hosting', amount: 150000, date: '2026-01-05', isRecurring: true, recurringFrequency: 'monthly' },
            { id: '7', type: 'outflow', category: 'Equipment', description: 'New laptops', amount: 200000, date: '2026-01-10', isRecurring: false },
            { id: '8', type: 'inflow', category: 'Investments', description: 'Seed funding received', amount: 10000000, date: '2026-01-08', isRecurring: false },
            { id: '9', type: 'outflow', category: 'Taxes', description: 'GST payment', amount: 500000, date: '2026-01-20', isRecurring: true, recurringFrequency: 'monthly' },
            { id: '10', type: 'outflow', category: 'Operating Expenses', description: 'Marketing spend', amount: 350000, date: '2026-01-18', isRecurring: false },
        ];
        setEntries(demo);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const handleSubmit = () => {
        const newEntry: CashFlowEntry = {
            id: Date.now().toString(),
            type,
            category,
            description,
            amount: Math.round(parseFloat(amount) * 100),
            date,
            isRecurring,
            ...(isRecurring && { recurringFrequency })
        };
        setEntries([newEntry, ...entries]);
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setType('inflow');
        setCategory(inflowCategories[0]);
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setIsRecurring(false);
        setRecurringFrequency('monthly');
    };

    const deleteEntry = (id: string) => {
        if (confirm('Delete this entry?')) {
            setEntries(entries.filter(e => e.id !== id));
        }
    };

    // Filter by selected month
    const monthEntries = entries.filter(e => e.date.startsWith(selectedMonth));

    // Calculate totals
    const totalInflows = monthEntries.filter(e => e.type === 'inflow').reduce((sum, e) => sum + e.amount, 0);
    const totalOutflows = monthEntries.filter(e => e.type === 'outflow').reduce((sum, e) => sum + e.amount, 0);
    const netCashFlow = totalInflows - totalOutflows;

    // Opening balance (previous month's ending balance - simulated)
    const openingBalance = 15000000; // ₹1,50,000
    const closingBalance = openingBalance + netCashFlow;

    // Daily cash flow for chart
    const dailyFlow = monthEntries.reduce((acc, e) => {
        const day = e.date;
        if (!acc[day]) acc[day] = { inflow: 0, outflow: 0 };
        if (e.type === 'inflow') acc[day].inflow += e.amount;
        else acc[day].outflow += e.amount;
        return acc;
    }, {} as Record<string, { inflow: number; outflow: number }>);

    // Category breakdown
    const inflowsByCategory = monthEntries.filter(e => e.type === 'inflow').reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const outflowsByCategory = monthEntries.filter(e => e.type === 'outflow').reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    // Projected cash flow (next 3 months based on recurring)
    const recurringInflow = entries.filter(e => e.type === 'inflow' && e.isRecurring && e.recurringFrequency === 'monthly').reduce((s, e) => s + e.amount, 0);
    const recurringOutflow = entries.filter(e => e.type === 'outflow' && e.isRecurring && e.recurringFrequency === 'monthly').reduce((s, e) => s + e.amount, 0);
    const projectedMonthlyFlow = recurringInflow - recurringOutflow;

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Cash Flow Tracker</h1>
                    <p className="text-muted-foreground">Monitor inflows, outflows, and project future balances</p>
                </div>
                <div className="flex gap-3">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        <Plus className="w-5 h-5" />
                        Add Entry
                    </button>
                </div>
            </div>

            {/* Cash Position Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Opening Balance</p>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(openingBalance)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <ArrowUpRight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Inflows</p>
                            <p className="text-xl font-bold text-green-600">+{formatCurrency(totalInflows)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <ArrowDownRight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Outflows</p>
                            <p className="text-xl font-bold text-red-600">-{formatCurrency(totalOutflows)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${closingBalance >= openingBalance ? 'bg-purple-500' : 'bg-orange-500'} rounded-lg flex items-center justify-center`}>
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Closing Balance</p>
                            <p className="text-xl font-bold text-foreground">{formatCurrency(closingBalance)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Cash Flow Banner */}
            <div className={`p-6 rounded-xl ${netCashFlow >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg opacity-90">Net Cash Flow</p>
                        <p className="text-4xl font-bold">
                            {netCashFlow >= 0 ? '+' : ''}{formatCurrency(netCashFlow)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg opacity-90">Projected Monthly (Recurring)</p>
                        <p className="text-2xl font-bold">
                            {projectedMonthlyFlow >= 0 ? '+' : ''}{formatCurrency(projectedMonthlyFlow)}/mo
                        </p>
                    </div>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Inflows by Category */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Inflows by Source
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(inflowsByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                            <div key={cat}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{cat}</span>
                                    <span className="font-medium text-green-600">{formatCurrency(amt)}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full"
                                        style={{ width: `${(amt / totalInflows) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Outflows by Category */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        Outflows by Category
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(outflowsByCategory).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
                            <div key={cat}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">{cat}</span>
                                    <span className="font-medium text-red-600">{formatCurrency(amt)}</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-500 rounded-full"
                                        style={{ width: `${(amt / totalOutflows) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Projection Table */}
            <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    3-Month Projection (Based on Recurring)
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Month</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Opening</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Inflows</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Outflows</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Net Flow</th>
                                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Closing</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[0, 1, 2, 3].map(i => {
                                const opening = i === 0 ? openingBalance : openingBalance + (projectedMonthlyFlow * i);
                                const closing = opening + projectedMonthlyFlow;
                                const month = new Date();
                                month.setMonth(month.getMonth() + i);
                                return (
                                    <tr key={i} className={`border-t border-border ${i === 0 ? 'bg-primary/5' : ''}`}>
                                        <td className="p-3 font-medium text-foreground">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}{i === 0 && ' (Current)'}</td>
                                        <td className="p-3 text-right text-muted-foreground">{formatCurrency(opening)}</td>
                                        <td className="p-3 text-right text-green-600">+{formatCurrency(i === 0 ? totalInflows : recurringInflow)}</td>
                                        <td className="p-3 text-right text-red-600">-{formatCurrency(i === 0 ? totalOutflows : recurringOutflow)}</td>
                                        <td className={`p-3 text-right font-medium ${projectedMonthlyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {projectedMonthlyFlow >= 0 ? '+' : ''}{formatCurrency(i === 0 ? netCashFlow : projectedMonthlyFlow)}
                                        </td>
                                        <td className="p-3 text-right font-semibold text-foreground">{formatCurrency(i === 0 ? closingBalance : closing)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Transaction History</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Recurring</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthEntries.sort((a, b) => b.date.localeCompare(a.date)).map(entry => (
                            <tr key={entry.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4 text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</td>
                                <td className="p-4 font-medium text-foreground">{entry.description}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${entry.type === 'inflow' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {entry.category}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-semibold ${entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}`}>
                                    {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                                </td>
                                <td className="p-4 text-center">
                                    {entry.isRecurring && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs capitalize">
                                            {entry.recurringFrequency}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">Add Cash Flow Entry</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                                <button onClick={() => setType('inflow')} className={`flex-1 py-2 rounded-md text-sm font-medium ${type === 'inflow' ? 'bg-green-500 text-white' : 'text-muted-foreground'}`}>
                                    Inflow
                                </button>
                                <button onClick={() => setType('outflow')} className={`flex-1 py-2 rounded-md text-sm font-medium ${type === 'outflow' ? 'bg-red-500 text-white' : 'text-muted-foreground'}`}>
                                    Outflow
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                    {(type === 'inflow' ? inflowCategories : outflowCategories).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Amount (₹) *</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="recurring" checked={isRecurring} onChange={e => setIsRecurring(e.target.checked)} className="w-4 h-4" />
                                <label htmlFor="recurring" className="text-sm text-foreground">Recurring entry</label>
                            </div>
                            {isRecurring && (
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Frequency</label>
                                    <select value={recurringFrequency} onChange={e => setRecurringFrequency(e.target.value as any)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                        <option value="weekly">Weekly</option>
                                        <option value="monthly">Monthly</option>
                                        <option value="quarterly">Quarterly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!description || !amount} className={`px-6 py-2 rounded-lg text-white ${type === 'inflow' ? 'bg-green-500' : 'bg-red-500'} disabled:opacity-50`}>
                                Add {type === 'inflow' ? 'Inflow' : 'Outflow'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
