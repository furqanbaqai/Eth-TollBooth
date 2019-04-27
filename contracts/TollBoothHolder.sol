pragma solidity ^0.4.24;

import {Owned} from "./Owned.sol";
import {TollBoothHolderI} from "./interfaces/TollBoothHolderI.sol";


contract TollBoothHolder is Owned, TollBoothHolderI {

    mapping(address=>bool) private TollBooths;

    function addTollBooth(address tollBooth) public fromOwner returns(bool success){
        require(tollBooth != address(0), "[TBAT001] Invalid input");
        require(!TollBooths[tollBooth], "[TBAT002] Address already a toolbooth");
        TollBooths[tollBooth] = true;
        emit LogTollBoothAdded(msg.sender,tollBooth);
        return true;
    }

    function isTollBooth(address tollBooth) view public returns(bool isIndeed){
        return TollBooths[tollBooth];
     }

    function removeTollBooth(address tollBooth)  public fromOwner returns(bool success){
        require(tollBooth  != address(0),"[TBAT002] Invalid input");
        require(TollBooths[tollBooth],"[TBAT003] Invalid input");        
        delete TollBooths[tollBooth];
        return true;
    }
     
}