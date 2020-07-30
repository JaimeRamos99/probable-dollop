'use strict';
const express = require('express');
const bodyParser = require('body-parser');
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
app.listen(8080, () => {
  console.log('API escuchando en puerto 8080');
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
  }
  await neo4j.retreiveNode(ip, idNode);
  if (idNode === 1001) {
    let t1 = now();
    console.log(`${(t1 - t0).toFixed(5)} milliseconds.`);
  }
  res.status(200).send('ok');
});
