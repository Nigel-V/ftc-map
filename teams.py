from os import environ
import requests
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from dotenv import load_dotenv

load_dotenv()

geolocator = Nominatim(user_agent=environ["APP_ORIGIN"])
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

def get_team_data(year):
    s = requests.Session()
    s.auth = (environ["FIRST_USERNAME"], environ["FIRST_TOKEN"])

    url = f'https://ftc-api.firstinspires.org/v2.0/{year}/teams'
    res = s.get(url).json()

    page_total = res['pageTotal']
    teams = res['teams']

    for i in range(2, page_total+1):
        print(f"Fetching teams... (page {i} of {page_total})", end="\r")
        res = s.get(url + '?page=' + str(i))
        teams += res.json()['teams']
    
    print("\nFetching teams DONE")

    df = pd.DataFrame(teams)

    print("Filtering teams...", end="\r")

    # only keep records with home region NL
    df = df[df['homeRegion'] == 'NL']
    df.reset_index(inplace=True,drop=True)

    print(f"Found {df.size} teams with Benelux as home region.")

    # remove and rename columns
    df = df.drop(columns=['displayTeamNumber', 'schoolName', 'website', 'robotName', 'districtCode', 'homeCMP', 'homeRegion', 'displayLocation'])
    df = df.rename(columns={'teamNumber': 'number', 'nameShort': 'name', 'nameFull': 'organisation', 'rookieYear': 'rookie_year'})

    # split organisation on & and discard everything before &
    df['organisation'] = df['organisation'].str.split('&').str[-1]
    df['location'] = df.apply(__locate, axis=1)
    df = df.drop(columns=['city', 'stateProv', 'country'])

    print("\nGeocoding locations DONE")

    return df[['number', 'name', 'organisation', 'rookie_year', 'location']].to_dict(orient='records')


def __locate(row):
    print(f"Geocoding locations... ({row.name})", end="\r")
    location = geocode(row['organisation'] + ', ' + row['city'] + ', ' + row['stateProv'] + ', ' + row['country'])

    if location is None:
        location = geocode(row['city'] + ', ' + row['stateProv'] + ', ' + row['country'])
    
    return {'lat': location.latitude, 'lon': location.longitude}