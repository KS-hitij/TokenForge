// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20, Ownable{

    constructor(string memory _name, string memory _symbol, uint initialMintValue) ERC20(_name,_symbol) Ownable(msg.sender){
        _mint(msg.sender,initialMintValue);
    }

    function mint(uint qty, address reciever) external onlyOwner{
        _mint(reciever,qty);
    }
}