from asyncio import events
import json
from fetch import fetch_max_season, fetch_teams, fetch_events
from models import CompleteSeasonModel, GeocodedTeamModel, TeamModel, GeocodedEventModel, EventModel
from transform import transform_teams, transform_events


def add_team_coords(teams: list[TeamModel]) -> list[GeocodedTeamModel]:
    """Add coordinates to each team based on their location."""
    from geocode import batch_geocode

    locations = [team["location"] for team in teams]
    coords = batch_geocode(locations)
    geocoded_teams: list[GeocodedTeamModel] = []
    for team, coord in zip(teams, coords):
        geocoded_teams.append(GeocodedTeamModel({
            "number": team["number"],
            "name": team["name"],
            "org": team["location"]["orgVenue"],
            "rookieYear": team["rookieYear"],
            "homeRegion": team["homeRegion"],
            "coords": coord
        }))

    return geocoded_teams

def add_event_coords(events: list[EventModel]) -> list[GeocodedEventModel]:
    """Add coordinates to each event based on their location."""
    from geocode import batch_geocode

    locations = [event["location"] for event in events]
    coords = batch_geocode(locations)
    geocoded_events: list[GeocodedEventModel] = []
    for event, coord in zip(events, coords):
        geocoded_events.append(GeocodedEventModel({
            "code": event["code"],
            "name": event["name"],
            "typeName": event["typeName"],
            "venue": event["location"]["orgVenue"],
            "dateStart": event["dateStart"],
            "dateEnd": event["dateEnd"],
            "regionCode": event["regionCode"],
            "coords": coord
        }))

    return geocoded_events

def __main__():
    for year in range(2019, fetch_max_season() + 1):
        # load[year].json
        print(f"Updating season {year}...")

        try:
            with open(f"./src/data/seasons/{year}.json", "r", encoding="utf-8") as f:
                season_data: CompleteSeasonModel = json.load(f)
            print(f"Loaded existing data for season {year}.")
        except FileNotFoundError:
            season_data = CompleteSeasonModel({
                "generationTimestamp": "",
                "season": year,
                "teams": [],
                "events": []
            })
            print(f"No existing data for season {year}, starting fresh.")

        # get last fetch time
        last_fetch_time = season_data.get("generationTimestamp", "Sat, 1 Jan 2000 00:00:00 GMT")

        # fetch new teams/events
        print(f"Fetching updates since {last_fetch_time}...")
        updated_teams, new_teams_fetch_time = fetch_teams(year, last_fetch_time)
        updated_events, new_events_fetch_time = fetch_events(year, last_fetch_time)
        print(f"Fetched {len(updated_teams)} updated teams and {len(updated_events)} updated events.")

        # DEBUG - NL teams only
        updated_teams = [t for t in updated_teams if t.get("country", "") == "Netherlands"]
        updated_events = [e for e in updated_events if e.get("country", "") == "Netherlands"]
        print(f"Filtered to {len(updated_teams)} NL teams and {len(updated_events)} NL events.")
        
        # transform
        print(f"Transforming teams...")
        transformed_teams = transform_teams(updated_teams)
        print(f"Transforming events...")
        transformed_events = transform_events(updated_events)
        
        # geocode
        events_with_location = [e for e in transformed_events if "location" in e]
        events_with_coords = [e for e in transformed_events if "coords" in e] 
        
        print(f"Geocoding {len(transformed_teams)} teams...")
        geocoded_teams = add_team_coords(transformed_teams)
        print(f"Geocoding {len(events_with_location)} events... ({len(events_with_coords)} already have coords)")
        geocoded_events = add_event_coords(events_with_location) + events_with_coords
        
        # merge with existing data
        print(f"Merging data...")
        existing_teams = season_data.get("teams", [])
        existing_events = season_data.get("events", [])

        complete_teams = existing_teams + geocoded_teams
        complete_events = existing_events + geocoded_events

        # update timestamp
        season_data = CompleteSeasonModel({
            "generationTimestamp": min(new_teams_fetch_time, new_events_fetch_time),
            "season": year,
            "teams": complete_teams,
            "events": complete_events
        })

        # save [year].json
        print(f"Saving updated data for season {year}...")
        with open(f"./src/data/seasons/{year}.json", "w", encoding="utf-8") as f:
            json.dump(season_data, f, separators=(',', ':'))
        print(f"Season {year} update complete.\n")

if __name__ == "__main__":
    __main__()