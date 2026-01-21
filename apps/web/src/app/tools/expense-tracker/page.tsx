'use client';

import { useState, useEffect } from 'react';
import { Plus, Receipt, Trash2, Edit2, Filter, TrendingUp, TrendingDown } from 'lucide-react';

interface Expense {
    id: string;
    description: string;
    amount: number;
    category: string;
    date: string;
    paymentMethod: string;
    notes?: string;
}

const categories = [
    'Food & Dining', 'Transportation', 'Utilities', 'Office Supplies',
    'Software & Tools', 'Marketing', 'Travel', 'Salary', 'Other'
];

const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'UPI'];

export default function ExpenseTrackerPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterMonth, setFilterMonth] = useState('');

    // Form state
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState(categories[0]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        try {
            const demoExpenses: Expense[] = [
                { id: '1', description: 'Office Rent', amount: 2500000, category: 'Utilities', date: '2026-01-01', paymentMethod: 'Bank Transfer' },
                { id: '2', description: 'AWS Hosting', amount: 15000, category: 'Software & Tools', date: '2026-01-05', paymentMethod: 'Credit Card' },
                { id: '3', description: 'Team Lunch', amount: 350000, category: 'Food & Dining', date: '2026-01-10', paymentMethod: 'UPI' },
                { id: '4', description: 'Figma Subscription', amount: 4500, category: 'Software & Tools', date: '2026-01-12', paymentMethod: 'Credit Card' },
                { id: '5', description: 'Client Meeting Travel', amount: 125000, category: 'Travel', date: '2026-01-15', paymentMethod: 'Debit Card' },
                { id: '6', description: 'Google Ads', amount: 500000, category: 'Marketing', date: '2026-01-18', paymentMethod: 'Credit Card' },
            ];
            setExpenses(demoExpenses);
        } catch (error) {
            console.error('Failed to fetch expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = () => {
        const newExpense: Expense = {
            id: editingExpense?.id || Date.now().toString(),
            description,
            amount: Math.round(parseFloat(amount) * 100),
            category,
            date,
            paymentMethod,
            notes
        };

        if (editingExpense) {
            setExpenses(expenses.map(exp => exp.id === editingExpense.id ? newExpense : exp));
        } else {
            setExpenses([newExpense, ...expenses]);
        }

        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingExpense(null);
        setDescription('');
        setAmount('');
        setCategory(categories[0]);
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod(paymentMethods[0]);
        setNotes('');
    };

    const editExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setDescription(expense.description);
        setAmount((expense.amount / 100).toString());
        setCategory(expense.category);
        setDate(expense.date);
        setPaymentMethod(expense.paymentMethod);
        setNotes(expense.notes || '');
        setShowModal(true);
    };

    const deleteExpense = (id: string) => {
        if (confirm('Delete this expense?')) {
            setExpenses(expenses.filter(exp => exp.id !== id));
        }
    };

    const filteredExpenses = expenses.filter(exp => {
        if (filterCategory !== 'all' && exp.category !== filterCategory) return false;
        if (filterMonth && !exp.date.startsWith(filterMonth)) return false;
        return true;
    });

    const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading expenses...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Expense Tracker</h1>
                    <p className="text-muted-foreground">Track and categorize your business expenses</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Total Expenses</span>
                        <TrendingDown className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(totalExpenses)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{filteredExpenses.length} transactions</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">This Month</span>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                        {formatCurrency(expenses.filter(e => e.date.startsWith('2026-01')).reduce((s, e) => s + e.amount, 0))}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">January 2026</p>
                </div>
                <div className="bg-card rounded-xl p-6 border border-border">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Avg per Transaction</span>
                        <Receipt className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold text-foreground">
                        {filteredExpenses.length ? formatCurrency(Math.round(totalExpenses / filteredExpenses.length)) : '₹0'}
                    </p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([cat, amount]) => (
                        <div key={cat} className="bg-secondary/30 rounded-lg p-3">
                            <p className="text-sm text-muted-foreground">{cat}</p>
                            <p className="text-lg font-semibold text-foreground">{formatCurrency(amount)}</p>
                            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full"
                                    style={{ width: `${(amount / totalExpenses) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="month"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                />
            </div>

            {/* Expense List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Description</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Category</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Payment</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((expense) => (
                            <tr key={expense.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4 font-medium text-foreground">{expense.description}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-muted-foreground">{expense.paymentMethod}</td>
                                <td className="p-4 text-right font-semibold text-red-600">
                                    -{formatCurrency(expense.amount)}
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => editExpense(expense)} className="p-2 hover:bg-secondary rounded-lg">
                                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button onClick={() => deleteExpense(expense.id)} className="p-2 hover:bg-destructive/10 rounded-lg">
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
                            <h2 className="text-xl font-bold text-foreground">
                                {editingExpense ? 'Edit Expense' : 'Add Expense'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Description *</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                    placeholder="What did you spend on?"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Payment Method</label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                    >
                                        {paymentMethods.map(pm => (
                                            <option key={pm} value={pm}>{pm}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none"
                                    rows={2}
                                    placeholder="Additional notes..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!description || !amount}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                            >
                                {editingExpense ? 'Update' : 'Add Expense'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
