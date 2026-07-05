import { Button } from '@/components/ui/button';
import { useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { Moon, Sun } from 'lucide-react';

interface ThemeModeSwitchProps {
    className?: string;
}

export function ThemeModeSwitch({ className }: ThemeModeSwitchProps) {
    const { appearance, updateAppearance } = useAppearance();
    const isDark = appearance === 'dark';

    return (
        <Button
            type="button"
            variant="outline"
            className={cn(
                'group h-10 cursor-pointer rounded-xl border-slate-200 bg-white px-2 shadow-none transition-colors hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-900 dark:hover:bg-blue-950',
                className,
            )}
            onClick={() => updateAppearance(isDark ? 'light' : 'dark')}
            aria-label={isDark ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
        >
            <span className="relative flex h-6 w-11 items-center rounded-full bg-slate-100 p-0.5 transition-colors group-hover:bg-blue-100 dark:bg-slate-800 dark:group-hover:bg-blue-900">
                <span
                    className={cn(
                        'flex size-5 items-center justify-center rounded-full bg-white text-amber-500 shadow-sm transition-transform dark:bg-slate-950 dark:text-blue-300',
                        isDark && 'translate-x-5',
                    )}
                >
                    {isDark ? <Moon className="size-3.5" /> : <Sun className="size-3.5" />}
                </span>
            </span>
            <span className="hidden text-xs font-semibold text-slate-700 sm:inline dark:text-slate-200">{isDark ? 'Gelap' : 'Terang'}</span>
        </Button>
    );
}
