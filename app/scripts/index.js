import "../styles/app.css";

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");

const regulatorJson = require("../../build/contracts/Regulator.json");
const tollBoothOperatorJson = require("../../build/contracts/TollBoothOperator.json");

if (typeof web3 !== 'undefined') {
  // Use the Mist/wallet/Metamask provider.
  window.web3 = new Web3(web3.currentProvider);
} else {
  // Your preferred fallback.
  window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

const Regulator = truffleContract(regulatorJson);
const TollBoothOperator = truffleContract(tollBoothOperatorJson);
Regulator.setProvider(web3.currentProvider);
TollBoothOperator.setProvider(web3.currentProvider);

var accounts;
var regOwner;

window.Setup = {
  getAccounts: function(){
    web3.eth.getAccountsPromise()
      .then(accs =>{
        console.log("Accounts fetched:"+accs.length);
        if(accs.length < 8){
          console.error("Accounts are lesser then required..");          
        }
        this.accounts = accs;
        this.regOwner = accs[0];
        window.regOwner = accs[0];
        $("#reg_Owner").html(""+accs[0]);
        return accs;
      });  
  }
};

window.RegulatorContract = {
  setVehcileTypes:function(vehID,vehType){    
    let deployed;
    return Regulator.deployed()
      .then(_deployed =>{
        deployed = _deployed;
        return deployed.setVehicleType.sendTransaction(vehID,vehType,
                                                        {from:window.regOwner});
      })
      .then(txHash =>{
        $('#status').html("Transaction on its way:"+txHash);
         const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit any max call stack depth
                    Promise.delay(1000).then(tryAgain));
            return tryAgain();                
      })
      .then(receipt =>{
        if(parseInt(receipt.status != 1)){
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          $("#status").html("There was an error in the tx execution, status not 1");
        }else {
          // Format the event nicely.
          console.log(deployed.LogVehicleTypeSet().formatter(receipt.logs[0]).args);
          $("#status").html("Vehcle's type set");
        }
      })
      .catch(error => {
        console.error(error);
      });
  },

  createNewTollBoothOperator: function (ownerAdd, initDeposit){    
    let deployed, address, tollBoothOperator;
    const gas = 30000000;
    console.log("Owner Address: "+ownerAdd);
    console.log("Initial deposit: " + initDeposit);
    return Regulator.deployed()
      .then(_deployed =>{
        deployed = _deployed;        
        return deployed.createNewOperator.sendTransaction(ownerAdd,initDeposit,
                                                            { from: window.regOwner, gas: gas});
      })
      .then(txHash =>{
        $('#status').html("Transaction on its way:" + txHash);
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();                
      })
      .then(receipt =>{
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          $("#status").html("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }                 
        address = deployed.LogTollBoothOperatorCreated().formatter(receipt.logs[0]).address;
        console.log(receipt);                
        $("#status").html("New Operator Created with Address: <span class=\"black\">" + address + "</span>");                
        tollBoothOperator = TollBoothOperator.at(address);
        window.tollBoothOperator = tollBoothOperator;
        return tollBoothOperator.setPaused.sendTransaction(false,{from:window.regOwner,gas:gas});
      })
      .then(txHash =>{
        console.log("Transaction hash: "+txHash);
        console.log("Unpausing the smart contract..");
        
      })     
      .catch(error => {
        console.error(error);
      });
  }
};

window.Utils = {
  displayStatusMessage: function(message){
    $("#status").html(""+message);
  },
  getAddressBalance: function(address){
    return web3.eth.getBalancePromise(address)
      .then(balance =>{
        
        $('#vopVehBalance').html("Your balance is <b>" + web3.fromWei(balance.toNumber(), "ether") + "</b>");
      })
      .catch(error => {
        console.error(error);
      });
  }
};

window.TollBoothOperatorContract = {
  addTollBooth: function(tollBoothAdd){    
    return window.tollBoothOperator.addTollBooth.sendTransaction(tollBoothAdd, { from: window.tollBoothOpOwner})
      .then(txHash => {        
        Utils.displayStatusMessage("Transaction on its way:" + txHash);
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();                
      })
      .then(receipt => {
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          Utils.displayStatusMessage("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }
        console.log(receipt);
        // console.log(deployed.LogVehicleTypeSet().formatter(receipt.logs[0]).args);                
        Utils.displayStatusMessage("Toll Booth Added");
      })
      .catch(error => {
        console.error("Some error occurred..."+error);
      });
  },
  setRoutePrice: function(entryBoothAdd,exitBoothAdd,price){    
    return window.tollBoothOperator.setRoutePrice.sendTransaction(entryBoothAdd,exitBoothAdd,price,{from:window.tollBoothOpOwner})
      .then(txHash =>{
        Utils.displayStatusMessage("Transaction on its way:" + txHash);
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();                
      })
      .then(receipt =>{
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          Utils.displayStatusMessage("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }
        console.log(receipt);
        if(receipt.logs.length <= 1){
          // Set price without old payment clearance
          var output = window.tollBoothOperator.LogRoutePriceSet().formatter(receipt.logs[0]);
          console.log("Event Triggered:"+JSON.stringify(output));
        }
        Utils.displayStatusMessage("Transaction completed successfully");
      })
      .catch(error => {
        console.error("Some error occurred..."+error);
      });
  },
  setMultiplier: function(vehicleType, multiplier){
    return window.tollBoothOperator.setMultiplier.sendTransaction(vehicleType,multiplier,{from:window.tollBoothOpOwner})
      .then(txHash =>{
        Utils.displayStatusMessage("Transaction on its way:" + txHash);
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();                
      })
      .then(receipt => {
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          Utils.displayStatusMessage("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }
        console.log(receipt);               
        var output = window.tollBoothOperator.LogMultiplierSet().formatter(receipt.logs[0]);
        console.log("Event Triggered:" + JSON.stringify(output));       
        Utils.displayStatusMessage("Transaction completed successfully");
      })
      .catch(error => {
        console.error("Some error occurred..." + error);
      });
  },
  enterRoad : function(entryBoothAdd, vehicleAdd, secret, deposit){
    console.log("Calling procedure to enter road");
    const gas = 30000000;    
    let hashedSecret;
    window.tollBoothOperator.hashSecret.call(secret)
      .then(_hashedSecret =>{
        hashedSecret = _hashedSecret;
        console.log("Hashed Secret:"+_hashedSecret);
        return window.tollBoothOperator.enterRoad.sendTransaction(entryBoothAdd, hashedSecret, { from: vehicleAdd, value:deposit,gas: gas})
      })
      .then(txHash =>{
        Utils.displayStatusMessage("Transaction on its way:" + txHash);        
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();                
      })
      .then(receipt=>{
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          Utils.displayStatusMessage("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }
        console.log(receipt);
        var output = window.tollBoothOperator.LogRoadEntered().formatter(receipt.logs[0]);
        console.log("Event Triggered:" + JSON.stringify(output));
        Utils.displayStatusMessage("Vehcile entered the road successfully");
      })
      .catch(error => {
        console.error("Some error occurred..." + error);
      });
  },

  reportExit : function(exitSecret,exitBoothAdd){
    const gas = 30000000;
    console.log("TollBoothOperator Add:"+window.tollBoothOperator.address);
    return window.tollBoothOperator.reportExitRoad.sendTransaction(exitSecret,{from:exitBoothAdd, gas:gas})
      .then(txHash =>{        
        console.log("Transaction hash:"+ txHash);
        const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
          .then(receipt => receipt !== null ?
            receipt :
            // Let's hope we don't hit any max call stack depth
            Promise.delay(1000).then(tryAgain));
        return tryAgain();     
      })
      .then(receipt =>{
        if (parseInt(receipt.status != 1)) {
          console.error("Error status received while executing the transaction");
          console.error(receipt);
          Utils.displayStatusMessage("There was an error in the tx execution, status not 1");
          throw new Exception("There was an error in the tx execution, status not 1");
        }
        console.log(receipt);        
        
        console.log("Event Triggered:" + JSON.stringify(output));
        if (receipt.logs[0].event === "LogPendingPayment"){
          Utils.displayStatusMessage("Vehicle entered the road successfully and toll fees is pending for payment");
        }else{
          Utils.displayStatusMessage("Vehicle entered the road successfully.");
        }        
      })
      .catch(error => {
        console.error("Some error occurred..." + error);
      });
  }
};

const reg_setVehcileTypeEvent = function(){  
  if($("#regVehcileID").val() == '' || $("#regVehcileType").val() == ''){
    $("#status").html("Please enter vehcile ID and type");
  }else{
    $("#status").html("");
    RegulatorContract.setVehcileTypes($("#regVehcileID").val(),
                                    $("#regVehcileType").val());
  }  
}

const reg_createNewTollBooth = function(){
  // call sepecific library initDeposit
  if ($('#tollBoothOwnerAddress').val() == '' || 
    $('#initDeposit').val() == ''){
    $("#status").html("Please enter owner of the tollbooth and initial deposit");
  }else{
    $("#status").html("");
    window.tollBoothOpOwner = $('#tollBoothOwnerAddress').val();
    RegulatorContract.createNewTollBoothOperator($('#tollBoothOwnerAddress').val(), $('#initDeposit').val());
  }  
}

const reg_tollBoothAdminClick = function(){  
  if (typeof window.tollBoothOperator === "undefined"){
    Utils.displayStatusMessage("Please create a new tollbooth operator first.");
  }else{
    $('#reg_TollBoothAdd').html("" + window.tollBoothOperator.address);
  }  
}

const reg_sendAddTollBoothClick = function(){
  if ($('#tbTollBoothAdd').val() == ''){
    Utils.displayStatusMessage("Please enter a valid address to register it..");
  }else{
    TollBoothOperatorContract.addTollBooth($('#tbTollBoothAdd').val());
  }
  
}

const reg_setRoutePriceClick = function(){  
  if ($('#tbEntryBoothAdd').val() == "" || 
        $('#tbExitBoothAdd').val() == "" ||
          $('#tbRoutePrice').val() == ""){            
            Utils.displayStatusMessage("Please provide entry, exit booths address and toll price");
            
    }else{
      TollBoothOperatorContract.setRoutePrice($('#tbEntryBoothAdd').val(), $('#tbExitBoothAdd').val(), $('#tbRoutePrice').val());
    }
}

const reg_setMultiplierClick = function(){
  if($('#tbVehicleType').val() == "" || $("#tbMultiplier").val() == ""){
    Utils.displayStatusMessage("Please enter vehicle type and multiplier");
  }else{
    TollBoothOperatorContract.setMultiplier($('#tbVehicleType').val(), $("#tbMultiplier").val());
  }
}

const reg_getVehicleBalance =function(){
  if ($('#vopVehicleAddress').val() == ''){
    Utils.displayStatusMessage("Please enter address to get balance of");
  }else{
    Utils.getAddressBalance($('#vopVehicleAddress').val());
  }  
}

const reg_doEntry = function (address, secret, deposit) {
  if ($('#vopEntryVehicleAddress').val() == "" ||
    $("#vopEntryVehicleSecret").val() == "" ||
    $('#vopEntryVehicleDepo').val() == ""  || 
    $('#vopEntryBoothAdd').val() == "") {

    Utils.displayStatusMessage("Please provide Vehicle Address, Secret and Deposit");
  } else {
    TollBoothOperatorContract.enterRoad($('#vopEntryBoothAdd').val(),$('#vopEntryVehicleAddress').val(),$("#vopEntryVehicleSecret").val(),$('#vopEntryVehicleDepo').val());
  }

}

const reg_displayAddress = function(){  
  if (typeof window.tollBoothOperator === "undefined") {
    Utils.displayStatusMessage("Please create a new tollbooth operator first.");
  } else {
    $('#spnTollBoothAdd').html("" + window.tollBoothOperator.address);
  }  
}

const reg_displayAddress2 = function () {
  if (typeof window.tollBoothOperator === "undefined") {
    Utils.displayStatusMessage("Please create a new tollbooth operator first.");
  } else {
    $('#spnTollBoothOop').html("" + window.tollBoothOperator.address);
  }
}

const reg_reportExit = function(){
  if ($('#inpExitSecret').val() == "" || $('#inpExitBoothAdd').val() == ""){
    Utils.displayStatusMessage("Please provide required exit secret and tollbooth address");
  }else{    
    console.log("TollBoothOperator Add:" + window.tollBoothOperator.address);
    TollBoothOperatorContract.reportExit($('#inpExitSecret').val(), $('#inpExitBoothAdd').val());
  }
}

window.addEventListener("load",function(){
  console.log("Application booted...");
  Setup.getAccounts();
  // Add click event  
  $('#sendSetVehicleTypes').click(reg_setVehcileTypeEvent);
  $('#createTollBooth').click(reg_createNewTollBooth);
  $('#tab2').click(reg_tollBoothAdminClick);
  $('#tab3').click(reg_displayAddress);
  $('#tab4').click(reg_displayAddress2);

  /** TollBoothOperation Admin Event Listeners **/
  $("#sendAddTollBooth").click(reg_sendAddTollBoothClick);
  $("#setRoutePrice").click(reg_setRoutePriceClick);
  $("#setMultiplier").click(reg_setMultiplierClick);

  /** Vehcile operation Events */
  $("#btVehicleBalance").click(reg_getVehicleBalance);
  $("#btDoEntry").click(reg_doEntry);

  /** TollBooth operations */
  $('#btReportExit').click(reg_reportExit);
});





require("file-loader?name=../index.html!../index.html");