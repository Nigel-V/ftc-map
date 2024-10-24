from os import environ
import requests
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
from dotenv import load_dotenv

load_dotenv()

geolocator = Nominatim(user_agent=environ["APP_ORIGIN"])
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

total_events = 0

def get_event_data(year):
    s = requests.Session()
    s.auth = (environ["FIRST_USERNAME"], environ["FIRST_TOKEN"])

    url = f'http://ftc-api.firstinspires.org/v2.0/{year}/events'
    print("Fetching events...")
    res = s.get(url).json()
    print("Fetching events DONE")
    
    df = pd.DataFrame(res['events'])

    print("Filtering events...", end="\r")

    # only keep records with region NL
    df = df[df['regionCode'] == 'NL']
    df = df[['code', 'type', 'typeName', 'name', 'dateStart', 'venue', 'address', 'city', 'stateprov', 'country']]
    
    #strip the time from dateStart
    df['dateStart'] = df['dateStart'].apply(lambda x: x.split('T')[0])

    df = df.reset_index(drop=True)

    total_events = df.index[-1] + 1

    # apply geocoding
    df['location'] = df.apply(__locate, axis=1)
    df = df.drop(columns=['address','city', 'stateprov', 'country'])

    print("Geocoding Benelux events... DONE          ")

    # rename columns
    df = df.rename(columns={'code': 'code', 'type': 'type_code', 'typeName': 'type_name', 'name': 'name', 'dateStart': 'date', 'venue': 'venue', 'location': 'location'})

    # convert type_code to int
    df['type_code'] = df['type_code'].astype(int)

    return df.to_dict(orient='records')


def __locate(row):
    print(f"Geocoding Benelux events... ({int(row.name) + 1} of {total_events})", end="\r")
    location = geocode(row['address'] + ', ' + row['city'] + ', ' + row['stateprov'] + ', ' + row['country'])

    if location is None:
        location = geocode(row['city'] + ', ' + row['stateprov'] + ', ' + row['country'])
    
    return {'lat': location.latitude, 'lon': location.longitude}