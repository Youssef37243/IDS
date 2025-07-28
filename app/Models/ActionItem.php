<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'minute_id',
        'assignee_id',
        'action',
        'due_date',
        'status',
        'description'
    ];

    protected $casts = [
        'due_date' => 'date'
    ];

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function minute()
    {
        return $this->belongsTo(Minute::class);
    }
}