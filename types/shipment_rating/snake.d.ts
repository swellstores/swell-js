export interface ShipmentRatingSnake {
  date_created?: string;
  fingerprint?: string;
  services?: ShipmentServiceSnake[];
  md5?: string;
  errors?: {
    code?: string;
    message?: string;
  };
}

export interface ShipmentServiceSnake {
  description?: string;
  id?: string;
  name?: string;
  carrier?: string;
  price?: number;
  pickup?: boolean;
  tax_code?: string;
}
