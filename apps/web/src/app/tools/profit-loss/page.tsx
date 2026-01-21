'use client';

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, Download, Edit2, Trash2 } from 'lucide-react';

interface Transaction {
    id: string;
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: number;
    date: string;
}

const incomeCategories = ['Sales Revenue', 'Service Income', 'Interest Income', 'Other Income'];
const expenseCategories = ['Cost of Goods Sold', 'Salaries & Wages', 'Rent', 'Utilities', 'Marketing', 'Office Supplies', 'Insurance', 'Depreciation', 'Other Expenses'];

export default function ProfitLossPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-01-31' });

    // Form state
    const [type, setType] = useState<'income' | 'expense'>('income');
    const [category, setCategory] = useState(incomeCategories[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        setCategory(type === 'income' ? incomeCategories[0] : expenseCategories[0]);
    }, [type]);

    const loadData = () => {
        const demo: Transaction[] = [
            { id: '1', type: 'income', category: 'Sales Revenue', description: 'Product sales - January', amount: 5000000, date: '2026-01-05' },
            { id: '2', type: 'income', category: 'Service Income', description: 'Consulting services', amount: 2500000, date: '2026-01-10' },
            { id: '3', type: 'income', category: 'Sales Revenue', description: 'Online store sales', amount: 1800000, date: '2026-01-15' },
            { id: '4', type: 'expense', category: 'Salaries & Wages', description: 'Employee salaries', amount: 3000000, date: '2026-01-01' },
            { id: '5', type: 'expense', category: 'Rent', description: 'Office rent', amount: 500000, date: '2026-01-01' },
            { id: '6', type: 'expense', category: 'Utilities', description: 'Electricity & Internet', amount: 50000, date: '2026-01-05' },
            { id: '7', type: 'expense', category: 'Marketing', description: 'Google Ads campaign', amount: 200000, date: '2026-01-10' },
            { id: '8', type: 'expense', category: 'Office Supplies', description: 'Stationery and supplies', amount: 25000, date: '2026-01-12' },
            { id: '9', type: 'income', category: 'Interest Income', description: 'Bank interest', amount: 15000, date: '2026-01-20' },
            { id: '10', type: 'expense', category: 'Cost of Goods Sold', description: 'Inventory purchase', amount: 2000000, date: '2026-01-08' },
        ];
        setTransactions(demo);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const handleSubmit = () => {
        const newTx: Transaction = {
            id: editingTx?.id || Date.now().toString(),
            type,
            category,
            description,
            amount: Math.round(parseFloat(amount) * 100),
            date
        };

        if (editingTx) {
            setTransactions(transactions.map(t => t.id === editingTx.id ? newTx : t));
        } else {
            setTransactions([newTx, ...transactions]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingTx(null);
        setType('income');
        setCategory(incomeCategories[0]);
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
    };

    const deleteTx = (id: string) => {
        if (confirm('Delete this transaction?')) {
            setTransactions(transactions.filter(t => t.id !== id));
        }
    };

    // Filter by date range
    const filteredTx = transactions.filter(t => t.date >= dateRange.start && t.date <= dateRange.end);

    // Calculate totals
    const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTx.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

    // Group by category
    const incomeByCategory = filteredTx.filter(t => t.type === 'income').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const expensesByCategory = filteredTx.filter(t => t.type === 'expense').reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Profit & Loss Report</h1>
                    <p className="text-muted-foreground">Track income, expenses, and profitability</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:text-foreground">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                        <Plus className="w-5 h-5" />
                        Add Entry
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                    <span className="text-muted-foreground">to</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-input bg-background text-foreground"
                    />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                            <p className="text-sm text-muted-foreground">Total Expenses</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${netProfit >= 0 ? 'bg-blue-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}
                            </p>
                            <p className="text-sm text-muted-foreground">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${parseFloat(profitMargin) >= 0 ? 'bg-purple-500' : 'bg-red-500'} rounded-lg flex items-center justify-center`}>
                            <span className="text-white font-bold">%</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{profitMargin}%</p>
                            <p className="text-sm text-muted-foreground">Profit Margin</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* P&L Statement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Revenue
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(incomeByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                <span className="text-muted-foreground">{cat}</span>
                                <span className="font-medium text-green-600">{formatCurrency(amt)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center py-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-3 -mx-3 mt-4">
                            <span className="font-semibold text-foreground">Total Revenue</span>
                            <span className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        Expenses
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(expensesByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                                <span className="text-muted-foreground">{cat}</span>
                                <span className="font-medium text-red-600">-{formatCurrency(amt)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center py-3 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 -mx-3 mt-4">
                            <span className="font-semibold text-foreground">Total Expenses</span>
                            <span className="text-xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Net Profit/Loss Banner */}
            <div className={`p-6 rounded-xl ${netProfit >= 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-rose-600'} text-white`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-lg opacity-90">Net {netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                        <p className="text-4xl font-bold">{netProfit >= 0 ? '' : '-'}{formatCurrency(Math.abs(netProfit))}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg opacity-90">Profit Margin</p>
                        <p className="text-4xl font-bold">{profitMargin}%</p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="p-4 border-b border-border">
                    <h3 className="font-semibold text-foreground">Transaction Details</h3>
                </div>
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTx.sort((a, b) => b.date.localeCompare(a.date)).map(tx => (
                            <tr key={tx.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4 text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="p-4 font-medium text-foreground">{tx.description}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs ${tx.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {tx.category}
                                    </span>
                                </td>
                                <td className={`p-4 text-right font-semibold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => deleteTx(tx.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
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
                            <h2 className="text-xl font-bold text-foreground">Add Entry</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex gap-2 p-1 bg-secondary rounded-lg">
                                <button
                                    onClick={() => setType('income')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium ${type === 'income' ? 'bg-green-500 text-white' : 'text-muted-foreground'}`}
                                >
                                    Income
                                </button>
                                <button
                                    onClick={() => setType('expense')}
                                    className={`flex-1 py-2 rounded-md text-sm font-medium ${type === 'expense' ? 'bg-red-500 text-white' : 'text-muted-foreground'}`}
                                >
                                    Expense
                                </button>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                    {(type === 'income' ? incomeCategories : expenseCategories).map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Description *</label>
                                <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Enter description" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Amount (₹) *</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" min="0" step="0.01" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Date</label>
                                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!description || !amount} className={`px-6 py-2 rounded-lg text-white ${type === 'income' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} disabled:opacity-50`}>
                                Add {type === 'income' ? 'Income' : 'Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
