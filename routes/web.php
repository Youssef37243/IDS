<?php

use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    if (auth()->check()) {

        return redirect('/dashboard');
    }
    return view('welcome');
});

// In routes/web.php
    Route::get('/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');

    // Add missing routes for all Blade views
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

    Route::get('/admin', function () {
        return view('admin');
    })->name('admin');

    Route::get('/active-meeting', function () {
        return view('active-meeting');
    })->name('active-meeting');

    // Guest dashboard route
    Route::get('/guest-dashboard', function () {
        return view('guest-dashboard');
    })->name('guest.dashboard');

Route::get('/login', function () {
    if (auth()->check()) {
        if (auth()->user() === 'admin') {
            return redirect('/admin');
        } elseif (auth()->user() === 'guest') {
            return redirect('/guest-dashboard');
        }
        return redirect('/dashboard');
    }
    return view('welcome');
})->name('login');

Route::get('/header', function () {
    return view('header');
})->name('header');