import { useReadContract, useWriteContract, usePublicClient } from "wagmi";
import { contractABI, contractAddress } from "../lib/contract";
import Loader from "./Loader";
import axios from "axios";
import { useEffect, useState } from "react";
import { formatEther, parseEther } from "viem";
import { motion, AnimatePresence } from "motion/react";
import { erc20Abi } from "viem";
import Alert from "./Alert";

interface ITokenDetails {
    name: string,
    metaDataURI: string,
    symbol:string,
    tokenAddress: `0x${string}`,
    creatorAddress: `0x${string}`,
    hasGraduated: boolean,
    ethReserve: bigint,
    tokenReserve: bigint
}

interface IMetaData{
    image:string,
    description:string
}

export default function TokenCard({ address }: { address: string }) {
    const { data, refetch } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "getTokenDetails",
        args: [address],
    }) as { data?:ITokenDetails;refetch?: () => void;};
    const price = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateBuyingCost",
        args: [parseEther("1"), address],
    })
    const [metaData, setMetaData] = useState<IMetaData | null>(null);
    const [loadingMeta, setLoadingMeta] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [isBuying, setIsBuying] = useState(false);
    const [isSelling, setIsSelling] = useState(false);
    const [buyingAmount, setBuyingAmount] = useState("0");
    const [sellingAmount, setSellingAmount] = useState("0");
    const [isLoading, setIsLoading] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState("");
    const writeContract = useWriteContract();
    const publicClient = usePublicClient();
    const [alert, setAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<"error" | "success" | "warning">("success");

    const { data: buyingCost } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateBuyingCost",
        args: [parseEther(buyingAmount), address],
    }) as { data?: bigint };

    const { data: sellingPrice } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "calculateSellingPrice",
        args: [parseEther(sellingAmount), address],
    }) as { data?: bigint };

    const confirm = async () => {
        if (isBuying && buyingCost) {
            try {
                const tx = await writeContract.writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: "buyMemeToken",
                    args: [address, parseEther(buyingAmount)],
                    value: BigInt(buyingCost)
                })
                setLoaderMsg("Buying Token");
                setIsLoading(true);
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                setIsLoading(false);
                setAlertType("success");
                setAlertMsg("Token bought");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                refetch?.();
                await price.refetch();
            } catch (err) {
                setIsLoading(false);
                setAlertType("error");
                setAlertMsg("Failed to buy token");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                console.log(err);
            }
        } else if (isSelling) {
            try {
                setLoaderMsg("User Approving");
                setIsLoading(true);
                let tx = await writeContract.writeContractAsync({
                    address: address as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [contractAddress as `0x${string}`, parseEther(sellingAmount)]
                });
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                tx = await writeContract.writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: "sellMemeToken",
                    args: [address, parseEther(sellingAmount)]
                })
                setLoaderMsg("Selling Token");
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                setIsLoading(false);
                setAlertType("success");
                setAlertMsg("Token sold");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                refetch?.();
                await price.refetch();
            } catch (err) {
                setIsLoading(false);
                setAlertType("error");
                setAlertMsg("Failed to sell token");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                console.log(err);
            }
        }
    }

    const copyAddress = async () => {
        await navigator.clipboard.writeText(address);
        setAlertType("success");
        setAlertMsg("Address copied to clipboard");
        setAlert(true);
        setTimeout(() => { setAlert(false) }, 3000);
    }

    useEffect(() => {
        if (!data?.metaDataURI) return;

        const fetchMetaData = async () => {
            try {
                setLoadingMeta(true);

                const res = await axios.get(
                    `https://tokenforge-web2-backend.onrender.com/fetchJson/${data.metaDataURI}`
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
                    {isLoading &&
                        <Loader message={loaderMsg} />}
                    {alert && <Alert message={alertMsg} type={alertType} />}
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.15, ease: "easeInOut" }} className="bg-gray-800 relative rounded-lg p-8 w-[5/12] h-[69%] md:h-[55%] flex items-center justify-center flex-wrap">
                        <button onClick={() => { setIsBuying(false); setBuyingAmount("0"); setIsSelling(false); setSellingAmount("0"); setIsSelected(false) }} className="absolute top-2 right-2 text-white bg-red-700 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors">X</button>
                        <button type="button" onClick={copyAddress} className="absolute left-2 top-2 bg-gray-600 rounded-2xl p-2 cursor-pointer hover:bg-gray-900 active:translate-y-0.5">Address</button>
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
                             {data?.ethReserve? <p className="text-white text-xl">{`Funding Raised: ${Number(Number(formatEther(data.ethReserve)) - 6).toFixed(6)} ETH`}</p>:null}       
                            <div className="flex gap-3 mb-3">
                                <button type="button" onClick={() => { setIsSelling(false); setIsBuying(true) }} className="bg-green-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-green-700 transition-colors">Buy</button>
                                <button type="button" onClick={() => { setIsBuying(false); setIsSelling(true) }} className="bg-red-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-red-700 transition-colors">Sell</button>
                            </div>
                            {isBuying &&
                                <>
                                    <input type="text" onChange={(e) => { setBuyingAmount(!isNaN(Number(e.target.value)) ? e.target.value : "0") }} className="mb-4 mt-4 bg-gray-500 rounded-2xl p-2 " placeholder="Buying Amount" />
                                    {buyingCost != undefined ? (
                                        <p className="text-white text-xl">
                                            {Number(formatEther(buyingCost)).toFixed(6)} ETH
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
                                    {sellingPrice != undefined ? (
                                        <p className="text-white text-xl">
                                            {Number(formatEther(sellingPrice)).toFixed(6)} ETH
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
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ease: "easeInOut", delay: 0.4 }} onClick={() => setIsSelected(!isSelected)} className="bg-gray-800 flex rounded-lg w-116 p-6 items-center cursor-pointer hover:shadow-lg hover:shadow-500/50 transition-shadow">
                <img
                    className="w-24 h-24  mb-4 object-cover" loading="lazy"
                    src={
                        metaData?.image
                            ? `https://gateway.pinata.cloud/ipfs/${metaData.image}`
                            : ""
                    }
                    alt="Coin Image"
                />

                <div className="ml-6 flex flex-col items-center">
                    <h2 className="text-white font-bold text-xl mb-2">
                        {data?.name ? `${data?.name} (${data?.symbol})` : "Loading..."}
                    </h2>
                    <p className="text-gray-400 text-center text-sm mb-1">
                        {loadingMeta
                            ? "Loading description..."
                            : metaData?.description ?? "No Description Available"}
                    </p>
                    <p className="text-white text-xl">{data ? `Funding Raised: ${Number(Number(formatEther(data.ethReserve)) - 6).toFixed(6)} ETH` : "Loading"}</p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
