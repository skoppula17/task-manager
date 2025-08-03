import { useState } from 'react';
import { motion } from 'framer-motion';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  Tag, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Play,
  Paperclip
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onUpdate: (updates: Partial<Task>) => void;
  onDelete: () => void;
  onEdit: () => void;
  onSelect: () => void;
}

export function TaskCard({ task, onUpdate, onDelete, onEdit, onSelect }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const priorityColors = {
    urgent: 'bg-task-urgent border-red-200',
    high: 'bg-task-high border-orange-200',
    medium: 'bg-task-medium border-yellow-200',
    low: 'bg-task-low border-green-200'
  };

  const priorityBadgeColors = {
    urgent: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const handleToggleComplete = () => {
    onUpdate({ completed: !task.completed });
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
        priorityColors[task.priority]
      } ${task.completed ? 'opacity-60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-medium)' }}
      layout
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={handleToggleComplete}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-foreground ${
              task.completed ? 'line-through' : ''
            }`}>
              {task.title}
            </h3>
            
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="h-6 w-6 p-0"
              >
                <Play className="h-3 w-3" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 w-6 p-0"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 mt-3">
            <Badge 
              variant="outline" 
              className={`text-xs ${priorityBadgeColors[task.priority]}`}
            >
              {task.priority.toUpperCase()}
            </Badge>
            
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <Calendar className="h-3 w-3" />
                {formatDueDate(new Date(task.dueDate))}
              </div>
            )}
            
            {task.pomodoroSessions > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {task.pomodoroSessions} sessions
              </div>
            )}
            
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3 w-3" />
                {task.attachments.length}
              </div>
            )}
          </div>
          
          {task.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <div className="flex gap-1 flex-wrap">
                {task.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}