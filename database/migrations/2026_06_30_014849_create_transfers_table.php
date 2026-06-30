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
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('family_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('from_account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->foreignId('to_account_id')->constrained('financial_accounts')->cascadeOnDelete();
            $table->decimal('amount', 16, 2);
            $table->date('transfer_date');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'transfer_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
