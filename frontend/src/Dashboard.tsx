import { useState } from "react";
import { useReadContract } from "wagmi";
import TokenCard from "./components/TokenCard";
import { contractABI, contractAddress } from "./lib/contract";

function Dashboard() {
    const [offset, setOffset] = useState(0);
    const { data: tokenAddresses } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "getTokensAddress",
        args: [offset],
    }) as { data?: `0x${string}`[] };
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

    const handleNext = async () => {
        setOffset((val) => val + 10);
    }

    return (
        <>
            <div className="px-4 pt-40 pb-20 h-full">
                <h1 className="text-white text-center font-bold text-2xl ">Tokens You Can Trade</h1>
                <div className="mt-10">
                    <div className="flex flex-wrap justify-center gap-8 px-10 w-full h-full">
                        {tokenAddresses && tokenAddresses.length > 0 ? (
                            tokenAddresses.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).map((tokenAddress: string, index: number) => (
                                <TokenCard key={index} address={tokenAddress} />
                            ))
                        ) : (
                            <p className="text-white text-center col-span-full">No tokens available for trading.</p>
                        )}
                    </div>
                    {tokenAddresses && tokenAddresses.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).length == 10 ?
                        <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700 transition-colors">Next Page</button>
                        : null
                    }
                </div>
            </div>
        </>
    )
}

export default Dashboard