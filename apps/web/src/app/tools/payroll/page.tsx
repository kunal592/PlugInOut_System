'use client';

import { useState, useEffect } from 'react';
import { Plus, Users, DollarSign, Calendar, Download, Edit2, Trash2, Mail, FileText } from 'lucide-react';

interface Employee {
    id: string;
    name: string;
    email: string;
    designation: string;
    department: string;
    basicSalary: number;
    hra: number;
    da: number;
    otherAllowances: number;
    pf: number;
    tax: number;
    joinDate: string;
    bankAccount: string;
    status: 'active' | 'inactive';
}

interface Payslip {
    id: string;
    employeeId: string;
    month: string;
    basicSalary: number;
    hra: number;
    da: number;
    otherAllowances: number;
    grossSalary: number;
    pf: number;
    tax: number;
    otherDeductions: number;
    netSalary: number;
    status: 'pending' | 'processed' | 'paid';
    paidDate?: string;
}

export default function PayrollPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [activeTab, setActiveTab] = useState<'employees' | 'payroll' | 'payslips'>('employees');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        designation: '',
        department: '',
        basicSalary: '',
        hra: '',
        da: '',
        otherAllowances: '',
        pf: '',
        tax: '',
        bankAccount: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const demoEmployees: Employee[] = [
            { id: '1', name: 'Rahul Sharma', email: 'rahul@company.com', designation: 'Senior Developer', department: 'Engineering', basicSalary: 8000000, hra: 3200000, da: 800000, otherAllowances: 500000, pf: 960000, tax: 1200000, joinDate: '2024-01-15', bankAccount: 'HDFC****1234', status: 'active' },
            { id: '2', name: 'Priya Patel', email: 'priya@company.com', designation: 'Product Manager', department: 'Product', basicSalary: 10000000, hra: 4000000, da: 1000000, otherAllowances: 750000, pf: 1200000, tax: 1800000, joinDate: '2023-06-01', bankAccount: 'ICICI****5678', status: 'active' },
            { id: '3', name: 'Amit Kumar', email: 'amit@company.com', designation: 'Designer', department: 'Design', basicSalary: 6000000, hra: 2400000, da: 600000, otherAllowances: 300000, pf: 720000, tax: 800000, joinDate: '2024-03-10', bankAccount: 'SBI****9012', status: 'active' },
            { id: '4', name: 'Sneha Gupta', email: 'sneha@company.com', designation: 'HR Manager', department: 'Human Resources', basicSalary: 7000000, hra: 2800000, da: 700000, otherAllowances: 400000, pf: 840000, tax: 1000000, joinDate: '2023-08-20', bankAccount: 'AXIS****3456', status: 'active' },
        ];

        const demoPayslips: Payslip[] = demoEmployees.map(emp => ({
            id: `ps-${emp.id}-202601`,
            employeeId: emp.id,
            month: '2026-01',
            basicSalary: emp.basicSalary,
            hra: emp.hra,
            da: emp.da,
            otherAllowances: emp.otherAllowances,
            grossSalary: emp.basicSalary + emp.hra + emp.da + emp.otherAllowances,
            pf: emp.pf,
            tax: emp.tax,
            otherDeductions: 0,
            netSalary: emp.basicSalary + emp.hra + emp.da + emp.otherAllowances - emp.pf - emp.tax,
            status: 'pending'
        }));

        setEmployees(demoEmployees);
        setPayslips(demoPayslips);
        setLoading(false);
    };

    const formatCurrency = (amount: number) => `₹${(amount / 100).toLocaleString('en-IN')}`;

    const handleSubmit = () => {
        const newEmployee: Employee = {
            id: editingEmployee?.id || Date.now().toString(),
            name: formData.name,
            email: formData.email,
            designation: formData.designation,
            department: formData.department,
            basicSalary: Math.round(parseFloat(formData.basicSalary) * 100),
            hra: Math.round(parseFloat(formData.hra || '0') * 100),
            da: Math.round(parseFloat(formData.da || '0') * 100),
            otherAllowances: Math.round(parseFloat(formData.otherAllowances || '0') * 100),
            pf: Math.round(parseFloat(formData.pf || '0') * 100),
            tax: Math.round(parseFloat(formData.tax || '0') * 100),
            bankAccount: formData.bankAccount,
            joinDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        if (editingEmployee) {
            setEmployees(employees.map(e => e.id === editingEmployee.id ? newEmployee : e));
        } else {
            setEmployees([...employees, newEmployee]);
        }
        resetForm();
    };

    const resetForm = () => {
        setShowModal(false);
        setEditingEmployee(null);
        setFormData({ name: '', email: '', designation: '', department: '', basicSalary: '', hra: '', da: '', otherAllowances: '', pf: '', tax: '', bankAccount: '' });
    };

    const editEmployee = (emp: Employee) => {
        setEditingEmployee(emp);
        setFormData({
            name: emp.name,
            email: emp.email,
            designation: emp.designation,
            department: emp.department,
            basicSalary: (emp.basicSalary / 100).toString(),
            hra: (emp.hra / 100).toString(),
            da: (emp.da / 100).toString(),
            otherAllowances: (emp.otherAllowances / 100).toString(),
            pf: (emp.pf / 100).toString(),
            tax: (emp.tax / 100).toString(),
            bankAccount: emp.bankAccount
        });
        setShowModal(true);
    };

    const processPayroll = () => {
        setPayslips(payslips.map(p => p.month === selectedMonth ? { ...p, status: 'processed' } : p));
    };

    const markAsPaid = (payslipId: string) => {
        setPayslips(payslips.map(p => p.id === payslipId ? { ...p, status: 'paid', paidDate: new Date().toISOString() } : p));
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            processed: 'bg-blue-100 text-blue-700',
            paid: 'bg-green-100 text-green-700'
        };
        return colors[status] || colors.pending;
    };

    const monthlyPayslips = payslips.filter(p => p.month === selectedMonth);
    const totalPayroll = monthlyPayslips.reduce((sum, p) => sum + p.netSalary, 0);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-pulse text-muted-foreground">Loading...</div></div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
                    <p className="text-muted-foreground">Manage employees and generate payslips</p>
                </div>
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Plus className="w-5 h-5" />
                    Add Employee
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
                            <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                            <p className="text-sm text-muted-foreground">Employees</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPayroll)}</p>
                            <p className="text-sm text-muted-foreground">Monthly Payroll</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{monthlyPayslips.filter(p => p.status === 'pending').length}</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{monthlyPayslips.filter(p => p.status === 'paid').length}</p>
                            <p className="text-sm text-muted-foreground">Paid</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-border">
                {(['employees', 'payroll', 'payslips'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors capitalize ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Employees Tab */}
            {activeTab === 'employees' && (
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Gross Salary</th>
                                <th className="text-left p-4 text-sm font-medium text-muted-foreground">Net Salary</th>
                                <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => {
                                const gross = emp.basicSalary + emp.hra + emp.da + emp.otherAllowances;
                                const net = gross - emp.pf - emp.tax;
                                return (
                                    <tr key={emp.id} className="border-t border-border hover:bg-secondary/20">
                                        <td className="p-4">
                                            <p className="font-medium text-foreground">{emp.name}</p>
                                            <p className="text-sm text-muted-foreground">{emp.designation}</p>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{emp.department}</td>
                                        <td className="p-4 text-muted-foreground">{formatCurrency(gross)}</td>
                                        <td className="p-4 font-semibold text-foreground">{formatCurrency(net)}</td>
                                        <td className="p-4">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => editEmployee(emp)} className="p-2 hover:bg-secondary rounded-lg">
                                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                                <button className="p-2 hover:bg-secondary rounded-lg">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                        />
                        <button onClick={processPayroll} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                            Process Payroll
                        </button>
                    </div>

                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-secondary/50">
                                <tr>
                                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">Employee</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Gross</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Deductions</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Net Pay</th>
                                    <th className="text-center p-4 text-sm font-medium text-muted-foreground">Status</th>
                                    <th className="text-right p-4 text-sm font-medium text-muted-foreground">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlyPayslips.map(ps => {
                                    const emp = employees.find(e => e.id === ps.employeeId);
                                    return (
                                        <tr key={ps.id} className="border-t border-border">
                                            <td className="p-4 font-medium text-foreground">{emp?.name}</td>
                                            <td className="p-4 text-right text-muted-foreground">{formatCurrency(ps.grossSalary)}</td>
                                            <td className="p-4 text-right text-red-500">-{formatCurrency(ps.pf + ps.tax)}</td>
                                            <td className="p-4 text-right font-semibold text-foreground">{formatCurrency(ps.netSalary)}</td>
                                            <td className="p-4 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ps.status)}`}>
                                                    {ps.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                {ps.status !== 'paid' && (
                                                    <button onClick={() => markAsPaid(ps.id)} className="text-sm text-primary hover:underline">
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Payslips Tab */}
            {activeTab === 'payslips' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {monthlyPayslips.map(ps => {
                        const emp = employees.find(e => e.id === ps.employeeId);
                        return (
                            <div key={ps.id} className="bg-card rounded-xl border border-border p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="font-semibold text-foreground">{emp?.name}</p>
                                        <p className="text-sm text-muted-foreground">{emp?.designation}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(ps.status)}`}>
                                        {ps.status}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Basic</span><span>{formatCurrency(ps.basicSalary)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">HRA</span><span>{formatCurrency(ps.hra)}</span></div>
                                    <div className="flex justify-between"><span className="text-muted-foreground">DA</span><span>{formatCurrency(ps.da)}</span></div>
                                    <div className="flex justify-between border-t border-border pt-2"><span className="text-muted-foreground">Gross</span><span className="font-medium">{formatCurrency(ps.grossSalary)}</span></div>
                                    <div className="flex justify-between text-red-500"><span>PF</span><span>-{formatCurrency(ps.pf)}</span></div>
                                    <div className="flex justify-between text-red-500"><span>Tax</span><span>-{formatCurrency(ps.tax)}</span></div>
                                    <div className="flex justify-between border-t border-border pt-2"><span className="font-semibold">Net Pay</span><span className="font-bold text-primary">{formatCurrency(ps.netSalary)}</span></div>
                                </div>
                                <button className="w-full mt-4 py-2 bg-secondary text-muted-foreground rounded-lg hover:text-foreground flex items-center justify-center gap-2">
                                    <Download className="w-4 h-4" /> Download PDF
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Employee Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-foreground">{editingEmployee ? 'Edit' : 'Add'} Employee</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Name *</label>
                                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Designation</label>
                                    <input type="text" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Department</label>
                                    <input type="text" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Basic Salary (₹)</label>
                                    <input type="number" value={formData.basicSalary} onChange={e => setFormData({ ...formData, basicSalary: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">HRA (₹)</label>
                                    <input type="number" value={formData.hra} onChange={e => setFormData({ ...formData, hra: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">DA (₹)</label>
                                    <input type="number" value={formData.da} onChange={e => setFormData({ ...formData, da: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Other Allowances (₹)</label>
                                    <input type="number" value={formData.otherAllowances} onChange={e => setFormData({ ...formData, otherAllowances: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">PF Deduction (₹)</label>
                                    <input type="number" value={formData.pf} onChange={e => setFormData({ ...formData, pf: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-foreground mb-1">Tax (₹)</label>
                                    <input type="number" value={formData.tax} onChange={e => setFormData({ ...formData, tax: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Bank Account</label>
                                <input type="text" value={formData.bankAccount} onChange={e => setFormData({ ...formData, bankAccount: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground" placeholder="Account number" />
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end gap-3">
                            <button onClick={resetForm} className="px-4 py-2 text-muted-foreground hover:bg-secondary rounded-lg">Cancel</button>
                            <button onClick={handleSubmit} disabled={!formData.name || !formData.email} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50">
                                {editingEmployee ? 'Update' : 'Add'} Employee
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
