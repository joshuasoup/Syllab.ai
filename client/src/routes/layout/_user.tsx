import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import {
  ChevronDown,
  ChevronRight,
  FileText,
  LogOut,
  Menu,
  User as UserIcon,
  Folder as FolderIcon,
  ChevronLeft,
  MoreVertical,
  FolderPlus,
  GripVertical,
  Check,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import CommandKBadge from '@/components/shared/CommandKBadge';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '@/services/api';
import { useFindMany } from '@/hooks/useFindMany';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Link,
  Outlet,
  redirect,
  useLocation,
  useOutletContext,
  useNavigate,
  useLoaderData,
  LoaderFunctionArgs,
} from 'react-router-dom';
import type { User } from '@/types/user';
import type { Syllabus } from '@/types/syllabus';
import { getSession } from '@/lib/supabase';
import logoUrl from '@images/syllabai-logo.png';
import logoWhiteUrl from '@images/syllabus-logo-white.png';
import { eventEmitter } from '@/utils/eventEmitter';
import type { Folder } from '@/types/folder';
import { DeleteSyllabusButton } from '@/components/features/syllabus/DeleteSyllabusButton';
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
  rectIntersection,
  DropResult,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

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
  const { isDarkMode } = useTheme();

  const getInitials = () => {
    return (
      (user.firstName?.slice(0, 1) ?? '') + (user.lastName?.slice(0, 1) ?? '')
    ).toUpperCase();
  };

  const handleSignOut = async () => {
    await api.auth.signOut();
    navigate('/auth/sign-in');
  };

  // Get consistent avatar based on user ID
  const getAvatarVariant = () => {
    if (!user.id) return 0;

    // Use the last character of the user ID to determine the avatar
    const lastChar = user.id.charAt(user.id.length - 1);
    const charCode = lastChar.charCodeAt(0);
    return charCode % 3; // Returns 0, 1, or 2
  };

  // Three different Notion-style avatars
  const notionAvatars = [
    // Circles pattern (blue-indigo)
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
      <svg viewBox="0 0 100 100" className="h-full w-full p-1">
        <circle cx="50" cy="35" r="25" fill="rgba(255,255,255,0.8)" />
        <circle cx="30" cy="65" r="20" fill="rgba(255,255,255,0.6)" />
        <circle cx="70" cy="65" r="20" fill="rgba(255,255,255,0.4)" />
      </svg>
    </div>,

    // Squares pattern (purple-pink)
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white">
      <svg viewBox="0 0 100 100" className="h-full w-full p-1">
        <rect
          x="25"
          y="25"
          width="30"
          height="30"
          rx="4"
          fill="rgba(255,255,255,0.8)"
          transform="rotate(15, 40, 40)"
        />
        <rect
          x="45"
          y="45"
          width="30"
          height="30"
          rx="4"
          fill="rgba(255,255,255,0.6)"
          transform="rotate(-15, 60, 60)"
        />
      </svg>
    </div>,

    // Wave pattern (teal-green)
    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-teal-400 to-green-500 text-white">
      <svg viewBox="0 0 100 100" className="h-full w-full p-1">
        <path
          d="M10,50 Q30,30 50,50 T90,50"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="10"
          fill="none"
        />
        <path
          d="M10,70 Q30,50 50,70 T90,70"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="8"
          fill="none"
        />
      </svg>
    </div>,
  ];

  const selectedAvatar = notionAvatars[getAvatarVariant()];

  return (
    <DropdownMenu open={userMenuActive} onOpenChange={setUserMenuActive}>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          "flex items-center justify-between w-full gap-2 rounded py-2 px-2 transition-colors",
          isDarkMode 
            ? "hover:bg-gray-800/50 text-gray-200" 
            : "hover:bg-gray-100 text-gray-800"
        )}>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">{selectedAvatar}</Avatar>
            <div className="flex flex-col items-start max-w-[140px]">
              <span
                className={cn(
                  "text-sm font-medium truncate w-full",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )}
                title={user.firstName ?? user.email}
              >
                {user.firstName ?? user.email}
              </span>
              <span
                className={cn(
                  "text-xs truncate w-full",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}
                title={user.email}
              >
                {user.email}
              </span>
            </div>
          </div>
          <ChevronDown className={cn(
            "h-4 w-4",
            isDarkMode ? "text-gray-400" : "text-gray-500"
          )} />
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
  className?: string;
  isCollapsed?: boolean;
}

