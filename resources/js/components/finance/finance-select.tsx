import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface FinanceSelectOption {
    value: string;
    label: string;
}

interface FinanceSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    options: FinanceSelectOption[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyMessage?: string;
}

export function FinanceSelect({
    value,
    onValueChange,
    options,
    placeholder = 'Pilih data',
    searchPlaceholder = 'Cari data...',
    emptyMessage = 'Data tidak ditemukan.',
}: FinanceSelectProps) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const selectedOption = options.find((option) => option.value === value);

    const filteredOptions = useMemo(() => {
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
            return options;
        }

        return options.filter((option) => option.label.toLowerCase().includes(normalizedSearch));
    }, [options, search]);

    useEffect(() => {
        if (!open) {
            setSearch('');
            return;
        }

        const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);

        return () => window.clearTimeout(focusTimer);
    }, [open]);

    useEffect(() => {
        function closeOnOutsideClick(event: MouseEvent) {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', closeOnOutsideClick);

        return () => document.removeEventListener('mousedown', closeOnOutsideClick);
    }, []);

    function selectOption(nextValue: string) {
        onValueChange(nextValue);
        setOpen(false);
    }

    return (
        <div ref={rootRef} className="relative">
            <Button
                type="button"
                variant="outline"
                aria-expanded={open}
                role="combobox"
                className="h-10 w-full justify-between px-3 font-normal"
                onClick={() => setOpen((current) => !current)}
            >
                <span className={cn('truncate', !selectedOption && 'text-muted-foreground')}>{selectedOption?.label ?? placeholder}</span>
                <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
            </Button>

            {open && (
                <div className="bg-popover text-popover-foreground absolute z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                    <div className="relative border-b p-2">
                        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2" />
                        <Input
                            ref={searchRef}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    setOpen(false);
                                }
                            }}
                            placeholder={searchPlaceholder}
                            className="h-9 pl-9"
                        />
                    </div>

                    <div className="max-h-64 overflow-y-auto p-1">
                        {filteredOptions.length === 0 ? (
                            <div className="text-muted-foreground px-3 py-2 text-sm">{emptyMessage}</div>
                        ) : (
                            filteredOptions.map((option) => (
                                <button
                                    key={`${option.value}-${option.label}`}
                                    type="button"
                                    className={cn(
                                        'hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm',
                                        option.value === value && 'bg-accent text-accent-foreground',
                                    )}
                                    onClick={() => selectOption(option.value)}
                                >
                                    <Check className={cn('size-4 shrink-0', option.value === value ? 'opacity-100' : 'opacity-0')} />
                                    <span className="truncate">{option.label}</span>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
