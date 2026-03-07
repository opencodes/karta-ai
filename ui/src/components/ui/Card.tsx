import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils/cn';

type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: string;
};

export const Card = ({ children, className, title, ...props }: CardProps) => (
  <motion.div
    whileHover={{
      borderColor: 'rgba(100, 255, 218, 0.3)',
    }}
    transition={{
      duration: 0.2,
    }}
    className={cn(
      'glass rounded-2xl p-6 border border-main transition-colors duration-200',
      className,
    )}
    {...props}
  >
    {title && <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{title}</h3>}
    {children}
  </motion.div>
);
