import { FaChevronLeft } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

function Error({ error }) {
    const navigate = useNavigate();
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="flex flex-col w-fit h-fit items-center justify-center text-center px-4">
                <p className="font-logo text-[140px] leading-none text-[#00ff66] [text-shadow:0_0_24px_rgba(0,255,102,.6)] max-[500px]:text-[96px]">
                    {error === "404" ? "404" : "ERR"}
                </p>
                <h1 className="text-white text-[28px] mt-4 font-logo">
                    {error === "404" ? "Signal lost" : "Something went wrong"}
                </h1>
                <p className="mt-3 text-white/70">Oops! We couldn&apos;t find this page.</p>
                <button
                    onClick={() => navigate('/home')}
                    className="bg-[#00ff66] py-2 px-4 w-fit rounded-3xl text-black flex items-center gap-x-2 mt-7 hover:bg-white transition-colors"
                >
                    <FaChevronLeft className="text-[#00ff66] w-[20px] h-[20px] rounded-full p-1 bg-black" />
                    <span className="text-[18px]">Back to homepage</span>
                </button>
            </div>
        </div>
    )
}

export default Error
