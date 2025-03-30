import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, ChevronRight, FileText, LogOut, Menu, User as UserIcon, Folder as FolderIcon, ChevronLeft, MoreVertical, FolderPlus, GripVertical, Check, X, Edit, Trash2, FolderOpen } from "lucide-react";
import CommandKBadge from "@/components/shared/CommandKBadge";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useFindMany } from "@/hooks/useFindMany";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, Outlet, redirect, useLocation, useOutletContext, useNavigate, useLoaderData, LoaderFunctionArgs } from 'react-router-dom';
import type { User } from '@/types/user';
import type { Syllabus } from '@/types/syllabus';
import { getSession } from '@/lib/supabase';
import logoUrl from '@images/syllabai-logo.png';
import { eventEmitter } from "@/utils/eventEmitter";
import type { Folder } from '@/types/folder';
import { DeleteSyllabusButton } from "@/components/features/syllabus/DeleteSyllabusButton";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";

interface RootOutletContext {
  user?: User;
}

export type AuthOutletContext = RootOutletContext & {
  user?: User;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const session = await getSession();
    if (!session) {
      return redirect('/auth/sign-in');
    }

    // Get the user data from our API
    const user = await api.user.getCurrent();
    if (!user) {
      return redirect('/auth/sign-in');
    }

    return { user };
  } catch (error) {
    return redirect('/auth/sign-in');
  }
};

const UserMenu = ({ user }: { user: User }) => {
  const [userMenuActive, setUserMenuActive] = useState(false);
  const navigate = useNavigate();

  const getInitials = () => {
    return (
      (user.firstName?.slice(0, 1) ?? '') + (user.lastName?.slice(0, 1) ?? '')
    ).toUpperCase();
  };

  const handleSignOut = async () => {
    await api.auth.signOut();
    navigate('/auth/sign-in');
  };

  return (
    <DropdownMenu open={userMenuActive} onOpenChange={setUserMenuActive}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between w-full gap-2 rounded py-2 px-2 hover:bg-gray-100 text-gray-800 transition-colors">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {user.profilePicture?.url ? (
                <AvatarImage
                  src={user.profilePicture.url}
                  alt={user.firstName ?? user.email}
                />
              ) : (
                <AvatarFallback>{getInitials()}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex flex-col items-start max-w-[140px]">
              <span
                className="text-sm font-medium truncate w-full"
                title={user.firstName ?? user.email}
              >
                {user.firstName ?? user.email}
              </span>
              <span
                className="text-xs text-gray-500 truncate w-full"
                title={user.email}
              >
                {user.email}
              </span>
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleSignOut}
          className="flex items-center text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface DraggableSyllabusProps {
  syllabus: Syllabus;
  folderId?: string;
}

const DraggableSyllabus: React.FC<DraggableSyllabusProps> = ({ syllabus, folderId }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: syllabus.id,
    data: {
      type: 'SYLLABUS',
      syllabus,
      folderId,
    },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center px-2 py-1 text-xs font-normal rounded-sm transition-colors text-muted-foreground cursor-move
        ${location.pathname === `/user/syllabus-results/${syllabus.id}` ? 'bg-accent/50 text-accent-foreground' : 'hover:bg-accent/50 hover:text-accent-foreground'}`}
    >
      <FileText className="h-2.5 w-2.5 mr-1 text-gray-500 flex-shrink-0" />
      <span className="truncate whitespace-nowrap flex-grow text-[11px] max-w-[120px]">{syllabus.title}</span>
      <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onClick={() => navigate(`/user/syllabus/rename/${syllabus.id}`)}
        >
          <Edit className="h-2.5 w-2.5 text-gray-300" />
        </Button>
        <DeleteSyllabusButton
          syllabusId={syllabus.id}
          variant="ghost"
          className="h-4 w-4 p-0 hover:bg-transparent"
          onDelete={() => {
            eventEmitter.emit('syllabusDeleted', syllabus.id);
          }}
        >
          <Trash2 className="h-2.5 w-2.5 text-red-300" />
        </DeleteSyllabusButton>
      </div>
    </div>
  );
};

const FolderDropZone: React.FC<{
  folder: Folder;
  onDrop: (syllabusId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ folder, onDrop, isOpen, onToggle }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: {
      type: 'FOLDER',
      folder,
      onDrop,
    },
  });

  // Filter out any invalid syllabus IDs
  const validSyllabusIds = folder.syllabuses.filter(id => id && typeof id === 'string');
  const folderSyllabuses = validSyllabusIds
    .map(syllabusId => syllabuses.find(s => s && s.id === syllabusId))
    .filter((s): s is Syllabus => s !== undefined);

  return (
    <div>
      <div
        ref={setNodeRef}
        className={`flex items-center gap-1 mb-1 p-1 rounded-sm transition-colors ${
          isOver ? 'bg-accent/50' : ''
        }`}
      >
        <FolderOpen 
          className="h-4 w-4" 
          style={{ 
            color: folder.color,
            stroke: folder.color,
            fill: `${folder.color}20`
          }} 
        />
        <span className="text-xs font-medium text-gray-700">{folder.name}</span>
        <button 
          onClick={onToggle}
          className="ml-auto p-0.5 hover:bg-gray-100 rounded-sm transition-colors"
        >
          <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {isOpen && (
        <div className="pl-4 space-y-1">
          <SortableContext
            items={folderSyllabuses.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {folderSyllabuses.map((syllabus) => (
              <DraggableSyllabus
                key={syllabus.id}
                syllabus={syllabus}
                folderId={folder.id}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const RootDropZone: React.FC<{
  onDrop: (syllabusId: string) => void;
}> = ({ onDrop }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root',
    data: {
      type: 'ROOT',
      onDrop,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-2 rounded-sm transition-colors ${
        isOver ? 'bg-accent/50' : ''
      }`}
    />
  );
};

