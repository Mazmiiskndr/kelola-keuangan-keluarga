<?php

namespace App\Http\Controllers;

use App\Services\Reports\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function __construct(private readonly ReportService $reports) {}

    public function index(Request $request): Response
    {
        return Inertia::render('reports/index', [
            'report' => $this->reports->monthly($request->user(), $request->string('period')->toString() ?: null),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $report = $this->reports->monthly($request->user(), $request->string('period')->toString() ?: null);

        return response()->streamDownload(function () use ($report): void {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Metric', 'Value']);
            foreach ($report['totals'] as $metric => $value) {
                fputcsv($handle, [$metric, $value]);
            }
            fclose($handle);
        }, 'laporan-keuangan.csv');
    }
}
