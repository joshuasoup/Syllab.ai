import React, { useState } from "react";
import { useAction } from "@/hooks/useAction";
import { api } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { eventEmitter } from "@/utils/eventEmitter";

interface DeleteSyllabusButtonProps {
  syllabusId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  onDelete?: () => void;
  redirectTo?: string;
}

export const DeleteSyllabusButton: React.FC<DeleteSyllabusButtonProps> = ({ 
  syllabusId, 
  variant = "destructive",
  className,
  onDelete,
  redirectTo = "/user/syllabus-upload"
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const [{ fetching }, deleteSyllabus] = useAction((id: string) => api.syllabus.delete(id));

  const handleDelete = async () => {
    try {
      await deleteSyllabus(syllabusId);
      toast.success("Syllabus deleted successfully");
      // Emit the syllabusDeleted event
      eventEmitter.emit('syllabusDeleted', syllabusId);
      // Call the onDelete callback if provided
      onDelete?.();
      // Close the dialog first
      setOpen(false);
      // Then navigate after a short delay to ensure state is cleaned up
      setTimeout(() => {
        navigate(redirectTo);
      }, 100);
    } catch (error: any) {
      console.error("Delete syllabus error:", error);
      // Show a more specific error message based on the error type
      if (error.message?.includes('Authentication failed')) {
        toast.error("Your session has expired. Please sign in again.");
        navigate('/auth/sign-in');
      } else if (error.message?.includes('not found')) {
        toast.error("Syllabus not found. It may have been already deleted.");
        setOpen(false);
        setTimeout(() => {
          navigate(redirectTo);
        }, 100);
      } else {
        toast.error(error.message || "Failed to delete syllabus");
      }
    }
  };

  return (
    <>
      <Button 
        variant={variant} 
        onClick={() => setOpen(true)} 
        disabled={fetching}
        className={className}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Submission
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this syllabus? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={fetching}
            >
              {fetching ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DeleteSyllabusButton;
