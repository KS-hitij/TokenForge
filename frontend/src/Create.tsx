import { useState } from "react";
import axios from "axios";
import { useWriteContract, usePublicClient } from "wagmi";
import { contractAddress, contractABI } from "./lib/contract";
import { parseEther } from "viem";
import { makeImageSquare } from "./lib/helper";
import Loader from "./components/Loader";
import Alert from "./components/Alert";
export default function Create() {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [description, setDescription] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [symbol, setSymbol] = useState<string>("");
    const writeContract = useWriteContract();
    const publicClient = usePublicClient();
    const [isLoading, setIsLoading] = useState(false);
    const [loaderMsg, setLoaderMsg] = useState("");
    const [alert, setAlert] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertType, setAlertType] = useState<"error" | "success" | "warning">("success");

    const uploadMetaData = async () => {
        if (!imageFile) {
            setAlertType("warning");
            setAlertMsg("Please upload image");
            setAlert(true);
            setTimeout(() => { setAlert(false) }, 3000);
            return;
        }
        if (!name || !symbol || name.trim() === "" || symbol.trim() === "") {
            setAlertType("warning");
            setAlertMsg("Enter Token name and symbol");
            setAlert(true);
            setTimeout(() => { setAlert(false) }, 3000);
            return;
        }
        setLoaderMsg("Uploading Meta Data");
        setIsLoading(true);
        const formData = new FormData();
        const squareImageFile = await makeImageSquare(imageFile);
        formData.append('file', squareImageFile);
        formData.append('description', description);
        axios.post('https://tokenforge-web2-backend.onrender.com/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
            .then(async response => {
                setAlertType("success");
                setAlertMsg("Metadata uploaded, creating token");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                setLoaderMsg("Creating Token");
                const tx = await writeContract.writeContractAsync({
                    address: contractAddress as `0x${string}`,
                    abi: contractABI,
                    functionName: "createMemeToken",
                    args: [name, symbol, response.data],
                    value: parseEther("0.001"),
                })
                await publicClient?.waitForTransactionReceipt({ hash: tx });
                setIsLoading(false);
                setAlertType("success");
                setAlertMsg("Token created successfully");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                setDescription("");
                setName("");
                setSymbol("");
                setImageFile(null);
            })
            .catch(error => {
                setIsLoading(false);
                setAlertType("error");
                setAlertMsg("Error Creating Token. Please try again.");
                setAlert(true);
                setTimeout(() => { setAlert(false) }, 3000);
                console.error('There was an error uploading the file!', error);
            });
    }

    return (
        <>
            <div className="px-4 pt-25 pb-16 h-full w-full flex gap-5 justify-center text-center">
                {isLoading && <Loader message={loaderMsg} />}
                {alert && <Alert message={alertMsg} type={alertType} />}
                <div>
                    <h1 className="text-white font-bold text-center text-3xl ">Create a New Token</h1>
                    <div className="mt-8 max-w-lg flex flex-col  items-center">
                        <div className="max-w-lg mx-auto bg-gray-800/50 p-8 rounded-xl border border-gray-700 w-2xl">
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-white mb-2" htmlFor="name">Token Name</label>
                                    <input className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500" type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="MyToken" />
                                </div>
                                <div>
                                    <label className="block text-white mb-2" htmlFor="symbol">Token Symbol</label>
                                    <input className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500" type="text" id="symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="MTK" />
                                </div>
                                <div>
                                    <label className="block text-white mb-2" htmlFor="description">Write A Short Description <span className="text-gray-400"> (Optional)</span></label>
                                    <textarea maxLength={80} className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500" id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="This token is ...." />
                                </div>
                                <div>
                                    <label htmlFor="image" className="block text-white mb-2">Upload Token Image <span className="text-gray-400"> (1:1 ratio preferred)</span></label>
                                    <input id="image" type="file" accept="image/*" className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-purple-500" onChange={(e) =>{if(e.target.files) setImageFile(e.target.files[0] || null)}} />
                                    <p className="text-gray-400">Only Jpegs allowed</p>
                                </div>
                                <button className="w-full bg-purple-600 hover:bg-purple-700 cursor-pointer text-white font-bold py-3 px-6 rounded-lg transition-colors" role="button" onClick={uploadMetaData} type="button">Create Token</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    {imageFile && (
                        <div className="mt-6 ml-8">
                            <h2 className="text-white font-semibold mb-2">Image Preview:</h2>
                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="max-w-xs mx-auto rounded-lg border border-gray-600" />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}