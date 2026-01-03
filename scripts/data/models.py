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

class GeocodedTeamModel(TypedDict):
    number: int
    name: str
    org: str
    rookieYear: int
    homeRegion: str
    coords: CoordinatesModel

class EventModel(TypedDict):
    code: str
    name: str
    startDate: str  # ISO format date string
    endDate: str    # ISO format date string
    location: LocationModel

class GeocodedEventModel(TypedDict):
    code: str
    name: str
    venue: str
    startDate: str  # ISO format date string
    endDate: str    # ISO format date string
    coords: CoordinatesModel