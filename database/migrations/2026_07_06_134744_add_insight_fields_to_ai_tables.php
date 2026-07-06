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
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->string('headline')->nullable()->after('analysis_type');
            $table->string('tone', 50)->nullable()->after('headline');
            $table->tinyInteger('health_score')->nullable()->after('tone');
        });

        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->string('priority', 50)->nullable()->after('type');
            $table->text('why_it_matters')->nullable()->after('description');
            $table->string('next_action')->nullable()->after('why_it_matters');
            $table->string('source_metric', 100)->nullable()->after('next_action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->dropColumn(['headline', 'tone', 'health_score']);
        });

        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->dropColumn(['priority', 'why_it_matters', 'next_action', 'source_metric']);
        });
    }
};
