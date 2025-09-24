const Redis = require('ioredis');

class CacheService {
  constructor() {
    this.redis = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 3;
  }

  async connect() {
    if (this.isConnected && this.redis) {
      return this.redis;
    }

    try {
      // Check if Redis URL is configured
      const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
      
      if (!redisUrl) {
        console.log('⚠️ No Redis URL configured, caching disabled');
        return null;
      }

      console.log('🔗 Connecting to Redis cache...');
      
      // Create Redis connection
      this.redis = new Redis(redisUrl, {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000,
        // Handle connection errors gracefully
        retryDelayOnClusterDown: 300,
        enableAutoPipelining: true
      });

      // Test connection
      await this.redis.ping();
      this.isConnected = true;
      console.log('✅ Redis cache connected successfully');
      
      // Handle connection events
      this.redis.on('error', (error) => {
        console.error('❌ Redis connection error:', error.message);
        this.isConnected = false;
      });

      this.redis.on('reconnecting', () => {
        console.log('🔄 Redis reconnecting...');
      });

      return this.redis;
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      this.isConnected = false;
      return null;
    }
  }

  // Cache CV analysis results (24h TTL)
  async cacheCVAnalysis(key, analysisResult, ttl = 86400) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return false;
      }

      const cacheKey = `cv_analysis:${key}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(analysisResult));
      console.log('💾 Cached CV analysis:', cacheKey);
      return true;
    } catch (error) {
      console.error('❌ Cache write failed:', error.message);
      return false;
    }
  }

  // Get cached CV analysis
  async getCachedCVAnalysis(key) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return null;
      }

      const cacheKey = `cv_analysis:${key}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log('🎯 Cache hit for CV analysis:', cacheKey);
        return JSON.parse(cached);
      }
      
      console.log('❌ Cache miss for CV analysis:', cacheKey);
      return null;
    } catch (error) {
      console.error('❌ Cache read failed:', error.message);
      return null;
    }
  }

  // Cache API responses (1h TTL)
  async cacheAPIResponse(endpoint, params, response, ttl = 3600) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return false;
      }

      const cacheKey = `api:${endpoint}:${this.hashParams(params)}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(response));
      console.log('💾 Cached API response:', cacheKey);
      return true;
    } catch (error) {
      console.error('❌ API cache write failed:', error.message);
      return false;
    }
  }

  // Get cached API response
  async getCachedAPIResponse(endpoint, params) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return null;
      }

      const cacheKey = `api:${endpoint}:${this.hashParams(params)}`;
      const cached = await this.redis.get(cacheKey);
      
      if (cached) {
        console.log('🎯 API cache hit:', cacheKey);
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('❌ API cache read failed:', error.message);
      return null;
    }
  }

  // Cache user sessions (7d TTL)
  async cacheUserSession(userId, sessionData, ttl = 604800) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return false;
      }

      const cacheKey = `session:${userId}`;
      await this.redis.setex(cacheKey, ttl, JSON.stringify(sessionData));
      return true;
    } catch (error) {
      console.error('❌ Session cache failed:', error.message);
      return false;
    }
  }

  // Get cached user session
  async getCachedUserSession(userId) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return null;
      }

      const cacheKey = `session:${userId}`;
      const cached = await this.redis.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('❌ Session cache read failed:', error.message);
      return null;
    }
  }

  // Clear cache by pattern
  async clearCache(pattern) {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return false;
      }

      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`🗑️ Cleared ${keys.length} cache entries matching: ${pattern}`);
      }
      return true;
    } catch (error) {
      console.error('❌ Cache clear failed:', error.message);
      return false;
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      if (!this.redis || !this.isConnected) {
        await this.connect();
        if (!this.redis) return null;
      }

      const info = await this.redis.info('memory');
      const keyCount = await this.redis.dbsize();
      
      return {
        connected: this.isConnected,
        keyCount,
        memoryInfo: info
      };
    } catch (error) {
      console.error('❌ Cache stats failed:', error.message);
      return null;
    }
  }

  // Helper function to hash parameters for consistent cache keys
  hashParams(params) {
    if (!params) return 'no-params';
    
    const crypto = require('crypto');
    const paramString = typeof params === 'string' ? params : JSON.stringify(params);
    return crypto.createHash('md5').update(paramString).digest('hex').substring(0, 8);
  }

  // Graceful disconnect
  async disconnect() {
    if (this.redis) {
      await this.redis.quit();
      this.isConnected = false;
      console.log('👋 Redis cache disconnected');
    }
  }
}

// Export singleton instance
const cacheService = new CacheService();
module.exports = cacheService;
