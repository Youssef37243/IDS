<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password_hash',
        'role'
    ];

    public function meetings()
    {
        return $this->hasMany(Meeting::class);
    }

    public function attendees()
    {
        return $this->hasMany(Attendee::class);
    }

    public function minutes()
    {
        return $this->hasMany(Minute::class);
    }

    public function actionItems()
    {
        return $this->hasMany(ActionItem::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}