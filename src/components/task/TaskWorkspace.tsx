import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { CalendarView } from './CalendarView';
import { TaskPage, Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  List, 
  Calendar, 
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';

interface TaskWorkspaceProps {
  currentPage: TaskPage | null;
  onPageUpdate: (page: TaskPage) => void;
  onTaskSelect: (task: Task) => void;
}

export function TaskWorkspace({ currentPage, onPageUpdate, onTaskSelect }: TaskWorkspaceProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [activeView, setActiveView] = useState<'list' | 'calendar'>('list');

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground mb-4">
            Select a page to get started
          </h2>
          <p className="text-muted-foreground">
            Choose a page from the sidebar or create a new one
          </p>
        </div>
      </div>
    );
  }

  const handleTaskCreate = (taskData: Partial<Task>) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: taskData.title || '',
      description: taskData.description,
      completed: false,
      priority: taskData.priority || 'medium',
      dueDate: taskData.dueDate,
      tags: taskData.tags || [],
      attachments: [],
      pomodoroSessions: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...taskData
    };

    const updatedPage = {
      ...currentPage,
      tasks: [...currentPage.tasks, newTask],
      updatedAt: new Date()
    };
    
    onPageUpdate(updatedPage);
    setShowTaskForm(false);
  };

  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    const updatedPage = {
      ...currentPage,
      tasks: currentPage.tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
      updatedAt: new Date()
    };
    
    onPageUpdate(updatedPage);
    setEditingTask(null);
  };

  const handleTaskDelete = (taskId: string) => {
    const updatedPage = {
      ...currentPage,
      tasks: currentPage.tasks.filter(task => task.id !== taskId),
      updatedAt: new Date()
    };
    
    onPageUpdate(updatedPage);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(currentPage.title, 20, 30);
    
    doc.setFontSize(12);
    let yPosition = 50;
    
    currentPage.tasks.forEach((task, index) => {
      const status = task.completed ? '✓' : '○';
      const priority = task.priority.toUpperCase();
      const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
      
      doc.text(`${status} [${priority}] ${task.title}`, 20, yPosition);
      if (task.description) {
        doc.setFontSize(10);
        doc.text(`    ${task.description}`, 20, yPosition + 5);
        doc.setFontSize(12);
        yPosition += 5;
      }
      doc.text(`    Due: ${dueDate}`, 20, yPosition + 5);
      yPosition += 15;
      
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
    });
    
    doc.save(`${currentPage.title.replace(/\s+/g, '_')}_tasks.pdf`);
  };

  const filteredTasks = currentPage.tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="flex-1 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl"
          >
            {currentPage.icon}
          </motion.div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentPage.title}</h1>
            <p className="text-muted-foreground">
              {currentPage.tasks.length} tasks • {currentPage.tasks.filter(t => !t.completed).length} pending
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
          
          <Button
            onClick={() => setShowTaskForm(true)}
            className="gap-2 bg-gradient-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as 'list' | 'calendar')}>
        <TabsList className="mb-6">
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <TaskList
            tasks={filteredTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
            onTaskEdit={setEditingTask}
            onTaskSelect={onTaskSelect}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            tasks={filteredTasks}
            onTaskUpdate={handleTaskUpdate}
          />
        </TabsContent>
      </Tabs>

      {/* Task Form Modal */}
      <AnimatePresence>
        {(showTaskForm || editingTask) && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setShowTaskForm(false);
              setEditingTask(null);
            }}
          >
            <motion.div
              className="bg-card rounded-lg shadow-large p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TaskForm
                task={editingTask}
                onSubmit={editingTask ? 
                  (updates) => handleTaskUpdate(editingTask.id, updates) :
                  handleTaskCreate
                }
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}