import { type Family, type SummaryMetric } from '@/types/finance';
import { router } from '@inertiajs/react';

export function useDashboardScope(summary: SummaryMetric, families: Family[]) {
    const currentScope = summary.scope ?? 'personal';
    const selectedFamilyId = summary.family?.id ? String(summary.family.id) : families[0]?.id ? String(families[0].id) : '';

    function selectScope(scope: 'personal' | 'family') {
        router.post(
            '/dashboard/scope',
            {
                scope,
                family_id: scope === 'family' ? selectedFamilyId : null,
            },
            {
                preserveScroll: true,
            },
        );
    }

    function selectFamily(familyId: string) {
        router.post('/dashboard/scope', { scope: 'family', family_id: familyId }, { preserveScroll: true });
    }

    return {
        currentScope,
        selectedFamilyId,
        selectScope,
        selectFamily,
    };
}
