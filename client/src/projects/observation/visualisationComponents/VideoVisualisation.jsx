import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";

const VideoVisualisation = ({ isVideoTabActive, timeRange }) => {
  const range = timeRange;
  const playerRef = useRef(null);
  const startTime = range[0]; // start time in seconds
  const endTime = range[1]; // end time in seconds
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false); // new state variable

  const handleProgress = ({ playedSeconds }) => {
    console.log("handleProgress called", { playedSeconds, endTime });
    if (playedSeconds > endTime) {
      setIsPlaying(false);
    }
  };

  const handleReady = () => {
    console.log("handleReady called");
    // only seek to startTime on the first ready event
    if (!hasStarted) {
      playerRef.current.seekTo(startTime, "seconds");
      setHasStarted(true); // mark that we've started the video
    }
  };

  useEffect(() => {
    console.log("useEffect called", { isVideoTabActive, startTime });
    setIsPlaying(isVideoTabActive);
    playerRef.current.seekTo(startTime, "seconds");
  }, [isVideoTabActive, startTime, hasStarted]); // add hasStarted to dependencies

  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "30%",
        overflow: "hidden",
        width: "100%",
      }}
    >
      <ReactPlayer
        ref={playerRef}
        // url="https://youtu.be/vLI-6sLZTbI" // 101R sim (251?)
        // url="https://youtu.be/vCo1QyWKdPM" // 225 sim
        // url="https://youtu.be/3fve4RsNxkY" // 239 sim
        url="http://49.127.43.80:5002/data/101R/trancoded_output.mp4"
        playing={isPlaying}
        onProgress={handleProgress}
        onReady={handleReady}
        width="100%"
        height="150%"
        style={{ position: "absolute", top: "-25%", left: "0" }}
        playbackRate={1}
        controls={true}
        playsInline={true} // needed for ios and ipadOS
      />
    </div>
  );
};

export default VideoVisualisation;
