import { FormError } from '@/components/finance/form-error';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Family } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Users } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Keluarga', href: '/families' }];

interface FamiliesProps {
    families: Array<Family & { members?: Array<{ id: number; role: string; status: string; user?: { name: string; email: string } }> }>;
}

export default function FamiliesIndex({ families }: FamiliesProps) {
    const form = useForm({ name: '', currency: 'IDR' });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/families', { preserveScroll: true, onSuccess: () => form.reset('name') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Keluarga" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Ruang Keluarga"
                    description="Siapkan struktur keluarga agar admin dapat melihat pemasukan, pengeluaran, hutang, dan laporan sesuai permission."
                    icon={Users}
                />
                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Buat Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label>Nama keluarga</Label>
                                    <Input
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Keluarga Santoso"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <SubmitButton processing={form.processing}>Buat Keluarga</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Keluarga</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {families.map((family) => (
                                <div key={family.id} className="rounded-lg border p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-medium">{family.name}</p>
                                            <p className="text-muted-foreground text-sm">Currency {family.currency}</p>
                                        </div>
                                        <Badge variant="outline">{family.members?.length ?? 0} anggota</Badge>
                                    </div>
                                    <div className="mt-3 grid gap-2">
                                        {family.members?.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-sm dark:bg-slate-900"
                                            >
                                                <span>{member.user?.name ?? member.user?.email ?? 'Anggota'}</span>
                                                <Badge variant="secondary">{member.role}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
