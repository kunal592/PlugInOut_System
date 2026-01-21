import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'PlugInOut Platform',
    description: 'Enterprise SaaS Platform',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="h-full">
            <body className={cn(inter.className, "h-full bg-background antialiased flex")}>
                {/* Global Sidebar - Always present */}
                <div className="w-64 border-r bg-card flex-shrink-0 h-full overflow-y-auto hidden md:block">
                    <Sidebar />
                </div>

                {/* Main Content Area */}
                <main className="flex-1 h-full overflow-y-auto bg-secondary/10">
                    <div className="container mx-auto p-8 h-full">
                        {children}
                    </div>
                </main>
            </body>
        </html>
    );
}
