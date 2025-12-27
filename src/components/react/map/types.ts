export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Team {
    number: number;
    name: string;
    organization: string;
    rookieYear: number;
    coords: Coordinates;
}

export interface FTCEvent {
    eventCode: string;
    name: string;
    eventType: number;
    venue: string;
    dateStart: Date;
    dateEnd: Date;
    coords: Coordinates;
}

export interface SeasonData {
    generationTimestamp: Date;
    season: number;
    teams: Team[];
    events: FTCEvent[];
}