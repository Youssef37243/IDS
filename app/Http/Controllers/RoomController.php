<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;

class RoomController extends Controller
{
    public function index()
    {
        return Room::all();
    }

   public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:100',
        'capacity' => 'required|integer',
        'location' => 'nullable|string|max:100',
        'feature' => 'nullable|string|max:100'
    ]);

    $room = Room::create($validated);
    return response()->json($room, 201);
}


    public function show(Room $room)
    {
        return $room;
    }

    public function update(Request $request, Room $room)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'capacity' => 'sometimes|integer',
            'location' => 'nullable|string|max:100',
            'feature' => 'nullable|string|max:100'
        ]);

        try {
            $room->update($validated);
            return response()->json([
                'message' => 'Room updated successfully',
                'data' => $room
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update room',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Room $room)
    {
        try {
            // Start a database transaction
            \DB::beginTransaction();
            
            // Check if room has related meetings
            $meetingCount = $room->meetings()->count();
            
            // If cascade delete is requested
            if (request()->has('cascade') && request()->get('cascade') === 'true') {
                // Delete all related meetings first
                $deletedMeetings = $room->meetings()->delete();
                
                // Force delete the room
                $roomDeleted = $room->forceDelete();
                
                // Commit the transaction
                \DB::commit();
                
                return response()->json([
                    'message' => 'Room and all related meetings deleted successfully',
                    'deleted_meetings_count' => $deletedMeetings,
                    'room_deleted' => $roomDeleted,
                    'room_id' => $room->id
                ], 200);
            }
            
            if ($meetingCount > 0) {
                // Rollback transaction
                \DB::rollBack();
                
                return response()->json([
                    'message' => 'Cannot delete room',
                    'error' => "Room has {$meetingCount} related meeting(s). Delete the meetings first or use ?cascade=true parameter.",
                    'meeting_count' => $meetingCount,
                    'solution' => 'Add ?cascade=true to URL to delete room and all related meetings'
                ], 422);
            }
            
            // Force delete the room
            $roomDeleted = $room->forceDelete();
            
            // Commit the transaction
            \DB::commit();
            
            return response()->json([
                'message' => 'Room deleted successfully',
                'room_deleted' => $roomDeleted,
                'room_id' => $room->id
            ], 200);
            
        } catch (QueryException $e) {
            // Rollback transaction
            \DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to delete room',
                'error' => 'Database constraint error: ' . $e->getMessage(),
                'sql' => $e->getSql(),
                'bindings' => $e->getBindings()
            ], 500);
        } catch (\Exception $e) {
            // Rollback transaction
            \DB::rollBack();
            
            return response()->json([
                'message' => 'Failed to delete room',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}