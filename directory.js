const fs = require('fs');
exports.func = (idNode) => {
  try {
    const particion = fs
      .readFileSync(__dirname + '/uploads/partition.txt')
      .toString()
      .split('\n');
    for (let index = 0; index < array.length; index++) {
      const element = array[index];
    }
  } catch (err) {
    console.log('el archivo de particiones no existe.');
  }
};
