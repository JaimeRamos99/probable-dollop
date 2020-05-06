"use strict";
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const router = express.Router();
const app = express();
const ctrl = require('./controller');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname + '')
    }
  });

const upload = multer({ storage : storage});
app.listen(8080, ()=>{
    console.log('API escuchando en puerto 8080')
});

app.use(router);
app.use(bodyParser);

router.post('/api/createContainers', upload.fields([{ name: 'initial', maxCount: 1 },{ name: 'partition', maxCount: 1 }]), async function(req, res){ //receive the graph (.txt's)
  let r = await ctrl.particiones();
  res.send('ok');
});
router.post('/api/createPartitions', async function(req, res){ //receive the graph (.txt's)
  let r = await ctrl.insertgraphs();
  res.send('ok');
});
router.get('/api/createRelations',async function(req, res){ //receive the graph (.txt's)
 
});
router.get('/api/', async function(req, res){ //receive a query 
    console.log('se conectaron');
});