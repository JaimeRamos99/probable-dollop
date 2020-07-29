const fs = require('fs');
const nodo = require('./utils/nodo');
const neo4j = require('./neo4j');
const docker = require('./docker');
let distribucion = new Map();
async function containers() {
  const particion = fs
    .readFileSync(__dirname + '/uploads/partition.txt')
    .toString()
    .split('\n');
  let mayor;
  for (let index = 0; index < particion.length; index++) {
    //buscando el número de particiones, este número se almacena en la variable "mayor"
    let entero = parseInt(particion[index], 10);

    if (index === 0) {
      mayor = entero;
    } else {
      if (entero > mayor) {
        mayor = entero;
      }
    }
  }
  const inicial = fs
    .readFileSync(__dirname + '/uploads/initial.txt')
    .toString()
    .split('\n');
  let firstLine = inicial.shift(); //saco la primera linea, porque esa indica las dimensiones del grapo y su tipo
  let graphType = firstLine.split(' ')[2];
  if (graphType === undefined) {
    graphType = 0;
  }
  matriz = [];
  for (let index = 0; index < inicial.length; index++) {
    //en la matriz, en cada fila se almacenan los nodos al que el nodo en cuestión tiene enlaces, el id del nodo en cuestión es el número de fila
    if (inicial[index]) {
      matriz[index] = inicial[index].split(' ');
    }
  }
  let logger = fs.createWriteStream(__dirname + '/uploads/aristas.txt', {
    flags: 'a',
  });

  for (let index = 0; index < matriz.length; index++) {
    //en este ciclo se crea el archivo aristas.txt que a cada nodo le indica las aristas que están dentro de su misma partición
    let element = matriz[index];
    if (graphType !== 0) {
      element.shift(); //el primer valor de cada fila no se usa porque es el peso
    }
    for (let index2 = 0; index2 < element.length; index2++) {
      if (particion[index] === particion[parseInt(element[index2]) - 1]) {
        logger.write(element[index2] + ' ');
      }
    }
    if (index < matriz.length - 1) {
      logger.write('\n');
    }
  }
  logger.end();

  for (let index = -1; index <= mayor; index++) {
    //creo cada uno de los contenedores dónde vivirá o la partición o el grafo completo
    if (index < 0) {
      //el grafo completo
      docker(0);
    } else {
      //el grafo por partición
      docker(index + 1);
    }
  }
  setTimeout(async () => {
    await insertgraphs();
  }, 80000);
}
async function insertgraphs() {
  let nodos = [];
  const particion = fs
    .readFileSync(__dirname + '/uploads/partition.txt')
    .toString()
    .split('\n');
  let mayor;
  for (let index = 0; index < particion.length; index++) {
    let entero = parseInt(particion[index], 10);
    if (index === 0) {
      mayor = entero;
    } else {
      if (entero > mayor) {
        mayor = entero;
      }
    }
    distribucion.set(index + 1, particion[index]);
    if (particion[index]) {
      nodos[index] = new nodo(index + 1, '', particion[index]);
    }
  }
  for (let index = -1; index <= mayor; index++) {
    if (index < 0) {
      //el grafo completo
      let filtrados = nodos.filter((obj) => {
        return obj;
      });
      await neo4j.createPartition('bolt://localhost:7687', filtrados);
    } else {
      //el grafo por partición
      let filtrados = nodos.filter((obj) => {
        return obj.particion == index;
      });
      await neo4j.createPartition(
        `bolt://localhost:${3000 + 3 * index + 3}`,
        filtrados
      );
    }
  }
  setTimeout(async () => {
    await relationships();
  }, 80000);
}
async function relationships() {
  //-1 es el grafo completo, 0 es la particiòn 0
  //para una misma partición, itera sobre cada nodi en ella y crea sus aristas
  let aristas = fs
    .readFileSync(__dirname + '/uploads/aristas.txt')
    .toString()
    .split('\n');
  let particion = fs
    .readFileSync(__dirname + '/uploads/partition.txt')
    .toString()
    .split('\n');
  let mayor;
  //buscando el número de particiones, este número se almacena en la variable "mayor"
  for (let index = 0; index < particion.length; index++) {
    let entero = parseInt(particion[index], 10);
    if (index === 0) {
      mayor = entero;
    } else {
      if (entero > mayor) {
        mayor = entero;
      }
    }
  }
  for (let particionIndex = -1; particionIndex <= mayor; particionIndex++) {
    if (particionIndex < 0) {
      // le mando todo el grafo, porque en este contenedor estará todo el grafo completo
      let ip = 'bolt://localhost:7687';
      for (let index = 0; index < aristas.length; index++) {
        await neo4j.createRelationship(
          ip,
          index + 1,
          aristas[index].trim().split(' ')
        );
      }
    } else {
      // para las particiones
      let ip = `bolt://localhost:${3000 + 3 * particionIndex + 3}`;
      for (let index = 0; index < aristas.length; index++) {
        //verifico que sea la partición correspondiente
        if (parseInt(particion[index]) === particionIndex) {
          await neo4j.createRelationship(
            ip,
            index + 1,
            aristas[index].trim().split(' ')
          );
        }
      }
    }
  }
}
async function query(idNode) {
  if (distribucion.size === 0) {
    const particion = fs
      .readFileSync(__dirname + '/uploads/partition.txt')
      .toString()
      .split('\n');
    for (let index = 0; index < particion.length; index++) {
      distribucion.set(index + 1, particion[index]);
    }
  }
  let partition = distribucion.get(idNode);
  return partition;
}
//controller for query
module.exports = {
  containers,
  query,
};
