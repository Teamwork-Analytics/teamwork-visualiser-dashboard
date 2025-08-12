import socketserver
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from time import sleep
import depthai as dai
import numpy as np
import cv2
import blobconverter
import os
from datetime import datetime
import json

HTTP_SERVER_PORT = 8090

# Global control variables
is_running = False
should_stop = False
control_lock = threading.Lock()

class TCPServerRequest(socketserver.BaseRequestHandler):
    def handle(self):
        header = ('HTTP/1.0 200 OK\r\nServer: Mozarella/2.2\r\nAccept-Range: bytes\r\n'
                  'Connection: close\r\nMax-Age: 0\r\nExpires: 0\r\nCache-Control: no-cache, private\r\n'
                  'Pragma: no-cache\r\nContent-Type: application/json\r\n\r\n')
        self.request.send(header.encode())
        while True:
            sleep(0.1)
            if hasattr(self.server, 'datatosend'):
                self.request.send(self.server.datatosend.encode() + "\r\n".encode())

class VideoStreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'multipart/x-mixed-replace; boundary=--jpgboundary')
        self.end_headers()
        while True:
            sleep(0.1)
            if hasattr(self.server, 'frametosend'):
                ok, encoded = cv2.imencode('.jpg', self.server.frametosend)
                self.wfile.write("--jpgboundary".encode())
                self.send_header('Content-type', 'image/2')
                self.send_header('Content-length', str(len(encoded)))
                self.end_headers()
                self.wfile.write(encoded)
                self.end_headers()

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    pass

# Start the servers
server_TCP = socketserver.TCPServer(('localhost', 8071), TCPServerRequest)
th = threading.Thread(target=server_TCP.serve_forever)
th.daemon = True
th.start()

server_HTTP = ThreadedHTTPServer(('localhost', HTTP_SERVER_PORT), VideoStreamHandler)
th2 = threading.Thread(target=server_HTTP.serve_forever)
th2.daemon = True
th2.start()

labelMap = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow",
            "diningtable", "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"]

syncNN = True

def create_pipeline(depth):
    pipeline = dai.Pipeline()
    colorCam = pipeline.create(dai.node.ColorCamera)

    if depth:
        mobilenet = pipeline.create(dai.node.MobileNetSpatialDetectionNetwork)
        monoLeft = pipeline.create(dai.node.MonoCamera)
        monoRight = pipeline.create(dai.node.MonoCamera)
        stereo = pipeline.create(dai.node.StereoDepth)
    else:
        mobilenet = pipeline.create(dai.node.MobileNetDetectionNetwork)

    colorCam.setPreviewSize(300, 300)
    colorCam.setResolution(dai.ColorCameraProperties.SensorResolution.THE_1080_P)
    colorCam.setInterleaved(False)
    colorCam.setColorOrder(dai.ColorCameraProperties.ColorOrder.BGR)

    mobilenet.setBlobPath(blobconverter.from_zoo("mobilenet-ssd", shaves=6))
    mobilenet.setConfidenceThreshold(0.5)
    mobilenet.input.setBlocking(False)

    if depth:
        monoLeft.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
        monoLeft.setBoardSocket(dai.CameraBoardSocket.LEFT)
        monoRight.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
        monoRight.setBoardSocket(dai.CameraBoardSocket.RIGHT)

        stereo.initialConfig.setConfidenceThreshold(255)
        stereo.depth.link(mobilenet.inputDepth)
        stereo.setDepthAlign(dai.CameraBoardSocket.RGB)

        mobilenet.setBoundingBoxScaleFactor(0.5)
        mobilenet.setDepthLowerThreshold(100)
        mobilenet.setDepthUpperThreshold(5000)

        monoLeft.out.link(stereo.left)
        monoRight.out.link(stereo.right)

        xoutDepth = pipeline.create(dai.node.XLinkOut)
        xoutDepth.setStreamName("depth")
        mobilenet.passthroughDepth.link(xoutDepth.input)

    xoutRgb = pipeline.create(dai.node.XLinkOut)
    xoutRgb.setStreamName("rgb")
    colorCam.preview.link(mobilenet.input)
    if syncNN:
        mobilenet.passthrough.link(xoutRgb.input)
    else:
        colorCam.preview.link(xoutRgb.input)

    xoutNN = pipeline.create(dai.node.XLinkOut)
    xoutNN.setStreamName("detections")
    mobilenet.out.link(xoutNN.input)

    return pipeline


