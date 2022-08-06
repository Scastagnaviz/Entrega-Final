const parseArgs = require('minimist');
const { fork } = require('child_process');
const log4js = require("log4js");




const fs = require('fs'); 


const {carritoDaoMongo} = require('../daos/carritos/carritoDaoMongo')
const {productoDaoMongo} = require('../daos/productos/productoDaoMongo');

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
        res.render('main')
    }

}

function getLogin(req, res) {
    logger.info('Ingreso a /login')
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('login');
    }
}

function getSignup(req, res) {
    logger.info('Ingreso a /signup')
    res.render('signup')

}

function postLogin(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('login');
    }
}

function postSignup(req, res) {
    if (req.isAuthenticated()) {
        res.redirect('profile')
    }
    else {
        res.render('login');
    }
}

function getProfile(req, res) {
    logger.info('Ingreso a /profile')
    if (req.isAuthenticated()) {
        let user = req.user;
        res.render('profileUser', { user: user, isUser: true })
    } else {
        res.redirect('login')
    }
}

function getFailLogin(req, res) {
    errorLogger.error('Ingreso a /failLogin')
    console.log('error de login');
    res.render('login-error', {})
}

function getFailSignup(req, res) {
    errorLogger.error('Ingreso a /failSignup')
    console.log('error de signup {aca?]');
    res.render('signup-error', {})
}

function getLogout(req, res) {
    logger.info('Ingreso a /logout')
    req.logout((err) => {
        if (!err) {
            res.render('main')
        }
    });
}

function failRoute(req, res) {
    warnLogger.warn('Ingreso a ruta no existente')
    res.status(404).render('routing-error', {});
}

function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/login");
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
    res.render('info', { datos: datos });
}

function getRandoms(req, res) {
    let numeros = 0;
    if (req.query.n) {
        numeros = req.query.n;
    } else { numeros = 100000000 }
    app.on('request', (req, res) => {
        let { url } = req;


        const randoms = fork('./randoms.js')
        randoms.send('start');
        randoms.on('message', sum => {
            res.render('randoms', { randoms: sum });
        })

    })


}

async function getCarrito(req, res) {
    let carritoSaved={
        nombre:'carrit1',
        fecha: new Date().toLocaleString(),
       productos: [{nombre:'heladera'}, {nombre:'heladera2'}, {nombre:'heladera3'}]};
    carrito.save(carritoSaved)
    let carritoLista = await carrito.getAll();
    res.render('carrito',{carrito:carritoLista});
}

async function getProductos(req, res){
 producto.save({nombre:"Heladera",precio:123,url: "notFound",fecha:new Date()})
    let lista= await producto.getAll()
   // console.log(lista);
    //res.send(lista)
   res.render('productos',{productos:lista,listExists:true});
}

async function addProductoCarrito(req, res){
    let id= req.params.id; 
    
            let obj = producto.getProdByiD(idP);
            carrito.AddProdCarrito(id,obj)
            res.json({
                result: 'Producto agregado', 
                Producto : obj})
    
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
    getRandoms,
    getProductos,
    getCarrito,
    addProductoCarrito
}
