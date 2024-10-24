from os import environ
import requests
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from dotenv import load_dotenv

load_dotenv()

geolocator = Nominatim(user_agent=environ["APP_ORIGIN"])
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

total_teams = 0

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

    # manually drop teams 19393 and 16951 (TR and FTC Benelux Dummy Team)
    df = df[df['teamNumber'] != 19393]
    df = df[df['teamNumber'] != 16951]

    df.reset_index(inplace=True,drop=True)

    total_teams = df.index[-1] + 1

    # remove and rename columns
    df = df.drop(columns=['displayTeamNumber', 'schoolName', 'website', 'robotName', 'districtCode', 'homeCMP', 'homeRegion', 'displayLocation'])
    df = df.rename(columns={'teamNumber': 'number', 'nameShort': 'name', 'nameFull': 'organisation', 'rookieYear': 'rookie_year'})

    # split organisation on & and discard everything before &
    df['organisation'] = df['organisation'].str.split('&').str[-1]
    df['location'] = df.apply(__locate, axis=1)
    df = df.drop(columns=['city', 'stateProv', 'country'])

    print("Geocoding Benelux teams... DONE          ")

    return df[['number', 'name', 'organisation', 'rookie_year', 'location']].to_dict(orient='records')


def __locate(row):
    print(f"Geocoding Benelux teams... ({int(row.name) + 1} of {total_teams})", end="\r")

    location = None

    try:
        location = geocode(row['organisation'] + ', ' + row['city'] + ', ' + row['stateProv'] + ', ' + row['country'])
    except:
        pass

    if location is None:
        location = geocode(row['city'] + ', ' + row['stateProv'] + ', ' + row['country'])
    
    return {'lat': location.latitude, 'lon': location.longitude}