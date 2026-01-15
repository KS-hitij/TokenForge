import contract from "./contract.json" assert { type: "json" }
import { erc20Abi } from "viem";
export const contractABI = contract.abi;
export const contractAddress = contract.contractAddress;
