<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    public $timestamps = false;

    use HasFactory;

    protected $fillable = [
        'name',
        'capacity',
        'location',
        'feature'
    ];

    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }
}