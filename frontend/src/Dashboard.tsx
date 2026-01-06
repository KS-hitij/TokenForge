import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

function Dashboard() {
    
    return (
        <div className="min-h-screen bg-linear-to-b flex flex-col justify-between from-gray-900 via-gray-800 to-gray-900">
            <Navbar />
                <div className="container px-4 pt-40 pb-20 h-full">
                    <h1 className="text-white text-center font-bold text-2xl ">Tokens You Can Trade</h1>
                    <div className="mt-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Token cards will go here */}
                        </div>
                    </div>
                </div>
            <Footer />
        </div>
    )
}

export default Dashboard