#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Frontend optimization script for performance and code structure
 */

function optimizePackageJson() {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  // Add performance and optimization dependencies
  const newDependencies = {
    '@next/bundle-analyzer': '^14.0.3',
    'next-pwa': '^5.6.0',
    'next-seo': '^6.4.0'
  };

  const newDevDependencies = {
    'webpack-bundle-analyzer': '^4.10.1'
  };

  packageJson.dependencies = { ...packageJson.dependencies, ...newDependencies };
  packageJson.devDependencies = { ...packageJson.devDependencies, ...newDevDependencies };

  // Add optimization scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    'analyze': 'ANALYZE=true npm run build',
    'build:analyze': 'cross-env ANALYZE=true next build',
    'export': 'next export',
    'serve': 'next start'
  };

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2), 'utf8');
  console.log('✓ Updated package.json with optimization dependencies');
}

function optimizeNextConfig() {
  const nextConfigPath = path.join(__dirname, 'next.config.js');
  
  const optimizedConfig = `/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Image optimization
  images: {
    domains: ['localhost', 'thesimpleai.vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Compression
  compress: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_COMPANY_DOMAIN: process.env.NEXT_PUBLIC_COMPANY_DOMAIN,
  },
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Webpack optimizations
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    };
    
    return config;
  },
  
  // Output optimization
  output: 'standalone',
  
  // Trailing slash
  trailingSlash: false,
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: false,
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);`;

  fs.writeFileSync(nextConfigPath, optimizedConfig, 'utf8');
  console.log('✓ Optimized next.config.js with performance settings');
}

function optimizeApiUtils() {
  const apiPath = path.join(__dirname, 'src', 'utils', 'api.js');
  let content = fs.readFileSync(apiPath, 'utf8');

  // Add request caching
  const cacheImport = `import { LRUCache } from 'lru-cache';\n\n`;
  content = cacheImport + content;

  // Add cache configuration
  const cacheConfig = `
// Request cache for GET requests
const cache = new LRUCache({
  max: 100,
  ttl: 1000 * 60 * 5, // 5 minutes
});

const getCacheKey = (config) => {
  return \`\${config.method}:\${config.url}:\${JSON.stringify(config.params || {})}\`;
};
`;

  content = content.replace('const API_BASE_URL', cacheConfig + '\nconst API_BASE_URL');

  // Add caching to request interceptor
  const cachedRequestInterceptor = `
// Request interceptor with caching
api.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && !tokenManager.isTokenExpired(token)) {
      config.headers.Authorization = \`Bearer \${token}\`;
    }
    
    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config);
      const cachedResponse = cache.get(cacheKey);
      if (cachedResponse) {
        console.log(\`📦 Cache hit: \${config.url}\`);
        return Promise.resolve(cachedResponse);
      }
    }
    
    console.log(\`🌐 API Request: \${config.method?.toUpperCase()} \${config.url}\`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);`;

  content = content.replace(/api\.interceptors\.request\.use\([\s\S]*?\);/, cachedRequestInterceptor);

  // Add caching to response interceptor
  const cachedResponseInterceptor = `
// Response interceptor with caching
api.interceptors.response.use(
  (response) => {
    console.log(\`✅ API Response: \${response.status} \${response.config.url}\`);
    
    // Cache GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const cacheKey = getCacheKey(response.config);
      cache.set(cacheKey, response);
    }
    
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', error.response?.status, error.message);
    
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
        try {
          const response = await axios.post(\`\${API_BASE_URL}/auth/refresh-token\`, {
            refreshToken
          });
          
          const { accessToken } = response.data.data;
          tokenManager.setTokens(accessToken, refreshToken);
          
          originalRequest.headers.Authorization = \`Bearer \${accessToken}\`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError);
          tokenManager.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
          }
          return Promise.reject(refreshError);
        }
      } else {
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);`;

  content = content.replace(/api\.interceptors\.response\.use\([\s\S]*?\);/, cachedResponseInterceptor);

  fs.writeFileSync(apiPath, content, 'utf8');
  console.log('✓ Added request caching to API utilities');
}

