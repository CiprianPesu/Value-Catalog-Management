'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { valueCatalogApi } from '@/shared/services/ValueCatalogApi';
import { FileSpreadsheet, Upload, X } from 'lucide-react';
import ValueCatalogTable from '@/features/Upload/views/ValueCatalogTable/ValueCatalogTable';
import { Separator } from '@/components/ui/separator';
import CnasLoader from '@/shared/components/loader/Loader';
import PressButtonCustom from '@/shared/components/pressButtons/PressButtons';
import type { Jurisdiction } from '@/shared/types/Jurisdiction';
import type { AxiosError } from 'axios';
import type { ApiError } from '@/shared/services/ApiClient';
import { jurisdictionApi } from '@/shared/services/JurisdictionApi';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MAX_SIZE = 100 * 1024 ** 2; // 100MB

const UploadPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<number | null>(null);
  const [versiune, setversiune] = useState<string>('');

  const { data: jurisdictions } = useQuery<Jurisdiction[]>({
    queryKey: ['jurisdictions'],
    queryFn: () => jurisdictionApi.getAll(),
  });

  const uploadFile = useMutation<string, Error, { file: File; version: string; jurisdictionId: number }>({
    mutationFn: ({ file, version, jurisdictionId }) => valueCatalogApi.uploadFile({ file, version, jurisdictionId }),
    onSuccess: () => {
      toast.success('Catalogul de dicționare a fost încărcat');
      queryClient.invalidateQueries({ queryKey: ['valueCatalogs'] });
      setFile(null);
      setversiune('');
    },
    onError: (e) => {
      const apiError = e as AxiosError<ApiError>;

      const backendError = apiError?.response?.data;

      backendError?.errors?.forEach((e) => {
        toast.error(`${e.field}: ${e.message}`);
      });

      setFile(null);
      setversiune('');
      setSelectedJurisdiction(null);
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: MAX_SIZE,
    disabled: uploadFile.isPending,
    accept: {
      'application/vnd.ms-excel': [],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [],
    },
    onDropRejected: () => toast.error('Sunt permise doar fișiere Excel (.xls, .xlsx) mai mici de 100MB.'),
  });

  const handleUpload = () => {
    if (!file) {
      toast.error('Te rugăm să selectezi un fișier Excel.');
      return;
    }

    if (!versiune || !/^\d+\.\d+\.\d+$/.test(versiune)) {
      toast.error('Versiunea trebuie să fie în formatul MAJOR.MINOR.PATCH, ex: 1.0.0');
      return;
    }

    if (!selectedJurisdiction) {
      toast.error('Te rugăm să selectezi o jurisdicție.');
      return;
    }

    uploadFile.mutate({ file, version: versiune, jurisdictionId: selectedJurisdiction });
  };

  return (
    <div className='p-4 flex flex-row flex-wrap justify-evenly gap-6'>
      {uploadFile.isPending && (
        <CnasLoader
          message={'Se încarcă fișierul...'}
          description={'Procesăm datele. Te rugăm să nu închizi pagina.'}
        />
      )}

      <div className='flex flex-col gap-4 min-w-[400px]'>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 h-[200px]
            flex items-center justify-center text-center cursor-pointer
            transition-colors
            ${uploadFile.isPending ? 'opacity-50 cursor-not-allowed' : isDragAccept ? 'border-blue-500' : isDragReject ? 'border-red-500' : 'border-muted'}`}
        >
          <input {...getInputProps()} />

          <div className='flex items-center gap-6 pointer-events-none'>
            {isDragAccept && <Upload size={52} className='text-blue-500' />}
            {isDragReject && <X size={52} className='text-red-500' />}
            {!isDragAccept && !isDragReject && <FileSpreadsheet size={52} className='text-muted-foreground' />}

            <div>
              <p className='text-lg font-medium'>Trage fișierul Excel aici sau apasă pentru a-l selecta</p>
              <p className='text-sm text-muted-foreground'>Acceptă doar .xls sau .xlsx (maxim 100MB)</p>
            </div>
          </div>
        </div>

        {file && (
          <div className='text-sm bg-muted p-2 rounded-md'>
            Fișier selectat: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB )
          </div>
        )}

        <Select
          onValueChange={(value) => setSelectedJurisdiction(parseInt(value))}
          disabled={uploadFile.isPending}
          value={selectedJurisdiction ? String(selectedJurisdiction) : undefined}
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Selectati o jurisdicție' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {jurisdictions?.map((j) => (
                <SelectItem key={j.id} value={String(j.id)}>
                  {j.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input
          min={1}
          placeholder='versiune (ex: 1.0.0)'
          value={versiune ?? ''}
          onChange={(e) => setversiune(e.target.value)}
        />

        <PressButtonCustom
          variant='blue'
          onClick={handleUpload}
          disabled={
            uploadFile.isPending || !file || !versiune || !/^\d+\.\d+\.\d+$/.test(versiune) || !selectedJurisdiction
          }
        >
          {uploadFile.isPending ? 'Se încarcă...' : 'Încărcați un fișier'}
        </PressButtonCustom>
      </div>

      <Separator orientation='vertical' />

      <div className='flex-1 min-w-[600px]'>
        <ValueCatalogTable />
      </div>
    </div>
  );
};

export default UploadPage;
