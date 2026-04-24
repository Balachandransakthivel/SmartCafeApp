import { useState, useEffect } from 'react';
import { Table } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TABLES_KEY = '@smart_cafe_tables';

export const useTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const saved = await AsyncStorage.getItem(TABLES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setTables(parsed.map((t: any) => ({
          ...t,
          occupiedAt: t.occupiedAt ? new Date(t.occupiedAt) : undefined,
        })));
      } else {
        // Initialize default tables
        const defaultTables = generateDefaultTables();
        await saveTables(defaultTables);
        setTables(defaultTables);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveTables = async (tablesToSave: Table[]) => {
    try {
      await AsyncStorage.setItem(TABLES_KEY, JSON.stringify(tablesToSave));
    } catch (error) {
      console.error('Failed to save tables:', error);
    }
  };

  const generateDefaultTables = (): Table[] => {
    const tables: Table[] = [];
    for (let i = 1; i <= 15; i++) {
      tables.push({
        id: `table-${i}`,
        number: `T${i}`,
        capacity: i <= 5 ? 2 : i <= 10 ? 4 : 6,
        status: 'available',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`smartcafe://table/${i}`)}`,
      });
    }
    return tables;
  };

  const addTable = async (number: string, capacity: number) => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      number,
      capacity,
      status: 'available',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`smartcafe://table/${number}`)}`,
    };
    const updated = [...tables, newTable];
    setTables(updated);
    await saveTables(updated);
  };

  const updateTableStatus = async (
    tableId: string,
    status: Table['status'],
    orderId?: string
  ) => {
    const updated = tables.map((table) =>
      table.id === tableId
        ? {
            ...table,
            status,
            currentOrderId: orderId,
            occupiedAt: status === 'occupied' ? new Date() : undefined,
          }
        : table
    );
    setTables(updated);
    await saveTables(updated);
  };

  const assignOrderToTable = async (tableId: string, orderId: string) => {
    await updateTableStatus(tableId, 'occupied', orderId);
  };

  const clearTable = async (tableId: string) => {
    await updateTableStatus(tableId, 'available', undefined);
  };

  const getTableByNumber = (number: string) => {
    return tables.find((t) => t.number === number);
  };

  const getOccupiedTables = () => {
    return tables.filter((t) => t.status === 'occupied');
  };

  const getTurnoverTime = (table: Table): number => {
    if (!table.occupiedAt) return 0;
    const now = new Date();
    return Math.floor((now.getTime() - table.occupiedAt.getTime()) / (1000 * 60));
  };

  return {
    tables,
    loading,
    addTable,
    updateTableStatus,
    assignOrderToTable,
    clearTable,
    getTableByNumber,
    getOccupiedTables,
    getTurnoverTime,
    refreshTables: loadTables,
  };
};
