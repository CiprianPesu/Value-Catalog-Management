'use client';

import { useEffect, useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, X, Pencil, ChevronUp, ChevronDown } from 'lucide-react';
import { useIsUserInRole } from '@/features/Auth/hooks/useKeycloak';
import { config } from '@/config';
import type { Concept, ConceptStatus } from '@/shared/types/Concept';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { conceptApi } from '@/features/Translation/services/ConceptApi';
import type { Page } from '@/shared/types/Pageble/Page';
import ConceptsPagination from './ConceptsPagination';
import EditTranslationDialog from '@/features/Translation/views/EditTranslationModal';
import { toast } from 'sonner';
import PressButtonCustom from '../../../../shared/components/pressButtons/PressButtons';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/shared/services/ApiClient';

interface ConceptsTableProps {
  valueSetId: number;
  activeStatus: ConceptStatus;
  onValidateAuto: (ids: number[]) => void;
  onValidate: (ids: number[]) => void;
  onInvalidate: (ids: number[]) => void;
}

const ConceptsTable = ({ valueSetId, activeStatus, onValidateAuto, onValidate, onInvalidate }: ConceptsTableProps) => {
  const isTranslator = useIsUserInRole(config.ROLE_TRANSLATOR);
  const isValidator = useIsUserInRole(config.ROLE_VALIDATOR);

  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [sorting, setSorting] = useState<SortingState>([{ id: 'code', desc: false }]);
  const [editingConcept, setEditingConcept] = useState<Concept | null>(null);
  const orderBy = sorting[0]?.id || 'code';
  const order = sorting[0]?.desc ? 'desc' : 'asc';
  const queryClient = useQueryClient();
  const {
    data: conceptsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Page<Concept>>({
    queryKey: ['concepts', valueSetId, activeStatus, page, size, orderBy, order],
    queryFn: () => conceptApi.fetchConceptsByValueSetAndStatus(valueSetId, activeStatus, page, size, orderBy, order),
  });

  const updateTranslation = useMutation({
    mutationFn: ({ id, translation }: { id: number; translation: string }) =>
      conceptApi.confirmManualTranslation(id, translation),
    onSuccess: () => {
      toast.success('Traducerea a fost salvată');
      invalidateAll();
    },
    onError: (e) => toast.error(e.message),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['concepts'] });
    queryClient.invalidateQueries({ queryKey: ['valueSet'] });
    queryClient.invalidateQueries({ queryKey: ['valueCatalogs'] });
    queryClient.invalidateQueries({ queryKey: ['ValueCatalogStats'] });
  };

  useEffect(() => {
    setRowSelection({});
  }, [activeStatus]);

  const standardColumns: ColumnDef<Concept>[] = [
    {
      id: 'select',
      enableSorting: false,
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllRowsSelected()}
          onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
          aria-label='Select all'
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(checked) => row.toggleSelected(!!checked)}
          aria-label={`Select row ${row.original.code}`}
        />
      ),
    },
    { accessorKey: 'code', header: 'Concept' },
    { accessorKey: 'description', header: 'Descriere' },
    { accessorKey: 'descriptionAutomatedTranslation', header: 'Traducere automată' },
    {
      accessorKey: 'translation',
      header: 'Traducere',
      accessorFn: (row) => row.translation?.translation,
      cell: ({ getValue }) => getValue() ?? '-',
    },
  ];

  let columns: ColumnDef<Concept>[] = [...standardColumns];
  if ((activeStatus === 'pending' && !isTranslator) || (activeStatus !== 'pending' && !isValidator))
    columns = columns.filter((c) => c.id != 'select');
  if ((activeStatus === 'pending' && isTranslator) || (activeStatus !== 'pending' && isValidator)) {
    columns.push({
      id: 'actions',
      header: 'Acțiuni',
      cell: ({ row }) => {
        const concept = row.original;
        return (
          <div className='flex gap-2'>
            {activeStatus === 'pending' && isTranslator && (
              <>
                <PressButtonCustom
                  variant='green'
                  onClick={() => {
                    (onValidateAuto([concept.id]), setRowSelection({}));
                  }}
                >
                  <Check size={16} />
                </PressButtonCustom>
                <PressButtonCustom
                  variant='blue'
                  onClick={() => {
                    (setEditingConcept(concept), setRowSelection({}));
                  }}
                >
                  <Pencil size={16} />
                </PressButtonCustom>
              </>
            )}
            {activeStatus === 'translated' && isValidator && (
              <PressButtonCustom
                variant='green'
                onClick={() => {
                  (onValidate([concept.id]), setRowSelection({}));
                }}
              >
                <Check size={16} />
              </PressButtonCustom>
            )}
            {activeStatus !== 'pending' && isValidator && (
              <PressButtonCustom
                variant='red'
                onClick={() => {
                  (onInvalidate([concept.id]), setRowSelection({}));
                }}
              >
                <X size={16} />
              </PressButtonCustom>
            )}
          </div>
        );
      },
    });
  }

  const table = useReactTable({
    data: conceptsData?.content ?? [],
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
    enableRowSelection: true,
    manualSorting: true,
  });

  if (isLoading) {
    return (
      <div className='flex justify-center p-6'>
        <div className='h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-transparent' />
      </div>
    );
  }

  if (isError) {
    const apiError = error as AxiosError<ApiError>;

    const backendError = apiError?.response?.data;

    backendError?.errors?.forEach((e) => {
      toast.error(`${e.field}: ${e.message}`);
    });

    return (
      <div className='p-4 text-center text-red-500'>
        Eroare la încărcarea conceptelor.
        <button className='underline' onClick={() => refetch()}>
          Reîncearcă
        </button>
      </div>
    );
  }

  if (!conceptsData?.content.length) {
    return <div className='p-4 text-center text-muted-foreground'>Nu există concepte</div>;
  }

  return (
    <div className='rounded-md border max-w-full overflow-x-auto'>
      {Object.keys(rowSelection).length > 0 && (
        <div className='flex gap-2 mb-2 p-2'>
          {activeStatus === 'pending' && isTranslator && (
            <PressButtonCustom
              variant='green'
              onClick={() => {
                const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
                onValidateAuto(ids);
                setRowSelection({});
              }}
            >
              <Check size={16} />
            </PressButtonCustom>
          )}
          {activeStatus === 'translated' && isValidator && (
            <PressButtonCustom
              variant='green'
              onClick={() => {
                const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
                (onValidate(ids), setRowSelection({}));
              }}
            >
              <Check size={16} />
            </PressButtonCustom>
          )}
          {activeStatus !== 'pending' && isValidator && (
            <PressButtonCustom
              variant='red'
              onClick={() => {
                const ids = table.getSelectedRowModel().rows.map((row) => row.original.id);
                onInvalidate(ids);
                setRowSelection({}); // optionally clear selection after action
              }}
            >
              <X size={16} />
            </PressButtonCustom>
          )}
        </div>
      )}

      <table className='w-full table-fixed'>
        <thead className='bg-muted'>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className={`p-2 text-left text-sm break-words whitespace-normal cursor-pointer select-none 
                    ${h.column.id === 'select' ? 'w-10' : ''} 
                    ${h.column.id === 'actions' ? 'w-40' : ''}`}
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className='flex items-center gap-1'>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' && <ChevronUp className='w-4 h-4' />}
                    {h.column.getIsSorted() === 'desc' && <ChevronDown className='w-4 h-4' />}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className='border-t'>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className='p-2 text-sm break-words whitespace-normal align-top'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {conceptsData.totalPages > 1 && (
        <ConceptsPagination page={page} setPage={setPage} totalPages={conceptsData.totalPages} disabled={isLoading} />
      )}

      <EditTranslationDialog
        open={!!editingConcept}
        concept={editingConcept}
        loading={updateTranslation.isPending}
        onSave={(translation) => {
          if (!editingConcept) return;

          updateTranslation.mutate(
            {
              id: editingConcept.id,
              translation,
            },
            {
              onSuccess: () => {
                setEditingConcept(null);
              },
            },
          );
        }}
        onClose={() => setEditingConcept(null)}
      />
    </div>
  );
};

export default ConceptsTable;
