# Kế hoạch Triển khai Backend: Quản lý Hồ sơ Người dùng

Tài liệu này mô tả lộ trình phát triển module user theo kiến trúc OOP, kế thừa Base classes, dùng Dependency Injection và loader để nạp chương trình.

## Mục tiêu kỹ thuật chính

- Service kế thừa BaseService.
- Repository kế thừa BaseRepository.
- Controller kế thừa BaseController.
- DI qua container + loader chain (infrastructure -> auth -> user -> module khác).
- DTO tối ưu chỉ còn 1 file duy nhất: src/modules/user/dto/user.dto.ts.
- Cấu trúc module user đồng bộ với cách tổ chức module auth (controllers/services/repositories/dto/validators/routes).

## Cấu trúc file đích của module user

```text
src/modules/user/
  controllers/
    user.controller.ts
  services/
    user.service.ts
  repositories/
    user.repository.ts
  dto/
    user.dto.ts
  validators/
    user.validators.ts
  user.routes.ts
```

## Giai đoạn 0: Chuẩn hóa nền tảng

- [ ] Rà soát User.entity.ts:
  - [ ] displayName, bio, website, location, avatar, banner.
  - [ ] preferences, notificationSettings.
  - [ ] profileVisibility.
  - [ ] createdAt, updatedAt, deletedAt.
- [ ] Tạo/chạy migration đồng bộ DB.
- [ ] Chuẩn hóa export entity/index để loader resolve ổn định.

## Giai đoạn 1: Chuẩn hóa DTO và Validation

- [ ] Gộp toàn bộ DTO vào 1 file: src/modules/user/dto/user.dto.ts.
- [ ] DTO tối thiểu:
  - [ ] UpdateProfileDto
  - [ ] UpdatePreferencesDto
  - [ ] UpdatePrivacyDto
  - [ ] UpdateAvatarDto
  - [ ] UpdateBannerDto
- [ ] Đồng bộ validators trong src/modules/user/validators/user.validators.ts.
- [ ] Routes chỉ import validator từ user.validators.ts.

## Giai đoạn 2: Refactor Repository theo BaseRepository

- [ ] UserRepository extends BaseRepository<User>.
- [ ] Interface IUserRepository giữ đủ method cho auth + user:
  - [ ] findById
  - [ ] findByEmail
  - [ ] findByUsername
  - [ ] create
  - [ ] update
- [ ] Bổ sung method đặc thù user:
  - [ ] searchByDisplayName
  - [ ] method hỗ trợ profile visibility (nếu cần).

## Giai đoạn 3: Refactor Service theo BaseService

- [ ] UserService extends BaseService.
- [ ] Dùng helper từ BaseService:
  - [ ] _validateId
  - [ ] _validateString
  - [ ] _validateEnum
  - [ ] _executeWithErrorHandling
  - [ ] _logInfo/_logWarn/_logError
- [ ] Methods bắt buộc:
  - [ ] getProfile(userId)
  - [ ] updateProfile(userId, dto)
  - [ ] updatePreferences(userId, dto) (merge JSON partial)
  - [ ] updatePrivacy(userId, dto)

## Giai đoạn 4: Refactor Controller theo BaseController

- [ ] UserController extends BaseController<UserService>.
- [ ] Dùng helper từ BaseController:
  - [ ] asyncHandler
  - [ ] success/error
  - [ ] getBody/getUserId
  - [ ] requireAuth
  - [ ] handleError
- [ ] Endpoints:
  - [ ] GET /me
  - [ ] PATCH /me
  - [ ] PATCH /me/preferences
  - [ ] PATCH /me/privacy

## Giai đoạn 5: DI và Loader khởi tạo

- [ ] Hoàn thiện src/config/loaders/user.loader.ts:
  - [ ] Register userRepository (fallback nếu chưa có từ auth loader).
  - [ ] Register userService (dependency: userRepository).
  - [ ] Register userController (dependency: userService).
- [ ] Đảm bảo src/config/loaders/index.ts có gọi userLoader.
- [ ] Đảm bảo container.initialize() resolve được dependencies quan trọng.

## Giai đoạn 6: Route integration và boot flow

- [ ] user.routes.ts resolve userController từ container.
- [ ] Route có authenticate middleware cho endpoint private.
- [ ] src/routes/index.ts mount user routes đúng prefix.
- [ ] server.ts: initialize container xong mới createApp/listen.

## Giai đoạn 7: Kiểm thử và hardening

- [ ] Kiểm tra compile:
  - [ ] npm run build
  - [ ] npm run lint
- [ ] Kiểm tra runtime:
  - [ ] GET /api/user/me
  - [ ] PATCH /api/user/me
  - [ ] PATCH /api/user/me/preferences
  - [ ] PATCH /api/user/me/privacy
- [ ] Kiểm tra các case lỗi:
  - [ ] thiếu auth
  - [ ] invalid body
  - [ ] user không tồn tại

## Roadmap mở rộng (sau khi ổn định)

1. Upload avatar/banner bằng multer + cleanup file cũ.
2. Access control đầy đủ theo profileVisibility + relationship.
3. Rate limiting cho endpoint chỉnh sửa profile.
4. Audit log cho thay đổi profile và privacy.