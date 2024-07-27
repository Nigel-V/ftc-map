import requests
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import datetime
import calendar
import json

from keys import APP_ORIGIN, ORANGE_ALLIANCE_KEY
from data_override import override

countries = ["Netherlands", "Belgium", "Luxembourg"]
season = 2023

def main():
    teams = []

    for country in countries:
        team_data = get_team_data(APP_ORIGIN, ORANGE_ALLIANCE_KEY, country)
        teams += team_data
    
    # remove teams where country is not Netherlands or Belgium in team_data
    teams = [team for team in teams if team["country"] != "Belarus"]

    # remove keys that are not needed
    del_keys = ["team_key", "region_key", "league_key", "robot_name","last_active","state_prov","country","website"]
    teams = [{k: v for k, v in d.items() if k not in del_keys} for d in teams]

    # rename keys
    rename_keys = {"team_number": "number", "team_name_short": "name", "team_name_long": "organisation", "city": "city", "zip_code": "zip_code", "rookie_year": "rookie_year"}
    teams = [{rename_keys.get(k, k): v for k, v in d.items()} for d in teams]

    # split organisation on & and discard everything before that
    teams = [{k: v.split("&")[-1] if k == "organisation" else v for k, v in d.items()} for d in teams]

    # add location key to each team
    teams = locate_teams(APP_ORIGIN, teams, "organisation", "zip_code", "city")

    # remove city, zip_code and organisation keys
    del_keys = ["city", "zip_code", "organisation"]
    teams = [{k: v for k, v in d.items() if k not in del_keys} for d in teams]

    teams = override_data(teams, override)

    date = datetime.datetime.utcnow()
    utc_time = calendar.timegm(date.utctimetuple())

    content = {"generation_timestamp" : utc_time, "season": season, "teams": teams}

    with open(f"./data/{season}.json", "w") as outfile: 
        json.dump(content, outfile)

def get_team_data(app_origin, oa_key, country):
    url = f"https://theorangealliance.org/api/team?last_active=2324&country={country}&count=100"
    headers = {
        "X-Application-Origin": app_origin,
        "X-TOA-Key": oa_key
    }
    response = requests.get(url, headers=headers)
    return response.json()

def locate_teams(app_origin, teams, org_col, zip_col, city_col):
    tmp_teams = teams.copy()

    geolocator = Nominatim(user_agent=app_origin)
    geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
    
    for team in tmp_teams:
        org = team[org_col]
        zip_code = team[zip_col]
        city = team[city_col]
        location = geocode(f"{org} {zip_code} {city}")

        team["location"] = {}

        if location:
            team["location"]["lat"] = location.latitude
            team["location"]["lon"] = location.longitude
        else:
            location = geocode(f"{zip_code} {city}")
            if location:
                team["location"]["lat"] = location.latitude
                team["location"]["lon"] = location.longitude
    
    return tmp_teams

def override_data(teams, override):
    tmp_teams = teams.copy()

    for team in tmp_teams:
        for override_team in override["teams"]:
            if team["number"] == override_team["number"]:
                team["location"] = override_team["location"]
    
    return tmp_teams


if __name__ == "__main__":
    main()