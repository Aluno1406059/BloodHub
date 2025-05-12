
import { openDB, DBSchema } from 'idb';
//import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface BloodRecord {
  id?: number;
  cpf: string;
  name: string;
  age: number;
  weight: number;
  bloodType: string;
  bags: number;
  date: Date;
  type: 'donation' | 'reception';
}

interface BloodInventory {
  bloodType: string;
  quantity: number;
}

interface BloodCenterDB extends DBSchema {
  records: {
    key: number;
    value: BloodRecord;
    indexes: { 'by-date': Date };
  };
  inventory: {
    key: string;
    value: BloodInventory;
  };
}

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const initDB = async () => {
  const db = await openDB<BloodCenterDB>('blood-center-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('records')) {
        const recordsStore = db.createObjectStore('records', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        recordsStore.createIndex('by-date', 'date');
      }

      if (!db.objectStoreNames.contains('inventory')) {
        const inventoryStore = db.createObjectStore('inventory', { 
          keyPath: 'bloodType' 
        });
        
        // Initialize blood inventory with zero for each type
        bloodTypes.forEach(type => {
          inventoryStore.put({
            bloodType: type,
            quantity: 0
          });
        });
      }
    }
  });
  //await resettDatabase(db);
  return db;
};

/*
const resettDatabase = async (db: IDBPDatabase<BloodCenterDB>) => {
  // Reset inventory
  const inventoryTx = db.transaction('inventory', 'readwrite');
  const inventoryStore = inventoryTx.objectStore('inventory');

  for (const type of bloodTypes) {
    await inventoryStore.put({
      bloodType: type,
      quantity: 0,
    });
  }
  await inventoryTx.done;

  // Clear records
  const recordsTx = db.transaction('records', 'readwrite');
  const recordsStore = recordsTx.objectStore('records');
  await recordsStore.clear();
  await recordsTx.done;
};
*/

let dbPromise = initDB();

// Inventory operations
export const getInventory = async (): Promise<BloodInventory[]> => {
  const db = await dbPromise;
  return db.getAll('inventory');
};

export const updateBloodBags = async (bloodType: string, change: number): Promise<BloodInventory> => {
  const db = await dbPromise;
  const tx = db.transaction('inventory', 'readwrite');
  const store = tx.objectStore('inventory');
  
  const inventory = await store.get(bloodType);
  if (!inventory) {
    throw new Error(`Blood type ${bloodType} not found in inventory`);
  }
  
  const updated = {
    ...inventory,
    quantity: Math.max(0, inventory.quantity + change)
  };
  
  await store.put(updated);
  await tx.done;
  
  return updated;
};

// Records operations
export const addRecord = async (record: Omit<BloodRecord, 'id'>): Promise<number> => {
  const db = await dbPromise;
  const tx = db.transaction(['records', 'inventory'], 'readwrite');
  
  // Add the record
  const id = await tx.objectStore('records').add({
    ...record,
    date: new Date(record.date)
  });
  
  // Update inventory
  const change = record.type === 'donation' ? record.bags : -record.bags;
  const inventoryStore = tx.objectStore('inventory');
  const inventory = await inventoryStore.get(record.bloodType);
  
  if (inventory) {
    const updatedQuantity = Math.max(0, inventory.quantity + change);
    await inventoryStore.put({
      ...inventory,
      quantity: updatedQuantity
    });
  }
  
  await tx.done;
  return id as number;
};

export const getRecords = async (
  startDate?: Date, 
  endDate?: Date
): Promise<BloodRecord[]> => {
  const db = await dbPromise;
  let records: BloodRecord[] = [];
  
  if (startDate && endDate) {
    const index = db.transaction('records').store.index('by-date');
    records = await index.getAll(IDBKeyRange.bound(startDate, endDate));
  } else {
    records = await db.getAll('records');
  }
  
  // Sort by date (newest first)
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const resetDatabase = async (): Promise<void> => {
  const db = await dbPromise;
  
  // Reset inventory
  const inventoryTx = db.transaction('inventory', 'readwrite');
  const inventoryStore = inventoryTx.objectStore('inventory');
  
  for (const type of bloodTypes) {
    await inventoryStore.put({
      bloodType: type,
      quantity: 0
    });
  }
  await inventoryTx.done;
  
  // Clear records
  const recordsTx = db.transaction('records', 'readwrite');
  await recordsTx.objectStore('records').clear();
  await recordsTx.done;
};

export { bloodTypes };
export type { BloodRecord, BloodInventory };
