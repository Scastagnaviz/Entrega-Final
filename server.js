const session = require("express-session");
const express = require("express");
const cluster = require("cluster");
const handlebars = require("express-handlebars");
const routes = require("./src/routes/routes");
const UserModel = require("./src/models/usuarios");

const { fork } = require('child_process');

const fs = require('fs');  


const nodemailer = require('nodemailer')
const TEST_MAIL ="sienna.purdy@ethereal.email"
const twilio = require('twilio');


//const TwitterUserModel = require("./src/models/twitterUsuario");
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
//const TwitterStrategy = require("passport-twitter").Strategy;
//const bCrypt = require("bcrypt");
const mongoose = require("mongoose");
//const twitterUsuario = require("./src/models/twitterUsuario");

const parseArgs = require('minimist');
const compression = require('compression');
const { log } = require("console");
const { send } = require("process");

const app = express();
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



async function sendMail(obj){
    const mail = {
        from: 'Servidor de eccomerce node.js'+obj,
        to:TEST_MAIL,
        subject: 'Nuevo usuario',
        html:'<h3 style="color: blue"> Mail test desde node</h3>',
    
    }
try {
    const info = await transporter.sendMail(mail)
    console.log(info);
} catch (error) {
    console.log(error);
}
}

////////////
const accountSid = 'AC80e7be066f54540f05a1e56fa44c69b6';
const authToken = 'd0c12bf57637596411040ae2e23c7157';

const client = twilio(accountSid, authToken)

const msj={
    body: 'mensajes desde node',
    from: 'whatsapp:+14155238886',
    to: 'whatsapp:+5493416721758'
}


async function sendWhatsApp(obj){
    const msj={
        body: 'mensajes desde node '+ obj,
        from: 'whatsapp:+14155238886',
        to: 'whatsapp:+5493416721758',
    }
    try {
        await client.messages.create(msj)
        console.log('Created message');
    } catch (error) {
        console.log(error);
    }

}
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


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

app.engine(
    "hbs",
    handlebars.engine({
        extname: ".hbs",
        defaultLayout: "index.hbs",
        layoutsDir: __dirname + "/src/views/layouts",
        partialsDir: __dirname + "/src/views/partials/",
        runtimeOptions: {
            allowProtoPropertiesByDefault: true,
            allowProtoMethodsByDefault: true,
        },
    })
);

app.set("view engine", "hbs");
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
    new LocalStrategy({ passReqToCallback: true }, (req, username, password, done) => {
        UserModel.findOne({ username: username }, (err, user) => {
            if (err) {
                console.log("Error de signup" + err);
                return done(err);
            }
            if (user) {
                console.log("Usuario ya existente");
                return done(null, false);
            }
            console.log(req.body);

            const newUser = {
                username: username,
                password: createHash(password),
            };
            console.log(newUser);

            UserModel.create(newUser, (err, userWithId) => {
                if (err) {
                    console.log("Error in Saving user: " + err);
                    return done(err);
                }
                console.log(userWithId);
                console.log("Registro Existoso");

                const mailSignup = {
                    from: 'Servidor de eccomerce node.js',
                    to:TEST_MAIL,
                    subject: 'Nuevo usuario',
                    html:'<h3 style="color: blue"> Registro exitoso desde node</h3>',
                
                }
                sendMail(mailSignup)
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

app.use(express.json());
app.use(express.urlencoded({extended:true}))

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



app.get("/random", (req, res) => {
    let numeros = 0;

    if (req.query.cant == undefined) {
        numeros = 100000000;
    } else { numeros = req.query.cant; }

const randoms= require('./randoms');
randoms.randoms(numeros);
res.end(numeros.toString());
    //const randoms = fork('./randoms.js')
    // randoms.send(numeros);
    // randoms.on('message', nums => {
    //     res.end(` ${nums}`)
})

app.get("/sendWhatsApp", (req, res) =>{
    let obj = {producto:'Heladera'}
    sendWhatsApp(obj)
    sendMail(obj);
   console.log('pedido realido con exito!');
    res.redirect("/profile");
})

//////////////////////


routerP.get('/', routes.getProductos);
routerC.get('/', routes.getCarrito);
routerP.get('/addTocarrito', routes.addProductoCarrito);
  
//  routerP.get('/:id',async(req,res)=> {
//     let id= req.params.id;
//         if ( await producto.getById(id)==null) {
//             res.json({
//                 error : 'Producto no encontrado'})
              
//         } else {
//             let found = await producto.getById(id);
//             res.json({
//                 result: 'Este es el producto', 
//                 Producto : found})
//         } 
//     });

//     routerP.post('/',async (req,res)=>{
//             let obj= req.body;
//             // crep que no me esta tomando el req.body
//             //les saque los required porque me crasheaba
//                 await producto.save(obj);
//                 res.json({ 
//                     result : 'Producto guardado',
//                     body:req.body,
//                         });
//         } );

//     routerP.put('/:id',async (req,res)=>{
//                 let id= req.params.id; 
//                 await producto.update(id,req.body);
//                 res.json({
//                     body:req.body,
//                     result:'Edit exitoso',
//                     id : req.params.id
//             })
//         });
//     routerP.delete('/:id',(req,res)=>{
         
//             let id= req.params.id; 
//             producto.delete(id);
//             res.json({
//             result:'Producto eliminado',
//             id : req.params.id,
//             })
//     });

////////////////////////////


         /*/
    
         routerC.get('/:id',async(req,res)=> {
            let id= req.params.id;
                if ( await carrito.getById(id)==null) {
                    res.json({
                        error : 'Carrito no encontrado'})
                      
                } else {
                    let found = await carrito.getById(id);
                    res.json({
                        result: 'Este es el carrito', 
                        Producto : found})
                } 
            });
    
            routerC.post('/',async (req,res)=>{
                    let obj= req.body;

                        await carrito.save(obj);
                        res.json({ 
                            result : 'carrito guardado',
                            body:req.body,
                                });
                } );
    
            routerC.put('/:id',async (req,res)=>{
                        let id= req.params.id; 
                        await carrito.update(id,req.body);
                        res.json({
                            body:req.body,
                            result:'Edit exitoso',
                            id : req.params.id
                    })
                });

            routerC.delete('/:id',(req,res)=>{
                 
                    let id= req.params.id; 
                    carrito.delete(id);
                    res.json({
                    result:'Carrito eliminado',
                    id : req.params.id,
                    })
            });

/*/





///////////////////////
app.get("*", routes.failRoute);




const options = { default: { puerto: "8080", modo: "FORK" }, alias: { m: 'modo', p: 'puerto', _: 'otros' } }



const args = parseArgs(process.argv.slice(2), options);
const PORT = args.puerto || 8080;
//const PORT = process.env.PORT || 8080;
console.log(PORT);
console.log(args.modo);
if (args.modo === 'FORK') {
    const server = app.listen(PORT, () => {
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
        let server = app.listen(PORT, (req, res) => {
            console.log("Server on port " + PORT + ' cluster ');
            //  console.log(cluster.process.id);

        });
    }
}