#!/usr/bin/env python
# coding: utf-8

# In[ ]:


from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, HTMLResponse
from pydantic import BaseModel
import cv2
import base64
from queue import Queue
from threading import Thread, Event
import time
import numpy as np
from ultralytics import YOLO
from deep_sort_realtime.deepsort_tracker import DeepSort
import nest_asyncio
import uvicorn
import os
import logging

logging.getLogger("ultralytics").setLevel(logging.ERROR)
# nest_asyncio 적용하여 중첩 이벤트 루프 허용
nest_asyncio.apply()

# FastAPI 앱 생성
app = FastAPI()

# 초기 변수 설정
rtsp_url = "rtsp://admin:inno1456@inno0052.tplinkdns.com:2115/cam/realmonitor?channel=1&subtype=0"
max_cows = 6
id_select = None
cap = None
frame_queue = Queue(maxsize=1)
stop_event = Event()  # 이벤트 객체로 초기화
read_thread = None  # 스레드 객체 추가

# 모델 경로 설정 (현재 디렉터리의 best.pt 파일 경로로 지정)
model_path = os.path.join(os.path.dirname(__file__), "best2.pt")

# YOLO 및 DeepSORT 설정
model = YOLO(model_path, verbose=False)
tracker = DeepSort(
    max_age=50, 
    n_init=3,
    max_cosine_distance = 0.1
    )

# ID 매핑 테이블과 관련 변수 설정
tracked_ids = set()
missing_ids = set(range(1, max_cows + 1))
last_known_positions = {}
threshold_distance = 30
id_mapping = {}
reverse_id_mapping = {}

# 그리드 크기 및 영역 정의
grid_size = (12, 8)
frame_height, frame_width = 1080, 1920
cell_width = frame_width // grid_size[0]
cell_height = frame_height // grid_size[1]
trapezoid_points = np.array([[0, 750], [400, 50], [1500, 50], [1900, 750]], np.int32)

# 모델 정의
class ConfigInput(BaseModel):
    rtsp_url: str
    max_cows: int

class IdSelectInput(BaseModel):
    id_select: int

@app.on_event("startup")
async def startup_event():
    """FastAPI 시작 시 기본 설정으로 스트림 시작"""
    await set_config(ConfigInput(rtsp_url=rtsp_url, max_cows=max_cows))

# RTSP URL 및 max_cows 설정 엔드포인트
@app.post("/config")
async def set_config(config: ConfigInput):
    global rtsp_url, max_cows, cap, stop_event, read_thread

    # 중복 스트림 방지: 기존 스레드가 있다면 종료하고 새로운 스레드 시작
    stop_event.set()  # 기존 스레드가 있다면 종료하도록 신호 설정
    if read_thread and read_thread.is_alive():
        read_thread.join()  # 기존 스레드가 완전히 종료될 때까지 대기

    # 새로운 스트림 설정
    stop_event.clear()  # 새로운 세션을 위해 stop_event 초기화
    rtsp_url = config.rtsp_url
    max_cows = config.max_cows

    if cap and cap.isOpened():  # 이전에 열린 cap이 있으면 해제
        cap.release()
    cap = cv2.VideoCapture(rtsp_url)
    
    # 새로운 스레드에서 프레임 읽기 시작
    read_thread = Thread(target=read_frames, daemon=True)
    read_thread.start()

    return {"message": "Configuration set successfully"}

# 종료 엔드포인트
@app.post("/stop")
async def stop_stream():
    global stop_event, id_select
    stop_event.set()  # 스레드 종료 신호 설정
    id_select = None  # 종료 시 id_select 초기화
    return {"message": "Streaming stopped"}

@app.get("/")
async def root():
    return RedirectResponse(url="/video_feed")

# id_select 설정 엔드포인트
@app.post("/set_id")
async def set_id_select(id_input: IdSelectInput):
    global id_select
    id_select = id_input.id_select
    return {"message": f"id_select set to {id_select}"}

# 별도의 스레드에서 프레임을 읽어와 Queue에 저장
# 프레임 읽기 함수
def read_frames():
    global cap
    while not stop_event.is_set():
        if cap and cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                print("프레임을 읽을 수 없습니다.")
                break
            if frame_queue.full():
                frame_queue.get()
            frame_queue.put(frame)
    if cap:
        cap.release()  # 종료 시 cap 해제
        cap = None
# bounding box의 중심을 기준으로 그리드 위치 가져오기
def get_grid_position(center_x, center_y, cell_width, cell_height):
    grid_x = center_x // cell_width
    grid_y = center_y // cell_height
    return (grid_x, grid_y)

# 인접한 셀 확인 (상, 하, 좌, 우만 확인)
def get_adjacent_cells(grid_position, grid_size):
    grid_x, grid_y = grid_position
    adjacent_cells = []
    
    # 인접한 셀만 확인 (상, 하, 좌, 우)
    directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]  # left, right, top, bottom
    for dx, dy in directions:
        nx, ny = grid_x + dx, grid_y + dy
        # 셀이 그리드 범위 내에 있는지 확인
        if 0 <= nx < grid_size[0] and 0 <= ny < grid_size[1]:
            adjacent_cells.append((nx, ny))
    return adjacent_cells


