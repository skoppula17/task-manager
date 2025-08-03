import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TaskPage } from '@/types/task';
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Tag,
  FileText,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface TaskSidebarProps {
  pages: TaskPage[];
  currentPage: TaskPage | null;
  onPageSelect: (page: TaskPage) => void;
  onPageCreate: (page: TaskPage) => void;
  onPageUpdate: (page: TaskPage) => void;
}

export function TaskSidebar({ 
  pages, 
  currentPage, 
  onPageSelect, 
  onPageCreate, 
  onPageUpdate 
}: TaskSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [newPageTitle, setNewPageTitle] = useState('');
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  const handleCreatePage = () => {
    if (newPageTitle.trim()) {
      const newPage: TaskPage = {
        id: `page_${Date.now()}`,
        title: newPageTitle.trim(),
        icon: '📄',
        tasks: [],
        subpages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      onPageCreate(newPage);
      setNewPageTitle('');
      setShowNewPageInput(false);
    }
  };

  const togglePageExpansion = (pageId: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageId)) {
        newSet.delete(pageId);
      } else {
        newSet.add(pageId);
      }
      return newSet;
    });
  };

  const quickViews = [
    { id: 'today', title: 'Today', icon: Calendar, count: 0 },
    { id: 'completed', title: 'Completed', icon: CheckCircle, count: 0 },
    { id: 'pending', title: 'Pending', icon: Clock, count: 0 },
    { id: 'tags', title: 'Tags', icon: Tag, count: 0 },
  ];

  return (
    <Sidebar className={collapsed ? "w-16" : "w-72"} collapsible="icon">
      <SidebarTrigger className="m-2 self-end" />
      
      <SidebarContent className="p-4">
        {/* Quick Views */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground font-medium">
            Quick Views
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickViews.map((view) => (
                <SidebarMenuItem key={view.id}>
                  <SidebarMenuButton asChild>
                    <motion.button
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <view.icon className="h-4 w-4 text-muted-foreground" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left">{view.title}</span>
                          {view.count > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                              {view.count}
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pages */}
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="text-muted-foreground font-medium">
              Pages
            </SidebarGroupLabel>
            {!collapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewPageInput(true)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {/* New Page Input */}
              {showNewPageInput && !collapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2"
                >
                  <Input
                    value={newPageTitle}
                    onChange={(e) => setNewPageTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreatePage();
                      if (e.key === 'Escape') setShowNewPageInput(false);
                    }}
                    onBlur={() => {
                      if (newPageTitle.trim()) handleCreatePage();
                      else setShowNewPageInput(false);
                    }}
                    placeholder="Page name..."
                    className="h-8 text-sm"
                    autoFocus
                  />
                </motion.div>
              )}

              {/* Page List */}
              {pages.map((page) => (
                <SidebarMenuItem key={page.id}>
                  <SidebarMenuButton asChild>
                    <motion.button
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        currentPage?.id === page.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'hover:bg-accent'
                      }`}
                      onClick={() => onPageSelect(page)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {page.subpages.length > 0 && !collapsed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePageExpansion(page.id);
                          }}
                          className="hover:bg-black/10 rounded p-0.5"
                        >
                          {expandedPages.has(page.id) ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                        </button>
                      )}
                      <span className="text-sm">{page.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">{page.title}</span>
                          {page.tasks.length > 0 && (
                            <span className="text-xs opacity-70">
                              {page.tasks.filter(t => !t.completed).length}
                            </span>
                          )}
                        </>
                      )}
                    </motion.button>
                  </SidebarMenuButton>
                  
                  {/* Subpages */}
                  {expandedPages.has(page.id) && page.subpages.length > 0 && !collapsed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="ml-6 mt-1 space-y-1"
                    >
                      {page.subpages.map((subpage) => (
                        <button
                          key={subpage.id}
                          onClick={() => onPageSelect(subpage)}
                          className="w-full flex items-center gap-2 p-1.5 rounded text-sm hover:bg-accent"
                        >
                          <FileText className="h-3 w-3" />
                          <span className="flex-1 text-left">{subpage.title}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}