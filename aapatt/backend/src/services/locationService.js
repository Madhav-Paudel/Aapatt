import axios from 'axios';

export async function getEtaSeconds(origin, dest) {
  try {
    const base = process.env.OSRM_API_URL || 'http://router.project-osrm.org/route/v1/driving';
    const url = `${base}/${origin.longitude},${origin.latitude};${dest.longitude},${dest.latitude}?overview=false`;
    const { data } = await axios.get(url);
    const route = data?.routes?.[0];
    return route?.duration ? Math.round(route.duration) : null;
  } catch (e) {
    return null;
  }
}
