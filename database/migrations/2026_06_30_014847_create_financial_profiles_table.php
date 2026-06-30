<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('financial_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('account_type', 50)->default('personal');
            $table->decimal('monthly_income_estimate', 16, 2)->default(0);
            $table->unsignedTinyInteger('financial_month_start_day')->default(1);
            $table->unsignedSmallInteger('dependents_count')->default(0);
            $table->string('risk_profile', 50)->default('moderate');
            $table->decimal('target_saving_ratio', 5, 2)->default(20);
            $table->unsignedTinyInteger('emergency_fund_months')->default(6);
            $table->string('main_goal')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_profiles');
    }
};
