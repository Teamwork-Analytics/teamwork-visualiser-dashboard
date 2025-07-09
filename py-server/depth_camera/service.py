import time
import depthai as dai
import numpy as np
import cv2
import os
import signal
from typing import Optional
from depth_camera.servers import ServerManager
from depth_camera.pipeline import PipelineManager, DetectionProcessor
from depth_camera.recorder import VideoRecorder
from util.logging_util import logger
logger = logger()

class DepthAIService:
    """Main service class that orchestrates all components"""
    
    def __init__(self, session_id: Optional[str] = None, base_path: Optional[str] = None):
        self.session_id = session_id
        self.base_path = base_path or os.getenv("VISUALISATION_DIR", "./recordings")
        self.save_path = self._get_save_path()
        
        # Initialize components
        self.server_manager = ServerManager()
        self.pipeline_manager = PipelineManager()
        self.video_recorder = VideoRecorder(self.save_path)
        self.detection_processor = DetectionProcessor(self.pipeline_manager.label_map)
        
        # Control flags
        self.running = False
        self.device = None
        
        # # Setup signal handlers for graceful shutdown
        # signal.signal(signal.SIGINT, self._signal_handler)
        # signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _get_save_path(self) -> str:
        """Get save path with session ID support"""
        if self.session_id:
            return os.path.join(self.base_path, str(self.session_id))
        return self.base_path
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, shutting down...")
        self.stop()
    
    def start(self):
        """Start the DepthAI service"""
        logger.info(f"Starting DepthAI Service (Session: {self.session_id or 'default'})")
        
        try:
            # Start servers
            self.server_manager.start()
            self.running = True
            
            # Main processing loop
            self._run_detection_loop()
            
        except Exception as e:
            logger.error(f"Service error: {e}")
            raise
        finally:
            self.stop()
    
    def stop(self):
        """Stop the DepthAI service and save recordings"""
        logger.info("Stopping DepthAI Service...")
        self.running = False
        
        # Stop video recording
        saved_file = self.video_recorder.stop_recording()
        
        # Stop servers
        self.server_manager.stop()
        
        # Close device
        if self.device:
            self.device.close()
        
        cv2.destroyAllWindows()
        logger.info("DepthAI Service stopped successfully")
        
        if saved_file:
            logger.info(f"Final recording saved at: {saved_file}")
    
    def _run_detection_loop(self):
        """Main detection processing loop"""
        while self.running:
            try:
                with dai.Device() as device:
                    self.device = device
                    cams = device.getConnectedCameras()
                    
                    if not cams:
                        logger.warning("No DepthAI cameras detected.")
                        time.sleep(5)
                        continue

                    # Check for depth capability
                    depth_enabled = (dai.CameraBoardSocket.LEFT in cams and 
                                   dai.CameraBoardSocket.RIGHT in cams)
                    
                    # Start pipeline
                    pipeline = self.pipeline_manager.create_pipeline(depth_enabled)
                    device.startPipeline(pipeline)
                    
                    logger.info(f"DepthAI is running. Navigate to 'localhost:{self.server_manager.http_port}' to view stream.")
                    
                    # Get queues
                    preview_queue = device.getOutputQueue(name="rgb", maxSize=4, blocking=False)
                    detection_queue = device.getOutputQueue(name="detections", maxSize=4, blocking=False)
                    depth_queue = device.getOutputQueue(name="depth", maxSize=4, blocking=False) if depth_enabled else None
                    
                    # Process frames
                    self._process_frames(preview_queue, detection_queue, depth_queue, depth_enabled)
                    
            except Exception as e:
                logger.error(f"Detection loop error: {e}")
                if not self.running:
                    break
                logger.info("Waiting for DepthAI device to reconnect...")
                time.sleep(5)
    
    def _process_frames(self, preview_queue, detection_queue, depth_queue, depth_enabled):
        """Process frames from queues"""
        fps_counter = 0
        start_time = time.monotonic()
        recording_started = False
        
        while self.running:
            # Get frames
            in_preview = preview_queue.tryGet()
            in_nn = detection_queue.tryGet()
            
            if in_preview is None or in_nn is None:
                if not self.device.isPipelineRunning():
                    logger.info("Pipeline stopped")
                    break
                continue
            
            # Process frame
            frame = in_preview.getCvFrame()
            detections = in_nn.detections
            
            # Calculate FPS
            fps_counter += 1
            current_time = time.monotonic()
            if (current_time - start_time) > 1:
                fps = fps_counter / (current_time - start_time)
                fps_counter = 0
                start_time = current_time
                
                # Add FPS to frame
                cv2.putText(frame, f"NN fps: {fps:.2f}", (2, frame.shape[0] - 4), 
                           cv2.FONT_HERSHEY_TRIPLEX, 0.4, (255, 255, 255))
            
            # Process depth frame if available
            depth_frame = None
            if depth_enabled and depth_queue:
                depth_data = depth_queue.tryGet()
                if depth_data:
                    depth_frame = self.detection_processor.process_depth_frame(depth_data.getFrame())
            
            # Process detections
            annotated_frame = self.detection_processor.process_frame(frame, detections, depth_frame)
            
            # Create display frame
            display_frame = annotated_frame
            if depth_enabled and depth_frame is not None:
                new_width = int(depth_frame.shape[1] * (annotated_frame.shape[0] / depth_frame.shape[0]))
                resized_depth = cv2.resize(depth_frame, (new_width, annotated_frame.shape[0]))
                display_frame = np.hstack([annotated_frame, resized_depth])
            
            # Send to servers
            self.server_manager.send_frame(display_frame)
            detection_data = self.detection_processor.get_detection_string(detections)
            self.server_manager.send_detection_data(detection_data)
            
            # Start recording if not already started
            if not recording_started:
                self.video_recorder.start_recording(display_frame.shape)
                recording_started = True
            
            # Record frame
            self.video_recorder.write_frame(display_frame)

