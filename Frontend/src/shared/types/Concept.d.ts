export interface Concept {
  id: number;
  code: string;
  description: string | null;
  descriptionAutomatedTranslation: string | null;
  translation: {
    translation: string | null;
    translatedAt: string | null;
    translatedBy: string | null;
    validatedAt: string | null;
    validatedBy: string | null;
  };
}

export type ConceptStatus = 'pending' | 'translated' | 'validated';
