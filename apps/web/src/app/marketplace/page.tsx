'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, PieChart, Calculator, Users, Repeat, BarChart2, Activity, Clipboard, CheckSquare, Clock, UserCheck, FolderKanban, Target, FileEdit } from 'lucide-react';

interface Tool {
    slug: string;
    name: string;
    description: string;
    price: number;
    pricingType: string;
    icon: string;
    category: string;
}

// All 14 tools - 8 Finance + 6 Productivity
const allTools: Tool[] = [
    // Finance Tools
    { slug: 'invoice', name: 'Invoice Generator', description: 'Create, manage, and track professional invoices with line items, status tracking, and client management.', price: 19900, pricingType: 'ONE_TIME', icon: 'file-text', category: 'finance' },
    { slug: 'expense-tracker', name: 'Expense Tracker', description: 'Track business expenses by category, payment method, and generate spending analytics.', price: 14900, pricingType: 'ONE_TIME', icon: 'pie-chart', category: 'finance' },
    { slug: 'gst-calculator', name: 'GST Calculator', description: 'Calculate GST with inclusive/exclusive modes, CGST/SGST/IGST breakdown and rate guide.', price: 0, pricingType: 'FREE', icon: 'calculator', category: 'finance' },
    { slug: 'payroll', name: 'Payroll Management', description: 'Manage employee salaries, generate payslips, and track payment status with detailed components.', price: 29900, pricingType: 'ONE_TIME', icon: 'users', category: 'finance' },
    { slug: 'subscription-manager', name: 'Subscription Billing', description: 'Manage customer subscriptions, billing cycles, and track MRR with status management.', price: 24900, pricingType: 'SUBSCRIPTION', icon: 'repeat', category: 'finance' },
    { slug: 'profit-loss', name: 'Profit & Loss Report', description: 'Track income and expenses, calculate net profit, and analyze profitability by category.', price: 19900, pricingType: 'ONE_TIME', icon: 'bar-chart-2', category: 'finance' },
    { slug: 'cash-flow', name: 'Cash Flow Tracker', description: 'Monitor cash inflows and outflows, track recurring entries, and project future balances.', price: 19900, pricingType: 'ONE_TIME', icon: 'activity', category: 'finance' },
    { slug: 'purchase-order', name: 'Purchase Orders', description: 'Create and manage purchase orders with vendors, line items, and status workflow.', price: 24900, pricingType: 'ONE_TIME', icon: 'clipboard', category: 'finance' },
    // Productivity Tools
    { slug: 'task-manager', name: 'Task Manager', description: 'Create, organize, and track tasks with priorities, due dates, tags, and status management.', price: 14900, pricingType: 'ONE_TIME', icon: 'check-square', category: 'productivity' },
    { slug: 'time-tracker', name: 'Time Tracker', description: 'Track work hours with live timers, manual entries, and generate daily/weekly summaries.', price: 9900, pricingType: 'ONE_TIME', icon: 'clock', category: 'productivity' },
    { slug: 'attendance', name: 'Attendance Tracker', description: 'Clock in/out, track attendance records, detect late arrivals, and generate monthly reports.', price: 19900, pricingType: 'SUBSCRIPTION', icon: 'user-check', category: 'hr' },
    { slug: 'project-lite', name: 'Project Management Lite', description: 'Manage projects with milestones, task grouping, team members, and progress tracking.', price: 29900, pricingType: 'ONE_TIME', icon: 'folder-kanban', category: 'productivity' },
    { slug: 'okr-tracker', name: 'OKR / Goal Tracker', description: 'Set objectives, define key results, track progress with check-ins, and manage quarterly goals.', price: 24900, pricingType: 'ONE_TIME', icon: 'target', category: 'productivity' },
    { slug: 'meeting-notes', name: 'Meeting Notes', description: 'Capture meeting notes, track attendees, organize with tags, and manage action items.', price: 0, pricingType: 'FREE', icon: 'file-edit', category: 'productivity' },
];

