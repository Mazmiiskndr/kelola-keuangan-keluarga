import { type LucideIcon } from 'lucide-react';
import type React from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed bg-slate-50 p-8 text-center dark:bg-slate-950">
            <div className="rounded-md bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-900 dark:text-slate-200">
                <Icon className="size-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold">{title}</h3>
            <p className="text-muted-foreground mt-1 max-w-md text-sm">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}
