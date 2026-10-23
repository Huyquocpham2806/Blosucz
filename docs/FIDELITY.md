# Fidelity — reference15

Phạm vi: 15 màn đầu của build ghi trong [REFERENCE.md](REFERENCE.md).
`verified` chỉ áp dụng điều kiện nêu tại dòng đó. Không có điểm phần trăm tổng hợp.
Asset procedural, UI đồ án và mô hình bước atomic không phải bản sao Flash từng pixel/frame.

| Hạng mục | Bản tham chiếu | Baseline / thay đổi hiện tại | Bằng chứng | Test / kết quả |
|---|---|---|---|---|
| Layout từng ô | Stage arrays root frame 15 | Bộ tự thiết kế → 15 layout gốc, không xoay/lật | SWF hash, fixtures/reference15.json | 15 case đối chiếu từng tile: verified |
| Start/goal | Start xy, tile e | Giữ tọa độ nguồn, đổi xy→rc | Stage arrays | test_reference_levels: verified |
| Bridge ban đầu | l/r đóng, k/q mở | Chuyển thành bitmask, mỗi ô bridge một ID | Root frame 47 | Đối chiếu mọi bridge: verified |
| Switch targets/mode | onoff/on/off và danh sách đích có thứ tự | Toggle/permanent open/closed | Root frame 15 | Đối chiếu toàn bộ links/modes: verified |
| Split destinations/active | Hai đích, đích thứ nhất được chọn | State sort nhưng remap active theo vị trí | Sprite 1152 frame 282 | Tests split/reference levels: verified |
| Hình học lăn | Ba footprint, xoay 90° quanh cạnh | Giữ core, pivot thực trong GUI | Sprite landing + quan sát | 12 transition, inverse property, 3.000 oracle samples: verified |
| Cube bất động trên soft | Không press khi cube kia đi | Sửa bug baseline lặp toggle | Cube overair2 handler | test_reference_rules: verified |
| Merge/soft | Cube landing rồi whole-block landing | Sửa thêm pass sau merge, có thể press hai lần | Sprite 1152 frame 290/310 | Hai regression traces: verified |
| Nhiều switch cùng bước | H trái→phải; V dưới→trên | Sửa thứ tự V theo anchor | Whole-block landing handler | Core switch fixtures: verified trong mô hình atomic |
| Fragile, goal | Cube nhẹ an toàn; chỉ whole đứng vào goal thắng | Giữ luật đã đúng | Cube/whole landing handlers | Special tile tests: verified |
| Teleport lên switch, adjacent teleport, collision synthetic | Không có đủ quan sát runtime cho mọi fixture | Giữ atomic support/overlap checks; không cascade teleport | RULES/DECISIONS | Regression xanh nhưng độ giống Flash: unverified |
| Arrow controls | Bốn hướng, Space chọn cube | Giữ mapping; thêm WASD/D-pad/swipe | Original instructions/handlers | Keyboard, repeat, pointer/D-pad E2E: verified mapping; tiện ích thêm intentional_difference |
| Camera | x=32c+10r; y=-5c+16r | Perspective/follow → orthographic cố định, không shake/yaw | Root frame 47 + ảnh Stage 01 | Actual camera slope ≤1e-6; all-stage bounds 3 viewport: verified |
| Framing | Board ở trong viewport gốc | Fit động theo canvas còn lại, kể cả cầu đóng + block cao | screenshots/; test_projection | x≤0.861, y≤0.721 NDC: verified. Responsive fit là intentional_difference |
| Block/tile ratio | Block 1×1×2, cube 1³ | Mesh .98×1.96×.98; padding tile nhỏ | Source geometry/ảnh | pose checks position/quaternion/scale + ảnh: verified tỷ lệ hình học |
| Chất liệu/màu | Đá xám, block rỉ, nền đỏ cam đen | Thay neon/gold bằng CanvasTexture/gradient tương ứng | reference_stage01.png; 15 ảnh app | Tái tạo procedural: intentional_difference; không pixel-identical |
| Goal | Lỗ vuông sâu | Hốc tối, sửa đáy nhô xuống dưới sàn | Ảnh before/after | Đã xem ảnh: verified dễ nhận; depth shading không chứng nhận giống pixel |
| Biểu tượng | Soft octagon, heavy X, split ( ) | Canvas symbols, legend và thumbnail cập nhật | Reference + app screenshot | Đã xem; procedural artwork intentional_difference |
| Roll timing | ~9 frame ở 36 fps | .28 + squash/particles → 9/36 s, bỏ FX chặn tiếp | Sprite 1152 frames 2–10 | Nominal source-frame estimate; wall-clock reference median unverified |
| Sink timing | End 259→267 (8 interval) | .65→8/36 s; bỏ neon ring/flash | Sprite 1152 end frames | App normal-speed test xanh; reference median unverified |
| Split timing | 270→282 (12 interval) | .45→12/36 s | Sprite 1152 split frames | Normal-speed split/merge E2E; exact interpolation unverified |
| Fall | .600 | .600 giữ nguyên | 0.644 |
| Intro/outro/merge | Timeline và tile fade theo frame | Giữ stagger/merge pulse của đồ án, gom timing | TransitionManager/timing.js | Cancel/normal-speed E2E; source equivalence unverified |
| Moves / SWAP | Space không cộng moves | Mỗi action kể cả SWAP cộng 1 | Original key handler | Intentional_difference để thống nhất solution length |
| Risk cost | Không là điểm game gốc | Unit/risk model cho nghiên cứu | costs.py, RULES | Intentional_difference, regression xanh |
| Undo/replay/solver/metrics | Không thuộc gameplay gốc | Giữ, solver chưa cài trả not_implemented | API/solver contracts | Intentional_difference; fake fixture chỉ trong tests |
| Âm thanh | Sample gốc | WebAudio tùy chọn, mặc định tắt | UI.js | Intentional_difference; chưa kiểm trên loa/thiết bị thật |

