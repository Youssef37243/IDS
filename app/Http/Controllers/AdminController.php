<?php

namespace App\Http\Controllers;

use App\Models\Meeting;
use App\Models\User;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function stats()
    {
        return response()->json([
            'total_meetings' => Meeting::count(),
             'active_users' => User::count(),
            'total_rooms' => Room::count()
        ]);
    }

    public function weeklyMeetingSummary(Request $request)
    {
        $weeks = $request->get('weeks', 4); // Default to last 4 weeks
        
        $weeklyData = Meeting::select(
            DB::raw('YEARWEEK(start_time) as year_week'),
            DB::raw('COUNT(*) as meeting_count'),
            DB::raw('MIN(start_time) as week_start')
        )
        ->where('start_time', '>=', Carbon::now()->subWeeks($weeks))
        ->groupBy('year_week')
        ->orderBy('year_week', 'desc')
        ->get()
        ->map(function ($item) {
            return [
                'week_start' => Carbon::parse($item->week_start)->startOfWeek()->format('Y-m-d'),
                'week_end' => Carbon::parse($item->week_start)->endOfWeek()->format('Y-m-d'),
                'meeting_count' => $item->meeting_count,
                'year_week' => $item->year_week
            ];
        });

        return response()->json([
            'weekly_summary' => $weeklyData,
            'total_weeks' => $weeklyData->count(),
            'period' => "Last {$weeks} weeks"
        ]);
    }

    public function monthlyMeetingSummary(Request $request)
    {
        $months = $request->get('months', 6); // Default to last 6 months
        
        $monthlyData = Meeting::select(
            DB::raw('YEAR(start_time) as year'),
            DB::raw('MONTH(start_time) as month'),
            DB::raw('COUNT(*) as meeting_count'),
            DB::raw('MIN(start_time) as month_start')
        )
        ->where('start_time', '>=', Carbon::now()->subMonths($months))
        ->groupBy('year', 'month')
        ->orderBy('year', 'desc')
        ->orderBy('month', 'desc')
        ->get()
        ->map(function ($item) {
            $date = Carbon::create($item->year, $item->month, 1);
            return [
                'month_name' => $date->format('F Y'),
                'month_start' => $date->startOfMonth()->format('Y-m-d'),
                'month_end' => $date->endOfMonth()->format('Y-m-d'),
                'meeting_count' => $item->meeting_count,
                'year' => $item->year,
                'month' => $item->month
            ];
        });

        return response()->json([
            'monthly_summary' => $monthlyData,
            'total_months' => $monthlyData->count(),
            'period' => "Last {$months} months"
        ]);
    }

    public function mostUsedRooms(Request $request)
    {
        $limit = $request->get('limit', 10); // Default to top 10 rooms
        $days = $request->get('days', 30); // Default to last 30 days
        
        $mostUsedRooms = Room::select([
            'rooms.id',
            'rooms.name',
            'rooms.capacity',
            'rooms.location',
            'rooms.feature',
            DB::raw('COUNT(meetings.id) as meeting_count'),
            DB::raw('SUM(TIMESTAMPDIFF(MINUTE, meetings.start_time, meetings.end_time)) as total_minutes'),
            DB::raw('AVG(TIMESTAMPDIFF(MINUTE, meetings.start_time, meetings.end_time)) as avg_meeting_duration')
        ])
        ->leftJoin('meetings', 'rooms.id', '=', 'meetings.room_id')
        ->when($days > 0, function ($query) use ($days) {
            return $query->where('meetings.start_time', '>=', Carbon::now()->subDays($days));
        })
        ->groupBy('rooms.id', 'rooms.name', 'rooms.capacity', 'rooms.location', 'rooms.feature')
        ->orderBy('meeting_count', 'desc')
        ->limit($limit)
        ->get()
        ->map(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->name,
                'capacity' => $room->capacity,
                'location' => $room->location,
                'feature' => $room->feature,
                'meeting_count' => (int) $room->meeting_count,
                'total_hours' => round($room->total_minutes / 60, 2),
                'avg_meeting_duration_minutes' => round($room->avg_meeting_duration, 1),
                'utilization_score' => $this->calculateUtilizationScore($room->meeting_count, $room->total_minutes)
            ];
        });

        return response()->json([
            'most_used_rooms' => $mostUsedRooms,
            'period' => $days > 0 ? "Last {$days} days" : "All time",
            'total_rooms_analyzed' => Room::count()
        ]);
    }

    public function comprehensiveDashboard(Request $request)
    {
        $period = $request->get('period', 30); // Default to last 30 days
        
        // Basic stats
        $totalMeetings = Meeting::count();
        $totalUsers = User::count();
        $totalRooms = Room::count();
        
        // Recent meetings count
        $recentMeetings = Meeting::where('start_time', '>=', Carbon::now()->subDays($period))->count();
        
        // Most active users
        $mostActiveUsers = User::select([
            'users.id',
            'users.first_name',
            'users.last_name',
            'users.email',
            DB::raw('COUNT(meetings.id) as meeting_count')
        ])
        ->leftJoin('meetings', 'users.id', '=', 'meetings.user_id')
        ->where('meetings.start_time', '>=', Carbon::now()->subDays($period))
        ->groupBy('users.id', 'users.first_name', 'users.last_name', 'users.email')
        ->orderBy('meeting_count', 'desc')
        ->limit(5)
        ->get();

        // Meeting trends (last 7 days)
        $dailyTrends = Meeting::select(
            DB::raw('DATE(start_time) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('start_time', '>=', Carbon::now()->subDays(7))
        ->groupBy('date')
        ->orderBy('date')
        ->get();

        return response()->json([
            'overview' => [
                'total_meetings' => $totalMeetings,
                'total_users' => $totalUsers,
                'total_rooms' => $totalRooms,
                'recent_meetings' => $recentMeetings,
                'period_days' => $period
            ],
            'most_active_users' => $mostActiveUsers,
            'daily_trends' => $dailyTrends,
            'generated_at' => now()->toISOString()
        ]);
    }

    private function calculateUtilizationScore($meetingCount, $totalMinutes)
    {
        // Simple utilization score: weighted average of meeting frequency and duration
        $frequencyScore = min($meetingCount * 2, 100); // Cap at 100
        $durationScore = min($totalMinutes / 10, 100); // Cap at 100
        
        return round(($frequencyScore + $durationScore) / 2, 1);
    }
}