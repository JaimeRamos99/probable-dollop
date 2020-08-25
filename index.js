'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const app = express();
const ctrl = require('./controller');
const neo4j = require('./neo4j');
const now = require('performance-now');
let flag = false;
let t0;
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, './uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + '');
  },
});

const upload = multer({ storage: storage });
app.listen(8010, () => {
  console.log('API escuchando en puerto 8010');
});

app.use(router);
app.use(bodyParser.json());

router.post(
  '/server/createContainers',
  upload.fields([
    { name: 'initial', maxCount: 1 },
    { name: 'partition', maxCount: 1 },
  ]),
  async function (req, res) {
    //receive the graph (.txt's)
    let r = await ctrl.containers();
    res.status(200).send('ok');
  }
);

router.get('/query/:id', async function (req, res) {
  let idNode = parseInt(req.params.id);
  let partition = await ctrl.query(idNode);
  let ip = `bolt://localhost:${3000 + 3 * partition + 3}`;
  if (!flag) {
    flag = true;
    t0 = now();
    exec('docker stats > oneThousand15k.txt', function (error, stdout, stderr) {
      if (error) {
        console.log(`error: ${error.message}`);
      }
      if (stderr) {
        console.log(`error: ${stderr}`);
      }
    });
  }

  await neo4j.retreiveNode(ip, idNode);
  if (idNode === 1001) {
    let t1 = now();
    flag = false;
    console.log(`${(t1 - t0).toFixed(5)} milliseconds.`);
    process.exit(1);
  }
  res.status(200).send('ok');
});
/*1000 queries para el grafo de 5k demoró 2201.14301 milliseconds.
  5000 queries para el grafo de 5k demoró 5994.85929 milliseconds.

*/
//el 5k al final o sus semenjantes hace referencia la tamaño del grafo