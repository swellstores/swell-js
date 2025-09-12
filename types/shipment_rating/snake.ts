export interface ShipmentRating {
  date_created?: string;
  fingerprint?: string;
  services?: ShipmentService[];
  md5?: string;
  errors?: {
    code?: string;
    message?: string;
  };
}

export interface ShipmentService {
  description?: string;
  id?: string;
  name?: string;
  carrier?: string;
  price?: number;
  pickup?: boolean;
  tax_code?: string;
}
