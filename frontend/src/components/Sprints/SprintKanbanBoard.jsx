import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import BASE_API_URL from "../../data";
import { getToken } from "../../Token";
import { 
  Paper, 
  Box, 
  Typography, 
  IconButton, 
  Chip, 
  Avatar, 
  TextField,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import WarningIcon from "@mui/icons-material/Warning";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import dayjs from "dayjs";
import EditTaskModal from "./EditTaskModal";
import SuccessAlert from "../Alert/SuccessAlert";
import ErrorAlert from "../Alert/ErrorAlert";

const columns = [
  { id: "todo", title: "TO DO", status: "todo", color: "#f3f4f6", icon: "📋" },
  { id: "in_progress", title: "IN PROGRESS", status: "in_progress", color: "#dbeafe", icon: "⚙️", hasSubSections: true },
  { id: "in_review", title: "IN REVIEW", status: "in_review", color: "#fef3c7", icon: "👀" },
  { id: "done", title: "DONE", status: "done", color: "#dcfce7", icon: "✅" },
];

// Sub-sections for IN PROGRESS column
const inProgressSubSections = [
  { id: "pending", title: "PENDING", status: "pending", color: "#fef3c7" },
  { id: "in_progress", title: "IN PROGRESS", status: "in_progress", color: "#dbeafe" },
];

// Priority badge colors (Jira-style)
const priorityColors = {
  high: { bg: "#fee2e2", text: "#dc2626", label: "High", icon: "🔴" },
  medium: { bg: "#fef3c7", text: "#d97706", label: "Medium", icon: "🟡" },
  low: { bg: "#e0e7ff", text: "#2563eb", label: "Low", icon: "🔵" },
};

// Generate task key (like SPRINT-1, SPRINT-2)
const getTaskKey = (taskId, sprintId) => {
  return `SPRINT-${taskId}`;
};

function TaskCard({ task, onEdit, onDelete, sprintId }) {
  // Ensure task has a valid ID - tasks without IDs should not be rendered
  if (!task?.id) {
    console.error('TaskCard: Task without ID:', task);
    return null;
  }
  
  const taskId = task.id.toString();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: taskId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priority = task.priority || "medium";
  const priorityStyle = priorityColors[priority] || priorityColors.medium;
  const taskKey = getTaskKey(task.id, sprintId);
  const isOverdue = task.due_date && dayjs(task.due_date).isBefore(dayjs(), 'day');
  const isDueSoon = task.due_date && dayjs(task.due_date).diff(dayjs(), 'day') <= 3 && !isOverdue;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className="touch-manipulation flex-shrink-0"
    >
      <Paper
        className="mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-200"
        elevation={isDragging ? 8 : 1}
        sx={{ 
          flexShrink: 0,
          backgroundColor: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          padding: '12px',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderColor: '#d1d5db',
          }
        }}
        onMouseDown={(e) => {
          if (e.target.closest('button') || e.target.closest('[data-no-drag]')) {
            e.stopPropagation();
          }
        }}
      >
        {/* Task Title */}
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-sm flex-1 pr-2 text-gray-900" style={{ lineHeight: '1.4' }}>
            {task.title}
          </h4>
          <div className="flex gap-1" data-no-drag onClick={(e) => e.stopPropagation()}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onEdit(task);
              }}
              sx={{ 
                width: 24,
                height: 24,
                padding: 0.5,
                '&:hover': { backgroundColor: '#f3f4f6' }
              }}
            >
              <EditIcon fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(task);
              }}
              sx={{ 
                width: 24,
                height: 24,
                padding: 0.5,
                '&:hover': { backgroundColor: '#fee2e2' }
              }}
            >
              <DeleteIcon fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </div>
        </div>
        
        {/* Task Key and Priority */}
        <div className="flex items-center gap-2 mb-2">
          <Chip
            label={taskKey}
            size="small"
            sx={{
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
              '& .MuiChip-label': { px: 1 }
            }}
          />
          <Chip
            icon={<FlagIcon sx={{ fontSize: 12, color: priorityStyle.text }} />}
            label={priorityStyle.label}
            size="small"
            sx={{
              backgroundColor: priorityStyle.bg,
              color: priorityStyle.text,
              fontWeight: 600,
              fontSize: '0.7rem',
              height: '20px',
              '& .MuiChip-label': { px: 0.75 },
              '& .MuiChip-icon': { marginLeft: 0.5 }
            }}
          />
        </div>
        
        {/* Due Date */}
        {task.due_date && (
          <div className="flex items-center gap-1 mb-2 text-xs">
            <WarningIcon 
              sx={{ 
                fontSize: 14, 
                color: isOverdue ? '#dc2626' : isDueSoon ? '#d97706' : '#6b7280' 
              }} 
            />
            <span style={{ color: isOverdue ? '#dc2626' : isDueSoon ? '#d97706' : '#6b7280' }}>
              {dayjs(task.due_date).format("MMM D, YYYY")}
            </span>
            {isOverdue && (
              <Chip
                label="Overdue"
                size="small"
                sx={{ 
                  height: '16px', 
                  fontSize: '0.65rem',
                  backgroundColor: '#fee2e2',
                  color: '#dc2626',
                  ml: 0.5
                }}
              />
            )}
          </div>
        )}
        
        {/* Assignee */}
        <div className="flex items-center justify-between mt-2">
          {task.assigned_to ? (
            <Tooltip title={task.assigned_to.name || task.assigned_to.username || "Assigned"}>
              <Avatar
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.7rem',
                  backgroundColor: '#3b82f6'
                }}
              >
                {(task.assigned_to.name || task.assigned_to.username || "U").charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
          ) : (
            <Tooltip title="Unassigned">
              <Avatar
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.7rem',
                  backgroundColor: '#e5e7eb',
                  color: '#9ca3af'
                }}
              >
                <PersonIcon sx={{ fontSize: 14 }} />
              </Avatar>
            </Tooltip>
          )}
        </div>
      </Paper>
    </div>
  );
}

