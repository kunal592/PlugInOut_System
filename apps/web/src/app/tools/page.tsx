'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tool {
    slug: string;
    name: string;
    description: string;
    price: number;
    pricingType: string;
    icon: string;
    category: string;
    routes: string;
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

export default function ToolsMarketplace() {
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/tools`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setTools(data.data);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch tools:', err);
                setLoading(false);
            });
    }, []);

    const formatPrice = (price: number) => {
        if (price === 0) return 'Free';
        return `₹${(price / 100).toFixed(0)}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-pulse text-foreground">Loading tools...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
                        Tool Marketplace
                    </h1>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Discover powerful business tools to streamline your workflow.
                        Pay once, use forever.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {tools.map((tool) => (
                        <Link
                            key={tool.slug}
                            href={`/tools/${tool.slug}`}
                            className="group"
                        >
                            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:scale-[1.02]">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-4xl">
                                        {iconMap[tool.icon] || '🔧'}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tool.pricingType === 'FREE'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : tool.pricingType === 'SUBSCRIPTION'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                        }`}>
                                        {tool.pricingType === 'SUBSCRIPTION' ? 'Monthly' : tool.pricingType}
                                    </span>
                                </div>

                                <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">
                                    {tool.name}
                                </h3>

                                <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
                                    {tool.description}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-700">
                                    <span className="text-sm text-neutral-500 dark:text-neutral-500 capitalize">
                                        {tool.category}
                                    </span>
                                    <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                                        {formatPrice(tool.price)}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
