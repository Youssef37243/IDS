<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'minute_id',
        'description',
        'due_date',
        'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function minute()
    {
        return $this->belongsTo(Minute::class);
    }
}