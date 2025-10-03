class CoffeePlace {
  constructor(placeData, userLocation = null) {
    this.place_id = placeData.place_id;
    this.name = placeData.name;
    this.rating = placeData.rating || 0;
    this.user_ratings_total = placeData.user_ratings_total || 0;
    this.vicinity = placeData.vicinity || placeData.formatted_address || '';
    this.location = placeData.geometry.location;
    this.opening_hours = placeData.opening_hours;
    this.photos = placeData.photos || [];
    this.price_level = placeData.price_level;
    this.types = placeData.types || [];
    this.rawData = placeData;
    
    if (userLocation && this.location) {
      this.distance = this.calculateDistance(userLocation);
    }
  }

  calculateDistance(userLocation) {
    if (!userLocation || !this.location) return null;
    
    const userLat = typeof userLocation.lat === 'function' ? userLocation.lat() : userLocation.lat;
    const userLng = typeof userLocation.lng === 'function' ? userLocation.lng() : userLocation.lng;
    const placeLat = typeof this.location.lat === 'function' ? this.location.lat() : this.location.lat;
    const placeLng = typeof this.location.lng === 'function' ? this.location.lng() : this.location.lng;
    
    return Utils.calculateDistance(userLat, userLng, placeLat, placeLng);
  }

  getPosition() {
    return this.location;
  }

  hasGoodRating() {
    return this.rating >= 4.0;
  }

  isOpenNow() {
    return this.opening_hours?.open_now || false;
  }

  getOpenStatusText() {
    if (!this.opening_hours) return 'Opening hours not available';
    return this.opening_hours.open_now ? 'Currently open' : 'Closed';
  }

  getDirectionsUrl() {
    if (this.place_id) {
      return `https://www.google.com/maps/dir/?api=1&destination_place_id=${this.place_id}`;
    }
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(this.vicinity)}`;
  }

  getGoogleMapsUrl() {
    return `https://www.google.com/maps/search/?api=1&query_place_id=${this.place_id}`;
  }

  getFormattedRating() {
    if (!this.rating) return 'No rating';
    const ratingText = this.rating.toFixed(1);
    if (this.user_ratings_total) {
      return `${ratingText} (${this.user_ratings_total} reviews)`;
    }
    return ratingText;
  }

  getFormattedDistance() {
    if (!this.distance) return '';
    return Utils.formatDistance(this.distance);
  }

  getPhotoUrl(maxWidth = 400, maxHeight = 300) {
    if (!this.photos || this.photos.length === 0) return null;
    
    const photo = this.photos[0];
    if (photo.getUrl) {
      return photo.getUrl({ maxWidth, maxHeight });
    }
    return null;
  }
}

window.CoffeePlace = CoffeePlace;