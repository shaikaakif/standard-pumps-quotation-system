/**
 * @fileoverview Cache abstraction layer for the SPQS application.
 *
 * Uses localStorage as the current storage backend but abstracts all access
 * through internal `_read` and `_write` methods to facilitate future migration
 * to IndexedDB or another storage mechanism.
 *
 * All cache keys are namespaced with `spqs_cache_` to avoid collisions.
 * Cached items are versioned — a version mismatch causes the entry to be
 * treated as stale. Optional TTL (time-to-live) support enables automatic
 * expiration of entries.
 */

/** @type {string} Application version, kept in sync with package.json */
export const APP_VERSION = '1.0.0';

/** @type {number} Cache schema version — bump when the storage shape changes */
const CACHE_VERSION = 1;

/** @type {string} Namespace prefix for all cache keys */
const KEY_PREFIX = 'spqs_cache_';

/**
 * @typedef {Object} CacheEntry
 * @property {*} value - The stored value
 * @property {number} timestamp - Unix timestamp (ms) when the entry was written
 * @property {number} version - Cache schema version at write time
 * @property {number} [ttl] - Optional TTL in milliseconds
 */

/**
 * Cache abstraction providing namespaced, versioned, TTL-aware storage.
 *
 * All public methods operate on prefixed keys so callers never need to
 * manage the namespace themselves. Internal storage access is funneled
 * through `_read` and `_write` — the only methods that touch the
 * underlying storage backend.
 */
export const CacheManager = {
  // ---------------------------------------------------------------------------
  // Internal storage access — IndexedDB migration points
  // ---------------------------------------------------------------------------

  /**
   * Reads raw data from the storage backend.
   * 🔄 MIGRATION POINT: Replace localStorage.getItem with IndexedDB read.
   *
   * @param {string} prefixedKey - The full (prefixed) key to read
   * @returns {CacheEntry | null} Parsed cache entry, or null if missing/corrupt
   * @private
   */
  _read(prefixedKey) {
    try {
      const raw = localStorage.getItem(prefixedKey);
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      // Corrupt or non-JSON data — treat as missing
      return null;
    }
  },

  /**
   * Writes raw data to the storage backend.
   * 🔄 MIGRATION POINT: Replace localStorage.setItem with IndexedDB write.
   *
   * @param {string} prefixedKey - The full (prefixed) key to write
   * @param {CacheEntry} data - The cache entry to persist
   * @private
   */
  _write(prefixedKey, data) {
    try {
      localStorage.setItem(prefixedKey, JSON.stringify(data));
    } catch {
      // Storage quota exceeded or access denied — fail silently
      // In production, consider logging to an error tracking service
    }
  },

  /**
   * Removes raw data from the storage backend.
   * 🔄 MIGRATION POINT: Replace localStorage.removeItem with IndexedDB delete.
   *
   * @param {string} prefixedKey - The full (prefixed) key to remove
   * @private
   */
  _remove(prefixedKey) {
    try {
      localStorage.removeItem(prefixedKey);
    } catch {
      // Fail silently
    }
  },

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Retrieves a cached value by key.
   *
   * Returns `null` if:
   * - The key doesn't exist
   * - The entry's cache version doesn't match the current CACHE_VERSION
   * - The entry's TTL has expired (also cleans up the expired entry)
   *
   * @param {string} key - The cache key (without prefix)
   * @returns {* | null} The cached value, or null if missing/stale/expired
   */
  get(key) {
    const prefixedKey = KEY_PREFIX + key;
    const entry = this._read(prefixedKey);

    if (!entry) return null;

    // Version mismatch — treat as stale
    if (entry.version !== CACHE_VERSION) {
      this._remove(prefixedKey);
      return null;
    }

    // TTL expiration check
    if (entry.ttl != null) {
      const age = Date.now() - entry.timestamp;
      if (age >= entry.ttl) {
        this._remove(prefixedKey);
        return null;
      }
    }

    return entry.value;
  },

  /**
   * Stores a value in the cache with a timestamp and optional TTL.
   *
   * @param {string} key - The cache key (without prefix)
   * @param {*} value - The value to cache (must be JSON-serializable)
   * @param {number} [ttlMs] - Optional time-to-live in milliseconds
   */
  set(key, value, ttlMs) {
    const prefixedKey = KEY_PREFIX + key;

    /** @type {CacheEntry} */
    const entry = {
      value,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    if (ttlMs != null) {
      entry.ttl = ttlMs;
    }

    this._write(prefixedKey, entry);
  },

  /**
   * Removes a single cached entry by key.
   *
   * @param {string} key - The cache key (without prefix)
   */
  remove(key) {
    this._remove(KEY_PREFIX + key);
  },

  /**
   * Clears all cached entries that use the app prefix.
   * Other localStorage entries are left untouched.
   *
   * 🔄 MIGRATION POINT: Replace with IndexedDB store clear or
   * filtered key deletion when migrating storage backends.
   */
  clear() {
    try {
      const keysToRemove = [];

      for (let i = 0; i < localStorage.length; i++) {
        const storageKey = localStorage.key(i);
        if (storageKey && storageKey.startsWith(KEY_PREFIX)) {
          keysToRemove.push(storageKey);
        }
      }

      keysToRemove.forEach((storageKey) => {
        localStorage.removeItem(storageKey);
      });
    } catch {
      // Fail silently
    }
  },

  /**
   * Checks whether a cached item is older than the specified maximum age.
   *
   * @param {string} key - The cache key (without prefix)
   * @param {number} maxAgeMs - Maximum allowed age in milliseconds
   * @returns {boolean} True if the item is missing, version-mismatched, or older than maxAgeMs
   */
  isStale(key, maxAgeMs) {
    const prefixedKey = KEY_PREFIX + key;
    const entry = this._read(prefixedKey);

    if (!entry) return true;

    // Version mismatch — always stale
    if (entry.version !== CACHE_VERSION) return true;

    const age = Date.now() - entry.timestamp;
    return age >= maxAgeMs;
  },

  /**
   * Returns the current cache schema version.
   *
   * @returns {number} The current CACHE_VERSION
   */
  getVersion() {
    return CACHE_VERSION;
  },
};
