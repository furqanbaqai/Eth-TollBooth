pragma solidity ^0.4.24;

import {RegulatedI} from "./interfaces/RegulatedI.sol";
import {RegulatorI} from "./interfaces/RegulatorI.sol";
import {Owned} from "./Owned.sol";

/**
 * @title Contract for managing Regulator
 * Contract Code: RE
 **/
contract Regulated is RegulatedI{

    address private Regulator;

    constructor(address _regulator) public{
        require(_regulator != address(0), "[RE001] Invalid input");
        Regulator = _regulator;
    }
    
    function setRegulator(address newRegulator) public returns(bool success){
        require(msg.sender == Regulator,"[RESR001] Should be called by the regulator");
        require(newRegulator != address(0), "[RESR002] Invalid input");
        require(newRegulator != Regulator, "[RESR003] Both can not be same");
        Regulator = newRegulator;
        emit LogRegulatorSet(Regulator, newRegulator);
        return true;
    }

    function getRegulator() view public returns(RegulatorI regulator){
        return RegulatorI(Regulator);
    }
}