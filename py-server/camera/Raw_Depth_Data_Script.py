import depthai as dai
import numpy as np
import cv2
import os
from datetime import datetime
import time

# Output directory
output_dir = r"C:\Users\colam\Documents\DepthCamera_Videos\Raw_Depth_Data"
os.makedirs(output_dir, exist_ok=True)

print("🔍 Waiting for DepthAI device...")

while True:
    try:
        with dai.Device() as device:
            print("✅ DepthAI device connected.")

            # Create pipeline
            pipeline = dai.Pipeline()

            # Mono Cameras
            mono_left = pipeline.create(dai.node.MonoCamera)
            mono_right = pipeline.create(dai.node.MonoCamera)

            mono_left.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
            mono_right.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
            mono_left.setBoardSocket(dai.CameraBoardSocket.LEFT)
            mono_right.setBoardSocket(dai.CameraBoardSocket.RIGHT)

            # Stereo Depth Node
            stereo = pipeline.create(dai.node.StereoDepth)
            stereo.setConfidenceThreshold(200)
            stereo.setOutputDepth(True)
            stereo.setOutputRectified(True)

            mono_left.out.link(stereo.left)
            mono_right.out.link(stereo.right)

            xout_depth = pipeline.create(dai.node.XLinkOut)
            xout_depth.setStreamName("depth")
            stereo.depth.link(xout_depth.input)

            # Start pipeline
            device.startPipeline(pipeline)
            depth_queue = device.getOutputQueue("depth", maxSize=4, blocking=False)

            print("📡 Capturing depth data... Press 'q' or close the window to stop.")

            while True:
                if not device.isPipelineRunning():
                    print("❌ Pipeline stopped or camera disconnected.")
                    break

                in_depth = depth_queue.tryGet()
                if in_depth is not None:
                    depth_frame = in_depth.getFrame()

                    # Timestamp
                    now = datetime.now().strftime("%Y-%m-%d_%H-%M-%S-%f")

                    # Save as .npy
                    npy_path = os.path.join(output_dir, f"depth_raw_{now}.npy")
                    np.save(npy_path, depth_frame)

                    # Save as .csv
                    csv_path = os.path.join(output_dir, f"depth_raw_{now}.csv")
                    np.savetxt(csv_path, depth_frame, delimiter=",", fmt="%d")

                    # Show preview
                    preview = cv2.normalize(depth_frame, None, 0, 255, cv2.NORM_MINMAX)
                    preview = np.uint8(preview)
                    preview = cv2.applyColorMap(preview, cv2.COLORMAP_JET)
                    cv2.imshow("Depth Viewer", preview)

                    if cv2.waitKey(1) & 0xFF == ord('q'):
                        print("🛑 Quit key pressed. Stopping.")
                        break

            cv2.destroyAllWindows()
            print("✅ Session ended.\n")

    except Exception as e:
        print("🔌 No device detected. Retrying in 5 seconds...")
        time.sleep(5)
