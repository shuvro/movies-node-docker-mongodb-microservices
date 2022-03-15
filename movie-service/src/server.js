const app = require('./index')

const server = app.listen(3000, () => {
  console.log(`movie svc running at port 3000`);
});

module.exports = server
