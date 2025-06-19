<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::apiResource('users', \App\Http\Controllers\UserController::class);
Route::apiResource('rooms', \App\Http\Controllers\RoomController::class);
Route::apiResource('meetings', \App\Http\Controllers\MeetingController::class);
Route::apiResource('attendees', \App\Http\Controllers\AttendeeController::class);
Route::apiResource('minutes', \App\Http\Controllers\MinuteController::class);
Route::apiResource('action-items', \App\Http\Controllers\ActionItemController::class);
Route::apiResource('notifications', \App\Http\Controllers\NotificationController::class);


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
