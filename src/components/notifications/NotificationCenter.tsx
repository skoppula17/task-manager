import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '@/types/task';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Bell, 
  Clock, 
  AlertCircle, 
  Info,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
}

export function NotificationCenter({ 
  notifications, 
  onClose, 
  onMarkAsRead 
}: NotificationCenterProps) {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'deadline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-green-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'reminder':
        return 'border-l-blue-500 bg-blue-50';
      case 'deadline':
        return 'border-l-red-500 bg-red-50';
      case 'info':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-card rounded-lg shadow-large w-96 max-h-[80vh] overflow-hidden"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Notifications</h3>
            {unreadNotifications.length > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {unreadNotifications.length}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(80vh-80px)]">
          <div className="p-4 space-y-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="font-medium mb-2">No notifications</h4>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <>
                {/* Unread Notifications */}
                {unreadNotifications.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">New</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => unreadNotifications.forEach(n => onMarkAsRead(n.id))}
                        className="text-xs"
                      >
                        Mark all as read
                      </Button>
                    </div>
                    
                    {unreadNotifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors hover:bg-accent ${
                          getNotificationColor(notification.type)
                        }`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onMarkAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-foreground mb-1">
                              {notification.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                              <Badge variant="outline" className="text-xs capitalize">
                                {notification.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Read Notifications */}
                {readNotifications.length > 0 && (
                  <div className="space-y-3">
                    {unreadNotifications.length > 0 && (
                      <div className="border-t border-border pt-4">
                        <h4 className="font-medium text-muted-foreground mb-3">Earlier</h4>
                      </div>
                    )}
                    
                    {readNotifications.slice(0, 10).map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-lg border border-border opacity-70 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-sm text-foreground mb-1">
                              {notification.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                              </span>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span className="text-xs text-green-600">Read</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-border">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Trash2 className="h-4 w-4" />
              Clear all notifications
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}