// Sub-section component for nested sections within a column
function SubSection({ id, title, tasks, onEdit, onDelete, allTaskIds, sprintId, subSectionColor }) {
  const validTasks = tasks.filter((task) => task?.id != null);
  
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        backgroundColor: isOver ? '#f0f9ff' : '#ffffff',
        border: isOver ? '2px dashed #3b82f6' : `1px solid ${subSectionColor.border}`,
        borderRadius: '4px',
        marginBottom: '12px',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {/* Sub-section Header */}
      <Box
        sx={{
          backgroundColor: subSectionColor.bg,
          borderBottom: `1px solid ${subSectionColor.border}`,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 600,
            color: subSectionColor.text,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}
        >
          {title}
        </Typography>
        <Chip 
          label={tasks.length} 
          size="small" 
          sx={{ 
            backgroundColor: '#ffffff',
            color: subSectionColor.text,
            fontWeight: 600,
            height: '18px',
            fontSize: '0.65rem',
            minWidth: '20px'
          }}
        />
      </Box>

      {/* Tasks in Sub-section */}
      <SortableContext items={allTaskIds} strategy={verticalListSortingStrategy}>
        <Box
          sx={{ 
            padding: '8px',
            minHeight: '100px',
            maxHeight: '400px',
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '3px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          }}
        >
          {validTasks.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                color: '#9ca3af'
              }}
            >
              <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                Drop tasks here
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {validTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  sprintId={sprintId}
                />
              ))}
            </Box>
          )}
        </Box>
      </SortableContext>
    </Box>
  );
}

