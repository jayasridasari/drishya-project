import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';

function KanbanBoard() {
  const [tasks, setTasks] = useState({ Todo: [], 'In Progress': [], Done: [] });
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/api/kanban/board');
      setTasks(data.board);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(tasks).flat().find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) {
      setActiveTask(null);
      return;
    }

    const newStatus = over.id;
    const taskId = active.id;

    try {
      await api.patch(`/api/kanban/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }

    setActiveTask(null);
  };

  return (
    <DndContext 
      collisionDetection={closestCenter} 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd}
    >
      <div className="kanban">
        {['Todo', 'In Progress', 'Done'].map((status) => (
          <SortableContext 
            key={status} 
            items={tasks[status]?.map(t => t.id) || []} 
            strategy={verticalListSortingStrategy}
          >
            <div className="kanban-column">
              <h3>{status}</h3>
              {tasks[status]?.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        ))}
      </div>
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  );
}

export default KanbanBoard;
