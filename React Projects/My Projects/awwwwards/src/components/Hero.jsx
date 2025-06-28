import React, {useEffect, useRef, useState} from 'react'

const Hero = () => {

    const totalVideos = 4;

    const [currentIndex, setCurrentIndex] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasClickced, setHasClickced] = useState(false);
    const [loadedVideos, setLoadedVideos] = useState(0);
    const nextVideoRef = useRef(null);


    const handleMiniClick = () => {
        setHasClickced(true);
        setCurrentIndex((prev)=>(prev%totalVideos)+1);
    }

    const handleVideoLoad = () => {
        setLoadedVideos((prev)=>prev+1);
    }

    useEffect(() => {
        if(loadedVideos === totalVideos-1){
            setLoading(false);
        }
    }, [loadedVideos]);

    const getVideoSrc = (index) => `videos/hero-${index}.mp4`

    return (
        <div className="relative h-dvh w-screen overflow-x-hidden">
            <div id="video-frame" className="relative z-10 w-screen h-dvh bg-blue-75 rounded-lg overflow-hidden">
                <div>
                    <div className="max-clip-path absolute-center absolute z-50 size-6
                     cursor-pointer overflow-hidden rounded-lg">
                        <div className="origin-center scale-50 opacity-0 transition-all ease-in hover:scale-100 hover:opacity-100" onClick={handleMiniClick}>
                            <video
                                src={getVideoSrc(currentIndex % totalVideos + 1)}
                                ref={nextVideoRef}
                                id="current-video"
                                // type="video/mp4"
                                loop
                                muted
                                onLoadedData={handleVideoLoad}
                                className="size-64 origin-center scale-150 object-cover object-center"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default Hero
