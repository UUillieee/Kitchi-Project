import { supabase } from './supabase'; 
 
 
  export async function getUserId(): Promise<string | null> {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching user:", error);
        return null;
      }
      return data?.session?.user?.id || null;
      
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }