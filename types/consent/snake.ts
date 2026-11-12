/** The shopper's answers; purposes left out stay as they are */
export interface ConsentInput {
  analytics?: boolean;
  marketing?: boolean;
  sale_of_data?: boolean;
}

/** What the answers allow, after the region's rule and GPC */
export interface ConsentEffective {
  analytics: boolean;
  marketing: boolean;
  sale_of_data: boolean;
}

export interface Consent {
  analytics: boolean | null;
  marketing: boolean | null;
  sale_of_data: boolean | null;
  gpc: boolean;
  rule: 'opt_in' | 'opt_out' | null;
  effective: ConsentEffective;
}
