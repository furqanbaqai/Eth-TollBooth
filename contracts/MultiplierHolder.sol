pragma solidity ^0.4.24;

import {MultiplierHolderI} from "./interfaces/MultiplierHolderI.sol";
import {Owned} from "./Owned.sol";

/**
 * @title Contract for defining Vehciles Multiplier used for calculating the route toll
 * Contract Code: MH
 */
contract MultiplierHolder is MultiplierHolderI,Owned {
        
        mapping(uint => uint) private VehicleMultiplier;

        constructor() public{
            // Not implemented
        }

        function setMultiplier(uint vehicleType,uint multiplier) public fromOwner returns(bool success){
            require(vehicleType != 0, "[MHSM001] Invalid input");
            require(VehicleMultiplier[vehicleType] != multiplier, "[MHSM002] Same vehicle type can not be set");
            if(multiplier == 0){
                delete VehicleMultiplier[vehicleType];
            }else{
                VehicleMultiplier[vehicleType] = multiplier;
            }            
            emit LogMultiplierSet(msg.sender, vehicleType,multiplier);
            return true;
        }
        
        function getMultiplier(uint vehicleType) view public returns(uint multiplier){
            return VehicleMultiplier[vehicleType];
        }
}