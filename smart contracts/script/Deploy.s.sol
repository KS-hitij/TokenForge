// script/Deploy.s.sol
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {TokenFactory} from "../src/TokenFactory.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();
        TokenFactory tf = new TokenFactory();
        vm.stopBroadcast();
    }
}
