import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <Input type={visible ? 'text' : 'password'} className={className ? `${className} pr-12` : 'pr-12'} {...props} />
            <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 flex size-8 -translate-y-1/2 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                onClick={() => setVisible((current) => !current)}
                aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
        </div>
    );
}
