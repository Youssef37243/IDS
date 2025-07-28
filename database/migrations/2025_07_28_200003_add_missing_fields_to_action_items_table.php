<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('action_items', function (Blueprint $table) {
            // Add the action field
            $table->string('action')->after('minute_id');
            
            // Rename user_id to assignee_id for clarity
            $table->renameColumn('user_id', 'assignee_id');
            
            // Update status default
            $table->string('status')->default('pending')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('action_items', function (Blueprint $table) {
            $table->dropColumn(['action']);
            $table->renameColumn('assignee_id', 'user_id');
            $table->string('status')->default('Pending')->change();
        });
    }
};