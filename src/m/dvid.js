const { v4 } = require('uuid');
module.exports = () => v4().replace(/-/g, '').toUpperCase();
