pragma solidity ^0.4.24;

import {RegulatorI} from "./interfaces/RegulatorI.sol";
import {Owned} from "./Owned.sol";
import {TollBoothOperatorI} from "./interfaces/TollBoothOperatorI.sol";
import {TollBoothOperator} from "./TollBoothOperator.sol";

/**
 * @title Contract for making contract pausable
 * Contract Code: RA
 **/
contract Regulator is RegulatorI, Owned{
    
    // uint public VechicleType; /* 0 = Not a vehcle, 1: motorbike, 2: car, 3: lorry */
    mapping(address => uint) private VehicleType;
    mapping(address => bool) private TollBoothOperators;

    constructor() public{
        
    }

    function setVehicleType(address vehicle, uint vehicleType) public fromOwner returns(bool success){
            require(vehicle != address(0) , "[RASV001] Invalid arguments");
            require(VehicleType[vehicle] != vehicleType, "[RASV002] Vehcile tyep already set");
            VehicleType[vehicle] = vehicleType;
            emit  LogVehicleTypeSet(msg.sender,vehicle,vehicleType);           
            return true;
    }

    function getVehicleType(address vehicle) view public returns(uint vehicleType){
        return VehicleType[vehicle];
    }

    function createNewOperator(address owner,uint deposit) public fromOwner returns(TollBoothOperatorI newOperator){        
        require(owner != Owned.getOwner(),"[RACN001] You can not be the owner of TollGateOpe");
        TollBoothOperator tollBoothOperator = new TollBoothOperator(true,deposit,address(this));
        require(tollBoothOperator.setOwner(owner),"[RACN002] UNable to transfer ownership");
        TollBoothOperators[tollBoothOperator] = true;
        emit LogTollBoothOperatorCreated(msg.sender, address(tollBoothOperator), owner, deposit);
        return tollBoothOperator;         
    }

    function removeOperator(address operator)  public fromOwner  returns(bool success){
        require(TollBoothOperators[operator], "[RARO01] Unkwown operator");
        delete TollBoothOperators[operator];
        emit LogTollBoothOperatorRemoved(msg.sender,operator);
        return true;
    }

    function isOperator(address operator) view public returns(bool indeed){
        return TollBoothOperators[operator];
    }


}