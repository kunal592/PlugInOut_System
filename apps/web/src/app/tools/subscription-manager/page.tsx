'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, CreditCard, Calendar, AlertCircle, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';

interface Subscription {
    id: string;
    customerName: string;
    customerEmail: string;
    planName: string;
    amount: number;
    billingCycle: 'monthly' | 'quarterly' | 'yearly';
    status: 'active' | 'paused' | 'cancelled' | 'past_due';
    startDate: string;
    nextBillingDate: string;
    lastPaymentDate?: string;
}

const plans = [
    { name: 'Basic', monthly: 99900, quarterly: 269900, yearly: 999900 },
    { name: 'Pro', monthly: 299900, quarterly: 809900, yearly: 2999900 },
    { name: 'Enterprise', monthly: 999900, quarterly: 2699900, yearly: 9999900 },
];

export default function SubscriptionManagerPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSub, setEditingSub] = useState<Subscription | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [planName, setPlanName] = useState(plans[0].name);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = () => {
        const demo: Subscription[] = [
            { id: '1', customerName: 'TechCorp Solutions', customerEmail: 'billing@techcorp.com', planName: 'Pro', amount: 299900, billingCycle: 'monthly', status: 'active', startDate: '2025-06-15', nextBillingDate: '2026-02-15', lastPaymentDate: '2026-01-15' },
            { id: '2', customerName: 'StartUp Inc', customerEmail: 'finance@startup.io', planName: 'Basic', amount: 99900, billingCycle: 'monthly', status: 'active', startDate: '2025-09-01', nextBillingDate: '2026-02-01', lastPaymentDate: '2026-01-01' },
            { id: '3', customerName: 'Global Enterprises', customerEmail: 'accounts@global.com', planName: 'Enterprise', amount: 9999900, billingCycle: 'yearly', status: 'active', startDate: '2025-04-10', nextBillingDate: '2026-04-10', lastPaymentDate: '2025-04-10' },
            { id: '4', customerName: 'Small Biz Ltd', customerEmail: 'owner@smallbiz.com', planName: 'Basic', amount: 269900, billingCycle: 'quarterly', status: 'past_due', startDate: '2025-08-01', nextBillingDate: '2026-01-01' },
            { id: '5', customerName: 'Freelancer Pro', customerEmail: 'john@freelancer.dev', planName: 'Pro', amount: 299900, billingCycle: 'monthly', status: 'paused', startDate: '2025-11-20', nextBillingDate: '2026-02-20', lastPaymentDate: '2025-12-20' },
            { id: '6', customerName: 'Old Customer Co', customerEmail: 'info@oldcustomer.com', planName: 'Basic', amount: 99900, billingCycle: 'monthly', status: 'cancelled', startDate: '2024-06-01', nextBillingDate: '2025-12-01' },
        ];
        setSubscriptions(demo);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const getAmount = (plan: string, cycle: 'monthly' | 'quarterly' | 'yearly') => {
        const p = plans.find(pl => pl.name === plan);
        return p ? p[cycle] : 0;
    };

    const calculateNextBillingDate = (start: string, cycle: 'monthly' | 'quarterly' | 'yearly') => {
        const date = new Date(start);
        if (cycle === 'monthly') date.setMonth(date.getMonth() + 1);
        else if (cycle === 'quarterly') date.setMonth(date.getMonth() + 3);
        else date.setFullYear(date.getFullYear() + 1);
        return date.toISOString().split('T')[0];
    };

    const handleSubmit = () => {
        const amount = getAmount(planName, billingCycle);
        const newSub: Subscription = {
            id: editingSub?.id || Date.now().toString(),
            customerName,
            customerEmail,
            planName,
            amount,
            billingCycle,
            status: 'active',
            startDate,
            nextBillingDate: calculateNextBillingDate(startDate, billingCycle)
        };

        if (editingSub) {
            setSubscriptions(subscriptions.map(s => s.id === editingSub.id ? newSub : s));
        } else {
            setSubscriptions([newSub, ...subscriptions]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingSub(null);
        setCustomerName('');
        setCustomerEmail('');
        setPlanName(plans[0].name);
        setBillingCycle('monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
    };

    const updateStatus = (id: string, status: Subscription['status']) => {
        setSubscriptions(subscriptions.map(s => s.id === id ? { ...s, status } : s));
    };

    const deleteSub = (id: string) => {
        if (confirm('Delete this subscription?')) {
            setSubscriptions(subscriptions.filter(s => s.id !== id));
        }
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            active: <CheckCircle className="w-4 h-4 text-green-500" />,
            paused: <AlertCircle className="w-4 h-4 text-yellow-500" />,
            cancelled: <XCircle className="w-4 h-4 text-gray-500" />,
            past_due: <AlertCircle className="w-4 h-4 text-red-500" />
        };
        return icons[status];
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            active: 'bg-green-100 text-green-700',
            paused: 'bg-yellow-100 text-yellow-700',
            cancelled: 'bg-gray-100 text-gray-700',
            past_due: 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.active;
    };

    const filteredSubs = subscriptions.filter(s => filterStatus === 'all' || s.status === filterStatus);
    const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
        if (s.billingCycle === 'monthly') return sum + s.amount;
        if (s.billingCycle === 'quarterly') return sum + (s.amount / 3);
        return sum + (s.amount / 12);
    }, 0);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Subscription Manager</h1>
                    <p className="text-muted-foreground">Manage customer subscriptions and billing</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    New Subscription
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{subscriptions.length}</p>
                            <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{subscriptions.filter(s => s.status === 'active').length}</p>
                            <p className="text-sm text-muted-foreground">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(Math.round(mrr))}</p>
                            <p className="text-sm text-muted-foreground">MRR</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{subscriptions.filter(s => s.status === 'past_due').length}</p>
                            <p className="text-sm text-muted-foreground">Past Due</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'active', 'paused', 'past_due', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filterStatus === status
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Subscription List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Customer</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Plan</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Billing</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Next Billing</th>
                            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubs.map(sub => (
                            <tr key={sub.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4">
                                    <p className="font-medium text-foreground">{sub.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{sub.customerEmail}</p>
                                </td>
                                <td className="p-4">
                                    <p className="font-medium text-foreground">{sub.planName}</p>
                                    <p className="text-sm text-primary">{formatCurrency(sub.amount)}</p>
                                </td>
                                <td className="p-4 text-muted-foreground capitalize">{sub.billingCycle}</td>
                                <td className="p-4 text-muted-foreground">{new Date(sub.nextBillingDate).toLocaleDateString()}</td>
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${getStatusColor(sub.status)}`}>
                                            {getStatusIcon(sub.status)}
                                            {sub.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-1">
                                        {sub.status === 'active' && (
                                            <button onClick={() => updateStatus(sub.id, 'paused')} className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200">Pause</button>
                                        )}
                                        {sub.status === 'paused' && (
                                            <button onClick={() => updateStatus(sub.id, 'active')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Resume</button>
                                        )}
                                        {sub.status !== 'cancelled' && (
                                            <button onClick={() => updateStatus(sub.id, 'cancelled')} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Cancel</button>
                                        )}
                                        <button onClick={() => deleteSub(sub.id)} className="p-1 hover:bg-destructive/10 rounded">
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
                            <h2 className="text-xl font-bold text-foreground">New Subscription</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Customer Name *</label>
                                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                                <input type="email" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Plan</label>
                                <select value={planName} onChange={e => setPlanName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                    {plans.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Billing Cycle</label>
                                <select value={billingCycle} onChange={e => setBillingCycle(e.target.value as any)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Amount</span>
                                    <span className="font-bold text-primary">{formatCurrency(getAmount(planName, billingCycle))}/{billingCycle}</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!customerName || !customerEmail} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                Create Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
