import {useEffect, useState} from "react";

export default function ImageViewerWithFallback({ item }) {
    const [hasError, setHasError] = useState(false);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    // Check if image_url exists and is not an empty string
    const shouldShowImage = item && item.image_url && item.image_url.length > 0;

    useEffect(() => {
        if (item.image_url.length === 0) setHasError(true);
    }, [item]);

    const handleImageError = (e) => {
        e.target.onerror = null; // prevent infinite loop
        setHasError(true);
    };

    const openViewer = () => {
        setIsViewerOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
    };

    const closeViewer = () => {
        setIsViewerOpen(false);
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    };

    // Determine image source - use fallback if there's an error or no valid URL
    const imageSrc = hasError || !shouldShowImage ?
        "https://www.svgrepo.com/show/508699/landscape-placeholder.svg" :
        item.image_url;

    if (!shouldShowImage && !hasError) return null;

    return (
        <>
            {/* Thumbnail image */}
            <img
                src={imageSrc}
                alt={item?.vehicle_type || "Vehicle image"}
                className="w-12 h-12 object-cover rounded cursor-pointer"
                onError={handleImageError}
                onClick={openViewer}
            />

            {/* Full Screen Image Viewer */}
            {isViewerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="relative max-w-4xl mx-auto">
                        {/* Close button */}
                        <button
                            onClick={closeViewer}
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                        >
                            X
                        </button>

                        {/* Full-size image */}
                        <img
                            src={imageSrc}
                            alt={item?.vehicle_type || "Vehicle image"}
                            className="max-w-full max-h-screen object-contain"
                            onError={handleImageError}
                        />
                    </div>

                    {/* Click anywhere to close */}
                    <div
                        className="absolute inset-0 z-[-1]"
                        onClick={closeViewer}
                    />
                </div>
            )}
        </>
    );
}