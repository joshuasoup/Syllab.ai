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
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export default function Dashboard() {
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
  const [activeDot, setActiveDot] = useState<number | null>(null);

  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim() && newTaskDueDate.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        dueDate: `Due Date: ${newTaskDueDate}`,
        completed: false,
      };
      setTasks([...tasks, newTask]);
      setNewTaskTitle('');
      setNewTaskDueDate('');
      setIsAddTaskOpen(false);
    }
  };

  const handleEditTask = () => {
    if (currentTask && newTaskTitle.trim() && newTaskDueDate.trim()) {
      setTasks(
        tasks.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                title: newTaskTitle,
                dueDate: `Due Date: ${newTaskDueDate}`,
              }
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

  const scrollToTask = (index: number) => {
    const taskElement = taskRefs.current[index];
    if (taskElement) {
      taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveDot(index);
    }
  };

  return (
    <div className="w-[1728px] h-[1117px] relative bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* Decorative elements */}
      <div className="w-[872px] h-[874px] left-[1250px] top-[695px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_rgba(37,_99,_235,_0.61)_0%,_rgba(255,_255,_255,_0.61)_100%)] rounded-full"></div>
      <div className="w-[1207px] h-[1221px] left-[-785px] top-[-661px] absolute bg-[radial-gradient(ellipse_50.00%_50.00%_at_50.00%_50.00%,_#2563EB_0%,_rgba(255,_255,_255,_0.61)_100%)] rounded-full"></div>
      <div className="w-4 h-4 left-[1625px] top-[544px] absolute bg-black rounded-full"></div>
      <div className="w-4 h-4 left-[1625px] top-[573px] absolute bg-black rounded-full"></div>
      <div className="w-4 h-4 left-[1625px] top-[602px] absolute bg-black rounded-full"></div>
      <div className="w-8 h-8 left-[1617px] top-[500px] absolute bg-black rounded-full"></div>
      <div className="w-[603px] px-3 left-[477px] top-[240px] absolute inline-flex justify-start items-center gap-9 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto">
          <div className="pl-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-5xl font-bold text-gray-900">
                This week's tasks...
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-4">
        {tasks.map((_, index) => (
          <motion.button
            key={index}
            className={`w-3 h-3 rounded-full ${
              activeDot === index ? 'bg-blue-500' : 'bg-black'
            } cursor-pointer hover:bg-blue-500 transition-colors`}
            onClick={() => scrollToTask(index)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      <div
        className="w-[603px] px-3 left-[477px] top-[320px] absolute inline-flex justify-start items-center gap-9 overflow-hidden"
        onClick={() => setIsAddTaskOpen(true)}
      >
        <div className="w-full max-w-2xl mx-auto">
          <div className="pl-6">
            <div className="flex items-center gap-4 p-4 bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
              <PlusCircle className="w-10 h-10 text-white" />
              <div className="flex-1">
                <span className="text-xl font-sans text-white">
                  Any New Tasks?
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-[603px] px-3 left-[477px] top-[400px] absolute inline-flex justify-start items-center gap-9 overflow-hidden">
        <div className="w-full max-w-2xl mx-auto">
          <div className="pl-6">
            <div className="absolute left-0 top-[-800px] bottom-[-800px] w-1 bg-gray-900"></div>
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
                        task.completed
                          ? 'line-through text-gray-400'
                          : 'text-gray-900'
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-sm text-gray-500">{task.dueDate}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-100"
                      >
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

      {/* Top right decorative elements */}
      <div className="w-4 h-4 left-[1320px] top-[444px] absolute bg-black rounded-full"></div>
      <div className="w-4 h-4 left-[1320px] top-[473px] absolute bg-black rounded-full"></div>
      <div className="w-4 h-4 left-[1320px] top-[502px] absolute bg-black rounded-full"></div>
      <div className="w-8 h-8 left-[1312px] top-[400px] absolute bg-black rounded-full"></div>
    </div>
  );
}
