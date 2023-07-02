import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { useTimeline } from "./TimelineContext";

const VideoPlayer = ({ isVideoTabActive }) => {
  const { range } = useTimeline();
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

  const handleReady = () => {
    playerRef.current.seekTo(startTime, "seconds");
  };

  useEffect(() => {
    setIsPlaying(isVideoTabActive);
    if (isVideoTabActive) {
      playerRef.current.seekTo(startTime, "seconds");
    }
  }, [isVideoTabActive, startTime]);

  return (
    <div style={{ position: "relative", paddingBottom: "56.25%" }}>
      <ReactPlayer
        key={Date.now()} // force re-render
        ref={playerRef}
        url="https://youtu.be/vLI-6sLZTbI"
        playing={isPlaying} // use isPlaying state
        onProgress={handleProgress}
        onReady={handleReady}
        width="100%"
        height="100%"
        style={{ position: "absolute", top: "0", left: "0" }}
        playbackRate={1.5} // Set default playback rate to 1.5x
      />
    </div>
  );
};

export default VideoPlayer;
