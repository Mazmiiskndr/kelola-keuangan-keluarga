import { DateTimeDisplay } from '@/components/finance/date-display';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FinanceSelect } from '@/components/finance/finance-select';
import { MoneyDisplay } from '@/components/finance/money-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { accountLabel } from '@/lib/finance-labels';
import { type FinanceTransaction, type Paginated } from '@/types/finance';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

const transactionTypeFilterOptions = [
    { value: 'all', label: 'Semua tipe' },
    { value: 'income', label: 'Pemasukan' },
    { value: 'expense', label: 'Pengeluaran' },
    { value: 'saving', label: 'Tabungan' },
];

interface TransactionHistoryProps {
    transactions: Paginated<FinanceTransaction>;
    selectedType: string;
    currentUserId: number;
    onFilterChange: (type: string) => void;
    onEdit: (transaction: FinanceTransaction) => void;
}

function transactionTitle(transaction: FinanceTransaction) {
    return transaction.merchant?.trim() || '-';
}

function transactionCreator(transaction: FinanceTransaction, currentUserId: number) {
    const name = transaction.user?.name || transaction.user?.email || 'User';

    return transaction.user?.id === currentUserId ? `${name} (Anda)` : name;
}

function paginationContent(label: string) {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('previous') || normalizedLabel.includes('pagination.previous')) {
        return <ChevronLeft className="size-4" />;
    }

    if (normalizedLabel.includes('next') || normalizedLabel.includes('pagination.next')) {
        return <ChevronRight className="size-4" />;
    }

    return label.includes('...') ? <MoreHorizontal className="size-4" /> : <span>{label}</span>;
}

function paginationAriaLabel(label: string) {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('previous') || normalizedLabel.includes('pagination.previous')) {
        return 'Halaman sebelumnya';
    }

    if (normalizedLabel.includes('next') || normalizedLabel.includes('pagination.next')) {
        return 'Halaman berikutnya';
    }

    return label.includes('...') ? 'Halaman lainnya' : `Halaman ${label}`;
}

export function TransactionHistory({ transactions, selectedType, currentUserId, onFilterChange, onEdit }: TransactionHistoryProps) {
    return (
        <Card className="h-fit self-start">
            <CardHeader>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <CardTitle>Riwayat Transaksi</CardTitle>
                    <div className="w-full md:w-56">
                        <FinanceSelect
                            value={selectedType}
                            onValueChange={onFilterChange}
                            options={transactionTypeFilterOptions}
                            searchPlaceholder="Cari tipe..."
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {transactions.data.length === 0 && (
                    <p className="text-muted-foreground rounded-lg border p-4 text-sm">Belum ada transaksi untuk tipe ini.</p>
                )}
                {transactions.data.map((transaction) => (
                    <div key={transaction.id} className="finance-panel-list">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium">{transactionTitle(transaction)}</p>
                                <FinanceBadge value={transaction.type} />
                            </div>
                            <p className="text-muted-foreground mt-1 text-sm">
                                {accountLabel(transaction.account)} · {transaction.category?.name} ·{' '}
                                <DateTimeDisplay value={transaction.transaction_date} timeSource={transaction.updated_at ?? transaction.created_at} />
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                                Dibuat oleh {transactionCreator(transaction, currentUserId)}
                                {transaction.created_at && (
                                    <>
                                        {' '}
                                        - <DateTimeDisplay value={transaction.created_at} />
                                    </>
                                )}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <MoneyDisplay
                                value={transaction.amount}
                                className={
                                    transaction.type === 'income'
                                        ? 'font-semibold text-emerald-600'
                                        : transaction.type === 'saving'
                                          ? 'font-semibold text-teal-600'
                                          : 'font-semibold text-rose-600'
                                }
                            />
                            {transaction.can_edit !== false && (
                                <button
                                    className="text-muted-foreground rounded-md p-2 hover:bg-blue-50 hover:text-blue-700"
                                    onClick={() => onEdit(transaction)}
                                    aria-label="Edit transaksi"
                                >
                                    <Pencil className="size-4" />
                                </button>
                            )}
                            {transaction.can_delete !== false && (
                                <button
                                    className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                    onClick={() => {
                                        if (window.confirm('Yakin ingin menghapus transaksi ini?')) {
                                            router.delete(`/transactions/${transaction.id}`, { preserveScroll: true });
                                        }
                                    }}
                                    aria-label="Hapus transaksi"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {transactions.links && transactions.links.length > 3 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {transactions.links.map((link, index) => {
                            const isDisabled = !link.url;
                            const itemClassName = `inline-flex size-10 items-center justify-center rounded-md border text-sm font-semibold transition-colors ${
                                link.active
                                    ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                                    : isDisabled
                                      ? 'cursor-not-allowed border-slate-200 text-slate-300 dark:border-slate-800 dark:text-slate-700'
                                      : 'text-muted-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-900 dark:hover:bg-blue-950 dark:hover:text-blue-300'
                            }`;

                            return isDisabled ? (
                                <span key={`${link.label}-${index}`} className={itemClassName} aria-label={paginationAriaLabel(link.label)}>
                                    {paginationContent(link.label)}
                                </span>
                            ) : (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    className={itemClassName}
                                    preserveScroll
                                    aria-label={paginationAriaLabel(link.label)}
                                >
                                    {paginationContent(link.label)}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
