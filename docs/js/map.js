const CustomIcon = L.Icon.extend({
  options: {
    shadowUrl: "./img/marker_shadow.png",
    iconSize: [30, 40],
    shadowSize: [28, 15],
    iconAnchor: [15, 40],
    popupAnchor: [0, -34],
    tooltipAnchor: [16, -28],
    shadowAnchor: [10, 14],
  },
});

const iconL0 = new CustomIcon({ iconUrl: "./img/marker_0.png" }), // #205072
  iconL1 = new CustomIcon({ iconUrl: "./img/marker_1.png" }), // #329d9c
  iconL2 = new CustomIcon({ iconUrl: "./img/marker_2.png" }), // #56c596
  iconL3 = new CustomIcon({ iconUrl: "./img/marker_3.png" }), // #7be495
  iconL4 = new CustomIcon({ iconUrl: "./img/marker_4.png" }), // #cff4d2
  iconScrimmage = new CustomIcon({
    iconUrl: "./img/marker_scrimmage.png",
  }),
  iconMeet = new CustomIcon({ iconUrl: "./img/marker_meet.png" }),
  iconQualifier = new CustomIcon({
    iconUrl: "./img/marker_qualifier.png",
  }),
  iconChampionship = new CustomIcon({
    iconUrl: "./img/marker_championship.png",
  });

// Set bounds for entire world
const bounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));

// Create map
const map = L.map("map", {
  center: [51.2194, 4.4025],
  zoom: 7,
  minZoom: 2,
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
});

// Dirty hack to fix map size
document.getElementById("map").style.height = "100%";

// Add tiles
const layerTiles = L.tileLayer(
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: "abcd",
    maxZoom: 19,
  }
);

map.addLayer(layerTiles);

// Load JSON data
let teams = [];
let events = [];

fetch("./data/2023.json")
  .then((response) => response.json())
  .then((data) => {
    data.teams.forEach((item) => {
      teams.push(
        L.marker([item.location.lat, item.location.lon], {
          icon: getTeamMarker(item.rookie_year),
          alt: item.number + ", " + item.name,
          searchTag: item.number + " - " + item.name,
        })
          .bindPopup(
            `
                <div class="mdl-card__title card-title--team card-title--${getTeamCard(
                  item.rookie_year
                )}">
                    <h2 class="mdl-card__title-text">${item.name}</h2>
                    <span class="mdl-card__subtitle-text">${item.number}</span>
                </div>
                <div class="mdl-card__supporting-text">
                    <table style="border-collapse:collapse;border-spacing:0;width:100%"><tbody>
                      <tr><td style="font-style:italic;vertical-align:top;padding-bottom:5px;">Organisation</td><td style="text-align:right;vertical-align:top;padding-bottom:5px;">${
                        item.organisation
                      }</td></tr>
                      <tr><td style="font-style:italic;vertical-align:top;">Rookie Year</td><td style="text-align:right;vertical-align:top;">${
                        item.rookie_year
                      }</td></tr>
                  </tbody></table>
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <a href="https://ftcscout.org/teams/${
                      item.number
                    }" target="blank">
                        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">View Details</button>
                    </a>
                </div>
                <!-- &#166;${item.number + " - " + item.name}&#166; -->
            `
          )
          .on("click", clickPan)
          .on("popupopen", transformCard)
      );
    });
    data.events.forEach((item) => {
      events.push(
        L.marker([item.location.lat, item.location.lon], {
          icon: getEventMarker(item.type),
          alt: item.name,
          searchTag: item.name,
        })
          .bindPopup(
            `
                <div class="mdl-card__title card-title--${item.type
                  .split(" ")
                  .join("-")
                  .toLowerCase()}">
                    <h2 class="mdl-card__title-text">${item.name}</h2>
                    <span class="mdl-card__subtitle-text">${item.type}</span>
                </div>
                <div class="mdl-card__supporting-text">
                    <table style="border-collapse:collapse;border-spacing:0;width:100%"><tbody>
                      <tr><td style="font-style:italic;vertical-align:top;padding-bottom:5px;">Venue</td><td style="text-align:right;vertical-align:top;padding-bottom:5px;">${
                        item.venue
                      }</td></tr>
                      <tr><td style="font-style:italic;vertical-align:top;">Date</td><td style="text-align:right;vertical-align:top;">${
                        item.date
                      }</td></tr>
                  </tbody></table>
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <a href="https://ftcscout.org/events/2023/${
                      item.code
                    }" target="blank">
                        <button class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect">View Details</button>
                    </a>
                </div>
                <!-- &#166;${item.name}&#166; -->
            `
          )
          .on("click", clickPan)
          .on("popupopen", transformCard)
      );
    });
  })
  .then(() => {
    const clusterLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
    });

    const teamsLayer = L.layerGroup(teams);
    const eventsLayer = L.layerGroup(events);

    clusterLayer.addLayer(teamsLayer);
    clusterLayer.addLayer(eventsLayer);

    // Add clusters to map
    map.addLayer(clusterLayer);

    // External display toggles
    document
      .getElementById("display-teams-chkbox")
      .addEventListener("change", (event) => {
        if (event.target.checked) {
          clusterLayer.addLayer(teamsLayer);
        } else {
          clusterLayer.removeLayer(teamsLayer);
        }
      });

    document
      .getElementById("display-events-chkbox")
      .addEventListener("change", (event) => {
        if (event.target.checked) {
          clusterLayer.addLayer(eventsLayer);
        } else {
          clusterLayer.removeLayer(eventsLayer);
        }
      });

    // Add search control
    const controlSearch = new L.Control.Search({
      layer: clusterLayer,
      propertyName: "searchTag",
      initial: false,
      container: "map-search-container",
      position: "topleft",
      marker: false,
      textPlaceholder: "",
      tooltipLimit: 4,
      moveToLocation: (latlng, title, map) => {
        // Move to the location
        map.setView(latlng, 15);

        // Find the marker corresponding to the found location
        let foundMarker;
        clusterLayer.eachLayer((layer) => {
          if (layer instanceof L.LayerGroup) {
            layer.eachLayer((subLayer) => {
              if (
                subLayer.getLatLng().equals(latlng) &&
                layer.getPopup().getContent().split("&#166;")[1] === title
              ) {
                foundMarker = subLayer;
              }
            });
          } else if (
            layer.getLatLng().equals(latlng) &&
            layer.getPopup().getContent().split("&#166;")[1] === title
          ) {
            foundMarker = layer;
          }
        });

        // Open the popup for the found marker
        if (foundMarker) {
          // Check if the marker is part of a cluster
          const cluster = clusterLayer.getVisibleParent(foundMarker);
          if (cluster !== foundMarker) {
            // If the marker is part of a cluster, zoomToShowLayer to spiderify and show it
            clusterLayer.zoomToShowLayer(foundMarker, () => {
              // Open the popup after spiderfying
              foundMarker.openPopup();
            });
          } else {
            // If the marker is not part of a cluster, just open the popup
            foundMarker.openPopup();
          }
        }
      },
    });

    map.addControl(controlSearch);

    // Add inner html to search button class
    const searchButton = document.querySelector(".search-button");

    searchButton.innerHTML = `<label class="mdl-button mdl-js-button mdl-button--icon" for="map-search" data-upgraded=",MaterialButton">
              <i class="material-icons" id="map-search-icon">search</i>
            </label>`;

    // Make search button first child of parent
    const parent = searchButton.parentElement;
    parent.insertBefore(searchButton, parent.firstChild);

    // Add material ui to search cancel
    const cancelSearchButton = document.querySelector(".search-cancel");
    cancelSearchButton.innerHTML = `<i class="material-icons" id="map-search-icon">close</i>`;
  })
  .catch((error) => {
    console.error("Error loading JSON:", error);
  });

