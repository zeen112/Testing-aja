
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction } from '../utils/database';
import { toast } from 'sonner';
import { 
  getTransactionsFromSupabase, 
  addTransactionToSupabase 
} from '../utils/supabaseUtils';
import { useOnlineStatus } from './BaseContext';
import { supabase } from '@/integrations/supabase/client';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<Transaction | null>;
  exportTransactionsToExcel: () => void;
  importTransactionsFromExcel: (file: File) => Promise<void>;
  loading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOnline } = useOnlineStatus();

  // Initialize transactions from Supabase
  useEffect(() => {
    const initTransactions = async () => {
      try {
        setLoading(true);
        const supabaseTransactions = await getTransactionsFromSupabase();
        setTransactions(supabaseTransactions);
      } catch (error) {
        console.error('Failed to initialize transactions:', error);
        toast.error('Failed to initialize transactions');
      } finally {
        setLoading(false);
      }
    };
    
    initTransactions();
  }, []);

  // Set up realtime subscriptions for transactions when online
  useEffect(() => {
    if (!isOnline) return;
    
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        async (payload) => {
          console.log('Realtime update for transactions:', payload);
          const supabaseTransactions = await getTransactionsFromSupabase();
          setTransactions(supabaseTransactions);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const newTransaction = await addTransactionToSupabase(transaction);
      if (newTransaction) {
        toast.success('Transaction added successfully');
        return newTransaction;
      }
      return null;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      toast.error('Failed to add transaction');
      return null;
    }
  };

  const exportTransactionsToExcel = () => {
    try {
      // For now, we'll just show a message
      toast.error('Excel export not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to export transactions to Excel:', error);
      toast.error('Failed to export transactions to Excel');
    }
  };

  const importTransactionsFromExcel = async (file: File): Promise<void> => {
    try {
      // For now, we'll just show a message
      toast.error('Excel import not yet supported with Supabase integration');
    } catch (error) {
      console.error('Failed to import transactions:', error);
      toast.error('Failed to import transactions from Excel');
    }
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      exportTransactionsToExcel,
      importTransactionsFromExcel,
      loading
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
