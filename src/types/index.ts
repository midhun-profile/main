
export type FieldType = 'text' | 'number' | 'date' | 'email';

export interface FieldBlueprint {
  name: string;
  type: FieldType;
}

export interface Section {
  id: string;
  name: string;
  blueprint: FieldBlueprint[];
  userId: string;
  createdAt: number;
}

export interface Entry {
  id: string;
  sectionId: string;
  userId: string;
  values: Record<string, any>;
  createdAt: number;
  collapsed?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
