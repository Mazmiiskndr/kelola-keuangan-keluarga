import { FinanceSelect } from '@/components/finance/finance-select';
import { FormError } from '@/components/finance/form-error';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type Category } from '@/types/finance';
import { Head, router, useForm } from '@inertiajs/react';
import { Tags, Trash2 } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kategori', href: '/categories' }];

interface CategoriesProps {
    categories: Category[];
}

export default function CategoriesIndex({ categories }: CategoriesProps) {
    const form = useForm({
        name: '',
        type: 'expense',
        color: '#2563eb',
        icon: '',
        is_essential: false,
        is_savable: false,
        is_lifestyle: false,
    });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/categories', { preserveScroll: true, onSuccess: () => form.reset('name', 'icon') });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <PageHeader
                    title="Kategori Transaksi"
                    description="Kelompokkan pemasukan dan pengeluaran agar laporan dan rekomendasi AI lebih akurat."
                    icon={Tags}
                />

                <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Tambah Kategori</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-4" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={form.data.name}
                                        onChange={(event) => form.setData('name', event.target.value)}
                                        placeholder="Langganan aplikasi"
                                    />
                                    <FormError message={form.errors.name} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipe</Label>
                                    <FinanceSelect
                                        value={form.data.type}
                                        onValueChange={(value) => form.setData('type', value)}
                                        options={[
                                            { value: 'expense', label: 'Pengeluaran' },
                                            { value: 'income', label: 'Pemasukan' },
                                        ]}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="color">Warna</Label>
                                    <Input
                                        id="color"
                                        type="color"
                                        value={form.data.color}
                                        onChange={(event) => form.setData('color', event.target.value)}
                                    />
                                </div>
                                <div className="grid gap-3 text-sm">
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_essential}
                                            onCheckedChange={(value) => form.setData('is_essential', Boolean(value))}
                                        />{' '}
                                        Kebutuhan wajib
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_savable}
                                            onCheckedChange={(value) => form.setData('is_savable', Boolean(value))}
                                        />{' '}
                                        Bisa dihemat
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <Checkbox
                                            checked={form.data.is_lifestyle}
                                            onCheckedChange={(value) => form.setData('is_lifestyle', Boolean(value))}
                                        />{' '}
                                        Lifestyle
                                    </label>
                                </div>
                                <SubmitButton processing={form.processing}>Simpan Kategori</SubmitButton>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Daftar Kategori</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-3 md:grid-cols-2">
                            {categories.map((category) => (
                                <div key={category.id} className="flex items-center justify-between gap-3 rounded-lg border p-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="size-3 rounded-full" style={{ backgroundColor: category.color || '#64748b' }} />
                                            <p className="font-medium">{category.name}</p>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <Badge variant="outline">{category.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}</Badge>
                                            {category.is_default && <Badge variant="secondary">Default</Badge>}
                                            {category.is_savable && <Badge variant="outline">Bisa hemat</Badge>}
                                        </div>
                                    </div>
                                    {!category.is_default && (
                                        <button
                                            className="text-muted-foreground rounded-md p-2 hover:bg-rose-50 hover:text-rose-700"
                                            onClick={() => router.delete(`/categories/${category.id}`, { preserveScroll: true })}
                                            aria-label="Hapus kategori"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
