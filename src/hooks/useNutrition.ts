import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabaseClient';
import { type MealEntry, type MacroTargets } from '../types/nutrition';

export function useNutritionTargets() {
  return useQuery({
    queryKey: ['nutrition', 'targets'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from('nutrition_macro_targets')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as MacroTargets | null;
    },
  });
}

export function useMealEntries(date: string) {
  return useQuery({
    queryKey: ['nutrition', 'meals', date],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutrition_meal_entries')
        .select('*')
        .eq('date', date)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as MealEntry[];
    },
  });
}

export function useSaveMealMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: Omit<MealEntry, 'id'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('nutrition_meal_entries')
        .insert([{ ...entry, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', 'meals', variables.date] });
    },
  });
}
