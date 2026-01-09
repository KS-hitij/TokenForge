import { useReadContract } from "wagmi"
import { contractABI, contractAddress } from "../lib/contract"

export default function TokenCard({address}: {address: string}) {
    const tokenData = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName:"getTokenDetails",
        args:[address]
    })
    return (
        <div className="bg-gray-800 rounded-lg p-6 flex flex-col items-center cursor-pointer hover:shadow-lg hover:shadow-500/50 transition-shadow">
            <h2 className="text-white font-bold text-xl mb-4">Token Name: {tokenData.data ? tokenData.data.name : "Loading..."}</h2>
            <p className="text-gray-400 mb-2">Symbol: {tokenData.data ? tokenData.data.symbol : "Loading..."}</p>
            <p className="text-gray-400 break-all">Address: {address}</p>
        </div>
    )
}