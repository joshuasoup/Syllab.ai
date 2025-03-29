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

interface DeleteSyllabusButtonProps {
  syllabusId: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

export const DeleteSyllabusButton: React.FC<DeleteSyllabusButtonProps> = ({ 
  syllabusId, 
  variant = "destructive",
  className
}) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const [{ fetching }, deleteSyllabus] = useAction((id: string) => api.syllabus.delete(id));

  const handleDelete = async () => {
    try {
      await deleteSyllabus(syllabusId);
      toast.success("Syllabus deleted successfully");
      navigate("/user/syllabus-upload");
    } catch (error) {
      toast.error("Failed to delete syllabus");
      console.error("Delete syllabus error:", error);
    } finally {
      setOpen(false);
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