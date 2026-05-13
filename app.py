from flask import Flask, request, jsonify
from flask_cors import CORS
from recommender import MusicRecommender
import traceback

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing for the frontend

# Initialize recommender
try:
    recommender = MusicRecommender('dataset.csv')
    print("Recommender initialized successfully with dataset.csv")
except Exception as e:
    print(f"Failed to initialize recommender: {e}")
    recommender = None

user_feedback_db = {} # Simple in-memory dict for RL feedback {track_id: 1 or 0}

@app.route('/api/songs', methods=['GET'])
def get_songs():
    if not recommender:
        return jsonify({"error": "Recommender not initialized"}), 500
    
    songs = recommender.get_all_songs()
    return jsonify(songs)

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json
    track_id = data.get('track_id')
    is_liked = data.get('is_liked')
    if track_id is not None:
        user_feedback_db[int(track_id)] = 1 if is_liked else 0
    return jsonify({"status": "success", "feedback_count": len(user_feedback_db)})

@app.route('/api/recommend/collab', methods=['POST'])
def recommend_collab():
    if not recommender:
        return jsonify({"error": "Recommender not initialized"}), 500
    data = request.json
    liked_track_ids = data.get('liked_track_ids', [])
    try:
        recommendations = recommender.recommend_collaborative(liked_track_ids)
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error during collab filtering: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/recommend/<algorithm>', methods=['POST'])
def recommend(algorithm):
    if not recommender:
        return jsonify({"error": "Recommender not initialized"}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        # Default fallback values
        preferences = {
            'genre': data.get('genre', 'Pop'),
            'mood': data.get('mood', 'Happy'),
            'tempo': float(data.get('tempo', 120)),
            'energy': float(data.get('energy', 0.5)),
            'danceability': float(data.get('danceability', 0.5)),
            'acousticness': float(data.get('acousticness', 0.5)),
            'user_feedback': user_feedback_db
        }
        strict_genre = data.get('strict_genre', False)
        
        if algorithm == 'knn':
            recommendations = recommender.recommend_knn(preferences, strict_genre=strict_genre)
        elif algorithm == 'rf':
            recommendations = recommender.recommend_rf(preferences, strict_genre=strict_genre)
        elif algorithm == 'svm':
            recommendations = recommender.recommend_svm(preferences, strict_genre=strict_genre)

        else:
            return jsonify({"error": "Invalid algorithm."}), 400
            
        return jsonify(recommendations)
    except Exception as e:
        print(f"Error during recommendation: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/compare_models', methods=['POST'])
def compare_models():
    if not recommender:
        return jsonify({"error": "Recommender not initialized"}), 500
        
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    try:
        preferences = {
            'genre': data.get('genre', 'Pop'),
            'mood': data.get('mood', 'Happy'),
            'tempo': float(data.get('tempo', 120)),
            'energy': float(data.get('energy', 0.5)),
            'danceability': float(data.get('danceability', 0.5)),
            'acousticness': float(data.get('acousticness', 0.5))
        }
        metrics_data = recommender.get_all_metrics(preferences)
        return jsonify(metrics_data)
    except Exception as e:
        print(f"Error during comparison: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