def initialise_depth_RGB_only_pipeline():

    pipeline = dai.Pipeline()
    # result_excel = pd.DataFrame({"timestamp": [], "depth_frame": [], "rgb_frame": [] })
    # Create mono cameras
    monoLeft = pipeline.create(dai.node.MonoCamera)
    monoRight = pipeline.create(dai.node.MonoCamera)
    monoLeft.setBoardSocket(dai.CameraBoardSocket.LEFT)
    monoRight.setBoardSocket(dai.CameraBoardSocket.RIGHT)
    monoLeft.setResolution(dai.MonoCameraProperties.SensorResolution.THE_800_P)
    monoRight.setResolution(dai.MonoCameraProperties.SensorResolution.THE_800_P)

    # Create stereo depth node
    stereo = pipeline.create(dai.node.StereoDepth)
    stereo.setDefaultProfilePreset(dai.node.StereoDepth.PresetMode.HIGH_DENSITY)
    monoLeft.out.link(stereo.left)
    monoRight.out.link(stereo.right)

    # Output
    xoutDepth = pipeline.create(dai.node.XLinkOut)
    xoutDepth.setStreamName("depth")
    stereo.depth.link(xoutDepth.input)

    # create the pipeline rgb color
    # https://docs.luxonis.com/software/depthai/examples/rgb_full_resolution_saver/
    camRgb = pipeline.create(dai.node.ColorCamera)
    camRgb.setBoardSocket(dai.CameraBoardSocket.CAM_A)
    camRgb.setResolution(dai.ColorCameraProperties.SensorResolution.THE_800_P)
    xoutRgb = pipeline.create(dai.node.XLinkOut)
    xoutRgb.setStreamName("rgb")
    camRgb.video.link(xoutRgb.input)
    return pipeline


def start_capture_depth_RGB(pipeline, save_folder, save_interval):

    with dai.Device(pipeline) as device:
        depthQueue = device.getOutputQueue(name="depth", maxSize=4, blocking=False)
        rgbQueue = device.getOutputQueue(name="rgb", maxSize=4, blocking=False)
        last_save_time = time.time()

        print("Starting depth capture and saving... Press Ctrl+C to stop.")

        try:
            while True and not should_stop:
                inDepth = depthQueue.get()
                inRGB = rgbQueue.get()
                current_time = time.time()
                
                if (current_time - last_save_time) >= save_interval:
                    # Retrieve depth frame as numpy array
                    depthFrame = inDepth.getFrame()
                    rgbFrame = inRGB.getCvFrame()
                    # print(depthFrame)
                    # print(depthFrame.shape)
                    # print(rgbFrame)
                    # print(rgbFrame.shape)
                    # print(depthFrame.)
                    # Save raw depth data matrix
                    timestamp_str = datetime.now().strftime("%Y%m%d_%H%M%S.%f")
                    depthSaveFileName = os.path.join(save_folder, f"depth_{timestamp_str}.npy")
                    rgbSaveFileName = os.path.join(save_folder, f"rgb_{timestamp_str}.npy")
                    np.save(depthSaveFileName, depthFrame)
                    np.save(rgbSaveFileName, rgbFrame)
                    # np.savetxt(csv_path, depth_frame, delimiter=",", fmt="%d")
                    # print(f"Saved: {depthSaveFileName}, shape: {depthFrame.shape}")
                    # print(f"Saved: {rgbSaveFileName}, shape: {rgbFrame.shape}")
                    last_save_time = current_time

        except KeyboardInterrupt:
            print("Stopped by user.")

