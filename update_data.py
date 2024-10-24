import json
import time

from teams import get_team_data
from events import get_event_data
from data_override import team_override, event_override

def main():
    for year in range(2024, 2025):
        print(f"*** Generating data for {year}... ***")
        teams = __override_team_data(get_team_data(year))
        events = __override_event_data(get_event_data(year), year)

        content = {"generation_timestamp" : int(time.time()), "season": year, "teams": teams, "events": events}

        with open(f"./docs/data/{year}.json", "w") as outfile: 
            json.dump(content, outfile)

def __override_team_data(teams):
    tmp_teams = teams.copy()

    for team in tmp_teams:
        for override_team in team_override:
            if team["number"] == override_team["number"]:
                team["location"] = override_team["location"]
    
    return tmp_teams

def __override_event_data(events, year):
    tmp_events = events.copy()

    for event in tmp_events:
        for override_event in event_override[year]:
            if event["code"] == override_event["code"]:
                event["location"] = override_event["location"]
    
    return tmp_events

if __name__ == "__main__":
    main()