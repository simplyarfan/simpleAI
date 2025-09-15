import { useEffect, useRef } from 'react';

/**
 * Performance monitoring hook
 */
export const usePerformance = (componentName) => {
  const renderStart = useRef(Date.now());
  const mountTime = useRef(null);

  useEffect(() => {
    mountTime.current = Date.now() - renderStart.current;
    
    if (mountTime.current > 100) {
      console.warn(`⚠️ Slow component mount: ${componentName} took ${mountTime.current}ms`);
    }
    
    return () => {
      const unmountTime = Date.now();
      console.log(`📊 Component lifecycle: ${componentName} - Mount: ${mountTime.current}ms`);
    };
  }, [componentName]);

  return {
    mountTime: mountTime.current,
    markRender: (label) => {
      const now = Date.now();
      console.log(`🎯 ${componentName} - ${label}: ${now - renderStart.current}ms`);
    }
  };
};

/**
 * API performance monitoring hook
 */
export const useAPIPerformance = () => {
  const trackAPICall = (endpoint, startTime, endTime, success = true) => {
    const duration = endTime - startTime;
    
    if (duration > 2000) {
      console.warn(`⚠️ Slow API call: ${endpoint} took ${duration}ms`);
    }
    
    console.log(`📡 API Performance: ${endpoint} - ${duration}ms - ${success ? '✅' : '❌'}`);
  };

  return { trackAPICall };
};

/**
 * Memory usage monitoring hook
 */
export const useMemoryMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in window.performance) {
      const checkMemory = () => {
        const memory = window.performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        
        if (usedMB > 50) {
          console.warn(`⚠️ High memory usage: ${usedMB}MB / ${totalMB}MB`);
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);
};