function Column({ id, title, tasks, onEdit, onDelete, allTaskIds, columnColor, icon, sprintId, hasSubSections, subSections }) {
  // Filter out tasks without IDs and ensure all IDs are strings
  const validTasks = tasks.filter((task) => task?.id != null);
  const taskIds = validTasks.map((task) => task.id.toString());
  
  // Make the entire column a droppable zone
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  // Column header colors (Jira-style)
  const headerColors = {
    todo: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' },
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    in_progress: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
    in_review: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    done: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  };

  const headerStyle = headerColors[id] || headerColors.todo;

  // Sub-section colors
  const subSectionColors = {
    pending: { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
    in_progress: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
  };

  return (
    <div 
      className="flex-1 min-w-[280px] mx-2" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Box
        ref={setNodeRef}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          height: 'calc(100vh - 300px)',
          minHeight: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          backgroundColor: isOver ? '#f0f9ff' : '#ffffff',
          border: isOver ? '2px dashed #3b82f6' : `1px solid ${headerStyle.border}`,
          borderRadius: '4px',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        {/* Column Header (Jira-style) */}
        <Box
          sx={{
            backgroundColor: headerStyle.bg,
            borderBottom: `2px solid ${headerStyle.border}`,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                fontWeight: 600,
                color: headerStyle.text,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {title}
            </Typography>
            <Chip 
              label={tasks.length} 
              size="small" 
              sx={{ 
                backgroundColor: '#ffffff',
                color: headerStyle.text,
                fontWeight: 600,
                height: '22px',
                fontSize: '0.75rem',
                minWidth: '24px'
              }}
            />
          </Box>
          {id === 'done' && tasks.length > 0 && (
            <CheckCircleIcon sx={{ fontSize: 18, color: headerStyle.text }} />
          )}
        </Box>

        {/* Tasks Container - With Sub-sections or Regular */}
        {hasSubSections && subSections ? (
          <Box
            sx={{ 
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              padding: '12px',
              backgroundColor: '#fafafa',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '4px',
                '&:hover': {
                  backgroundColor: '#a8a8a8',
                },
              },
            }}
          >
            {subSections.map((subSection) => (
              <SubSection
                key={subSection.id}
                id={subSection.id}
                title={subSection.title}
                tasks={subSection.tasks}
                onEdit={onEdit}
                onDelete={onDelete}
                allTaskIds={allTaskIds}
                sprintId={sprintId}
                subSectionColor={subSectionColors[subSection.id] || subSectionColors.pending}
              />
            ))}
          </Box>
        ) : (
          <SortableContext items={allTaskIds} strategy={verticalListSortingStrategy}>
            <Box
              sx={{ 
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '12px',
                backgroundColor: '#fafafa',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              {validTasks.length === 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '200px',
                    color: '#9ca3af'
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', mb: 1 }}>
                    No tasks
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#d1d5db' }}>
                    Drop tasks here
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {validTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      sprintId={sprintId}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </SortableContext>
        )}
      </Box>
    </div>
  );
}

const SprintKanbanBoard = ({ sprintId, tasks, onTaskUpdate }) => {
  const [activeId, setActiveId] = useState(null);
  const [localTasks, setLocalTasks] = useState(Array.isArray(tasks) ? tasks : []);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [message, setMessage] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  
  // Auto-scroll refs
  const scrollContainerRef = useRef(null);
  const autoScrollIntervalRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced distance for smoother drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update local tasks when prop changes
  useEffect(() => {
    if (Array.isArray(tasks)) {
      setLocalTasks(tasks);
    } else {
      setLocalTasks([]);
    }
  }, [tasks]);

  // Get all valid task IDs for SortableContext
  const allTaskIds = React.useMemo(() => {
    return localTasks
      .filter((task) => task?.id != null)
      .map((task) => task.id.toString());
  }, [localTasks]);

  // Filter tasks by search and priority
  const filteredTasks = useCallback(() => {
    return localTasks.filter((task) => {
      if (!task?.id) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDescription = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }
      
      // Priority filter
      if (filterPriority && task.priority !== filterPriority) {
        return false;
      }
      
      return true;
    });
  }, [localTasks, searchQuery, filterPriority]);

  // Group tasks by status and ensure all tasks have valid IDs
  const getTasksByStatus = useCallback((status) => {
    const filtered = filteredTasks();
    return filtered.filter((task) => {
      if (!task?.id) {
        console.warn('Task without ID found:', task);
        return false;
      }
      return task.status === status;
    });
  }, [filteredTasks]);

  // Get tasks for IN PROGRESS column (includes both pending and in_progress)
  const getInProgressTasks = useCallback(() => {
    try {
      const filtered = filteredTasks();
      if (!Array.isArray(filtered)) {
        return { pending: [], in_progress: [] };
      }
      return {
        pending: filtered.filter((task) => task?.id && task.status === "pending") || [],
        in_progress: filtered.filter((task) => task?.id && task.status === "in_progress") || [],
      };
    } catch (error) {
      console.error("Error in getInProgressTasks:", error);
      return { pending: [], in_progress: [] };
    }
  }, [filteredTasks]);

  // Auto-scroll when dragging near edges - debounced to prevent excessive calls
  const handleAutoScroll = useCallback((event) => {
    if (!scrollContainerRef.current || !activeId) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const scrollThreshold = 80;
    const scrollSpeed = 8;

    // Throttle scroll operations
    const now = Date.now();
    if (handleAutoScroll.lastScrollTime && now - handleAutoScroll.lastScrollTime < 50) {
      return;
    }
    handleAutoScroll.lastScrollTime = now;

    // Check if near top edge
    if (event.clientY - rect.top < scrollThreshold) {
      container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
    }
    // Check if near bottom edge
    else if (rect.bottom - event.clientY < scrollThreshold) {
      container.scrollTop = Math.min(
        container.scrollHeight - container.clientHeight,
        container.scrollTop + scrollSpeed
      );
    }
    // Check if near left edge
    if (event.clientX - rect.left < scrollThreshold) {
      container.scrollLeft = Math.max(0, container.scrollLeft - scrollSpeed);
    }
    // Check if near right edge
    else if (rect.right - event.clientX < scrollThreshold) {
      container.scrollLeft = Math.min(
        container.scrollWidth - container.clientWidth,
        container.scrollLeft + scrollSpeed
      );
    }
  }, [activeId]);

  // Store mouse move handler reference for cleanup
  const mouseMoveHandlerRef = useRef(null);

  // Handle drag start
  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Handle drag over - debounced to prevent excessive calls
  const handleDragOver = useCallback((event) => {
    // Only auto-scroll if actively dragging
    if (activeId) {
      handleAutoScroll(event);
    }
  }, [activeId, handleAutoScroll]);

  // Handle drag end - smooth drag and drop with notifications
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return; // Drag cancelled - no drop target
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Find the task being dragged
    const activeTask = localTasks.find(
      (task) => task.id.toString() === activeId
    );
    if (!activeTask) {
      return;
    }

    // Determine target column status
    let targetStatus = null;
    let targetColumnName = "";

    // Check if dropping on a sub-section (pending or in_progress)
    const overSubSection = inProgressSubSections.find((sub) => sub.id === overId);
    if (overSubSection) {
      targetStatus = overSubSection.status;
      targetColumnName = overSubSection.title;
    } else {
      // Check if dropping directly on a column
      const overColumn = columns.find((col) => col.id === overId);
      if (overColumn) {
        // If dropping on IN PROGRESS column, default to "in_progress" status
        if (overColumn.id === "in_progress") {
          targetStatus = "in_progress";
          targetColumnName = "IN PROGRESS";
        } else {
          targetStatus = overColumn.status;
          targetColumnName = overColumn.title;
        }
      } else {
        // Dropped on another task - use that task's status
        const overTask = localTasks.find(
          (task) => task.id.toString() === overId
        );
        if (overTask) {
          targetStatus = overTask.status;
          const col = columns.find((c) => c.status === overTask.status || (c.id === "in_progress" && (overTask.status === "pending" || overTask.status === "in_progress")));
          targetColumnName = col?.title || "";
        } else {
          return; // Don't update if we can't determine target
        }
      }
    }

    // Only update if status is actually changing
    if (targetStatus && activeTask.status !== targetStatus) {
      setIsUpdating(true);
      const previousStatus = activeTask.status;
      
      try {
        const accessToken = getToken("accessToken");
        if (!accessToken) {
          setMessage("Authentication required. Please login again.");
          setShowError(true);
          return;
        }

        // Update local state immediately for instant feedback
        setLocalTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeTask.id
              ? { ...task, status: targetStatus }
              : task
          )
        );

        // Update backend
        await axios.patch(
          `${BASE_API_URL}/sprint-tasks/${activeTask.id}/`,
          {
            status: targetStatus,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            timeout: 5000, // 5 second timeout
          }
        );

        // Show success message
        setMessage(`Task moved to ${targetColumnName} successfully!`);
        setShowSuccess(true);

        // Notify parent component to refresh data - don't call immediately to avoid race conditions
        // The local state is already updated, so we can delay the refresh
        if (onTaskUpdate) {
          // Debounce to prevent rapid successive calls
          // Only refresh if no other update is pending
          const updateTimer = setTimeout(() => {
            try {
              onTaskUpdate();
            } catch (error) {
              // Silently handle errors from parent callback
              console.warn("Error in onTaskUpdate callback:", error);
            }
          }, 500); // Increased delay to prevent rapid calls
          
          // Store timer for cleanup
          if (handleDragEnd.updateTimer) {
            clearTimeout(handleDragEnd.updateTimer);
          }
          handleDragEnd.updateTimer = updateTimer;
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Failed to update task status. Please try again.";
        setMessage(errorMsg);
        setShowError(true);
        
        // Revert local state on error
        setLocalTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === activeTask.id
              ? { ...task, status: previousStatus }
              : task
          )
        );
      } finally {
        setIsUpdating(false);
      }
    }
  };

  // Handle edit
  const handleEdit = (task) => {
    setSelectedTask(task);
    setEditTaskOpen(true);
  };

  // Handle edit close
  const handleEditClose = () => {
    setEditTaskOpen(false);
    setSelectedTask(null);
  };

  // Handle task updated
  const handleTaskUpdated = () => {
    setMessage("Task updated successfully!");
    setShowSuccess(true);
    handleEditClose();
    
    // Notify parent component - debounced to prevent multiple calls
    if (onTaskUpdate) {
      setTimeout(() => {
        onTaskUpdate();
      }, 100);
    }
  };

  // Handle delete
  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      return;
    }

    try {
      const accessToken = getToken("accessToken");
      if (!accessToken) {
        setMessage("Authentication required. Please login again.");
        setShowError(true);
        return;
      }

      await axios.delete(`${BASE_API_URL}/sprint-tasks/${task.id}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Update local state
      setLocalTasks((prevTasks) =>
        prevTasks.filter((t) => t.id !== task.id)
      );

      setMessage("Task deleted successfully!");
      setShowSuccess(true);

      // Notify parent component - debounced to prevent multiple calls
      if (onTaskUpdate) {
        setTimeout(() => {
          onTaskUpdate();
        }, 100);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || "Failed to delete task. Please try again.";
      setMessage(errorMsg);
      setShowError(true);
    }
  };

  const activeTask = activeId
    ? localTasks.find((task) => task.id.toString() === activeId)
    : null;

  // Improved collision detection - prioritize rectIntersection for smoother drag
  const collisionDetectionStrategy = (args) => {
    // Strategy 1: Use rectIntersection - detects when draggable item overlaps with droppable area
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // Strategy 2: Use pointerWithin for precise pointer-based detection
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Strategy 3: Use closestCenter as fallback
    return closestCenter(args);
  };

  return (
    <div>
      <SuccessAlert
        show={showSuccess}
        message={message}
        onClose={() => setShowSuccess(false)}
      />
      <ErrorAlert
        show={showError}
        message={message}
        onClose={() => setShowError(false)}
      />
      
      {/* Search and Filter Bar (Jira-style) */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Search board..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, maxWidth: 400, backgroundColor: '#ffffff' }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: '#6b7280' }} />
          <Chip
            label="Priority"
            size="small"
            sx={{ backgroundColor: '#f3f4f6' }}
          />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Box>
        {(searchQuery || filterPriority) && (
          <IconButton
            size="small"
            onClick={() => {
              setSearchQuery("");
              setFilterPriority("");
            }}
            sx={{ color: '#6b7280' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null);
        }}
      >
        <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            alignItems: 'flex-start',
            minHeight: '500px',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: '#a8a8a8',
              },
            },
          }}
        >
          {columns.map((column) => {
            try {
              // Handle IN PROGRESS column with sub-sections
              if (column.hasSubSections && column.id === 'in_progress') {
                const inProgressTasks = getInProgressTasks();
                const subSections = inProgressSubSections.map((subSection) => ({
                  ...subSection,
                  tasks: Array.isArray(inProgressTasks[subSection.status]) 
                    ? inProgressTasks[subSection.status] 
                    : [],
                }));
                
                return (
                  <Column
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    tasks={[
                      ...(Array.isArray(inProgressTasks.pending) ? inProgressTasks.pending : []),
                      ...(Array.isArray(inProgressTasks.in_progress) ? inProgressTasks.in_progress : [])
                    ]}
                    allTaskIds={allTaskIds}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    columnColor={column.color}
                    icon={column.icon}
                    sprintId={sprintId}
                    hasSubSections={true}
                    subSections={subSections}
                  />
                );
              }
              
              // Regular column
              const columnTasks = getTasksByStatus(column.status);
              return (
                <Column
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={Array.isArray(columnTasks) ? columnTasks : []}
                  allTaskIds={allTaskIds}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  columnColor={column.color}
                  icon={column.icon}
                  sprintId={sprintId}
                />
              );
            } catch (error) {
              console.error(`Error rendering column ${column.id}:`, error);
              return (
                <Column
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  tasks={[]}
                  allTaskIds={[]}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  columnColor={column.color}
                  icon={column.icon}
                  sprintId={sprintId}
                />
              );
            }
          })}
        </Box>
        
        <DragOverlay>
          {activeTask ? (
            <Paper 
              sx={{
                p: 1.5,
                width: 280,
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                transform: 'rotate(2deg)',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: '0.875rem' }}>
                {activeTask.title}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <Chip
                  label={getTaskKey(activeTask.id, sprintId)}
                  size="small"
                  sx={{
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    fontSize: '0.7rem',
                    height: '18px',
                  }}
                />
                <Chip
                  label={priorityColors[activeTask.priority || 'medium']?.label}
                  size="small"
                  sx={{
                    backgroundColor: priorityColors[activeTask.priority || 'medium']?.bg,
                    color: priorityColors[activeTask.priority || 'medium']?.text,
                    fontSize: '0.7rem',
                    height: '18px',
                  }}
                />
              </Box>
              {activeTask.assigned_to && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <Avatar sx={{ width: 20, height: 20, fontSize: '0.7rem' }}>
                    {(activeTask.assigned_to.name || activeTask.assigned_to.username || "U").charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    {activeTask.assigned_to.name || activeTask.assigned_to.username}
                  </Typography>
                </Box>
              )}
            </Paper>
          ) : null}
        </DragOverlay>

        {/* Edit Task Modal */}
        {editTaskOpen && selectedTask && (
          <EditTaskModal
            open={editTaskOpen}
            onClose={handleEditClose}
            task={selectedTask}
            sprintId={sprintId}
            onTaskUpdated={handleTaskUpdated}
          />
        )}
      </DndContext>
      
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          Updating task...
        </div>
      )}
    </div>
  );
};

export default SprintKanbanBoard;
