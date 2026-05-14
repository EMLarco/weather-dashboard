const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

const DEFAULT_COORDS = { lat: 40.4168, lon: -3.7038 }; // Madrid

export function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn('Geolocalización no soportada, usando Madrid');
      resolve(DEFAULT_COORDS);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.warn('Geolocalización agotó el tiempo, usando Madrid');
      resolve(DEFAULT_COORDS);
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(timeoutId);
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        clearTimeout(timeoutId);
        console.warn(`Error de geolocalización (${error.message}), usando Madrid`);
        resolve(DEFAULT_COORDS);
      },
      GEOLOCATION_OPTIONS
    );
  });
}