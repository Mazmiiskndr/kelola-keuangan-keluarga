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
        Schema::create('debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('family_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('type', 50)->default('personal_loan');
            $table->string('lender')->nullable();
            $table->decimal('principal_amount', 16, 2);
            $table->decimal('outstanding_amount', 16, 2);
            $table->decimal('monthly_payment', 16, 2);
            $table->decimal('minimum_payment', 16, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->date('start_date')->nullable();
            $table->unsignedSmallInteger('tenor_months')->nullable();
            $table->unsignedSmallInteger('remaining_tenor_months')->nullable();
            $table->unsignedTinyInteger('due_day')->nullable();
            $table->date('next_due_date')->nullable();
            $table->foreignId('payment_account_id')->nullable()->constrained('financial_accounts')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('auto_generate_expense')->default(false);
            $table->boolean('include_in_monthly_expense')->default(true);
            $table->string('status', 50)->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'status', 'next_due_date']);
            $table->index(['family_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debts');
    }
};
