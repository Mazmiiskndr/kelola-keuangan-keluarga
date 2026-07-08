<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->text('title')->change();
            $table->text('next_action')->nullable()->change();
            $table->text('source_metric')->nullable()->change();
        });
        
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->text('headline')->nullable()->change();
            $table->text('model_name')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('ai_recommendations', function (Blueprint $table) {
            $table->string('title')->change();
            $table->string('next_action')->nullable()->change();
            $table->string('source_metric', 100)->nullable()->change();
        });
        
        Schema::table('ai_analyses', function (Blueprint $table) {
            $table->string('headline')->nullable()->change();
            $table->string('model_name')->nullable()->change();
        });
    }
};
