'use client';

import { useState, useEffect } from 'react';
import { Plus, FileText, Truck, Package, Edit2, Trash2, Download, Send, CheckCircle, Clock, XCircle } from 'lucide-react';

interface PurchaseOrderItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

interface PurchaseOrder {
    id: string;
    poNumber: string;
    vendorName: string;
    vendorEmail: string;
    vendorAddress: string;
    items: PurchaseOrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
    orderDate: string;
    expectedDelivery: string;
    notes?: string;
}

export default function PurchaseOrderPage() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPO, setEditingPO] = useState<PurchaseOrder | null>(null);
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [vendorName, setVendorName] = useState('');
    const [vendorEmail, setVendorEmail] = useState('');
    const [vendorAddress, setVendorAddress] = useState('');
    const [expectedDelivery, setExpectedDelivery] = useState('');
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<PurchaseOrderItem[]>([
        { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
    ]);
    const [taxRate, setTaxRate] = useState(18);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const demo: PurchaseOrder[] = [
            {
                id: '1',
                poNumber: 'PO-2026-001',
                vendorName: 'Tech Supplies Ltd',
                vendorEmail: 'sales@techsupplies.com',
                vendorAddress: '45 Industrial Area, Mumbai 400001',
                items: [
                    { id: '1', description: 'MacBook Pro 14"', quantity: 5, unitPrice: 19900000, total: 99500000 },
                    { id: '2', description: 'Dell Monitor 27"', quantity: 5, unitPrice: 3500000, total: 17500000 }
                ],
                subtotal: 117000000,
                tax: 21060000,
                total: 138060000,
                status: 'confirmed',
                orderDate: '2026-01-05',
                expectedDelivery: '2026-01-20'
            },
            {
                id: '2',
                poNumber: 'PO-2026-002',
                vendorName: 'Office Essentials',
                vendorEmail: 'orders@officeess.com',
                vendorAddress: '12 Market Street, Delhi 110001',
                items: [
                    { id: '1', description: 'Office Chairs', quantity: 20, unitPrice: 850000, total: 17000000 },
                    { id: '2', description: 'Standing Desks', quantity: 10, unitPrice: 1500000, total: 15000000 }
                ],
                subtotal: 32000000,
                tax: 5760000,
                total: 37760000,
                status: 'received',
                orderDate: '2025-12-20',
                expectedDelivery: '2026-01-10'
            },
            {
                id: '3',
                poNumber: 'PO-2026-003',
                vendorName: 'Cloud Services Inc',
                vendorEmail: 'billing@cloudservices.io',
                vendorAddress: 'Virtual Address, Bangalore 560001',
                items: [
                    { id: '1', description: 'AWS Credits (1 Year)', quantity: 1, unitPrice: 50000000, total: 50000000 }
                ],
                subtotal: 50000000,
                tax: 9000000,
                total: 59000000,
                status: 'sent',
                orderDate: '2026-01-15',
                expectedDelivery: '2026-01-16'
            },
            {
                id: '4',
                poNumber: 'PO-2026-004',
                vendorName: 'Stationery World',
                vendorEmail: 'sales@stationeryworld.in',
                vendorAddress: '78 MG Road, Pune 411001',
                items: [
                    { id: '1', description: 'Paper Reams (A4)', quantity: 100, unitPrice: 35000, total: 3500000 },
                    { id: '2', description: 'Printer Ink Cartridges', quantity: 20, unitPrice: 120000, total: 2400000 }
                ],
                subtotal: 5900000,
                tax: 1062000,
                total: 6962000,
                status: 'draft',
                orderDate: '2026-01-18',
                expectedDelivery: '2026-01-25'
            }
        ];
        setOrders(demo);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const generatePONumber = () => {
        const year = new Date().getFullYear();
        const num = orders.length + 1;
        return `PO-${year}-${String(num).padStart(3, '0')}`;
    };

    const calculateTotals = () => {
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const tax = Math.round((subtotal * taxRate) / 100);
        return { subtotal, tax, total: subtotal + tax };
    };

    const updateItem = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
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
        setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = () => {
        const { subtotal, tax, total } = calculateTotals();
        const newPO: PurchaseOrder = {
            id: editingPO?.id || Date.now().toString(),
            poNumber: editingPO?.poNumber || generatePONumber(),
            vendorName,
            vendorEmail,
            vendorAddress,
            items: items.map(item => ({ ...item, total: item.quantity * item.unitPrice })),
            subtotal,
            tax,
            total,
            status: 'draft',
            orderDate: new Date().toISOString().split('T')[0],
            expectedDelivery,
            notes
        };

        if (editingPO) {
            setOrders(orders.map(o => o.id === editingPO.id ? { ...newPO, status: editingPO.status } : o));
        } else {
            setOrders([newPO, ...orders]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingPO(null);
        setVendorName('');
        setVendorEmail('');
        setVendorAddress('');
        setExpectedDelivery('');
        setNotes('');
        setItems([{ id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }]);
        setTaxRate(18);
    };

    const editPO = (po: PurchaseOrder) => {
        setEditingPO(po);
        setVendorName(po.vendorName);
        setVendorEmail(po.vendorEmail);
        setVendorAddress(po.vendorAddress);
        setExpectedDelivery(po.expectedDelivery);
        setNotes(po.notes || '');
        setItems(po.items);
        setShowModal(true);
    };

    const updateStatus = (id: string, status: PurchaseOrder['status']) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    };

    const deletePO = (id: string) => {
        if (confirm('Delete this purchase order?')) {
            setOrders(orders.filter(o => o.id !== id));
        }
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, JSX.Element> = {
            draft: <FileText className="w-4 h-4" />,
            sent: <Send className="w-4 h-4" />,
            confirmed: <CheckCircle className="w-4 h-4" />,
            received: <Package className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />
        };
        return icons[status] || icons.draft;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-700',
            sent: 'bg-blue-100 text-blue-700',
            confirmed: 'bg-green-100 text-green-700',
            received: 'bg-purple-100 text-purple-700',
            cancelled: 'bg-red-100 text-red-700'
        };
        return colors[status] || colors.draft;
    };

    const filteredOrders = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);
    const totalValue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0);
    const pendingValue = orders.filter(o => ['sent', 'confirmed'].includes(o.status)).reduce((sum, o) => sum + o.total, 0);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Purchase Orders</h1>
                    <p className="text-muted-foreground">Create and manage purchase orders for vendors</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    New PO
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{orders.filter(o => ['sent', 'confirmed'].includes(o.status)).length}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(pendingValue)}</p>
                            <p className="text-sm text-muted-foreground">Pending Value</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
                            <p className="text-sm text-muted-foreground">Total Value</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'draft', 'sent', 'confirmed', 'received', 'cancelled'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${filterStatus === status ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <table className="w-full">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">PO Number</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Vendor</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Date</th>
                            <th className="text-left p-4 text-sm font-medium text-muted-foreground">Delivery</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Amount</th>
                            <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                            <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map(po => (
                            <tr key={po.id} className="border-t border-border hover:bg-secondary/20">
                                <td className="p-4 font-mono font-medium text-foreground">{po.poNumber}</td>
                                <td className="p-4">
                                    <p className="font-medium text-foreground">{po.vendorName}</p>
                                    <p className="text-sm text-muted-foreground">{po.vendorEmail}</p>
                                </td>
                                <td className="p-4 text-muted-foreground">{new Date(po.orderDate).toLocaleDateString()}</td>
                                <td className="p-4 text-muted-foreground">{new Date(po.expectedDelivery).toLocaleDateString()}</td>
                                <td className="p-4 text-right font-semibold text-foreground">{formatCurrency(po.total)}</td>
                                <td className="p-4">
                                    <div className="flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${getStatusColor(po.status)}`}>
                                            {getStatusIcon(po.status)}
                                            {po.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex justify-end gap-1">
                                        {po.status === 'draft' && (
                                            <button onClick={() => updateStatus(po.id, 'sent')} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Send</button>
                                        )}
                                        {po.status === 'sent' && (
                                            <button onClick={() => updateStatus(po.id, 'confirmed')} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Confirm</button>
                                        )}
                                        {po.status === 'confirmed' && (
                                            <button onClick={() => updateStatus(po.id, 'received')} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">Receive</button>
                                        )}
                                        <button onClick={() => editPO(po)} className="p-1 hover:bg-secondary rounded">
                                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button className="p-1 hover:bg-secondary rounded">
                                            <Download className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                        <button onClick={() => deletePO(po.id)} className="p-1 hover:bg-destructive/10 rounded">
                                            <Trash2 className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">{editingPO ? 'Edit Purchase Order' : 'New Purchase Order'}</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {/* Vendor Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Vendor Name *</label>
                                    <input type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Vendor Email</label>
                                    <input type="email" value={vendorEmail} onChange={e => setVendorEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Vendor Address</label>
                                <input type="text" value={vendorAddress} onChange={e => setVendorAddress(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Expected Delivery *</label>
                                    <input type="date" value={expectedDelivery} onChange={e => setExpectedDelivery(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Tax Rate (%)</label>
                                    <select value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground">
                                        <option value={0}>0%</option>
                                        <option value={5}>5%</option>
                                        <option value={12}>12%</option>
                                        <option value={18}>18%</option>
                                        <option value={28}>28%</option>
                                    </select>
                                </div>
                            </div>

                            {/* Line Items */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-medium text-foreground">Line Items</label>
                                    <button onClick={addItem} className="text-sm text-primary hover:underline">+ Add Item</button>
                                </div>
                                <div className="space-y-2">
                                    {items.map((item, index) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                            <input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} placeholder="Description" className="col-span-5 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" />
                                            <input type="number" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} placeholder="Qty" className="col-span-2 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" min="1" />
                                            <input type="number" value={item.unitPrice ? item.unitPrice / 100 : ''} onChange={e => updateItem(index, 'unitPrice', Math.round(parseFloat(e.target.value || '0') * 100))} placeholder="Price" className="col-span-2 px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm" min="0" step="0.01" />
                                            <div className="col-span-2 text-right font-medium text-foreground text-sm">{formatCurrency(item.quantity * item.unitPrice)}</div>
                                            <button onClick={() => removeItem(index)} className="col-span-1 p-2 text-destructive hover:bg-destructive/10 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 space-y-2 bg-secondary/30 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-medium">{formatCurrency(calculateTotals().subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Tax ({taxRate}%)</span>
                                        <span className="font-medium">{formatCurrency(calculateTotals().tax)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold">Total</span>
                                        <span className="text-xl font-bold text-primary">{formatCurrency(calculateTotals().total)}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Notes</label>
                                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground resize-none" rows={2} />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!vendorName || !expectedDelivery || !items.some(i => i.description)} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                {editingPO ? 'Update' : 'Create'} PO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
