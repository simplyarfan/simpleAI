import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const cardVariants = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20',
  gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-xl border-0',
};

export function Card({ 
  children, 
  className, 
  variant = 'default',
  hover = true,
  ...props 
}) {
  const baseClasses = 'rounded-2xl overflow-hidden transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';
  
  return (
    <motion.div
      className={cn(
        baseClasses,
        cardVariants[variant],
        hoverClasses,
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className, ...props }) {
  return (
    <div className={cn('p-6 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }) {
  return (
    <div className={cn('p-6 pt-0', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }) {
  return (
    <div className={cn('p-6 pt-4 border-t border-gray-200 dark:border-gray-700', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }) {
  return (
    <h3 className={cn('text-xl font-semibold text-gray-900 dark:text-white', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className, ...props }) {
  return (
    <p className={cn('text-gray-600 dark:text-gray-400 mt-2', className)} {...props}>
      {children}
    </p>
  );
}
