'use client';

import { useState } from 'react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef, type SortingState } from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Download } from 'lucide-react';
import type { ValueCatalog } from '@/shared/types/ValueCatalog';
import { valueCatalogApi } from '@/shared/services/ValueCatalogApi';
import type { ApiError } from '@/shared/services/ApiClient';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

const ValueCatalogTable = () => {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'uploadedAt', desc: true }]);

  const orderBy = sorting[0]?.id || 'uploadedAt';
  const order = sorting[0]?.desc ? 'desc' : 'asc';

  const {
    data: files,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ValueCatalog[]>({
    queryKey: ['valueCatalogs', orderBy, order],
    queryFn: () => valueCatalogApi.getAll(orderBy, order),
  });

  const columns: ColumnDef<ValueCatalog>[] = [
    {
      accessorKey: 'name',
      header: 'Nume fișier',
    },
    {
      accessorKey: 'version',
      header: 'Versiune',
    },
    {
      accessorKey: 'jurisdiction',
      header: 'Jurisdicție',
    },
    {
      accessorKey: 'uploadedBy',
      header: 'Încărcat de',
    },
    {
      accessorKey: 'uploadedAt',
      header: 'Data',
      cell: ({ row }) => new Date(row.original.uploadedAt).toLocaleString('ro-RO'),
    },
    {
      id: 'actions',
      header: 'Acțiuni',
      enableSorting: false,
      cell: ({ row }) => (
        <Button
          variant='outline'
          size='icon'
          onClick={() => valueCatalogApi.downloadFile(row.original.id, row.original.name)}
        >
          <Download size={16} />
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: files ?? [],
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
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
        Eroare la încărcarea fișierelor.{' '}
        <button className='underline' onClick={() => refetch()}>
          Reîncearcă
        </button>
      </div>
    );
  }

  if (!files?.length) {
    return <div className='p-4 text-center text-muted-foreground'>Nu există fișiere încărcate.</div>;
  }

  return (
    <div className='rounded-md border max-w-full overflow-x-auto'>
      <table className='w-full table-fixed'>
        <thead className='bg-muted'>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className='p-2 text-left text-sm break-words whitespace-normal cursor-pointer select-none'
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
    </div>
  );
};

export default ValueCatalogTable;
