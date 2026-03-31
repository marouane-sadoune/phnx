import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type AbandonmentStatus = {
  isBlocked: boolean;
  abandonmentCount: number;
  loading: boolean;
};

/**
 * Records a checkout abandonment for the current user.
 * - 1st abandonment: shows warning next visit
 * - 2nd+ abandonment: blocks the user from checkout
 */
export function useCheckoutGuard() {
  const { user } = useAuth();
  const [status, setStatus] = useState<AbandonmentStatus>({
    isBlocked: false,
    abandonmentCount: 0,
    loading: true,
  });

  // Track if the user actually completed the order
  const completedRef = useRef(false);
  // Track if user has interacted with the form (entered info)
  const hasInteractedRef = useRef(false);

  // Load the user's current abandonment record
  useEffect(() => {
    if (!user) {
      setStatus({ isBlocked: false, abandonmentCount: 0, loading: false });
      return;
    }

    supabase
      .from("checkout_abandonment")
      .select("abandonment_count, is_blocked")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setStatus({
          isBlocked: data?.is_blocked ?? false,
          abandonmentCount: data?.abandonment_count ?? 0,
          loading: false,
        });
      });
  }, [user]);

  // Listen for page leave — record abandonment if user didn't complete
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      if (!completedRef.current && hasInteractedRef.current) {
        recordAbandonment();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [user]);

  /**
   * Call this when the user navigates away from the checkout page
   * (Back button, route change) WITHOUT completing the order.
   */
  const recordAbandonment = async () => {
    if (!user || !hasInteractedRef.current || completedRef.current) return;

    const { data: existing } = await supabase
      .from("checkout_abandonment")
      .select("id, abandonment_count")
      .eq("user_id", user.id)
      .maybeSingle();

    const newCount = (existing?.abandonment_count ?? 0) + 1;
    const willBeBlocked = newCount >= 2;

    if (existing) {
      await supabase
        .from("checkout_abandonment")
        .update({
          abandonment_count: newCount,
          is_blocked: willBeBlocked,
          last_abandoned_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    } else {
      await supabase.from("checkout_abandonment").insert({
        user_id: user.id,
        abandonment_count: newCount,
        is_blocked: willBeBlocked,
        last_abandoned_at: new Date().toISOString(),
      });
    }
  };

  /** Call this when the user types anything in the form — marks as "interacted" */
  const markInteracted = () => {
    hasInteractedRef.current = true;
  };

  /** Call this when the user clicks "Complete My Order" */
  const markCompleted = () => {
    completedRef.current = true;
  };

  /** Call this on route change away from checkout (without completion) */
  const handleLeaveWithoutCompletion = async () => {
    if (!completedRef.current && hasInteractedRef.current) {
      await recordAbandonment();
    }
  };

  return {
    ...status,
    markInteracted,
    markCompleted,
    handleLeaveWithoutCompletion,
  };
}
