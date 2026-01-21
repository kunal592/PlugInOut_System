import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 dark:text-white mb-6 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                        Modular SaaS Platform
                    </h1>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
                        Pay only for the tools you need. Build your perfect business toolkit with our
                        modular plugin system.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/tools"
                            className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-lg shadow-primary-600/25"
                        >
                            Browse Tools →
                        </Link>
                        <Link
                            href="/auth/login"
                            className="px-8 py-4 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                            Pay Per Tool
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            No bloated subscriptions. Buy only the tools you need, when you need them.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🔌</span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                            Plugin Architecture
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Add new tools without touching core code. True modularity for scalability.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-neutral-800 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3">
                            Enterprise Security
                        </h3>
                        <p className="text-neutral-600 dark:text-neutral-400">
                            Role-based access, JWT auth, and per-tool permissions built-in.
                        </p>
                    </div>
                </div>

                {/* Tools Preview */}
                <div className="mt-20 text-center">
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
                        Available Tools
                    </h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-10">
                        8 powerful finance and business tools ready to use
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        {[
                            { name: 'Invoice Generator', icon: '📄', slug: 'invoice' },
                            { name: 'Expense Tracker', icon: '📊', slug: 'expense-tracker' },
                            { name: 'GST Calculator', icon: '🧮', slug: 'gst-calculator' },
                            { name: 'Payroll', icon: '👥', slug: 'payroll' },
                            { name: 'Subscription Manager', icon: '🔄', slug: 'subscription-manager' },
                            { name: 'P&L Reports', icon: '📈', slug: 'profit-loss' },
                            { name: 'Cash Flow', icon: '💹', slug: 'cash-flow' },
                            { name: 'Purchase Orders', icon: '📋', slug: 'purchase-order' },
                        ].map((tool) => (
                            <Link
                                key={tool.slug}
                                href={`/tools/${tool.slug}`}
                                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-neutral-800 rounded-full border border-neutral-200 dark:border-neutral-700 hover:border-primary-500 hover:shadow-md transition-all"
                            >
                                <span>{tool.icon}</span>
                                <span className="text-neutral-700 dark:text-neutral-300">{tool.name}</span>
                            </Link>
                        ))}
                    </div>

                    <Link
                        href="/tools"
                        className="inline-block mt-10 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View all tools →
                    </Link>
                </div>
            </div>
        </div>
    );
}
