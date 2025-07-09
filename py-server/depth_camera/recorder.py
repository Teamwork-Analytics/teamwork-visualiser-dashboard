import numpy as np
import cv2
import os
from datetime import datetime
from util.logging_util import logger
logger = logger()
class VideoRecorder:
    """Handles video recording functionality"""
    
    def __init__(self, save_path: str):
        self.save_path = save_path
        self.out = None
        self.filename = None
        os.makedirs(save_path, exist_ok=True)
        
    def start_recording(self, frame_shape: tuple) -> str:
        """Start video recording"""
        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        self.filename = os.path.join(self.save_path, f"output_{timestamp}.avi")
        
        self.out = cv2.VideoWriter(
            self.filename,
            cv2.VideoWriter_fourcc(*'XVID'),
            20.0,
            (frame_shape[1], frame_shape[0])
        )
        
        if not self.out.isOpened():
            raise RuntimeError("Could not open video writer")
            
        logger.info(f"Started recording: {self.filename}")
        return self.filename
    
    def write_frame(self, frame: np.ndarray):
        """Write frame to video file"""
        if self.out:
            self.out.write(frame)
    
    def stop_recording(self):
        """Stop video recording and save file"""
        if self.out:
            self.out.release()
            self.out = None
            if self.filename:
                logger.info(f"Recording saved: {self.filename}")
                return self.filename
        return None

