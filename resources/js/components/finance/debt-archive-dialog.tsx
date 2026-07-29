import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type Debt } from '@/types/finance';
import { router } from '@inertiajs/react';
import { Archive, TriangleAlert } from 'lucide-react';
import { useState } from 'react';

interface DebtArchiveDialogProps {
    debt: Debt | null;
    onClose: () => void;
}

export function DebtArchiveDialog({ debt, onClose }: DebtArchiveDialogProps) {
    const [processing, setProcessing] = useState(false);

    function archiveDebt() {
        if (!debt || processing) {
            return;
        }

        router.delete(`/debts/${debt.id}`, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onSuccess: onClose,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog
            open={Boolean(debt)}
            onOpenChange={(open) => {
                if (!open && !processing) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
                        <TriangleAlert className="size-5" />
                    </div>
                    <DialogTitle>Arsipkan hutang?</DialogTitle>
                    <DialogDescription className="leading-6">
                        Hutang <span className="font-semibold text-slate-900 dark:text-white">{debt?.name}</span> akan disembunyikan dari daftar
                        hutang aktif.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                    Riwayat transaksi dan pembayaran tetap tersimpan untuk menjaga laporan keuangan tetap akurat.
                </div>

                <DialogFooter className="gap-2 sm:space-x-0">
                    <DialogClose asChild>
                        <Button type="button" variant="outline" disabled={processing}>
                            Batal
                        </Button>
                    </DialogClose>
                    <Button type="button" variant="destructive" disabled={processing} onClick={archiveDebt}>
                        <Archive className="size-4" />
                        {processing ? 'Mengarsipkan...' : 'Ya, arsipkan'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
