from flask import Blueprint, request, jsonify
import importlib.util
import sys
import os

spec = importlib.util.spec_from_file_location("camera_control", "depth_camera\\script.py")
camera_control = importlib.util.module_from_spec(spec)
sys.modules["camera_control"] = camera_control
spec.loader.exec_module(camera_control)

camera_bp = Blueprint('camera', __name__, url_prefix='/cameras')


@camera_bp.route('/start', methods=['POST'])
def start_camera():
    """Start the camera system"""
    try:
        session_id = request.args.get('sessionId')
    
        if not session_id:
            return jsonify({"error": "sessionId is required as URL parameter"}), 400
    
        result = camera_control.handle_start(session_id)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to start camera: {str(e)}"
        }), 500

@camera_bp.route('/stop', methods=['POST'])
def stop_camera():
    """Stop the camera system"""
    try:
        result = camera_control.handle_stop()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to stop camera: {str(e)}"
        }), 500

@camera_bp.route('/status', methods=['GET'])
def get_camera_status():
    """Get the current status of the camera system"""
    try:
        result = camera_control.handle_status()
        return jsonify(result), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to get camera status: {str(e)}"
        }), 500

@camera_bp.route('/restart', methods=['POST'])
def restart_camera():
    """Restart the camera system"""
    try:
        # First stop the camera
        stop_result = camera_control.handle_stop()
        
        # Wait a moment for cleanup
        import time
        time.sleep(2)
        
        # Then start it again
        start_result = camera_control.handle_start()
        
        return jsonify({
            "status": "restarted",
            "stop_result": stop_result,
            "start_result": start_result
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": f"Failed to restart camera: {str(e)}"
        }), 500