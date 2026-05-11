import { supabase } from './supabaseClient';
import { UserPeriodizationPlan, TwelveWeekPlan } from '../types';
import { buildTwelveWeekPlan } from '../utils/periodizationUtils';

export const periodizationService = {
  async getUserTwelveWeekPlan(profileId: string): Promise<UserPeriodizationPlan | null> {
    try {
      const { data, error } = await supabase
        .from('user_periodization_plans')
        .select('*')
        .eq('profile_id', profileId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is not found
        console.error('Error fetching periodization plan:', error);
        return null;
      }

      return data as UserPeriodizationPlan;
    } catch (error) {
      console.error('Exception fetching periodization plan:', error);
      return null;
    }
  },

  async saveTwelveWeekPlan(profileId: string, planData: TwelveWeekPlan): Promise<UserPeriodizationPlan | null> {
    try {
      const payload = {
        profile_id: profileId,
        current_week: 1,
        plan_data: planData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_periodization_plans')
        .upsert(payload, { onConflict: 'profile_id' })
        .select()
        .single();

      if (error) {
        console.error('Error saving periodization plan:', error);
        throw error;
      }

      return data as UserPeriodizationPlan;
    } catch (error) {
      console.error('Exception saving periodization plan:', error);
      throw error;
    }
  },

  async generateAndSavePlan(profileId: string): Promise<UserPeriodizationPlan | null> {
    try {
      const plan = buildTwelveWeekPlan();
      return await this.saveTwelveWeekPlan(profileId, plan);
    } catch (error) {
      console.error('Failed to generate and save plan:', error);
      return null;
    }
  }
};
