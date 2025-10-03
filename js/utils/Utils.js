class Utils {
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth radius in kilometers
    const dLat = Utils.deg2rad(lat2 - lat1);
    const dLng = Utils.deg2rad(lng2 - lng1);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(Utils.deg2rad(lat1)) * Math.cos(Utils.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    
    return distance;
  }

  /* Converts degrees to radians */
  static deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  static formatDistance(distanceInKm) {
    if (distanceInKm < 1) {
      return `${Math.round(distanceInKm * 1000)} m`;
    } else {
      return `${distanceInKm.toFixed(1)} km`;
    }
  }

  static formatRating(rating, reviewCount) {
    if (!rating) return 'No rating';
    
    const ratingText = rating.toFixed(1);
    if (reviewCount) {
      return `${ratingText} (${reviewCount} reviews)`;
    }
    return ratingText;
  }

  /* Avoid multiple fast calls */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /* Check if is a valid Google Maps position */
  static isValidLatLng(latLng) {
    return latLng && 
           typeof latLng.lat === 'function' && 
           typeof latLng.lng === 'function' &&
           !isNaN(latLng.lat()) && 
           !isNaN(latLng.lng());
  }


  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static handleError(error, context = '') {
    const errorMessage = error.message || error.toString();
    console.error(`Error${context ? ` in ${context}` : ''}: ${errorMessage}`, error);
    return errorMessage;
  }

  static isNotEmpty(str) {
    return str && typeof str === 'string' && str.trim().length > 0;
  }

  static getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  static setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
  }

  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Error copy to clipboard:', err);
      return false;
    }
  }

  /** Number formatting to include thousands separator */
  static formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  static capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /* Truncates text to a maximum length with ellipsis */
  static truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }
}

window.Utils = Utils;