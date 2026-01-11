import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { contractABI, contractAddress } from "../lib/contract";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { motion, AnimatePresence } from "motion/react";


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
    const [isSelected, setIsSelected] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [buyingAmount, setBuyingAmount] = useState("0");
    const [sellingAmount, setSellingAmount] = useState("0");
    const writeContract = useWriteContract();
    const publicClient = usePublicClient();


    const buyingCost = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateBuyingCost",
        args: [parseEther(buyingAmount), address],
    })
    const sellingPrice = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateSellingPrice",
        args: [parseEther(sellingAmount), address],
    })

    const confirm = async () => {
        if (isBuying) {
            try {
                const tx = await writeContract.writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: "buyMemeToken",
                    args: [address, parseEther(buyingAmount)],
                    value: BigInt(buyingCost.data)
                })
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                alert("Token bought");
            } catch (err) {
                alert("Error Encountered");
                console.log(err);
            }
        } else if (isSelling) {
            try {
                const tx = await writeContract.writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: "sellMemeToken",
                    args: [address, parseEther(sellingAmount)],
                    value: BigInt(sellingPrice.data)
                })
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                alert("Token Sold");
            } catch (err) {
                alert("Error Encountered");
                console.log(err);
            }

        }
    }

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

    if (isSelected) {
        return (
            <AnimatePresence>
                <motion.div className="absolute w-full h-full bg-black/65 flex justify-center items-center top-0 left-0 z-50" >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15, ease: "easeInOut" }} className="bg-gray-800 relative rounded-lg p-8 w-[5/12] h-[69%] md:h-[55%] flex items-center justify-center flex-wrap">
                        <button onClick={() => { setIsBuying(false); setBuyingAmount("0"); setIsSelling(false); setSellingAmount("0"); setIsSelected(!isSelected) }} className="absolute top-2 right-2 text-white bg-red-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">X</button>
                        <img className="md:w-80 md:h-80 h-40 w-40 object-cover" src={metaData?.image ? `https://gateway.pinata.cloud/ipfs/${metaData.image}` : ""} alt="Coin Image" />
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
                                    ? `Market Cap: ${((Number(formatEther(data.tokenReserve)) - 200000) * Number(formatEther(price.data))).toFixed(6)} ETH`
                                    : "Loading..."}
                            </p>
                            <p className="text-white text-xl">
                                {price.data
                                    ? `Liquidity: ${Number(Number(formatEther(data.ethReserve)).toFixed(6) - 6).toFixed(6)} ETH`
                                    : "Loading..."}
                            </p>
                            <div className="flex gap-3 mb-3">
                                <button onClick={() => { setIsSelling(false); setIsBuying(true) }} className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-green-700 transition-colors">Buy</button>
                                <button onClick={() => { setIsBuying(false); setIsSelling(true) }} className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-red-700 transition-colors">Sell</button>
                            </div>
                            {isBuying &&
                                <>
                                    <input type="text" onChange={(e) => { setBuyingAmount(!isNaN(Number(e.target.value)) ? e.target.value : "0") }} className="mb-4 mt-4 bg-gray-500 rounded-2xl p-2 " placeholder="Buying Amount" />
                                    {buyingCost.data != undefined ? (
                                        <p className="text-white text-xl">
                                            {Number(formatEther(buyingCost.data)).toFixed(6)} ETH
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-xl">Calculating...</p>
                                    )}
                                    <button type="button" onClick={confirm} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700 transition-colors">Confirm</button>
                                </>
                            }
                            {isSelling &&
                                <>
                                    <input type="text" onChange={(e) => { setSellingAmount(!isNaN(Number(e.target.value)) ? e.target.value : "0") }} className="mb-4 mt-4 bg-gray-500 rounded-2xl p-2 " placeholder="Selling Amount" />
                                    {sellingPrice.data != undefined ? (
                                        <p className="text-white text-xl">
                                            {Number(formatEther(sellingPrice.data)).toFixed(6)} ETH
                                        </p>
                                    ) : (
                                        <p className="text-gray-400 text-xl">Calculating...</p>
                                    )}
                                    <button type="button" onClick={confirm} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700 transition-colors">Confirm</button>
                                </>
                            }
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        )
    }

    return (
        <AnimatePresence>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ease: "easeInOut", delay: 0.4 }} onClick={() => setIsSelected(!isSelected)} className="bg-gray-800 flex rounded-lg w-108 p-6 items-center cursor-pointer hover:shadow-lg hover:shadow-500/50 transition-shadow">
                <img
                    className="w-24 h-24  mb-4 object-cover" loading="lazy"
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
                            ? `Market Cap: ${((Number(formatEther(data.tokenReserve)) - 200000) * Number(formatEther(price.data))).toFixed(6)} ETH`
                            : "Loading..."}
                    </p>

                    <p className="text-white">
                        {price.data
                            ? `Liquidity: ${Number(Number(formatEther(data.ethReserve)).toFixed(6) - 6).toFixed(6)} ETH`
                            : "Loading..."}
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
