import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay, PointerSensor, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { useDroppable } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';
import Loader from '../components/common/Loader';
import { toast } from 'react-toastify';

// Draggable Task Card Component
function DraggableTaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} />
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({ id, title, tasks, count }) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  const columnStyle = {
    backgroundColor: isOver ? '#f0f9ff' : 'var(--bg-secondary)',
    border: isOver ? '2px dashed var(--primary)' : '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '20px',
    minHeight: '500px',
    flex: 1,
    transition: 'all 0.2s',
  };

  return (
    <div
      ref={setNodeRef}
      data-testid={`kanban-${id.replace(/\s/g, '').toLowerCase()}-column`} // <-- ADD THIS LINE
      style={columnStyle}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '12px',
        borderBottom: '2px solid var(--border-color)'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{title}</h3>
        <span style={{ 
          background: 'var(--primary)', 
          color: 'white', 
          padding: '4px 10px', 
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {count}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: 'var(--text-secondary)',
            fontSize: '14px'
          }}>
            No tasks
          </div>
        ) : (
          tasks.map(task => (
            <DraggableTaskCard key={task.id} task={task} />
          ))
        )}
      </div>
    </div>
  );
}

// Main Kanban Board Component
function KanbanBoard() {
  const [board, setBoard] = useState({ Todo: [], 'In Progress': [], Done: [] });
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBoard();
  }, []);

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/kanban/board');
      setBoard(data.board);
    } catch (error) {
      console.error('Failed to fetch board:', error);
      toast.error('Failed to load kanban board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(active.data.current?.task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    setActiveTask(null);

    if (!over) {
      console.log('❌ No drop target');
      return;
    }

    const taskId = active.id;
    const newStatus = over.id;

    // Find current status
    let currentStatus = null;
    for (const [status, tasks] of Object.entries(board)) {
      if (tasks.find(t => t.id === taskId)) {
        currentStatus = status;
        break;
      }
    }

    if (currentStatus === newStatus) {
      console.log('✅ Task dropped in same column');
      return;
    }

    console.log(`📝 Moving task ${taskId} from "${currentStatus}" to "${newStatus}"`);

    // Optimistic update
    const task = board[currentStatus].find(t => t.id === taskId);
    const updatedTask = { ...task, status: newStatus };

    setBoard(prev => ({
      ...prev,
      [currentStatus]: prev[currentStatus].filter(t => t.id !== taskId),
      [newStatus]: [...prev[newStatus], updatedTask]
    }));

    // Update on server
    try {
      await api.patch(`/api/kanban/${taskId}/status`, { status: newStatus });
      toast.success(`Task moved to ${newStatus}`);
    } catch (error) {
      console.error('❌ Failed to update task:', error);
      toast.error('Failed to update task status');
      // Revert on error
      fetchBoard();
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ marginBottom: '8px' }}>Kanban Board</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Drag and drop tasks between columns
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px' 
        }}>
          <DroppableColumn 
            id="Todo" 
            title="📋 To Do" 
            tasks={board.Todo} 
            count={board.Todo.length}
          />
          <DroppableColumn 
            id="In Progress" 
            title="🚀 In Progress" 
            tasks={board['In Progress']} 
            count={board['In Progress'].length}
          />
          <DroppableColumn 
            id="Done" 
            title="✅ Done" 
            tasks={board.Done} 
            count={board.Done.length}
          />
        </div>

        <DragOverlay>
          {activeTask ? (
            <div style={{ cursor: 'grabbing', opacity: 0.8 }}>
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default KanbanBoard;
