import { useReadContract, useAccount, useWriteContract } from "wagmi";
import { contractAddress, contractABI } from "./lib/contract";
import { useState } from "react";
import TokenCard from "./components/TokenCard";
import Alert from "./components/Alert";
import Loader from "./components/Loader";
export default function MyCoins() {
    const [offset, setOffset] = useState(0);
    const account = useAccount();
    const writeContract = useWriteContract();
    const { data: tokenAddresses } = useReadContract({
        address: contractAddress as `0x${string}`,
        abi: contractABI,
        functionName: "getTokensByCreator",
        args: [offset],
        account: account.address
    }) as { data?: `0x${string}`[] };
    const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
    const [alert, setAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<"error" | "success" | "warning">("success");
    const [isLoading, setIsLoading] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState("");

    const handleNext = async () => {
        setOffset((val) => val + 10);
    }

    const graduate = async (address: string) => {
        try {
            setIsLoading(true);
            setLoaderMsg("Graduating Token");
            await writeContract.writeContractAsync({
                address: contractAddress as `0x${string}`,
                abi: contractABI,
                functionName: "graduate",
                args: [address]
            })
            setIsLoading(false);
            setAlertType("success");
            setAlertMsg("Token graduated successfully");
            setAlert(true);
            setTimeout(() => { setAlert(false) }, 3000);
        } catch (err) {
            setIsLoading(false);
            setAlertType("error");
            setAlertMsg("Error graduating Token. Please try again.");
            setAlert(true);
            setTimeout(() => { setAlert(false) }, 3000);
            console.error('There was an error', err);
        }
    }
    return (
        <div className="px-4 pt-25 pb-16 h-full w-full flex gap-5 justify-center text-center">
            <div className="mt-10">
                {isLoading && <Loader message={loaderMsg} />}
                {alert && <Alert message={alertMsg} type={alertType} />}
                <p className="text-gray-600 mb-2 text-xl text-center col-span-full">Token must raise 24 ETH in funding to be eligible for Graduation</p>
                <div className="flex flex-wrap justify-center gap-8 px-10 w-full">
                    {tokenAddresses && tokenAddresses.length > 0 ? (
                        tokenAddresses.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).map((tokenAddress: string, index: number) => (
                            <div className="flex flex-col items-center justify-center gap-2">
                                <TokenCard key={index} address={tokenAddress} />
                                <button onClick={() => graduate(tokenAddress)} type="button" className="rounded-2xl p-2 bg-green-600 text-white cursor-pointer hover:bg-green-800 transition-colors">Graduate</button>
                            </div>
                        ))
                    ) : (
                        <p className="text-white text-center col-span-full">You did not create any token.</p>
                    )}
                </div>
                {tokenAddresses && tokenAddresses.filter((tokenAddress: string) => tokenAddress !== ZERO_ADDRESS).length == 10 ?
                    <button type="button" onClick={handleNext} className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-4 cursor-pointer hover:bg-blue-700 transition-colors">Next Page</button>
                    : null
                }
            </div>
        </div>
    )
}