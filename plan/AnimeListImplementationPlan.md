# Plan Trien Khai Tinh Nang Anime List (V2)

## 1. Muc tieu nghiep vu

Tinh nang can ho tro day du:
- CRUD list.
- Set private/public cho list.
- Role trong list: owner, editor, viewer.
- Invite nguoi dung vao list voi role editor hoac viewer.
- Nguoi dung co the request join list private.
- Viewer co quyen request len editor.
- Doi mau theme cua list bang bang mau.
- Co the tim (yeu thich) list, hien thi so luot like.
- API phai match voi ZentakuFE va pbl5_fe_shared-logic.

## 2. Nguyen tac thiet ke

### 2.1 Tai su dung entity (khong tao bang moi)

- CustomList: thong tin list, ownerId, privacy, settings.
- ListItem: item anime trong list.
- ListInvitation: luu member/invite/request qua permission + status + request_type.
- Activity: luu LIST_LIKE va cac su kien list.

### 2.2 Quy uoc domain

- owner = CustomList.ownerId.
- editor/viewer = ListInvitation co status = ACCEPTED.
- invite/join/edit-request = ListInvitation co status = PENDING.
- theme = CustomList.settings.themeKey + themeColor.
- like_count = dem Activity theo listId voi type LIST_LIKE.

### 2.3 Quy tac phan quyen

- owner: full control list, member, requests, theme, delete.
- editor: add/remove item, cap nhat note item (neu co), khong doi owner/privacy.
- viewer: view list, request edit, khong chinh sua item.
- non-member:
- list public: co the xem, co the like.
- list private: khong xem duoc neu chua co quyen.

## 3. API Contract Freeze (bat buoc truoc khi code sau) - 0.5 den 1 ngay

Muc tieu: khoa contract de backend/frontend lam song song, tranh vo API giua sprint.

### 3.1 Contract can dong bo voi FE hien tai

- POST /list/create/
- GET /list/user/?username=
- PUT /list/:listId/update/
- DELETE /list/:listId/delete/
- GET /list/member/:listId/list/
- POST /list/member/:listId/add/
- PUT /list/member/:listId/permission/
- DELETE /list/member/:listId/remove/ (query: username)
- POST /list/:listId/request-join/
- POST /list/:listId/request-edit/
- GET /list/:listId/requests/
- POST /list/:listId/join-requests/:requestId/respond/
- POST /list/:listId/edit-requests/:requestId/respond/
- GET /list/anime/:listId/
- POST /list/anime/:listId/add/
- DELETE /list/anime/:listId/:mediaId/remove/
- POST /list/:listId/like/
- GET /list/:listId/like/status/
- POST /list/likes/most-liked/
- POST /list/likes/trending/ (alias tuong thich)
- POST /list/likes/user/
- POST /list/:listId/likers/
- POST /list/search/

### 3.2 Response shape can on dinh

- list detail:
- list_name, description, is_private, color, is_owner, anime_items.
- members:
- members[] gom username, permission_level, is_owner, avatar_url.
- requests:
- requests[] gom request_id, username, request_type, status, message, requested_at.
- likes:
- like_count, liked_by_me.

## 4. Ke hoach trien khai theo giai doan

## Giai doan 1: Nen tang CRUD + list detail (2-3 ngay)

### Muc tieu

- Co list module chay duoc end-to-end: tao/sua/xoa/xem list.
- Co endpoint detail phuc vu man AnimeListPage.

### Cong viec chi tiet

