
'use client';

import { useState } from 'react';
import { X, PlusCircle, MinusCircle, Wand2, Loader2 } from 'lucide-react';
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useAppStore } from '@/store/use-app-store';
import { createSection } from '@/services/firestore';
import { useAuth } from '@/hooks/use-auth';
import { recommendFieldType } from '@/ai/flows/field-type-recommendation';
import type { FieldBlueprint, FieldType } from '@/types';

export function SectionModal() {
  const { isSectionModalOpen, setSectionModalOpen, setActiveSectionId } = useAppStore();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [fields, setFields] = useState<FieldBlueprint[]>([{ name: '', type: 'text' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recommending, setRecommending] = useState<number | null>(null);

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
    if (!name || !user) return;
    const validFields = fields.filter(f => f.name.trim() !== '');
    if (validFields.length === 0) return;

    setIsSubmitting(true);
    try {
      const docRef = await createSection(user.uid, name, validFields);
      setActiveSectionId(docRef.id);
      setSectionModalOpen(false);
      setName('');
      setFields([{ name: '', type: 'text' }]);
    } catch (error) {
      console.error('Failed to create section', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isSectionModalOpen} onOpenChange={setSectionModalOpen}>
      <DialogContent className="sm:max-w-[450px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Configure New Section</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="sectionName" className="font-bold text-gray-700">Section Name</Label>
            <Input
              id="sectionName"
              placeholder="e.g. Employee Details"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border-gray-200 h-12 focus:ring-primary"
            />
          </div>

          <div className="space-y-4">
            <Label className="font-bold text-gray-700">Define Input Fields</Label>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
              {fields.map((field, index) => (
                <div key={index} className="flex gap-2 items-center animate-fade-in">
                  <div className="relative flex-1">
                    <Input
                      placeholder="Field Name"
                      value={field.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                      className="rounded-xl border-gray-200 pr-10"
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
              Add another field
            </Button>
          </div>
        </div>
        <DialogFooter className="gap-3 sm:gap-0">
          <Button variant="outline" className="flex-1 rounded-xl h-12" onClick={() => setSectionModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            className="flex-1 rounded-xl h-12 bg-primary shadow-lg shadow-primary/20" 
            onClick={handleSubmit}
            disabled={isSubmitting || !name || fields.every(f => !f.name)}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Section'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
