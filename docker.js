const {exec} = require('child_process');
async function generateCommand(i){//actual iteration
    if(i===0){
         command = 'docker run --name db0 -p7474:7474 -p7687:7687 -d -v /db0/data:/data -v /db0/logs:/logs -v /db0/conf:/conf  --env NEO4J_AUTH=none neo4j';
    }else{
        command = `docker run --name db${i} -p${3000 + 3*(i-1) + 1}:7474 -p${3000 + 3*(i-1) + 2}:7473 -p${3000 + 3*(i-1) + 3}:7687 -d -v /db${i}/data:/data -v /db${i}/logs:/logs -v /db${i}/conf:/conf --env NEO4J_AUTH=none neo4j`;
    }
     exec(command,( error, stdout, stderr) =>{
        if(error){
            console.log(`error: ${error.message}`);
        }
        if(stderr){
            console.log(`error: ${stderr}`);
        }
        console.log(`stdout ${stdout}`);
    });
};
module.exports = generateCommand;