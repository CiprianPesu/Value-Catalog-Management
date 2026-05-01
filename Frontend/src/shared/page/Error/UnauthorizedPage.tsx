'use client';

import { Card } from '@/components/ui/card';
import useKeycloak from '@/features/Auth/hooks/useKeycloak';
import { ShieldCheck, Lock, LogOut } from 'lucide-react';

// Simulated keycloak hook for demo purposes

export default function UnathorizedPage() {
  const { keycloak } = useKeycloak();

  const username = keycloak?.tokenParsed?.name ?? keycloak?.tokenParsed?.preferred_username ?? 'Neidentificat';

  return (
    <div className='flex flex-col items-center bg-background px-4 py-12'>
      {/* Background decorative elements */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-40 right-0 h-80 w-80 rounded-full bg-muted opacity-60 blur-3xl' />
        <div className='absolute -bottom-40 left-0 h-80 w-80 rounded-full bg-muted opacity-60 blur-3xl' />
      </div>

      <div className='relative z-10 flex w-full max-w-md flex-col items-center gap-8'>
        {/* Icon badge */}
        <div className='flex h-20 w-20 items-center justify-center rounded-2xl bg-card shadow-sm ring-1 ring-border'>
          <Lock className='h-9 w-9 text-foreground' strokeWidth={1.5} />
        </div>

        {/* Heading area */}
        <div className='flex flex-col items-center gap-3 text-center'>
          <h1 className='text-balance text-3xl font-semibold tracking-tight text-foreground'>Neautorizat</h1>
          <p className='max-w-xs text-pretty leading-relaxed text-muted-foreground text-center'>
            Utilizatorul <span className='font-bold'>{username}</span> nu are permisiunile necesare.
          </p>
        </div>

        <Card className='w-full gap-0 border border-border bg-card p-0 shadow-sm'>
          <button
            onClick={() => keycloak?.logout()}
            className='group flex w-full items-center gap-4 rounded-lg px-6 py-5 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          >
            <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blueCnas text-primary-foreground transition-transform group-hover:scale-105'>
              <LogOut className='h-5 w-5' />
            </div>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-semibold text-card-foreground'>Schimbati utilizatorul conectat</span>
              <span className='text-xs text-muted-foreground'>{'Autentificare securizata prin Keycloak'}</span>
            </div>
            <svg
              className='ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              strokeWidth={2}
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
            </svg>
          </button>

          <div className='mx-6 h-px bg-border' />

          <div className='flex items-center gap-3 px-6 py-4'>
            <ShieldCheck className='h-4 w-4 shrink-0 text-muted-foreground' />
            <p className='text-xs leading-relaxed text-muted-foreground'>
              Datele dumneavoastra sunt protejate si conexiunea este criptata.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
