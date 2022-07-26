// process.on('message', msg => {
//     console.log(`Mensaje del proceso padre: ${msg}`);
   
//     let numeros = []
//     for (let i = 0; i < msg; i++) {
    
//         let num = Math.floor(Math.random() * 100)
    
//         let check = numeros.find(check => check.numero == num);
     
//         if (check == undefined) {
//             numeros.push({ numero: num, veces: 1 });
//         } else {
//             let indice = numeros.findIndex(found => found.numero == num)
//             numeros[indice].veces++;
    
//         }
    
//     }
//     process.send(JSON.stringify( numeros))
// })

function randoms(tot){
    let numeros = []
    for (let i = 0; i <tot; i++) {
    
        let num = Math.floor(Math.random() * 100)
    
        let check = numeros.find(check => check.numero == num);
     
        if (check == undefined) {
            numeros.push({ numero: num, veces: 1 });
        } else {
            let indice = numeros.findIndex(found => found.numero == num)
            numeros[indice].veces++;
    
        }
    
    }
    return JSON.stringify( numeros)
}
 module.exports = {randoms}
//console.log(numeros);