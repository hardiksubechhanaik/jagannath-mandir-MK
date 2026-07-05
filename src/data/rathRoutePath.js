/**
 * Ratha Yatra route — volunteer-provided coordinates (Maruti Kunj).
 * Starts at Shree Jagannath Mandir; ends at the return point on Maruti Kunj Road.
 */
export const RATH_ROUTE_WAYPOINTS = [
  [28.357654, 77.077241],
  [28.357197, 77.077279],
  [28.357174, 77.078846],
  [28.357786890265103, 77.07885602248169],
  [28.357785678451254, 77.08054539662014],
  [28.359216937423987, 77.08055679911114],
  [28.359251979614914, 77.07889053586749],
  [28.358606411817664, 77.07885072587983],
  [28.3586064057843, 77.07722428310954],
  [28.357831, 77.077224],
];

export const RATH_ROUTE_START = RATH_ROUTE_WAYPOINTS[0];
export const RATH_ROUTE_END = RATH_ROUTE_WAYPOINTS[RATH_ROUTE_WAYPOINTS.length - 1];

export const RATH_ROUTE_STYLE = {
  color: '#22c55e',
  weight: 5,
  opacity: 0.9,
  lineJoin: 'round',
  lineCap: 'round',
};

export const RATH_ROUTE_UNDERLAY_STYLE = {
  color: '#14532d',
  weight: 8,
  opacity: 0.35,
  lineJoin: 'round',
  lineCap: 'round',
};
