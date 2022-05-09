const vorpal = require('vorpal')();
vorpal.localStorage('iTunes-remote');
// vorpal.localStorage.setItem('foo', 'bar');
console.log(vorpal.localStorage.getItem('foo'))