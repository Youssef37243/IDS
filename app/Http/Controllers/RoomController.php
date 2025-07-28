<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Database\QueryException;
use Carbon\Carbon;

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

    public function availability(Request $request)
    {
        $period = $request->get('period', 'week'); // 'week' or 'month'
        $startDate = $request->get('start_date', Carbon::now()->startOfWeek()->format('Y-m-d'));
        
        if ($period === 'week') {
            $endDate = Carbon::parse($startDate)->addWeek()->endOfDay()->format('Y-m-d H:i:s');
        } else {
            $endDate = Carbon::parse($startDate)->addMonth()->endOfDay()->format('Y-m-d H:i:s');
        }
        
        $startDate = Carbon::parse($startDate)->startOfDay()->format('Y-m-d H:i:s');

        $rooms = Room::with(['meetings' => function($query) use ($startDate, $endDate) {
            $query->whereBetween('start_time', [$startDate, $endDate])
                  ->orWhereBetween('end_time', [$startDate, $endDate])
                  ->orWhere(function($q) use ($startDate, $endDate) {
                      $q->where('start_time', '<', $startDate)
                        ->where('end_time', '>', $endDate);
                  });
        }])->get();

        $availability = [];
        
        foreach ($rooms as $room) {
            $roomAvailability = [
                'room' => $room,
                'busy_periods' => [],
                'availability_summary' => []
            ];

            // Group meetings by date
            $meetingsByDate = $room->meetings->groupBy(function($meeting) {
                return Carbon::parse($meeting->start_time)->format('Y-m-d');
            });

            // Generate daily availability for the period
            $current = Carbon::parse($startDate);
            $end = Carbon::parse($endDate);

            while ($current <= $end) {
                $dateKey = $current->format('Y-m-d');
                $dayMeetings = $meetingsByDate->get($dateKey, collect());
                
                if ($dayMeetings->isEmpty()) {
                    $roomAvailability['availability_summary'][$dateKey] = 'Available all day';
                } else {
                    $busyTimes = [];
                    foreach ($dayMeetings as $meeting) {
                        $busyTimes[] = [
                            'start' => Carbon::parse($meeting->start_time)->format('H:i'),
                            'end' => Carbon::parse($meeting->end_time)->format('H:i'),
                            'title' => $meeting->title
                        ];
                    }
                    $roomAvailability['availability_summary'][$dateKey] = $busyTimes;
                }

                $current->addDay();
            }

            $availability[] = $roomAvailability;
        }

        return response()->json([
            'period' => $period,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'rooms' => $availability
        ]);
    }

    public function roomAvailability(Room $room, Request $request)
    {
        $period = $request->get('period', 'week');
        $startDate = $request->get('start_date', Carbon::now()->startOfWeek()->format('Y-m-d'));
        
        if ($period === 'week') {
            $endDate = Carbon::parse($startDate)->endOfWeek()->format('Y-m-d');
        } else {
            $endDate = Carbon::parse($startDate)->addMonth()->format('Y-m-d');
        }

        $meetings = $room->meetings()
            ->whereBetween('start_time', [$startDate . ' 00:00:00', $endDate . ' 23:59:59'])
            ->orderBy('start_time')
            ->get();

        $availability = [];
        $current = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);

        while ($current <= $end) {
            $dateKey = $current->format('Y-m-d');
            $dayMeetings = $meetings->filter(function($meeting) use ($dateKey) {
                return Carbon::parse($meeting->start_time)->format('Y-m-d') === $dateKey;
            });

            if ($dayMeetings->isEmpty()) {
                $availability[$dateKey] = 'Available all day';
            } else {
                $busyPeriods = [];
                foreach ($dayMeetings as $meeting) {
                    $busyPeriods[] = [
                        'start_time' => Carbon::parse($meeting->start_time)->format('H:i'),
                        'end_time' => Carbon::parse($meeting->end_time)->format('H:i'),
                        'title' => $meeting->title
                    ];
                }
                $availability[$dateKey] = $busyPeriods;
            }

            $current->addDay();
        }

        return response()->json([
            'room' => $room,
            'period' => $period,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'availability' => $availability
        ]);
    }
}