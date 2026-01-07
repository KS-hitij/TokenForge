function Dashboard() {

    return (
        <>
            <div className="container px-4 pt-40 pb-20 h-full">
                <h1 className="text-white text-center font-bold text-2xl ">Tokens You Can Trade</h1>
                <div className="mt-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-50 w-50 border-2 border-gray-400">
                            <img src="https://gateway.pinata.cloud/ipfs/bafkreififws4gdvcccs6vgamsaz6jarkewfmggdewxk63adee6hi73ngcy" alt="" />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Dashboard