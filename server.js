const session = require("express-session");
const express = require("express");
const cluster = require("cluster");

const routes = require("./src/routes/routes");
const UserModel = require("./src/models/usuarios");

const { fork } = require('child_process');

const fs = require('fs');  


const {Server: IOServer} = require('socket.io');
const {Server: HttpServer} = require('http');

const nodemailer = require('nodemailer')

const twilio = require('twilio');



//const mongoStore = require('connect-mongo')
const { TIEMPO_EXPIRACION, secret } = require("./src/config/globals");
const { validatePass } = require("./src/utils/passValidator");
const { createHash } = require("./src/utils/hashGenerator");

const { isValidObjectId, connect } = require("mongoose");
const dotenv = require('dotenv')
dotenv.config();
const passport = require("passport");
const numCPUs = require("os").cpus().length;
const LocalStrategy = require("passport-local").Strategy;

//const bCrypt = require("bcrypt");
const mongoose = require("mongoose");


const parseArgs = require('minimist');
const compression = require('compression');
const { log } = require("console");
const { send } = require("process");
const { productoDaoMongo } = require("./src/daos/productos/productoDaoMongo");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

////para el chat
messages=[]
app.use(express.static('./src/utils'))
const httpServer = new HttpServer(app)
const io = new IOServer (httpServer)
///////////////////////////////////////////
const {Router} = express;
const routerP= Router();
const routerC= Router();
app.use('/productos', routerP);
app.use('/carrito', routerC);

///////////////////////////////////////////////////////

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'sienna.purdy@ethereal.email',
        pass: 'jmvVRa4zKGAuzNgnyZ'
    }
});

//esto puede ir en services

async function sendMail(obj,mail){
    let send = {
        from: 'Servidor de eccomerce node.js',
        to:mail,
        subject: 'Nuevo usuario' +obj,
        html:'<h3 style="color: blue"> Mail test desde node</h3>',
    
    }
try {
    const info = await transporter.sendMail(send)
    console.log(info);
} catch (error) {
    console.log(error);
}
}

////////////


//const client = twilio(accountSid, authToken)


/////////////
app.use(compression());


app.use(
    session({
        secret: 'san',
        cookie: {
            httpOnly: false,
            secure: false,
            maxAge: parseInt(TIEMPO_EXPIRACION),
        },
        rolling: true,
        resave: true,
        saveUninitialized: true,
    })
);




app.use(passport.initialize());
app.use(passport.session());



app.set("view engine", "ejs");
app.set("views", "./src/views");
app.use(express.static(__dirname + "/public"));

passport.use(
    "login",
    new LocalStrategy((username, password, done) => {
        UserModel.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err);
            }
            if (!user) {
                console.log("User not found with username" + username);
                return done(null, false);
            }
            if (!validatePass(user, password)) {
                console.log("invalid password");
                return done, false;
            }

            return done(null, user);
        });
    })
);

passport.use(
    "signup",
    new LocalStrategy({ passReqToCallback: true }, (req, username,password, done) => {
        UserModel.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log("Error de signup" + err);
                return done(err);
            }
            if (user) {
                console.log("Usuario ya existente");
                return done(null, false);
            }
          

            const newUser = {
                username: req.body.username,
                mail:req.body.mail,
                phone: req.body.phone,
                password: createHash(req.body.password),
            };
            console.log(newUser);

            UserModel.create(newUser, (err, userWithId) => {
                if (err) {
                    console.log("Error in Saving user: " + err);
                    return done(err);
                }
                console.log(userWithId);
                console.log("Registro Existoso");

                sendMail(mailSignup,req.body.email);
                return done(null, userWithId);
            });
        });
    })
);

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser((id, done) => {
    UserModel.findById(id, done);
});



///////////////////////////////////////////


app.get("/", routes.getRoot);
////
app.get("/login", routes.getLogin);
app.post(
    "/login",
    passport.authenticate("login", { failureRedirect: "/faillogin" }),
    routes.postLogin
);
app.get("/faillogin", routes.getFailLogin);

////

app.get('/signup', routes.getSignup);
app.post('/signup', passport.authenticate('signup',
    { failureRedirect: "/failsignup" }
), routes.postSignup);

app.get('/failsignup', routes.getFailSignup);

app.get("/logout", routes.getLogout);
////
app.get("/profile", routes.getProfile);

app.get("/ruta-protegida", routes.checkAuthentication, (req, res) => {

    res.render("protected");
});

app.get("/info", routes.getInfo);



const { mensajesDaoMongo } = require('../eccomerce/src/daos/mensajes/mensajesDaoMongo');
const mensajesMongo = new mensajesDaoMongo()
app.get("/chat",(req,res) =>{
    res.render('pages/chat')
    io.on('connection', function (socket) {
        console.log('Un cliente se ha conectado al chat');

        socket.emit('messages', messages);

        socket.on('new-message', data => {
 
            messages.push(data);
            mensajesMongo.save(data)
            io.sockets.emit('messages', messages);
        });
    }       )   
});



//////////////////////




routerP.get('/', routes.getProductos);

routerP.get('/addProd' , (req,res)=>{res.render('pages/addProd')})

routerP.post('/addProducto',routes.postProducto);



routerC.get('/', routes.getCarrito);
routerP.get('/addToCarrito/:producto', routes.addProductoCarrito);
  



///////////////////////

app.get("*", routes.failRoute);




const options = { default: { puerto: "8080", modo: "FORK" }, alias: { m: 'modo', p: 'puerto', _: 'otros' } }



const args = parseArgs(process.argv.slice(2), options);
const PORT = args.puerto || 8080;
console.log(PORT);


if (args.modo === 'FORK') {
    const server = httpServer.listen(PORT, () => {
        console.log("Server on port " + PORT + ' modo ' + args.modo);
    });

    server.on("error", (error) => console.log("Error en el servidor"+error));
} else if (args.modo === 'CLUSTER') {
    if (cluster.isMaster) {
        console.log('PID Master ' + process.pid);
        for (let index = 0; index < numCPUs; index++) {
            cluster.fork();

        }
        cluster.on('exit', worker => {
            console.log('PID Worker died');
        })
    }
    else {
        let server = httpServer.listen(PORT, (req, res) => {
            console.log("Server on port " + PORT + ' cluster ');

        });
    }
}