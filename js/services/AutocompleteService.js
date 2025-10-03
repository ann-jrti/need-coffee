class AutocompleteService {
  constructor() {
    this.autocomplete = null;
    this.geocoder = null;
  }

  initialize(inputElementId, options = {}) {
    if (!google.maps.places) {
      throw new Error('Google Places API not available');
    }

    const inputElement = document.getElementById(inputElementId);
    if (!inputElement) {
      throw new Error(`Elemento with '${inputElementId}' ID not found`);
    }

    const defaultOptions = {
      types: ['address'],
      componentRestrictions: { country: 'es' }, // Restricted to Spain
      fields: ['place_id', 'geometry', 'name', 'formatted_address']
    };

    const autocompleteOptions = { ...defaultOptions, ...options };
    this.autocomplete = new google.maps.places.Autocomplete(inputElement, autocompleteOptions);
    
    this.geocoder = new google.maps.Geocoder();

    return this.autocomplete;
  }

  onPlaceChanged(callback) {
    if (!this.autocomplete) {
      throw new Error('Autocomplete not initialized');
    }

    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      
      if (!place.geometry) {
        callback(null, 'Please select a suggested address');
        return;
      }

      callback(place, null);
    });
  }

  async geocodeAddress(address) {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
          const result = results[0];
          resolve({
            place_id: result.place_id,
            geometry: result.geometry,
            name: result.formatted_address,
            formatted_address: result.formatted_address
          });
        } else {
          reject(new Error(`Can not found the address: ${address}`));
        }
      });
    });
  }

  clearInput() {
    if (this.autocomplete) {
      const input = this.autocomplete.gm_accessors_.input.input;
      if (input) {
        input.value = '';
      }
    }
  }

  getPlace() {
    return this.autocomplete ? this.autocomplete.getPlace() : null;
  }

  setBounds(bounds) {
    if (this.autocomplete) {
      this.autocomplete.setBounds(bounds);
    }
  }

  setCountry(countryCode) {
    if (this.autocomplete) {
      this.autocomplete.setComponentRestrictions({ country: countryCode });
    }
  }
}

window.AutocompleteService = AutocompleteService;