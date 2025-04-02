import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/sonner";
import { ChevronDown, ChevronRight, FileText, LogOut, Menu, User as UserIcon, Folder } from "lucide-react";
import CommandKBadge from "@/components/shared/CommandKBadge";
import { api } from "@/services/api";
import type { User } from "@/types/user";
import type { Syllabus } from "@/types/syllabus";
// Import logo as URL using Vite's special import syntax
import logoUrl from '@images/syllabai-logo.png';

// Make sure sidebar shows all syllabus even without reloading for the most recent one
import { eventEmitter } from '../utils/eventEmitter';

interface UserMenuProps {
  user: User;
}

const UserMenu = ({ user }: UserMenuProps) => {
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

interface SideBarProps {
  user: User;
  isCollapsed: boolean;
}

// Function to adjust color brightness for hover effects
const adjustColorBrightness = (color: string, percent: number): string => {
  try {
    // Handle HSL colors
    if (color.startsWith('hsl')) {
      // Extract hue, saturation, and lightness from HSL format
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const h = parseInt(hslMatch[1], 10);
        const s = parseInt(hslMatch[2], 10);
        let l = parseInt(hslMatch[3], 10);
        
        // Adjust lightness for hover effect
        l = Math.max(0, Math.min(100, l - 10)); // Darker for hover
        
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      return color; // Return original if parsing fails
    }
    
    // Handle hex colors
    if (color.startsWith('#')) {
      // Convert hex to RGB
      let r = parseInt(color.substring(1, 3), 16);
      let g = parseInt(color.substring(3, 5), 16);
      let b = parseInt(color.substring(5, 7), 16);

      // Adjust brightness
      r = Math.max(0, Math.min(255, r + percent));
      g = Math.max(0, Math.min(255, g + percent));
      b = Math.max(0, Math.min(255, b + percent));

      // Convert back to hex
      return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
    }
    
    return color; // Return original color for other formats
  } catch (error) {
    console.error("Error adjusting color brightness:", error);
    return color; // Return original color on error
  }
};

const SideBar = ({ user, isCollapsed }: SideBarProps) => {
  const location = useLocation();
  const [syllabusesOpen, setSyllabusesOpen] = useState(true);
  const [syllabuses, setSyllabuses] = useState<Syllabus[] | null>(null);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState('#3b82f6'); // Default blue color
  
  // Get current syllabus ID from URL if available
  const currentSyllabusId = location.pathname.match(/\/user\/syllabus-results\/([^\/]+)/)?.[1];

  // Load theme color from localStorage
  useEffect(() => {
    const updateThemeColor = () => {
      if (currentSyllabusId) {
        const savedColor = localStorage.getItem(`syllabus_color_${currentSyllabusId}`);
        if (savedColor) {
          setThemeColor(savedColor);
        } else {
          setThemeColor('#3b82f6'); // Default blue color
        }
      }
    };
    
    // Initial load
    updateThemeColor();
    
    // Listen for theme color changes
    const handleThemeColorChange = (e: CustomEvent) => {
      if (e.detail && e.detail.color) {
        console.log('Theme color changed:', e.detail.color, 'Current syllabus:', currentSyllabusId, 'Event syllabus:', e.detail.syllabusId);
        
        // Always update the theme color - when viewing a syllabus, we want the upload button to match
        setThemeColor(e.detail.color);
      }
    };
    
    window.addEventListener('themeColorChange', handleThemeColorChange as EventListener);
    
    return () => {
      window.removeEventListener('themeColorChange', handleThemeColorChange as EventListener);
    };
  }, [currentSyllabusId]);

  // Function to fetch syllabuses
  const fetchSyllabuses = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await api.syllabus.getAll(); // Fetch syllabuses from API
      setSyllabuses(response.data);
    } catch (err) {
      setError("Error loading syllabuses");
    } finally {
      setFetching(false);
    }
  };

  // Fetch syllabuses on component mount
  useEffect(() => {
    fetchSyllabuses();
    // Listen for the "syllabusAdded" event
    const handleSyllabusAdded = () => {
      fetchSyllabuses(); // Re-fetch syllabuses
    };

    eventEmitter.on("syllabusAdded", handleSyllabusAdded);

    // Cleanup listener on unmount
    return () => {
      eventEmitter.off("syllabusAdded", handleSyllabusAdded);
    };
  }, []); // Empty dependency array since we only want to set up the listener once

  return (
    <div className="flex flex-col flex-grow bg-background border-r h-full text-sm">
      <div className="px-3 py-4 border-b">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logoUrl}
            alt="SyllabAI Logo"
            className="w-10 h-10 object-contain"
          />
          <span className={`text-2xl font-bold whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <span className="text-black">SyllabAI</span>
          </span>
        </Link>
      </div>
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-1">
          <button
            onClick={() => setSyllabusesOpen(!syllabusesOpen)}
            className="flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-left rounded-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center">
              <Folder className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4 mr-2'}`} />
              <span className={`whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                My Syllabuses
              </span>
            </div>
            <span className={`transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
              {syllabusesOpen ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </span>
          </button>

          {syllabusesOpen && (
            <div className="ml-4 space-y-0.5 mt-0.5">
              {fetching && (
                <div className="text-xs text-muted-foreground px-2 py-0.5">
                  Loading...
                </div>
              )}

              {error && (
                <div className="text-xs text-red-500 px-2 py-0.5">
                  Error loading syllabuses
                </div>
              )}

              {syllabuses && syllabuses.length === 0 && !fetching && (
                <div className="text-xs text-muted-foreground px-2 py-0.5">
                  No syllabuses uploaded yet
                </div>
              )}

              {syllabuses &&
                syllabuses.map((syllabus: Syllabus) => (
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
                    <FileText className="mr-1.5 h-4 w-4 text-gray-500" />
                    <span className="truncate">{syllabus.title}</span>
                  </Link>
                ))}
            </div>
          )}
        </div>
      </nav>
      <div className="mt-auto px-3 py-3">
        <div className={`transition-all duration-300 ${isCollapsed ? 'h-0 opacity-0' : 'h-auto opacity-100'}`}>
          <UserMenu user={user} />
        </div>
        <Link
          to="/user/syllabus-upload"
          className={`flex items-center w-full px-3 py-2 mb-3 mt-4 text-sm font-medium rounded-sm text-white transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          style={{ 
            backgroundColor: themeColor,
            borderColor: themeColor,
          }}
          onMouseOver={(e) => {
            // Darken the background color for hover effect
            e.currentTarget.style.backgroundColor = adjustColorBrightness(themeColor, -15);
          }}
          onMouseOut={(e) => {
            // Restore original color
            e.currentTarget.style.backgroundColor = themeColor;
          }}
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

interface SideBarMenuButtonDrawerProps {
  user: User;
}

const SideBarMenuButtonDrawer = ({ user }: SideBarMenuButtonDrawerProps) => {
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
        <SideBar user={user} />
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
