<?php

namespace App\Http\Controllers;

use App\Models\Minute;
use App\Models\ActionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MinuteController extends Controller
{
    public function index(Request $request)
    {
        $query = Minute::with(['meeting', 'actionItems.assignee']);
        
        if ($request->has('meeting_id')) {
            $query->where('meeting_id', $request->meeting_id);
        }
        
        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'meeting_id' => 'required|exists:meetings,id',
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'attendees' => 'required|array',
            'attendees.*' => 'exists:users,id',
            'agenda' => 'nullable|string',
            'discussionPoints' => 'nullable|array',
            'actionItems' => 'nullable|array',
            'notes' => 'nullable|string',
            'attachments' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            $minute = Minute::create([
                'meeting_id' => $validated['meeting_id'],
                'user_id' => $request->user()->id,
                'title' => $validated['title'],
                'date' => $validated['date'],
                'attendees' => $validated['attendees'],
                'agenda' => $validated['agenda'] ?? null,
                'discussion_points' => $validated['discussionPoints'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'attachments' => $validated['attachments'] ?? null
            ]);

            // Save action items
            if (!empty($validated['actionItems'])) {
                foreach ($validated['actionItems'] as $item) {
                    ActionItem::create([
                        'minute_id' => $minute->id,
                        'assignee_id' => $item['assignee'],
                        'action' => $item['action'],
                        'due_date' => $item['dueDate'],
                        'status' => $item['status'] ?? 'pending'
                    ]);
                }
            }

            DB::commit();

            return response()->json($minute->load(['meeting', 'actionItems.assignee']), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

// In MeetingController.php, update the show method:
public function show(Meeting $meeting)
{
    // Load meeting with related data
    $meeting->load([
        'room',
        'user',
        'attendees.user' // Load attendees with their user data
    ]);
    
    return response()->json($meeting);
}

    public function update(Request $request, Minute $minute)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'meeting_id' => 'sometimes|exists:meetings,id',
            'discussion_points' => 'nullable|string',
            'decisions' => 'nullable|string',
            'summary_pdf' => 'nullable|string|max:255'
        ]);

        try {
            $minute->update($validated);
            return response()->json([
                'message' => 'Minute updated successfully',
                'data' => $minute->load(['user', 'meeting', 'actionItems'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Minute $minute)
    {
        try {
            $minute->delete();
            return response()->json([
                'message' => 'Minute deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}