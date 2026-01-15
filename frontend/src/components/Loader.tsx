export default function Loader({message}:{message:string}) {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-80">
            <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-gray-700 font-medium text-sm">{message}</p>
            </div>
        </div>
    );
}