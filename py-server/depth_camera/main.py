import sys
import logging
import threading
import time
from enum import Enum
from typing import Dict, Optional, Any
from datetime import datetime
from dataclasses import dataclass

from depth_camera.service import DepthAIService

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ServiceStatus(Enum):
    STOPPED = "stopped"
    STARTING = "starting"
    RUNNING = "running"
    STOPPING = "stopping"
    ERROR = "error"

@dataclass
class ServiceState:
    status: ServiceStatus
    session_id: Optional[str]
    start_time: Optional[datetime]
    error_message: Optional[str]
    recording_path: Optional[str]
    stats: Dict[str, Any]


class DepthAIServiceManager:
    """Thread-safe service manager for Flask integration"""
    
    def __init__(self):
        self.services: Dict[str, Dict] = {}  # session_id -> service_info
        self.lock = threading.Lock()
        
    def start_service(self, session_id: str, base_path: Optional[str] = None) -> Dict[str, Any]:
        """Start a new DepthAI service instance"""
        with self.lock:
            if session_id in self.services:
                if self.services[session_id]['status'] == ServiceStatus.RUNNING:
                    return {"error": f"Service for session {session_id} already running"}
            
            try:
                # Create service instance
                service = DepthAIService(session_id=session_id, base_path=base_path)
                
                # Create service info
                service_info = {
                    'service': service,
                    'status': ServiceStatus.STARTING,
                    'start_time': datetime.now(),
                    'thread': None,
                    'error_message': None,
                    'recording_path': service.save_path
                }
                
                # Start service in separate thread
                # service_thread = threading.Thread(
                #     target=self._run_service,
                #     args=(session_id, service),
                #     daemon=True
                # )              
                # service_info['thread'] = service_thread
                # self.services[session_id] = service_info
                
                # service_thread.start()
                
                self._run_service(session_id, service)
                # Wait a moment to check if service started successfully
                time.sleep(5)
                
                if service_info['status'] == ServiceStatus.ERROR:
                    return {"error": service_info['error_message']}
                
                return {
                    "message": f"Service started for session {session_id}",
                    "session_id": session_id,
                    "status": service_info['status'].value,
                    "recording_path": service_info['recording_path']
                }
                
            except Exception as e:
                logger.error(f"Failed to start service for session {session_id}: {e}")
                return {"error": str(e)}
    
    def stop_service(self, session_id: str) -> Dict[str, Any]:
        """Stop a running service"""
        with self.lock:
            if session_id not in self.services:
                return {"error": f"No service found for session {session_id}"}
            
            service_info = self.services[session_id]
            
            if service_info['status'] != ServiceStatus.RUNNING:
                return {"error": f"Service for session {session_id} is not running"}
            
            try:
                service_info['status'] = ServiceStatus.STOPPING
                service_info['service'].stop()
                
                # Wait for thread to finish
                if service_info['thread']:
                    service_info['thread'].join(timeout=10)
                
                # Clean up
                del self.services[session_id]
                
                return {
                    "message": f"Service stopped for session {session_id}",
                    "session_id": session_id
                }
                
            except Exception as e:
                logger.error(f"Failed to stop service for session {session_id}: {e}")
                return {"error": str(e)}
    
    def get_service_status(self, session_id: str) -> Dict[str, Any]:
        """Get status of a service"""
        with self.lock:
            if session_id not in self.services:
                return {
                    "session_id": session_id,
                    "status": ServiceStatus.STOPPED.value,
                    "exists": False
                }
            
            service_info = self.services[session_id]
            
            return {
                "session_id": session_id,
                "status": service_info['status'].value,
                "exists": True,
                "start_time": service_info['start_time'].isoformat() if service_info['start_time'] else None,
                "error_message": service_info.get('error_message'),
                "recording_path": service_info.get('recording_path'),
                "stream_url": f"http://localhost:{service_info['service'].server_manager.http_port}" if service_info['status'] == ServiceStatus.RUNNING else None
            }
    
    def list_services(self) -> Dict[str, Any]:
        """List all services"""
        with self.lock:
            services = {}
            for session_id, service_info in self.services.items():
                services[session_id] = {
                    "status": service_info['status'].value,
                    "start_time": service_info['start_time'].isoformat() if service_info['start_time'] else None,
                    "recording_path": service_info.get('recording_path')
                }
            return {"services": services}
    
    def stop_all_services(self) -> Dict[str, Any]:
        """Stop all running services"""
        with self.lock:
            stopped_services = []
            for session_id in list(self.services.keys()):
                result = self.stop_service(session_id)
                if "error" not in result:
                    stopped_services.append(session_id)
            
            return {
                "message": f"Stopped {len(stopped_services)} services",
                "stopped_services": stopped_services
            }
    
    def _run_service(self, session_id: str, service: DepthAIService):
        """Run service in separate thread"""
        try:
            self.services[session_id]['status'] = ServiceStatus.RUNNING
            service.start()  # This blocks until service stops
            
        except Exception as e:
            logger.error(f"Service error for session {session_id}: {e}")
            self.services[session_id]['status'] = ServiceStatus.ERROR
            self.services[session_id]['error_message'] = str(e)
        
        finally:
            # Clean up when service stops
            with self.lock:
                if session_id in self.services:
                    if self.services[session_id]['status'] != ServiceStatus.ERROR:
                        self.services[session_id]['status'] = ServiceStatus.STOPPED

def main():
    """Main entry point - for manual testing"""
    import argparse
    
    parser = argparse.ArgumentParser(description='DepthAI Detection Service')
    parser.add_argument('--session-id', type=str, help='Session ID for organizing recordings')
    parser.add_argument('--base-path', type=str, help='Base path for recordings')
    
    args = parser.parse_args()
    
    # Create and start service
    service = DepthAIService(session_id=args.session_id, base_path=args.base_path)
    
    try:
        service.start()
    except KeyboardInterrupt:
        logger.info("Service interrupted by user")
    except Exception as e:
        logger.error(f"Service failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()