## Timing trước/sau và số đo

Đơn vị giây. `web/scene/timing.js` là cấu hình duy nhất của GSAP FX.
Không bổ sung hold sau terminal. GIF/frame sheets lấy mẫu tiến độ tween (riêng fragile capture ở 0.25×),
**không** dùng cho số đo. `timing_measurements.json` ghi 3 lượt fall và 3 lượt win ở speed=1,
reduced-motion tắt, trên Linux/Chromium software WebGL 1440×900. Event timer bắt đầu
trước effect handler và kết thúc sau Promise; terminal→idle kết thúc khi load/intro
màn tiếp theo nhận input. Network là tổng request move + new-session của lượt.

| Giai đoạn | Baseline nominal | Hiện tại nominal | Median app đo thật |
|---|---:|---:|---:|
| Roll | .28 + .07 squash + .12 landing | .250 | 0.520 (6 lượt; 0.285–0.589) |
| Fall | .600 | .600 giữ nguyên | 0.644 |
| Sink | .650 | .222 | 0.239 |
| Hold | 0 | 0 | Không thêm |
| Intro | .65 + .25 + .23 | 1.130 | Gồm trong terminal→idle |
| Outro | .450 | .450 giữ nguyên | Gồm trong terminal→idle |
| Fall→idle | Chưa đo baseline | 1.730 + network danh nghĩa | 1.974 |
| Win→idle | Chưa đo baseline | 1.802 + network danh nghĩa | 2.213 |
| Network, fall / win | Chưa đo | Không đặt thời lượng giả | 0.0087 / 0.0145 |

Software rendering gây jitter đáng kể, không chứng nhận 60 fps. Đã chạy SWF bằng
Ruffle và xem Stage 01, nhưng chưa có phép lấy median runtime gốc với sai số đủ nhỏ
để chứng nhận nhịp rơi/chuyển màn; emulation/software WebGL không cung cấp mốc frame
ổn định cho phép so khớp đó. Frame counts chỉ là bằng chứng nominal, không thay thế
số đo. **TIMING_PROFILE=reference mới hoàn thành một phần**, không gọi là comfortable
và cũng không gọi timing chính xác bản gốc. Người tiếp tục công việc cần đo bản gốc
trên runtime ổn định, cập nhật timing.js, chạy test_lifecycle rồi ghi lại số đo.

## Hình ảnh và chuỗi frame đã xem

- [So sánh crop, scale đồng nhất hai trục](screenshots/comparison_stage01.jpg).
- [Reference Stage 01](screenshots/reference_stage01.png), [app Stage 01](screenshots/level_01.png).
- [Danh mục 15 màn](LEVELS.md), [mobile](screenshots/mobile.png).
- [Roll](screenshots/frames_roll.jpg), [fall](screenshots/frames_fall.jpg), [sink](screenshots/frames_sink.jpg).
- [Split](screenshots/frames_split.jpg), [merge](screenshots/frames_merge.jpg), [fragile](screenshots/frames_fragile.jpg).
- [Split state](screenshots/stage08_split.png), [cube swap](screenshots/stage15_swap.png).

Ảnh/chuyển động app không sử dụng lại asset của SWF. Ảnh reference chỉ là tài liệu QA.

Regression traces đầy đủ state trước/action/state sau/events: [reference_landing_traces.json](reference_landing_traces.json). Các fixture tương ứng nằm trong tests/test_reference_rules.py.