const SideBar = ({
  user,
  isCollapsed,
}: {
  user: User;
  isCollapsed: boolean;
}) => {
  const location = useLocation();
  const [syllabusesOpen, setSyllabusesOpen] = useState(true);
  const [syllabuses, setSyllabuses] = useState<Syllabus[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ];

  const toggleFolder = (folderId: string) => {
    setOpenFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const fetchSyllabuses = async () => {
    try {
      setIsLoading(true);
      const data = await api.syllabus.getAll();
      setSyllabuses(data || []);
    } catch (error) {
      console.error("Error fetching syllabuses:", error);
      toast.error("Failed to load syllabuses");
      setSyllabuses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const data = await api.folders.getAll();
      setFolders(data || []);
    } catch (error) {
      console.error("Error fetching folders:", error);
      toast.error("Failed to load folders");
      setFolders([]);
    }
  };

  useEffect(() => {
    fetchSyllabuses();
    fetchFolders();

    const handleSyllabusAdded = (newSyllabus: Syllabus) => {
      if (newSyllabus && newSyllabus.id) {
        setSyllabuses(prev => [newSyllabus, ...prev]);
      }
    };

    const handleSyllabusDeleted = (deletedId: string) => {
      console.log('Deleting syllabus:', deletedId);
      setSyllabuses(prev => prev.filter(s => s && s.id !== deletedId));
      // Remove syllabus from all folders
      setFolders(prev => prev.map(folder => ({
        ...folder,
        syllabuses: folder.syllabuses.filter(id => id !== deletedId)
      })));
    };

    const handleSyllabusUpdated = (updatedSyllabus: Syllabus) => {
      if (updatedSyllabus && updatedSyllabus.id) {
        fetchSyllabuses();
      }
    };

    eventEmitter.on('syllabusAdded', handleSyllabusAdded);
    eventEmitter.on('syllabusDeleted', handleSyllabusDeleted);
    eventEmitter.on('syllabusUpdated', handleSyllabusUpdated);

    return () => {
      eventEmitter.off('syllabusAdded', handleSyllabusAdded);
      eventEmitter.off('syllabusDeleted', handleSyllabusDeleted);
      eventEmitter.off('syllabusUpdated', handleSyllabusUpdated);
    };
  }, []);

  const createFolder = async () => {
    if (newFolderName.trim()) {
      try {
        const newFolder = await api.folders.create(newFolderName.trim(), selectedColor);
        setFolders(prev => [...prev, newFolder]);
        setIsCreatingFolder(false);
        setNewFolderName('');
        setSelectedColor('#3b82f6');
      } catch (error) {
        console.error("Error creating folder:", error);
        toast.error("Failed to create folder");
      }
    }
  };

  const moveSyllabusToFolder = async (syllabusId: string, folderId: string) => {
    try {
      // Find the target folder
      const targetFolder = folders.find(f => f.id === folderId);
      if (!targetFolder) return;

      // Find the source folder (if any)
      const sourceFolder = folders.find(f => f.syllabuses.includes(syllabusId));
      
      // If the syllabus is already in this folder, don't do anything
      if (targetFolder.syllabuses.includes(syllabusId)) {
        return;
      }

      // Remove from source folder if it exists
      if (sourceFolder) {
        const updatedSourceFolder = await api.folders.update(sourceFolder.id, {
          syllabuses: sourceFolder.syllabuses.filter(id => id !== syllabusId)
        });
        setFolders(prev => prev.map(f => 
          f.id === sourceFolder.id ? updatedSourceFolder : f
        ));
      }

      // Add to target folder
      const updatedTargetFolder = await api.folders.update(folderId, {
        syllabuses: [...targetFolder.syllabuses, syllabusId]
      });

      setFolders(prev => prev.map(f => 
        f.id === folderId ? updatedTargetFolder : f
      ));
    } catch (error) {
      console.error("Error moving syllabus to folder:", error);
      toast.error("Failed to move syllabus to folder");
    }
  };

  const moveSyllabusOutOfFolder = async (syllabusId: string, folderId: string) => {
    try {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) return;

      const updatedFolder = await api.folders.update(folderId, {
        syllabuses: folder.syllabuses.filter(id => id !== syllabusId)
      });

      setFolders(prev => prev.map(f => 
        f.id === folderId ? updatedFolder : f
      ));
    } catch (error) {
      console.error("Error moving syllabus out of folder:", error);
      toast.error("Failed to move syllabus out of folder");
    }
  };

  const deleteFolder = async (folderId: string) => {
    try {
      await api.folders.delete(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (error) {
      console.error("Error deleting folder:", error);
      toast.error("Failed to delete folder");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    // Handle moving between folders
    if (activeData.type === 'SYLLABUS' && overData.type === 'FOLDER') {
      if (activeData.folderId !== overData.folder.id) {
        moveSyllabusToFolder(activeData.syllabus.id, overData.folder.id);
      }
    }

    // Handle moving to root
    if (activeData.type === 'SYLLABUS' && overData.type === 'ROOT' && activeData.folderId) {
      moveSyllabusOutOfFolder(activeData.syllabus.id, activeData.folderId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
  };

  return (
    <div className="flex flex-col h-full bg-background border-r">
      <div className="flex-shrink-0 p-3 border-b">
        <Link
          to="/user/syllabus-upload"
          className={`flex items-center gap-2 mb-4 ${
            isCollapsed ? 'pointer-events-none' : ''
          }`}
        >
          <img
            src={logoUrl}
            alt="SyllabAI Logo"
            className={`object-contain transition-all duration-300 ${
              isCollapsed ? 'w-8 h-8' : 'w-10 h-10'
            }`}
          />
          <span
            className={`text-2xl font-bold whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
          >
            <span className="text-black">SyllabAI</span>
          </span>
        </Link>
        <div className="flex items-center justify-between mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setIsCreatingFolder(true)}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
        {isCreatingFolder && (
          <div className="space-y-2 mb-2">
            <div className="flex items-center gap-1">
              <Input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="New folder"
                className="h-6 text-xs px-2 py-0 rounded-none border-0 border-b focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-2"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    createFolder();
                  }
                }}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={createFolder}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  setIsCreatingFolder(false);
                  setNewFolderName('');
                  setSelectedColor('#3b82f6');
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${
                    selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-200' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={folders.map(f => `folder-${f.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {folders.map((folder) => (
                <div key={folder.id} className="mb-2">
                  <FolderDropZone
                    folder={folder}
                    onDrop={(syllabusId) => {
                      moveSyllabusToFolder(syllabusId, folder.id);
                    }}
                    isOpen={openFolders.has(folder.id)}
                    onToggle={() => toggleFolder(folder.id)}
                  />
                </div>
              ))}
            </SortableContext>

            <RootDropZone
              onDrop={(syllabusId) => {
                const sourceFolder = folders.find(f => f.syllabuses.includes(syllabusId));
                if (sourceFolder) {
                  moveSyllabusOutOfFolder(syllabusId, sourceFolder.id);
                }
              }}
            />

            <SortableContext
              items={syllabuses
                .filter(s => !folders.some(f => f.syllabuses.includes(s.id)))
                .map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1 mt-2">
                {syllabuses
                  .filter(s => !folders.some(f => f.syllabuses.includes(s.id)))
                  .map((syllabus) => (
                    <DraggableSyllabus
                      key={syllabus.id}
                      syllabus={syllabus}
                    />
                  ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="opacity-50">
                  {/* Render a preview of the dragged item */}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 px-3 py-3 border-t">
        <div className={`transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
          <UserMenu user={user} />
        </div>
        <Link
          to="/user/syllabus-upload"
          className={`flex items-center w-full px-3 py-2 mb-3 mt-4 text-sm font-medium rounded-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <FileText className={`${isCollapsed ? 'w-4 h-4' : 'w-3 h-3 mr-2 flex-shrink-0'}`} />
          <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Upload New Syllabus
          </span>
        </Link>
      </div>
    </div>
  );
};

const SideBarMenuButtonDrawer = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden fixed top-2 left-2 z-30">
      <button
        className="flex items-center rounded-sm hover:bg-gray-100 p-2 text-gray-800 bg-white shadow-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="h-5 w-5" />
      </button>
      <div
        className={`fixed inset-y-0 left-0 w-64 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } bg-background shadow-lg z-20`}
      >
        <SideBar user={user} isCollapsed={false} />
      </div>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 z-10"
        />
      )}
    </div>
  );
};

const UserLayout = () => {
  const data = useLoaderData() as { user: User };
  const rootOutletContext = useOutletContext<RootOutletContext>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (!data.user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <SideBarMenuButtonDrawer user={data.user} />
        <div
          className={`hidden md:flex flex-col fixed inset-y-0 transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-56'
          }`}
        >
          <div className="relative h-full">
            <SideBar user={data.user} isCollapsed={isSidebarCollapsed} />
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`absolute bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50 transition-colors border ${
                isSidebarCollapsed ? '-right-3 top-4' : '-right-3 top-4'
              }`}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
          }`}
        >
          <Outlet context={{ ...rootOutletContext, user: data.user }} />
        </div>
      </div>
      <Toaster richColors />
      <CommandKBadge />
    </div>
  );
};

export default UserLayout;
