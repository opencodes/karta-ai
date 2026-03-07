import React from 'react';
import { cn } from '../../utils/cn';

export const Button = ({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'secondary' }) => {
  const variants = {
    primary: 'btn-primary-ui shadow-[0_0_20px_rgba(100,255,218,0.3)]',
    outline: 'border border-teal/50 text-teal hover:bg-teal/10',
    ghost: 'btn-ghost-ui',
    secondary: 'btn-secondary-ui',
  };

  return (
    <button
      className={cn(
        'px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
