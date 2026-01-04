from typing import NotRequired, TypedDict

class CoordinatesModel(TypedDict):
    lat: float
    lng: float

class LocationModel(TypedDict):
    orgVenue: str
    address: NotRequired[str]
    city: str
    stateProv: str
    country: str

class TeamModel(TypedDict):
    number: int
    name: str
    rookieYear: int
    homeRegion: str
    location: LocationModel

class EventModel(TypedDict):
    code: str
    name: str
    typeName: str
    dateStart: str  # ISO format date string
    dateEnd: str    # ISO format date string
    regionCode: str
    location: LocationModel

# Must match src/content.config.ts zod schema
class GeocodedTeamModel(TypedDict):
    number: int
    name: str
    org: str
    rookieYear: int
    homeRegion: str
    coords: CoordinatesModel

# Must match src/content.config.ts zod schema
class GeocodedEventModel(TypedDict):
    code: str
    name: str
    typeName: str
    venue: str
    dateStart: str  # ISO format date string
    dateEnd: str    # ISO format date string
    regionCode: str
    coords: CoordinatesModel

# Must match src/content.config.ts zod schema
class CompleteSeasonModel(TypedDict):
    generationTimestamp: str # ISO format date string
    season: int
    teams: list[GeocodedTeamModel]
    events: list[GeocodedEventModel]