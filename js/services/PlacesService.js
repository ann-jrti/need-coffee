class PlacesService {
  constructor() {
    this.placesService = null;
  }

  initialize(map) {
    if (!google.maps.places) {
      throw new Error('Google Places API not available');
    }
    
    this.placesService = new google.maps.places.PlacesService(map);
  }

  async searchCoffeePlaces(searchCriteria) {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('PlacesService not initialized'));
        return;
      }

      if (!searchCriteria.isValid()) {
        reject(new Error('Invalid search criteria'));
        return;
      }

      const request = searchCriteria.toPlacesRequest();

      this.placesService.nearbySearch(request, (results, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(new Error(`Error in Places API: ${status}`));
          return;
        }

        if (!results || results.length === 0) {
          resolve([]);
          return;
        }

        // Convert results to CoffeePlace objects
        const coffeePlaces = results.map(result => {
          return new CoffeePlace(result, searchCriteria.location);
        });

        const sortedPlaces = this.sortCoffeePlaces(coffeePlaces, searchCriteria.sortBy);
        
        resolve(sortedPlaces);
      });
    });
  }

  sortCoffeePlaces(coffeePlaces, sortBy) {
    return coffeePlaces.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        
        case 'distance':
        default:
          return (a.distance || Infinity) - (b.distance || Infinity);
      }
    });
  }

  async getPlaceDetails(placeId) {
    return new Promise((resolve, reject) => {
      if (!this.placesService) {
        reject(new Error('PlacesService not initialized'));
        return;
      }

      const request = {
        placeId: placeId,
        fields: ['name', 'rating', 'formatted_phone_number', 'website', 'opening_hours', 'photos', 'reviews']
      };

      this.placesService.getDetails(request, (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK) {
          reject(new Error(`Error obteniendo detalles: ${status}`));
          return;
        }

        resolve(place);
      });
    });
  }


  isAvailable() {
    return this.placesService !== null && typeof google !== 'undefined' && google.maps.places;
  }
}


window.PlacesService = PlacesService;