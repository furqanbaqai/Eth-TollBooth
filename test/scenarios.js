Promise = require("bluebird");
Promise.promisifyAll(web3.eth, {suffix: "Promise"});
web3.eth.getTransactionReceiptMined = require("../utils/getTransactionReceiptMined.js");
const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const maxGas = 15000000;

contract('TollBoothOperator', function (accounts) {

    let owner0, owner1,
        booth0, booth1, booth2,
        vehicle0, vehicle1,
        regulator, operator,
        vehicle0Bal;
    // const price01 = randomIntIn(1, 1000);
    const price01 = 100;
    const deposit0 = price01;
    const deposit1 = deposit0;
    const vehicleType0 = randomIntIn(1, 1000);
    const vehicleType1 = vehicleType0 + randomIntIn(1, 1000);
    const multiplier0 = 1;
    const multiplier1 = 1;
    const tmpSecret = randomIntIn(1, 1000);
    const secret0 = toBytes32(tmpSecret);
    const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
    
    let hashed0, hashed1;
    
    before("should prepare", function () {
        assert.isAtLeast(accounts.length, 8);
        owner0 = accounts[0];
        owner1 = accounts[1];
        booth0 = accounts[2];
        booth1 = accounts[3];
        booth2 = accounts[4];
        vehicle0 = accounts[5];
        vehicle1 = accounts[6];
        
        return web3.eth.getBalancePromise(owner0)
            .then(balance => {
                assert.isAtLeast(web3.fromWei(balance).toNumber(), 10)
                return web3.eth.getBalancePromise(vehicle0)
                    .then(balance => vehicle0Bal = balance);
            });             
    });
    /* Test Case# 1 - Start */
    describe("Executing Unit Test-case 1 of 6",function(){
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth0, booth1, price01, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);                
        });
        it("Scenario 1: Vehicle 1 enters from booth 1 and exit from booth 2 having route price same as deposited",function(){            
            // assert.isTrue(true);
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual((deposit0*multiplier0), deposit0);
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0));                                          
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logExited = tx.logs[0];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                 });                 
        }); 
    });
    /* Test Case 1: Ends */
   
    /* Test Case# 2 - Start */
    describe("Executing Unit Test-case 2 of 6",function(){
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth0, booth1, price01 + 10, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);                
        });
        it("Scenario 2: Vehicle 1 enters from booth 1 and exit from booth 2 having route price more than deposited ",function(){            
            // assert.isTrue(true);
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual((deposit0*multiplier0), deposit0);
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0));                                          
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logExited = tx.logs[0];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                 });                 
        }); 
    });
    /* Test Case 2: Ends */

     /* Test Case# 3 - Start */
    describe("Executing Unit Test-case 3 of 6",function(){
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth0, booth1, price01 - 10, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);                
        });
        it("Scenario 3: Vehicle 1 enters from booth 1 and exit from booth 2 having route price 10 less than deposited ",function(){            
            // assert.isTrue(true);
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual((deposit0*multiplier0), deposit0);
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0));                                          
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logExited = tx.logs[0];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), 10);
                 });                 
        }); 
    });
    /* Test Case 3: Ends */

    /* Test Case# 4 - Start */
    describe("Executing Unit Test-case 4 of 6",function(){
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setRoutePrice(booth0, booth1, price01, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);                
        });
        it("Scenario 4: Vehicle 1 enters from booth 1 and exit from booth 2 depositing 10 more than the route price ",function(){            
            // assert.isTrue(true);
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)+10}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual((deposit0*multiplier0), deposit0);
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0) + 10);                                          
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logExited = tx.logs[0];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), 10);
                 });                 
        }); 
    });
    /* Test Case 4: Ends */

    /* Test Case# 5 - Start */
    describe("Executing Unit Test-case 5 of 6",function(){
        let vehicleInitBal, vehicleBal2;
        const extraDeposit = 10;
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash)
                .then(() => web3.eth.getBalancePromise(vehicle0))
                .then(balance => vehicleInitBal = balance);
        });
        it("Scenario 5: Vehicle 1 enters from booth 1 and exit from booth 2 depositng 10 more than the route price ",function(){                        
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)+extraDeposit}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0) + extraDeposit);
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logPendingPay = tx.logs[0];                     
                     assert.strictEqual(logPendingPay.event, "LogPendingPayment");
                     assert.strictEqual(logPendingPay.args.exitSecretHashed, hashed0);                     
                     return web3.eth.getBalancePromise(vehicle0);                     
                 })
                 .then(balance => {
                     vehicleBal2 = balance;                     
                     return operator.setRoutePrice(booth0, booth1, price01 * multiplier0, { from: owner1 });
                 })
                 .then(tx =>{
                     const logPriceSet = tx.logs[0];
                     assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
                     assert.strictEqual(logPriceSet.args.sender, owner1);
                     assert.strictEqual(logPriceSet.args.entryBooth, booth0);
                     assert.strictEqual(logPriceSet.args.exitBooth, booth1);
                     const logExited = tx.logs[1];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), extraDeposit);                     
                     return Promise.allNamed({
                          operator: () => web3.eth.getBalancePromise(operator.address),
                          collected: () => operator.getCollectedFeesAmount(),
                          vehicle0: () => web3.eth.getBalancePromise(vehicle0)
                     });
                 })
                 .then(balances => {
                     assert.strictEqual(balances.operator.toNumber(), deposit0 * multiplier0);
                     assert.strictEqual(balances.collected.toNumber(), deposit0 * multiplier0);                     
                     assert.strictEqual(balances.vehicle0.toString(10), vehicleBal2.add(extraDeposit).toString(10));                     
                 });  
        }); 
    });
    /* Test Case 5: Ends */

    /* Test Case# 6 - Start */
    describe("Executing Unit Test-case 6 of 6",function(){
        let vehicle1InitBal, vehicle1Bal2,
            vehicle2InitBal, vehicle2Bal2;
        const extraDepositVeh1 = 10;
        beforeEach("Deploying regulator and operator..", function() {
            return Regulator.new({ from: owner0 })
                .then(instance => regulator = instance)
                .then(() => regulator.setVehicleType(vehicle0, vehicleType0, { from: owner0 }))
                .then(() => regulator.setVehicleType(vehicle1, vehicleType0, { from: owner0 }))                                
                .then(tx => regulator.createNewOperator(owner1, deposit0, { from: owner0 }))
                .then(tx => operator = TollBoothOperator.at(tx.logs[1].args.newOperator))
                .then(() => operator.addTollBooth(booth0, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth1, { from: owner1 }))
                .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType0, multiplier0, { from: owner1 }))
                .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash)
                .then(() => web3.eth.getBalancePromise(vehicle0))
                .then(balance => vehicle1InitBal = balance);
        });
        it("Scenario 6: Vehicle 1 and Vehicle 2 mix scenario ",function(){                        
             return operator.enterRoad.call(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)})
                 .then(success => assert.isTrue(success))
                 .then(() => operator.enterRoad(booth0, hashed0, {from: vehicle0,value: (deposit0 * multiplier0)+extraDepositVeh1}))
                 .then(tx =>{
                     const logEntered = tx.logs[0];
                     assert.strictEqual(logEntered.event, "LogRoadEntered");
                     assert.strictEqual(logEntered.args.depositedWeis.toNumber(), (deposit0 * multiplier0) + extraDepositVeh1);
                     return operator.reportExitRoad(secret0, { from: booth1 });
                 }).then(tx =>{
                     const logPendingPay = tx.logs[0];                     
                     assert.strictEqual(logPendingPay.event, "LogPendingPayment");
                     assert.strictEqual(logPendingPay.args.exitSecretHashed, hashed0);                     
                     return web3.eth.getBalancePromise(vehicle0);                     
                 })
                 .then(balance => {
                     vehicle1Bal2 = balance;                                          
                     return operator.enterRoad(booth0, hashed1, {from: vehicle1,value: (deposit0 * multiplier0)});                     
                 })
                 .then(tx =>{
                     const logV2Entered = tx.logs[0];
                     assert.strictEqual(logV2Entered.event, "LogRoadEntered");
                     assert.strictEqual(logV2Entered.args.depositedWeis.toNumber(), (deposit0 * multiplier0));
                     assert.strictEqual(logV2Entered.args.vehicle, vehicle1);
                     return operator.reportExitRoad(secret1, { from: booth1 });                    
                 })
                 .then(tx =>{
                     const logPendingPay = tx.logs[0];
                     assert.strictEqual(logPendingPay.event, "LogPendingPayment");
                     assert.strictEqual(logPendingPay.args.exitSecretHashed, hashed1);
                     return web3.eth.getBalancePromise(vehicle1);                    
                 })
                 .then(balance => {
                    vehicle2Bal2 = balance;
                    return operator.setRoutePrice(booth0, booth1, (price01 * multiplier0) - 20, { from: owner1 });
                 })
                 .then(tx =>{
                     const logPriceSet = tx.logs[0];
                     assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
                     assert.strictEqual(logPriceSet.args.sender, owner1);
                     assert.strictEqual(logPriceSet.args.entryBooth, booth0);
                     assert.strictEqual(logPriceSet.args.exitBooth, booth1);
                     const logExited = tx.logs[1];
                     assert.strictEqual(logExited.event, "LogRoadExited");
                     assert.strictEqual(logExited.args.refundWeis.toNumber(), extraDepositVeh1+20);
                     assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                     return operator.getPendingPaymentCount(booth0,booth1);                     
                 })
                 .then(payments => {
                    assert.strictEqual(payments.toNumber(),1);
                    return operator.clearSomePendingPayments(booth0,booth1,1,{from:owner1});
                 })
                 .then(tx => {
                    const logExited = tx.logs[0];
                    assert.strictEqual(logExited.event, "LogRoadExited");
                    assert.strictEqual(logExited.args.refundWeis.toNumber(), 20);
                    assert.strictEqual(logExited.args.exitSecretHashed, hashed1);
                    return Promise.allNamed({
                          operator: () => web3.eth.getBalancePromise(operator.address),
                          collected: () => operator.getCollectedFeesAmount(),
                          vehicle0: () => web3.eth.getBalancePromise(vehicle0),
                          vehicle1: () => web3.eth.getBalancePromise(vehicle1)
                     });
                 })
                 .then(balances => {
                     assert.strictEqual(balances.operator.toNumber(), ((deposit0 * multiplier0)-20) * 2);
                     assert.strictEqual(balances.collected.toNumber(), ((deposit0 * multiplier0) - 20) * 2);
                     assert.strictEqual(balances.vehicle0.toString(10), vehicle1Bal2.add(extraDepositVeh1).add(20).toString(10)); 
                     assert.strictEqual(balances.vehicle1.toString(10), vehicle2Bal2.add(20).toString(10));
                 });
        }); 
    });
    /* Test Case 6: Ends */
});