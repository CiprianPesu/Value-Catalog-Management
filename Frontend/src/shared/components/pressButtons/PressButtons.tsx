'use client';

import type { ReactNode } from 'react';
import clsx from 'clsx';
import { PressButton } from '../../../components/press';

type Variant = 'orange' | 'blue' | 'red' | 'green';

interface PressButtonsProps {
  variant: Variant;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  orange: 'bg-orangeCnas text-white hover:bg-orange-800',
  green: 'bg-green-600 text-white hover:bg-green-500',
  blue: 'bg-blueCnas text-white hover:bg-blue-900',
  red: 'bg-red-700 text-white hover:bg-red-600',
};

const PressButtonCustom = ({ variant, children, onClick, disabled, className }: PressButtonsProps) => {
  return (
    <PressButton
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'px-2 h-8 text-sm font-medium rounded-md',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </PressButton>
  );
};

export default PressButtonCustom;
