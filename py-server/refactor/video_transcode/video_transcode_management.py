import subprocess
import os
from util.logging_util import logger


def transcode_video(simulation_id, data_dir, result_dir):
    """
        Transcodes simulation videos into a standard format.

        Args:
            simulation_id (str): Identifier for the simulation.
            data_dir (str): Directory containing the input video file.
            result_dir (str): Directory to save the transcoded video.
        """
    input_file = "{}/{}.mp4".format(data_dir, simulation_id)
    output_file = "{}/transcoded_output.mp4".format(result_dir)

    if not (os.path.exists(output_file)):
        ffmpeg_command = [
            "ffmpeg",
            "-i", input_file,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-strict", "experimental",
            output_file
        ]

        # Execute the FFmpeg command using subprocess
        try:
            subprocess.run(ffmpeg_command, check=True)
            logger().info(f"{output_file} successfully created under {result_dir}")
            logger().info("Transcoding completed successfully")
        except subprocess.CalledProcessError:
            logger().exception("Transcoding failed.")
