import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  X, 
  Clock,
  Coffee,
  Timer as TimerIcon
} from 'lucide-react';

interface PomodoroTimerProps {
  currentTask?: Task | null;
  onClose: () => void;
}

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

export function PomodoroTimer({ currentTask, onClose }: PomodoroTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const durations = {
    work: 25 * 60,      // 25 minutes
    shortBreak: 5 * 60, // 5 minutes
    longBreak: 15 * 60  // 15 minutes
  };

  const modeLabels = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };

  const modeColors = {
    work: 'bg-primary',
    shortBreak: 'bg-green-500',
    longBreak: 'bg-blue-500'
  };

  useEffect(() => {
    setTimeLeft(durations[mode]);
  }, [mode]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timeLeft === 0) {
        handleTimerComplete();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    if (mode === 'work') {
      setSessionsCompleted(prev => prev + 1);
      // After 4 work sessions, take a long break
      if ((sessionsCompleted + 1) % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
    
    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Pomodoro Timer', {
        body: mode === 'work' ? 'Time for a break!' : 'Time to focus!',
        icon: '/favicon.ico'
      });
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(durations[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TimerIcon className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Pomodoro Timer</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Timer Content */}
      <div className="flex-1 p-6 space-y-6">
        {/* Mode Selection */}
        <div className="flex gap-2">
          {Object.entries(modeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={mode === key ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(key as TimerMode)}
              disabled={isRunning}
              className="flex-1 text-xs"
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Current Task */}
        {currentTask && (
          <motion.div
            className="bg-accent rounded-lg p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="font-medium text-sm mb-1">Working on:</h4>
            <p className="text-accent-foreground font-medium">{currentTask.title}</p>
            <Badge variant="outline" className="mt-2 capitalize">
              {currentTask.priority}
            </Badge>
          </motion.div>
        )}

        {/* Timer Display */}
        <div className="text-center space-y-4">
          <motion.div
            className="text-6xl font-mono font-bold text-foreground"
            key={timeLeft}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.1 }}
          >
            {formatTime(timeLeft)}
          </motion.div>
          
          <Badge className={`${modeColors[mode]} text-white px-4 py-2`}>
            {modeLabels[mode]}
          </Badge>
          
          <Progress value={progress} className="w-full" />
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={toggleTimer}
            className="flex-1 gap-2"
            size="lg"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          
          <Button
            variant="outline"
            onClick={resetTimer}
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Stats */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sessions completed today:</span>
            <Badge variant="secondary">{sessionsCompleted}</Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coffee className="h-3 w-3" />
            <span>
              {sessionsCompleted % 4 === 0 ? 
                'Ready for long break!' : 
                `${4 - (sessionsCompleted % 4)} more until long break`
              }
            </span>
          </div>
        </div>

        {/* Notification Permission */}
        {'Notification' in window && Notification.permission === 'default' && (
          <Button
            variant="outline"
            size="sm"
            onClick={requestNotificationPermission}
            className="w-full text-xs"
          >
            Enable notifications
          </Button>
        )}
      </div>
    </motion.div>
  );
}