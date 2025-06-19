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
        'discussion_points',
        'decisions',
        'summary_pdf'
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