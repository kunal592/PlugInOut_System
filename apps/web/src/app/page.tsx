export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-primary">
                Welcome to PlugInOut
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
                The extensible platform for your business tools. Select a tool from the sidebar to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
                {/* Placeholder cards for features */}
                <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Fast Performance</h3>
                    <p className="text-sm text-muted-foreground">Built on a modern stack for lightning fast interactions.</p>
                </div>

                <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Fully Extensible</h3>
                    <p className="text-sm text-muted-foreground">Add new tools and features without changing the core.</p>
                </div>

                <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                    <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h3 className="font-semibold mb-2">Secure by Design</h3>
                    <p className="text-sm text-muted-foreground">Enterprise-grade security and permissions built-in.</p>
                </div>
            </div>
        </div>
    );
}
