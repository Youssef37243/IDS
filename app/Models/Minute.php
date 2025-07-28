<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Minute extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'meeting_id',
        'title',
        'date',
        'attendees',
        'agenda',
        'discussion_points',
        'notes',
        'attachments',
        'decisions',
        'summary_pdf'
    ];

    protected $casts = [
        'attendees' => 'array',
        'discussion_points' => 'array',
        'attachments' => 'array',
        'date' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function meeting()
    {
        return $this->belongsTo(Meeting::class);
    }

    public function actionItems()
    {
        return $this->hasMany(ActionItem::class);
    }
}