/***************************************************************************************************
 * Renderer Process (renderer.js)
 * Manages views, Wi-Fi logic, map logic, and automatic IP-based location logging on Wi-Fi connection.
 ***************************************************************************************************/
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Elements ---
    const appTitle = document.getElementById('app-title');
    const viewsWrapper = document.querySelector('.views-wrapper');
    const pikaView = document.getElementById('pika-view');
    const motivatorView = document.getElementById('motivator-view');
    const mapView = document.getElementById('map-view');
    const navBtnLeft = document.getElementById('nav-btn-left');
    const navBtnRight = document.getElementById('nav-btn-right');
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');
    const testingNotice = document.getElementById('testing-notice');

    // --- Pika View Elements ---
    const idlePikaSprite = document.getElementById('idle-pika-sprite');
    const thunderboltBtn = document.getElementById('thunderbolt-btn');
    const lightningContainer = document.getElementById('lightning-container');

    // --- Wi-Fi Motivator Elements ---
    const quoteText = document.getElementById('quote-text');
    const wifiIcon = document.getElementById('wifi-icon');
    const wifiInfo = document.getElementById('wifi-info');
    const wifiStrengthEl = document.getElementById('wifi-strength');
    const logLocationBtn = document.getElementById('log-location-btn');

    // --- Map Elements ---
    let map;
    let mapLayers = [];
    const routeInfoPanel = document.getElementById('route-info-panel');
    const refreshMapBtn = document.getElementById('refresh-map-btn');
    const clearRouteBtn = document.getElementById('clear-route-btn');

    // --- Audio Elements ---
    const uiClickSound = document.getElementById('ui-click-sound');
    const pikaSound = new Audio('./assets/audio/splash_sound.mp3');
    // --- NEW --- Separate sound for the Thunderbolt attack
    const thunderboltSound = new Audio('./assets/audio/deep_pika.mp3');

    // --- State ---
    let mapInitialized = false;
    let isWifiConnected = false;
    let lastKnownSSID = null;
    let isConfirmingClear = false;
    let clearConfirmTimeout;
    let pikaActionOnCooldown = false;
    
    const viewClasses = ['show-pika', 'show-motivator', 'show-map'];
    const viewTitles = ["Pika Room", "Wi-Fi Motivator", "IP Route Map"];
    let currentViewIndex = 1;

    // --- Navigation ---
    function updateView() {
        viewsWrapper.classList.remove(...viewClasses);
        viewsWrapper.classList.add(viewClasses[currentViewIndex]);
        appTitle.textContent = viewTitles[currentViewIndex];
        navBtnLeft.classList.toggle('hidden', currentViewIndex === 0);
        navBtnRight.classList.toggle('hidden', currentViewIndex === viewClasses.length - 1);

        if (currentViewIndex === 2 && !mapInitialized) {
            initMap();
            loadRoute();
            mapInitialized = true;
        }
    }

    navBtnRight.addEventListener('click', () => {
        if (currentViewIndex < viewClasses.length - 1) {
            playUiClickSound();
            currentViewIndex++;
            updateView();
        }
    });

    navBtnLeft.addEventListener('click', () => {
        if (currentViewIndex > 0) {
            playUiClickSound();
            currentViewIndex--;
            updateView();
        }
    });

    // --- Sound Logic ---
    function playUiClickSound() {
        uiClickSound.currentTime = 0;
        uiClickSound.play();
    }

    // --- Pika Room Logic ---
    idlePikaSprite.addEventListener('click', () => {
        if (pikaActionOnCooldown) return;

        pikaSound.currentTime = 0;
        pikaSound.play();
        
        pikaActionOnCooldown = true;
        idlePikaSprite.style.filter = 'brightness(0.7)';
        
        setTimeout(() => {
            pikaActionOnCooldown = false;
            idlePikaSprite.style.filter = '';
        }, 2000);
    });

    thunderboltBtn.addEventListener('click', () => {
        playUiClickSound();
        if (pikaActionOnCooldown) return;

        pikaActionOnCooldown = true;
        
        // --- UPDATED --- Play the new Thunderbolt sound
        thunderboltSound.currentTime = 0;
        thunderboltSound.play();

        idlePikaSprite.classList.add('thunderbolt-animation');
        lightningContainer.classList.add('is-attacking');
        
        thunderboltBtn.disabled = true;

        setTimeout(() => {
            idlePikaSprite.classList.remove('thunderbolt-animation');
            lightningContainer.classList.remove('is-attacking');
            pikaActionOnCooldown = false;
            thunderboltBtn.disabled = false;
        }, 500);
    });


    // --- Window Controls ---
    minimizeBtn.addEventListener('click', () => {
        playUiClickSound();
        window.electronAPI.minimizeApp();
    });
    closeBtn.addEventListener('click', () => {
        playUiClickSound();
        window.electronAPI.closeApp();
    });

    // --- Manual Location Logging ---
    logLocationBtn.addEventListener('click', () => {
        playUiClickSound();
        logCurrentLocationFromIP(true);
    });

    // --- IP-Based Location Logging Functions ---
    async function logCurrentLocationFromIP(isManual = false) {
        try {
            const statusMessage = isManual ? 'Getting your location...' : 'Wi-Fi connected! Logging location...';
            showNotification(statusMessage, 'info');
            const locationResult = await window.electronAPI.getCurrentLocation();
            if (!locationResult.success) throw new Error(locationResult.error);
            
            const metadata = {
                accuracy: locationResult.accuracy, city: locationResult.city,
                region: locationResult.region, country: locationResult.country
            };
            const csvResult = await window.electronAPI.logLocationToCSV(locationResult.latitude, locationResult.longitude, metadata);
            
            if (csvResult.success) {
                const message = isManual ? `Location logged! (${locationResult.city})` : `Auto-logged location! (${locationResult.city})`;
                showNotification(message, 'success');
                if (mapInitialized) {
                    loadRoute();
                }
            } else {
                throw new Error(csvResult.error);
            }
        } catch (error) {
            showNotification(`Location error: ${error.message}`, 'error');
        }
    }

    function showNotification(message, type = 'info') {
        testingNotice.textContent = message;
        testingNotice.className = type;
        testingNotice.style.opacity = 1;
        setTimeout(() => {
            testingNotice.style.opacity = 0;
            setTimeout(() => { testingNotice.className = ''; }, 500);
        }, 5000);
    }

    // ============================================================================================
    // MAP LOGIC
    // ============================================================================================
    refreshMapBtn.addEventListener('click', () => {
        playUiClickSound();
        loadRoute();
    });

    clearRouteBtn.addEventListener('click', async () => {
        playUiClickSound();
        if (isConfirmingClear) {
            clearTimeout(clearConfirmTimeout);
            const result = await window.electronAPI.clearCsvFile();
            if (result.success) {
                showNotification('Route cleared successfully!', 'success');
                loadRoute();
            } else {
                showNotification(`Error: ${result.error}`, 'error');
            }
            resetClearButton();
        } else {
            isConfirmingClear = true;
            clearRouteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path></svg>';
            clearRouteBtn.style.backgroundColor = '#27ae60';
            clearConfirmTimeout = setTimeout(resetClearButton, 4000);
        }
    });

    function resetClearButton() {
        isConfirmingClear = false;
        clearRouteBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>';
        clearRouteBtn.style.backgroundColor = '';
    }

    function initMap() {
        map = L.map('map', { zoomControl: false }).setView([9.99, 76.3], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
        }).addTo(map);
    }

    function clearMap() {
        mapLayers.forEach(layer => map.removeLayer(layer));
        mapLayers = [];
    }

    function parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length <= 1) return [];
        const headers = lines.shift().split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const latIndex = headers.indexOf('latitude');
        const lngIndex = headers.indexOf('longitude');
        const timeIndex = headers.indexOf('timestamp');
        const locationTypeIndex = headers.indexOf('location_type');
        const cityIndex = headers.indexOf('city');
        const regionIndex = headers.indexOf('region');
        const countryIndex = headers.indexOf('country');

        if (latIndex === -1 || lngIndex === -1) throw new Error('CSV needs "latitude" & "longitude" columns.');

        return lines.map(line => {
            if (!line.trim()) return null;
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const lat = parseFloat(values[latIndex]);
            const lng = parseFloat(values[lngIndex]);
            if (isNaN(lat) || isNaN(lng)) return null;
            return { lat, lng, timestamp: timeIndex !== -1 ? values[timeIndex] : null, locationType: locationTypeIndex !== -1 ? values[locationTypeIndex] : 'unknown', city: cityIndex !== -1 ? values[cityIndex] : '', region: regionIndex !== -1 ? values[regionIndex] : '', country: countryIndex !== -1 ? values[countryIndex] : '' };
        }).filter(p => p !== null);
    }

    function displayRoute(routePoints) {
        clearMap();
        if (routePoints.length === 0) {
            routeInfoPanel.innerHTML = `<p>No route data. Connect to Wi-Fi to start logging!</p>`;
            return;
        }

        const latLngs = routePoints.map(p => [p.lat, p.lng]);
        const routeLine = L.polyline(latLngs, { color: '#ffc857', weight: 4, opacity: 0.8 });
        mapLayers.push(routeLine);
        routeLine.addTo(map);
        
        if (routePoints.length > 1) {
            map.fitBounds(routeLine.getBounds(), { padding: [20, 20], maxZoom: 14 });
        } else {
            map.setView(latLngs[0], 14);
        }

        routePoints.forEach((point, index) => {
            let circle;
            const tooltipContent = `Time: ${point.timestamp || 'N/A'}<br>Type: ${point.locationType}<br>Location: ${point.city}, ${point.region}`;
            const accuracyRadius = 500;
            let circleOptions = { radius: accuracyRadius, weight: 2, fillOpacity: 0.3 };
            
            if (index === 0) {
                circleOptions.color = '#27ae60'; circleOptions.fillColor = '#27ae60';
                circle = L.circle([point.lat, point.lng], circleOptions).bindTooltip(`Start<br>${tooltipContent}`);
            } else if (index === routePoints.length - 1) {
                circleOptions.color = '#e74c3c'; circleOptions.fillColor = '#e74c3c';
                circle = L.circle([point.lat, point.lng], circleOptions).bindTooltip(`End<br>${tooltipContent}`);
            } else {
                circleOptions.color = '#ffc857'; circleOptions.fillColor = '#ffc857';
                circle = L.circle([point.lat, point.lng], circleOptions).bindTooltip(tooltipContent);
            }
            mapLayers.push(circle);
            circle.addTo(map);
        });

        updateRouteInfo(routePoints);
    }

    function updateRouteInfo(routePoints) {
        let totalDistance = 0;
        for (let i = 1; i < routePoints.length; i++) {
            totalDistance += L.latLng(routePoints[i - 1]).distanceTo(L.latLng(routePoints[i]));
        }
        totalDistance /= 1000;
        const startTime = routePoints[0]?.timestamp;
        const endTime = routePoints[routePoints.length - 1]?.timestamp;
        routeInfoPanel.innerHTML = `<p><strong>Points:</strong> ${routePoints.length}</p><p><strong>Distance:</strong> ${totalDistance.toFixed(2)} km</p><p><strong>Start:</strong> ${startTime || 'N/A'}</p><p><strong>End:</strong> ${endTime || 'N/A'}</p>`;
    }

    async function loadRoute() {
        try {
            const result = await window.electronAPI.readCsvFile();
            if (!result.success) throw new Error(result.error);
            const routePoints = parseCSV(result.data);
            displayRoute(routePoints);
        } catch (error) {
            routeInfoPanel.innerHTML = `<p style="color: #e84a5f;">Error: ${error.message}</p>`;
        }
    }

    // ============================================================================================
    // WI-FI MOTIVATOR LOGIC
    // ============================================================================================
    const quotes = {
        strong: ["The struggle you're in today is developing the strength you need for tomorrow."],
        medium: ["The future belongs to those who believe in the beauty of their dreams."],
        low: ["A little progress each day adds up to big results."]
    };

    function getQuote(signalStrength) {
        let category;
        if (signalStrength <= 30) category = quotes.strong;
        else if (signalStrength <= 70) category = quotes.medium;
        else category = quotes.low;
        return category[Math.floor(Math.random() * category.length)];
    }

    function updateWifiIcon(signalStrength) {
        if (signalStrength <= 30) {
            wifiIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
        } else if (signalStrength <= 70) {
            wifiIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
        } else {
            wifiIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;
        }
    }

    async function updateQuoteAndWifi() {
        try {
            const wifiData = await window.electronAPI.getWifiSignal();
            quoteText.textContent = getQuote(wifiData.quality);
            updateWifiIcon(wifiData.quality);
            const currentlyConnected = wifiData.ssid && wifiData.ssid !== 'Not Connected' && wifiData.ssid !== 'Error';

            if (!isWifiConnected && currentlyConnected) {
                isWifiConnected = true;
                lastKnownSSID = wifiData.ssid;
                setTimeout(() => logCurrentLocationFromIP(false), 2000);
            } else if (isWifiConnected && !currentlyConnected) {
                isWifiConnected = false;
                lastKnownSSID = null;
            } else if (isWifiConnected && currentlyConnected && wifiData.ssid !== lastKnownSSID) {
                lastKnownSSID = wifiData.ssid;
                setTimeout(() => logCurrentLocationFromIP(false), 2000);
            }
            
            if (wifiData.ssid === null) {
                wifiInfo.textContent = '--- Simulating Signal ---';
                wifiStrengthEl.textContent = `Strength: ${wifiData.quality}%`;
            } else {
                wifiInfo.textContent = `Connected to: ${wifiData.ssid}`;
                wifiStrengthEl.textContent = `Strength: ${wifiData.quality}%`;
            }
        } catch (error) {
            quoteText.textContent = "Could not fetch a quote. Stay strong!";
            wifiStrengthEl.textContent = 'Error getting Wi-Fi info';
            isWifiConnected = false;
        }
    }

    // Initialize the first view
    updateView();
    updateQuoteAndWifi();
    setInterval(updateQuoteAndWifi, 3000);

    // --- TESTING SIMULATION ---
    document.addEventListener('keydown', (event) => {
        let simulationText = '';
        if (event.key === '1') {
            window.electronAPI.setWifiSignalOverride(20);
            simulationText = 'Simulating: Weak Signal (20%)';
        } else if (event.key === '2') {
            window.electronAPI.setWifiSignalOverride(50);
            simulationText = 'Simulating: Medium Signal (50%)';
        } else if (event.key === '3') {
            window.electronAPI.setWifiSignalOverride(90);
            simulationText = 'Simulating: Strong Signal (90%)';
        } else if (event.key === '0') {
            window.electronAPI.setWifiSignalOverride(null);
            simulationText = 'Using Real Wi-Fi Signal';
        } else if (event.key.toLowerCase() === 'l') {
            logCurrentLocationFromIP(true);
            simulationText = 'Manual IP location log triggered';
        } else if (event.key === '4') {
            const tokyo = { latitude: 35.6895, longitude: 139.6917, city: 'Tokyo', region: 'Tokyo', country: 'Japan', accuracy: 'Simulated', source: 'Test Data' };
            window.electronAPI.setLocationOverride(tokyo);
            simulationText = 'Simulating IP: Tokyo';
        } else if (event.key === '5') {
            const newYork = { latitude: 40.7128, longitude: -74.0060, city: 'New York', region: 'New York', country: 'United States', accuracy: 'Simulated', source: 'Test Data' };
            window.electronAPI.setLocationOverride(newYork);
            simulationText = 'Simulating IP: New York';
        } else if (event.key === '6') {
            const london = { latitude: 51.5072, longitude: -0.1276, city: 'London', region: 'England', country: 'United Kingdom', accuracy: 'Simulated', source: 'Test Data' };
            window.electronAPI.setLocationOverride(london);
            simulationText = 'Simulating IP: London';
        } else if (event.key === '9') {
            window.electronAPI.setLocationOverride(null);
            simulationText = 'Reset to Real IP Location';
        }

        if (simulationText) {
            showNotification(simulationText, 'info');
            setTimeout(updateQuoteAndWifi, 500);
        }
    });
});
