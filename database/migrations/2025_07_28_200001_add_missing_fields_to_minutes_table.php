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
        Schema::table('minutes', function (Blueprint $table) {
            $table->string('title')->after('meeting_id');
            $table->date('date')->after('title');
            $table->json('attendees')->nullable()->after('date');
            $table->text('agenda')->nullable()->after('attendees');
            $table->text('notes')->nullable()->after('discussion_points');
            $table->json('attachments')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('minutes', function (Blueprint $table) {
            $table->dropColumn(['title', 'date', 'attendees', 'agenda', 'notes', 'attachments']);
        });
    }
};