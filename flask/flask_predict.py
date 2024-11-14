from flask import Flask, request, jsonify
from flask_cors import CORS  # CORS 허용을 위한 추가
import json
import os
import pandas as pd
from sklearn.impute import SimpleImputer
import joblib  # joblib을 사용하여 모델 파일 로드

# Flask 앱 초기화
app = Flask(__name__)
CORS(app)  # 모든 경로에서 CORS 허용

# JSON 파일 경로 및 모델 파일 경로 설정 (상대 경로)
base_path = os.path.dirname(os.path.abspath(__file__))
model_metadata_path = os.path.join(base_path, 'model_metadata1.json')
model_file_path = os.path.join(base_path, 'trained_model.joblib')

# JSON에서 모델 파라미터와 피처 이름 로드
with open(model_metadata_path, 'r', encoding='utf-8') as f:
    model_data = json.load(f)

# 학습된 모델 로드
model = joblib.load(model_file_path)
imputer = SimpleImputer(strategy='mean')
feature_names = model_data["feature_names"]

# 기본 경로("/")
@app.route('/', methods=['GET'])
def home():
    return "Flask 서버가 정상적으로 실행 중입니다. /predict 엔드포인트를 사용하세요."

# 예측 API 정의
@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 클라이언트로부터 JSON 데이터 수신
        data = request.get_json()

        # 필수 필드 검사
        required_fields = ["번호", "kpn", "계대", "중량", "최저가", "성별_수", "성별_암", "성별_프", "종류_혈통우"]
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # DataFrame으로 변환하고 피처 이름에 맞게 정렬
        df = pd.DataFrame([data])
        print("Original DataFrame:", df)
        df = df.reindex(columns=feature_names, fill_value=0)
        print("Reindexed DataFrame:", df)

        # 결측치 처리 및 예측 수행
        features_imputed = imputer.fit_transform(df)
        print("Imputed Features:", features_imputed)
        prediction = model.predict(features_imputed)
        print("Prediction Result:", prediction)

        # 예측 결과 반환
        return jsonify({'predicted_price': prediction[0]})

    except Exception as e:
        print("Error during prediction:", str(e))  # 오류 내용 출력
        return jsonify({'error': str(e)}), 500

# Flask 서버 실행
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081, debug=True)
