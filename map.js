// Import Mapbox as an ESM module
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';
console.log('Mapbox GL JS Loaded:', mapboxgl);
// Set your Mapbox access token here
mapboxgl.accessToken = 'pk.eyJ1IjoiaGFzYWFtYnV0dCIsImEiOiJjbWkweGR0ZXIwb2o0MnFvZ3Fkczd5Z3NoIn0.-w7RKmEYqNROn1oUBW2wng';
const svg = d3.select('#map').select('svg');
function getCoords(station) {
  // NOTE: if your JSON uses "Long" / "Lat" instead of "lon" / "lat",
  // change them here accordingly:
  const point = new mapboxgl.LngLat(+station.Long, +station.Lat);
  // If your keys are "lon" / "lat", use station.lon / station.lat instead.

  const { x, y } = map.project(point); // Project to pixel coordinates
  return { cx: x, cy: y };
}
// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12', // Map style
  center: [-71.09415, 42.36027], // [longitude, latitude]
  zoom: 12, // Initial zoom level
  minZoom: 5, // Minimum allowed zoom
  maxZoom: 18, // Maximum allowed zoom
});
map.on('load', async () => {

  // Boston bike lanes
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson',
  });

  map.addLayer({
    id: 'bike-lanes',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': '#32D400',
      'line-width': 5,
      'line-opacity': 0.6,
    },
  });

  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://raw.githubusercontent.com/cambridgegis/cambridgegis_data/main/Recreation/Bike_Facilities/RECREATION_BikeFacilities.geojson',
  });

  map.addLayer({
    id: 'cambridge-bike-lanes',
    type: 'line',
    source: 'cambridge_route',
    paint: {
      'line-color': '#32D400',
      'line-width': 5,
      'line-opacity': 0.6,
    },
  });
  try {
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';

    // Await JSON fetch
    const jsonData = await d3.json(jsonurl);

    console.log('Loaded JSON Data:', jsonData);

    // Get the stations array
    let stations = jsonData.data.stations;
    console.log('Stations Array:', stations);
    const circles = svg
    .selectAll('circle')
    .data(stations)
    .enter()
    .append('circle')
    .attr('r', 5)              // Radius of the circle
    .attr('fill', 'steelblue') // Fill color
    .attr('stroke', 'white')   // Border color
    .attr('stroke-width', 1)
    .attr('opacity', 0.8);

  // Function to update circle positions when the map moves/zooms
  function updatePositions() {
    circles
      .attr('cx', (d) => getCoords(d).cx)
      .attr('cy', (d) => getCoords(d).cy);
  }

  // Initial positioning
  updatePositions();

  // Reposition markers on map interactions
  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);
  } catch (error) {
    console.error('Error loading JSON:', error);
  }

});
