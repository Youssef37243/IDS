<?php

namespace App\Http\Controllers;

use App\Models\ActionItem;
use Illuminate\Http\Request;

class ActionItemController extends Controller
{
    public function index()
    {
        return ActionItem::with(['user', 'minute'])->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'minute_id' => 'required|exists:minutes,id',
            'description' => 'required|string',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|string|max:50'
        ]);

        $actionItem = ActionItem::create($validated);
        return response()->json($actionItem, 201);
    }

    public function show(ActionItem $actionItem)
    {
        return $actionItem->load(['user', 'minute']);
    }

    public function update(Request $request, ActionItem $actionItem)
    {
        $validated = $request->validate([
            'user_id' => 'sometimes|exists:users,id',
            'minute_id' => 'sometimes|exists:minutes,id',
            'description' => 'sometimes|string',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|string|max:50'
        ]);

        try {
            $actionItem->update($validated);
            return response()->json([
                'message' => 'Action item updated successfully',
                'data' => $actionItem->load(['user', 'minute'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update action item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(ActionItem $actionItem)
    {
        try {
            $actionItem->delete();
            return response()->json([
                'message' => 'Action item deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete action item',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}