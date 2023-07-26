import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";

// Component responsible for visualizing the video
const VideoVisualisation = ({ isVideoTabActive, timeRange }) => {
  // The range in which the video should play
  const range = timeRange;
  const { sessionId } = useParams();

  // The start and end time for video playback in seconds
  const startTime = range[0];
  const endTime = range[1];

  // Reference to the ReactPlayer component
  const playerRef = useRef(null);

  // State variables for keeping track of the video playback and initialization
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Function to handle video progress
  const handleProgress = ({ playedSeconds }) => {
    // Pause the video once the played seconds exceed the end time
    if (playedSeconds > endTime) {
      setIsPlaying(false);
    }
  };

  // Function to handle video readiness
  const handleReady = () => {
    // Only seek to start time on the first ready event ---- or will keep loading
    if (!hasStarted) {
      playerRef.current.seekTo(startTime, "seconds");
      setHasStarted(true); // Indicate that we have started the video
    }
  };

  // Effect to handle tab activity and video initialization
  useEffect(() => {
    setIsPlaying(isVideoTabActive);
  }, [isVideoTabActive]); // Add dependencies for effect

  useEffect(() => {
    playerRef.current.seekTo(startTime, "seconds");
  }, [startTime]);

  const expressAddress = `${process.env.REACT_APP_EXPRESS_IP}:${process.env.REACT_APP_EXPRESS_PORT}`;

  const urlTarget = `${expressAddress}/data/${sessionId}/trancoded_output.mp4`;

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
        url={urlTarget}
        playing={isPlaying}
        onProgress={handleProgress}
        onReady={handleReady}
        width="100%"
        height="150%"
        style={{ position: "absolute", top: "-25%", left: "0" }}
        playbackRate={1}
        controls={true}
        playsInline={true} // Ensures compatibility with iOS and iPadOS
      />
    </div>
  );
};

export default VideoVisualisation;
