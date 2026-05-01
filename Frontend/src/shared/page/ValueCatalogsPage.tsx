'use client';

import { useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ValueCatalog } from '@/shared/types/ValueCatalog';
import type { ValueCatalogStats } from '@/shared/types/ValueCatalogStats';
import { valueCatalogApi } from '@/shared/services/ValueCatalogApi';
import { Download, FileText, List, AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import ConceptsStatusChart from '@/features/Translation/views/ConceptTable/ConceptsStatusChart';
import CnasLoader from '@/shared/components/loader/Loader';
import { toast } from 'sonner';
import { useIsUserInRole } from '@/features/Auth/hooks/useKeycloak';
import { config } from '@/config';
import { SlideInList } from '@/components/slide-in';
import { colors } from '@/lib/utils';
import type { AxiosError } from 'axios';
import type { ApiError } from '../services/ApiClient';

const ValueCatalogsPage = () => {
  const navigate = useNavigate();

  const {
    data: valueCatalogStats,
    isLoading,
    isError: valueCatalogStatisIsError,
    error: valueCatalogStatsError,
    refetch: refetchVersions,
  } = useQuery<ValueCatalogStats[], Error>({
    queryKey: ['ValueCatalogStats'],
    queryFn: valueCatalogApi.getVersionsStats,
  });

  const {
    data: valueCatalogs,
    isLoading: valueCatalogsLoading,
    isError: valueCatalogsIsError,
    error: valueCatalogsError,
    refetch: refetchFiles,
  } = useQuery<ValueCatalog[], Error>({
    queryKey: ['valueCatalogs'],
    queryFn: () => valueCatalogApi.getAll('uploadedAt', 'asc'),
  });

  const downloadTranslatedMutation = useMutation({
    mutationFn: (version: string) => valueCatalogApi.downloadTranslatedFile(version),
    onError: (error: Error) => {
      toast.error(`Download eșuat: ${error.message}`);
    },
  });

  const isAdmin = useIsUserInRole(config.ROLE_ADMINISTRATOR);

  const filesByVersion = useMemo(() => {
    return Object.groupBy(valueCatalogs ?? [], (catalog) => catalog.version);
  }, [valueCatalogs]);

  if (isLoading || valueCatalogsLoading) {
    return (
      <div className='flex flex-col items-center justify-center gap-3 py-20'>
        <div className='h-8 w-8 animate-spin rounded-full border-[3px] border-muted border-t-foreground' />
        <p className='text-sm text-muted-foreground'>Se încarcă versiunile catalog...</p>
      </div>
    );
  }

  if (valueCatalogsIsError || !valueCatalogs) {
    const apiError = valueCatalogsError as AxiosError<ApiError>;
    const backendError = apiError?.response?.data;

    backendError?.errors?.forEach((e) => {
      toast.error(`${e.field}: ${e.message}`);
    });

    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
          <AlertCircle className='h-6 w-6 text-destructive' />
        </div>
        <div className='text-center'>
          <p className='font-medium text-foreground'>Nu s-au putut încărca fișierele</p>
          <p className='mt-1 text-sm text-muted-foreground'>Verifică conexiunea și încearcă din nou.</p>
        </div>
        <Button variant='outline' size='sm' onClick={() => refetchFiles()}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reîncearcă
        </Button>
      </div>
    );
  }

  if (valueCatalogStatisIsError || !valueCatalogStats) {
    const apiError = valueCatalogStatsError as AxiosError<ApiError>;
    const backendError = apiError?.response?.data;

    backendError?.errors?.forEach((e) => {
      toast.error(`${e.field}: ${e.message}`);
    });

    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10'>
          <AlertCircle className='h-6 w-6 text-destructive' />
        </div>
        <div className='text-center'>
          <p className='font-medium text-foreground'>Nu s-au putut încărca datele MVC</p>
          <p className='mt-1 text-sm text-muted-foreground'>Verifică conexiunea și încearcă din nou.</p>
        </div>
        <Button variant='outline' size='sm' onClick={() => refetchVersions()}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reîncearcă
        </Button>
      </div>
    );
  }

  if (valueCatalogStats.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-4 py-20'>
        <div className='flex h-12 w-12 items-center justify-center rounded-full bg-muted'>
          <FileText className='h-6 w-6 text-muted-foreground' />
        </div>
        <div className='text-center'>
          <p className='font-medium text-foreground'>Nu există versiuni MVC încărcate</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Administratorii pot încărca fișiere MVC din pagina de încărcare.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {downloadTranslatedMutation.isPending && (
        <CnasLoader message='Se generează fișierul...' description='Procesăm datele. Te rugăm să nu închizi pagina.' />
      )}

      <SlideInList direction='left' staggerDelay={0.3} className='w-full'>
        {valueCatalogStats.map((catalog) => {
          const versionFiles = filesByVersion[catalog.version] ?? [];

          return (
            <Card key={catalog.version} className='overflow-hidden transition-shadow hover:shadow-md m-2 gap-0'>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <Badge variant='secondary' className='font-mono text-xs bg-orangeCnas text-white font-semibold'>
                      v{catalog.version}
                    </Badge>
                    <CardTitle className='text-base'>Versiune {catalog.version}</CardTitle>
                  </div>

                  <div className='flex items-center gap-1'>
                    <UiTooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8'
                          aria-label='Vizualizare dicționar'
                          onClick={() => navigate(catalog.version)}
                        >
                          <List className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Dicționare</TooltipContent>
                    </UiTooltip>

                    {isAdmin && (
                      <UiTooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            aria-label='Descărcare dicționar'
                            disabled={downloadTranslatedMutation.isPending}
                            onClick={() => downloadTranslatedMutation.mutate(catalog.version)}
                          >
                            <Download className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Descărcare MVC</TooltipContent>
                      </UiTooltip>
                    )}
                  </div>
                </div>

                <CardDescription>
                  {catalog.totalConcepts.toLocaleString('ro-RO')} concepte totale
                  {' / '}
                  {versionFiles.length} {versionFiles.length === 1 ? 'fișier' : 'fișiere'}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Accordion type='single' collapsible>
                  <AccordionItem value='details' className='border-b-0'>
                    <AccordionTrigger className='py-1 text-sm text-muted-foreground hover:text-foreground hover:no-underline'>
                      Detalii
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='flex flex-col gap-6 pt-2 lg:flex-row lg:items-start lg:justify-between'>
                        {/* File list */}
                        {versionFiles.length > 0 && (
                          <div className='flex flex-col gap-2'>
                            <p className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                              Fișiere
                            </p>
                            <div className='flex flex-col gap-1.5'>
                              {versionFiles.map((file) => (
                                <div
                                  key={file.id}
                                  className='flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors '
                                >
                                  <FileText className='h-4 w-4 shrink-0 text-chart-2' color={colors.blue_cnas} />
                                  <span className='font-medium text-foreground'>{file.name}</span>
                                  <Calendar className='h-4 w-4 shrink-0 text-chart-2' color={colors.blue_cnas} />
                                  <span className='font-medium text-foreground'>
                                    {new Date(file.uploadedAt).toLocaleDateString('ro-RO', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chart */}
                        <Card className='w-full border-0 shadow-none lg:max-w-xs'>
                          <CardContent className='p-0'>
                            <ConceptsStatusChart
                              total={catalog.totalConcepts}
                              translated={catalog.translatedConcepts}
                              validated={catalog.validatedConcepts}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </SlideInList>
    </>
  );
};

export default ValueCatalogsPage;
