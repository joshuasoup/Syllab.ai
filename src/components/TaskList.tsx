import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onTaskComplete: (taskId: string) => void;
  onAddTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskComplete,
  onAddTask,
}) => {
  const [activeDot, setActiveDot] = useState<number | null>(null);

  const scrollToTask = (index: number) => {
    const taskElement = document.getElementById(`task-${index}`);
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveDot(index);
    }
  };

  return (
    <div className="relative">
      {/* Vertical line with dots */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200">
        {tasks.map((_, index) => (
          <motion.button
            key={index}
            className={`absolute w-3 h-3 rounded-full ${
              activeDot === index ? 'bg-blue-500' : 'bg-black'
            } cursor-pointer hover:bg-blue-500 transition-colors`}
            style={{
              top: `${(index * 100) / (tasks.length - 1)}%`,
              left: '-5px',
              transform: 'translateY(-50%)',
            }}
            onClick={() => scrollToTask(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Task list */}
      <div className="pl-8">
        {tasks.map((task, index) => (
          <motion.div
            key={task.id}
            id={`task-${index}`}
            className="mb-6 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onTaskComplete(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    task.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div>
                  <h3
                    className={`font-medium ${
                      task.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-500">{task.dueDate}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add task button */}
      <motion.button
        onClick={onAddTask}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default TaskList;
