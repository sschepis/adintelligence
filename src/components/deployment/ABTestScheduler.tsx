import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus,
  Trash2,
  Settings,
  Power,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Percent
} from "lucide-react";
import { ABTestSchedule, useABTestPersistence } from "@/hooks/useABTestPersistence";

const DAYS_OF_WEEK = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

const AUDIENCE_SEGMENTS = [
  "New Visitors",
  "Returning Customers",
  "High-Value Users",
  "Mobile Users",
  "Desktop Users",
  "Email Subscribers",
  "Social Traffic",
];

interface ABTestSchedulerProps {
  className?: string;
}

export function ABTestScheduler({ className }: ABTestSchedulerProps) {
  const { 
    schedules, 
    createSchedule, 
    updateSchedule, 
    toggleSchedule, 
    deleteSchedule 
  } = useABTestPersistence();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedSchedule, setExpandedSchedule] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    name: "",
    schedule_type: "time_of_day" as "time_of_day" | "audience_segment",
    start_time: "09:00",
    end_time: "17:00",
    days_of_week: [1, 2, 3, 4, 5],
    audience_segments: [] as string[],
    traffic_percent: 50,
    auto_conclude_hours: 24,
  });

  const handleCreateSchedule = async () => {
    if (!newSchedule.name.trim()) return;
    
    await createSchedule({
      name: newSchedule.name,
      enabled: true,
      schedule_type: newSchedule.schedule_type,
      start_time: newSchedule.schedule_type === "time_of_day" ? newSchedule.start_time : null,
      end_time: newSchedule.schedule_type === "time_of_day" ? newSchedule.end_time : null,
      days_of_week: newSchedule.days_of_week,
      audience_segments: newSchedule.schedule_type === "audience_segment" ? newSchedule.audience_segments : null,
      traffic_percent: newSchedule.traffic_percent,
      auto_conclude_hours: newSchedule.auto_conclude_hours,
    });
    
    setShowCreateForm(false);
    setNewSchedule({
      name: "",
      schedule_type: "time_of_day",
      start_time: "09:00",
      end_time: "17:00",
      days_of_week: [1, 2, 3, 4, 5],
      audience_segments: [],
      traffic_percent: 50,
      auto_conclude_hours: 24,
    });
  };

  const toggleDay = (day: number) => {
    setNewSchedule(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day].sort()
    }));
  };

  const toggleSegment = (segment: string) => {
    setNewSchedule(prev => ({
      ...prev,
      audience_segments: prev.audience_segments.includes(segment)
        ? prev.audience_segments.filter(s => s !== segment)
        : [...prev.audience_segments, segment]
    }));
  };

  const activeSchedules = schedules.filter(s => s.enabled);

  return (
    <div className={cn("glass-card rounded-xl p-5 animate-slide-up", className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-accent" />
          <h3 className="font-display font-bold text-lg">A/B Test Scheduler</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {activeSchedules.length} Active
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="mb-5 p-4 rounded-lg border border-accent/30 bg-accent/5 space-y-4">
          <div>
            <Label className="text-xs">Schedule Name</Label>
            <Input
              value={newSchedule.name}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Weekday Business Hours"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Schedule Type</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <Button
                variant={newSchedule.schedule_type === "time_of_day" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setNewSchedule(prev => ({ ...prev, schedule_type: "time_of_day" }))}
                className="gap-1.5"
              >
                <Clock className="h-4 w-4" />
                Time of Day
              </Button>
              <Button
                variant={newSchedule.schedule_type === "audience_segment" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setNewSchedule(prev => ({ ...prev, schedule_type: "audience_segment" }))}
                className="gap-1.5"
              >
                <Users className="h-4 w-4" />
                Audience
              </Button>
            </div>
          </div>

          {newSchedule.schedule_type === "time_of_day" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Start Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">End Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs">Days of Week</Label>
                <div className="flex gap-1 mt-1">
                  {DAYS_OF_WEEK.map(day => (
                    <Button
                      key={day.value}
                      variant={newSchedule.days_of_week.includes(day.value) ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => toggleDay(day.value)}
                      className="w-10 h-8 text-xs p-0"
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          {newSchedule.schedule_type === "audience_segment" && (
            <div>
              <Label className="text-xs">Target Segments</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {AUDIENCE_SEGMENTS.map(segment => (
                  <Badge
                    key={segment}
                    variant={newSchedule.audience_segments.includes(segment) ? "secondary" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleSegment(segment)}
                  >
                    {segment}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-xs flex items-center justify-between">
              <span>Traffic to Variant</span>
              <span className="text-accent">{newSchedule.traffic_percent}%</span>
            </Label>
            <Slider
              value={[newSchedule.traffic_percent]}
              onValueChange={(value) => setNewSchedule(prev => ({ ...prev, traffic_percent: value[0] }))}
              min={10}
              max={90}
              step={5}
              className="mt-2"
            />
          </div>

          <div>
            <Label className="text-xs">Auto-Conclude After (hours)</Label>
            <Input
              type="number"
              value={newSchedule.auto_conclude_hours}
              onChange={(e) => setNewSchedule(prev => ({ ...prev, auto_conclude_hours: parseInt(e.target.value) || 24 }))}
              min={1}
              max={168}
              className="mt-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreateForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleCreateSchedule}
              disabled={!newSchedule.name.trim()}
              className="flex-1"
            >
              Create Schedule
            </Button>
          </div>
        </div>
      )}

      {/* Schedules List */}
      {schedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No schedules created</p>
          <p className="text-xs mt-1">Create a schedule to automate A/B testing</p>
        </div>
      ) : (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {schedules.map(schedule => {
              const isExpanded = expandedSchedule === schedule.id;
              
              return (
                <div
                  key={schedule.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    schedule.enabled 
                      ? "bg-secondary/50 border-border" 
                      : "bg-secondary/20 border-border/50 opacity-60"
                  )}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedSchedule(isExpanded ? null : schedule.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={schedule.enabled}
                        onCheckedChange={() => toggleSchedule(schedule.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="text-sm font-medium">{schedule.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px]">
                            {schedule.schedule_type === "time_of_day" ? (
                              <><Clock className="h-2.5 w-2.5 mr-1" />{schedule.start_time} - {schedule.end_time}</>
                            ) : (
                              <><Users className="h-2.5 w-2.5 mr-1" />{schedule.audience_segments?.length || 0} segments</>
                            )}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            <Percent className="h-2.5 w-2.5 mr-1" />{schedule.traffic_percent}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); deleteSchedule(schedule.id); }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                      {schedule.schedule_type === "time_of_day" && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Days:</span>
                          {DAYS_OF_WEEK.filter(d => schedule.days_of_week.includes(d.value)).map(d => (
                            <Badge key={d.value} variant="secondary" className="text-[10px]">{d.label}</Badge>
                          ))}
                        </div>
                      )}
                      {schedule.schedule_type === "audience_segment" && schedule.audience_segments && (
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <span className="text-muted-foreground">Segments:</span>
                          {schedule.audience_segments.map(seg => (
                            <Badge key={seg} variant="secondary" className="text-[10px]">{seg}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Auto-conclude: {schedule.auto_conclude_hours}h</span>
                        <span>Traffic: {schedule.traffic_percent}%</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
