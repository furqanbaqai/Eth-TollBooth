pragma solidity ^0.4.24;

import {TollBoothHolder} from "./TollBoothHolder.sol";
import {RoutePriceHolderI} from "./interfaces/RoutePriceHolderI.sol";

contract RoutePriceHolder is TollBoothHolder, RoutePriceHolderI {

    mapping(bytes32 => uint) private TollBoothPrices;

    function setRoutePrice(address entryBooth,address exitBooth,uint priceWeis)  public fromOwner returns(bool success){
        require(isTollBooth(entryBooth) 
                || isTollBooth(exitBooth), "[RPSR001] Booths not registerd");
        require(entryBooth != exitBooth, "[RPSR002] Entry Exit can't be same" );
        require(entryBooth != address(0) 
                && exitBooth != address(0), "[RPSR003] Invalid input" );
        require(TollBoothPrices[keccak256(abi.encodePacked(entryBooth, exitBooth))] != priceWeis, "[RPSR003] No change in price");
        TollBoothPrices[keccak256(abi.encodePacked(entryBooth, exitBooth))] = priceWeis;        
        emit LogRoutePriceSet(msg.sender,entryBooth,exitBooth,priceWeis);
        return true;
    }

    function getRoutePrice(address entryBooth,address exitBooth) view  public returns(uint priceWeis){
        return TollBoothPrices[keccak256(abi.encodePacked(entryBooth, exitBooth))];        
    }
}