# 이전 프레임의 인접 셀에서 ID를 확인하도록 process_frame 함수 수정
def process_frame():
    if not frame_queue.empty():
        frame = frame_queue.get()
        results = model(frame)
        detections = []

        for result in results:
            boxes = result.boxes.xyxy.cpu().numpy()
            confidences = result.boxes.conf.cpu().numpy()
            class_ids = result.boxes.cls.cpu().numpy()

            for box, conf, class_id in zip(boxes, confidences, class_ids):
                x1, y1, x2, y2 = map(int, box)
                center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2

                # bounding box의 중심을 기준으로 그리드 셀 결정
                grid_position = get_grid_position(center_x, center_y, cell_width, cell_height)
                
                if is_inside_trapezoid((x1, y1, x2, y2), trapezoid_points):
                    detections.append(([x1, y1, x2, y2], conf, int(class_id), grid_position))
                    
        # 그리드 기반 ID 할당이 강화된 DeepSORT 트래킹 수행
        tracked_objects = tracker.update_tracks(detections, frame=frame)
        new_tracked_ids = set()
        
        for track, detection in zip(tracked_objects, detections):
            if track.is_confirmed():
                deep_sort_id = track.track_id
                (x1, y1, x2, y2), conf, class_id, grid_position = detection
                center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2

                # 연속성을 유지하기 위해 인접 셀에서 기존 ID 확인
                if deep_sort_id in id_mapping:
                    track_id = id_mapping[deep_sort_id]
                else:
                    # 인접한 그리드 셀에서 사용 가능한 ID 찾기
                    adjacent_cells = get_adjacent_cells(grid_position, grid_size)
                    reused_id = None
                    for cell in adjacent_cells:
                        for known_id, known_position in last_known_positions.items():
                            if known_position == cell and known_id not in new_tracked_ids:
                                reused_id = known_id
                                break
                        if reused_id:
                            break

                    # 일치하는 ID가 없으면 새 ID 할당
                    if reused_id:
                        track_id = reused_id
                        missing_ids.discard(reused_id)
                    elif missing_ids:
                        track_id = missing_ids.pop()
                    else:
                        continue  # 사용 가능한 ID가 없으면 건너뜀

                    # 매핑 업데이트
                    id_mapping[deep_sort_id] = track_id
                    reverse_id_mapping[track_id] = deep_sort_id

                tracked_ids.add(track_id)
                last_known_positions[track_id] = grid_position
                new_tracked_ids.add(track_id)

                # bounding box와 트래킹 ID 그리기
                if id_select is None or track_id == id_select:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"ID: {track_id}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        # 사용하지 않는 ID 관리 및 다음 프레임을 위해 초기화
        for old_id in tracked_ids - new_tracked_ids:
            if old_id in reverse_id_mapping:
                deep_sort_id = reverse_id_mapping.pop(old_id)
                missing_ids.add(old_id)
                id_mapping.pop(deep_sort_id, None)

        tracked_ids.clear()
        tracked_ids.update(new_tracked_ids)

         # 다운스케일링 해상도 설정
        target_width, target_height = 640, 360
        frame = cv2.resize(frame, (target_width, target_height))

        _, buffer = cv2.imencode('.jpg', frame)
        frame_data = base64.b64encode(buffer).decode('utf-8')
        return frame_data
    return None


def is_inside_trapezoid(box, points):
    x1, y1, x2, y2 = box
    center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2
    return cv2.pointPolygonTest(points, (center_x, center_y), False) >= 0

# 비디오 피드 엔드포인트
@app.get("/video_feed")
async def video_feed():
    def frame_generator():
        while True:
            frame_data = process_frame()
            if frame_data:
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + base64.b64decode(frame_data) + b'\r\n')
            time.sleep(1 / 30)  # FPS 제한
    return StreamingResponse(frame_generator(), media_type="multipart/x-mixed-replace; boundary=frame")

# # HTML 페이지 엔드포인트
# @app.get("/", response_class=HTMLResponse)
# async def root():
#     return """
#     <html>
#         <head>
#             <title>Video Feed</title>
#             <script>
#                 async function setConfig() {
#                     const rtspUrl = document.getElementById("rtsp_url").value;
#                     const maxCows = parseInt(document.getElementById("max_cows").value);

#                     const response = await fetch("/config", {
#                         method: "POST",
#                         headers: { "Content-Type": "application/json" },
#                         body: JSON.stringify({ rtsp_url: rtspUrl, max_cows: maxCows })
#                     });

#                     if (response.ok) {
#                         window.location.href = "/video_feed";
#                     } else {
#                         alert("설정을 적용하는 데 실패했습니다.");
#                     }
#                 }

#                 async function setIdSelect() {
#                     const idSelect = parseInt(document.getElementById("id_select").value);

#                     await fetch("/set_id", {
#                         method: "POST",
#                         headers: { "Content-Type": "application/json" },
#                         body: JSON.stringify({ id_select: idSelect })
#                     });
#                 }

#                 async function stopStream() {
#                     const response = await fetch("/stop", {
#                         method: "POST",
#                         headers: { "Content-Type": "application/json" }
#                     });
#                     if (response.ok) {
#                         alert("Streaming stopped");
#                         window.location.href = "/";  // 메인 페이지로 이동
#                     } else {
#                         alert("스트리밍 중지에 실패했습니다.");
#                     }
#                 }
#             </script>
#         </head>
#         <body style="text-align: center;">
#             <h1>Live Video Feed</h1>
#             <img src="/video_feed" style="width:80%; border: 1px solid #000;" />

#             <h2>Configuration</h2>
#             <label>RTSP URL: </label><input type="text" id="rtsp_url" placeholder="Enter RTSP URL" /><br>
#             <label>Max Cows: </label><input type="number" id="max_cows" placeholder="Enter max cows" /><br>
#             <button onclick="setConfig()">Set Config</button>

#             <h2>ID Select</h2>
#             <label>ID Select: </label><input type="number" id="id_select" placeholder="Enter ID to select" /><br>
#             <button onclick="setIdSelect()">Set ID Select</button>

#             <h2>Stop Streaming</h2>
#             <button onclick="stopStream()">Stop Stream</button>
#         </body>
#     </html>
#     """


# uvicorn을 통해 FastAPI 앱 실행
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)


# In[ ]:




