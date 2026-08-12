/**
 * Allowed status transitions
 *
 * current status -> allowed next statuses
 */
export const STATUS_TRANSITIONS = {
  pending: ["picked_up"],

  picked_up: ["arrived_at_hub"],

  arrived_at_hub: ["in_transit", "out_for_delivery"],

  in_transit: ["arrived_at_hub", "out_for_delivery"],

  out_for_delivery: ["delivered", "failed"],

  // Failed means delivery attempt failed.
  // Parcel can be attempted again.
  failed: ["arrived_at_hub", "out_for_delivery"],

  // Final statuses
  delivered: [],
  returned: [],
};