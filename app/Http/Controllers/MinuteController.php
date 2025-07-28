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
        $query = Minute::with(['meeting.room', 'meeting.user', 'actionItems.assignee']);
        
        if ($request->has('meeting_id')) {
            $query->where('meeting_id', $request->meeting_id);
        }
        
        return response()->json($query->get());
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
            'actionItems.*.action' => 'required|string',
            'actionItems.*.assignee' => 'required|exists:users,id',
            'actionItems.*.dueDate' => 'required|date',
            'actionItems.*.status' => 'nullable|string|in:pending,in-progress,completed',
            'notes' => 'nullable|string',
            'attachments' => 'nullable|array'
        ]);

        try {
            DB::beginTransaction();

            // Check if minutes already exist for this meeting
            $existingMinute = Minute::where('meeting_id', $validated['meeting_id'])->first();

            if ($existingMinute) {
                // Update existing minute
                $existingMinute->update([
                    'title' => $validated['title'],
                    'date' => $validated['date'],
                    'attendees' => $validated['attendees'],
                    'agenda' => $validated['agenda'] ?? null,
                    'discussion_points' => $validated['discussionPoints'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'attachments' => $validated['attachments'] ?? null
                ]);

                // Delete existing action items and create new ones
                $existingMinute->actionItems()->delete();

                if (!empty($validated['actionItems'])) {
                    foreach ($validated['actionItems'] as $item) {
                        ActionItem::create([
                            'minute_id' => $existingMinute->id,
                            'assignee_id' => $item['assignee'],
                            'action' => $item['action'],
                            'due_date' => $item['dueDate'],
                            'status' => $item['status'] ?? 'pending'
                        ]);
                    }
                }

                $minute = $existingMinute;
            } else {
                // Create new minute
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
            }

            DB::commit();

            return response()->json($minute->load(['meeting', 'actionItems.assignee']), $existingMinute ? 200 : 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to save minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show(Minute $minute)
    {
        $minute->load(['meeting.room', 'meeting.user', 'actionItems.assignee']);
        return response()->json($minute);
    }

    public function update(Request $request, Minute $minute)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'date' => 'sometimes|date',
            'attendees' => 'sometimes|array',
            'attendees.*' => 'exists:users,id',
            'agenda' => 'nullable|string',
            'discussionPoints' => 'nullable|array',
            'actionItems' => 'nullable|array',
            'actionItems.*.action' => 'required|string',
            'actionItems.*.assignee' => 'required|exists:users,id',
            'actionItems.*.dueDate' => 'required|date',
            'actionItems.*.status' => 'nullable|string|in:pending,in-progress,completed',
            'notes' => 'nullable|string',
            'attachments' => 'nullable|array',
            'discussion_points' => 'nullable|string',
            'decisions' => 'nullable|string',
            'summary_pdf' => 'nullable|string|max:255'
        ]);

        try {
            DB::beginTransaction();

            // Update minute basic info
            $minute->update([
                'title' => $validated['title'] ?? $minute->title,
                'date' => $validated['date'] ?? $minute->date,
                'attendees' => $validated['attendees'] ?? $minute->attendees,
                'agenda' => $validated['agenda'] ?? $minute->agenda,
                'discussion_points' => $validated['discussionPoints'] ?? $validated['discussion_points'] ?? $minute->discussion_points,
                'notes' => $validated['notes'] ?? $minute->notes,
                'attachments' => $validated['attachments'] ?? $minute->attachments,
                'decisions' => $validated['decisions'] ?? $minute->decisions,
                'summary_pdf' => $validated['summary_pdf'] ?? $minute->summary_pdf
            ]);

            // Update action items if provided
            if (array_key_exists('actionItems', $validated)) {
                // Delete existing action items
                $minute->actionItems()->delete();
                
                // Create new action items
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
            }

            DB::commit();

            return response()->json([
                'message' => 'Minute updated successfully',
                'data' => $minute->load(['meeting', 'actionItems.assignee'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Minute $minute)
    {
        try {
            DB::beginTransaction();
            
            // Delete associated action items first
            $minute->actionItems()->delete();
            
            // Delete the minute
            $minute->delete();
            
            DB::commit();
            
            return response()->json([
                'message' => 'Minute deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to delete minute',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}