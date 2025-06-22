interface CacheItem<T> {
  data: T;
  timestamp: number;
}

// Default cache duration is 5 minutes
const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

export const cacheUtils = {
  // Set data in cache with a timestamp
  set: <T>(key: string, data: T): void => {
    if (typeof window === 'undefined') return;
    
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch (error) {
    }
  },

  // Get data from cache if it's still valid
  get: <T>(key: string, duration = DEFAULT_CACHE_DURATION): T | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const cacheItem: CacheItem<T> = JSON.parse(cached);
      const isExpired = Date.now() - cacheItem.timestamp > duration;
      
      return isExpired ? null : cacheItem.data;
    } catch (error) {
      return null;
    }
  },

  // Check if cache exists and is still valid
  isValid: (key: string, duration = DEFAULT_CACHE_DURATION): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return false;
      
      const cacheItem: CacheItem<any> = JSON.parse(cached);
      return Date.now() - cacheItem.timestamp <= duration;
    } catch {
      return false;
    }
  },

  // Remove a specific cache entry
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  // Clear all cache entries that start with a specific prefix
  clearByPrefix: (prefix: string): void => {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage)
      .filter(key => key.startsWith(prefix))
      .forEach(key => localStorage.removeItem(key));
  }
};

// Cache keys for dashboard data
export const CACHE_KEYS = {
  DASHBOARD_STATS: 'dashboard_stats',
  STATISTICS: 'dashboard_statistics',
  CATEGORY_DATA: 'dashboard_category_data',
  CUSTOMER_LOCATIONS: 'dashboard_customer_locations',
  // Prefix for all dashboard cache items
  DASHBOARD_PREFIX: 'dashboard_'
};
