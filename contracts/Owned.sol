pragma solidity ^0.4.24;

import {OwnedI} from "./interfaces/OwnedI.sol";

/**
 * @title Contract for defining ownership
 * Contract Code: OW
 */
contract Owned is OwnedI {

    address private myowner;

    constructor() public{
       myowner = msg.sender;
    }

    /**
     * @dev Modifier for checking the owner
     * 
     **/
    modifier fromOwner(){
        require(msg.sender == myowner, "[OWMD01] You are not an owner");
        _;
    }
    
    function setOwner(address newOwner) public returns(bool success){
        require(msg.sender == myowner,"[OWSO01]Function can be called by owner only");
        require(newOwner != myowner, "[OWSO02]Can not reset to current owner");
        require(newOwner != address(0), "[OWSO03]Invalid input");        
        emit LogOwnerSet(myowner,newOwner);
        myowner = newOwner;
        return true;
    }

     function getOwner() view public returns(address owner){
        return myowner;
    }
}