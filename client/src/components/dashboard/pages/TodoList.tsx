// src/components/TodoList.tsx
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MoreVertical, PlusCircle, Trash2, Pencil } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

const TodoList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'COMP 2401 Assignment 1',
      dueDate: 'Due Date: Thursday, Apr 2 (this Thursday)',
      completed: false,
    },
    {
      id: '2',
      title: 'COMP 1805 Test 2',
      dueDate: 'Due Date: Friday, Apr 3 (this Friday)',
      completed: false,
    },
    {
      id: '3',
      title: 'COMP 1805 Tutorial 3',
      dueDate: 'Due Date: Saturday, Apr 4 (this Saturday)',
      completed: false,
    },
  ]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTaskToggle = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && newTaskDueDate.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        dueDate: `Due Date: ${newTaskDueDate}`,
        completed: false,
      };
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAddTaskOpen(false);
    }
  };

  const handleEditTask = () => {
    if (currentTask && newTaskTitle.trim() && newTaskDueDate.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === currentTask.id
            ? { ...task, title: newTaskTitle, dueDate: `Due Date: ${newTaskDueDate}` }
            : task
        )
      );
      setCurrentTask(null);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsEditTaskOpen(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDueDate(task.dueDate.replace('Due Date: ', ''));
    setIsEditTaskOpen(true);
  };

  return (
    <div>
      {/* Add New Task Button */}
      <h1 className="text-[60px] font-semibold">Upcoming this week...</h1>
      <div className="mb-8 cursor-pointer" onClick={() => setIsAddTaskOpen(true)}>
        <div className="flex items-center gap-4 p-4 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-10 h-10 text-white" />
          <span className="text-xl font-sans text-white">Any New Tasks?</span>
        </div>
      </div>

      {/* Task List */}
      <div className="relative pl-6">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-900"></div>
        <div className="space-y-4">
          {tasks.map((task, index) => (
            <div
              key={task.id}
              ref={(el) => (taskRefs.current[index] = el)}
              className="flex items-center gap-4 p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleTaskToggle(task.id)}
                className="mt-1.5"
              />
              <div className="flex-1">
                <p
                  className={`text-lg ${
                    task.completed ? 'line-through text-gray-400' : 'text-gray-900'
                  }`}
                >
                  {task.title}
                </p>
                <p className="text-sm text-gray-500">{task.dueDate}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditDialog(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                placeholder="Enter due date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Task Title</label>
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Due Date</label>
              <Input
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                placeholder="Enter due date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTask}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TodoList;
