import { useReadContract } from "wagmi";
import { contractABI, contractAddress } from "../lib/contract";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";

export default function TokenCard({ address }: { address: string }) {
    const { data } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "getTokenDetails",
        args: [address],
    });
    const price = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateBuyingCost",
        args: [parseEther("1"), address],
    })
    const [metaData, setMetaData] = useState<any>(null);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [isSelected,setIsSelected] = useState(false);
    const [isBuying,setIsBuying] = useState(false);
    const [isSelling,setIsSelling] = useState(false);
    const [buyingAmount,setBuyingAmount] = useState("");
    const [sellingAmount,setSellingAmount] = useState("");


    useEffect(() => {
        if (!data?.metaDataURI) return;

        const fetchMetaData = async () => {
            try {
                setLoadingMeta(true);

                const res = await axios.get(
                    `http://localhost:5000/fetchJson/${data.metaDataURI}`
                );

                setMetaData(res.data.data);
            } catch (err) {
                console.error("Failed to fetch metadata:", err);
            } finally {
                setLoadingMeta(false);
            }
        };

        fetchMetaData();
    }, [data?.metaDataURI]);

    if(isSelected){
        return(
            <div className="absolute w-full h-full bg-black/65 flex justify-center items-center top-0 left-0 z-50" >
                <div className="bg-gray-800 relative rounded-lg p-8 w-[5/12] h-1/2 flex items-center flex-wrap">
                    <button onClick={()=>setIsSelected(!isSelected)} className="absolute top-2 right-2 text-white bg-red-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">X</button>
                    <img className="w-80 h-80 object-cover" src={metaData?.image ? `https://gateway.pinata.cloud/ipfs/${metaData.image}` : ""} alt="Coin Image" />
                    <div className="ml-4 flex flex-col items-center">
                        <h2 className="text-white font-bold text-3xl mb-4">
                            {data?.name ? `${data?.name} (${data?.symbol})` : "Loading..."}
                        </h2>
                        <p className="text-gray-400 text-center text-lg mb-4">
                            {loadingMeta
                                ? "Loading description..."
                                : metaData?.description ?? "No Description Available"}
                        </p>
                        <p className="text-white text-xl mb-2">
                            {price.data
                                ? `Market Cap: ${(formatEther(data.tokenReserve) - 200000) * Number(formatEther(price.data)).toFixed(6)} ETH`
                                : "Loading..."}
                        </p>
                        <p className="text-white text-xl">
                            {price.data
                                ? `Liquidity: ${Number(formatEther(data.ethReserve)).toFixed(6) - 6} ETH`
                                : "Loading..."}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={()=>setIsBuying(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-green-700 transition-colors">Buy</button>
                            <button onClick={()=>setIsSelling(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-red-700 transition-colors">Sell</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div onClick={() => setIsSelected(!isSelected)} className="bg-gray-800 flex rounded-lg w-108 p-4 items-center cursor-pointer hover:shadow-lg hover:shadow-500/50 transition-shadow">
            <img
                className="w-24 h-24  mb-4 object-cover"
                src={
                    metaData?.image
                        ? `https://gateway.pinata.cloud/ipfs/${metaData.image}`
                        : ""
                }
                alt="Coin Image"
            />

            <div className="ml-4 flex flex-col items-center">
                <h2 className="text-white font-bold text-xl mb-2">
                    {data?.name ? `${data?.name} (${data?.symbol})` : "Loading..."}
                </h2>

                <p className="text-gray-400 text-center text-sm mb-1">
                    {loadingMeta
                        ? "Loading description..."
                        : metaData?.description ?? "No Description Available"}
                </p>

                <p className="text-white">
                    {price.data
                        ? `Market Cap: ${(formatEther(data.tokenReserve) - 200000) * Number(formatEther(price.data)).toFixed(6)} ETH`
                        : "Loading..."}
                </p>

                <p className="text-white">
                    {price.data
                        ? `Liquidity: ${Number(formatEther(data.ethReserve)).toFixed(6) - 6} ETH`
                        : "Loading..."}
                </p>
            </div>
        </div>
    );
}
