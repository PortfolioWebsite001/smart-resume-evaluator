
/**
 * Utility functions for authentication and authorization features
 */

/**
 * Calculate the remaining free scans for a user
 * @param userId User ID to check
 * @param supabaseClient Supabase client instance
 * @returns Number of remaining free scans
 */
export const calculateRemainingFreeScans = async (userId: string, supabaseClient: any): Promise<number> => {
  try {
    // Check if the user has an active subscription
    const { data: subscriptionData, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .single();
      
    if (subscriptionData) {
      // If they have an active subscription, they get 15 scans
      return 15;
    }
    
    // Count how many scans the user has already used
    const { data: scanData, error: scanError } = await supabaseClient
      .from('resume_scans')
      .select('id')
      .eq('user_id', userId);
      
    if (scanError) throw scanError;
    
    // Free users get 3 scans by default
    const freeTierLimit = 3;
    const usedScans = scanData?.length || 0;
    const remainingScans = Math.max(0, freeTierLimit - usedScans);
    
    return remainingScans;
  } catch (error) {
    console.error("Error calculating remaining free scans:", error);
    return 0;
  }
};

/**
 * Calculate subscription end date in human-readable format
 * @param userId User ID to check
 * @param supabaseClient Supabase client instance
 * @returns End date string or null if no subscription
 */
export const getSubscriptionEndDate = async (userId: string, supabaseClient: any): Promise<string | null> => {
  try {
    const { data, error } = await supabaseClient
      .from('subscriptions')
      .select('end_date')
      .eq('user_id', userId)
      .eq('active', true)
      .single();
      
    if (error || !data) return null;
    
    // Format the date
    const endDate = new Date(data.end_date);
    return endDate.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error("Error getting subscription end date:", error);
    return null;
  }
};
