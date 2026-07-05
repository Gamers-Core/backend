export type MetaEventName = 'Purchase' | 'AddToCart' | 'AddToWishlist' | 'InitiateCheckout' | 'ViewContent' | 'Search';

export interface MetaUserData {
  /** SHA-256 hashed */
  em?: string[];

  /** SHA-256 hashed */
  ph?: string[];

  /** SHA-256 hashed */
  fn?: string[];

  /** SHA-256 hashed */
  ln?: string[];

  /** SHA-256 hashed */
  ct?: string[];

  /** SHA-256 hashed */
  country?: string[];

  /** SHA-256 hashed */
  external_id?: string[];

  /** Do NOT hash */
  client_user_agent?: string;
}

export interface MetaCustomData {
  currency?: string;
  value?: number;
}

export interface SimpleEvent {
  user_data: MetaUserData;
  event_id?: string;
  opt_out?: boolean;
  custom_data?: MetaCustomData;
}

export interface Event extends SimpleEvent {
  event_name: MetaEventName;
  event_source_url?: string;
}

export interface MetaEvent extends Event {
  event_time: number;
  action_source: 'website';
}

export interface SendEventsRequest {
  data: MetaEvent[];
  test_event_code?: string;
}

export interface SendEventsResponse {
  events_received: number;
  fbtrace_id: string;
  messages?: string[];
}

export interface ConversionApiError {
  error: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
    fbtrace_id: string;
  };
}
