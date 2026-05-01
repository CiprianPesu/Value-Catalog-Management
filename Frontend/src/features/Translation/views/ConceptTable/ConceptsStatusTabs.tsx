import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cog, UserCheck, Check } from 'lucide-react';
import type { ConceptStatus } from '@/shared/types/Concept';

interface ConceptsStatusTabsProps {
  activeStatus: ConceptStatus;
  onChange: (status: ConceptStatus) => void;
  disabled?: boolean;
}

export default function ConceptsStatusTabs({ activeStatus, onChange, disabled = false }: ConceptsStatusTabsProps) {
  return (
    <Tabs value={activeStatus} onValueChange={(v) => onChange(v as ConceptStatus)}>
      <TabsList className='border-border w-full rounded-none border-b bg-transparent p-0'>
        <TabsTrigger
          value='pending'
          disabled={disabled}
          className='dark:data-[state=active]:bg-gray-500 data-[state=active]:bg-gray-500 data-[state=active]:text-primary-foreground'
        >
          <Cog size={14} />
          In lucru
        </TabsTrigger>
        <TabsTrigger
          value='translated'
          disabled={disabled}
          className='dark:data-[state=active]:bg-orangeCnas data-[state=active]:bg-orangeCnas data-[state=active]:text-primary-foreground'
        >
          <UserCheck size={14} /> Traduse
        </TabsTrigger>
        <TabsTrigger
          value='validated'
          disabled={disabled}
          className='dark:data-[state=active]:bg-blueCnas data-[state=active]:bg-blueCnas data-[state=active]:text-primary-foreground'
        >
          <Check size={14} /> Validate
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
