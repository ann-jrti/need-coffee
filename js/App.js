class App {
  constructor() {
    this.mapService = null;
    this.placesService = null;
    this.locationService = null;
    this.autocompleteService = null;
    this.searchUI = null;
    
    this.currentLocation = null;
    this.coffeePlaces = [];
    this.isInitialized = false;
  }


  async init() {
    try {
      // Services init
      this.locationService = new LocationService();
      this.placesService = new PlacesService();
      this.autocompleteService = new AutocompleteService();
      
      // UI Components init
      this.searchUI = new SearchUIComponent('searchBtn', 'radiusSelect', 'placesList');
      
      this.setupEventListeners();
      
      await this.initializeMap();
      this.initializeAutocomplete();
      await this.getCurrentLocation();
      
      this.isInitialized = true;
      console.log('App started successfully');
      
    } catch (error) {
      console.error('Error starting app:', error);
      this.showError('Error starting the app. Please refresh.');
    }
  }

  setupEventListeners() {
    // Search config
    this.searchUI.onSearch((searchParams) => {
      this.handleSearch(searchParams);
    });

    // Place selection config
    this.searchUI.onPlaceSelect((place, index) => {
      this.handlePlaceSelection(place, index);
    });

    // Search by address config
    this.searchUI.onAddressSearch((address) => {
      this.handleAddressSearch(address);
    });

    // "Use my location" config
    this.searchUI.onUseLocation(() => {
      this.handleUseLocation();
    });
  }

  initializeAutocomplete() {
    try {
      this.autocompleteService.initialize('address', {
        types: ['geocode'],
        componentRestrictions: { country: 'es' }
      });

      this.autocompleteService.onPlaceChanged((place, error) => {
        if (error) {
          console.warn('Autocomplete error:', error);
          return;
        }

        if (place && place.geometry) {
          this.handlePlaceFromAutocomplete(place);
        }
      });
    } catch (error) {
      console.warn('Can not initialize autocomplete:', error.message);
    }
  }

  async initializeMap() {
    return new Promise((resolve, reject) => {
      if (typeof google === 'undefined') {
        reject(new Error('Google Maps API not available'));
        return;
      }

      this.mapService = new MapService('map', {
        zoom: 15,
        center: { lat: 40.4168, lng: -3.7038 }, // Mdrid by default
        styles: this.getMapStyles()
      });

      this.placesService.initialize(this.mapService.map);

      resolve();
    });
  }

  async getCurrentLocation() {
    try {
    const locationData = await this.locationService.getLocationWithFallback();

      this.currentLocation = locationData.position;
      
      this.mapService.centerAt(this.currentLocation);
      
      this.mapService.addUserLocationMarker(this.currentLocation);
      
      if (locationData.isDefault) {
        this.showLocationInfo(locationData.message);
      } else if (locationData.accuracy) {
        this.showLocationInfo(`Location: ${Math.round(locationData.accuracy)}m`);
      }
      
    } catch (error) {
      console.warn('Error obtaining location:', error.message);
      this.currentLocation = new google.maps.LatLng(40.4168, -3.7038); // Madrid fallback
      this.mapService.centerAt(this.currentLocation);
      this.mapService.addUserLocationMarker(this.currentLocation);
      this.showError('Can not obtain your location. Using Madrid as fallback.');
    }
  }


  /* Coffee shops search handler */
  async handleSearch(searchParams) {
    if (!this.currentLocation) {
      this.showError('Can not define your location');
      return;
    }

    try {
      this.searchUI.showLoading();
      
      const searchCriteria = new SearchCriteria(this.currentLocation, searchParams.radius);
      searchCriteria.updateParameters(searchParams);
      
      const places = await this.placesService.searchCoffeePlaces(searchCriteria);
      
      this.coffeePlaces = places;
      
      this.displayPlacesOnMap();
      
      this.searchUI.renderPlacesList(this.coffeePlaces);
      
      this.mapService.fitBoundsToMarkers();
      
    } catch (error) {
      this.showError(`Search Error: ${error.message}`);
    } finally {
      this.searchUI.hideLoading();
    }
  }

  /* Display coffee shops in map */
  displayPlacesOnMap() {
    this.mapService.clearMarkers();
    
    if (this.currentLocation) {
      this.mapService.addUserLocationMarker(this.currentLocation);
    }
    
    this.coffeePlaces.forEach((place, index) => {
      this.mapService.createCoffeePlaceMarker(place, index + 1, (clickedPlace) => {
        this.handleMarkerClick(clickedPlace);
      });
    });
  }

  /* Map marker click handler */
  handleMarkerClick(place) {
    const index = this.coffeePlaces.findIndex(p => p.place_id === place.place_id);
    
    if (index !== -1) {
      this.searchUI.highlightPlaceInList(place.place_id);
      this.mapService.highlightMarker(place.place_id);
    }
  }

  /* List in place selection in list handler */
  handlePlaceSelection(place, index) {
    this.mapService.highlightMarker(place.place_id);
    this.mapService.centerAt(place.getPosition());
  }

  getMapStyles() {
    return [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'poi.business',
        stylers: [{ visibility: 'off' }]
      },
      {
        featureType: 'transit',
        elementType: 'labels.icon',
        stylers: [{ visibility: 'off' }]
      }
    ];
  }

    /* Error display handler */
  showError(message) {
    this.searchUI.showError(message);
    
    console.error('App Error:', message);
  }

  /* Search by address handler */
  async handleAddressSearch(address) {
    try {
      const place = await this.autocompleteService.geocodeAddress(address);
      this.handlePlaceFromAutocomplete(place);
    } catch (error) {
      this.showError(`Address not found: ${address}`);
    }
  }

  /* Search by Autocomplete option selection */
  handlePlaceFromAutocomplete(place) {
    if (place && place.geometry) {
      this.currentLocation = place.geometry.location;
      
      this.mapService.centerAt(this.currentLocation);
      this.mapService.addUserLocationMarker(this.currentLocation);
      
      this.reset(); // clean previous markers and lists
    }
  }

  /* Use location handler */
  async handleUseLocation() {
    try {
      const button = document.getElementById('useLocation');
      const addressInput = document.getElementById('address');
      
      button.textContent = 'Obtaining location...';
      button.disabled = true;

      this.locationService.clearCache();
      
      await this.getCurrentLocation();

      addressInput.value = '';    
    } catch (error) {
      const permissionStatus = await this.locationService.checkPermissionStatus();
      
      if (permissionStatus === 'denied') {
        const instructions = this.locationService.getPermissionInstructions();
        this.showError(`Permissions denied. ${instructions}`);
      } else {
        this.showError('Can not get your current location');
      }
    } finally {
      // Restaurar botón
      const button = document.getElementById('useLocation');
      button.textContent = 'Use my location';
      button.disabled = false;
    }
  }

  /* Show location info message */
  showLocationInfo(message) {
    const statusElement = document.getElementById('status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.style.color = '#059669';
      
      setTimeout(() => {
        if (statusElement.textContent === message) {
          statusElement.textContent = '';
        }
      }, 5000);
    }
  }

  reset() {
    this.coffeePlaces = [];
    this.mapService.clearMarkers();
    this.searchUI.clearPlacesList();
    
    if (this.currentLocation) {
      this.mapService.centerAt(this.currentLocation);
      this.mapService.addUserLocationMarker(this.currentLocation);
    }
  }

  isReady() {
    return this.isInitialized;
  }
}

// Function to initialize map (required by Google Maps API)
window.initMap = function() {
  window.app = new App();
  window.app.init();
};

window.App = App;