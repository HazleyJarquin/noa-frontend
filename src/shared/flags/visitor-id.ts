// Stable anonymous id so GrowthBook keeps each visitor in the same experiment variation
export const VISITOR_ID_COOKIE = "noa_visitor_id";

// The proxy also forwards the id as a request header: on the very first visit the
// cookie only exists on the response, so the page wouldn't see it otherwise
export const VISITOR_ID_HEADER = "x-noa-visitor-id";

export const VISITOR_ID_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
