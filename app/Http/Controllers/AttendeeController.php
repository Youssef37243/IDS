<?php

namespace App\Http\Controllers;

use App\Models\Attendee;
use Illuminate\Http\Request;

class AttendeeController extends Controller
{
    public function index()
    {
        return Attendee::with(['user', 'meeting'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'meeting_id' => 'required|exists:meetings,id'
        ]);

        $attendee = Attendee::firstOrCreate($validated);
        return response()->json($attendee, 201);
    }

    public function show(Attendee $attendee)
    {
        return $attendee->load(['user', 'meeting']);
    }

    public function update(Request $request, Attendee $attendee)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'meeting_id' => 'sometimes|exists:meetings,id'
        ]);

        try {
            $attendee->update($validated);
            return response()->json([
                'message' => 'Attendee updated successfully',
                'data' => $attendee->load(['user', 'meeting'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update attendee',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Attendee $attendee)
    {
        try {
            $attendee->delete();
            return response()->json([
                'message' => 'Attendee deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete attendee',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}