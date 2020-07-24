const neo4j = require('neo4j-driver');
//never forget that connections are in bolt mode
async function createPartition(ip, array) {
  const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
  const session = driver.session();
  await session
    .run('UNWIND $r AS map create(n) SET n = map', { r: array })
    .then(function (result) {});
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
    .then(function (result) {});
  await session.close();
  newArray = [];
}
async function retreiveNode(ip, idNode) {
  const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
  const session = driver.session();
  await session
    .run('MATCH (n) WHERE n.id = $id return n', { id: idNode })
    .then(function (result) {
      result.records.forEach(function (record) {
        console.log(record._fields[0].properties);
      });
    });
  await session.close();
}
module.exports = {
  createPartition,
  createRelationship,
  retreiveNode,
};
