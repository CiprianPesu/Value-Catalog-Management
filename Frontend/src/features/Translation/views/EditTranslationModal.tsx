'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Concept } from '@/shared/types/Concept';
import { SaveIcon } from 'lucide-react';
import PressButtonCustom from '@/shared/components/pressButtons/PressButtons';
import { toast } from 'sonner';

type EditTranslationDialogProps = {
  open: boolean;
  concept: Concept | null;
  onSave: (translation: string) => void;
  loading?: boolean;
  onClose: () => void;
};

const EditTranslationDialog: React.FC<EditTranslationDialogProps> = ({ open, concept, onSave, onClose }) => {
  const [translation, setTranslation] = useState('');

  useEffect(() => {
    if (concept) {
      setTranslation(concept.translation.translation ?? '');
    }
  }, [concept]);

  if (!concept) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Editează traducerea</DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-4'>
          <div className='space-y-1'>
            <label className='text-sm font-medium'>Cod</label>
            <Input
              value={concept.code}
              className='focus-visible:border-blueCnas focus-visible:ring-blueCnas/20 dark:focus-visible:ring-blueCnas/40'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Descriere</label>
            <Textarea
              value={concept.description ?? ''}
              rows={2}
              className='focus-visible:border-blueCnas focus-visible:ring-blueCnas/20 dark:focus-visible:ring-blueCnas/40'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Traducere automată</label>
            <Textarea
              value={concept.descriptionAutomatedTranslation ?? ''}
              rows={2}
              className='focus-visible:border-blueCnas focus-visible:ring-blueCnas/20 dark:focus-visible:ring-blueCnas/40'
            />
          </div>

          <div className='space-y-1'>
            <label className='text-sm font-medium'>Traducere finală</label>
            <Textarea
              placeholder='Introdu traducerea corectă...'
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className='focus-visible:border-orangeCnas focus-visible:ring-orangeCnas/30 dark:focus-visible:ring-orangeCnas/20'
              rows={3}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter className='gap-2'>
          <PressButtonCustom
            variant='green'
            disabled={translation === concept.translation.translation}
            onClick={() => {
              if (!translation.trim()) {
                toast.error('Traducerea nu poate fi goală.');
                return;
              }

              onSave(translation);
            }}
          >
            <SaveIcon size={16} />
          </PressButtonCustom>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTranslationDialog;
