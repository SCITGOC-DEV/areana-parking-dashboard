export const Loader = () => {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="relative">
                {/* Outer rotating ring */}
                <div className="w-12 h-12 rounded-full border-3 border-gray-200 border-t-blue-500 border-r-blue-500 animate-spin"></div>

                {/* Inner counter-rotating ring */}
                <div className="absolute inset-0 w-12 h-12 rounded-full border-3 border-transparent border-l-purple-400 border-b-purple-400 animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>

                {/* Center pulsing dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>

                {/* Orbital particles */}
                <div className="absolute inset-0 w-12 h-12 animate-spin" style={{animationDuration: '3s'}}>
                    <div className="w-1 h-1 bg-purple-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-1 h-1 bg-blue-400 rounded-full absolute top-1/2 -right-0.5 transform -translate-y-1/2"></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full absolute top-1/2 -left-0.5 transform -translate-y-1/2"></div>
                </div>
            </div>
        </div>
    );
};
