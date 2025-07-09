import depthai as dai
import numpy as np
import cv2
import blobconverter
from typing import Optional 

class PipelineManager:
    """Manages DepthAI pipeline creation and configuration"""
    
    def __init__(self):
        self.label_map = [
            "background", "aeroplane", "bicycle", "bird", "boat", "bottle", "bus", "car", "cat", "chair", "cow",
            "diningtable", "dog", "horse", "motorbike", "person", "pottedplant", "sheep", "sofa", "train", "tvmonitor"
        ]
        self.sync_nn = True
        
    def create_pipeline(self, depth_enabled: bool) -> dai.Pipeline:
        """Create and configure DepthAI pipeline"""
        pipeline = dai.Pipeline()
        color_cam = pipeline.create(dai.node.ColorCamera)

        if depth_enabled:
            mobilenet = pipeline.create(dai.node.MobileNetSpatialDetectionNetwork)
            mono_left = pipeline.create(dai.node.MonoCamera)
            mono_right = pipeline.create(dai.node.MonoCamera)
            stereo = pipeline.create(dai.node.StereoDepth)
        else:
            mobilenet = pipeline.create(dai.node.MobileNetDetectionNetwork)

        # Configure color camera
        color_cam.setPreviewSize(300, 300)
        color_cam.setResolution(dai.ColorCameraProperties.SensorResolution.THE_1080_P)
        color_cam.setInterleaved(False)
        color_cam.setColorOrder(dai.ColorCameraProperties.ColorOrder.BGR)

        # Configure MobileNet
        mobilenet.setBlobPath(blobconverter.from_zoo("mobilenet-ssd", shaves=6))
        mobilenet.setConfidenceThreshold(0.5)
        mobilenet.input.setBlocking(False)

        if depth_enabled:
            # Configure mono cameras
            mono_left.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
            mono_left.setBoardSocket(dai.CameraBoardSocket.LEFT)
            mono_right.setResolution(dai.MonoCameraProperties.SensorResolution.THE_400_P)
            mono_right.setBoardSocket(dai.CameraBoardSocket.RIGHT)

            # Configure stereo depth
            stereo.initialConfig.setConfidenceThreshold(255)
            stereo.depth.link(mobilenet.inputDepth)
            stereo.setDepthAlign(dai.CameraBoardSocket.RGB)

            # Configure spatial detection
            mobilenet.setBoundingBoxScaleFactor(0.5)
            mobilenet.setDepthLowerThreshold(100)
            mobilenet.setDepthUpperThreshold(5000)

            # Link mono cameras to stereo
            mono_left.out.link(stereo.left)
            mono_right.out.link(stereo.right)

            # Create depth output
            xout_depth = pipeline.create(dai.node.XLinkOut)
            xout_depth.setStreamName("depth")
            mobilenet.passthroughDepth.link(xout_depth.input)

        # Create RGB output
        xout_rgb = pipeline.create(dai.node.XLinkOut)
        xout_rgb.setStreamName("rgb")
        color_cam.preview.link(mobilenet.input)
        
        if self.sync_nn:
            mobilenet.passthrough.link(xout_rgb.input)
        else:
            color_cam.preview.link(xout_rgb.input)

        # Create detection output
        xout_nn = pipeline.create(dai.node.XLinkOut)
        xout_nn.setStreamName("detections")
        mobilenet.out.link(xout_nn.input)

        return pipeline

class DetectionProcessor:
    """Processes detection results and renders them on frames"""
    
    def __init__(self, label_map: list):
        self.label_map = label_map
        self.color = (255, 255, 255)
        
    def process_frame(self, frame: np.ndarray, detections: list, depth_frame: Optional[np.ndarray] = None) -> np.ndarray:
        """Process frame with detections and return annotated frame"""
        height, width = frame.shape[:2]
        
        # Draw detections
        for detection in detections:
            x1 = int(detection.xmin * width)
            x2 = int(detection.xmax * width)
            y1 = int(detection.ymin * height)
            y2 = int(detection.ymax * height)
            
            label = self.label_map[detection.label] if detection.label < len(self.label_map) else str(detection.label)
            
            # Draw label and confidence
            cv2.putText(frame, str(label), (x1 + 10, y1 + 20), cv2.FONT_HERSHEY_TRIPLEX, 0.5, self.color)
            cv2.putText(frame, "{:.2f}".format(detection.confidence * 100), (x1 + 10, y1 + 35), cv2.FONT_HERSHEY_TRIPLEX, 0.5, self.color)
            
            # Draw spatial coordinates if available
            if hasattr(detection, 'spatialCoordinates') and detection.spatialCoordinates:
                cv2.putText(frame, f"X: {int(detection.spatialCoordinates.x)} mm", (x1 + 10, y1 + 50), cv2.FONT_HERSHEY_TRIPLEX, 0.5, self.color)
                cv2.putText(frame, f"Y: {int(detection.spatialCoordinates.y)} mm", (x1 + 10, y1 + 65), cv2.FONT_HERSHEY_TRIPLEX, 0.5, self.color)
                cv2.putText(frame, f"Z: {int(detection.spatialCoordinates.z)} mm", (x1 + 10, y1 + 80), cv2.FONT_HERSHEY_TRIPLEX, 0.5, self.color)
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), self.color, 1)
        
        return frame
    
    def process_depth_frame(self, depth_frame: np.ndarray) -> np.ndarray:
        """Process depth frame for visualization"""
        depth_frame = cv2.normalize(depth_frame, None, 255, 0, cv2.NORM_INF, cv2.CV_8UC1)
        depth_frame = cv2.equalizeHist(depth_frame)
        depth_frame = cv2.applyColorMap(depth_frame, cv2.COLORMAP_HOT)
        return depth_frame
    
    def get_detection_string(self, detections: list) -> str:
        """Get detection data as string for TCP transmission"""
        if detections:
            detection = detections[0]  # Use first detection
            label = self.label_map[detection.label] if detection.label < len(self.label_map) else str(detection.label)
            return f"{label},{int(detection.confidence * 100)}%"
        return "No detections"

