<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\Attendee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Get meetings where user is organizer or attendee
        $meetings = Meeting::with(['room', 'user', 'attendees.user'])
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('attendees', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->orderBy('start_time', 'asc')
            ->get();

        return response()->json($meetings);
    }

    public function showActiveMeeting(Request $request)
    {
        $meetingId = $request->query('id');
        
        if (!$meetingId) {
            return redirect('/dashboard')->with('error', 'No meeting ID provided');
        }

        $user = $request->user();
        
        // Check if user is authorized to join this meeting
        $meeting = Meeting::with(['room', 'user', 'attendees.user'])
            ->where('id', $meetingId)
            ->where(function($query) use ($user) {
                $query->where('user_id', $user->id)
                    ->orWhereHas('attendees', function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            })
            ->first();

        if (!$meeting) {
            return redirect('/dashboard')->with('error', 'Meeting not found or access denied');
        }

        return view('active-meeting');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'title' => 'required|string|max:255',
            'start_time' => 'required|date',
            'duration' => 'required|integer|min:15|max:240',
            'agenda' => 'nullable|string',
            'attendees' => 'nullable|array',
            'attendees.*' => 'exists:users,id',
            'recurring' => 'nullable|boolean',
            'video_conference' => 'nullable|boolean',
        ]);

        try {
            DB::beginTransaction();

            // Calculate end time
            $endTime = date('Y-m-d H:i:s', strtotime($validated['start_time']) + ($validated['duration'] * 60));

            // Check for conflicting meetings
            $conflictingMeeting = Meeting::where('room_id', $validated['room_id'])
                ->where(function($query) use ($validated, $endTime) {
                    $query->whereBetween('start_time', [$validated['start_time'], $endTime])
                        ->orWhereBetween('end_time', [$validated['start_time'], $endTime])
                        ->orWhere(function($q) use ($validated, $endTime) {
                            $q->where('start_time', '<', $validated['start_time'])
                                ->where('end_time', '>', $endTime);
                        });
                })
                ->first();

            if ($conflictingMeeting) {
                return response()->json([
                    'message' => 'The selected room is already booked for the chosen time slot.',
                    'conflict' => $conflictingMeeting
                ], 409);
            }

            // Create the meeting
            $meeting = Meeting::create([
                'room_id' => $validated['room_id'],
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'start_time' => $validated['start_time'],
                'end_time' => $endTime,
                'agenda' => $validated['agenda'] ?? null,
                'recurring' => $validated['recurring'] ?? false,
                'video_conference' => $validated['video_conference'] ?? false,
            ]);

            // Add attendees
            if (!empty($validated['attendees'])) {
                foreach ($validated['attendees'] as $attendeeId) {
                    Attendee::create([
                        'meeting_id' => $meeting->id,
                        'user_id' => $attendeeId
                    ]);
                }
            }

            DB::commit();

            return response()->json($meeting->load(['room', 'user', 'attendees.user']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create meeting',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Meeting $meeting)
    {
        // Load meeting with related data including attendees
        $meeting->load([
            'room',
            'user',
            'attendees.user'
        ]);
        
        return response()->json($meeting);
    }

    public function attendees(Meeting $meeting)
    {
        $attendees = $meeting->attendees()->with('user')->get();
        return response()->json($attendees);
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