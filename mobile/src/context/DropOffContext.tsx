import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { DropOffPoint, NewDropOffPoint } from '../types';

interface DropOffContextValue {
  points: DropOffPoint[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (input: NewDropOffPoint) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

const DropOffContext = createContext<DropOffContextValue | undefined>(undefined);

export const DropOffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [points, setPoints] = useState<DropOffPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('drop_off_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setPoints(data ?? []);
    setLoading(false);
  }, []);

  const add = useCallback(async (input: NewDropOffPoint) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('drop_off_points')
      .insert({
        name: input.name.trim(),
        address: input.address.trim(),
        accepted_materials: input.accepted_materials,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    setPoints((prev) => [data, ...prev]);
  }, []);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('drop_off_points').delete().eq('id', id);
    if (error) throw error;
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <DropOffContext.Provider value={{ points, loading, error, refresh, add, remove }}>
      {children}
    </DropOffContext.Provider>
  );
};

export function useDropOff() {
  const ctx = useContext(DropOffContext);
  if (!ctx) throw new Error('useDropOff deve ser usado dentro de DropOffProvider');
  return ctx;
}