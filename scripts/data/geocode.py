import os
from typing import Optional, cast
from dotenv import load_dotenv
from geopy.geocoders import Nominatim
from geopy.geocoders import Photon
from geopy.location import Location
from geopy.extra.rate_limiter import RateLimiter

from scripts.data.models import CoordinatesModel, LocationModel

load_dotenv()

# use for geocoding after initial fetch
# USER_AGENT = os.getenv("NOMINATIM_USER_AGENT")
# geolocator = Nominatim(user_agent=USER_AGENT)

PHOTON_URL = os.getenv("PHOTON_URL")
geolocator = Photon(domain="192.168.1.140:2322", scheme='http')

geocode_with_delay = RateLimiter(geolocator.geocode, min_delay_seconds=0.1)

def batch_geocode(places: list[LocationModel]) -> list[CoordinatesModel]:
    results: list[CoordinatesModel] = []
    
    for place in places:
        # Construct the search strings
        full_query = f"{place['orgVenue']}, {place.get('address', '')}, {place['city']}, {place['stateProv']}, {place['country']}"
        fallback_query = f"{place.get('address', '')}, {place['city']}, {place['stateProv']}, {place['country']}"
        
        # Execute geocoding with casting to fix the Pylance/Coroutine bug
        location = cast(Optional[Location], geocode_with_delay(full_query))
        
        if not location:
            location = cast(Optional[Location], geocode_with_delay(fallback_query))
            
        if location:
            results.append({
                "lat": round(location.latitude, 4),
                "lng": round(location.longitude, 4),
            })
        else:
            results.append({"lat": 0.0, "lng": 0.0})
            
    return results