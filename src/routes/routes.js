const parseArgs = require('minimist');
const { fork } = require('child_process');
const log4js = require("log4js");



const messages = [];
const fs = require('fs');


const { carritoDaoMongo } = require('../daos/carritos/carritoDaoMongo')
const { productoDaoMongo } = require('../daos/productos/productoDaoMongo');
const { log } = require('console');
const { stringify } = require('querystring');

const producto = new productoDaoMongo();
const carrito = new carritoDaoMongo();



log4js.configure({
    appenders: {
        console: { type: "console" },
        logs: { type: "file", filename: "logs.log" },
        warn: { type: "file", filename: "warn.log" },
        error: { type: "file", filename: "error.log" },
    },
    categories: {
        default: { appenders: ["console"], level: "trace" },
        consola: { appenders: ["logs"], level: "debug" },
        warn: { appenders: ["warn"], level: "warn" },
        error: { appenders: ["error"], level: "error" },
        todos: {
            appenders: ["logs", "console"],
            level: ["ALL"],
        },
    },
});

const logger = log4js.getLogger("todos");
const warnLogger = log4js.getLogger("warn");
const errorLogger = log4js.getLogger("error");

const numCPUs = require("os").cpus().length;

function getRoot(req, res) {
    logger.info('Ingreso a /')
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('pages/main', {
            user: req.user
        })
    }

}

function getLogin(req, res) {
    logger.info('Ingreso a /login')
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('pages/login');
    }
}

function getSignup(req, res) {
    logger.info('Ingreso a /signup')
    res.render('pages/signup')

}

function postLogin(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('pages/login');
    }
}

function postSignup(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('pages/login');
    }
}

function getProfile(req, res) {
    logger.info('Ingreso a /profile')
    if (req.isAuthenticated()) {
        let user = req.user;
        console.log(user);
        res.render('pages/profileUser', { user: user })
    } else {
        res.redirect('login')
    }
}

function getFailLogin(req, res) {
    errorLogger.error('Ingreso a /failLogin')
    console.log('error de login');
    res.render('pages/login-error', {})
}

function getFailSignup(req, res) {
    errorLogger.error('Ingreso a /failSignup')
    console.log('error de signup {aca?]');
    res.render('pages/signup-error', {})
}

function getLogout(req, res) {
    logger.info('Ingreso a /logout')
    req.logout((err) => {
        if (!err) {
            res.render('pages/main', { user: req.user })
        }
    });
}

function failRoute(req, res) {
    warnLogger.warn('Ingreso a ruta no existente')
    res.status(404).render('pages/routing-error', {});
}

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("pages/login");
    }
}

function getTwitterPage(req, res) {
    res.render('twitterPage');
}

function getInfo(req, res) {
    logger.info('Ingreso a /info')
    const args = parseArgs(process.argv.slice(2))
    const exec = process.execPath;
    const os = process.platform;
    const rss = process.memoryUsage().rss;
    const version = process.version
    const dir = process.cwd();
    const pid = process.pid;

    const datos = {
        args: args,
        os: os,
        node: version,
        rss: rss,
        path: exec,
        Id_Proceso: pid,
        carpeta: dir,
        cpu: numCPUs
    }
    res.render('pages/info', { datos: datos });
}



async function getCarrito(req, res) {
    //aca agregar ffuncion crear carrito
    let carritoSaved = {
        nombre: 'carrit1',
        fecha: new Date(),
        productos: [{ nombre: 'heladera' }, { nombre: 'heladera2' }, { nombre: 'heladera3' }]
    };
    carrito.save(carritoSaved)
    let carritoLista = await carrito.getAll();
    console.log(carritoLista);
    res.render('pages/carrito', { carrito: carritoLista, user: req.user });
}

async function getProductos(req, res) {

    let lista = await producto.getAll()

    res.render('pages/productos', { productos: lista, listExists: true, user: req.user });
}
function postProducto(req, res) {
  producto.save(req.body);
    res.redirect('/productos');
}

async function addProductoCarrito(req, res) {
    //let id = req.params.id;
    let id = '6332860f90b6ff2b99a1b90c' ;
    //console.log(req.params.producto);
    carrito.addProductoCarrito(id, req.params.producto)
  
   res.redirect("/productos");
}


module.exports = {
    getRoot,
    getLogin,
    postLogin,
    getFailLogin,
    getLogout,
    failRoute,
    getSignup,
    postSignup,
    getFailSignup,
    checkAuthentication,
    getProfile,
    getTwitterPage,
    getInfo,
    getProductos,
    getCarrito,
    addProductoCarrito,
    postProducto,

}
