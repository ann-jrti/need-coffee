class SearchUIComponent {
  constructor(searchButtonId, radiusSelectId, placesListId) {
    this.searchButton = document.getElementById(searchButtonId);
    this.radiusSelect = document.getElementById(radiusSelectId);
    this.placesList = document.getElementById(placesListId);
    
    this.addressInput = document.getElementById('address');
    this.keywordInput = document.getElementById('keyword');
    this.useLocationButton = document.getElementById('useLocation');
    this.sortBySelect = document.getElementById('sortBy');
    this.openNowCheckbox = document.getElementById('openNow');
    
    this.onSearchCallback = null;
    this.onPlaceSelectCallback = null;
    this.onAddressSearchCallback = null;
    this.onUseLocationCallback = null;
    
    this.userLocation = null;
    
    this.initializeEvents();
  }


  initializeEvents() {
    if (this.searchButton) {
      this.searchButton.addEventListener('click', () => {
        this.handleSearchClick();
      });
    }

    if (this.useLocationButton) {
      this.useLocationButton.addEventListener('click', () => {
        this.handleUseLocationClick();
      });
    } else {
      console.error('useLocation button not found! Check if element exists with id="useLocation"');
    }

    if (this.addressInput) {
      this.addressInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleAddressSearch();
        }
      });
    }

    if (this.keywordInput) {
      this.keywordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSearchClick();
        }
      });
    }
  }

  handleSearchClick() {
    if (this.onSearchCallback) {
      const searchParams = this.getSearchParameters();
      this.onSearchCallback(searchParams);
    }
  }

  handleUseLocationClick() {
    if (this.onUseLocationCallback) {
      this.onUseLocationCallback();
    } else {
      console.error('onUseLocationCallback not set! Check if App.js is properly setting the callback.');
    }
    if (this.addressInput) {
      this.addressInput.value = '';
    }
  }

  handleAddressSearch() {
    const address = this.addressInput ? this.addressInput.value.trim() : '';
    if (address && this.onAddressSearchCallback) {
      this.onAddressSearchCallback(address);
    }
  }

  getSearchParameters() {
    return {
      radius: this.getSelectedRadius(),
      keyword: this.keywordInput ? this.keywordInput.value.trim() : '',
      sortBy: this.sortBySelect ? this.sortBySelect.value : 'distance',
      openNow: this.openNowCheckbox ? this.openNowCheckbox.checked : false
    };
  }

  getSelectedRadius() {
    return this.radiusSelect ? parseInt(this.radiusSelect.value) : 1000;
  }

  onSearch(callback) {
    this.onSearchCallback = callback;
  }

  onPlaceSelect(callback) {
    this.onPlaceSelectCallback = callback;
  }

  onAddressSearch(callback) {
    this.onAddressSearchCallback = callback;
  }

  onUseLocation(callback) {
    this.onUseLocationCallback = callback;
  }

  setUserLocation(location) {
    this.userLocation = location;
  }

  showLoading() {
    if (this.searchButton) {
      this.searchButton.disabled = true;
      this.searchButton.textContent = 'Searching...';
    }
  }

  hideLoading() {
    if (this.searchButton) {
      this.searchButton.disabled = false;
      this.searchButton.textContent = 'Search for cafes';
    }
  }

  renderPlacesList(coffeePlaces) {
    if (!this.placesList) return;

    this.placesList.innerHTML = '';

    if (coffeePlaces.length === 0) {
      this.placesList.innerHTML = '<p>Coffee shops not found in the area.</p>';
      return;
    }

    coffeePlaces.forEach((place, index) => {
      const placeElement = this.createPlaceElement(place, index);
      this.placesList.appendChild(placeElement);
    });
  }

  createPlaceElement(place, index) {
    const placeDiv = document.createElement('div');
    placeDiv.className = 'place-item';
    placeDiv.setAttribute('data-place-id', place.place_id);

    const ratingStars = this.createRatingStars(place.rating);
    const photoUrl = place.getPhotoUrl(300, 200);

    placeDiv.innerHTML = `
      <div class="place-header">
        <h3 class="place-name">${place.name}</h3>
        <span class="place-number">${index + 1}</span>
      </div>
      ${photoUrl ? `<img src="${photoUrl}" alt="${place.name}" class="place-photo">` : ''}
      <div class="place-details">
        <div class="place-rating">
          ${ratingStars}
          <span class="rating-text">${place.getFormattedRating()}</span>
        </div>
        <p class="place-address">${place.vicinity}</p>
        <p class="place-distance">${place.getFormattedDistance()}</p>
        <div class="place-status ${place.isOpenNow() ? 'open' : 'unknown'}">
          ${place.getOpenStatusText()}
        </div>
      </div>
      <div class="place-actions">
        <a href="${place.getDirectionsUrl(this.userLocation)}" target="_blank" class="directions-btn">
          Get directions
        </a>
      </div>
    `;

    placeDiv.addEventListener('click', () => {
      this.handlePlaceClick(place, index);
    });

    return placeDiv;
  }

  handlePlaceClick(place, index) {
    this.highlightPlaceInList(place.place_id);

    if (this.onPlaceSelectCallback) {
      this.onPlaceSelectCallback(place, index);
    }
  }

  highlightPlaceInList(placeId) {
    const previousHighlighted = this.placesList.querySelector('.place-item.highlighted');
    if (previousHighlighted) {
      previousHighlighted.classList.remove('highlighted');
    }

    const placeElement = this.placesList.querySelector(`[data-place-id="${placeId}"]`);
    if (placeElement) {
      placeElement.classList.add('highlighted');
    }
  }

  createRatingStars(rating) {
    if (!rating) return '<span class="no-rating">No rating</span>';

    let starsHtml = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        starsHtml += '<span class="star full">★</span>';
      } else if (i === fullStars + 1 && hasHalfStar) {
        starsHtml += '<span class="star half">★</span>';
      } else {
        starsHtml += '<span class="star empty">☆</span>';
      }
    }

    return `<div class="rating-stars">${starsHtml}</div>`;
  }

  showError(message) {
    if (this.placesList) {
      this.placesList.innerHTML = `<p class="error-message">Error: ${message}</p>`;
    }
  }

  clearPlacesList() {
    if (this.placesList) {
      this.placesList.innerHTML = '';
    }
  }
}

window.SearchUIComponent = SearchUIComponent;