import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { contractAddress, contractABI } from "./lib/contract";
import { useState } from "react";
import TokenCard from "./components/TokenCard";
export default function MyCoins() {
    const [offset, setOffset] = useState(0);
    const account= useAccount();
    const writeContract = useWriteContract();
    const tokenAddresses = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "getTokensByCreator",
        args: [offset],
        account:account.address
    });
    const ZERO_ADDRESS="0x0000000000000000000000000000000000000000";
    const graduate = async(address:string)=>{
        
        const tx = await writeContract.writeContractAsync({
            address: contractAddress as `0x${string}`,
            abi: contractABI,
            functionName:"graduate",
            args:[address]
        })
        alert("Token Graduated");
    }
    return (
        <div className="px-4 pt-25 pb-16 h-full w-full flex gap-5 justify-center text-center">
            <div className="mt-10">
                    <p className="text-gray-600 mb-2 text-xl text-center col-span-full">Token must raise 24 ETH in funding to be eligible for Graduation</p>
                <div className="flex flex-wrap justify-center gap-8 px-10 w-full">
                    {tokenAddresses.data && tokenAddresses.data.length > 0 ? (
                        tokenAddresses.data.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).map((tokenAddress: string, index: number) => (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <TokenCard key={index} address={tokenAddress} />
                                <button onClick={()=>graduate(tokenAddress)} type="button" className="rounded-2xl p-2 bg-green-600 text-white cursor-pointer hover:bg-green-800 transition-colors">Graduate</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center col-span-full">You did not create any token.</p>
                    )}
                </div>
            </div>
        </div>
    )
}