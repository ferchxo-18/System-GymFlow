import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MOCK_CLIENTS, 
  MOCK_PAYMENTS, 
  MOCK_STAFF, 
  MOCK_ATTENDANCE, 
  MOCK_INVENTORY, 
  MOCK_MEASUREMENTS,
  MOCK_USERS
} from '../constants';
import { Client, Payment, Staff, AttendanceRecord, Product, Measurement, User } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface GymContextType {
  clients: Client[];
  payments: Payment[];
  staff: Staff[];
  attendance: AttendanceRecord[];
  inventory: Product[];
  measurements: Measurement[];
  isAuthenticated: boolean;
  currentUser: User | null;
  users: User[];
  
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  
  addPayment: (payment: Payment) => void;
  updatePayment: (payment: Payment) => void;
  deletePayment: (id: string) => void;
  
  addStaff: (staff: Staff) => void;
  updateStaff: (staff: Staff) => void;
  deleteStaff: (id: string) => void;
  
  markAttendance: (staffId: string) => void;
  
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  sellProduct: (productId: string, quantity: number) => void;

  addMeasurement: (measurement: Measurement) => void;
  deleteMeasurement: (id: string) => void;

  // User Management
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(isSupabaseConfigured ? [] : MOCK_CLIENTS);
  const [payments, setPayments] = useState<Payment[]>(isSupabaseConfigured ? [] : MOCK_PAYMENTS);
  const [staff, setStaff] = useState<Staff[]>(isSupabaseConfigured ? [] : MOCK_STAFF);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(isSupabaseConfigured ? [] : MOCK_ATTENDANCE);
  const [inventory, setInventory] = useState<Product[]>(isSupabaseConfigured ? [] : MOCK_INVENTORY);
  const [measurements, setMeasurements] = useState<Measurement[]>(isSupabaseConfigured ? [] : MOCK_MEASUREMENTS);
  
  // Auth State
  const [users, setUsers] = useState<User[]>(() => {
    if (isSupabaseConfigured) return [];
    const saved = localStorage.getItem('gym_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('gym_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem('gym_current_user');
  });

  // Load Data from Supabase if configured
  useEffect(() => {
    const loadSupabaseData = async () => {
      if (!isSupabaseConfigured || !supabase) return;
      try {
        const [
          { data: cData }, { data: pData }, { data: sData },
          { data: aData }, { data: iData }, { data: mData }, { data: uData }
        ] = await Promise.all([
          supabase.from('clients').select('*'),
          supabase.from('payments').select('*'),
          supabase.from('staff').select('*'),
          supabase.from('attendance').select('*'),
          supabase.from('inventory').select('*'),
          supabase.from('measurements').select('*'),
          supabase.from('users').select('*')
        ]);

        if (cData) setClients(cData);
        if (pData) setPayments(pData);
        if (sData) setStaff(sData);
        if (aData) setAttendance(aData);
        if (iData) setInventory(iData);
        if (mData) setMeasurements(mData);
        if (uData) setUsers(uData);
      } catch (error) {
        console.error("Error loading data from Supabase:", error);
      }
    };
    loadSupabaseData();
  }, []);

  // Persist local Users
  useEffect(() => {
    if (!isSupabaseConfigured) {
      localStorage.setItem('gym_users', JSON.stringify(users));
    }
  }, [users]);

  // Use functional updates to ensure we always have the latest state
  const addClient = async (client: Client) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').insert([client]);
    }
    setClients(prev => [...prev, client]);
  };
  
  const updateClient = async (updatedClient: Client) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').update(updatedClient).eq('id', updatedClient.id);
    }
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const deleteClient = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('clients').delete().eq('id', id);
    }
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const addPayment = async (payment: Payment) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('payments').insert([payment]);
    }
    setPayments(prev => [payment, ...prev]);
  };

  const updatePayment = async (updatedPayment: Payment) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('payments').update(updatedPayment).eq('id', updatedPayment.id);
    }
    setPayments(prev => prev.map(p => p.id === updatedPayment.id ? updatedPayment : p));
  };

  const deletePayment = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('payments').delete().eq('id', id);
    }
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const addStaff = async (newStaff: Staff) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('staff').insert([newStaff]);
    }
    setStaff(prev => [...prev, newStaff]);
  };
  
  const updateStaff = async (updatedStaff: Staff) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('staff').update(updatedStaff).eq('id', updatedStaff.id);
    }
    setStaff(prev => prev.map(s => s.id === updatedStaff.id ? updatedStaff : s));
  };

  const deleteStaff = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('staff').delete().eq('id', id);
    }
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const markAttendance = async (staffId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    // Find if there is an open session for today (checkOut is undefined/null)
    const existingRecordIndex = attendance.findIndex(a => a.staffId === staffId && a.date === today && !a.checkOut);

    if (existingRecordIndex >= 0) {
      // Mark Exit
      const record = attendance[existingRecordIndex];
      const [startH, startM] = record.checkIn.split(':').map(Number);
      const [endH, endM] = timeString.split(':').map(Number);
      
      let diffHours = endH - startH;
      let diffMinutes = endM - startM;
      if (diffMinutes < 0) {
          diffHours--;
          diffMinutes += 60;
      }
      const totalHours = Math.max(0, diffHours + (diffMinutes / 60));
      const hoursWorked = Number(totalHours.toFixed(2));

      const updatedRecord = { ...record, checkOut: timeString, hoursWorked };

      if (isSupabaseConfigured && supabase) {
         await supabase.from('attendance').update({ checkOut: timeString, hoursWorked }).eq('id', record.id);
      }

      setAttendance(prev => {
        const newArr = [...prev];
        newArr[existingRecordIndex] = updatedRecord;
        return newArr;
      });
    } else {
      // Mark Entry
      const newRecord: AttendanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        staffId,
        date: today,
        checkIn: timeString,
        hoursWorked: 0
      };
      
      if (isSupabaseConfigured && supabase) {
         await supabase.from('attendance').insert([newRecord]);
      }
      setAttendance(prev => [newRecord, ...prev]);
    }
  };

  const addProduct = async (product: Product) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory').insert([product]);
    }
    setInventory(prev => [...prev, product]);
  };
  
  const updateProduct = async (updatedProduct: Product) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory').update(updatedProduct).eq('id', updatedProduct.id);
    }
    setInventory(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('inventory').delete().eq('id', id);
    }
    setInventory(prev => prev.filter(p => p.id !== id));
  };

  const sellProduct = async (productId: string, quantity: number) => {
    const product = inventory.find(p => p.id === productId);
    if (product) {
      const newStock = Math.max(0, product.stock - quantity);
      if (isSupabaseConfigured && supabase) {
         await supabase.from('inventory').update({ stock: newStock }).eq('id', productId);
      }
      setInventory(prev => prev.map(p => {
          if (p.id === productId) {
              return { ...p, stock: newStock };
          }
          return p;
      }));
    }
  };

  const addMeasurement = async (measurement: Measurement) => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('measurements').insert([measurement]);
      }
      setMeasurements(prev => [...prev, measurement].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  };

  const deleteMeasurement = async (id: string) => {
      if (isSupabaseConfigured && supabase) {
        await supabase.from('measurements').delete().eq('id', id);
      }
      setMeasurements(prev => prev.filter(m => m.id !== id));
  };

  // User Management
  const addUser = async (user: User) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').insert([user]);
      if (error) {
        console.error("Error adding user to Supabase:", error);
      }
    }
    setUsers(prev => [...prev, user]);
  };

  const updateUser = async (updatedUser: User) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('users').update(updatedUser).eq('id', updatedUser.id);
    }
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    
    // If updating current logged in user, update session as well
    if (currentUser && currentUser.id === updatedUser.id) {
        const newUserState = { ...updatedUser };
        setCurrentUser(newUserState);
        localStorage.setItem('gym_current_user', JSON.stringify(newUserState));
    }
  };

  const deleteUser = async (id: string) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('users').delete().eq('id', id);
    }
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const login = (u: string, p: string) => {
    const user = users.find(user => user.username === u && user.password === p);
    
    if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        localStorage.setItem('gym_current_user', JSON.stringify(user));
        return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('gym_current_user');
  };

  return (
    <GymContext.Provider value={{
      clients,
      payments,
      staff,
      attendance,
      inventory,
      measurements,
      isAuthenticated,
      currentUser,
      users,
      addClient,
      updateClient,
      deleteClient,
      addPayment,
      updatePayment,
      deletePayment,
      addStaff,
      updateStaff,
      deleteStaff,
      markAttendance,
      addProduct,
      updateProduct,
      deleteProduct,
      sellProduct,
      addMeasurement,
      deleteMeasurement,
      addUser,
      updateUser,
      deleteUser,
      login,
      logout
    }}>
      {children}
    </GymContext.Provider>
  );
};

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};
