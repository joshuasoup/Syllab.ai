// src/components/TodoList.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical, PlusCircle, Trash2, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { api } from "@/services/api";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import type { Syllabus, Assessment, Deadline } from "@/types/syllabus";

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
  syllabusId?: string;
  type?: "assessment" | "deadline";
  syllabusName?: string; // Add this line
}

const TodoList: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const taskRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch syllabuses on component mount
  useEffect(() => {
    const fetchSyllabuses = async () => {
      try {
        const data = await api.syllabus.getAll();
        setSyllabuses(data || []);
        console.log(data);
        // Process syllabus data to get tasks
        const upcomingTasks: Task[] = [];

        data?.forEach((syllabus) => {
          const highlights = syllabus.highlights;
          if (!highlights) return;

          // Add assessments
          highlights.assessments?.forEach((assessment: Assessment) => {
            if (assessment.due_date) {
              assessment.due_date.forEach((date) => {
                const dueDate = new Date(date);
                if (isInNextWeek(dueDate)) {
                  upcomingTasks.push({
                    id: `${syllabus.id}-${assessment.name}-${date}`,
                    title: assessment.name,
                    dueDate: `Due Date: ${formatDate(date)}`,
                    completed: false,
                    syllabusId: syllabus.id,
                    type: "assessment",
                    syllabusName: syllabus.title, // Add this line
                  });
                }
              });
            }
          });

          // Add deadlines
          highlights.important_deadlines?.forEach((deadline: Deadline) => {
            const date = deadline.date;
            if (date) {
              const dueDate = new Date(date);
              if (isInNextWeek(dueDate)) {
                upcomingTasks.push({
                  id: `${syllabus.id}-deadline-${date}`,
                  title: deadline.description,
                  dueDate: `Due Date: ${formatDate(date)}`,
                  completed: false,
                  syllabusId: syllabus.id,
                  type: "deadline",
                });
              }
            }
          });
        });

        // Sort tasks by due date
        upcomingTasks.sort((a, b) => {
          const dateA = new Date(a.dueDate.replace("Due Date: ", ""));
          const dateB = new Date(b.dueDate.replace("Due Date: ", ""));
          return dateA.getTime() - dateB.getTime();
        });

        setTasks(upcomingTasks);
      } catch (error) {
        console.error("Error fetching syllabuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabuses();
  }, []);

  const TEST_MODE = true;
  const TEST_DATE = new Date("2025-02-01"); // Set your test date here

  // Modify the isInNextWeek function
  const isInNextWeek = (date: Date): boolean => {
    const now = TEST_MODE ? TEST_DATE : new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return date >= now && date <= nextWeek;
  };

  // Modify the formatDate function
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = TEST_MODE ? TEST_DATE : new Date();

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    return `${days[date.getDay()]}, ${date.toLocaleDateString()}`;
  };

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
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setIsAddTaskOpen(false);
    }
  };

  const handleEditTask = () => {
    if (currentTask && newTaskTitle.trim() && newTaskDueDate.trim()) {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
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
      setNewTaskTitle("");
      setNewTaskDueDate("");
      setIsEditTaskOpen(false);
    }
  };

  const openEditDialog = (task: Task) => {
    setCurrentTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDueDate(task.dueDate.replace("Due Date: ", ""));
    setIsEditTaskOpen(true);
  };

  return (
    <div className={cn("", isDarkMode ? "text-white" : "text-gray-900")}>
      <h1
        className={cn(
          "text-[60px] font-semibold",
          isDarkMode ? "text-white" : "text-gray-900"
        )}
      >
        Upcoming this week...
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-lg">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center p-8">
          <p className="text-lg">No upcoming tasks this week!</p>
        </div>
      ) : (
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
                      task.completed
                        ? "line-through text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="text-sm space-y-1">
                    <p className="text-gray-500">{task.dueDate}</p>
                    {task.syllabusName && (
                      <p className="text-gray-400 text-xs">
                        From: {task.syllabusName}
                      </p>
                    )}
                  </div>
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
      )}

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
