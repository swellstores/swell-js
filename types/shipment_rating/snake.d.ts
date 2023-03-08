

export interface ShipmentRatingSnake {
    date_created?: string;
    fingerprint?: string
    services?: ShipmentServiceSnake[]
}

export interface ShipmentServiceSnake {
    description?: string;
    id?: string
    name?: string
    price?: string
}