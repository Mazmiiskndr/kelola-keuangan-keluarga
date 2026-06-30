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
        Schema::table('financial_accounts', function (Blueprint $table) {
            if (! Schema::hasColumn('financial_accounts', 'bank_name')) {
                $table->string('bank_name')->nullable()->after('name');
            }

            if (! Schema::hasColumn('financial_accounts', 'account_holder_name')) {
                $table->string('account_holder_name')->nullable()->after('bank_name');
            }

            if (! Schema::hasColumn('financial_accounts', 'account_number')) {
                $table->string('account_number', 80)->nullable()->after('account_holder_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('financial_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('financial_accounts', 'account_number')) {
                $table->dropColumn('account_number');
            }

            if (Schema::hasColumn('financial_accounts', 'account_holder_name')) {
                $table->dropColumn('account_holder_name');
            }

            if (Schema::hasColumn('financial_accounts', 'bank_name')) {
                $table->dropColumn('bank_name');
            }
        });
    }
};
