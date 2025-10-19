// pages/KanbanBoard.jsx
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState, useEffect } from 'react';
import api from '../services/api';

const KanbanBoard = () => {
  const [tasks, setTasks] = useState({ Todo: [], 'In Progress': [], Done: [] });
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await api.get('/api/kanban/board');
    setTasks(data.board);
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
    if (!over) return;

    const newStatus = over.id; // 'Todo', 'In Progress', 'Done'
    const taskId = active.id;

    // Update local state optimistically
    setTasks((prev) => {
      const allTasks = Object.values(prev).flat();
      const task = allTasks.find((t) => t.id === taskId);
      
      return {
        ...prev,
        [task.status]: prev[task.status].filter((t) => t.id !== taskId),
        [newStatus]: [...prev[newStatus], { ...task, status: newStatus }],
      };
    });

    // Update backend
    try {
      await api.patch(`/api/kanban/tasks/${taskId}/status`, { status: newStatus });
    } catch (error) {
      // Revert on error
      fetchTasks();
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-board">
        {['Todo', 'In Progress', 'Done'].map((status) => (
          <Column key={status} status={status} tasks={tasks[status]} />
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
    </DndContext>
  );
};
import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../services/api';
import TaskCard from '../components/tasks/TaskCard';

function KanbanBoard() {
  const [tasks, setTasks] = useState({ Todo: [], 'In Progress': [], Done: [] });
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => { fetchTasks(); }, []);
  const fetchTasks = async () => {
    const { data } = await api.get('/api/kanban/board');
    setTasks(data.board);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = Object.values(tasks).flat().find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const newStatus = over.id;
      await api.patch(`/api/kanban/tasks/${active.id}/status`, { status: newStatus });
      fetchTasks();
    }
    setActiveTask(null);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="kanban">
        {['Todo', 'In Progress', 'Done'].map((status) => (
          <SortableContext key={status} items={tasks[status]} strategy={verticalListSortingStrategy}>
            <div className="kanban-column">
              <h3>{status}</h3>
              {tasks[status].map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        ))}
      </div>
      <DragOverlay>{activeTask && <TaskCard task={activeTask} />}</DragOverlay>
    </DndContext>
  );
}
export default KanbanBoard;
