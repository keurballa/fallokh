const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Check if we are running in production (packaged) or dev
  const isDev = !app.isPackaged;

  if (isDev) {
    // In dev, the Vite server is usually started separately on port 3000
    mainWindow.loadURL('http://localhost:3000');
  } else {
    // In production, start the built Express server
    const serverPath = path.join(__dirname, 'dist', 'server.cjs');
    
    // Determine a writable directory for the database
    // This will be something like %APPDATA%/Sunu Daara Pro/ on Windows
    const userDataPath = app.getPath('userData');
    
    // Spawn the Node process using Electron's built-in Node
    // This avoids needing a separate Node installation on the target machine
    serverProcess = spawn(process.execPath, [serverPath], {
      env: { 
        ...process.env, 
        NODE_ENV: 'production', 
        ELECTRON_RUN_AS_NODE: '1',
        DB_DIR: userDataPath
      },
      stdio: 'inherit' // Useful for seeing logs if launched via terminal
    });

    // Wait for Express to start listening on port 3000
    const loadApp = () => {
      mainWindow.loadURL('http://localhost:3000').catch((err) => {
        console.log("Waiting for server...");
        setTimeout(loadApp, 500);
      });
    };
    
    setTimeout(loadApp, 1000);
  }
}

// Wait for Electron to be ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Clean up child process on exit
app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
