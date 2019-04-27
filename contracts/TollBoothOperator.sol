pragma solidity ^0.4.24;

import {Owned} from "./Owned.sol";
import {Pausable} from "./Pausable.sol";
import {Regulated} from "./Regulated.sol";
import {MultiplierHolder} from "./MultiplierHolder.sol";
import {DepositHolder} from "./DepositHolder.sol";
import {TollBoothHolder} from "./TollBoothHolder.sol";
import {RoutePriceHolder} from "./RoutePriceHolder.sol";
import {TollBoothOperatorI} from "./interfaces/TollBoothOperatorI.sol";
import {RegulatorI} from "./interfaces/RegulatorI.sol";


contract TollBoothOperator is
            Pausable, 
            Regulated, 
            MultiplierHolder, 
            DepositHolder, 
            TollBoothHolder,
            RoutePriceHolder,
            TollBoothOperatorI{
                
    struct VehicleHashRecord{
        address vehicle;
        address entryBooth;
        address exitBooth;
        uint depositWeis;        
    }
    mapping(bytes32 => VehicleHashRecord) private VehicleTollRecord;
    mapping(address => uint) private VehicleBalance;
    uint private feesCollected;
    
    mapping(bytes32 => bytes32[]) private PendingPayments;
    
    
                
    constructor(bool isPaused, uint deposit, address regulator) Pausable(isPaused) DepositHolder(deposit) Regulated(regulator) public{
        
    }            
                
    function hashSecret(bytes32 secret) view   public returns(bytes32 hashed){
        return keccak256(abi.encodePacked(secret));            
    }

    
    function enterRoad(address entryBooth, bytes32 exitSecretHashed)
        public
        whenNotPaused
        payable
        returns (bool success){
            RegulatorI regulator = RegulatorI(getRegulator());
            uint vehcileType = regulator.getVehicleType(msg.sender);
            require(vehcileType != 0, "[TOER01]: Vehcile not registered");
            require(getMultiplier(vehcileType) != 0, "[TOER02] Vehicle not allowed");
            require(isTollBooth(entryBooth), "[TOER03] Not a valid toll booth address");
            require(msg.value >= getDeposit() * getMultiplier(vehcileType), "[TOER04] less than deposit * multiplier was sent alongside");
            require(VehicleTollRecord[exitSecretHashed].vehicle == address(0),"[TOER05] Secret hashed already used");
            VehicleTollRecord[exitSecretHashed].vehicle = msg.sender;
            VehicleTollRecord[exitSecretHashed].entryBooth = entryBooth;
            VehicleTollRecord[exitSecretHashed].depositWeis += msg.value;
            emit LogRoadEntered(msg.sender,entryBooth,exitSecretHashed, msg.value);
            return true;
        }


    function getVehicleEntry(bytes32 exitSecretHashed)
        view
        public
        returns(
            address vehicle,
            address entryBooth,
            uint depositedWeis){
                return (VehicleTollRecord[exitSecretHashed].vehicle,VehicleTollRecord[exitSecretHashed].entryBooth, VehicleTollRecord[exitSecretHashed].depositWeis);
            }

    
    
    
    function reportExitRoad(bytes32 exitSecretClear)
        public
        whenNotPaused
        returns (uint status){
            require(isTollBooth(msg.sender), "[TORE01] Not a valid toll booth address");
            RegulatorI regulator = RegulatorI(getRegulator());
            bytes32 hashSec = hashSecret(exitSecretClear);
            uint vehcileType = regulator.getVehicleType(VehicleTollRecord[hashSec].vehicle);
            require(vehcileType != 0, "[TORE02]: Vehcile not registered");
            require(msg.sender != VehicleTollRecord[hashSec].entryBooth, "[TORE03] Booths should be different");
            require(VehicleTollRecord[hashSec].entryBooth != address(0), "[TORE04] Invalid HASH keys");
            require(VehicleTollRecord[hashSec].exitBooth == address(0), "[TORE04] Exit already reported");
            // Get the tollamount
            uint multiplier = getMultiplier(regulator.getVehicleType(VehicleTollRecord[hashSec].vehicle));
            uint tollFees = getRoutePrice(VehicleTollRecord[hashSec].entryBooth,msg.sender) * multiplier;
            VehicleTollRecord[hashSec].exitBooth = msg.sender;
            if(tollFees == 0){ // Toll fees not known
                // Pending payment Use-Case
                bytes32 addHashed = keccak256(abi.encodePacked(VehicleTollRecord[hashSec].entryBooth,msg.sender));
                PendingPayments[addHashed].push(hashSec);
                emit LogPendingPayment(hashSec,VehicleTollRecord[hashSec].entryBooth,msg.sender);
                return 2;
            }
            else if(VehicleTollRecord[hashSec].depositWeis >= tollFees){
                feesCollected +=  tollFees;
                VehicleTollRecord[hashSec].depositWeis -= tollFees;
                uint refundWeis = VehicleTollRecord[hashSec].depositWeis;
                VehicleBalance[VehicleTollRecord[hashSec].vehicle] += VehicleTollRecord[hashSec].depositWeis;
                VehicleTollRecord[hashSec].depositWeis = 0;
                VehicleTollRecord[hashSec].vehicle.transfer(refundWeis);
                emit LogRoadExited(msg.sender,hashSec,tollFees,refundWeis);
                return 1;
            }else if(VehicleTollRecord[hashSec].depositWeis < tollFees){
                // Deduct the whole amount and add remaining in pending payment
                feesCollected +=  VehicleTollRecord[hashSec].depositWeis;
                VehicleTollRecord[hashSec].depositWeis = 0; // Whole depost will be collected in fees
                emit LogRoadExited(msg.sender,hashSec,tollFees,0);
                return 1;
            }else{
                revert("[TORE05] Invalid condition detected");
            }
        }

    
    function getPendingPaymentCount(address entryBooth, address exitBooth)
        view
        public
        returns (uint count){
            bytes32 addHashed = keccak256(abi.encodePacked(entryBooth,exitBooth));
            return PendingPayments[addHashed].length;
            
        }

    
    function clearSomePendingPayments(
            address entryBooth,
            address exitBooth,
            uint count)
        public
        whenNotPaused
        returns (bool success){
            require(isTollBooth(entryBooth) && isTollBooth(exitBooth), "[TOCSP01] Not valid tollbooths");
            uint pendPayLength = getPendingPaymentCount(entryBooth,exitBooth);
            require(pendPayLength >= count, "[TOCSP02] Payments pending is lesser than the count");
            require(count > 0, "[TOCSP03] Invalid input");
            bytes32 addHashed = keccak256(abi.encodePacked(entryBooth,exitBooth));
            bool paymentCleared = false;
            RegulatorI regulator = RegulatorI(getRegulator());
            for(uint i=0; i<count;i++){
                // Step#1: Get route rate
                uint routeToll = getRoutePrice(entryBooth,exitBooth);
                if(routeToll > 0){ // Otherwise element will remain in the model
                    // Get multiplier
                    bytes32 hashSec = PendingPayments[addHashed][i];
                    uint vehcileType = regulator.getVehicleType(VehicleTollRecord[hashSec].vehicle);
                    uint tollFees = routeToll * getMultiplier(vehcileType);
                    // Do accounting
                    if(VehicleTollRecord[hashSec].depositWeis > tollFees){
                        feesCollected +=  tollFees;
                        VehicleTollRecord[hashSec].depositWeis -= tollFees;
                        VehicleBalance[VehicleTollRecord[hashSec].vehicle] += VehicleTollRecord[hashSec].depositWeis;
                        uint refundWeis = VehicleTollRecord[hashSec].depositWeis;
                        VehicleTollRecord[hashSec].depositWeis = 0;
                        paymentCleared = true;
                        resetPenPayArr(addHashed,i);
                        VehicleTollRecord[hashSec].vehicle.transfer(refundWeis);
                        emit LogRoadExited(exitBooth,hashSec,tollFees,refundWeis);
                    }else if(VehicleTollRecord[hashSec].depositWeis <= tollFees){
                        uint depWeis = VehicleTollRecord[hashSec].depositWeis;
                        feesCollected +=  depWeis;
                        paymentCleared = true;                        
                        VehicleTollRecord[hashSec].depositWeis = 0; // Whole deposit will be collected in fees
                        resetPenPayArr(addHashed,i);
                        // emit LogRoadExited(exitBooth,hashSec,tollFees,0);
                        emit LogRoadExited(exitBooth,hashSec,depWeis,0);
                    }                   
                }
                
            }
            return true;
        }
        
    function resetPenPayArr(bytes32 addHashed, uint i)
        private {
            bytes32[] storage values = PendingPayments[addHashed];
            uint j = i;
            while(j<values.length-1){
                values[j] = values[j+1];
                j++;
            }
            values.length--;   
    }
        
        
    function setRoutePrice(
             address entryBooth,
             address exitBooth,
             uint priceWeis)
         public
         returns(bool success){
             require(RoutePriceHolder.setRoutePrice(entryBooth,exitBooth,priceWeis),"[TOSRP01]: Error while seting route price");
             // Clear one payment as well
             if(getPendingPaymentCount(entryBooth,exitBooth) > 0){
                require(clearSomePendingPayments(entryBooth,exitBooth,1),"[TOSRP01]: Error while clearing pending payments");   
             }
             return true;
         }

    /**
     * @return The amount that has been collected through successful payments. This is the current
     *   amount, it does not reflect historical fees. So this value goes back to zero after a call
     *   to `withdrawCollectedFees`.
     */
    function getCollectedFeesAmount()
        view
        public
        returns(uint amount){
            return feesCollected;
        }

    
    function withdrawCollectedFees()
        public
        fromOwner
        returns(bool success){
            require(feesCollected > 0,"[TOWC01] No fees to collect");
            uint  fees = feesCollected;
            feesCollected = 0;
            getOwner().transfer(fees);
            emit LogFeesCollected(msg.sender,fees);
            return true;
        }
    
    function()  public  {
        revert();
    }
}