import json

def convert_teams_to_geojson(input_filename, output_filename):
    # Load the original JSON data
    with open(input_filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    # Process each team into a GeoJSON Feature
    for team in data.get('teams', []):
        # Extract coordinates [longitude, latitude]
        # Note: GeoJSON uses [lng, lat] order
        coords = team.get('coords', {})
        lng = coords.get('lng')
        lat = coords.get('lat')
        
        if lng is not None and lat is not None:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "properties": {
                    "number": team.get("number"),
                    "name": team.get("name"),
                    "org": team.get("org"),
                    "rookieYear": team.get("rookieYear"),
                    "homeRegion": team.get("homeRegion")
                }
            }
            geojson["features"].append(feature)
    
    # Save the output to a new file
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Successfully converted {len(geojson['features'])} teams to {output_filename}")

def convert_events_to_geojson(input_filename, output_filename):
    # Load the original JSON data
    with open(input_filename, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    geojson = {
        "type": "FeatureCollection",
        "features": []
    }
    
    # Process each event into a GeoJSON Feature
    for event in data.get('events', []):
        # Extract coordinates [longitude, latitude]
        # Note: GeoJSON uses [lng, lat] order
        coords = event.get('coords', {})
        lng = coords.get('lng')
        lat = coords.get('lat')
        
        if lng is not None and lat is not None:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [lng, lat] # GeoJSON uses [longitude, latitude]
                },
                "properties": {
                    "code": event.get("code"),
                    "name": event.get("name"),
                    "typeName": event.get("typeName"),
                    "venue": event.get("venue"),
                    "dateStart": event.get("dateStart"),
                    "dateEnd": event.get("dateEnd"),
                    "regionCode": event.get("regionCode")
                }
            }
            geojson["features"].append(feature)
    
    # Save the output to a new file
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(geojson, f, indent=2)
    
    print(f"Successfully converted {len(geojson['features'])} events to {output_filename}")

# Run the conversion
convert_events_to_geojson('./src/data/seasons/2025.json', './public/data/2025-events.json')