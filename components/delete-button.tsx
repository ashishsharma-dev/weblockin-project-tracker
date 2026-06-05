"use client";

import { Button } from "./ui/button";

export function DeleteButton({ label = "Delete" }: { label?: string }) {
  return (
    <Button
      type="submit"
      variant="ghost"
      className="text-destructive"
      onClick={(event) => {
        if (!confirm("Are you sure you want to delete this record?")) {
          event.preventDefault();
        }
      }}
    >
      {label}
    </Button>
  );
}
