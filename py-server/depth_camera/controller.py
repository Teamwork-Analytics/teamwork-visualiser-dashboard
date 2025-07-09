from flask import Blueprint, request, jsonify
import atexit
import os
from datetime import datetime
from depth_camera.main import logger, ServiceStatus, DepthAIServiceManager

video_bp = Blueprint('video', __name__, url_prefix='/api/videos')

service_manager = DepthAIServiceManager()
base_dir = os.getenv('VISUALISATION_DIR')

@video_bp.route('/start', methods=['POST'])
def start_service():
    """Start a new DepthAI service"""
    session_id = request.args.get('sessionId')
    
    if not session_id:
        return jsonify({"error": "sessionId is required as URL parameter"}), 400
    
    # Get base_path from environment variable
    base_path = os.path.join(base_dir, session_id)
    
    if not base_path:
        return jsonify({"error": "VISUALISATION_DIR environment variable not set"}), 500
    
    result = service_manager.start_service(session_id, base_path)
    
    if "error" in result:
        return jsonify(result), 400
    
    return jsonify(result), 200



@video_bp.route('/<session_id>/stop', methods=['POST'])
def stop_service(session_id):
    """Stop a specific service"""
    result = service_manager.stop_service(session_id)
    
    if "error" in result:
        return jsonify(result), 400
    
    return jsonify(result), 200

@video_bp.route('/<session_id>/status', methods=['GET'])
def get_service_status(session_id):
    """Get status of a specific service"""
    result = service_manager.get_service_status(session_id)
    return jsonify(result), 200

@video_bp.route('/', methods=['GET'])
def list_services():
    """List all services"""
    result = service_manager.list_services()
    return jsonify(result), 200

@video_bp.route('/stop-all', methods=['POST'])
def stop_all_services():
    """Stop all services"""
    result = service_manager.stop_all_services()
    return jsonify(result), 200

@video_bp.route('/<session_id>/stream')
def stream_redirect(session_id):
    """Redirect to the video stream"""
    service_info = service_manager.get_service_status(session_id)
    
    if not service_info['exists'] or service_info['status'] != ServiceStatus.RUNNING.value:
        return jsonify({"error": "Service not running"}), 404
    
    # The stream is available at the service's HTTP port
    stream_url = service_info.get('stream_url')
    if stream_url:
        return f'<script>window.location.href="{stream_url}"</script>'
    
    return jsonify({"error": "Stream not available"}), 404

# Health check endpoint
@video_bp.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "active_services": len(service_manager.services)
    }), 200

def cleanup():
    """Clean up all services on app shutdown"""
    logger.info("Shutting down all services...")
    service_manager.stop_all_services()

atexit.register(cleanup)
