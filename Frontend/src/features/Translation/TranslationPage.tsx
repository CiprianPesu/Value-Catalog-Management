'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import { ChartPie } from 'lucide-react';

import { valueSetsApi } from '@/shared/services/ValueSetsApi';
import { conceptApi } from '@/features/Translation/services/ConceptApi';

import type { ValueSet } from '@/shared/types/ValueSet';
import type { ConceptStatus } from '@/shared/types/Concept';
import { toast } from 'sonner';

import ConceptsTable from '@/features/Translation/views/ConceptTable/ConceptsTable';
import ConceptsStats from '@/features/Translation/views/ConceptTable/ConceptsStats';
import ConceptsStatusTabs from '@/features/Translation/views/ConceptTable/ConceptsStatusTabs';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TranslationPage = () => {
  const params = useParams<{ valueSetId: string; versionId: string }>();
  const queryClient = useQueryClient();
  const [activeStatus, setActiveStatus] = useState<ConceptStatus>('pending');

  const {
    data: valueSet,
    isLoading: isValueSetLoading,
    isError: isValueSetError,
    error: valueSetError,
  } = useQuery<ValueSet>({
    queryKey: ['valueSet', params.valueSetId],
    queryFn: () => valueSetsApi.getValueSetByid(params.valueSetId!),
    enabled: !!params.valueSetId,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['concepts'] });
    queryClient.invalidateQueries({ queryKey: ['valueSet'] });
  };

  const validateAuto = useMutation({
    mutationFn: (ids: number[]) => conceptApi.confirmAutomaticTranslations(ids),
    onSuccess: () => {
      toast.success('Traducerea a fost salvată');
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  const validate = useMutation({
    mutationFn: (ids: number[]) => conceptApi.validateTranslations(ids),
    onSuccess: () => {
      toast.success('Traducerea a fost validată');
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  const invalidateTranslation = useMutation({
    mutationFn: (ids: number[]) => conceptApi.invalidateTranslations(ids),
    onSuccess: () => {
      toast.success('Traducerea a fost invalidată');
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isValueSetLoading) {
    return (
      <div className='flex justify-center p-6'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-transparent' />
      </div>
    );
  }

  // Error states
  if (isValueSetError || !valueSet) {
    return (
      <div className='p-6 text-center text-red-600'>
        <p>Eroare la încărcarea ValueSet: {String(valueSetError?.message ?? 'Unknown error')}</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-2 w-full'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to='/traduceri'>Traduceri</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem className='cursor-pointer'>
            <BreadcrumbLink asChild>
              <Link to={`/traduceri/${params.versionId}`}> Versiune{params.versionId}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>{valueSet.name}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Accordion type='single' collapsible className='max-h-[500px]'>
        <AccordionItem value='statistici'>
          <AccordionTrigger>
            <Tooltip>
              <TooltipTrigger asChild>
                <ChartPie />
              </TooltipTrigger>
              <TooltipContent>Statistici</TooltipContent>
            </Tooltip>
          </AccordionTrigger>
          <AccordionContent>
            <ConceptsStats
              total={valueSet.totalConcepts}
              translated={valueSet.totalTranslatedConcepts}
              validated={valueSet.totalValidatedConcepts}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ConceptsStatusTabs activeStatus={activeStatus} onChange={setActiveStatus} disabled={isValueSetLoading} />

      <ConceptsTable
        activeStatus={activeStatus}
        onValidateAuto={validateAuto.mutate}
        onValidate={validate.mutate}
        onInvalidate={invalidateTranslation.mutate}
        valueSetId={valueSet.id}
      />
    </div>
  );
};

export default TranslationPage;
