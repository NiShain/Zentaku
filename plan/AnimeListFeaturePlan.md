# Ke hoach trien khai tinh nang Anime List

Tai lieu nay mo ta lo trinh xay dung tinh nang danh sach anime theo nhieu giai doan, phu hop voi kien truc hien tai cua Zentaku va contract dang duoc FE su dung.

Nguyen tac rang buoc:
- Khong them bang database moi.
- Giu nguyen ten bien, enum, endpoint, table va cac symbol ky thuat.
- Uu tien tuong thich voi listService trong pbl5_fe_shared-logic de giam refactor FE.

## Muc tieu nghiep vu

Tinh nang can ho tro day du:
- CRUD list.
- Set private/public cho list.
- Role trong list: owner, editor, viewer.
- Invite nguoi dung vao list voi role editor hoac viewer.
- Nguoi dung co the request join list private.
- Viewer co the request len editor.
- Doi mau theme cua list bang bang mau.
- Like list (tim), hien thi so luot like.

## Kien truc tai su dung (khong tao bang moi)

Su dung cac entity san co:
- CustomList: luu thong tin list, ownerId, privacy, settings.
- ListItem: luu item anime trong list.
- ListInvitation: luu invite/request/member state thong qua permission + status.
- Activity: luu su kien like va activity log lien quan list.

Quy uoc domain:
- owner = CustomList.ownerId.
- editor/viewer = ListInvitation co status = ACCEPTED.
- invite/join request/edit request = ListInvitation co status = PENDING.
- theme cua list = CustomList.settings.themeKey/themeColor.
- like count = dem Activity theo listId voi type LIST_LIKE.

## Giai Đoạn 1: Nền Tảng (CRUD Cơ Bản) - Tạo module: src/modules/list/ với cấu trúc chuẩn (controller → service → repository)

- Chốt endpoint cần hỗ trợ để match FE:
  - GET /list/user/
  - POST /list/create/
  - PUT /list/{id}/update/
  - DELETE /list/{id}/delete/
  - GET /list/anime/{id}/
  - POST /list/anime/{id}/add/
  - DELETE /list/anime/{id}/{anilistId}/remove/
  - GET /list/member/{id}/list/
  - POST /list/member/{id}/add/
  - PUT /list/member/{id}/permission/
  - DELETE /list/member/{id}/remove/
  - POST /list/{id}/request-join/
  - POST /list/{id}/request-edit/
  - GET /list/{id}/requests/
  - POST /list/{id}/join-requests/{requestId}/respond/
  - POST /list/{id}/edit-requests/{requestId}/respond/
  - POST /list/{id}/like/
  - GET /list/{id}/like/status/
  - POST /list/{id}/likers/
  - POST /list/likes/trending/
  - POST /list/likes/most-liked/
  - POST /list/search/

- Chốt response shape ưu tiên theo FE types:
  - ListInfo
  - GroupedAnime
  - ListMember
  - ListRequest

## Phase 1 - Core CRUD + Privacy (cơ bản)

- Tạo module list theo pattern module hiện có:
  - repositories
  - services
  - controllers
  - validators
  - dto
  - routes

- Implement CRUD list:
  - create list.
  - get list detail + get user lists.
  - update list (owner only).
  - soft delete list (owner only).

- Implement privacy gate:
  - PUBLIC: cho phép read công khai.
  - PRIVATE: chỉ owner và accepted members được read.

- Implement item operations cơ bản:
  - add anime vào list.
  - remove anime khỏi list.
  - chống duplicate media trong cùng một list.
  - group item theo người thêm để match UI.

## Phase 2 - Collaboration (invite/member/permission)

- Invite flow:
  - owner/editor có quyền invite (có thể start với owner-only để đơn giản).
  - tạo ListInvitation với permission = EDITOR/VIEWER, status = PENDING.

- Member management:
  - accept/decline invite.
  - list members.
  - remove member (không remove owner).
  - update member permission viewer <-> editor (owner only).

- Authorization matrix trong service:
  - owner: full control.
  - editor: quản lý item và một số thao tác được cấp phép.
  - viewer: read-only.

## Phase 3 - Request join private + request lên editor

- Request join list private:
  - user tạo request join vào owner.
  - lưu bằng ListInvitation với status = PENDING, permission = VIEWER.

- Viewer request upgrade:
  - viewer gửi request lên EDITOR.
  - lưu PENDING request và chờ owner phê duyệt.

- Owner response flow:
  - approve/reject join request.
  - approve/reject edit request.

- Rule cần enforce:
  - không tạo request trùng lặp khi đang có PENDING cùng type.
  - nếu đã là EDITOR thì không được request lên EDITOR nữa.

## Phase 4 - Theme palette + Like + Discovery

- Theme palette:
  - sử dụng whitelist palette (vd: ocean, mint, sunset, slate...).
  - validate themeKey/themeColor ở validator.
  - lưu vào CustomList.settings.

- Like list:
  - toggle like/unlike qua Activity type = LIST_LIKE.
  - getListLikeStatus theo user hiện tại.
  - getListLikers có pagination.
  - đếm like count theo listId.

- Discovery:
  - getTrending.
  - getMostLikedLists.
  - searchCustomLists theo query.

## Phase 5 - Integration với Zentaku_FE và shared-logic

- Ưu tiên giữ contract trong pbl5_fe_shared-logic/src/services/list.service.ts.
- Ưu tiên field naming mà FE đang tiêu thụ (list_name, is_private, permission_level...) để giảm adapter.
- Nếu cần đổi shape backend, tạo adapter nhẹ ở shared-logic thay vì sửa nhiều page.

## Phase 6 - Hardening, test, rollout

- Test service logic:
  - role matrix owner/editor/viewer.
  - state transition của InviteStatus.
  - guard privacy.

- Integration test endpoint chính:
  - CRUD list.
  - invite/accept/decline.
  - request-join/request-edit/respond.
  - like/status/likers/trending/most-liked/search.

- Build/type-check:
  - Zentaku: npm run type-check, npm run build.
  - pbl5_fe_shared-logic: npm run build.
  - Zentaku_FE: npm run build.

- Rollout theo lớp:
  - Đợt 1: CRUD + privacy + item operations.
  - Đợt 2: collaboration + request flows.
  - Đợt 3: likes + discovery + tối ưu.

## Hướng phát triển tương lai

- Notification realtime cho invite/request/approve.
- Batch actions cho item (move, reorder, bulk remove).
- Recommendation list dựa trên hành vi like và tương đồng media.
- Ranking list đa tiêu chí (freshness, engagement, like velocity).

## Danh sách file liên quan

- Zentaku/src/core/base/BaseRepository.ts
- Zentaku/src/core/base/BaseService.ts
- Zentaku/src/core/base/BaseController.ts
- Zentaku/src/entities/CustomList.entity.ts
- Zentaku/src/entities/ListItem.entity.ts
- Zentaku/src/entities/ListInvitation.entity.ts
- Zentaku/src/entities/Activity.entity.ts
- Zentaku/src/entities/types/enums.ts
- Zentaku/src/routes/index.ts
- pbl5_fe_shared-logic/src/services/list.service.ts
- pbl5_fe_shared-logic/src/features/animeListPage/animeListPage.types.ts
- Zentaku_FE/src/pages/AnimeListPage/AnimeListPage.tsx