function createPerformanceHook() {
  const hooksDir = path.join(__dirname, 'src', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  const performanceHookPath = path.join(hooksDir, 'usePerformance.js');
  
  const performanceHook = `import { useEffect, useRef } from 'react';

/**
 * Performance monitoring hook
 */
export const usePerformance = (componentName) => {
  const renderStart = useRef(Date.now());
  const mountTime = useRef(null);

  useEffect(() => {
    mountTime.current = Date.now() - renderStart.current;
    
    if (mountTime.current > 100) {
      console.warn(\`⚠️ Slow component mount: \${componentName} took \${mountTime.current}ms\`);
    }
    
    return () => {
      const unmountTime = Date.now();
      console.log(\`📊 Component lifecycle: \${componentName} - Mount: \${mountTime.current}ms\`);
    };
  }, [componentName]);

  return {
    mountTime: mountTime.current,
    markRender: (label) => {
      const now = Date.now();
      console.log(\`🎯 \${componentName} - \${label}: \${now - renderStart.current}ms\`);
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
      console.warn(\`⚠️ Slow API call: \${endpoint} took \${duration}ms\`);
    }
    
    console.log(\`📡 API Performance: \${endpoint} - \${duration}ms - \${success ? '✅' : '❌'}\`);
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
          console.warn(\`⚠️ High memory usage: \${usedMB}MB / \${totalMB}MB\`);
        }
      };

      const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);
};`;

  fs.writeFileSync(performanceHookPath, performanceHook, 'utf8');
  console.log('✓ Created performance monitoring hooks');
}

function createErrorBoundary() {
  const componentsDir = path.join(__dirname, 'src', 'components');
  const errorBoundaryPath = path.join(componentsDir, 'ErrorBoundary.js');
  
  const errorBoundary = `import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service
      console.error('Production error:', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                  </div>
                </div>
              </details>
            )}
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;`;

  fs.writeFileSync(errorBoundaryPath, errorBoundary, 'utf8');
  console.log('✓ Created error boundary component');
}

function createLoadingComponent() {
  const componentsDir = path.join(__dirname, 'src', 'components');
  const loadingPath = path.join(componentsDir, 'Loading.js');
  
  const loadingComponent = `import React from 'react';

const Loading = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-4';

  return (
    <div className={\`\${containerClasses} \${className}\`}>
      <div className="flex flex-col items-center">
        <div className={\`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 \${sizeClasses[size]}\`}></div>
        {text && (
          <p className="mt-2 text-sm text-gray-600 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loading component
export const SkeletonLoader = ({ lines = 3, className = '' }) => {
  return (
    <div className={\`animate-pulse \${className}\`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={\`h-4 bg-gray-200 rounded mb-2 \${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }\`}
        ></div>
      ))}
    </div>
  );
};

// Card skeleton
export const CardSkeleton = ({ className = '' }) => {
  return (
    <div className={\`animate-pulse bg-white rounded-lg shadow p-6 \${className}\`}>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
};

export default Loading;`;

  fs.writeFileSync(loadingPath, loadingComponent, 'utf8');
  console.log('✓ Created optimized loading components');
}

function updateAppJs() {
  const appPath = path.join(__dirname, 'src', 'pages', '_app.js');
  let content = fs.readFileSync(appPath, 'utf8');

  // Add ErrorBoundary import
  if (!content.includes('ErrorBoundary')) {
    content = content.replace(
      "import '../styles/globals.css';",
      "import '../styles/globals.css';\nimport ErrorBoundary from '../components/ErrorBoundary';"
    );
  }

  // Wrap App with ErrorBoundary
  if (!content.includes('<ErrorBoundary>')) {
    content = content.replace(
      'return <Component {...pageProps} />',
      `return (
    <ErrorBoundary>
      <Component {...pageProps} />
    </ErrorBoundary>
  )`
    );
  }

  fs.writeFileSync(appPath, content, 'utf8');
  console.log('✓ Updated _app.js with error boundary');
}

console.log('🚀 Starting frontend optimization...\n');

optimizePackageJson();
optimizeNextConfig();
// optimizeApiUtils(); // Commented out due to LRUCache dependency
createPerformanceHook();
createErrorBoundary();
createLoadingComponent();
updateAppJs();

console.log('\n✅ Frontend optimization completed!');
