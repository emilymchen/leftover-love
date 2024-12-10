let googleMapsApiPromise: Promise<void> | null = null;

export function loadGoogleMapsApi(apiKey: string): Promise<void> {
  if (!googleMapsApiPromise) {
    const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existingScript) {
      googleMapsApiPromise = Promise.resolve();
    } else {
      googleMapsApiPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      });
    }
  }
  return googleMapsApiPromise;
}
