<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MeetingController extends Controller
{
    public function index()
    {
        $meetings = Meeting::with(['room', 'user', 'attendees'])->get();
        // Transform attendees to array of user IDs
        $meetings->transform(function ($meeting) {
            $meetingArray = $meeting->toArray();
            $meetingArray['attendees'] = collect($meeting->attendees)->pluck('user_id')->toArray();
            return $meetingArray;
        });
        return response()->json($meetings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'user_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'title' => 'required|string|max:255',
            'agenda' => 'nullable|string',
            'attendees' => 'nullable|array',
            'attendees.*' => 'exists:users,id',
        ]);

        $attendees = $validated['attendees'] ?? [];
        unset($validated['attendees']);

        $meeting = Meeting::create($validated);

        // Create attendee records
        foreach ($attendees as $attendeeId) {
            \App\Models\Attendee::firstOrCreate([
                'user_id' => $attendeeId,
                'meeting_id' => $meeting->id
            ]);
        }

        // Transform attendees to array of user IDs
        $meeting = $meeting->load(['room', 'user', 'attendees']);
        $meetingArray = $meeting->toArray();
        $meetingArray['attendees'] = collect($meeting->attendees)->pluck('user_id')->toArray();
        return response()->json($meetingArray, 201);
    }

    public function show(Meeting $meeting)
    {
        $meeting = $meeting->load(['room', 'user', 'attendees']);
        $meetingArray = $meeting->toArray();
        $meetingArray['attendees'] = collect($meeting->attendees)->pluck('user_id')->toArray();
        return response()->json($meetingArray);
    }

    public function update(Request $request, Meeting $meeting)
    {
        $validated = $request->validate([
            'room_id' => 'sometimes|exists:rooms,id',
            'user_id' => 'sometimes|exists:users,id',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'title' => 'sometimes|string|max:255',
            'agenda' => 'nullable|string'
        ]);

        try {
            $meeting->update($validated);
            return response()->json([
                'message' => 'Meeting updated successfully',
                'data' => $meeting->load(['room', 'user', 'attendees'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Meeting $meeting)
    {
        try {
            $meeting->delete();
            return response()->json([
                'message' => 'Meeting deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}