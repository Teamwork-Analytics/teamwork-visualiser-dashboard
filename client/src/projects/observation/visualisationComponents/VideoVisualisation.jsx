import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

const VideoVisualisation = ({ isVideoTabActive, timeRange }) => {
  const range = timeRange;
  const playerRef = useRef(null);
  const startTime = range[0]; // start time in seconds
  const endTime = range[1]; // end time in seconds
  const [isPlaying, setIsPlaying] = useState(false);

  const handleProgress = ({ playedSeconds }) => {
    // if the current played seconds is more than end time
    // pause the video
    if (playedSeconds > endTime) {
      setIsPlaying(false);
    }
  };

  // seek to startime before play
  const handleReady = () => {
    playerRef.current.seekTo(startTime, "seconds");
  };

  // only play when video tab is active
  useEffect(() => {
    setIsPlaying(isVideoTabActive);
    if (isVideoTabActive) {
      playerRef.current.seekTo(startTime, "seconds");
    }
  }, [isVideoTabActive, startTime]);

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "30%", // adjust based on ratio
        overflow: "hidden", // hide top bottom black area
        width: "100%",
      }}
    >
      <ReactPlayer
        key={Date.now()} // force re-render
        ref={playerRef}
        url="https://youtu.be/vLI-6sLZTbI"
        // url={videoFile} // TODO: not working, inspection needed
        playing={isPlaying} // use isPlaying state
        onProgress={handleProgress}
        onReady={handleReady}
        width="100%"
        height="150%"
        style={{
          position: "absolute",
          top: "-25%", // hard-coded to hide video top black area
          left: "0",
        }}
        playbackRate={1}
      />
    </div>
  );
};

export default VideoVisualisation;
