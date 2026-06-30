import { cn } from '@/lib/utils';

interface FormErrorProps {
    message?: string;
    className?: string;
}

export function FormError({ message, className }: FormErrorProps) {
    if (!message) {
        return null;
    }

    return <p className={cn('text-xs font-medium text-rose-600', className)}>{message}</p>;
}
