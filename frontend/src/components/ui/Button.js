import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const buttonVariants = {
  default: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700',
  outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800',
  ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
  destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl',
  gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl',
  glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
};

const sizeVariants = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
  xl: 'px-10 py-5 text-xl',
  icon: 'p-3',
};

export default function Button({
  children,
  variant = 'default',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0';
  
  return (
    <motion.button
      type={type}
      className={cn(
        baseClasses,
        buttonVariants[variant],
        sizeVariants[size],
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {loading && (
        <motion.div
          className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      )}
      {children}
    </motion.button>
  );
}
