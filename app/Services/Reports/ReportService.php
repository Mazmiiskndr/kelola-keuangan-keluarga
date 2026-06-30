<?php

namespace App\Services\Reports;

use App\Models\User;
use App\Services\Finance\FinancialMetricService;

class ReportService
{
    public function __construct(private readonly FinancialMetricService $metrics) {}

    /**
     * @return array<string, mixed>
     */
    public function monthly(User $user, ?string $period = null): array
    {
        return $this->metrics->monthlySummary($user, $period);
    }
}
