"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export function AddEntryDialog({
  title,
  description,
  buttonText,
  children
}: {
  title: string;
  description?: string;
  buttonText: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  // We can automatically close the dialog when a form is submitted inside it
  const handleFormSubmit = (e: React.FormEvent<HTMLDivElement>) => {
    const target = e.target as HTMLFormElement;
    if (target.tagName === "FORM") {
      // Small timeout to let Next.js process the action before closing
      setTimeout(() => {
        setOpen(false);
      }, 150);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:opacity-90 transition-all font-semibold rounded-xl text-primary-foreground shadow-sm hover:shadow">
          <Plus className="h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onSubmitCapture={handleFormSubmit}
      >
        <div className="space-y-1.5 pb-4 border-b">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="pt-2">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
