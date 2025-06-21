<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index()
    {
        return Notification::with(['user'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'type' => 'required|string|max:50',
            'message' => 'required|string',
            'is_read' => 'sometimes|boolean'
        ]);

        $notification = Notification::create($validated);
        return response()->json($notification, 201);
    }

    public function show(Notification $notification)
    {
        return $notification->load(['user']);
    }

    public function update(Request $request, Notification $notification)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'type' => 'sometimes|string|max:50',
            'message' => 'sometimes|string',
            'is_read' => 'sometimes|boolean'
        ]);

        try {
            $notification->update($validated);
            return response()->json([
                'message' => 'Notification updated successfully',
                'data' => $notification->load(['user'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Notification $notification)
    {
        try {
            $notification->delete();
            return response()->json([
                'message' => 'Notification deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete notification',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}