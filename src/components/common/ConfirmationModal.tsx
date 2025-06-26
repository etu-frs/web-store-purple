
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button,ButtonProps } from "@/components/ui/button";
import React from "react";

interface ConfirmationModalProps {
  triggerText: string | React.ReactNode;
  triggerVariant?: ButtonProps['variant'];
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: ButtonProps['variant'];
}

const ConfirmationModalComponent: React.FC<ConfirmationModalProps> = ({
  triggerText,
  triggerVariant = "destructive", // Default trigger variant can be 'outline' or something less aggressive
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonVariant = "destructive" // Default confirm action is destructive
}) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {typeof triggerText === 'string' ? (
          <Button variant={triggerVariant}>{triggerText}</Button>
        ) : (
          triggerText
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={confirmButtonVariant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''} variant={confirmButtonVariant}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
ConfirmationModalComponent.displayName = 'ConfirmationModal';
export const ConfirmationModal = React.memo(ConfirmationModalComponent);
