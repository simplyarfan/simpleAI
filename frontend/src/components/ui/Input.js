import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function Input({
  label,
  error,
  className,
  focused,
  onFocus,
  onBlur,
  ...props
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <motion.input
        className={cn(
          "w-full px-4 py-3 border rounded-xl transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500",
          "hover:bg-white hover:border-gray-300",
          focused && "bg-white border-blue-200 shadow-lg scale-[1.02]",
          error && "border-red-300 bg-red-50",
          className
        )}
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      />
      
      {error && (
        <motion.p
          className="text-sm text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
