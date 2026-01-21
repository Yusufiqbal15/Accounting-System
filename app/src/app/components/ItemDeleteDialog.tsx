'use client';

import { useTranslation } from 'react-i18next';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { InventoryItem } from '../types';
import { toast } from 'sonner';

interface ItemDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

export function ItemDeleteDialog({ open, onOpenChange, item }: ItemDeleteDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsDeleting(false);
    setShowSuccess(true);

    // Show success message
    toast.success(t('messages.itemDeletedSuccessfully'));

    // Close dialog after showing success
    setTimeout(() => {
      setShowSuccess(false);
      onOpenChange(false);
    }, 1500);
  };

  if (!item) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold text-green-600">{t('messages.itemDeletedSuccessfully')}</h3>
            <p className="text-muted-foreground mt-2">{t('messages.itemDeletedSuccessfully')}</p>
          </div>
        ) : (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <AlertDialogTitle>{t('itemsManagement.deleteItem')}</AlertDialogTitle>
                  <AlertDialogDescription className="mt-1">
                    {t('dialogs.deleteMessage')}
                  </AlertDialogDescription>
                </div>
              </div>
            </AlertDialogHeader>

            <div className="my-4 p-4 bg-muted rounded-lg">
              <p className="text-sm mb-2">You are about to delete:</p>
              <div className="space-y-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">Item Code: {item.id}</p>
                <p className="text-sm text-muted-foreground">Quantity: {item.quantity} units</p>
                <p className="text-sm text-muted-foreground">Value: AED {(item.costPerUnit * item.quantity).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800 font-medium">⚠️ Warning</p>
              <p className="text-xs text-red-700 mt-1">
                Deleting this item will permanently remove it from your inventory. 
                Any associated production orders or transactions will be affected.
              </p>
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
                className="bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t('itemsManagement.deleteItem')}
                  </>
                ) : (
                  t('itemsManagement.deleteItem')
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
