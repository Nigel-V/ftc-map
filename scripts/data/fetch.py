import json
import os
import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

from first_models import SeasonEventModelVersion2, SeasonTeamListingsModelVersion2, SeasonTeamModelVersion2

load_dotenv()

API_USERNAME = os.getenv("FIRST_API_USERNAME", "placeholder")
API_TOKEN = os.getenv("FIRST_API_TOKEN", "placeholder")
BASE_URL = "https://ftc-api.firstinspires.org/v2.0"

auth = HTTPBasicAuth(API_USERNAME, API_TOKEN)
s = requests.Session()
s.auth = auth

def fetch_events(year: int, last_fetch="Sat, 1 Jan 2000 00:00:00 GMT") -> tuple[list[SeasonEventModelVersion2], str]:
    """Fetch events for a given year modified since last_fetch timestamp from the FIRST API."""

    url = f"{BASE_URL}/{year}/events"
    headers = {"FMS-OnlyModifiedSince": last_fetch}
    response = s.get(url, headers=headers)
    
    if response.status_code == 304:
        return [], last_fetch  # No changes since last fetch
    
    response.raise_for_status()

    events: list[SeasonEventModelVersion2] = response.json()['events']

    return events, response.headers.get("Date", last_fetch)

def fetch_teams(year: int, last_fetch="Sat, 1 Jan 2000 00:00:00 GMT") -> tuple[list[SeasonTeamModelVersion2], str]:
    """Fetch teams for a given year modified since last_fetch timestamp from the FIRST API."""
    url = f"{BASE_URL}/{year}/teams"
    headers = { "FMS-OnlyModifiedSince": last_fetch }
    
    updated_teams : list[SeasonTeamModelVersion2] = []
    current_page = 1
    total_pages = 1
    new_fetch_time = last_fetch

    while current_page <= total_pages:
        # Only include the modification header on the first request
        response = s.get(url, headers=headers, params={"page": current_page})

        # Handle 304: Only possible on the first request with the header
        if response.status_code == 304:
            break 

        response.raise_for_status()
        
        if current_page == 1:
            new_fetch_time = response.headers.get("Date", last_fetch)
            
        data: SeasonTeamListingsModelVersion2 = response.json()
        teams_in_page = data.get("teams", [])
        
        if not teams_in_page:
            break
            
        updated_teams.extend(teams_in_page)
        total_pages = data.get("pageTotal", 1)
        current_page += 1
        
    return updated_teams, new_fetch_time

def fetch_max_season() -> int:
    """Fetch the maximum season year available from the FIRST API."""
    response = s.get(BASE_URL)
    response.raise_for_status()
    
    data = response.json()
    return data.get("maxSeason", 0)