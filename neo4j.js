const neo4j = require('neo4j-driver');
async function createPartition(ip, array){
    const driver = neo4j.driver(ip/*'bolt://localhost:3003' -3006 - 3009*/, neo4j.auth.basic('', ''));
    const session = driver.session();
    await session.run('UNWIND $r AS map create(n) SET n = map',{r: array}).then(function (result) {
        console.log(result)
    });
    await session.close();
}
module.exports = createPartition