# 15 màn tham chiếu

Profile: reference15. Nguồn chung: SWF có hash trong REFERENCE.md, root frame 15; fixtures/reference15.json giữ bản dữ liệu đối chiếu. Không xoay/lật map. Mỗi board 10 hàng × 15 cột kể cả void padding. Tên Stage giữ thứ tự bản gốc.

Group 1 = 1–4 (đã có switch/bridge và fragile); group 2 = 5–6; group 3 = 7–9 (có split); group 4 = 10–15 (hỗn hợp). Group phục vụ harness theo ID, không phải phân loại độc quyền cơ chế.

| Ảnh app | Stage / passcode | Group | Cơ chế xuất hiện ngoài floor/goal | Optimal actions | Chứng nhận |
|---|---|---:|---|---:|---|
| ![Stage 1](screenshots/level_01.png) | 01 / 780464 | 1 | — | 7 | Verified, unit + SWAP |
| ![Stage 2](screenshots/level_02.png) | 02 / 290299 | 1 | bridge, heavy_switch, soft_switch | 17 | Verified, unit + SWAP |
| ![Stage 3](screenshots/level_03.png) | 03 / 918660 | 1 | — | 22 | Verified, unit + SWAP |
| ![Stage 4](screenshots/level_04.png) | 04 / 520967 | 1 | fragile | 28 | Verified, unit + SWAP |
| ![Stage 5](screenshots/level_05.png) | 05 / 028431 | 2 | bridge, soft_switch | 33 | Verified, unit + SWAP |
| ![Stage 6](screenshots/level_06.png) | 06 / 524383 | 2 | — | 35 | Verified, unit + SWAP |
| ![Stage 7](screenshots/level_07.png) | 07 / 189493 | 3 | bridge, heavy_switch | 44 | Verified, unit + SWAP |
| ![Stage 8](screenshots/level_08.png) | 08 / 499707 | 3 | split_switch | 11 | Verified, unit + SWAP |
| ![Stage 9](screenshots/level_09.png) | 09 / 074355 | 3 | split_switch | 25 | Verified, unit + SWAP |
| ![Stage 10](screenshots/level_10.png) | 10 / 300590 | 4 | bridge, heavy_switch, soft_switch, split_switch | 58 | Verified, unit + SWAP |
| ![Stage 11](screenshots/level_11.png) | 11 / 291709 | 4 | bridge, soft_switch | 47 | Verified, unit + SWAP |
| ![Stage 12](screenshots/level_12.png) | 12 / 958640 | 4 | bridge, heavy_switch | 65 | Verified, unit + SWAP |
| ![Stage 13](screenshots/level_13.png) | 13 / 448106 | 4 | fragile | 46 | Verified, unit + SWAP |
| ![Stage 14](screenshots/level_14.png) | 14 / 210362 | 4 | bridge, heavy_switch | 67 | Verified, unit + SWAP |
| ![Stage 15](screenshots/level_15.png) | 15 / 098598 | 4 | bridge, heavy_switch, soft_switch, split_switch | 61 | Verified, unit + SWAP |

Có mặt không tự chứng minh cơ chế bắt buộc; bản này không áp dụng ablation claim của bộ coursework cũ. Expanded/discovered và hash chi tiết ở LEVEL_VERIFICATION.md. Các chứng nhận áp dụng mô hình atomic rules hiện tại; không áp dụng mọi hành vi frame trung gian của Flash.
