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

// Debug route to test database operations
Route::get('/debug/rooms/{id}', function($id) {
    $room = \App\Models\Room::find($id);
    if (!$room) {
        return response()->json(['message' => 'Room not found'], 404);
    }
    
    $meetingCount = $room->meetings()->count();
    
    return response()->json([
        'room' => $room,
        'meeting_count' => $meetingCount,
        'meetings' => $room->meetings()->get()
    ]);
});

// Test route to manually delete a room
Route::delete('/test/rooms/{id}', function($id) {
    try {
        \DB::beginTransaction();
        
        $room = \App\Models\Room::find($id);
        if (!$room) {
            return response()->json(['message' => 'Room not found'], 404);
        }
        
        $meetingCount = $room->meetings()->count();
        
        // Delete meetings first
        if ($meetingCount > 0) {
            $deletedMeetings = $room->meetings()->delete();
        }
        
        // Delete room
        $roomDeleted = $room->delete();
        
        \DB::commit();
        
        return response()->json([
            'message' => 'Test deletion completed',
            'room_deleted' => $roomDeleted,
            'meeting_count_before' => $meetingCount,
            'deleted_meetings' => $meetingCount > 0 ? $deletedMeetings : 0
        ]);
        
    } catch (\Exception $e) {
        \DB::rollBack();
        return response()->json([
            'message' => 'Test deletion failed',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
