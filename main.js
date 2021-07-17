const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev')
const path = require('path')
const url = require("url");
const fs = require('fs')

const knex = require("knex")({
    client: 'sqlite3',
    connection: {
        filename: app.getPath('userData') + '/database.sqlite3'
    },
    useNullAsDefault: true
})

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

    ipcMain.on("getProducts", async () => {
        var result = []
        let rows = await knex
            .select("*")
            .from("products")
        const promises = rows.map(async (data) => {
            const container = {}
            container["name"] = data.name
            container["price"] = data.price

            result.push(container)
        })

        await Promise.all(promises)

        mainWindow.webContents.send("getProductsResults", result)
    })

    ipcMain.on("getInvoice", async () => {
        var result = []
        let rows = await knex
            .select("*")
            .from("invoice")
        const promises = rows.map(async (data) => {
            const container = {}
            container["id"] = data.id
            container["name"] = data.name
            container["price"] = data.price

            result.push(container)
        })

        await Promise.all(promises)

        mainWindow.webContents.send("getInvoiceResults", result)
    })

    ipcMain.on("getTransactionsByInvoiceName", async (event, data) => {
        var result = []
        let rows = await knex
            .select("*")
            .from("transaction").where("invoiceName", data)
        const promises = rows.map(async (data) => {
            const container = {}
            container["id"] = data.id
            container["productName"] = data.productName
            container["quantity"] = data.quantity
            container["unitPrice"] = data.unitPrice
            container["totalPrice"] = data.totalPrice

            result.push(container)
        })

        await Promise.all(promises)

        mainWindow.webContents.send("getTransactionsByInvoiceNameResults", result)
    })

    ipcMain.on("createInvoice", async (event, data) => {
        await knex("invoice")
            .insert(data)
            .then(() => {
                mainWindow.webContents.send("createInvoiceResult", "Invoice has been created")
            })
            .catch((err) => {
                mainWindow.webContents.send("createInvoiceResult", err)
            })
    })

    ipcMain.on("createTrans", async (event, data) => {
        await knex("transaction")
            .insert(data)
            .then(() => {
                mainWindow.webContents.send("createTransResult", "Transaction has been created")
            })
            .catch((err) => {
                mainWindow.webContents.send("createTransResult", err)
            })
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
                    label: 'Create Invoice',
                    click() {
                        console.log("Navigate to Create Invoice");
                        mainWindow.webContents.send('goToCreateInvoice');
                    }

                },
                {
                    label: 'View Invoice',

                    click() {
                        console.log("Navigate to View Invoice ");
                        mainWindow.webContents.send('goToViewInvoice');
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