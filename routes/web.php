<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\MinuteController;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect('/dashboard');
    }
    return view('welcome');
});

// Authentication required routes
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    Route::get('/booking', function () {
        return view('booking');
    })->name('booking');

    Route::get('/review', function () {
        return view('review');
    })->name('review');

    Route::get('/minutes', function () {
        return view('minutes');
    })->name('minutes');

    Route::get('/profile', function () {
        return view('profile');
    })->name('profile');

    Route::get('/active-meeting', [MeetingController::class, 'showActiveMeeting'])->name('active-meeting');

    // Admin routes
    Route::middleware('admin')->group(function () {
        Route::get('/admin', function () {
            return view('admin');
        })->name('admin');
    });
});

// Guest dashboard route (no auth required)
Route::get('/guest-dashboard', function () {
    return view('guest-dashboard');
})->name('guest.dashboard');

Route::get('/login', function () {
    if (auth()->check()) {
        if (auth()->user()->role === 'admin') {
            return redirect('/admin');
        } elseif (auth()->user()->role === 'guest') {
            return redirect('/guest-dashboard');
        }
        return redirect('/dashboard');
    }
    return view('welcome');
})->name('login');

Route::get('/header', function () {
    return view('header');
})->name('header');