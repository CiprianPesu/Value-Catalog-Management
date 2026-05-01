'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { valueSetsApi } from '@/shared/services/ValueSetsApi';
import type { ValueSet } from '@/shared/types/ValueSet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import ConceptsStatusChart from '@/features/Translation/views/ConceptTable/ConceptsStatusChart';
import { Item, ItemContent, ItemTitle } from '@/components/ui/item';
import { valueCatalogApi } from '@/shared/services/ValueCatalogApi';
import type { ValueCatalogStats } from '@/shared/types/ValueCatalogStats';
import { CardFadeIn } from '@/components/fade-in';
import type { AxiosError } from 'axios';
import type { ApiError } from '../services/ApiClient';
import { toast } from 'sonner';

const ValueSetsPage: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();

  const {
    data: valueSets,
    isLoading: valueSetsIsLoading,
    isError: valueSetsIsError,
    error: valueSetsError,
  } = useQuery<ValueSet[], Error>({
    queryKey: ['valueSets', params.versionId],
    queryFn: () => valueSetsApi.getValueSetsByVersion(params.versionId!),
    enabled: !!params.versionId,
    staleTime: 0,
  });

  const {
    data: valueCatalogStats,
    isLoading: valueCatalogStatsIsLoading,
    isError: valueCatalogStatsIsError,
    error: valueCatalogStatsError,
  } = useQuery<ValueCatalogStats, Error>({
    queryKey: ['valueCatalogStats'],
    queryFn: () => valueCatalogApi.getVersionStats(params.versionId!),
    enabled: !!params.versionId,
    staleTime: 0,
  });

  if (valueSetsIsLoading || valueCatalogStatsIsLoading) {
    return (
      <div className='flex justify-center p-4'>
        <div className='h-6 w-6 animate-spin border-2 border-gray-300 border-t-transparent rounded-full' />
      </div>
    );
  }

  if (valueSetsIsError || valueCatalogStatsIsError || !valueCatalogStats || !valueSets) {
    const apiErrorCatalog = valueCatalogStatsError as AxiosError<ApiError>;
    const backendErrorCatalog = apiErrorCatalog?.response?.data;

    backendErrorCatalog?.errors?.forEach((e) => {
      toast.error(`${e.field}: ${e.message}`);
    });

    const apiErrorValueSets = valueSetsError as AxiosError<ApiError>;
    const backendErrorValueSets = apiErrorValueSets?.response?.data;

    backendErrorValueSets?.errors?.forEach((e) => {
      toast.error(`${e.field}: ${e.message}`);
    });

    return <div className='flex justify-center p-4 text-red-600'>Failed to load</div>;
  }

  const translatedPercent = (
    (valueCatalogStats.translatedConcepts * 100) /
    Math.max(valueCatalogStats.totalConcepts, 1)
  ).toFixed(2);
  const validatedPercent = (
    (valueCatalogStats.validatedConcepts * 100) /
    Math.max(valueCatalogStats.totalConcepts, 1)
  ).toFixed(2);

  return (
    <div className='p-4 w-full flex flex-col gap-4'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/traduceri')} className='cursor-pointer'>
              Traduceri
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>VERSION {params.versionId}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className='w-full'>
        <div className='flex flex-row items-center lg:items-stretch gap-10'>
          <div className='flex flex-1 flex-col gap-8'>
            <div>
              <span className='font-semibold text-sm'>Număr de dicționare</span>
              <div className='text-3xl font-bold'>{valueSets.length}</div>
            </div>

            <div>
              <div className='text-sm font-semibold  mb-3'>Concepte</div>

              <div className='flex gap-12'>
                <div className='flex flex-col'>
                  <span className='text-muted-foreground font-bold text-xs'>Total</span>
                  <span className='text-2xl font-bold'>{valueCatalogStats.totalConcepts}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-orangeCnas font-bold text-xs'>Traduse</span>
                  <span className='text-2xl font-bold text-orangeCnas'>{valueCatalogStats.translatedConcepts}</span>
                </div>

                <div className='flex flex-col'>
                  <span className='text-blueCnas font-bold text-xs'>Validate</span>
                  <span className='text-2xl font-bold text-blueCnas'>{valueCatalogStats.validatedConcepts}</span>
                </div>
              </div>
            </div>
            <div className='flex gap-10 pt-4 border-t'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs'>Traduse %</span>
                <span className='font-semibold text-orangeCnas'>{translatedPercent}%</span>
              </div>

              <div className='flex flex-col'>
                <span className='text-muted-foreground text-xs'>Validate %</span>
                <span className='font-semibold text-blueCnas'>{validatedPercent}%</span>
              </div>
            </div>
          </div>

          <div className='flex-shrink-0 w-full max-w-[280px]'>
            <ConceptsStatusChart
              total={valueCatalogStats.totalConcepts}
              translated={valueCatalogStats.translatedConcepts}
              validated={valueCatalogStats.validatedConcepts}
            />
          </div>
        </div>
      </div>

      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 items-stretch'>
        {valueSets.map((valueSet) => {
          const total = valueSet.totalConcepts;

          const translatedPercentNum = total > 0 ? (valueSet.totalTranslatedConcepts * 100) / total : 0;
          const validatedPercentNum = total > 0 ? (valueSet.totalValidatedConcepts * 100) / total : 0;

          return (
            <CardFadeIn
              key={valueSet.name}
              delay={0.5}
              onClick={() => navigate(valueSet.id.toString())}
              className='relative flex flex-col h-full border rounded-md pt-4 p-3 bg-card cursor-pointer'
            >
              <UiTooltip>
                <TooltipTrigger>
                  <div className='absolute top-0 left-0 w-full h-2 flex rounded-t-md overflow-hidden'>
                    <div className='bg-blueCnas' style={{ width: `${validatedPercentNum}%` }}></div>

                    <div
                      className='bg-orangeCnas'
                      style={{ width: `${translatedPercentNum - validatedPercentNum}%` }}
                    ></div>

                    <div
                      className='bg-gray-300 dark:bg-gray-700 flex-1'
                      style={{ width: `${100 - translatedPercentNum}%` }}
                    ></div>
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <div className='text-sm'>
                    <div>Concepte: {valueSet.totalConcepts}</div>
                    <div>Traduse: {valueSet.totalTranslatedConcepts}</div>
                    <div>Validate: {valueSet.totalValidatedConcepts}</div>
                  </div>
                </TooltipContent>
              </UiTooltip>

              <div className='flex items-start gap-4 align-middle'>
                <Item className='p-2'>
                  <ItemContent>
                    <ItemTitle className='font-bold'>{valueSet.name}</ItemTitle>
                  </ItemContent>
                </Item>
                <div className='flex flex-row gap-1 p-1'></div>
              </div>
            </CardFadeIn>
          );
        })}
      </div>
    </div>
  );
};

export default ValueSetsPage;
