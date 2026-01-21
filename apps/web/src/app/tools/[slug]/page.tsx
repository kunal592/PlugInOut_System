'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Tool {
    slug: string;
    name: string;
    description: string;
    version: string;
    price: number;
    pricingType: string;
    icon: string;
    category: string;
    routes: string;
    permissions: string[];
}

const iconMap: Record<string, string> = {
    'file-text': '📄',
    'pie-chart': '📊',
    'calculator': '🧮',
    'users': '👥',
    'repeat': '🔄',
    'bar-chart-2': '📈',
    'activity': '💹',
    'clipboard': '📋',
};

export default function ToolPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [tool, setTool] = useState<Tool | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tools/${slug}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTool(data.data);
                } else {
                    setError(data.error || 'Tool not found');
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch tool:', err);
                setError('Failed to load tool');
                setLoading(false);
            });
    }, [slug]);

    const formatPrice = (price: number) => {
        if (price === 0) return 'Free';
        return `₹${(price / 100).toFixed(0)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
                <div className="animate-pulse text-neutral-600 dark:text-neutral-400">Loading tool...</div>
            </div>
        );
    }

    if (error || !tool) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Tool Not Found</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-6">{error}</p>
                    <Link
                        href="/tools"
                        className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                        ← Back to Marketplace
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-12">
                {/* Back button */}
                <Link
                    href="/tools"
                    className="inline-flex items-center text-neutral-600 dark:text-neutral-400 hover:text-primary-600 mb-8 transition-colors"
                >
                    ← Back to Marketplace
                </Link>

                <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white">
                        <div className="flex items-center gap-6">
                            <span className="text-6xl bg-white/20 p-4 rounded-2xl">
                                {iconMap[tool.icon] || '🔧'}
                            </span>
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold">{tool.name}</h1>
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                                        v{tool.version}
                                    </span>
                                </div>
                                <p className="text-primary-100 text-lg">{tool.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Main content */}
                            <div className="md:col-span-2">
                                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                                    About this tool
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                                    {tool.description}
                                </p>

                                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-6">
                                    <h3 className="font-semibold text-neutral-900 dark:text-white mb-3">
                                        Features
                                    </h3>
                                    <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Full access to all features
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Automatic updates
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Data export capabilities
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <span className="text-green-500">✓</span>
                                            Priority support
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="md:col-span-1">
                                <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-xl p-6 sticky top-6">
                                    <div className="text-center mb-6">
                                        <span className="text-4xl font-bold text-neutral-900 dark:text-white">
                                            {formatPrice(tool.price)}
                                        </span>
                                        {tool.pricingType === 'SUBSCRIPTION' && (
                                            <span className="text-neutral-500 dark:text-neutral-400">/month</span>
                                        )}
                                        {tool.pricingType === 'ONE_TIME' && (
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                                One-time payment
                                            </p>
                                        )}
                                    </div>

                                    <button className="w-full py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors mb-4">
                                        {tool.price === 0 ? 'Get Started Free' : 'Purchase Now'}
                                    </button>

                                    <div className="text-sm text-neutral-500 dark:text-neutral-400 space-y-2">
                                        <div className="flex justify-between">
                                            <span>Category</span>
                                            <span className="capitalize font-medium text-neutral-700 dark:text-neutral-300">
                                                {tool.category}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Type</span>
                                            <span className="font-medium text-neutral-700 dark:text-neutral-300">
                                                {tool.pricingType}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
