<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('whatsapp:reminders')->dailyAt('21:00')->timezone('Asia/Jakarta');

Schedule::command('finance:send-debt-due-notifications')->dailyAt('08:00');
