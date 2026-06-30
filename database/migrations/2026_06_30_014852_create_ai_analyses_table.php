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
        Schema::create('ai_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('family_id')->nullable()->constrained()->nullOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->string('analysis_type', 50);
            $table->json('input_snapshot');
            $table->json('metrics_snapshot');
            $table->text('result_summary')->nullable();
            $table->json('recommendations')->nullable();
            $table->string('model_name')->nullable();
            $table->string('status', 50)->default('completed');
            $table->timestamps();

            $table->index(['user_id', 'analysis_type', 'period_start']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ai_analyses');
    }
};
