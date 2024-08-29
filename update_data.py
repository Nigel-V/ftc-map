import json
import time

from teams import get_team_data
from events import get_event_data
from data_override import override

def main():
    for year in range(2022, 2025):
        print(f"*** Generating data for {year}... ***")
        teams = __override_team_data(get_team_data(year))
        events = get_event_data(year)

        content = {"generation_timestamp" : int(time.time()), "season": year, "teams": teams, "events": events}

        with open(f"./docs/data/{year}.json", "w") as outfile: 
            json.dump(content, outfile)

def __override_team_data(teams):
    tmp_teams = teams.copy()

    for team in tmp_teams:
        for override_team in override:
            if team["number"] == override_team["number"]:
                team["location"] = override_team["location"]
    
    return tmp_teams

if __name__ == "__main__":
    main()