// Allows us to use ES6 in our migrations and tests.
require('babel-register')

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8545,
      gas: 15000000,
      network_id: '*' // Match any network id
    },
    developmentHost: {
      host: '172.28.128.1',
      port: 7545,
      network_id: 'developmentHost' // Match any network id
    }
  }
}
