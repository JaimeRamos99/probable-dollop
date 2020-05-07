const fs = require('fs');
const nodo = require('./utils/nodo');
const neo4j = require('./neo4j');
const docker = require('./docker');

async function containers(){
    const particion = fs.readFileSync(__dirname + '/uploads/particion.txt').toString().split("\n");
    let mayor;
    for (let index = 0; index < particion.length; index++) {
        let entero = parseInt(particion[index], 10);
        if(index === 0){
            mayor = entero;
        }else{
            if(entero>mayor){
                mayor = entero;
            }
        }
    }
    const inicial = fs.readFileSync(__dirname + '/uploads/inicial.txt').toString().split("\n");
    inicial.shift()
    matriz = [];
    for (let index = 0; index < inicial.length; index++) {
        matriz[index] = inicial[index].split(' ');
    }
    let logger = fs.createWriteStream(__dirname + '/uploads/aristas.txt',{flags: 'a'});

    for (let index = 0; index < matriz.length; index++) {
        let element = matriz[index];
        element.shift()
        for (let index2 = 0; index2 < element.length; index2++) {
            if(particion[index] === particion[parseInt(element[index2])-1]){
                logger.write(element[index2] + ' ');
            }
        }
        if(index<matriz.length-1){
            logger.write('\n');
        }
    }
    logger.end();
    /*for (let index = -1; index <= mayor; index++) {
        if(index < 0){//el grafo completo
             docker(0)
        }else{//el grafo por partici
            docker(index+1);
        }   
    } */ 
}
async function insertgraphs(){
    let nodos = [];
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
            let filtrados = nodos.filter(obj => {
                return obj
            });
             await neo4j.createPartition('bolt://localhost:7687', filtrados);
        }else{//el grafo por partici
            let filtrados = nodos.filter(obj => {
                return obj.particion == index
            });
            await neo4j.createPartition(`bolt://localhost:300${3*index+3}`, filtrados)
        }
        
    }
    
}
async function relationships(){//-1 es el grafo completo, 0 es la particiòn 0
    let m = [];
    //para una misma particiòn, itera sobre cada nodi en ella y crea sus aristas
    let aristas = fs.readFileSync(__dirname + '/uploads/aristas.txt').toString().split("\n");
    let particion = fs.readFileSync(__dirname + '/uploads/particion.txt').toString().split("\n");
    let mayor;
    for (let index = 0; index < particion.length; index++) {
        let entero = parseInt(particion[index], 10);
        if(index === 0){
            mayor = entero;
        }else{
            if(entero>mayor){
                mayor = entero;
            }
        }
    };
    for (let particionIndex = -1; particionIndex <= mayor; particionIndex++) {
        if(particionIndex < 0){
            let ip = 'bolt://localhost:7687';
        }else{
            let ip = `bolt://localhost:300${3 * particionIndex + 3}`;
            for (let index = 0; index < aristas.length; index++) {
                if(parseInt(particion[index]) === particionIndex){
                    await neo4j.createRelationship(ip, index + 1, aristas[index].trim().split(' '));
                };
            };
        };
    }

};
module.exports = {
    containers,
    insertgraphs,
    relationships
}