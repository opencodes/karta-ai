import React from 'react';
import { cn } from '../../utils/cn';

export const Button = ({
  children,
  variant = 'primary',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'secondary' }) => {
  const variants = {
    primary: 'bg-teal text-black hover:bg-teal/90 shadow-[0_0_20px_rgba(100,255,218,0.3)]',
    outline: 'border border-teal/50 text-teal hover:bg-teal/10',
    ghost: 'text-slate-500 hover:text-heading hover:bg-black/5 dark:hover:bg-white/5',
    secondary: 'bg-black/5 dark:bg-white/5 text-heading hover:bg-black/10 dark:hover:bg-white/10'
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
