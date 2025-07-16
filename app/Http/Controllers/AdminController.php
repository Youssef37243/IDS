<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\User;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_meetings' => Meeting::count(),
            'active_users' => User::count()
        ]);
    }
}