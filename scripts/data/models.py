from typing import TypedDict

class CoordinatesModel(TypedDict):
    lat: float
    lng: float

class TeamModel(TypedDict):
    number: int
    name: str
    org: str
    rookieYear: int
    homeRegion: str
    coords: CoordinatesModel

class EventModel(TypedDict):
    code: str
    name: str
    venue: str
    startDate: str  # ISO format date string
    endDate: str    # ISO format date string
    coords: CoordinatesModel