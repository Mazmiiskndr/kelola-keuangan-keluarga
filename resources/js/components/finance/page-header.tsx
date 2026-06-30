import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';
import type React from 'react';

interface PageHeaderProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, icon: Icon, action, className }: PageHeaderProps) {
    return (
        <div className={cn('flex flex-col gap-4 md:flex-row md:items-center md:justify-between', className)}>
            <div className="flex min-w-0 items-start gap-3">
                <div className="rounded-lg bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                    <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                    <h1 className="text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">{title}</h1>
                    <p className="text-muted-foreground mt-1 max-w-3xl text-sm">{description}</p>
                </div>
            </div>
            {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
    );
}

interface SubmitButtonProps {
    processing: boolean;
    children: React.ReactNode;
}

export function SubmitButton({ processing, children }: SubmitButtonProps) {
    return (
        <Button type="submit" disabled={processing}>
            {processing ? 'Menyimpan...' : children}
        </Button>
    );
}
