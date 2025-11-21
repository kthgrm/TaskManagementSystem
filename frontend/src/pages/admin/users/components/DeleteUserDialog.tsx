import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface DeleteUserDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => Promise<void>;
    userName: string;
}

export function DeleteUserDialog({ open, onOpenChange, onConfirm, userName }: DeleteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirm = async () => {
        setIsLoading(true);
        try {
            await onConfirm();
            onOpenChange(false);
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-destructive/10 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle>Delete User</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4">
                        Are you sure you want to delete user <strong>{userName}</strong>?
                        <br />
                        <br />
                        If the user has active projects or tasks, they will be deactivated instead of deleted.
                        <br />
                        <br />
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleConfirm} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete User'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
