const neo4j = require('neo4j-driver');
async function createPartition(ip, array){
    const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
    const session = driver.session();
    await session.run('UNWIND $r AS map create(n) SET n = map',{r: array}).then(function (result) {
        console.log(result)
        
    });
    await session.close();
};
async function createRelationship(ip, id, array){//['1','2']
    console.log(ip);
    console.log(id);
    console.log(array);
    console.log('---------------------------------------')
    /*const driver = neo4j.driver(ip, neo4j.auth.basic('', ''));
    const session = driver.session();
    await session.run('MATCH (n), (m) WHERE n.id IN $array AND m.id = $id CREATE (m)-[r:connected]->(n) CREATE (n)-[r2:connected]-> (m)  return r', {array: array, id: id}).then(function (result) {
        console.log(result)
    });
    await session.close();*/
};
module.exports = {
    createPartition, createRelationship
}