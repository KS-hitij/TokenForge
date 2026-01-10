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


    useEffect(() => {
        if (!data?.metaDataURI) return;

        const fetchMetaData = async () => {
            try {
                setLoadingMeta(true);

                const res = await axios.get(
                    `http://localhost:5000/fetchJson/${data.metaDataURI}`
                );

                setMetaData(res.data.data);
                console.log(res.data.data);

            } catch (err) {
                console.error("Failed to fetch metadata:", err);
            } finally {
                setLoadingMeta(false);
            }
        };

        fetchMetaData();
    }, [data?.metaDataURI]);

    return (
        <div className="bg-gray-800 flex rounded-lg w-108 p-4 items-center cursor-pointer hover:shadow-lg hover:shadow-500/50 transition-shadow">
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
