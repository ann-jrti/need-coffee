class SearchCriteria {
  constructor(location = null, radius = 1500) {
    this.location = location;
    this.radius = radius;
    this.keyword = '';
    this.sortBy = 'distance'; // 'distance', 'rating', 'name'
    this.openNow = false;
    this.type = 'cafe';
  }


  setLocation(latLng) {
    this.location = latLng;
  }

  setRadius(radius) {
    this.radius = Math.max(200, Math.min(5000, radius)); // Entre 200m y 5km
  }

  setKeyword(keyword) {
    this.keyword = keyword ? keyword.trim() : '';
  }

  updateParameters(params) {
    if (params.radius !== undefined) this.setRadius(params.radius);
    if (params.keyword !== undefined) this.setKeyword(params.keyword);
    if (params.sortBy !== undefined) this.setSortBy(params.sortBy);
    if (params.openNow !== undefined) this.setOpenNow(params.openNow);
  }

  setSortBy(sortBy) {
    const validSortOptions = ['distance', 'rating', 'name'];
    if (validSortOptions.includes(sortBy)) {
      this.sortBy = sortBy;
    }
  }

  setOpenNow(openNow) {
    this.openNow = Boolean(openNow);
  }

  toPlacesRequest() {
    const request = {
      location: this.location,
      radius: this.radius,
      type: this.type
    };

    if (this.keyword) {
      request.keyword = this.keyword;
    }

    if (this.openNow) {
      request.openNow = true;
    }

    return request;
  }

  isValid() {
    if (!this.location) return false;
    
    // Checks if is valid LatLng
    if (typeof this.location.lat !== 'function' || typeof this.location.lng !== 'function') return false;
    
    if (this.radius <= 0) return false;
    
    return true;
  }
}

window.SearchCriteria = SearchCriteria;