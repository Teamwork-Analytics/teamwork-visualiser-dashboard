import * as React from "react";
import videojs from "video.js";
import VideoComponent from "./VideoComponent";
import videoMp4 from "./data/sample.mp4";

const VideoView = () => {
  const playerRef = React.useRef(null);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoMp4,
        type: "video/mp4",
      },
    ],
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    // You can handle player events here, for example:
    player.on("waiting", () => {
      videojs.log("player is waiting");
    });

    player.on("dispose", () => {
      videojs.log("player will dispose");
    });
  };

  return (
    <div style={{ width: "90%", margin: "0 auto" }}>
      <VideoComponent options={videoJsOptions} onReady={handlePlayerReady} />
    </div>
  );
};

export default VideoView;
