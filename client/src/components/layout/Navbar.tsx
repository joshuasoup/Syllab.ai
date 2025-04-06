import React, { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { UserSilhouette } from '@/components/shared/UserSilhouette';
import imgUrl from '@images/syllabai-logo.png';

// Props interface for the Navbar component
interface NavbarProps {
  backLink?: string;
  backText?: string;
  customContent?: ReactNode;
  className?: string;
}

// UserMenu component extracted and adapted from _user.tsx
const UserMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const userInitials =
    user?.firstName?.[0] && user?.lastName?.[0]
      ? `${user.firstName[0]}${user.lastName[0]}`
      : user?.email?.[0]?.toUpperCase() ?? 'U';

  const userName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email ?? 'User';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user?.profilePicture?.url ? (
              <AvatarImage src={user.profilePicture.url} alt={userName} />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            {user?.profilePicture?.url ? (
              <AvatarImage src={user.profilePicture.url} alt={userName} />
            ) : (
              <AvatarFallback>{userInitials}</AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium">{userName}</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground">{user.email}</p>
            )}
          </div>
        </div>
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Navbar component
export const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="fixed top-0 left-0 w-full z-50 px-4 py-3 mt-1">
      {/* Detached navbar with shadow and border */}
      <div className="max-w-[800px] mx-auto bg-white rounded-3xl shadow-md border border-gray-200 px-6">
        <div className="flex justify-between items-center">
          <Link
            to="/dashboard"
            className="text-3xl font-semibold flex items-center gap-3"
          >
            <img src={imgUrl} alt="SyllabAI Logo" className="h-10 w-10" />
            <span className="text-black" style={{ fontWeight: 600 }}>
              SyllabAI
            </span>
          </Link>
          {user ? (
            <div className="scale-110 mr-3">
              <UserMenu />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="lg"
              className="w-16 h-16 p-0 flex items-center justify-center transition-all border border-transparent mr-3"
              asChild
            >
              <Link to="auth/sign-up">
                <UserSilhouette className="text-black w-full h-full" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
