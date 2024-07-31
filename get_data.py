import requests
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import datetime
import calendar
import json

from keys import APP_ORIGIN, ORANGE_ALLIANCE_KEY
from data_override import override

# TODO clean up when FIRST API becomes available again
countries = ["Netherlands", "Belgium", "Luxembourg"]
country_codes = ["NLD", "BEL", "LUX"]
season = 2023

def main():
    teams = get_team_data(APP_ORIGIN, ORANGE_ALLIANCE_KEY)
    events = get_event_data(APP_ORIGIN, ORANGE_ALLIANCE_KEY)

    date = datetime.datetime.utcnow()
    utc_time = calendar.timegm(date.utctimetuple())

    content = {"generation_timestamp" : utc_time, "season": season, "teams": teams, "events": events}

    with open(f"./docs/data/{season}.json", "w") as outfile: 
        json.dump(content, outfile)



def get_team_data(app_origin, oa_key):
    teams = []

    for country in countries:
        team_data = get_team_data_raw(app_origin, oa_key, country)
        teams += team_data
    
    # remove teams where country is not Netherlands or Belgium in team_data
    teams = [team for team in teams if team["country"] != "Belarus"]

    # remove keys that are not needed
    del_keys = ["team_key", "region_key", "league_key", "robot_name","last_active","state_prov","website"]
    teams = [{k: v for k, v in d.items() if k not in del_keys} for d in teams]

    # rename keys
    rename_keys = {"team_number": "number", "team_name_short": "name", "team_name_long": "organisation", "city": "city", "zip_code": "zip_code", "rookie_year": "rookie_year"}
    teams = [{rename_keys.get(k, k): v for k, v in d.items()} for d in teams]

    # split organisation on & and discard everything before that
    teams = [{k: v.split("&")[-1] if k == "organisation" else v for k, v in d.items()} for d in teams]

    # add location key to each team
    teams = locate(app_origin, teams, "organisation", "city", "country")

    # remove city, zip_code and organisation keys
    del_keys = ["city", "zip_code", "country"]
    teams = [{k: v for k, v in d.items() if k not in del_keys} for d in teams]

    # delete FTC Netherlands dummy team (19393)
    teams = [team for team in teams if team["number"] != 19393]

    return override_team_data(teams, override)

def get_event_data(app_origin, oa_key):
    events = []

    for country in country_codes:
        event_data = get_event_data_raw(app_origin, oa_key, country)
        events += event_data
    
    # remove keys that are not needed
    del_keys = [
        "event_key",
        "season_key",
        "region_key",
        "league_key",
        "event_code",
        "event_region_number",
        "division_key",
        "division_name",
        "end_date",
        "week_key",
        "state_prov",
        "website",
        "time_zone",
        "is_public",
        "active_tournament_level",
        "alliance_count",
        "field_count",
        "advance_spots",
        "advance_event",
        "data_source",
        "team_count",
        "match_count"
    ]
    events = [{k: v for k, v in d.items() if k not in del_keys} for d in events]

    # rename keys
    rename_keys = {"first_event_code": "code", "event_type_key": "type", "event_name": "name", "start_date": "date", "city": "city", "country": "country", "venue": "venue"}
    events = [{rename_keys.get(k, k): v for k, v in d.items()} for d in events]

    events = locate(app_origin, events, "venue", "city", "country")

    # rename event types
    type_dict = {
        "LGMEET": "League Meet",
        "OTHER": "Other",
        "QUAL": "Qualifier",
        "RCMP": "Region Championship",
        "SCRIMMAGE": "Scrimmage",
        "SPRING": "Spring Event",
        "LGCMP": "League Championship",
        "OFFSSN": "Off Season",
        "SPRQUAL": "Super Qualifier",
        "SPRRGNL": "Super Regional",
        "WRLDCMP": "World Championship"
    }

    events = [{k: type_dict.get(v, v) if k == "type" else v for k, v in d.items()} for d in events]

    # minimalize date
    events = [{k: v.split("T")[0] if k == "date" else v for k, v in d.items()} for d in events]

    # remove city and country keys
    del_keys = ["city", "country"]
    events = [{k: v for k, v in d.items() if k not in del_keys} for d in events]

    return override_event_data(events, override)

def get_team_data_raw(app_origin, oa_key, country):
    url = f"https://theorangealliance.org/api/team?last_active=2324&country={country}&count=100"
    headers = {
        "X-Application-Origin": app_origin,
        "X-TOA-Key": oa_key
    }
    response = requests.get(url, headers=headers)
    return response.json()

def get_event_data_raw(app_origin, oa_key, country_code):
    url = f"https://theorangealliance.org/api/event?region_key={country_code}&season_key=2324"
    headers = {
        "X-Application-Origin": app_origin,
        "X-TOA-Key": oa_key
    }
    response = requests.get(url, headers=headers)
    return response.json()

def locate(app_origin, dataset, org_col, city_col, country_col):
    tmp_teams = dataset.copy()

    geolocator = Nominatim(user_agent=app_origin)
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    for team in tmp_teams:
        org = team[org_col]
        city = team[city_col]
        country = team[country_col]
        location = geocode(f"{org} {city} {country}")

        team["location"] = {}

        if location:
            team["location"]["lat"] = location.latitude
            team["location"]["lon"] = location.longitude
        else:
            location = geocode(f"{city} {country}")
            if location:
                team["location"]["lat"] = location.latitude
                team["location"]["lon"] = location.longitude
    
    return tmp_teams

def override_team_data(teams, override):
    tmp_teams = teams.copy()

    for team in tmp_teams:
        for override_team in override["teams"]:
            if team["number"] == override_team["number"]:
                team["location"] = override_team["location"]
    
    return tmp_teams

def override_event_data(events, override):
    tmp_events = events.copy()

    for team in tmp_events:
        for override_event in override["events"]:
            if team["code"] == override_event["code"]:
                team["location"] = override_event["location"]
    
    return tmp_events

if __name__ == "__main__":
    main()