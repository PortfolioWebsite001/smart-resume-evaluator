
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
      .eq('status', 'active')
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
