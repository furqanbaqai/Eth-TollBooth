pragma solidity ^0.4.24;

import {DepositHolderI} from "./interfaces/DepositHolderI.sol";
import {Owned} from "./Owned.sol";

contract DepositHolder is Owned,  DepositHolderI{

    // mapping(address => uint) Deposits;
    uint deposit;

    constructor(uint value) public{
        require(value > 0, "[DP001] Invalid input");                
        deposit = value;
    }

    function setDeposit(uint depositWeis)  public fromOwner returns(bool success){
        require(depositWeis > 0, "[DHSD001] Invalid input");
        require(depositWeis != deposit, "[DHSD002] Values should be different");
        deposit = depositWeis;
        emit LogDepositSet(msg.sender,depositWeis);
        return true;
    }

    function getDeposit()   view   public  returns(uint weis){
        return deposit;
    }


}