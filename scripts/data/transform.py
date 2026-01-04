import re
from typing import cast
from first_models import Point, SeasonTeamModelVersion2, SeasonEventModelVersion2
from scripts.data.models import EventModel, GeocodedEventModel, LocationModel, TeamModel

def transform_teams(teams : list[SeasonTeamModelVersion2]) -> list[TeamModel]:
    """Transform a list of teams from FIRST API format to shorter internal format."""
    return [ {
    "number": t.get("teamNumber", 0),
    "name": t.get("nameShort", ""),
    "rookieYear": t.get("rookieYear", 0),
    "homeRegion": t.get("homeRegion", ""),
    "location": {
        "orgVenue": re.split(r'(?<! )&(?! )', t.get("nameFull") or "")[-1],
        "city": t.get("city", ""),
        "stateProv": t.get("stateProv", ""),
        "country": t.get("country", ""),
    }
    } for t in teams ]

def transform_events(events : list[SeasonEventModelVersion2]) -> list[EventModel | GeocodedEventModel]:
    """Transform a list of events from FIRST API format to shorter internal format."""
    events_transformed: list[EventModel | GeocodedEventModel] = []

    for e in events:
        if "coordinates" in e:
            coords = e.get("coordinates", {})

            if coords:
                x, y = __get_lat_lng(coords)
            else:
                x, y = 0.0, 0.0

            events_transformed.append(GeocodedEventModel({
                "code": e.get("eventCode", ""),
                "name": e.get("name", ""),
                "typeName": e.get("typeName", ""),
                "venue": e.get("venue", ""),
                "dateStart": e.get("dateStart", ""),
                "dateEnd": e.get("dateEnd", ""),
                "regionCode": e.get("regionCode", ""),
                "coords": {
                    "lat": x,
                    "lng": y
                }
            }))
        else:
            events_transformed.append(EventModel({
                "code": e.get("eventCode", ""),
                "name": e.get("name", ""),
                "typeName": e.get("typeName", ""),
                "dateStart": e.get("dateStart", ""),
                "dateEnd": e.get("dateEnd", ""),
                "regionCode": e.get("regionCode", ""),
                "location": {
                    "orgVenue": e.get("venue", ""),
                    "address": e.get("address", ""),
                    "city": e.get("city", ""),
                    "stateProv": e.get("stateProv", ""),
                    "country": e.get("country", ""),
                }
            }))
    
    return events_transformed

def __get_lat_lng(point: Point) -> tuple[float, float]:
    """Extract latitude and longitude from a Point object."""
    coords = point.get("coordinates", [])

    x = float(cast(float, coords[0]))
    y = float(cast(float, coords[1]))
    return x, y
