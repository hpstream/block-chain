var Table = require('cli-table');
var Table = require('cli-table');
var table = new Table();

var Table = require('cli-table');



function formatLog(data) {
  if (!Array.isArray(data)) {
    data = [data]
  }

  // instantiate
  let keys = Object.keys(data[0])
  let table = new Table({
    head: keys,
    colWidths: new Array(keys.length).fill(15)
  });

  let res = data.map(v => {
    return keys.map(h => JSON.stringify(v[h], null, 1))
  });
  // console.log(keys)
  table.push(...res);

  console.log(table.toString());
}
module.exports = {
  formatLog
}