function getTeamMarker(rookieYear) {
  if (rookieYear < 2015) {
    return iconL0;
  } else if (rookieYear < 2019) {
    return iconL1;
  } else if (rookieYear < 2021) {
    return iconL2;
  } else if (rookieYear < 2023) {
    return iconL3;
  } else {
    return iconL4;
  }
}

function getTeamCard(rookieYear) {
  if (rookieYear < 2015) {
    return "l0";
  } else if (rookieYear < 2019) {
    return "l1";
  } else if (rookieYear < 2021) {
    return "l2";
  } else if (rookieYear < 2023) {
    return "l3";
  } else {
    return "l4";
  }
}

function getEventMarker(type) {
  switch (type) {
    case "Scrimmage":
      return iconScrimmage;
    case "League Meet":
      return iconMeet;
    case "Qualifier":
      return iconQualifier;
    case "Region Championship":
      return iconChampionship;
    default:
      return iconScrimmage;
  }
}

function clickPan(e) {
  map.panTo(e.target.getLatLng());
}

function transformCard(e) {
  const popup = e.popup.getElement();

  // Check if the card has already been transformed
  if (popup.querySelector(".mdl-card")) {
    return;
  }

  const contentWrapper = popup.querySelector(".leaflet-popup-content-wrapper");

  const content = popup.querySelector(".leaflet-popup-content");

  // Create the new div.card
  const card = document.createElement("div");
  card.className = "mdl-card mdl-shadow--4dp";

  // Move the content into the new card
  while (content.firstChild) {
    card.appendChild(content.firstChild);
  }

  // Insert the new card into the popup
  contentWrapper.parentNode.insertBefore(card, contentWrapper);

  // Remove the old content wrapper
  contentWrapper.parentNode.removeChild(contentWrapper);

  // Add card menu
  const cardMenu = document.createElement("div");
  cardMenu.className = "mdl-card__menu";
  card.appendChild(cardMenu);

  // Add close button
  const closeBtn = document.createElement("button");
  closeBtn.className =
    "mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect";
  closeBtn.setAttribute("aria-label", "Close popup");
  closeBtn.onclick = () => {
    e.target.closePopup();
  };
  closeBtn.innerHTML = '<i class="material-icons">close</i>';
  cardMenu.appendChild(closeBtn);
}
