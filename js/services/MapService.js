class MapService {
  constructor(elementId, options = {}) {
    this.map = null;
    this.infoWindow = null;
    this.userMarker = null;
    this.radiusCircle = null;
    this.markers = [];
    
    if (elementId) {
      this.initializeMap(elementId, options);
    }
  }

  initializeMap(elementId, options = {}) {
    const defaultOptions = {
      center: { lat: 40.4168, lng: -3.7038 }, // Madrid
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true
    };

    const mapOptions = { ...defaultOptions, ...options };
    const mapElement = document.getElementById(elementId);
    
    if (!mapElement) {
      throw new Error(`Element with ID '${elementId}' not found`);
    }

    this.map = new google.maps.Map(mapElement, mapOptions);
    this.infoWindow = new google.maps.InfoWindow();
    
    return this.map;
  }

  centerAt(latLng, radius = 1500) {
    if (!this.map) return;

    this.map.setCenter(latLng);
    this.addUserLocationMarker(latLng);
    this.updateRadiusCircle(latLng, radius);
  }

  addUserLocationMarker(latLng) {
    if (this.userMarker) {
      this.userMarker.setMap(null); // Clean previous user marker
    }

    this.userMarker = new google.maps.Marker({
      map: this.map,
      position: latLng,
      zIndex: 999,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#2563eb',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#111',
        scale: 7
      },
      title: 'Your location'
    });
  }


  updateRadiusCircle(center, radius) {
    if (this.radiusCircle) {
      this.radiusCircle.setMap(null);
    }

    this.radiusCircle = new google.maps.Circle({
      map: this.map,
      center: center,
      radius: radius,
      strokeColor: '#111',
      strokeWeight: 1,
      fillColor: '#2563eb',
      fillOpacity: 0.08
    });
  }

  clearMarkers() {
    this.markers.forEach(marker => {
      if (marker) {
        marker.setMap(null);
      }
    });
    this.markers = [];
  }

  createCoffeePlaceMarker(coffeePlace, index, clickCallback = null) {
    const marker = new google.maps.Marker({
      position: coffeePlace.location,
      map: this.map,
      title: coffeePlace.name,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='42' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M16 0C7.2 0 0 7.2 0 16s16 26 16 26 16-17 16-26S24.8 0 16 0z' fill='%23e11d48'/%3e%3ccircle cx='16' cy='16' r='12' fill='white'/%3e%3ctext x='16' y='21' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' font-weight='bold' fill='%23000'%3e${index}%3c/text%3e%3c/svg%3e`,
        scaledSize: new google.maps.Size(32, 42),
        anchor: new google.maps.Point(16, 42)
      },
      animation: google.maps.Animation.DROP,
      visible: true
    });

    marker.addListener('click', () => {
      this.showCoffeePlaceInfo(coffeePlace, marker);
      if (clickCallback) {
        clickCallback(coffeePlace);
      }
    });

    marker.place_id = coffeePlace.place_id;

    this.markers.push(marker);
    return marker;
  }

  showCoffeePlaceInfo(coffeePlace, marker) {
    const content = `
      <div style="max-width:240px">
        <strong>${coffeePlace.name}</strong><br/>
        <div style="color:#666">${coffeePlace.vicinity}</div>
        <div style="margin:6px 0">${coffeePlace.getFormattedRating()}${coffeePlace.isOpenNow() ? " · 🟢 Open" : ""}</div>
        <a href="${coffeePlace.getDirectionsUrl()}" target="_blank" rel="noopener">Get directions</a>
      </div>
    `;
    
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
  }


  highlightMarker(placeId) {
    const marker = this.markers.find(m => m.place_id === placeId);
    if (!marker) return;
    
    const index = this.markers.indexOf(marker) + 1;
    
    marker.setIcon({
      url: `data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='42' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M16 0C7.2 0 0 7.2 0 16s16 26 16 26 16-17 16-26S24.8 0 16 0z' fill='%232563eb'/%3e%3ccircle cx='16' cy='16' r='12' fill='white'/%3e%3ctext x='16' y='21' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' font-weight='bold' fill='%23000'%3e${index}%3c/text%3e%3c/svg%3e`,
      scaledSize: new google.maps.Size(32, 42),
      anchor: new google.maps.Point(16, 42)
    });
    
    marker.setAnimation(google.maps.Animation.BOUNCE);
    
    setTimeout(() => {
      marker.setAnimation(null);
      marker.setIcon({
        url: `data:image/svg+xml;charset=UTF-8,%3csvg width='32' height='42' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M16 0C7.2 0 0 7.2 0 16s16 26 16 26 16-17 16-26S24.8 0 16 0z' fill='%23e11d48'/%3e%3ccircle cx='16' cy='16' r='12' fill='white'/%3e%3ctext x='16' y='21' text-anchor='middle' font-family='Arial, sans-serif' font-size='12' font-weight='bold' fill='%23000'%3e${index}%3c/text%3e%3c/svg%3e`,
        scaledSize: new google.maps.Size(32, 42),
        anchor: new google.maps.Point(16, 42)
      });
    }, 1400);
  }

  fitBoundsToMarkers(includeUserLocation = true) {
    if (this.markers.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    this.markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });

    if (includeUserLocation && this.userMarker) {
      bounds.extend(this.userMarker.getPosition());
    }

    // Adjust map view
    if (this.markers.length === 1 && !includeUserLocation) {
      this.map.setCenter(this.markers[0].getPosition());
      this.map.setZoom(16);
    } else {
      this.map.fitBounds(bounds, { padding: 50 });
      
      // Max zoom limit
      const listener = google.maps.event.addListener(this.map, 'bounds_changed', () => {
        if (this.map.getZoom() > 17) {
          this.map.setZoom(17);
        }
        google.maps.event.removeListener(listener);
      });
    }
  }

  getCurrentCenter() {
    return this.userMarker?.getPosition() || this.map.getCenter();
  }

  panToLocation(latLng, zoom = null) {
    this.map.panTo(latLng);
    if (zoom) {
      this.map.setZoom(Math.max(this.map.getZoom(), zoom));
    }
  }
}

window.MapService = MapService;