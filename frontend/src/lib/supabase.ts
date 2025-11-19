/**
 * Supabase Client Configuration
 * Substitui Firebase para storage e database
 */
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ============================================
// TYPES
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  name: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  status: 'OPEN' | 'RESOLVED' | 'EXPIRED';
  date: string;
  location: string;
  campus: string;
  building?: string;
  reference?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  item_photos?: ItemPhoto[];
}

export interface ItemPhoto {
  id?: string;
  item_id?: string;
  url: string;
  position: number;
}

export const CAMPUS_OPTIONS = ['Asa Norte', 'Asa Sul', 'Planaltina', 'Ceilândia', 'Gama'];

export const BUILDING_OPTIONS = [
  'Bloco A',
  'Bloco B',
  'Bloco C',
  'Biblioteca',
  'Restaurante Universitário',
  'Ginásio',
  'Auditório',
  'Administração'
];

// ============================================
// AUTH HELPERS
// The original signUp, signIn, getCurrentUser functions were removed as per the provided edit.

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  return profile as User | null;
};

// ============================================
// STORAGE HELPERS
// ============================================

export const uploadItemPhoto = async (file: File, itemId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${itemId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('items-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('items-photos')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

export const deleteItemPhoto = async (photoUrl: string) => {
  const parts = photoUrl.split('/items-photos/');
  const fileName = parts[1];

  if (!fileName) {
    throw new Error('Invalid photo URL');
  }

  const { error } = await supabase.storage
    .from('items-photos')
    .remove([fileName]);

  if (error) throw error;
};

// ============================================
// ITEMS HELPERS
// ============================================

export const createItem = async (itemData: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .insert(itemData)
    .select()
    .single();

  if (error) throw error;
  return data as Item;
};

export const getItems = async (filters: {
  status?: string;
  type?: string;
  campus_id?: string;
  category?: string;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('items')
    .select(`
      *,
      photos:item_photos(*)
    `)
    .order('created_at', { ascending: false });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.campus_id) query = query.eq('campus_id', filters.campus_id);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.offset) query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);

  const { data, error } = await query;

  if (error) throw error;
  return data as Item[];
};

export const searchItems = async (searchText: string, filters?: {
  campus_id?: string;
  category?: string;
}) => {
  let query = supabase
    .from('items')
    .select(`
      *,
      photos:item_photos(*)
    `)
    .textSearch('search_vector', searchText, {
      type: 'websearch',
      config: 'portuguese'
    })
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })
    .limit(50);

  if (filters?.campus_id) query = query.eq('campus_id', filters.campus_id);
  if (filters?.category) query = query.eq('category', filters.category);

  const { data, error } = await query;

  if (error) throw error;
  return data as Item[];
};

export const getItemById = async (itemId: string) => {
  const { data, error } = await supabase
    .from('items')
    .select(`
      *,
      photos:item_photos(*),
      owner:users(name, email, phone)
    `)
    .eq('id', itemId)
    .single();

  if (error) throw error;
  return data as Item;
};

export const updateItem = async (itemId: string, updates: Partial<Item>) => {
  const { data, error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data as Item;
};

export interface Campus {
  id: string;
  name: string;
  active: boolean;
}

export interface Building {
  id: string;
  campus_id: string;
  name: string;
  active: boolean;
}

// ============================================
// CAMPUSES & BUILDINGS HELPERS
// ============================================

export const getCampuses = async () => {
  const { data, error } = await supabase
    .from('campuses')
    .select('*')
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data as Campus[];
};

export const getBuildings = async (campusId: string) => {
  const { data, error } = await supabase
    .from('buildings')
    .select('*')
    .eq('campus_id', campusId)
    .eq('active', true)
    .order('name');

  if (error) throw error;
  return data as Building[];
};

// ============================================
// REALTIME SUBSCRIPTIONS
// ============================================

export const subscribeToNewItems = (
  campusId: string,
  callback: (item: Item) => void
) => {
  return supabase
    .channel('new-items')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'items',
        filter: `campus_id=eq.${campusId}`
      },
      (payload: any) => {
        callback(payload.new as Item);
      }
    )
    .subscribe();
};

export const unsubscribe = (subscription: ReturnType<typeof subscribeToNewItems>) => {
  supabase.removeChannel(subscription);
};
