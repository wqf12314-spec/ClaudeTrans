const { app, BrowserWindow, ipcMain, globalShortcut, clipboard } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 400,
    frame: false,
    backgroundColor: '#0A0D12',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 开发时打开 DevTools
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  // 注册全局快捷键：Ctrl+Shift+T 翻译剪贴板内容
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    const text = clipboard.readText();
    if (text && mainWindow) {
      mainWindow.webContents.send('translate-clipboard', text);
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC 通信 - 使用 MyMemory 翻译 API（免费，无需密钥）
ipcMain.handle('translate', async (event, text, targetLang) => {
  try {
    // 检测源语言
    const sourceLang = /[一-龥]/.test(text) ? 'zh-CN' : 'en';

    // 使用 MyMemory Translation API
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.responseStatus === 200 || data.responseData) {
      return data.responseData.translatedText;
    } else {
      throw new Error('翻译服务返回异常');
    }
  } catch (error) {
    throw new Error('翻译失败：' + error.message);
  }
});

ipcMain.on('window-minimize', () => {
  mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow.close();
});

ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
  return true;
});
