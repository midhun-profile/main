
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, MinusCircle, Wand2, Loader2, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';
import { updateSection } from '@/services/firestore';
import { useAuth } from '@/hooks/use-auth';
import { recommendFieldType } from '@/ai/flows/field-type-recommendation';
import type { Section, FieldBlueprint, FieldType } from '@/types';

interface EditFieldsModalProps {
  section: Section | null;
}

export function EditFieldsModal({ section }: EditFieldsModalProps) {
  const { isEditFieldsModalOpen, setEditFieldsModalOpen } = useAppStore();
  const { user } = useAuth();
  const [fields, setFields] = useState<FieldBlueprint[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommending, setRecommending] = useState<number | null>(null);

  useEffect(() => {
    if (section) {
      setFields(section.blueprint);
    }
  }, [section]);

  const addField = () => {
    setFields([...fields, { name: '', type: 'text' }]);
  };

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, key: keyof FieldBlueprint, value: string) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    setFields(newFields);
  };

  const handleRecommend = async (index: number) => {
    const fieldName = fields[index].name;
    if (!fieldName) return;
    
    setRecommending(index);
    try {
      const result = await recommendFieldType({ fieldName });
      updateField(index, 'type', result.recommendedType);
    } catch (error) {
      console.error('AI Recommendation failed', error);
    } finally {
      setRecommending(null);
    }
  };

  const handleSubmit = async () => {
    if (!user || !section) return;
    const validFields = fields.filter(f => f.name.trim() !== '');
    if (validFields.length === 0) return;

    setIsSubmitting(true);
    try {
      await updateSection(user.uid, section.id, { blueprint: validFields });
      setEditFieldsModalOpen(false);
    } catch (error) {
      console.error('Failed to update fields', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isEditFieldsModalOpen} onOpenChange={setEditFieldsModalOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Section Fields</DialogTitle>
          <DialogDescription className="bg-amber-50 text-amber-700 p-3 rounded-xl border border-amber-100 flex items-start gap-2 italic text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            Note: Renaming or removing fields will update the structure for all existing items.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
            {fields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Input
                    placeholder="Field Name"
                    value={field.name}
                    onChange={(e) => updateField(index, 'name', e.target.value)}
                    className="rounded-xl border-gray-200"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary/80"
                    onClick={() => handleRecommend(index)}
                    disabled={!field.name || recommending === index}
                  >
                    {recommending === index ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wand2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Select
                  value={field.type}
                  onValueChange={(val) => updateField(index, 'type', val as FieldType)}
                >
                  <SelectTrigger className="w-[120px] rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  onClick={() => removeField(index)}
                  disabled={fields.length === 1}
                >
                  <MinusCircle className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="link"
            className="p-0 h-auto text-primary font-bold flex items-center gap-1"
            onClick={addField}
          >
            <PlusCircle className="h-4 w-4" />
            Add new field
          </Button>
        </div>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setEditFieldsModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-xl h-12 bg-primary shadow-lg" 
            onClick={handleSubmit}
            disabled={isSubmitting || fields.every(f => !f.name)}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update Fields'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
