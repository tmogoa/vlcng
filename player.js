const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function () {
	//Create new window
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
        }
	});
	//Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'index.html'),
		protocol: 'file:',
		slashes: true
	}));
	//Quit app when closed
	mainWindow.on('closed', function () {
		app.quit();
	});
	//Build Menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
	//Insert Menu
	Menu.setApplicationMenu(mainMenu);
});

//Handle Create add window
function createAddWindow(){
	//Create new window
	addWindow = new BrowserWindow({
		width: 300,
		height: 200,
		title: 'Add Video Item'
	});
	//Load html into window
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'addWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	//Garbage collection handle
	addWindow.on('close', function () {
		addWindow = null;
	});
}


//Catch item add
ipcMain.on('item:add', function (e, item) {
	mainWindow.webContents.send('item:add', item);
	addWindow.close();
});

//Create Menu Template
const mainMenuTemplate = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Extras',
				submenu: [
					{
						label: 'Add Video Item',
						click() {
							createAddWindow();
						}						
					},
					{
						label: 'Clear Items'
					}
				]
			},						
			{
				label: 'Quit',
				//Quit commands for linux, else windows
				accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
				click() {
					app.quit();
                }
            }
		]
	}
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
	mainMenuTemplate.unshift({});
}

//Add Developer tools item if not in production
if (process.env.NODE_ENV !== 'production') {
	mainMenuTemplate.push({
		label: 'Developer Tools',
		submenu:[
			{
				label: 'Toggle DevTools',
				accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow) {
					focusedWindow.toggleDevTools();
                }
			},
			{
				role:'reload'
            }
		]
	});
}