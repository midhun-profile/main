
'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { updateEntry, deleteEntry } from '@/services/firestore';
import { useAuth } from '@/hooks/use-auth';
import type { Entry, FieldBlueprint } from '@/types';

interface EntryCardProps {
  entry: Entry;
  blueprint: FieldBlueprint[];
}

export function EntryCard({ entry, blueprint }: EntryCardProps) {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(entry.collapsed ?? false);
  const [values, setValues] = useState(entry.values);

  // Sync values when external changes occur (blueprint changes)
  useEffect(() => {
    setValues(entry.values);
  }, [entry.values]);

  const handleUpdate = async (fieldName: string, value: any) => {
    if (!user) return;
    const newValues = { ...values, [fieldName]: value };
    setValues(newValues);
    try {
      await updateEntry(user.uid, entry.id, newValues);
    } catch (error) {
      console.error('Failed to update entry', error);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (confirm('Delete this item?')) {
      try {
        await deleteEntry(user.uid, entry.id);
      } catch (error) {
        console.error('Failed to delete entry', error);
      }
    }
  };

  const firstFieldName = blueprint[0]?.name || '';
  const label = values[firstFieldName] || `Item #${entry.id.slice(-4)}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-fade-in group">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 line-clamp-1">{label}</h4>
            <span className="text-xs text-gray-400 font-mono uppercase tracking-tight">ID: {entry.id.slice(-6)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronDown 
            className={cn(
              "h-5 w-5 text-gray-300 transition-transform duration-300",
              !isCollapsed && "rotate-180"
            )} 
          />
        </div>
      </div>
      
      <div className={cn(
        "collapsible-content px-4 lg:px-6",
        !isCollapsed && "active"
      )}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2 pb-6">
          {blueprint.map((field) => (
            <div key={field.name} className="space-y-1.5">
              <Label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {field.name}
              </Label>
              <Input
                type={field.type}
                value={values[field.name] || ''}
                onChange={(e) => handleUpdate(field.name, e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border-transparent focus:border-primary/30 focus:bg-white outline-none text-sm transition-all shadow-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
