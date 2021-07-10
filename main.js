const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path')
const url = require("url");
const fs = require('fs')

let mainWindow

function createWindow() {
    // Create the database file rifht away
    let database = 'database.sqlite3'
    if (!fs.existsSync(app.getPath('userData') + '/' + database) || isDev) {
        fs.copyFileSync(path.join(__dirname, 'db', database), app.getPath('userData') + '/' + database)
    }

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegrationInWorker: true,
        }
    })

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `./dist/index.html`),
            protocol: "file:",
            slashes: true
        })
    );
    mainWindow.on('closed', function () {
        mainWindow = null
    })

    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }
    createMenu()
    // +++++++++++++++++++++
    //        ipcMain
    // +++++++++++++++++++++
    const knex = require("knex")({
        client: 'sqlite3',
        connection: {
            filename: app.getPath('userData') + '/database.sqlite3'
        },
        useNullAsDefault: true
    })
    ipcMain.on("getUsers", async () => {
        var result = []
        let rows = await knex
            .select("*")
            .from("users")
            .limit(15)
        const promises = rows.map(async (data) => {
            const container = {}
            container["name"] = data.name
            container["email"] = data.email

            result.push(container)
        })

        await Promise.all(promises)

        knex.destroy()
        mainWindow.webContents.send("getUsersResults", result)
    })
}
app.on('ready', function () {
    createWindow()
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

function createMenu() {

    var menu = Menu.buildFromTemplate([
        {
            label: 'Menu',
            submenu: [
                {
                    label: 'Home',
                    click() {
                        console.log("Navigate to Home");
                        mainWindow.webContents.send('goToHome');
                    }

                },
                {
                    label: 'About',

                    click() {
                        console.log("Navigate to About");
                        mainWindow.webContents.send('goToAbout');
                    }
                },
                {
                    label: 'Exit',
                    click() {
                        app.quit()
                    }
                }
            ]
        }
    ])
    Menu.setApplicationMenu(menu);
}