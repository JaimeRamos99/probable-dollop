const fs = require('fs');
const nodo = require('./utils/nodo');
const neo4j = require('./neo4j');
const docker = require('./docker');

async function particiones(){
    const particion = fs.readFileSync(__dirname + '/uploads/particion.txt').toString().split("\n");
    let mayor;
    for (let index = 0; index < particion.length; index++) {
        let entero = parseInt(particion[index],10);
        if(index === 0){
            mayor = entero;
        }else{
            if(entero>mayor){
                mayor = entero;
            }
        }
    }
for (let index = -1; index <= mayor; index++) {
    if(index < 0){//el grafo completo
             docker(0)
    }else{//el grafo por partici
            docker(index+1);
    }   
}  
}
async function insertgraphs(){
    let nodos = [];
    //const inicial = fs.readFileSync(__dirname + '/uploads/inicial.txt').toString().split("\n");
    const particion = fs.readFileSync(__dirname + '/uploads/particion.txt').toString().split("\n");
    let mayor;
    for (let index = 0; index < particion.length; index++) {
        let entero = parseInt(particion[index],10);
        if(index === 0){
            mayor = entero;
        }else{
            if(entero>mayor){
                mayor = entero;
            }
        }
       nodos[index] = new nodo(index, "", particion[index]);
    }
    for (let index = -1; index <= mayor; index++) {
        if(index < 0){//el grafo completo
            let filtrados =nodos.filter(obj => {
                return obj
            });
             await neo4j('bolt://localhost:7687', filtrados);
        }else{//el grafo por partici
            let filtrados =nodos.filter(obj => {
                return obj.particion == index
            });
            await neo4j(`bolt://localhost:300${3*index+3}`, filtrados);
        }
        
    }
    
}
module.exports = {
    particiones,
    insertgraphs
}