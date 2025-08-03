import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Update the import path to the correct relative path if the file exists
import { SidebarProvider } from '../components/ui/sidebar';
// Or, if SidebarProvider is not available, remove the import and its usage
// import { SidebarProvider } from '../components/ui/sidebar';
import { TaskSidebar } from './task/TaskSidebar';
import { TaskWorkspace } from './task/TaskWorkspace';
import { PomodoroTimer } from './pomodoro/PomodoroTimer';
import { NotificationCenter } from './notifications/NotificationCenter';
import { TaskPage, Task, Notification } from '../types/task';
import { Button } from '../components/ui/button';
import { Timer, Bell, Plus } from 'lucide-react';

export function TaskManagerLayout() {
  const [currentPage, setCurrentPage] = useState<TaskPage | null>(null);
  const [pages, setPages] = useState<TaskPage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Initialize with a default page
  useEffect(() => {
    const defaultPage: TaskPage = {
      id: 'default',
      title: 'My Tasks',
      icon: '📋',
      tasks: [],
      subpages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPages([defaultPage]);
    setCurrentPage(defaultPage);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <TaskSidebar 
            pages={pages}
            currentPage={currentPage}
            onPageSelect={setCurrentPage}
            onPageCreate={(page) => setPages(prev => [...prev, page])}
            onPageUpdate={(updated) => setPages(prev => 
              prev.map(p => p.id === updated.id ? updated : p)
            )}
          />
          
          <main className="flex-1 flex flex-col">
            {/* Top Header */}
            <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <motion.h1 
                  className="text-2xl font-semibold text-foreground"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPage?.title || 'Task Manager'}
                </motion.h1>
              </div>
              
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPomodoro(!showPomodoro)}
                  className="relative"
                >
                  <Timer className="h-4 w-4" />
                  Pomodoro
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </Button>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
              <div className="flex-1">
                <TaskWorkspace 
                  currentPage={currentPage}
                  onPageUpdate={(updated) => {
                    setCurrentPage(updated);
                    setPages(prev => prev.map(p => p.id === updated.id ? updated : p));
                  }}
                  onTaskSelect={setCurrentTask}
                />
              </div>
              
              {/* Floating Pomodoro Timer */}
              <AnimatePresence>
                {showPomodoro && (
                  <motion.div
                    className="w-80 border-l border-border bg-card"
                    initial={{ x: 320, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 320, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  >
                    <PomodoroTimer 
                      currentTask={currentTask}
                      onClose={() => setShowPomodoro(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Notification Center */}
        <AnimatePresence>
          {showNotifications && (
            <NotificationCenter
              notifications={notifications}
              onClose={() => setShowNotifications(false)}
              onMarkAsRead={(id) => setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
              )}
            />
          )}
        </AnimatePresence>
      </SidebarProvider>
    </div>
  );
}