- Tao module src/modules/list/:
- list.controller.ts
- list.service.ts
- list.repository.ts
- dto/*.ts
- validations/*.ts
- CRUD cho CustomList.
- Generate slug duy nhat theo list_name.
- Validate input:
- list_name (required, max length).
- description (optional, max length).
- is_private (boolean).
- color/theme (chi cho phep trong palette).
- Tao endpoint detail list tra cung anime_items de FE khong can goi qua nhieu API.
- Tich hop swagger + error response chuan.

### Endpoints giai doan 1

- POST /list/create/
- GET /list/user/
- GET /list/:listId
- GET /list/anime/:listId/
- PUT /list/:listId/update/
- DELETE /list/:listId/delete/

### Done criteria

- Owner CRUD duoc list cua minh.
- Non-owner khong sua/xoa duoc list.
- FE tao list va sua thong tin list thanh cong.

## Giai doan 2: Role va member management (3-4 ngay)

### Muc tieu

- Hoan tat owner/editor/viewer theo domain.
- Co middleware phan quyen tai mot noi.

### Cong viec chi tiet

- Tao middleware:
- isListOwner()
- canEditList()
- canViewList()
- Truy van member tu ListInvitation ACCEPTED + owner tu CustomList.
- Them member truc tiep (v1) voi role editor/viewer.
- Update permission viewer <-> editor.
- Remove member theo username.
- Chan owner tu xoa chinh minh neu chua transfer owner (de tranh list vo chu).

### Endpoints giai doan 2

- GET /list/member/:listId/list/
- POST /list/member/:listId/add/
- PUT /list/member/:listId/permission/
- DELETE /list/member/:listId/remove/

### Done criteria

- FE Sidebar hien thi dung role, owner actions, remove/update role hoat dong.
- Permission sai bi chan bang 403 ro rang.

## Giai doan 3: Invite va request workflows (3-4 ngay)

### Muc tieu

- Hoan tat flow moi/yeu cau vao list private/yeu cau len editor.

### Cong viec chi tiet

- Invite user vao list voi permission editor/viewer.
- Request join cho private list.
- Request edit cho viewer.
- Respond approve/reject tu owner.
- Rule tranh trung request pending cung loai.
- Rule trang thai:
- PENDING -> ACCEPTED/REJECTED.
- Sau ACCEPTED thi tao/cap nhat member record.
- Bo sung message cho request de FE hien thi modal.

### Endpoints giai doan 3

- POST /list/:listId/invite/
- POST /list/:listId/request-join/
- POST /list/:listId/request-edit/
- GET /list/:listId/requests/
- POST /list/:listId/join-requests/:requestId/respond/
- POST /list/:listId/edit-requests/:requestId/respond/

### Done criteria

- FE RequestModal + RequestList chay du full flow.
- Khong tao duplicate request pending.

## Giai doan 4: Theme va likes (2-3 ngay, co the song song giai doan 3)

### Muc tieu

- Doi theme list theo bang mau.
- Tim list, hien thi like count va status nguoi dung.

### Cong viec chi tiet

- Luu theme vao settings.themeKey/themeColor.
- Validate theme theo whitelist.
- Toggle like idempotent theo (userId, listId).
- Tinh like_count bang aggregate Activity type LIST_LIKE.
- Co endpoint status de FE hien icon tim.
- Co endpoint top/trending va liked-by-user.
- Ho tro endpoint likers de mo rong danh sach nguoi da like.

### Endpoints giai doan 4

- PUT /list/:listId/theme/
- POST /list/:listId/like/
- GET /list/:listId/like/status/
- POST /list/likes/most-liked/
- POST /list/likes/trending/
- POST /list/likes/user/
- POST /list/:listId/likers/

### Done criteria

- FE ListHeader hien thi like_count va toggle tim dung.
- Trang AnimeListSearch lay top list duoc.

## Giai doan 5: Search, performance, hardening (3-5 ngay)

### Muc tieu

- Hoan thien tinh nang tim kiem/kham pha.
- Nang cap hieu nang, bao mat, kha nang van hanh.

### Cong viec chi tiet

- POST /list/search/ ho tro:
- query
- sort
- pagination (page, limit)
- bo loc privacy/public only
- GET /list/discover/ cho list public/trending.
- Quan ly item nang cao:
- addItemToList
- removeItemFromList
- reorderItems (neu can)
- Bo sung index DB cho listId, ownerId, status, request_type, activity type.
- Rate limit cho like/request APIs.
- Audit log cho hanh dong quan trong (delete list, approve request).
- Swagger full + API examples.

### Endpoints giai doan 5

- POST /list/search/
- GET /list/discover/
- POST /list/anime/:listId/add/
- DELETE /list/anime/:listId/:mediaId/remove/

### Done criteria

- Search/Discover tra ve nhanh, co pagination metadata.
- Khong co regression tren API da dung boi FE.

## 5. Kiem thu va xac minh

## 5.1 Test theo giai doan

- Giai doan 1: CRUD va validation input.
- Giai doan 2: matrix permission owner/editor/viewer/non-member.
- Giai doan 3: request lifecycle va duplicate handling.
- Giai doan 4: like toggle idempotency + count consistency.
- Giai doan 5: search pagination + performance benchmark.

## 5.2 Test ma tran quyen toi thieu

- owner:
- create/update/delete list
- add/remove member
- approve/reject request
- doi theme
- editor:
- add/remove item
- khong update privacy
- viewer:
- view list
- request edit
- non-member:
- list public thi view
- list private thi khong view

## 6. Files lien quan

- src/core/base/BaseRepository.ts
- src/core/base/BaseService.ts
- src/entities/CustomList.entity.ts
- src/entities/ListItem.entity.ts
- src/entities/ListInvitation.entity.ts
- src/entities/Activity.entity.ts
- src/entities/types/enums.ts
- src/modules/user/
- pbl5_fe_shared-logic/src/services/list.service.ts

## 7. Ke hoach phat trien tuong lai

- Invite accept/decline tu phia nguoi duoc moi (khong chi owner add truc tiep).
- Notification real-time khi co request/invite duoc tao/phan hoi.
- Follow list owner, bookmark list, comment list.
- Realtime collaboration cho reorder/add item (WebSocket).
- Recommendation de xuat anime de them vao list.
- Soft delete + restore list.
- Cache Redis cho trending/search.

## 8. Milestone de xuat

- M1 (cuoi tuan 1): xong giai doan 1 + freeze contract.
- M2 (giua tuan 2): xong giai doan 2.
- M3 (cuoi tuan 2): xong giai doan 3 + FE integration request flow.
- M4 (giua tuan 3): xong giai doan 4.
- M5 (cuoi tuan 3): xong giai doan 5 + hardening + docs.
