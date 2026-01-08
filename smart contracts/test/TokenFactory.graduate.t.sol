// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";

contract TokenFactoryTest is Test{
    TokenFactory public tf;
    address constant owner = address(0x2488);
    address constant creator = address(0x123);
    address tokenAddress;
    function setUp() public{
        vm.prank(owner);
        tf = new TokenFactory();
        vm.deal(creator,1 ether);
        vm.prank(creator);
        tf.createMemeToken{value:1*10**15}("GradCoin","GRAD","ipfs://graduate_token_metadata");
        address[] memory result = tf.getTokensAddress(0);
        tokenAddress = result[0];
    }

    function test_GraduateToken() public{
        vm.deal(creator,24 ether);
        vm.prank(creator);
        tf.buyMemeToken{value:24 ether}(tokenAddress, 800000 * 10**18);
        TokenFactory.memeToken memory token = tf.getTokenDetails(tokenAddress);
        assertEq(token.hasGraduated,true);
        vm.prank(creator);
        tf.graduate(tokenAddress);
    }

    function test_RevertIfNotGraduated() public{
        vm.expectRevert();
        vm.prank(creator);
        tf.graduate(tokenAddress);
    }

    function test_RevertIfNotCreator() public{
        address notCreator = address(0x999);
        vm.deal(notCreator,30 ether);
        vm.prank(notCreator);
        tf.buyMemeToken{value:30 ether}(tokenAddress, 800000 * 10**18);
        vm.expectRevert();
        vm.prank(notCreator);
        tf.graduate(tokenAddress);
    }
}