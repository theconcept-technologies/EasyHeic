import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { registerIpcHandlers } from './ipc-handlers'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 860,
    height: 680,
    minWidth: 720,
    minHeight: 580,
    show: false,
    autoHideMenuBar: true,
    frame: true,
    titleBarStyle: 'default',
    backgroundColor: '#0F0F1A',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: icon
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Set CSP
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          app.isPackaged
            ? "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:;"
            : "default-src 'self' 'unsafe-inline' 'unsafe-eval' data:; connect-src 'self' ws: http:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: http://localhost:*;"
        ]
      }
    })
  })

  // Prevent default reload shortcuts
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if ((input.control || input.meta) && input.key.toLowerCase() === 'r') {
      event.preventDefault()
    }
    if (input.key === 'F5') {
      event.preventDefault()
    }
  })

  // Development vs Production URL loading
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Register all IPC handlers
registerIpcHandlers()

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(icon)
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle IPC for opening devtools in development
ipcMain.on('open-devtools', () => {
  mainWindow?.webContents.openDevTools()
})
