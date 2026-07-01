import { Label } from '@/components/ui/label';
import type { ComponentProps } from 'react';

type RequiredLabelProps = ComponentProps<typeof Label>;

export function RequiredLabel({ children, ...props }: RequiredLabelProps) {
    return (
        <Label {...props}>
            {children} <span className="text-rose-500">*</span>
        </Label>
    );
}
