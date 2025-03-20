import React, { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

const CommandKBadge = () => {
  // Detect if user is on Mac or Windows/Linux
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    // Check if the user is on a Mac
    const checkIfMac = () => {
      return navigator.platform.toUpperCase().indexOf("MAC") >= 0 ||
             navigator.userAgent.toUpperCase().indexOf("MAC") >= 0;
    };
    
    setIsMac(checkIfMac());
  }, []);

  return (
    <div 
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "flex items-center gap-2 px-3 py-1.5 rounded-full",
        "bg-black/10 backdrop-blur-sm border border-white/10",
        "text-xs font-medium text-white shadow-sm",
        "transition-opacity duration-200 hover:opacity-100",
        "opacity-70",
      )} style ={{background:"black"}}
    >
      <div className="relative">
        <Keyboard size={14} className="text-white mr-0.5" />
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      </div>
      <span className="whitespace-nowrap">
        {isMac ? "⌘ K" : "Ctrl+K"} to chat
      </span>
    </div>
  );
};

export default CommandKBadge;