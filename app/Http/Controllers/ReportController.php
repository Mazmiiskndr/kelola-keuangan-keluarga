<?php

namespace App\Http\Controllers;

use App\Services\Finance\FamilyAccessService;
use App\Services\Reports\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(
        private readonly ReportService $reports,
        private readonly FamilyAccessService $families,
    ) {}

    public function index(Request $request): Response
    {
        $scope = $request->string('scope')->toString() === 'family' ? 'family' : 'personal';
        $family = $scope === 'family' ? $this->families->resolveForUser($request->user(), $request->query('family_id')) : null;

        return Inertia::render('reports/index', [
            'report' => $this->reports->monthly($request->user(), $request->string('period')->toString() ?: null, $family ? 'family' : 'personal', $family),
            'families' => $this->families->activeFamilies($request->user())->map(fn ($family): array => [
                'id' => $family->id,
                'name' => $family->name,
                'currency' => $family->currency,
                'owner_user_id' => $family->owner_user_id,
            ]),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $scope = $request->string('scope')->toString() === 'family' ? 'family' : 'personal';
        $family = $scope === 'family' ? $this->families->resolveForUser($request->user(), $request->query('family_id')) : null;
        $report = $this->reports->monthly($request->user(), $request->string('period')->toString() ?: null, $family ? 'family' : 'personal', $family);

        return response()->streamDownload(function () use ($report): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Metric', 'Value']);
            foreach ($report['totals'] as $metric => $value) {
                fputcsv($handle, [$metric, $value]);
            }
            fputcsv($handle, []);
            fputcsv($handle, ['Anggota', 'Pemasukan', 'Pengeluaran', 'Tabungan', 'Cash Flow']);
            foreach ($report['member_breakdown'] ?? [] as $member) {
                fputcsv($handle, [$member['name'], $member['income'], $member['expense'], $member['saving'], $member['cash_flow']]);
            }
            fclose($handle);
        }, 'laporan-keuangan.csv');
    }
}
