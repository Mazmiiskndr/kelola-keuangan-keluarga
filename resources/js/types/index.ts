import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    flash?: {
        type: 'success' | 'error';
        title: string;
        message: string;
    } | null;
    notifications: {
        unread_count: number;
        items: AppNotification[];
    };
    [key: string]: unknown;
}

export interface AppNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    url?: string | null;
    read_at?: string | null;
    created_at?: string | null;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}
