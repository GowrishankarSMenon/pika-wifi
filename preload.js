/***************************************************************************************************
 * Preload Script (preload.js)
 * This script securely exposes Node.js/Electron APIs to the renderer process.
 ***************************************************************************************************/
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getWifiSignal: () => ipcRenderer.invoke('get-wifi-signal'),
    minimizeApp: () => ipcRenderer.send('minimize-app'),
    closeApp: () => ipcRenderer.send('close-app'),
    setWifiSignalOverride: (signal) => ipcRenderer.send('set-wifi-signal-override', signal),
    readCsvFile: () => ipcRenderer.invoke('read-csv-file'),
    getCurrentLocation: () => ipcRenderer.invoke('get-current-location'),
    logLocationToCSV: (lat, lon, meta) => ipcRenderer.invoke('log-location-to-csv', lat, lon, meta),
    setLocationOverride: (location) => ipcRenderer.send('set-location-override', location),
    // --- NEW --- Expose the function to clear the CSV file.
    clearCsvFile: () => ipcRenderer.invoke('clear-csv-file')
});