const DraggableSyllabus: React.FC<DraggableSyllabusProps> = React.memo(
  ({ syllabus, folderId, className }) => {
    const { isDarkMode } = useTheme();
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
      transition: {
        duration: 100,
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
      },
    });

    const style = {
      transform: transform
        ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
        : undefined,
      transition,
      opacity: isDragging ? 0.5 : undefined,
      zIndex: isDragging ? 1 : undefined,
    };

    const location = useLocation();
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
      if (!isDragging) {
        navigate(`/user/syllabus-results/${syllabus.id}`);
      }
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-center px-1 py-1 text-xs font-normal rounded-sm transition-colors",
          className || '',
          isDarkMode
            ? location.pathname === `/user/syllabus-results/${syllabus.id}`
              ? 'bg-gray-100/10 text-gray-200'
              : 'text-gray-400 hover:bg-gray-100/5 hover:text-gray-200'
            : location.pathname === `/user/syllabus-results/${syllabus.id}`
              ? 'bg-accent/50 text-accent-foreground'
              : 'hover:bg-accent/50 hover:text-accent-foreground'
        )}
        onClick={handleClick}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center flex-grow cursor-pointer">
            <div className={cn(
              "p-1 rounded-sm transition-colors",
              isDarkMode
                ? location.pathname === `/user/syllabus-results/${syllabus.id}`
                  ? 'bg-gray-100/10 text-gray-200'
                  : 'text-gray-400 hover:bg-gray-100/5 hover:text-gray-200'
                : location.pathname === `/user/syllabus-results/${syllabus.id}`
                  ? 'bg-accent/50 text-accent-foreground'
                  : 'hover:bg-accent/50 hover:text-accent-foreground'
            )}>
              <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
            </div>
            <span
              className="truncate whitespace-nowrap text-[10px] max-w-[120px] ml-0"
              onDoubleClick={(e) => {
                e.stopPropagation();
                navigate(`/user/syllabus/rename/${syllabus.id}`);
              }}
            >
              {syllabus.title}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-4 w-4 p-1 flex items-center justify-center rounded-sm opacity-60",
                isDarkMode ? "hover:bg-gray-100/5" : "hover:bg-gray-100"
              )}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/user/syllabus/rename/${syllabus.id}`);
              }}
            >
              <Edit className="h-2.5 w-2.5 text-gray-400" />
            </Button>
            <DeleteSyllabusButton
              syllabusId={syllabus.id}
              variant="ghost"
              className={cn(
                "h-4 w-4 p-1 flex items-center justify-center rounded-sm opacity-60",
                isDarkMode ? "hover:bg-gray-100/5" : "hover:bg-gray-100"
              )}
              onDelete={(e) => {
                e?.stopPropagation();
                eventEmitter.emit('syllabusDeleted', syllabus.id);
              }}
            >
              <Trash2 className="h-2.5 w-2.5 text-red-400" />
            </DeleteSyllabusButton>
          </div>
        </div>
      </div>
    );
  }
);

interface FolderDropZoneProps {
  folder: Folder;
  onDrop: (syllabusId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  syllabuses: Syllabus[];
  isCollapsed?: boolean;
}

const FolderDropZone: React.FC<FolderDropZoneProps> = React.memo(({ folder, onDrop, isOpen, onToggle, syllabuses }) => {
  const { isDarkMode } = useTheme();
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: {
      type: 'FOLDER',
      folder,
      onDrop,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setSortableNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `folder-${folder.id}`,
    data: {
      type: 'FOLDER',
      folder,
    },
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 1 : undefined,
  };

  const folderSyllabuses = useMemo(() => {
    const validSyllabusIds = folder.syllabuses.filter(
      (id) => id && typeof id === 'string'
    );
    return validSyllabusIds
      .map((syllabusId) => syllabuses.find((s) => s && s.id === syllabusId))
      .filter((s): s is Syllabus => s !== undefined);
  }, [folder.syllabuses, syllabuses]);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      setSortableNodeRef(node);
    },
    [setNodeRef, setSortableNodeRef]
  );

  return (
    <div style={style}>
      <div
        ref={setRefs}
        className={cn(
          "flex items-center gap-1 rounded-sm transition-colors cursor-pointer",
          isOver ? 'bg-accent/80 ring-2 ring-accent ring-inset' : ''
        )}
        {...attributes}
        {...listeners}
        onClick={onToggle}
      >
        <div className="flex items-center gap-1 flex-1">
          <GripVertical className="h-3 w-3 text-gray-400 mr-0.5" />
          <div className={cn(
            "p-1 rounded-sm transition-colors",
            isDarkMode ? "hover:bg-gray-100/5 hover:text-gray-200" : "hover:bg-accent/50 hover:text-accent-foreground"
          )}>
            <FolderIcon
              className="h-4 w-4"
              style={{
                color: folder.color,
                stroke: folder.color,
                fill: `${folder.color}10`,
                strokeWidth: 1.5,
              }}
            />
          </div>
          <span
            className={cn(
              "truncate whitespace-nowrap text-[10px] max-w-[120px] ml-0",
              isDarkMode ? "text-gray-400" : "text-gray-700"
            )}
          >
            {folder.name}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            isOpen ? "rotate-0" : "-rotate-90",
            isDarkMode ? "text-gray-400" : "text-gray-700"
          )}
        />
      </div>
      {isOpen && (
        <div className="ml-4 space-y-0.5 mt-0.5">
          {folderSyllabuses.map((syllabus) => (
            <DraggableSyllabus
              key={syllabus.id}
              syllabus={syllabus}
              folderId={folder.id}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const CustomDragOverlay = ({
  activeId,
  activeData,
}: {
  activeId: string | null;
  activeData: any;
}) => {
  if (!activeId || !activeData) return null;

  if (activeData.type === 'SYLLABUS') {
    return (
      <div className="opacity-80 bg-white rounded-sm shadow-lg p-2 flex items-center gap-2">
        <FileText className="h-3 w-3 text-gray-500" />
        <span className="text-xs font-medium text-gray-700">
          {activeData.syllabus.title}
        </span>
      </div>
    );
  }

  if (activeData.type === 'FOLDER') {
    return (
      <div className="opacity-80 bg-white rounded-sm shadow-lg p-2 flex items-center gap-2">
        <FolderIcon
          className="h-3 w-3"
          style={{
            color: activeData.folder.color,
            stroke: activeData.folder.color,
            fill: `${activeData.folder.color}10`,
            strokeWidth: 1.5,
          }}
        />
        <span className="text-xs font-medium text-gray-700">
          {activeData.folder.name}
        </span>
      </div>
    );
  }

  return null;
};

const SideBar = ({
  user,
  isCollapsed,
}: {
  user: User;
  isCollapsed: boolean;
}) => {
  const { isDarkMode } = useTheme();
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
  const [activeData, setActiveData] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Increased from 8px to 10px for more deliberate drag activation
        delay: 150, // Added small delay to distinguish between click and drag
        tolerance: 5, // 5px movement tolerance
      },
    }),
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
    setOpenFolders((prev) => {
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
      console.error('Error fetching syllabuses:', error);
      toast.error('Failed to load syllabuses');
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
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders');
      setFolders([]);
    }
  };

  useEffect(() => {
    fetchSyllabuses();
    fetchFolders();

    const handleSyllabusAdded = (newSyllabus: Syllabus) => {
      if (newSyllabus && newSyllabus.id) {
        setSyllabuses((prev) => [newSyllabus, ...prev]);
      }
    };

    const handleSyllabusDeleted = (deletedId: string) => {
      console.log('Deleting syllabus:', deletedId);
      // Remove syllabus from syllabuses list
      setSyllabuses((prev) => prev.filter((s) => s && s.id !== deletedId));
      // Remove syllabus from all folders
      setFolders((prev) =>
        prev.map((folder) => ({
          ...folder,
          syllabuses: folder.syllabuses.filter((id) => id !== deletedId),
        }))
      );
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
        const newFolder = await api.folders.create(
          newFolderName.trim(),
          selectedColor
        );
        setFolders((prev) => [...prev, newFolder]);
        setIsCreatingFolder(false);
        setNewFolderName('');
        setSelectedColor('#3b82f6');
      } catch (error) {
        console.error('Error creating folder:', error);
        toast.error('Failed to create folder');
      }
    }
  };

  const rootSyllabuses = useMemo(
    () =>
      syllabuses.filter(
        (s) => !folders.some((f) => f.syllabuses.includes(s.id))
      ),
    [syllabuses, folders]
  );

  const folderItems = useMemo(
    () => folders.map((f) => `folder-${f.id}`),
    [folders]
  );

  const moveSyllabusToFolder = useCallback(
    async (syllabusId: string, folderId: string) => {
      try {
        const targetFolder = folders.find((f) => f.id === folderId);
        if (!targetFolder) return;

        // Check if syllabus is already in the target folder
        if (targetFolder.syllabuses.includes(syllabusId)) {
          return;
        }

        const sourceFolder = folders.find((f) =>
          f.syllabuses.includes(syllabusId)
        );

        // First remove from source folder if it exists
        if (sourceFolder) {
          const updatedSourceFolder = await api.folders.update(
            sourceFolder.id,
            {
              syllabuses: sourceFolder.syllabuses.filter(
                (id) => id !== syllabusId
              ),
            }
          );
          setFolders((prev) =>
            prev.map((f) =>
              f.id === sourceFolder.id ? updatedSourceFolder : f
            )
          );
        }

        // Then add to target folder
        const updatedTargetFolder = await api.folders.update(folderId, {
          syllabuses: [...targetFolder.syllabuses, syllabusId],
        });

        setFolders((prev) =>
          prev.map((f) => (f.id === folderId ? updatedTargetFolder : f))
        );
      } catch (error) {
        console.error('Error moving syllabus to folder:', error);
        toast.error('Failed to move syllabus to folder');
      }
    },
    [folders]
  );

  const moveSyllabusOutOfFolder = useCallback(
    async (syllabusId: string, folderId: string) => {
      try {
        const folder = folders.find((f) => f.id === folderId);
        if (!folder) return;

        // Check if syllabus is actually in this folder
        if (!folder.syllabuses.includes(syllabusId)) {
          return;
        }

        const updatedFolder = await api.folders.update(folderId, {
          syllabuses: folder.syllabuses.filter((id) => id !== syllabusId),
        });

        setFolders((prev) =>
          prev.map((f) => (f.id === folderId ? updatedFolder : f))
        );
      } catch (error) {
        console.error('Error moving syllabus out of folder:', error);
        toast.error('Failed to move syllabus out of folder');
      }
    },
    [folders]
  );

  const { setNodeRef } = useDroppable({
    id: 'root',
    data: {
      type: 'ROOT',
      onDrop: (syllabusId: string) => {
        const sourceFolder = folders.find((f) =>
          f.syllabuses.includes(syllabusId)
        );
        if (sourceFolder) {
          moveSyllabusOutOfFolder(syllabusId, sourceFolder.id);
        }
      },
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setActiveData(event.active.data.current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData) return;

    // Only allow drops on folders or root
    if (activeData.type === 'SYLLABUS' && overData?.type !== 'FOLDER' && overData?.type !== 'ROOT') {
      return;
    }

    // Handle moving to root if dragged to empty space or root drop zone
    if (
      activeData.type === 'SYLLABUS' &&
      (!overData || overData.type === 'ROOT')
    ) {
      const sourceFolder = folders.find((f) =>
        f.syllabuses.includes(activeData.syllabus.id)
      );
      if (sourceFolder) {
        moveSyllabusOutOfFolder(activeData.syllabus.id, sourceFolder.id);
      }
      return;
    }

    // Handle moving between folders
    if (activeData.type === 'SYLLABUS' && overData?.type === 'FOLDER') {
      // Automatically open the folder when dragging over it
      setOpenFolders((prev) => new Set([...prev, overData.folder.id]));

      // Check if syllabus is already in the target folder
      const targetFolder = folders.find((f) => f.id === overData.folder.id);
      if (!targetFolder) return;

      // Check if syllabus is in any folder
      const sourceFolder = folders.find((f) =>
        f.syllabuses.includes(activeData.syllabus.id)
      );

      // Only move if it's not already in the target folder
      if (!targetFolder.syllabuses.includes(activeData.syllabus.id)) {
        // If moving from root to folder, just add to target folder
        if (!sourceFolder) {
          moveSyllabusToFolder(activeData.syllabus.id, overData.folder.id);
        } else if (sourceFolder.id !== targetFolder.id) {
          // If moving between folders, first remove from source then add to target
          moveSyllabusOutOfFolder(activeData.syllabus.id, sourceFolder.id);
          moveSyllabusToFolder(activeData.syllabus.id, overData.folder.id);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveData(null);

    if (!active?.data?.current) {
      return;
    }

    const activeData = active.data.current;

    // If no target or target is Root, and the item is a syllabus, remove from its folder
    if (activeData.type === 'SYLLABUS' && (!over || over.id === 'root')) {
      const sourceFolder = folders.find((f) =>
        f.syllabuses.includes(activeData.syllabus.id)
      );
      if (sourceFolder) {
        moveSyllabusOutOfFolder(activeData.syllabus.id, sourceFolder.id);
      }
      return;
    }

    if (!over) return;

    // Handle folder reordering
    if (activeData.type === 'FOLDER' && over.id !== active.id) {
      // Find the indices of the active and over folders
      const activeIndex = folders.findIndex(
        (f) => `folder-${f.id}` === active.id
      );
      const overIndex = folders.findIndex((f) => `folder-${f.id}` === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        // Create a new array with the reordered folders
        const newFolders = [...folders];
        const [movedFolder] = newFolders.splice(activeIndex, 1);
        newFolders.splice(overIndex, 0, movedFolder);

        // Update the state with the reordered folders first for UI responsiveness
        setFolders(newFolders);

        // Update folder order in the database
        const saveFolderOrder = async () => {
          try {
            const updatedFolders = await api.folders.reorder(
              newFolders.map((f) => f.id)
            );

            // If we got back folders, update the state with server data
            if (updatedFolders && updatedFolders.length > 0) {
              setFolders(updatedFolders);
            }
          } catch (error) {
            console.error('Error reordering folders:', error);
            toast.error(
              'Failed to save folder order, but your changes are still visible'
            );

            // Don't revert the visual order since we already changed it for better UX
            // Just log the error and show a toast notification
          }
        };

        saveFolderOrder();
      }
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full border-r",
      isDarkMode ? "bg-[#202020] border-gray-700" : "bg-white border-gray-200"
    )}>
      <div className={cn(
        "flex-shrink-0 p-3 border-b",
        isDarkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <div className="flex items-center px-3 py-2">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className={cn(
              "transition-all duration-300",
              isCollapsed ? "w-6 h-6" : "w-8 h-8"
            )}>
              <img 
                src={isDarkMode ? logoWhiteUrl : logoUrl} 
                alt="SyllabAI Logo" 
                className="h-full w-full object-contain" 
              />
            </div>
            <span
              className={cn(
                "text-xl font-bold transition-all duration-300",
                isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100',
                isDarkMode ? "text-white" : "text-gray-900"
              )}
            >
              SyllabAI
            </span>
          </Link>
        </div>
      </div>

      <ScrollArea className={cn(
        "flex-1",
        isDarkMode ? "bg-[#202020]" : "bg-white"
      )}>
        <div className="px-3">
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              ref={setNodeRef}
              className="relative min-h-[calc(100vh-200px)]"
            >
              <div className="folders-section">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "group h-8 w-full flex items-center justify-between px-2 mb-3 transition-all duration-300 text-xs rounded-md",
                    isDarkMode 
                      ? "text-gray-300" 
                      : "text-gray-500"
                  )}
                  onClick={() => setIsCreatingFolder(true)}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      "p-1 rounded-sm transition-colors",
                      isDarkMode 
                        ? "hover:bg-gray-100/30 hover:text-gray-200" 
                        : "hover:bg-red-500/50 hover:text-white"
                    )}>
                      <FolderPlus className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-medium">
                      Folders
                    </span>
                  </div>
                  <span className="text-xs">
                    New Folder
                  </span>
                </Button>

                {isCreatingFolder && (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Input
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="New folder"
                        className={cn(
                          "h-6 text-xs px-2 py-0 rounded-none border-0 border-b focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-b-2",
                          isDarkMode 
                            ? "bg-[#202020] text-white border-gray-700 placeholder-gray-500" 
                            : "bg-white text-gray-900 border-gray-200 placeholder-gray-400"
                        )}
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
                        className={cn(
                          "h-6 w-6 p-0",
                          isDarkMode ? "text-blue-400 hover:bg-gray-800/50" : "text-blue-600 hover:bg-blue-50"
                        )}
                        onClick={createFolder}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0",
                          isDarkMode ? "text-red-400 hover:bg-gray-800/50" : "text-red-600 hover:bg-red-50"
                        )}
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
                          className={cn(
                            "w-4 h-4 rounded-full transition-transform hover:scale-110",
                            selectedColor === color && (isDarkMode ? "ring-2 ring-offset-2 ring-gray-700" : "ring-2 ring-offset-2 ring-gray-200")
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => setSelectedColor(color)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <SortableContext
                  items={folderItems}
                  strategy={verticalListSortingStrategy}
                >
                  {folders.map((folder) => (
                    <div key={folder.id} className="mb-2">
                      <FolderDropZone
                        folder={folder}
                        onDrop={moveSyllabusToFolder}
                        isOpen={openFolders.has(folder.id)}
                        onToggle={() => toggleFolder(folder.id)}
                        syllabuses={syllabuses}
                      />
                    </div>
                  ))}
                </SortableContext>
              </div>

              <SortableContext
                items={rootSyllabuses.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-1 mt-2 -ml-1">
                  {rootSyllabuses.map((syllabus) => (
                    <DraggableSyllabus 
                      key={syllabus.id} 
                      syllabus={syllabus} 
                    />
                  ))}
                </div>
              </SortableContext>
            </div>

            <DragOverlay>
              <CustomDragOverlay activeId={activeId} activeData={activeData} />
            </DragOverlay>
          </DndContext>
        </div>
      </ScrollArea>

      <div className={cn(
        "flex-shrink-0 px-3 py-3 border-t",
        isDarkMode ? "border-gray-700" : "border-gray-200"
      )}>
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
          }`}
        >
          <UserMenu user={user} />
        </div>
        <Link
          to="/user/syllabus-upload"
          className={cn(
            "flex items-center w-full px-3 py-2 mb-3 mt-4 text-sm font-medium rounded-sm text-white transition-colors",
            isCollapsed ? "justify-center" : "",
            isDarkMode ? "bg-blue-600 hover:bg-blue-600/90" : "bg-blue-600 hover:bg-blue-600/90"
          )}
        >
          <FileText
            className={`${
              isCollapsed ? 'w-4 h-4' : 'w-3 h-3 mr-2 flex-shrink-0'
            }`}
          />
          <span
            className={`whitespace-nowrap transition-all duration-300 ${
              isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
            }`}
          >
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
  const { isDarkMode } = useTheme();

  if (!data.user) {
    return null;
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col",
      isDarkMode ? "bg-[#191919]" : "bg-white"
    )}>
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
              className={cn(
                "absolute rounded-full p-1.5 shadow-md transition-colors border z-[9999]",
                isDarkMode 
                  ? "bg-gray-800 hover:bg-gray-700 border-gray-700" 
                  : "bg-white hover:bg-gray-50 border-gray-200",
                isSidebarCollapsed ? 'right-2 top-4' : 'right-2 top-4'
              )}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className={cn(
                  "h-4 w-4",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )} />
              ) : (
                <ChevronLeft className={cn(
                  "h-4 w-4",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )} />
              )}
            </button>
          </div>
        </div>
        <div
          className={cn(
            "flex-1 transition-all duration-300",
            isDarkMode ? "bg-[#191919]" : "bg-white",
            isSidebarCollapsed ? 'md:ml-16' : 'md:ml-56'
          )}
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