const iconComponents: Record<string, React.ReactNode> = {
    'file-text': <FileText className="w-8 h-8" />,
    'pie-chart': <PieChart className="w-8 h-8" />,
    'calculator': <Calculator className="w-8 h-8" />,
    'users': <Users className="w-8 h-8" />,
    'repeat': <Repeat className="w-8 h-8" />,
    'bar-chart-2': <BarChart2 className="w-8 h-8" />,
    'activity': <Activity className="w-8 h-8" />,
    'clipboard': <Clipboard className="w-8 h-8" />,
    'check-square': <CheckSquare className="w-8 h-8" />,
    'clock': <Clock className="w-8 h-8" />,
    'user-check': <UserCheck className="w-8 h-8" />,
    'folder-kanban': <FolderKanban className="w-8 h-8" />,
    'target': <Target className="w-8 h-8" />,
    'file-edit': <FileEdit className="w-8 h-8" />,
};

const categories = ['all', 'finance', 'productivity', 'hr'];

export default function MarketplacePage() {
    const [tools, setTools] = useState<Tool[]>(allTools);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const formatPrice = (price: number, type: string) => {
        if (price === 0) return 'Free';
        const amount = `₹${(price / 100).toLocaleString('en-IN')}`;
        return type === 'SUBSCRIPTION' ? `${amount}/mo` : amount;
    };

    const filteredTools = tools.filter(tool => {
        const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
        const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            finance: 'bg-blue-500',
            productivity: 'bg-purple-500',
            hr: 'bg-green-500',
        };
        return colors[category] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-pulse text-muted-foreground">Loading marketplace...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-3">
                    🛒 Tool Marketplace
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Discover powerful business tools to supercharge your workflow. Pay once, use forever.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-xl p-4 border border-blue-500/20 text-center">
                    <p className="text-3xl font-bold text-blue-600">8</p>
                    <p className="text-sm text-muted-foreground">Finance Tools</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-xl p-4 border border-purple-500/20 text-center">
                    <p className="text-3xl font-bold text-purple-600">5</p>
                    <p className="text-sm text-muted-foreground">Productivity Tools</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-xl p-4 border border-green-500/20 text-center">
                    <p className="text-3xl font-bold text-green-600">1</p>
                    <p className="text-sm text-muted-foreground">HR Tools</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 rounded-xl p-4 border border-orange-500/20 text-center">
                    <p className="text-3xl font-bold text-orange-600">2</p>
                    <p className="text-sm text-muted-foreground">Free Tools</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search tools..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-5 py-3 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${selectedCategory === category
                                ? 'bg-primary text-primary-foreground shadow-lg'
                                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                                }`}
                        >
                            {category === 'all' ? `All (${tools.length})` : category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tools Grid */}
            {filteredTools.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    No tools found matching your criteria.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredTools.map((tool) => (
                        <Link key={tool.slug} href={`/tools/${tool.slug}`} className="group">
                            <div className="bg-card rounded-2xl p-5 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-14 h-14 rounded-xl ${getCategoryColor(tool.category)} bg-opacity-10 flex items-center justify-center text-${tool.category === 'finance' ? 'blue' : tool.category === 'productivity' ? 'purple' : 'green'}-500`}>
                                        {iconComponents[tool.icon] || <FileText className="w-8 h-8" />}
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tool.pricingType === 'FREE'
                                        ? 'bg-green-500/10 text-green-600'
                                        : tool.pricingType === 'SUBSCRIPTION'
                                            ? 'bg-purple-500/10 text-purple-600'
                                            : 'bg-blue-500/10 text-blue-600'
                                        }`}>
                                        {tool.pricingType === 'SUBSCRIPTION' ? 'Monthly' : tool.pricingType === 'FREE' ? 'Free' : 'One-time'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                    {tool.name}
                                </h3>

                                <p className="text-muted-foreground text-sm mb-4 flex-1 line-clamp-2">
                                    {tool.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getCategoryColor(tool.category)} bg-opacity-10`}>
                                        {tool.category}
                                    </span>
                                    <span className="text-xl font-bold text-primary">
                                        {formatPrice(tool.price, tool.pricingType)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl p-8 text-center border border-primary/20">
                <h2 className="text-2xl font-bold text-foreground mb-2">Need a Custom Tool?</h2>
                <p className="text-muted-foreground mb-4">We can build custom tools tailored to your business needs.</p>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                    Contact Us
                </button>
            </div>
        </div>
    );
}