def capture_camera_data_legacy():
    while not should_stop:
        out = None
        filename = None
        try:
            with dai.Device() as device:
                if should_stop:
                    break
                    
                cams = device.getConnectedCameras()
                if not cams:
                    print("No DepthAI cameras detected.")
                    time.sleep(5)
                    if should_stop:
                        break
                    continue

                depth_enabled = dai.CameraBoardSocket.LEFT in cams and dai.CameraBoardSocket.RIGHT in cams
                device.startPipeline(create_pipeline(depth_enabled))
                print(f"DepthAI is up & running. Navigate to 'localhost:{HTTP_SERVER_PORT}' to view stream.")

                previewQueue = device.getOutputQueue(name="rgb", maxSize=4, blocking=False)
                detectionNNQueue = device.getOutputQueue(name="detections", maxSize=4, blocking=False)
                if depth_enabled:
                    depthQueue = device.getOutputQueue(name="depth", maxSize=4, blocking=False)

                frame = None
                depthFrame = None
                detections = []
                startTime = time.monotonic()
                counter = 0
                fps = 0
                color = (255, 255, 255)

                timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
                filename = os.path.join(save_path, f"depth_camera_{timestamp}.avi")

                while not should_stop:
                    if not device.isPipelineRunning() or should_stop:
                        print("Pipeline stopped or stop signal received. Ending recording.")
                        break
                    
                    inPreview = previewQueue.tryGet()
                    inNN = detectionNNQueue.tryGet()
                    if inPreview is None or inNN is None:
                        continue

                    frame = inPreview.getCvFrame()
                    detections = inNN.detections

                    counter += 1
                    current_time = time.monotonic()
                    if (current_time - startTime) > 1:
                        fps = counter / (current_time - startTime)
                        counter = 0
                        startTime = current_time

                    if depth_enabled:
                        depthData = depthQueue.tryGet()
                        if depthData:
                            depthFrame = depthData.getFrame()
                            depthFrame = cv2.normalize(depthFrame, None, 255, 0, cv2.NORM_INF, cv2.CV_8UC1)
                            depthFrame = cv2.equalizeHist(depthFrame)
                            depthFrame = cv2.applyColorMap(depthFrame, cv2.COLORMAP_HOT)

                    height, width = frame.shape[:2]
                    for detection in detections:
                        x1 = int(detection.xmin * width)
                        x2 = int(detection.xmax * width)
                        y1 = int(detection.ymin * height)
                        y2 = int(detection.ymax * height)
                        label = labelMap[detection.label] if detection.label < len(labelMap) else str(detection.label)
                        cv2.putText(frame, str(label), (x1 + 10, y1 + 20), cv2.FONT_HERSHEY_TRIPLEX, 0.5, color)
                        cv2.putText(frame, "{:.2f}".format(detection.confidence * 100), (x1 + 10, y1 + 35), cv2.FONT_HERSHEY_TRIPLEX, 0.5, color)
                        if depth_enabled:
                            cv2.putText(frame, f"X: {int(detection.spatialCoordinates.x)} mm", (x1 + 10, y1 + 50), cv2.FONT_HERSHEY_TRIPLEX, 0.5, color)
                            cv2.putText(frame, f"Y: {int(detection.spatialCoordinates.y)} mm", (x1 + 10, y1 + 65), cv2.FONT_HERSHEY_TRIPLEX, 0.5, color)
                            cv2.putText(frame, f"Z: {int(detection.spatialCoordinates.z)} mm", (x1 + 10, y1 + 80), cv2.FONT_HERSHEY_TRIPLEX, 0.5, color)
                        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 1)
                        server_TCP.datatosend = f"{label},{int(detection.confidence * 100)}%"

                    cv2.putText(frame, "NN fps: {:.2f}".format(fps), (2, frame.shape[0] - 4), cv2.FONT_HERSHEY_TRIPLEX, 0.4, color)

                    display_frame = frame
                    if depth_enabled and depthFrame is not None:
                        new_width = int(depthFrame.shape[1] * (frame.shape[0] / depthFrame.shape[0]))
                        display_frame = np.hstack([frame, cv2.resize(depthFrame, (new_width, frame.shape[0]))])

                    server_HTTP.frametosend = display_frame

                    if out is None:
                        out = cv2.VideoWriter(
                            filename,
                            cv2.VideoWriter_fourcc(*'XVID'),
                            20.0,
                            (display_frame.shape[1], display_frame.shape[0])
                        )
                        if not out.isOpened():
                            print("Error: Could not open video writer.")
                            break
                    out.write(display_frame)

        except Exception as e:
            print(f"Error: {e}")

        finally:
            if out is not None:
                out.release()
            cv2.destroyAllWindows()
            if filename:
                print(f"Recording saved at: {filename}")
            
            if should_stop:
                break
            else:
                print("Waiting for DepthAI device to reconnect...")
                time.sleep(5)
    
    with control_lock:
        is_running = False
    print("Camera system stopped.")



def start_camera(session_id):
    global is_running, should_stop
    
    directory = os.getenv("VISUALISATION_DIR") or r"C:\Users\colam\Documents\saved_data" 
    save_path = os.path.join(directory, session_id)
    # save_path = r"C:\Users\colam\Documents\saved_data\depth_camera_recordings"

    os.makedirs(save_path, exist_ok=True)
    depth_camera_save_path = os.path.join(save_path, "depth_camera")
    os.makedirs(depth_camera_save_path, exist_ok=True)
    with control_lock:
        is_running = True
        should_stop = False
    
    print("Starting camera system...")
    pipeline = initialise_depth_RGB_only_pipeline()
    start_capture_depth_RGB(pipeline, save_path, 0.3)
    

def stop_camera():
    global should_stop
    with control_lock:
        should_stop = True
    print("Stop signal sent.")

def get_status():
    with control_lock:
        return {
            "running": is_running,
            "stop_requested": should_stop
        }

# Control interface functions
def handle_start(session_id):
    global is_running
    with control_lock:
        if is_running:
            return {"status": "already_running", "message": "Camera is already running"}
    
    # Start camera in a separate thread
    camera_thread = threading.Thread(target=start_camera, kwargs={'session_id': session_id})
    camera_thread.daemon = True
    camera_thread.start()
    
    return {"status": "started", "message": "Camera started successfully"}

def handle_stop():
    global is_running, should_stop
    with control_lock:
        if not is_running:
            return {"status": "not_running", "message": "Camera is not running"}
    
    stop_camera()
    return {"status": "stopped", "message": "Stop signal sent"}

def handle_status():
    return get_status()

# Example usage - you can remove this if using with Flask
if __name__ == "__main__":
    # Example of how to use the control functions
    print("Camera control system initialized.")
    print("Available functions:")
    print("- handle_start() - Start the camera")
    print("- handle_stop() - Stop the camera")
    print("- handle_status() - Get current status")
    
    # For direct testing without Flask
    import time
    print("\nStarting camera...")
    result = handle_start('recordings')
    print(f"Start result: {result}")
    
    # Let it run for a bit
    time.sleep(10)
    
    print("\nStopping camera...")
    result = handle_stop()
    print(f"Stop result: {result}")
    
    # Wait a bit more to see the cleanup
    time.sleep(2)
    
    print(f"\nFinal status: {handle_status()}")