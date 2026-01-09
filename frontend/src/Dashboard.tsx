import { useState} from "react"
import { useReadContract } from "wagmi"
import TokenCard from "./components/TokenCard"
import { contractABI, contractAddress } from "./lib/contract"


function Dashboard() {
    const [offset, setOffset] = useState(0)
    const tokenAddresses = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName:"getTokensAddress",
        args:[offset]
    })
    const ZERO_ADDRESS="0x0000000000000000000000000000000000000000"

    return (
        <>
            <div className="px-4 pt-40 pb-20 h-full">
                <h1 className="text-white text-center font-bold text-2xl ">Tokens You Can Trade</h1>
                <div className="mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-10">
                    {tokenAddresses.data && tokenAddresses.data.length > 0 ? (
                        tokenAddresses.data.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).map((tokenAddress: string, index: number) => (
                            <TokenCard key={index} address={tokenAddress} />
                        ))
                    ) : (
                        <p className="text-white text-center col-span-full">No tokens available for trading.</p>
                    )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard