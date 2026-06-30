import { formatMoney } from '@/components/finance/money-display';
import { type FinancialAccount } from '@/types/finance';

export function accountLabel(account?: FinancialAccount | null, withBalance = false): string {
    if (!account) {
        return 'Akun';
    }

    const label = account.display_name || account.name;

    if (!withBalance) {
        return label;
    }

    return `${label} - ${formatMoney(account.current_balance)}`;
}
