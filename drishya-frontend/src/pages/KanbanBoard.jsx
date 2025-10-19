import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

// Sortable Task Card Component
function SortableTaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

// Droppable Column Component
function KanbanColumn({ status, tasks }) {
  const taskIds = tasks.map(t => t.id);

  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div className="kanban-column">
        <h3>
          {status} <span className="count">{tasks.length}</span>
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <p>No tasks</p>
            </div>
          )}
        </div>
      </div>
    </SortableContext>
  );
}

// Main Kanban Board Component
function KanbanBoard() {
  const [tasks, setTasks] = useState({ Todo: [], 'In Progress': [], Done: [] });
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/kanban/board');
      setTasks(data.board);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(tasks)
      .flat()
      .find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id;
    const overId = over.id;

    // Find which column the task is being dropped into
    let newStatus = null;
    
    // Check if dropped directly on a column
    if (['Todo', 'In Progress', 'Done'].includes(overId)) {
      newStatus = overId;
    } else {
      // Find the status of the task it was dropped on
      for (const [status, statusTasks] of Object.entries(tasks)) {
        if (statusTasks.some(t => t.id === overId)) {
          newStatus = status;
          break;
        }
      }
    }

    if (!newStatus) {
      setActiveTask(null);
      return;
    }

    // Find current status
    let currentStatus = null;
    for (const [status, statusTasks] of Object.entries(tasks)) {
      if (statusTasks.some(t => t.id === taskId)) {
        currentStatus = status;
        break;
      }
    }

    // If status hasn't changed, do nothing
    if (currentStatus === newStatus) {
      setActiveTask(null);
      return;
    }

    // Optimistically update UI
    setTasks((prev) => {
      const allTasks = Object.values(prev).flat();
      const task = allTasks.find((t) => t.id === taskId);
      
      return {
        ...prev,
        [currentStatus]: prev[currentStatus].filter((t) => t.id !== taskId),
        [newStatus]: [...prev[newStatus], { ...task, status: newStatus }],
      };
    });

    // Update backend
    try {
      await api.patch(`/api/kanban/tasks/${taskId}/status`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update task status:', error);
      toast.error('Failed to update task status');
      // Revert on error
      fetchTasks();
    }

    setActiveTask(null);
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-header">
        
        <h1>Progress</h1>
        <p>Drag and drop tasks between columns</p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban">
          <KanbanColumn status="Todo" tasks={tasks.Todo || []} />
          <KanbanColumn status="In Progress" tasks={tasks['In Progress'] || []} />
          <KanbanColumn status="Done" tasks={tasks.Done || []} />
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
