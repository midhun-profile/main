
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/store/use-app-store';
import { updateSection } from '@/services/firestore';
import { useAuth } from '@/hooks/use-auth';

export function RenameModal() {
  const { 
    isRenameModalOpen, 
    setRenameModalOpen, 
    sectionToRename, 
    setSectionToRename 
  } = useAppStore();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (sectionToRename) {
      setName(sectionToRename.name);
    }
  }, [sectionToRename]);

  const handleSubmit = async () => {
    if (!name || !user || !sectionToRename) return;

    setIsSubmitting(true);
    try {
      await updateSection(user.uid, sectionToRename.id, { name });
      setRenameModalOpen(false);
      setSectionToRename(null);
    } catch (error) {
      console.error('Failed to rename section', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isRenameModalOpen} onOpenChange={(open) => {
      setRenameModalOpen(open);
      if (!open) setSectionToRename(null);
    }}>
      <DialogContent className="sm:max-w-[400px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Rename Section</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="renameInput" className="font-bold text-gray-700">New Section Name</Label>
            <Input
              id="renameInput"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-gray-200 h-12"
            />
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setRenameModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-xl h-12 bg-primary shadow-lg" 
            onClick={handleSubmit}
            disabled={isSubmitting || !name || name === sectionToRename?.name}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
