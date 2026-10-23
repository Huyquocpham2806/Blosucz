# Định dạng Level JSON

`Level.load(path)` nạp UTF-8; `Level.from_dict(data, source)` dùng cùng validation. Level lưu tuple và bảng tra tuple; `to_dict()`/`meta` trả bản sao. Lỗi `LevelError` ghi file, source line và lý do; lỗi grid có row index. Khi dùng dict không có văn bản nguồn, line=1. Với lỗi semantic cấp collection, line chỉ tới key collection, không giả vờ biết vị trí token con.

## Ví dụ đầy đủ nhỏ

```json
{
  "id": 101, "name": "Example",
  "grid": ["SooBB#G"],
  "legend": {"S":"start","o":"soft_switch","B":"bridge","#":"floor","G":"goal"},
  "bridges": [{"id":0,"cells":[[0,3],[0,4]],"open":false}],
  "switches": [
    {"cell":[0,1],"type":"soft","mode":"permanent","set":"open","targets":[0]},
    {"cell":[0,2],"type":"soft","mode":"permanent","set":"open","targets":[0]}
  ],
  "meta": {"difficulty":1,"group":3,"hint":"Cross the bridge.","solution":"RRRR","optimal_moves":4}
}
```

Bridge metadata phải gắn với mọi tile có type `bridge`, không phụ thuộc ký tự có thực sự là `B` hay không. Tương tự cho các loại switch. Tên ký tự là tùy chọn qua legend.

## Các trường và validation

- `id`: positive integer; `name`: nonempty string.
- `grid`: mảng chuỗi không rỗng, cùng chiều dài, mọi ký tự có trong legend.
- `legend`: key một ký tự; value thuộc void/floor/start/goal/fragile/bridge/soft_switch/heavy_switch/split_switch.
- Đúng một start và một goal.
- `bridges`: id duy nhất trong 0–63; cells không rỗng, tọa độ nguyên trong board; mỗi bridge tile thuộc đúng một bridge. `open` boolean, mặc định false. ID không cần liên tiếp.
- `switches`: cell đúng loại tile, không trùng, không thiếu definition; type soft/heavy/split; targets là các bridge ID tồn tại, không trùng.
- `mode=toggle`: không có `set`; `mode=permanent`: bắt buộc `set=open` hoặc `closed`.
- Split cần `cubes` gồm hai tọa độ khác nhau, có nền đỡ trong cấu hình ban đầu. Destination có thể là fragile. Khi thực sự teleport, rules kiểm tra lại bitmask hiện thời. Cube thứ nhất trong JSON là cube active ban đầu; chuẩn hóa không đổi identity này.
- Non-split switch không được khai báo cubes.
- `meta.solution`: chuỗi không khoảng trắng, chỉ `U D L R W` với W là SWAP; `optimal_moves` bằng độ dài chuỗi. Loader không chạy tìm kiếm để chứng minh tối ưu.
- `meta.group`: nhóm cố định 1: levels 1–4; 2: 5–6; 3: 7–9; 4: 10–15.
- `meta.verification`: kết quả kiểm chứng ngoại tuyến: optimality_verified, objective, expanded_unique_states (gồm goal pop), discovered_states, total_reachable_states=null khi dừng tại goal, elapsed_s, level_data_sha256 và core_sha256. Không phải kết quả solver sinh viên.

API không công khai solution, optimal_moves hay verification. Test replay toàn bộ solution và kiểm tra chỉ thắng ở action cuối. Sau khi chỉnh level, phải cập nhật chứng nhận bằng công cụ tạm ngoài repo rồi xóa công cụ; không commit search implementation.

## Tạo/chỉnh màn

Chỉnh JSON, giữ các bảng bridge/switch nhất quán, chạy `pytest tests/test_level_loading.py tests/test_levels_solutions.py`. Bộ hiện tại là reference15: không thay bố cục để ép cơ chế. Meta có profile, reference_stage, reference_code và reference_sha256; các group theo ID, không mang ý nghĩa tiến trình cơ chế của bộ tự thiết kế cũ. Chứng nhận hash payload không gồm meta; core hashes bao gồm toàn bộ file Python core. Test kiểm tra hash và replay; thuật toán BFS sinh viên kiểm chứng lại tối ưu sau khi cài.
