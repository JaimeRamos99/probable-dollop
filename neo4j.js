const neo4j = require('neo4j-driver');
//never forget that connections are in bolt mode
const driver1 = neo4j.driver(`bolt://localhost:${3003}`, neo4j.auth.basic('', ''));
const driver2 = neo4j.driver(`bolt://localhost:${3006}`, neo4j.auth.basic('', ''));
const driver3 = neo4j.driver(`bolt://localhost:${3009}`, neo4j.auth.basic('', ''));

async function retreiveNode(ip, idNode) {
  let sessionN = null;
  if (ip === `bolt://localhost:${3003}`) {
    sessionN = driver1.session();
  } else {
    if (ip === `bolt://localhost:${3006}`) {
      sessionN = driver2.session();
    } else {
      if (ip === `bolt://localhost:${3009}`) {
        sessionN = driver3.session();
      }
    }
  }
  try {
    if(sessionN){
    await sessionN
      .run('MATCH (n) WHERE n.id = $id return n', { id: idNode })
      .then(function (result) {
        result.records.forEach(function (record) {
        //console.log(record._fields[0].properties);
      });
    });
    }
  } catch (e) {
    console.log(e)
  }
  finally{
    if(sessionN){
      await sessionN.close();
    }
  }
}
async function createPartition(ip, array) {
  const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
  const session = driver.session();
  await session
    .run('UNWIND $r AS map create(n) SET n = map', { r: array })
    .then(function (result) { });
  await session.close();
}
async function createRelationship(ip, id, array) {
  //['1','2']
  let newArray = [];
  for (let index = 0; index < array.length; index++) {
    newArray[index] = parseInt(array[index]);
  }
  const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
  const session = driver.session();
  await session
    .run(
      'MATCH (n), (m) WHERE n.id IN $array AND m.id = $id CREATE (m)-[r:connected]->(n) return r',
      { array: newArray, id: id }
    )
    .then(function (result) { });
  await session.close();
  newArray = [];
}

module.exports = {
  createPartition,
  createRelationship,
  retreiveNode,
};
