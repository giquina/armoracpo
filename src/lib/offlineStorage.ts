/**
 * Offline Storage Layer using IndexedDB
 *
 * Provides offline-first data persistence for the ArmoraCPO app.
 * Stores assignments, messages, and pending actions for offline use.
 */

const DB_NAME = 'ArmoraCPO';
const DB_VERSION = 1;

// Object store names
const STORES = {
  ASSIGNMENTS: 'assignments',
  MESSAGES: 'messages',
  PENDING_ACTIONS: 'pending_actions',
  USER_DATA: 'user_data',
};

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.ASSIGNMENTS)) {
        db.createObjectStore(STORES.ASSIGNMENTS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messageStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messageStore.createIndex('assignment_id', 'assignment_id', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PENDING_ACTIONS)) {
        const actionStore = db.createObjectStore(STORES.PENDING_ACTIONS, {
          keyPath: 'id',
          autoIncrement: true,
        });
        actionStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
        db.createObjectStore(STORES.USER_DATA, { keyPath: 'key' });
      }
    };
  });
}

export const offlineStorage = {
  /**
   * Save data to offline storage
   */
  async save<T>(storeName: string, data: T): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.put(data);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  /**
   * Get data from offline storage
   */
  async get<T>(storeName: string, key: string): Promise<T | null> {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || null);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  },

  /**
   * Get all data from a store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  },

  /**
   * Delete data from offline storage
   */
  async delete(storeName: string, key: string): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(key);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  /**
   * Clear all data from a store
   */
  async clear(storeName: string): Promise<void> {
    const db = await openDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    store.clear();

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };
    });
  },

  /**
   * Add a pending action to sync when online
   */
  async queueAction(action: {
    type: string;
    endpoint: string;
    data: unknown;
    timestamp: number;
  }): Promise<void> {
    await this.save(STORES.PENDING_ACTIONS, action);
  },

  /**
   * Get all pending actions
   */
  async getPendingActions(): Promise<unknown[]> {
    return this.getAll(STORES.PENDING_ACTIONS);
  },

  /**
   * Remove a pending action
   */
  async removePendingAction(id: number): Promise<void> {
    await this.delete(STORES.PENDING_ACTIONS, String(id));
  },

  /**
   * Sync pending actions when online
   */
  async syncPendingActions(): Promise<void> {
    const actions = await this.getPendingActions();

    for (const action of actions) {
      try {
        // Process each action (implement based on action type)
        const actionData = action as { id: number; type: string; endpoint: string; data: unknown };
        console.log('[Offline Storage] Syncing action:', actionData.type);

        // TODO: Implement actual sync logic based on action type
        // For now, just remove the action
        await this.removePendingAction(actionData.id);
      } catch (error) {
        console.error('[Offline Storage] Failed to sync action:', error);
      }
    }
  },
};

// Export store names for external use
export const OFFLINE_STORES = STORES;
