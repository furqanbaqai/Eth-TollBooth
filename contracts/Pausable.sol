pragma solidity ^0.4.24;

import {PausableI} from "./interfaces/PausableI.sol";
import {Owned} from "./Owned.sol";

/**
 * @title Contract for making contract pausable
 * Contract Code: PA
 **/
contract Pausable is PausableI, Owned{
    
    bool private paused;

    constructor(bool _paused) public{
        paused = _paused;
    }

    modifier whenPaused() {
        require(paused,"[PAMD01] Not Paused");
        _;
    }

    modifier whenNotPaused(){
        require(!paused, "[PAMD02] Is Paused");
        _;
    }

    function setPaused(bool newState) public returns(bool success){
        require(newState != paused, "[PASP01] Sate not different");
        paused = newState;
        emit LogPausedSet(msg.sender, newState);
        return true;
    }

    function isPaused() view public returns(bool isIndeed){
        return paused;
    }
    
}