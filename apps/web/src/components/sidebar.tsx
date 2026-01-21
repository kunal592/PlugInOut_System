"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { LayoutDashboard, Settings, ShoppingBag, LogOut } from 'lucide-react';

interface SidebarItem {
    slug: string;
    name: string;
    icon?: string;
    routes: string;
}

export default function Sidebar() {
    const pathname = usePathname();
    const [tools, setTools] = useState<SidebarItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch user's active tools
        const fetchTools = async () => {
            try {
                // In a real app, we'd check if user is logged in first
                // const token = localStorage.getItem('accessToken');
                // if (!token) return;

                // For development/demo, we might simulate or handle public tools differently
                // But assuming auth is handled or we have a public endpoint for demo:

                // TODO: Implement proper auth check before fetching
                // const response = await api.get<any>('/user-tools/active');
                // setTools(response.map((ut: any) => ut.tool));

                // Mock data for now until auth is fully wired up on frontend
                setTools([
                    { slug: 'invoice', name: 'Invoices', routes: '/tools/invoice' },
                    { slug: 'expense-tracker', name: 'Expenses', routes: '/tools/expense-tracker' },
                ]);
            } catch (error) {
                console.error('Failed to fetch tools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, []);

    const navItems = [
        {
            name: 'Dashboard',
            href: '/',
            icon: LayoutDashboard,
            active: pathname === '/',
        },
        ...tools.map((tool) => ({
            name: tool.name,
            href: tool.routes,
            icon: null, // We'd dynamically resolve icons here or show a placeholder
            active: pathname.startsWith(tool.routes),
            isTool: true
        })),
        {
            name: 'Marketplace',
            href: '/marketplace',
            icon: ShoppingBag,
            active: pathname === '/marketplace',
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            active: pathname === '/settings',
        },
    ];

    return (
        <div className="flex flex-col h-full bg-card text-card-foreground">
            {/* Branding */}
            <div className="p-6 border-b">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                        P
                    </div>
                    <span>PlugInOut</span>
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                    Menu
                </div>

                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            item.active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        {item.icon ? (
                            <item.icon className="w-5 h-5" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold">
                                {item.name.charAt(0)}
                            </div>
                        )}
                        {item.name}
                    </Link>
                ))}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t bg-secondary/30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                        U
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">User Name</p>
                        <p className="text-xs text-muted-foreground truncate">user@example.com</p>
                    </div>
                    <button className="text-muted-foreground hover:text-destructive transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
