class LocationService {
  constructor() {
    this.isSupported = "geolocation" in navigator;
    this.cachedPosition = null;
    this.lastUpdate = null;
    this.cacheTimeout = 5 * 60 * 1000;
  }


  isGeolocationSupported() {
    return this.isSupported;
  }

  async checkPermissionStatus() {
    if (!navigator.permissions) {
      return "unknown";
    }

    try {
      const permission = await navigator.permissions.query({
        name: "geolocation",
      });
      return permission.state; // 'granted', 'denied', 'prompt'
    } catch (error) {
      return "unknown";
    }
  }

  // Checks if we have valid location cached
  hasCachedPosition() {
    if (!this.cachedPosition || !this.lastUpdate) {
      return false;
    }

    const now = Date.now();
    return now - this.lastUpdate < this.cacheTimeout;
  }


  getCachedPosition() {
    if (this.hasCachedPosition()) {
      return this.cachedPosition;
    }
    return null;
  }


  async getCurrentPosition(options = {}, useCache = true) {
    if (!this.isSupported) {
      throw new Error("Geolocation not supported in this browser");
    }

    const permissionStatus = await this.checkPermissionStatus();

    if (permissionStatus === "denied") {
      throw new Error(
        'Geolocation permissions denied. To enable them, click on the location icon in the address bar and select "Allow".'
      );
    }
    if (useCache && this.hasCachedPosition()) {
      return this.cachedPosition;
    }

   
    const defaultOptions = {
      enableHighAccuracy: false, 
      timeout: 10000, 
      maximumAge: 5 * 60 * 1000,
    };

    const geolocationOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng = new google.maps.LatLng(
            position.coords.latitude,
            position.coords.longitude
          );

          const result = {
            position: latLng,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          // Cachear la posición
          this.cachedPosition = result;
          this.lastUpdate = Date.now();

          resolve(result);
        },
        (error) => {
          let errorMessage = "Unknown error";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Access to location denied. To enable it, click on the location icon in the address bar.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "Location information not available. Check your GPS/Wi-Fi connection.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "Timeout expired. Try again or check your connection.";
              break;
          }

          reject(new Error(errorMessage));
        },
        geolocationOptions
      );
    });
  }

  /**
   * Intenta obtener ubicación con fallback amigable
   */
  async getLocationWithFallback() {
    try {
      // Primero verificar permisos
      const permissionStatus = await this.checkPermissionStatus();

      if (permissionStatus === "denied") {
        throw new Error("PERMISSION_DENIED");
      }

      // Intentar con cache primero
      if (this.hasCachedPosition()) {
        return this.cachedPosition;
      }

      // Solicitar nueva ubicación
      return await this.getCurrentPosition();
    } catch (error) {
      if (
        error.message === "PERMISSION_DENIED" ||
        error.message.includes("denied")
      ) {
        // Retornar ubicación por defecto con mensaje informativo
        return {
          position: new google.maps.LatLng(40.4168, -3.7038), // Madrid
          accuracy: null,
          timestamp: Date.now(),
          isDefault: true,
          message:
            "Using default location (Madrid). To use your location, allow access in browser settings.",
        };
      }
      throw error;
    }
  }

  /**
   * Muestra instrucciones para habilitar geolocalización
   */
  getPermissionInstructions() {
    const userAgent = navigator.userAgent;

    if (userAgent.includes("Chrome")) {
      return "In Chrome: Click on the 🔒 or 🌐 icon in the address bar → Site settings → Location → Allow";
    } else if (userAgent.includes("Firefox")) {
      return "In Firefox: Click on the 🛡️ icon in the address bar → Permissions → Location → Allow";
    } else if (userAgent.includes("Safari")) {
      return "In Safari: Safari → Preferences → Websites → Location → Allow for this site";
    } else if (userAgent.includes("Edge")) {
      return "In Edge: Click on the 🔒 icon in the address bar → Permissions → Location → Allow";
    }

    return 'Look for the location icon in the address bar and select "Allow" for this site.';
  }


  clearCache() {
    this.cachedPosition = null;
    this.lastUpdate = null;
  }
  watchPosition(callback, errorCallback, options = {}) {
    if (!this.isSupported) {
      errorCallback(new Error("Geolocation not supported"));
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const geolocationOptions = { ...defaultOptions, ...options };

    return navigator.geolocation.watchPosition(
      (position) => {
        const latLng = new google.maps.LatLng(
          position.coords.latitude,
          position.coords.longitude
        );
        callback({
          position: latLng,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      },
      errorCallback,
      geolocationOptions
    );
  }

  clearWatch(watchId) {
    if (watchId && this.isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }
}

window.LocationService = LocationService;
