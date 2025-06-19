<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use Illuminate\Http\Request;

class MeetingController extends Controller
{
    public function index()
    {
        return Meeting::with(['room', 'user', 'attendees'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'user_id' => 'required|exists:users,id',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'title' => 'required|string|max:255',
            'agenda' => 'nullable|string'
        ]);

        $meeting = Meeting::create($validated);
        return response()->json($meeting, 201);
    }

    public function show(Meeting $meeting)
    {
        return $meeting->load(['room', 'user', 'attendees']);
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

        $meeting->update($validated);
        return response()->json($meeting);
    }

    public function destroy(Meeting $meeting)
    {
        $meeting->delete();
        return response()->json(null, 204);
    }
}