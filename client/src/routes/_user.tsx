import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, ChevronRight, FileText, LogOut, Menu, User as UserIcon, Folder, ChevronLeft } from "lucide-react";
import CommandKBadge from "@/components/shared/CommandKBadge";
import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useFindMany } from "@/hooks/useFindMany";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

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
// Import logo as URL using Vite's special import syntax
import logoUrl from '@images/syllabai-logo.png';
import { eventEmitter } from "@/utils/eventEmitter";

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
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchSyllabuses();

    // Listen for syllabusAdded event
    const handleSyllabusAdded = (newSyllabus: Syllabus) => {
      if (newSyllabus && newSyllabus.id) {
        setSyllabuses(prev => [newSyllabus, ...prev]);
      }
    };

    // Listen for syllabusDeleted event
    const handleSyllabusDeleted = (deletedId: string) => {
      setSyllabuses(prev => prev.filter(s => s && s.id !== deletedId));
    };

    // Listen for syllabusUpdated event
    const handleSyllabusUpdated = (updatedSyllabus: Syllabus) => {
      console.log('Received syllabusUpdated event:', updatedSyllabus);
      if (updatedSyllabus && updatedSyllabus.id) {
        // Fetch fresh data instead of trying to update in place
        fetchSyllabuses();
      }
    };

    eventEmitter.on('syllabusAdded', handleSyllabusAdded);
    eventEmitter.on('syllabusDeleted', handleSyllabusDeleted);
    eventEmitter.on('syllabusUpdated', handleSyllabusUpdated);

    // Cleanup listeners on unmount
    return () => {
      eventEmitter.off('syllabusAdded', handleSyllabusAdded);
      eventEmitter.off('syllabusDeleted', handleSyllabusDeleted);
      eventEmitter.off('syllabusUpdated', handleSyllabusUpdated);
    };
  }, []);

  return (
    <div className="flex flex-col flex-grow bg-background border-r h-full text-sm">
      <div className="px-3 py-4 border-b">
        <Link
          to="/user/syllabus-upload"
          className={`flex items-center gap-2 ${
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
      </div>
      <div className="flex flex-col h-full">
        <nav className="flex-1 px-2 py-2 overflow-hidden">
          <div className="space-y-1 h-full">
            <button
              onClick={() => setSyllabusesOpen(!syllabusesOpen)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-left rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              <div className="flex items-center">
                <Folder
                  className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2'}`}
                />
                <span
                  className={`whitespace-nowrap transition-all duration-300 ${
                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                  }`}
                >
                  My Syllabuses
                </span>
              </div>
              <span
                className={`transition-all duration-300 ${
                  isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                }`}
              >
                {syllabusesOpen ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </span>
            </button>

            <div
              className={`transition-all duration-300 ${
                isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
              }`}
            >
              {syllabusesOpen && !isCollapsed && (
                <ScrollArea className="h-[calc(100vh-16rem)]">
                  <div className="ml-4 space-y-0.5 mt-0.5">
                    {isLoading ? (
                      <div className="text-xs text-muted-foreground px-2 py-0.5">
                        Loading syllabuses...
                      </div>
                    ) : syllabuses.length === 0 ? (
                      <div className="text-xs text-muted-foreground px-2 py-0.5">
                        No syllabuses uploaded yet
                      </div>
                    ) : (
                      syllabuses.map((syllabus: Syllabus) => {
                        console.log('Rendering syllabus:', syllabus);
                        return syllabus && syllabus.id ? (
                          <Link
                            key={syllabus.id}
                            to={`/user/syllabus-results/${syllabus.id}`}
                            className={`flex items-center px-3 py-1.5 text-xs font-normal rounded-sm transition-colors text-muted-foreground
                            ${
                              location.pathname ===
                              `/user/syllabus-results/${syllabus.id}`
                                ? 'bg-accent/50 text-accent-foreground'
                                : 'hover:bg-accent/50 hover:text-accent-foreground'
                            }`}
                          >
                            <FileText className="mr-1.5 h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span className="truncate whitespace-nowrap">
                              {syllabus.title}
                            </span>
                          </Link>
                        ) : null;
                      })
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </nav>
        <div className="flex-shrink-0 px-3 py-3 border-t">
          <div
            className={`transition-all duration-300 ${
              isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'
            }`}
          >
            <UserMenu user={user} />
          </div>
          <Link
            to="/user/syllabus-upload"
            className={`flex items-center w-full px-3 py-2 mb-3 mt-4 text-sm font-medium rounded-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
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
