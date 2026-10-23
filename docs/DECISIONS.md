# Quyết định và cách thay đổi

| # | Quyết định | Lý do / nơi đổi |
|---|---|---|
| D01 | Cube đơn an toàn trên fragile | Đúng default đề và đã đối chiếu cube handler bản tham chiếu. Đổi check fragile trong rules và test tương ứng. |
| D02 | SWAP cost 1, moves +1; không switch, không merge (khác bộ đếm gốc) | SWAP không rời ô; tránh toggle bởi thao tác chọn cube. Nhánh SWAP trong rules. |
| D03 | Split move chỉ kích hoạt soft switch tại ô cube vừa đến | Đối chiếu handler cube bản gốc. Cube đứng yên không bấm lại; test_reference_rules.py. Đổi rules thì phải kiểm chứng lại lời giải. |
| D04 | Whole block H xét trái→phải, V xét dưới→trên; targets theo JSON | Khớp anchor và landing handler bản gốc. Đây là thứ tự event khi nhiều switch cùng tác động bridge. |
| D05 | Sau split placement kiểm tra support lần nữa | Bridge ở đích có thể đã đóng sau lần load; tránh successor không hợp lệ. Test riêng. |
| D06 | Merge là một landing mới, bấm soft lần nữa và kiểm tra support | Bản gốc sprite 1152 frame 290/310. Cube vừa đến soft có thể bấm hai lần trong một action (trước và sau merge). Teleport không tự cascade switch; trường hợp synthetic này chưa chứng nhận tương đương Flash. |
| D07 | Cube đầu JSON là active khi split | State tự remap index khi sort; kiểm thử với đích đảo thứ tự. |
| D08 | Invalid SWAP/overlap trả LOST ở core, UI chặn SWAP không split | Hợp đồng StepResult thống nhất. API action sai tên bị 422. |
| D09 | Switch activation cost 1 ưu tiên hơn fragile risk 2 | Khi nằm trên một soft và một fragile, xử lý đúng ngoại lệ switch của đề. `core/costs.py`, có regression test. |
| D10 | expanded_nodes đếm khi lấy node khỏi frontier để mở rộng | Thống nhất contract; solver tự điền, wrapper không đoán. Nhóm phải giữ cùng quy ước cho goal pop. Không kiểm tra số đếm bằng search code phụ. |
| D11 | Time và tracemalloc đo riêng; timeout mỗi pass gồm spawn | Tránh tracemalloc làm sai time. search_time chỉ gồm solve; peak là Python traced allocations trong solve, không phải OS RSS/GPU. |
| D12 | Seq tăng cả restart/undo, moves có thể giảm | Tránh request lặp sau reset. Restart khi animation/in-flight tạo session mới để cách ly request cũ; restart idle gọi endpoint reset. |
| D13 | Replay từ state hiện tại, giữ history; stop tại action boundary | Không cần tự dịch ngược luật; cùng move/animation path. API cũng hỗ trợ from_initial. |
| D14 | reference15 thay bộ màn tự thiết kế cũ | Dữ liệu 15 màn đầu lấy từ SWF có hash trong REFERENCE.md. Không thêm pressure plate hay sửa puzzle để vừa tiến trình cơ chế cũ. |
| D15 | Không ép độ dài tăng dần hay gọi màn 13–15 là stress | Giữ thứ tự gốc; optimal actions 7–67. Group chỉ phân theo ID, xem LEVELS.md. Bộ coursework cũ vẫn nằm trong git history. |
| D16 | 64 bridge ID tối đa, ID không cần liên tiếp | Chặn dữ liệu vô lý; bitmask Python vẫn có thể mở rộng bằng sửa validator. |
| D17 | Placeholder StudentID1_StudentID2, không tạo Report.pdf | Chưa có toàn bộ MSSV nhóm; user yêu cầu báo cáo do nhóm làm. Đổi tên thư mục ngoài, thêm PDF khi nộp. |
| D18 | Phiên bản JS local: Three 0.160.1, GSAP 3.12.5 | Chạy/quay video offline. Không CDN fallback cần thiết trong bản bàn giao. Giữ header/license vendor. |
| D19 | UI dùng tiếng Anh ngắn; thông báo solver thiếu/timeout tiếng Việt | Nhãn gọn cho video, đúng thông báo yêu cầu. Chỉnh trong UI.js/index.html. |
| D20 | Semantic error line chỉ tới grid row/key collection | JSON parser không giữ vị trí mọi node; không báo line giả chính xác token. `Level.load`. |
| D21 | Headless Chromium dùng software WebGL trong e2e | Môi trường không có GPU vật lý. Kiểm tra functional/pose thật, không chứng nhận 60 fps trên mọi máy. |
| D22 | Session local có TTL và capacity; không authentication | Chỉ bind 127.0.0.1; đúng phạm vi đồ án. Không expose public khi chưa bổ sung bảo vệ. |
| D23 | Camera orthographic cố định theo lattice (32,-5), (10,16) | Test phép chiếu camera thật trên 3 viewport; không follow/shake/yaw hoặc ép start gần goal xa. |
| D24 | Timing reference mới xác minh một phần | Roll/sink/split dựa frame 36 fps; các FX còn lại giữ fallback. Chưa đo median thời gian của bản gốc nên không chứng nhận giống 100%. Xem FIDELITY.md và timing.js. |
| D25 | Progress dùng namespace reference15 | Không xóa storage bộ màn cũ và không gán completion cũ cho puzzle mới. Các key bloxorz.reference15.*. |
| D26 | Khóa Undo/move/solve trong terminal FX; Restart/Level Select hủy an toàn | cancelSceneWork abort fetch, cancel tween, xả buffer; epoch chặn callback cũ. Stop replay chờ action boundary, reset speed về 1. |

Nhãn difficulty 1–5 trong UI được phân theo stage ID để trình bày; không là xếp hạng gốc hay kết luận độ khó thực nghiệm.

Không có heuristic hay search implementation được cung cấp. Optimal metadata đến từ công cụ tạm nằm ngoài repo và đã xóa khi bàn giao; kiểm tra lại bằng BFS của nhóm sau khi tự cài.
