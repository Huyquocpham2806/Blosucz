# Kiểm chứng bản reference15 — 2026-10-23

## Kết quả hiện tại

`python -m pytest -q --disable-warnings`: **167 passed, 90 skipped, 0 failed**,
226.08 giây. Gồm **34 E2E Chromium chạy thật**, không E2E skip; 133 test còn lại.
90 skip là 75 solver-contract và 15 BFS-optimum vì nhóm chưa cài các solver.
Một deprecation warning từ Starlette/httpx TestClient đã có ở baseline.

`python -m ruff check .`: All checks passed.
`python -m mypy --strict core/`: Success, 7 source files.
Bản rà soát cuối còn sửa viền con không fade khi rơi, ẩn/clipping block dưới goal và ẩn marker trước khi đặt cube. Test khóa input được chuyển từ polling timer sang kiểm tra ngay lúc terminal effect bắt đầu, loại bỏ race của test.

Không có dependency hoặc API công khai mới. Hai lệnh README vẫn áp dụng.

Chi tiết phiên bản: [QA_ENVIRONMENT.json](QA_ENVIRONMENT.json); log test: [QA_TEST_OUTPUT.txt](QA_TEST_OUTPUT.txt).

Môi trường: Linux, Python 3.12.14, Playwright 1.56.0, Chromium 141 software WebGL.
Browser install nằm ngoài repo. E2E tự khởi động/đóng server Python thật.

## Đã chạy

- 12 transition, inverse property, oracle xoay tám đỉnh hộp độc lập 3.000 case.
- Fragile/goal/switch/bridge/split/merge, stationary cube, merge landing thứ hai,
  active remap, overlap, support sau switch/teleport, immutability/hash.
- Toàn bộ 15 level: từng ô/start/goal/links so với primary fixtures; replay qua core
  và browser thắng đúng action cuối. Hash certificate kiểm tra đủ data/core hiện tại.
- 15 lời giải tối ưu được kiểm chứng bằng công cụ tạm ngoài repo; chỉ kết quả được giữ.
  Expanded/discovered có định nghĩa riêng, không gọi là total reachable.
- Camera actual projection trên 1440×900, 1280×720, 390×844, đủ 15 màn mỗi viewport.
- 200 phím PRNG, repeat keys, D-pad, synthetic touch swipe; 30 lần đổi màn và GPU
  geometry/texture bounds; restart trong tween/request và hai load cạnh tranh.
- Undo qua split/merge; missing solver; fake replay từ current state, Pause/Step/Speed/Stop.
- Fall/win 3 lượt mỗi loại ở speed=1, input/Undo/Solve bị khóa khi terminal FX;
  restart/đổi màn trong terminal; normal-speed split/merge và transition.
- Pause/resume queue khi visibility đổi; WebGL context loss bằng extension và thông báo.
- Server restart thật, session expired; assets chạy khi chặn request ngoài localhost.
- Benchmark fixture tạo CSV, bốn PNG và Markdown trong test harness; không coi fixture
  là số liệu hiệu năng thuật toán của sinh viên.
- Đã xem 15 ảnh desktop, mobile, standing/H/V, split/swap, bridge, fragile, goal và
  chuỗi frame lấy mẫu tween/fragile capture .25×. Ruffle chạy đúng SWF đã chốt, ảnh Stage 01 được đối chiếu.

## Các phase và commit

| Phase | Nội dung | Commit |
|---|---|---|
| Baseline | Checkout gốc, 100 unit/API + 22 E2E, 90 skip | 40770f1 |
| 0 | Audit nguồn, build/hash, baseline | 70633f3 |
| 1 | Sửa stationary soft và merge landing; 40 core tests, strict types | 3820910 |
| 2 | 15 map gốc + chứng nhận; 118 passed, 90 skip non-E2E | 7b41591 |
| 3 | Camera, pose, texture, 25 E2E xanh | 9d2c4a8 |
| 4 | Timing/cancellation/FSM, 10 test tập trung xanh | 927db7f |
| 5 | Regression đầy đủ + hash + pointer/context/normal split | 045f862 |
| 5 bổ sung | Sửa FX remnants, test khóa input deterministic, bỏ bytecode | 9fcedf3 |
| 6 | Đồng bộ docs, ảnh và bàn giao | Xem commit cuối `git log` |

Phase 4 đạt kiểm tra vận hành/cancel nhưng phần chứng nhận timing tương đương bản gốc
còn thiếu median đáng tin cậy. Không đánh dấu toàn bộ fidelity đã hoàn tất.

## Giới hạn còn lại

- Phạm vi 1–15; không có 16–33. Đây không còn là bộ coursework15 tự thiết kế.
- Timing gốc chỉ có các số nominal từ timeline; fall/intro/outro/merge chưa chứng nhận
  tương đương. Đồ họa/âm thanh procedural không pixel-identical. Xem FIDELITY.md.
- Các trường hợp synthetic teleport/overlap và transient Flash frame behavior chưa đủ
  đối chiếu runtime, dù luật atomic đã có regression tests.
- Chưa chạy trực tiếp Windows/macOS, Python 3.10/3.11, GPU hoặc cảm ứng/âm thanh thiết bị
  thật. Spawn/pathlib hỗ trợ đa nền tảng nhưng không thay thế nghiệm thu trên máy nộp.
- Không chứng nhận 60 fps; software WebGL có jitter. Không có benchmark solver thật,
  proof heuristic, Report.pdf, video thuyết trình hoặc MSSV của nhóm.

17 file bytecode Python 3.10 có sẵn trong baseline đã được bỏ khỏi tracked files/gói nộp; mã nguồn solver/heuristic không thay đổi so với baseline; AST audit kiểm tra mọi stub chỉ có
hợp đồng và `raise NotImplementedError`. Không có search code mới trong diff hoặc gói tải.
