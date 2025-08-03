import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types/task';
import { TaskCard } from './TaskCard';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Clock, Plus } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  onTaskSelect: (task: Task) => void;
}

export function TaskList({ 
  tasks, 
  onTaskUpdate, 
  onTaskDelete, 
  onTaskEdit, 
  onTaskSelect 
}: TaskListProps) {
  const [groupBy, setGroupBy] = useState<'none' | 'priority' | 'status'>('none');

  const groupedTasks = () => {
    if (groupBy === 'none') return { 'All Tasks': tasks };
    
    if (groupBy === 'priority') {
      return tasks.reduce((groups, task) => {
        const priority = task.priority;
        if (!groups[priority]) groups[priority] = [];
        groups[priority].push(task);
        return groups;
      }, {} as Record<string, Task[]>);
    }
    
    if (groupBy === 'status') {
      return {
        'Pending': tasks.filter(t => !t.completed),
        'Completed': tasks.filter(t => t.completed)
      };
    }
    
    return { 'All Tasks': tasks };
  };

  const groups = groupedTasks();

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusIcon = (status: string) => {
    return status === 'Completed' ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> :
      <Clock className="h-4 w-4 text-orange-500" />;
  };

  if (tasks.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-foreground mb-2">No tasks yet</h3>
        <p className="text-muted-foreground mb-6">Create your first task to get started</p>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Group Controls */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">Group by:</span>
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value as any)}
          className="px-3 py-1 border border-border rounded-md bg-background text-foreground text-sm"
        >
          <option value="none">None</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, groupTasks]) => (
          <motion.div
            key={groupName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {groupBy !== 'none' && (
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border">
                {groupBy === 'priority' && getPriorityIcon(groupName)}
                {groupBy === 'status' && getStatusIcon(groupName)}
                <h3 className="font-semibold text-lg capitalize">
                  {groupName} ({groupTasks.length})
                </h3>
              </div>
            )}
            
            <div className="grid gap-3">
              {groupTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TaskCard
                    task={task}
                    onUpdate={(updates) => onTaskUpdate(task.id, updates)}
                    onDelete={() => onTaskDelete(task.id)}
                    onEdit={() => onTaskEdit(task)}
                    onSelect={() => onTaskSelect(task)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}