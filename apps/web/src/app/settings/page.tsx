'use client';

import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, CreditCard, LogOut, Check, AlertCircle, Eye, EyeOff, Loader2, Save, Trash2, Download, RefreshCw } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'appearance' | 'billing';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    company: string;
    avatar: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    toolUpdates: boolean;
    marketingEmails: boolean;
    paymentAlerts: boolean;
    weeklyDigest: boolean;
}

interface AppearanceSettings {
    darkMode: boolean;
    themeColor: string;
    compactMode: boolean;
    language: string;
}

interface PurchasedTool {
    slug: string;
    name: string;
    icon: string;
    purchasedAt: string;
    type: 'one-time' | 'subscription';
    status: 'active' | 'expired';
    nextBilling?: string;
}

// Toast component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg z-50 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
            {type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message}
        </div>
    );
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    // Profile state
    const [profile, setProfile] = useState<UserProfile>({
        name: '',
        email: '',
        phone: '',
        company: '',
        avatar: 'U'
    });

    // Notification state
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        toolUpdates: true,
        marketingEmails: false,
        paymentAlerts: true,
        weeklyDigest: false
    });

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState([
        { id: '1', device: 'Chrome on MacOS', location: 'Mumbai, India', lastActive: 'Now', current: true },
        { id: '2', device: 'Safari on iPhone', location: 'Delhi, India', lastActive: '2 hours ago', current: false }
    ]);

    // Appearance state
    const [appearance, setAppearance] = useState<AppearanceSettings>({
        darkMode: false,
        themeColor: 'blue',
        compactMode: false,
        language: 'en'
    });

    // Billing state
    const [purchasedTools, setPurchasedTools] = useState<PurchasedTool[]>([]);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedProfile = localStorage.getItem('user_profile');
        const savedNotifications = localStorage.getItem('notification_settings');
        const savedAppearance = localStorage.getItem('appearance_settings');
        const savedTools = localStorage.getItem('purchased_tools');

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        else setProfile({ name: 'John Doe', email: 'john@example.com', phone: '+91 9876543210', company: 'Acme Inc', avatar: 'J' });

        if (savedNotifications) setNotifications(JSON.parse(savedNotifications));
        if (savedAppearance) {
            const parsed = JSON.parse(savedAppearance);
            setAppearance(parsed);
            applyDarkMode(parsed.darkMode);
        }

        if (savedTools) setPurchasedTools(JSON.parse(savedTools));
        else setPurchasedTools([
            { slug: 'invoice', name: 'Invoice Generator', icon: '📄', purchasedAt: '2026-01-15', type: 'one-time', status: 'active' },
            { slug: 'expense-tracker', name: 'Expense Tracker', icon: '📊', purchasedAt: '2026-01-10', type: 'subscription', status: 'active', nextBilling: '2026-02-10' },
            { slug: 'task-manager', name: 'Task Manager', icon: '✅', purchasedAt: '2026-01-18', type: 'one-time', status: 'active' }
        ]);
    }, []);

    // Apply dark mode to document
    const applyDarkMode = (dark: boolean) => {
        if (dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const tabs = [
        { id: 'profile' as SettingsTab, name: 'Profile', icon: User },
        { id: 'notifications' as SettingsTab, name: 'Notifications', icon: Bell },
        { id: 'security' as SettingsTab, name: 'Security', icon: Shield },
        { id: 'appearance' as SettingsTab, name: 'Appearance', icon: Palette },
        { id: 'billing' as SettingsTab, name: 'Billing', icon: CreditCard },
    ];

    // Save profile
    const saveProfile = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
            localStorage.setItem('user_profile', JSON.stringify(profile));
            showToast('Profile saved successfully!', 'success');
        } catch (error) {
            showToast('Failed to save profile', 'error');
        }
        setSaving(false);
    };

    // Save notifications
    const saveNotifications = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            localStorage.setItem('notification_settings', JSON.stringify(notifications));
            showToast('Notification preferences saved!', 'success');
        } catch (error) {
            showToast('Failed to save preferences', 'error');
        }
        setSaving(false);
    };

    // Update password
    const updatePassword = async () => {
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        if (newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            showToast('Password updated successfully!', 'success');
        } catch (error) {
            showToast('Failed to update password', 'error');
        }
        setSaving(false);
    };

    // Toggle 2FA
    const toggle2FA = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setTwoFactorEnabled(!twoFactorEnabled);
            showToast(twoFactorEnabled ? '2FA disabled' : '2FA enabled successfully!', 'success');
        } catch (error) {
            showToast('Failed to update 2FA', 'error');
        }
        setSaving(false);
    };

    // Revoke session
    const revokeSession = async (sessionId: string) => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setSessions(sessions.filter(s => s.id !== sessionId));
            showToast('Session revoked', 'success');
        } catch (error) {
            showToast('Failed to revoke session', 'error');
        }
        setSaving(false);
    };

    // Save appearance
    const saveAppearance = async (newAppearance: AppearanceSettings) => {
        try {
            localStorage.setItem('appearance_settings', JSON.stringify(newAppearance));
            applyDarkMode(newAppearance.darkMode);
            showToast('Appearance settings saved!', 'success');
        } catch (error) {
            showToast('Failed to save settings', 'error');
        }
    };

    // Export data
    const exportData = async () => {
        setSaving(true);
        try {
            const data = {
                profile,
                notifications,
                appearance,
                purchasedTools,
                exportedAt: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pluginout-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Data exported successfully!', 'success');
        } catch (error) {
            showToast('Failed to export data', 'error');
        }
        setSaving(false);
    };

    // Delete account
    const deleteAccount = async () => {
        const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');
        if (!confirmed) return;

        const doubleConfirm = window.prompt('Type "DELETE" to confirm account deletion:');
        if (doubleConfirm !== 'DELETE') {
            showToast('Account deletion cancelled', 'error');
            return;
        }

        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            localStorage.clear();
            showToast('Account deleted. Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            showToast('Failed to delete account', 'error');
        }
        setSaving(false);
    };

    const themeColors = [
        { name: 'blue', class: 'bg-blue-500' },
        { name: 'purple', class: 'bg-purple-500' },
        { name: 'green', class: 'bg-green-500' },
        { name: 'orange', class: 'bg-orange-500' },
        { name: 'pink', class: 'bg-pink-500' },
        { name: 'cyan', class: 'bg-cyan-500' },
    ];

    return (
        <div className="space-y-8">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="lg:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                    }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1">
                    <div className="bg-card rounded-xl border border-border p-6">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>

                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                        {profile.avatar || profile.name[0] || 'U'}
                                    </div>
                                    <div>
                                        <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                                            Change Avatar
                                        </button>
                                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                                    </div>
                                </div>

                                <div className="grid gap-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value, avatar: e.target.value[0] || 'U' })}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={profile.email}
                                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                                        <input
                                            type="text"
                                            value={profile.company}
                                            onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="w-fit px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>

                                <div className="space-y-4">
                                    {[
                                        { key: 'emailNotifications', title: 'Email Notifications', description: 'Receive email updates about your account activity' },
                                        { key: 'toolUpdates', title: 'Tool Updates', description: 'Get notified when tools you use are updated' },
                                        { key: 'marketingEmails', title: 'Marketing Emails', description: 'Receive news about new features and products' },
                                        { key: 'paymentAlerts', title: 'Payment Alerts', description: 'Get notified about payment and billing updates' },
                                        { key: 'weeklyDigest', title: 'Weekly Digest', description: 'Receive a weekly summary of your tool usage' },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                            <div>
                                                <p className="font-medium text-foreground">{item.title}</p>
                                                <p className="text-sm text-muted-foreground">{item.description}</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notifications[item.key as keyof NotificationSettings]}
                                                    onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={saveNotifications}
                                    disabled={saving}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Save Preferences
                                </button>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>

                                {/* Password Change */}
                                <div className="space-y-4 max-w-md">
                                    <h3 className="font-medium text-foreground">Change Password</h3>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            placeholder="Current Password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            placeholder="New Password (min 8 characters)"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showPasswords ? 'text' : 'password'}
                                            placeholder="Confirm New Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords(!showPasswords)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <button
                                        onClick={updatePassword}
                                        disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                                        className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                        Update Password
                                    </button>
                                </div>

                                {/* 2FA */}
                                <div className="pt-6 border-t border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                                            <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                                        </div>
                                        <button
                                            onClick={toggle2FA}
                                            disabled={saving}
                                            className={`px-4 py-2 rounded-lg transition-colors ${twoFactorEnabled ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-green-500 text-white hover:bg-green-600'}`}
                                        >
                                            {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                                        </button>
                                    </div>
                                    {twoFactorEnabled && (
                                        <p className="mt-2 text-sm text-green-600">✓ Two-factor authentication is enabled</p>
                                    )}
                                </div>

                                {/* Active Sessions */}
                                <div className="pt-6 border-t border-border">
                                    <h3 className="font-medium text-foreground mb-4">Active Sessions</h3>
                                    <div className="space-y-3">
                                        {sessions.map((session) => (
                                            <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-foreground flex items-center gap-2">
                                                        {session.device}
                                                        {session.current && <span className="px-2 py-0.5 bg-green-500/10 text-green-600 text-xs rounded">Current</span>}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{session.location} • {session.lastActive}</p>
                                                </div>
                                                {!session.current && (
                                                    <button
                                                        onClick={() => revokeSession(session.id)}
                                                        className="text-destructive hover:underline text-sm"
                                                    >
                                                        Revoke
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Appearance Tab */}
                        {activeTab === 'appearance' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-foreground">Appearance</h2>

                                <div className="space-y-4">
                                    {/* Dark Mode */}
                                    <div className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="font-medium text-foreground">Dark Mode</p>
                                            <p className="text-sm text-muted-foreground">Toggle dark mode theme</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.darkMode}
                                                onChange={(e) => {
                                                    const newAppearance = { ...appearance, darkMode: e.target.checked };
                                                    setAppearance(newAppearance);
                                                    saveAppearance(newAppearance);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </div>

                                    {/* Compact Mode */}
                                    <div className="flex items-center justify-between py-3 border-t border-border">
                                        <div>
                                            <p className="font-medium text-foreground">Compact Mode</p>
                                            <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={appearance.compactMode}
                                                onChange={(e) => {
                                                    const newAppearance = { ...appearance, compactMode: e.target.checked };
                                                    setAppearance(newAppearance);
                                                    saveAppearance(newAppearance);
                                                }}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                        </label>
                                    </div>

                                    {/* Theme Color */}
                                    <div className="pt-4 border-t border-border">
                                        <p className="font-medium text-foreground mb-4">Theme Color</p>
                                        <div className="flex gap-3">
                                            {themeColors.map((color) => (
                                                <button
                                                    key={color.name}
                                                    onClick={() => {
                                                        const newAppearance = { ...appearance, themeColor: color.name };
                                                        setAppearance(newAppearance);
                                                        saveAppearance(newAppearance);
                                                    }}
                                                    className={`w-10 h-10 rounded-full ${color.class} transition-all ${appearance.themeColor === color.name ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110' : 'hover:scale-105'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Language */}
                                    <div className="pt-4 border-t border-border">
                                        <label className="block font-medium text-foreground mb-2">Language</label>
                                        <select
                                            value={appearance.language}
                                            onChange={(e) => {
                                                const newAppearance = { ...appearance, language: e.target.value };
                                                setAppearance(newAppearance);
                                                saveAppearance(newAppearance);
                                            }}
                                            className="w-full max-w-xs px-4 py-2 rounded-lg border border-input bg-background text-foreground"
                                        >
                                            <option value="en">English</option>
                                            <option value="hi">हिंदी (Hindi)</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-semibold text-foreground">Billing & Subscriptions</h2>

                                {/* Current Plan */}
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Current Plan</p>
                                            <p className="text-2xl font-bold text-foreground">Pro Plan</p>
                                            <p className="text-sm text-muted-foreground">{purchasedTools.length} tools purchased</p>
                                        </div>
                                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                            Upgrade Plan
                                        </button>
                                    </div>
                                </div>

                                {/* Purchased Tools */}
                                <div>
                                    <h3 className="font-medium text-foreground mb-4">Your Tools</h3>
                                    <div className="space-y-3">
                                        {purchasedTools.map((tool) => (
                                            <div key={tool.slug} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{tool.icon}</span>
                                                    <div>
                                                        <p className="font-medium text-foreground">{tool.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {tool.type === 'subscription' ? `Next billing: ${new Date(tool.nextBilling || '').toLocaleDateString()}` : `Purchased: ${new Date(tool.purchasedAt).toLocaleDateString()}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${tool.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                                                        {tool.status === 'active' ? 'Active' : 'Expired'}
                                                    </span>
                                                    {tool.type === 'subscription' && (
                                                        <button className="text-sm text-muted-foreground hover:text-foreground">
                                                            Manage
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Payment Methods */}
                                <div className="pt-6 border-t border-border">
                                    <h3 className="font-medium text-foreground mb-4">Payment Methods</h3>
                                    <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg mb-3">
                                        <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                                        <div>
                                            <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                                            <p className="text-sm text-muted-foreground">Expires 12/28</p>
                                        </div>
                                        <span className="ml-auto px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded">Default</span>
                                    </div>
                                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                                        Add Payment Method
                                    </button>
                                </div>

                                {/* Billing History */}
                                <div className="pt-6 border-t border-border">
                                    <h3 className="font-medium text-foreground mb-4">Billing History</h3>
                                    <div className="space-y-2">
                                        {[
                                            { date: 'Jan 18, 2026', description: 'Task Manager', amount: '₹149' },
                                            { date: 'Jan 15, 2026', description: 'Invoice Generator', amount: '₹199' },
                                            { date: 'Jan 10, 2026', description: 'Expense Tracker (Monthly)', amount: '₹149/mo' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                                <div>
                                                    <p className="font-medium text-foreground">{item.description}</p>
                                                    <p className="text-sm text-muted-foreground">{item.date}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium text-foreground">{item.amount}</span>
                                                    <button className="text-primary text-sm hover:underline">Invoice</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Data Export & Danger Zone */}
                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                        {/* Export Data */}
                        <div className="bg-card border border-border rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                                <Download className="w-5 h-5" /> Export Data
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Download all your data including profile, settings, and tool data.
                            </p>
                            <button
                                onClick={exportData}
                                disabled={saving}
                                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                Export All Data
                            </button>
                        </div>

                        {/* Danger Zone */}
                        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-destructive mb-2 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Danger Zone
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Permanently delete your account and all associated data.
                            </p>
                            <button
                                onClick={deleteAccount}
                                disabled={saving}
                                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
