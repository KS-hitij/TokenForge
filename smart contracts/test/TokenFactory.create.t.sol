// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {TokenFactory} from "../src/TokenFactory.sol";

contract TokenFactoryTest is Test{
    TokenFactory public tf;
    address constant owner = address(0x2488);

    function setUp() public{
        vm.prank(owner);
        tf = new TokenFactory();
    }

    function test_CreateMemeCoin() public{
        address creator = address(0x123);
        vm.deal(creator,1 ether);
        vm.prank(creator);
        tf.createMemeToken{value:1*10**15}("Kanu","KNU","wihwiueuwghuhg");
        assertEq(address(tf).balance,1*10**15);
        address[] memory result = tf.getTokensAddress(0);
        TokenFactory.memeToken memory token = tf.getTokenDetails(result[0]);
        assertEq(token.creatorAddress,address(0x123));
        assertEq(token.ethReserve,6 ether);
    }

    function test_RevertIfNoFee() public{
        address creator = address(0x123);
        vm.deal(creator,1 ether);
        vm.expectRevert();
        vm.prank(creator);
        tf.createMemeToken{value:1}("Kanu","KNU","wihwiueuwghuhg");
    }

    function test_CollectFee() public{
        address creator = address(0x123);
        vm.deal(creator,1 ether);
        vm.prank(creator);
        tf.createMemeToken{value:1*10**15}("Kanu","KNU","wihwiueuwghuhg");
        uint initBalance = address(owner).balance;
        vm.prank(owner);
        tf.collectFees();
        uint balance = address(owner).balance;
        assertEq(balance - initBalance,1 ether/1000);
    }
}