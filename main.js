/***************************************************************************************************
 * Main Process (main.js)
 * Manages app lifecycle, and now includes a function to clear the CSV data.
 ***************************************************************************************************/
const { app, BrowserWindow, ipcMain, Tray, Menu, net } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const axios = require('axios');

let mainWindow = null;
let tray = null;
let signalOverride = null;
let locationOverride = null;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) { app.quit(); } 
else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function showApplication() {
    if (mainWindow && mainWindow.isVisible()) {
        mainWindow.focus();
        return;
    }
    const splash = new BrowserWindow({ width: 400, height: 600, transparent: true, frame: false, alwaysOnTop: true, center: true });
    splash.loadFile('splash.html');

    if (!mainWindow) {
        mainWindow = new BrowserWindow({
            width: 400,
            height: 600,
            frame: false,
            transparent: true,
            show: false,
            center: true,
            webPreferences: {
                preload: path.join(__dirname, 'preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
            },
            skipTaskbar: true,
        });
        mainWindow.loadFile('index.html');
        mainWindow.on('close', (event) => {
            event.preventDefault();
            mainWindow.hide();
        });
    }

    setTimeout(() => {
        splash.destroy();
        if (mainWindow) {
            mainWindow.show();
        }
    }, 2000);
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets/icon.png')); 
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Show App', click: showApplication },
        { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); }}
    ]);
    tray.setToolTip('Pika Wifi');
    tray.setContextMenu(contextMenu);
    tray.on('click', showApplication);
}

app.on('ready', () => {
    createTray();
    showApplication();

    if (app.isPackaged) {
        app.setLoginItemSettings({ openAtLogin: true, path: app.getPath('exe') });
    }

    let wasOnline = net.isOnline();
    setInterval(() => {
        const isOnlineNow = net.isOnline();
        if (isOnlineNow && !wasOnline) {
            console.log('Network status: Came Online');
            showApplication();
        }
        wasOnline = isOnlineNow;
    }, 5000);
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') { /* Do nothing */ } });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { showApplication(); } });

// --- IPC HANDLERS ---
ipcMain.handle('get-wifi-signal', async () => {
    if (signalOverride !== null) return { quality: signalOverride, ssid: null };
    return new Promise((resolve) => {
        exec('netsh wlan show interfaces', (error, stdout) => {
            if (error) { resolve({ quality: 0, ssid: 'Error' }); return; }
            try {
                const ssidMatch = stdout.match(/^\s*SSID\s*:\s*(.*)\s*$/m);
                const signalMatch = stdout.match(/^\s*Signal\s*:\s*(\d+)\s*%\s*$/m);
                const ssid = ssidMatch ? ssidMatch[1].trim() : 'Not Connected';
                const quality = signalMatch ? parseInt(signalMatch[1], 10) : 0;
                resolve({ quality, ssid: ssid || 'Connected (Hidden)' });
            } catch (e) { resolve({ quality: 0, ssid: 'Parse Error' }); }
        });
    });
});

ipcMain.handle('get-current-location', async () => {
    if (locationOverride) {
        return { success: true, ...locationOverride };
    }
    try {
        const response = await axios.get('http://ip-api.com/json');
        const data = response.data;
        if (data.status === 'success') {
            return {
                success: true,
                latitude: data.lat,
                longitude: data.lon,
                accuracy: 'IP-based',
                source: 'ip-api.com',
                city: data.city,
                region: data.regionName,
                country: data.country
            };
        } else {
            throw new Error(data.message || 'Failed to get IP location.');
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('log-location-to-csv', async (event, latitude, longitude, metadata) => {
    try {
        const userDataPath = app.getPath('userData');
        const csvPath = path.join(userDataPath, 'data.csv');
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const csvLine = `"${latitude}","${longitude}","${timestamp}","${metadata.accuracy || 'IP'}","${metadata.city || ''}","${metadata.region || ''}","${metadata.country || ''}"`;

        if (!fs.existsSync(csvPath)) {
            const headers = 'latitude,longitude,timestamp,location_type,city,region,country\n';
            fs.writeFileSync(csvPath, headers);
        }
        let fileContent = fs.readFileSync(csvPath, 'utf8');
        const contentToAppend = (fileContent.length > 0 && !fileContent.endsWith('\n') ? '\n' : '') + csvLine + '\n';
        fs.appendFileSync(csvPath, contentToAppend);
        return { success: true, data: csvLine };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('read-csv-file', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const csvPath = path.join(userDataPath, 'data.csv');
        if (!fs.existsSync(csvPath)) {
            const headers = 'latitude,longitude,timestamp,location_type,city,region,country\n';
            fs.writeFileSync(csvPath, headers);
        }
        const csvData = fs.readFileSync(csvPath, 'utf8');
        return { success: true, data: csvData };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

// --- NEW --- This function clears the CSV file, leaving only the headers.
ipcMain.handle('clear-csv-file', async () => {
    try {
        const userDataPath = app.getPath('userData');
        const csvPath = path.join(userDataPath, 'data.csv');
        const headers = 'latitude,longitude,timestamp,location_type,city,region,country\n';
        fs.writeFileSync(csvPath, headers);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.on('set-wifi-signal-override', (event, signal) => { signalOverride = signal; });
ipcMain.on('set-location-override', (event, location) => { locationOverride = location; });
ipcMain.on('minimize-app', () => mainWindow.minimize());
ipcMain.on('close-app', () => mainWindow.hide());
