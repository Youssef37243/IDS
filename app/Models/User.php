<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use PHPOpenSourceSaver\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password_hash',
        'role'
    ];

    protected $hidden = [
        'password_hash',
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

    // Mutator for password_hash
    public function setPasswordHashAttribute($value)
    {
        $this->attributes['password_hash'] = password_hash($value, PASSWORD_BCRYPT);
    }

    // JWTSubject methods
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}