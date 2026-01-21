'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Download, Trash2, Eye, Send } from 'lucide-react';

interface InvoiceItem {
    id?: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface Invoice {
    id: string;
    clientName: string;
    clientEmail?: string;
    amount: number;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
    dueDate: string;
    createdAt: string;
    items: InvoiceItem[];
}

export default function InvoiceToolPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

    // Form state
    const [clientName, setClientName] = useState('');
    const [clientEmail, setClientEmail] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            // Simulated data for demo
            const demoInvoices: Invoice[] = [
                {
                    id: '1',
                    clientName: 'Acme Corp',
                    clientEmail: 'billing@acme.com',
                    amount: 150000,
                    status: 'PAID',
                    dueDate: '2026-02-15',
                    createdAt: '2026-01-10',
                    items: [
                        { description: 'Web Development', quantity: 1, unitPrice: 100000, total: 100000 },
                        { description: 'Maintenance', quantity: 5, unitPrice: 10000, total: 50000 }
                    ]
                },
                {
                    id: '2',
                    clientName: 'Tech Solutions',
                    clientEmail: 'accounts@techsol.com',
                    amount: 75000,
                    status: 'SENT',
                    dueDate: '2026-02-01',
                    createdAt: '2026-01-15',
                    items: [
                        { description: 'Consulting', quantity: 10, unitPrice: 7500, total: 75000 }
                    ]
                },
                {
                    id: '3',
                    clientName: 'StartupXYZ',
                    clientEmail: 'finance@startupxyz.io',
                    amount: 45000,
                    status: 'DRAFT',
                    dueDate: '2026-02-20',
                    createdAt: '2026-01-18',
                    items: [
                        { description: 'UI/UX Design', quantity: 1, unitPrice: 45000, total: 45000 }
                    ]
                }
            ];
            setInvoices(demoInvoices);
        } catch (error) {
            console.error('Failed to fetch invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    };

    const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
        const newItems = [...items];
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index][field] = Number(value);
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        } else {
            (newItems[index] as any)[field] = value;
        }
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        const newInvoice: Invoice = {
            id: Date.now().toString(),
            clientName,
            clientEmail,
            amount: calculateTotal(),
            status: 'DRAFT',
            dueDate,
            createdAt: new Date().toISOString(),
            items: items.map(item => ({
                ...item,
                total: item.quantity * item.unitPrice
            }))
        };

        if (editingInvoice) {
            setInvoices(invoices.map(inv => inv.id === editingInvoice.id ? { ...newInvoice, id: editingInvoice.id } : inv));
        } else {
            setInvoices([newInvoice, ...invoices]);
        }

        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingInvoice(null);
        setClientName('');
        setClientEmail('');
        setDueDate('');
        setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const editInvoice = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setClientName(invoice.clientName);
        setClientEmail(invoice.clientEmail || '');
        setDueDate(invoice.dueDate);
        setItems(invoice.items);
        setShowModal(true);
    };

    const deleteInvoice = (id: string) => {
        if (confirm('Are you sure you want to delete this invoice?')) {
            setInvoices(invoices.filter(inv => inv.id !== id));
        }
    };

    const updateStatus = (id: string, status: Invoice['status']) => {
        setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status } : inv));
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-700',
            SENT: 'bg-blue-100 text-blue-700',
            PAID: 'bg-green-100 text-green-700',
            OVERDUE: 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.DRAFT;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading invoices...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invoice Generator</h1>
                    <p className="text-muted-foreground">Create and manage professional invoices</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Invoice
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Invoices', value: invoices.length, color: 'bg-blue-500' },
                    { label: 'Paid', value: invoices.filter(i => i.status === 'PAID').length, color: 'bg-green-500' },
                    { label: 'Pending', value: invoices.filter(i => i.status === 'SENT').length, color: 'bg-yellow-500' },
                    { label: 'Total Value', value: formatCurrency(invoices.reduce((s, i) => s + i.amount, 0)), color: 'bg-purple-500' }
                ].map((stat) => (
                    <div key={stat.label} className="bg-card rounded-xl p-4 border border-border">
                        <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Invoice List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Client</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Due Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4">
                                    <p className="font-medium text-foreground">{invoice.clientName}</p>
                                    <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(invoice.createdAt).toLocaleDateString()}
                                </td>
                                <td className="p-4 text-muted-foreground">
                                    {new Date(invoice.dueDate).toLocaleDateString()}
                                </td>
                                <td className="p-4 font-semibold text-foreground">
                                    {formatCurrency(invoice.amount)}
                                </td>
                                <td className="p-4">
                                    <select
                                        value={invoice.status}
                                        onChange={(e) => updateStatus(invoice.id, e.target.value as Invoice['status'])}
                                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(invoice.status)}`}
                                    >
                                        <option value="DRAFT">Draft</option>
                                        <option value="SENT">Sent</option>
                                        <option value="PAID">Paid</option>
                                        <option value="OVERDUE">Overdue</option>
                                    </select>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => editInvoice(invoice)}
                                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Eye className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button
                                            className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                            title="Download PDF"
                                        >
                                            <Download className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button
                                            onClick={() => deleteInvoice(invoice.id)}
                                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {invoices.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                    No invoices yet. Create your first invoice!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">
                                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
                            </h2>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Client Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Client Name *</label>
                                    <input
                                        type="text"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-2">Client Email</label>
                                    <input
                                        type="email"
                                        value={clientEmail}
                                        onChange={(e) => setClientEmail(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                        placeholder="client@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Due Date *</label>
                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                />
                            </div>

                            {/* Line Items */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="text-sm font-medium text-foreground">Line Items</label>
                                    <button
                                        onClick={addItem}
                                        className="text-sm text-primary hover:underline"
                                    >
                                        + Add Item
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                            <input
                                                type="text"
                                                value={item.description}
                                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                placeholder="Description"
                                                className="col-span-5 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                            />
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                placeholder="Qty"
                                                className="col-span-2 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                                min="1"
                                            />
                                            <input
                                                type="number"
                                                value={item.unitPrice}
                                                onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                                placeholder="Price"
                                                className="col-span-2 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm"
                                                min="0"
                                            />
                                            <div className="col-span-2 text-right font-medium text-foreground">
                                                ₹{(item.quantity * item.unitPrice / 100).toFixed(2)}
                                            </div>
                                            <button
                                                onClick={() => removeItem(index)}
                                                className="col-span-1 p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground">Total Amount</p>
                                        <p className="text-2xl font-bold text-foreground">
                                            {formatCurrency(calculateTotal())}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!clientName || !dueDate}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
