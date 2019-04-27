const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");
var tollBoothOperator;

exports.tollBoothOperator = tollBoothOperator;

module.exports = function (deployer, network, accounts) {
    const owner = accounts[0];
    const tollBoothOwner = accounts[1];
    const initialDeposit = 100; // wei    
     deployer.deploy(Regulator,{from:owner, gas: 15000000}).then(regInstance => {       
        return regInstance.createNewOperator(tollBoothOwner, initialDeposit,{from:owner})
    }).then(tx => {                
        console.log("[Customer Message] Address of NewOperatr is:"+tx.logs[1].args.newOperator);
        return tx.logs[1].args.newOperator;        
    }).then(opAdd => {
        return tollBoothOperator = TollBoothOperator.at(opAdd);        
    }).then(operator => {
        return operator.setPaused(false);
    }).then(tx => {
        console.log("[Custom Action] Paused state changed to:" + tx.logs[0].args.newPausedState);        
    });    
};