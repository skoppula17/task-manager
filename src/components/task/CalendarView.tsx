import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isSameMonth } from 'date-fns';

interface CalendarViewProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export function CalendarView({ tasks, onTaskUpdate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous month to fill the grid
  const startDate = new Date(monthStart);
  startDate.setDate(startDate.getDate() - monthStart.getDay());
  
  // Add days from next month to fill the grid
  const endDate = new Date(monthEnd);
  endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.dueDate && isSameDay(new Date(task.dueDate), day)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const priorityColors = {
    urgent: 'bg-red-100 border-red-300 text-red-800',
    high: 'bg-orange-100 border-orange-300 text-orange-800',
    medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    low: 'bg-green-100 border-green-300 text-green-800'
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-6 w-6" />
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-lg border p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);
            
            return (
              <motion.div
                key={day.toISOString()}
                className={`min-h-[120px] p-2 border rounded-lg transition-colors ${
                  isCurrentMonth 
                    ? 'bg-background border-border' 
                    : 'bg-muted border-transparent'
                } ${
                  isDayToday 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : ''
                }`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${
                  isDayToday ? 'text-primary font-bold' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 3).map(task => (
                    <motion.div
                      key={task.id}
                      className={`text-xs p-1 rounded border cursor-pointer ${
                        priorityColors[task.priority]
                      } ${task.completed ? 'opacity-60 line-through' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={task.description}
                      onClick={() => onTaskUpdate(task.id, { completed: !task.completed })}
                    >
                      <div className="truncate">{task.title}</div>
                    </motion.div>
                  ))}
                  
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-muted-foreground p-1">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Priority:</span>
          {Object.entries(priorityColors).map(([priority, className]) => (
            <div key={priority} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded border ${className}`} />
              <span className="text-sm capitalize">{priority}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Tasks Summary */}
      {(() => {
        const todayTasks = getTasksForDay(new Date());
        if (todayTasks.length === 0) return null;
        
        return (
          <motion.div
            className="bg-gradient-primary p-6 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Today's Tasks ({todayTasks.length})
            </h3>
            <div className="space-y-2">
              {todayTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 bg-white/10 rounded-lg p-3"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onTaskUpdate(task.id, { completed: !task.completed })}
                    className="rounded"
                  />
                  <span className={`flex-1 text-white ${task.completed ? 'line-through opacity-60' : ''}`}>
                    {task.title}
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}