# TÀI LIỆU KỸ THUẬT - HỆ THỐNG BÁN KÍNH MẮT TRỰC TUYẾN

> **Dành cho:** Học sinh cấp 3 và người mới bắt đầu  
> **Mục đích:** Hiểu rõ cách hoạt động của 4 tính năng chính trong hệ thống

---

## 📋 MỤC LỤC

1. [Chatbot AI - Trợ Lý Tư Vấn Thông Minh](#1-chatbot-ai---trợ-lý-tư-vấn-thông-minh)
2. [Virtual Try-On - Thử Kính Ảo](#2-virtual-try-on---thử-kính-ảo)
3. [View in 3D - Xem Mô Hình 3D](#3-view-in-3d---xem-mô-hình-3d)
4. [GHN Integration - Tích Hợp Vận Chuyển](#4-ghn-integration---tích-hợp-vận-chuyển)

---

## 1. CHATBOT AI - TRỢ LÝ TƯ VẤN THÔNG MINH

<!-- ### 🎯 Mục đích
Giúp khách hàng tìm kiếm và chọn kính phù hợp thông qua trò chuyện tự nhiên với AI.

### 🔧 Công nghệ sử dụng
- **OpenAI GPT-4o-mini**: Mô hình AI để hiểu và trả lời câu hỏi
- **React Context API**: Quản lý trạng thái mở/đóng chatbot
- **Framer Motion**: Hiệu ứng animation mượt mà -->

### 📊 SƠ ĐỒ HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHATBOT AI WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

    [Người dùng]
         │
         │ 1. Click nút chat
         ▼
    ┌─────────────┐
    │ ChatbotWidget│ ◄──── Hiển thị giao diện chat
    └──────┬──────┘
           │
           │ 2. Gửi tin nhắn
           ▼
    ┌──────────────────┐
    │ handleSendMessage│
    └──────┬───────────┘
           │
           │ 3. Gọi API
           ▼
    ┌─────────────────────────────────────────────┐
    │         openaiService.ts                    │
    │  ┌───────────────────────────────────────┐  │
    │  │ 1. Lấy danh sách sản phẩm từ backend │  │
    │  │    fetchChatbotProducts()             │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 2. Tạo prompt cho AI                  │  │
    │  │    buildSystemPrompt()                │  │
    │  │    - Thêm danh sách sản phẩm          │  │
    │  │    - Hướng dẫn AI cách trả lời        │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 3. Gửi request đến OpenAI API         │  │
    │  │    POST /v1/responses                 │  │
    │  │    {                                  │  │
    │  │      model: "gpt-4o-mini",            │  │
    │  │      input: "tin nhắn người dùng",    │  │
    │  │      instructions: "system prompt"    │  │
    │  │    }                                  │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 4. Nhận và xử lý response             │  │
    │  │    - Parse JSON từ AI                 │  │
    │  │    - Trích xuất message & products    │  │
    │  └───────────────┬───────────────────────┘  │
    └──────────────────┼───────────────────────────┘
                       │
                       │ 5. Trả về kết quả
                       ▼
    ┌──────────────────────────────────┐
    │  ChatbotResponse                 │
    │  {                               │
    │    message: "Gợi ý của AI",      │
    │    products: [                   │
    │      {                           │
    │        id, name, price,          │
    │        image, detail_url         │
    │      }                           │
    │    ]                             │
    │  }                               │
    └──────────────┬───────────────────┘
                   │
                   │ 6. Hiển thị
                   ▼
    ┌──────────────────────────────────┐
    │  Giao diện chat                  │
    │  - Tin nhắn AI                   │
    │  - Thẻ sản phẩm (tối đa 3)       │
    │  - Nút "View Product"            │
    └──────────────────────────────────┘
```

### 💡 GIẢI THÍCH CHI TIẾT

#### Bước 1: Người dùng mở chatbot
- Click vào nút chat ở góc phải màn hình
- `ChatbotContext` quản lý trạng thái `isOpen = true`
- Widget hiện lên với animation

#### Bước 2: Gửi tin nhắn
```typescript
// Ví dụ: "Tôi muốn kính râm cho mặt tròn"
handleSendMessage("Tôi muốn kính râm cho mặt tròn")
```
<!-- 
#### Bước 3: Xử lý tin nhắn
1. **Lấy sản phẩm**: Gọi API `/products` để lấy 100 sản phẩm
2. **Tạo prompt**: Kết hợp tin nhắn người dùng với danh sách sản phẩm
3. **Gửi đến OpenAI**: AI phân tích và chọn 3 sản phẩm phù hợp nhất
4. **Nhận kết quả**: AI trả về JSON với message và danh sách sản phẩm

#### Bước 4: Hiển thị kết quả
- Tin nhắn AI xuất hiện với hiệu ứng typing dots
- Hiển thị 3 thẻ sản phẩm với hình ảnh, tên, giá
- Người dùng click vào sản phẩm để xem chi tiết -->

<!-- ### 🔑 ĐIỂM QUAN TRỌNG

1. **Cache sản phẩm**: Danh sách sản phẩm được cache để không phải gọi API nhiều lần
2. **Giới hạn 3 sản phẩm**: AI chỉ gợi ý tối đa 3 sản phẩm để không làm người dùng choáng ngợp
3. **Follow-up questions**: AI luôn hỏi thêm để hiểu rõ nhu cầu khách hàng
4. **Error handling**: Nếu API lỗi, hiển thị thông báo thân thiện

--- -->

## 2. VIRTUAL TRY-ON - THỬ KÍNH ẢO
<!-- 
### 🎯 Mục đích
Cho phép khách hàng thử kính trực tiếp qua camera mà không cần đến cửa hàng.

### 🔧 Công nghệ sử dụng
- **MediaPipe FaceMesh**: Phát hiện khuôn mặt và các điểm đặc trưng (468 điểm)
- **HTML5 Canvas**: Vẽ kính lên video
- **WebRTC**: Truy cập camera của thiết bị -->

### 📊 SƠ ĐỒ HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────────┐
│                 VIRTUAL TRY-ON WORKFLOW                         │
└─────────────────────────────────────────────────────────────────┘

    [Người dùng]
         │
         │ 1. Click "Try On"
         ▼
    ┌─────────────────┐
    │ VirtualTryOn    │
    │ Component       │
    └────────┬────────┘
             │
             │ 2. Khởi tạo
             ▼
    ┌────────────────────────────────────────────┐
    │  initFaceMesh()                            │
    │  ┌──────────────────────────────────────┐  │
    │  │ A. Load thư viện MediaPipe           │  │
    │  │    - face_mesh.js                    │  │
    │  │    - camera_utils.js                 │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ B. Cấu hình FaceMesh                 │  │
    │  │    {                                 │  │
    │  │      maxNumFaces: 1,                 │  │
    │  │      refineLandmarks: true,          │  │
    │  │      minDetectionConfidence: 0.5     │  │
    │  │    }                                 │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ C. Khởi động Camera                  │  │
    │  │    - Yêu cầu quyền truy cập          │  │
    │  │    - Kích thước: 640x480             │  │
    │  └──────────────┬───────────────────────┘  │
    └─────────────────┼────────────────────────────┘
                      │
                      │ 3. Vòng lặp phát hiện
                      ▼
    ┌─────────────────────────────────────────────┐
    │  onFrame() - Chạy liên tục                  │
    │  ┌───────────────────────────────────────┐  │
    │  │ 1. Lấy frame từ video                 │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 2. Gửi đến FaceMesh                   │  │
    │  │    faceMesh.send({ image: video })    │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 3. Nhận kết quả (landmarks)           │  │
    │  │    - 468 điểm trên khuôn mặt          │  │
    │  │    - Tọa độ x, y, z của mỗi điểm      │  │
    │  └───────────────┬───────────────────────┘  │
    └──────────────────┼─────────────────────────┘
                       │
                       │ 4. Xử lý landmarks
                       ▼
    ┌─────────────────────────────────────────────┐
    │  onResults(results)                         │
    │  ┌───────────────────────────────────────┐  │
    │  │ A. Lấy các điểm quan trọng            │  │
    │  │    - Mắt trái: landmark[33]           │  │
    │  │    - Mắt phải: landmark[263]          │  │
    │  │    - Mũi: landmark[1]                 │  │
    │  │    - Tai trái: landmark[234]          │  │
    │  │    - Tai phải: landmark[454]          │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ B. Tính toán vị trí kính              │  │
    │  │    centerX = (leftEye.x + rightEye.x)/2│ │
    │  │    centerY = (leftEye.y + rightEye.y)/2│ │
    │  │    angle = atan2(dy, dx)              │  │
    │  │    width = eyeDistance × 1.8          │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ C. Làm mượt (smoothing)               │  │
    │  │    smooth.x = 0.85×old + 0.15×new     │  │
    │  │    smooth.y = 0.85×old + 0.15×new     │  │
    │  │    smooth.angle = 0.85×old + 0.15×new │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ D. Vẽ kính lên canvas                 │  │
    │  │    ctx.save()                         │  │
    │  │    ctx.translate(centerX, centerY)    │  │
    │  │    ctx.rotate(angle)                  │  │
    │  │    ctx.drawImage(glasses, ...)        │  │
    │  │    ctx.restore()                      │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
                       │
                       │ 5. Chụp ảnh (nếu muốn)
                       ▼
    ┌─────────────────────────────────────────────┐
    │  handleCapture()                            │
    │  - Tạo canvas tạm                           │
    │  - Vẽ video + kính                          │
    │  - Chuyển thành ảnh PNG                     │
    │  - Cho phép download                        │
    └─────────────────────────────────────────────┘
```

### 💡 GIẢI THÍCH CHI TIẾT

#### Bước 1: Khởi tạo
```typescript
// Load thư viện từ CDN
await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js")
await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js")
```

#### Bước 2: Phát hiện khuôn mặt
MediaPipe FaceMesh phát hiện **468 điểm** trên khuôn mặt:
- Điểm 33: Góc mắt trái
- Điểm 263: Góc mắt phải  
- Điểm 1: Đầu mũi
- Điểm 234, 454: Tai trái, phải

#### Bước 3: Tính toán vị trí kính
```typescript
// Tính khoảng cách giữa 2 mắt
const dx = rightEye.x - leftEye.x
const dy = rightEye.y - leftEye.y
const eyeDistance = Math.sqrt(dx*dx + dy*dy)

// Kích thước kính = khoảng cách mắt × 1.8
let width = eyeDistance * OVERLAY_EYE_SCALE // 1.8

// Điều chỉnh theo độ sâu (người xa/gần camera)
const depthScale = 1 + nose.z * OVERLAY_DEPTH_FACTOR // -0.5
width *= depthScale
```

#### Bước 4: Làm mượt chuyển động
Để kính không giật cục, sử dụng **exponential smoothing**:
```typescript
smooth.x = smooth.x * 0.85 + newX * 0.15
// 85% giá trị cũ + 15% giá trị mới
```

#### Bước 5: Vẽ kính
```typescript
ctx.save()
ctx.translate(centerX, centerY)  // Di chuyển đến vị trí
ctx.rotate(angle)                // Xoay theo góc nghiêng đầu
ctx.drawImage(glasses, -anchorX, -anchorY, width, height)
ctx.restore()
```

### 🔑 ĐIỂM QUAN TRỌNG

1. **468 điểm landmark**: MediaPipe phát hiện rất chi tiết
2. **Smoothing**: Làm mượt để kính không giật
3. **Depth adjustment**: Điều chỉnh kích thước khi người dùng di chuyển gần/xa
4. **Cross-origin images**: Sử dụng Blob URL để tránh lỗi canvas tainted
5. **Performance**: Chạy 30-60 FPS mượt mà

---

## 3. VIEW IN 3D - XEM MÔ HÌNH 3D

### 🎯 Mục đích
Cho phép khách hàng xem kính dưới dạng mô hình 3D, xoay 360 độ để xem mọi góc độ.

### 🔧 Công nghệ sử dụng
- **Three.js**: Thư viện render 3D trên web
- **GLTFLoader**: Load file mô hình 3D (.glb)
- **OrbitControls**: Điều khiển camera (xoay, zoom, pan)
- **RGBELoader**: Load môi trường HDR cho ánh sáng chân thực

### 📊 SƠ ĐỒ HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────────┐
│                    VIEW IN 3D WORKFLOW                          │
└─────────────────────────────────────────────────────────────────┘

    [Người dùng]
         │
         │ 1. Click "View in 3D"
         ▼
    ┌─────────────────┐
    │ ModelViewer3D   │
    │ Component       │
    └────────┬────────┘
             │
             │ 2. Khởi tạo Three.js
             ▼
    ┌────────────────────────────────────────────┐
    │  Setup Scene                               │
    │  ┌──────────────────────────────────────┐  │
    │  │ A. Tạo Renderer                      │  │
    │  │    - WebGLRenderer                   │  │
    │  │    - Antialias: true                 │  │
    │  │    - Tone mapping: ACESFilmic        │  │
    │  │    - Shadow: enabled                 │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ B. Tạo Scene                         │  │
    │  │    - Background: white               │  │
    │  │    - Environment map                 │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ C. Tạo Camera                        │  │
    │  │    - PerspectiveCamera               │  │
    │  │    - FOV: 35°                        │  │
    │  │    - Position: (0, 0, 2.8)           │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ D. Tạo Controls                      │  │
    │  │    - OrbitControls                   │  │
    │  │    - Damping: enabled                │  │
    │  │    - Pan, Rotate, Zoom: enabled      │  │
    │  └──────────────┬───────────────────────┘  │
    │                 │                           │
    │  ┌──────────────▼───────────────────────┐  │
    │  │ E. Thêm ánh sáng                     │  │
    │  │    - AmbientLight (0.15)             │  │
    │  │    - DirectionalLight Key (2.2)      │  │
    │  │    - DirectionalLight Fill (1.05)    │  │
    │  │    - DirectionalLight Rim (0.55)     │  │
    │  └──────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
             │
             │ 3. Load assets
             ▼
    ┌─────────────────────────────────────────────┐
    │  Load Environment & Model                   │
    │  ┌───────────────────────────────────────┐  │
    │  │ Step 1: Load HDR Environment          │  │
    │  │  ┌─────────────────────────────────┐  │  │
    │  │  │ RGBELoader.loadAsync()          │  │  │
    │  │  │ - File: studio_small_09_1k.hdr  │  │  │
    │  │  │ - Size: 1K resolution           │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  │                │                       │  │
    │  │  ┌─────────────▼───────────────────┐  │  │
    │  │  │ PMREMGenerator                  │  │  │
    │  │  │ - Chuyển HDR thành environment  │  │  │
    │  │  │ - Tạo cube map cho reflection   │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  │                │                       │  │
    │  │  ┌─────────────▼───────────────────┐  │  │
    │  │  │ scene.environment = envMap      │  │  │
    │  │  └─────────────────────────────────┘  │  │
    │  └───────────────────────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ Step 2: Load 3D Model                 │  │
    │  │  ┌─────────────────────────────────┐  │  │
    │  │  │ GLTFLoader.loadAsync()          │  │  │
    │  │  │ - File: product.glb             │  │  │
    │  │  │ - Format: GLTF 2.0              │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  │                │                       │  │
    │  │  ┌─────────────▼───────────────────┐  │  │
    │  │  │ Process Model                   │  │  │
    │  │  │ - Enable shadows                │  │  │
    │  │  │ - Set metalness/roughness       │  │  │
    │  │  │ - Set envMapIntensity           │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  │                │                       │  │
    │  │  ┌─────────────▼───────────────────┐  │  │
    │  │  │ Frame Model                     │  │  │
    │  │  │ - Tính bounding box             │  │  │
    │  │  │ - Đặt camera vị trí phù hợp     │  │  │
    │  │  │ - Tạo shadow plane              │  │  │
    │  │  └─────────────────────────────────┘  │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
             │
             │ 4. Animation loop
             ▼
    ┌─────────────────────────────────────────────┐
    │  animate() - Chạy liên tục                  │
    │  ┌───────────────────────────────────────┐  │
    │  │ 1. requestAnimationFrame(animate)     │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 2. Update controls                    │  │
    │  │    - Damping                          │  │
    │  │    - Auto-rotate (nếu bật)            │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 3. Render scene                       │  │
    │  │    renderer.render(scene, camera)     │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
             │
             │ 5. User interactions
             ▼
    ┌─────────────────────────────────────────────┐
    │  Tương tác người dùng                       │
    │  - Kéo chuột: Xoay model                    │
    │  - Scroll: Zoom in/out                      │
    │  - Click phải + kéo: Pan (di chuyển)        │
    │  - Nút "Explore": Bật auto-rotate           │
    │  - Nút "Reset View": Về vị trí ban đầu      │
    └─────────────────────────────────────────────┘
```

### 💡 GIẢI THÍCH CHI TIẾT

#### Bước 1: Khởi tạo Three.js Scene
```typescript
// Tạo renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,        // Làm mượt cạnh
  powerPreference: "high-performance"
})

// Tạo scene (không gian 3D)
const scene = new THREE.Scene()

// Tạo camera (góc nhìn)
const camera = new THREE.PerspectiveCamera(35, width/height, 0.01, 100)
camera.position.set(0, 0, 2.8)  // Đặt camera cách model 2.8 đơn vị
```

#### Bước 2: Thiết lập ánh sáng (3-Point Lighting)
```typescript
// 1. Key Light - Ánh sáng chính (mạnh nhất)
const key = new THREE.DirectionalLight(0xffffff, 2.2)
key.position.set(2.6, 4.4, 3.2)  // Phía trên, bên phải

// 2. Fill Light - Ánh sáng phụ (làm mềm bóng)
const fill = new THREE.DirectionalLight(0xffffff, 1.05)
fill.position.set(-4.6, 2.2, 1.6)  // Phía trái

// 3. Rim Light - Ánh sáng viền (tạo chiều sâu)
const rim = new THREE.DirectionalLight(0xffffff, 0.55)
rim.position.set(-1.0, 3.4, -4.8)  // Phía sau
```

#### Bước 3: Load HDR Environment
```typescript
// Load file HDR (High Dynamic Range)
const hdr = await rgbe.loadAsync("studio_small_09_1k.hdr")

// Chuyển thành environment map
const envMap = pmrem.fromEquirectangular(hdr).texture

// Áp dụng cho scene
scene.environment = envMap  // Ánh sáng môi trường
```

#### Bước 4: Load mô hình 3D
```typescript
// Load file .glb
const gltf = await loader.loadAsync(modelUrl)
const model = gltf.scene

// Duyệt qua tất cả mesh trong model
model.traverse((obj) => {
  if (obj.isMesh) {
    obj.castShadow = true      // Tạo bóng
    obj.receiveShadow = true   // Nhận bóng
    
    // Điều chỉnh material
    obj.material.metalness = 0.8
    obj.material.roughness = 0.2
    obj.material.envMapIntensity = 1.1
  }
})

scene.add(model)
```

#### Bước 5: Frame model (Đặt camera phù hợp)
```typescript
// Tính bounding box của model
const box = new THREE.Box3().setFromObject(model)
const size = new THREE.Vector3()
box.getSize(size)

// Tính khoảng cách camera cần đứng
const maxDim = Math.max(size.x, size.y, size.z)
const distance = maxDim * 1.25

// Đặt camera
camera.position.copy(center).addScaledVector(direction, distance)
```

#### Bước 6: Animation Loop
```typescript
function animate() {
  requestAnimationFrame(animate)  // Gọi lại hàm này mỗi frame
  
  controls.update()  // Cập nhật controls (damping, auto-rotate)
  renderer.render(scene, camera)  // Vẽ scene
}
```

### 🔑 ĐIỂM QUAN TRỌNG

1. **HDR Environment**: Tạo ánh sáng chân thực, phản chiếu đẹp
2. **3-Point Lighting**: Key + Fill + Rim = ánh sáng chuyên nghiệp
3. **Shadow Plane**: Mặt phẳng vô hình để nhận bóng
4. **Damping**: Làm mượt chuyển động camera
5. **Auto-rotate**: Tự động xoay model để khách hàng xem 360°
6. **Performance**: Chạy 60 FPS mượt mà

---

## 4. GHN INTEGRATION - TÍCH HỢP VẬN CHUYỂN

### 🎯 Mục đích
Tự động tạo đơn vận chuyển với Giao Hàng Nhanh (GHN) và theo dõi trạng thái giao hàng.

### 🔧 Công nghệ sử dụng
- **GHN API**: API của Giao Hàng Nhanh
- **Webhooks**: Nhận thông báo tự động từ GHN
- **React Query**: Quản lý API calls

### 📊 SƠ ĐỒ HOẠT ĐỘNG

```
┌─────────────────────────────────────────────────────────────────┐
│                  GHN INTEGRATION WORKFLOW                       │
└─────────────────────────────────────────────────────────────────┘

    [Nhân viên Operations]
         │
         │ 1. Click "Create GHN Shipment"
         ▼
    ┌─────────────────────────┐
    │ CreateGHNShipmentDialog │
    └────────┬────────────────┘
             │
             │ 2. Nhập thông tin
             ▼
    ┌─────────────────────────────────────────────┐
    │  Form Input                                 │
    │  - Weight (gram): 200                       │
    │  - Dimensions (cm): 20 × 15 × 10            │
    │  - Required Note: "CHOXEMHANGKHONGTHU"      │
    └────────┬────────────────────────────────────┘
             │
             │ 3. Submit form
             ▼
    ┌─────────────────────────────────────────────┐
    │  handleSubmit()                             │
    │  ┌───────────────────────────────────────┐  │
    │  │ Step 1: Tạo Outbound Record           │  │
    │  │  ┌─────────────────────────────────┐  │  │
    │  │  │ POST /operations/inventory/     │  │  │
    │  │  │      outbound                   │  │  │
    │  │  │ {                               │  │  │
    │  │  │   orderId: "xxx"                │  │  │
    │  │  │ }                               │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  │                │                       │  │
    │  │                │ Ghi nhận hàng xuất kho│  │
    │  │                │                       │  │
    │  │  ┌─────────────▼───────────────────┐  │  │
    │  │  │ Response:                       │  │  │
    │  │  │ - Trừ số lượng trong kho        │  │  │
    │  │  │ - Tạo transaction record        │  │  │
    │  │  └─────────────────────────────────┘  │  │
    │  └───────────────────────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ Step 2: Tạo GHN Order                 │  │
    │  │  ┌─────────────────────────────────┐  │  │
    │  │  │ POST /operations/orders/{id}/   │  │  │
    │  │  │      ghn                        │  │  │
    │  │  │ {                               │  │  │
    │  │  │   weight: 200,                  │  │  │
    │  │  │   length: 20,                   │  │  │
    │  │  │   width: 15,                    │  │  │
    │  │  │   height: 10,                   │  │  │
    │  │  │   requiredNote: "CHOXEM..."     │  │  │
    │  │  │ }                               │  │  │
    │  │  └─────────────┬───────────────────┘  │  │
    │  └────────────────┼───────────────────────┘  │
    └───────────────────┼─────────────────────────┘
                        │
                        │ Backend xử lý
                        ▼
    ┌─────────────────────────────────────────────┐
    │  Backend: GHNService.cs                     │
    │  ┌───────────────────────────────────────┐  │
    │  │ 1. Lấy thông tin order từ database   │  │
    │  │    - Customer info                    │  │
    │  │    - Shipping address                 │  │
    │  │    - Order items                      │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 2. Parse địa chỉ GHN                  │  │
    │  │    - Province code                    │  │
    │  │    - District code                    │  │
    │  │    - Ward code                        │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 3. Tính phí vận chuyển                │  │
    │  │    POST https://online-gateway.ghn.vn/│  │
    │  │         shiip/public-api/v2/          │  │
    │  │         shipping-order/fee            │  │
    │  │    Headers:                           │  │
    │  │    - Token: GHN_TOKEN                 │  │
    │  │    - ShopId: GHN_SHOP_ID              │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 4. Tạo đơn GHN                        │  │
    │  │    POST https://online-gateway.ghn.vn/│  │
    │  │         shiip/public-api/v2/          │  │
    │  │         shipping-order/create         │  │
    │  │    Body:                              │  │
    │  │    {                                  │  │
    │  │      to_name: "Nguyễn Văn A",         │  │
    │  │      to_phone: "0901234567",          │  │
    │  │      to_address: "123 Đường ABC",     │  │
    │  │      to_ward_code: "20308",           │  │
    │  │      to_district_id: 1542,            │  │
    │  │      weight: 200,                     │  │
    │  │      length: 20,                      │  │
    │  │      width: 15,                       │  │
    │  │      height: 10,                      │  │
    │  │      service_type_id: 2,              │  │
    │  │      payment_type_id: 1,              │  │
    │  │      required_note: "CHOXEM...",      │  │
    │  │      items: [...]                     │  │
    │  │    }                                  │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 5. Nhận response từ GHN               │  │
    │  │    {                                  │  │
    │  │      order_code: "ABCD1234",          │  │
    │  │      total_fee: 25000,                │  │
    │  │      expected_delivery_time: "..."    │  │
    │  │    }                                  │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 6. Lưu tracking code vào database     │  │
    │  │    - Update order.trackingCode        │  │
    │  │    - Update order.status = "Shipped"  │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
                        │
                        │ Trả về frontend
                        ▼
    ┌─────────────────────────────────────────────┐
    │  Success Response                           │
    │  - Tracking Code: "ABCD1234"                │
    │  - Print URL: "https://..."                 │
    └────────┬────────────────────────────────────┘
             │
             │ 7. Hiển thị kết quả
             ▼
    ┌─────────────────────────────────────────────┐
    │  Success Screen                             │
    │  ✓ Shipment Created Successfully            │
    │  📦 Tracking Code: ABCD1234                 │
    │  🖨️ [Print Shipping Label]                  │
    └─────────────────────────────────────────────┘


    ┌─────────────────────────────────────────────┐
    │         GHN WEBHOOK - AUTO UPDATE           │
    └─────────────────────────────────────────────┘

    [GHN Server]
         │
         │ Khi shipper cập nhật trạng thái
         ▼
    ┌─────────────────────────────────────────────┐
    │  GHN gửi webhook                            │
    │  POST /api/webhooks/ghn                     │
    │  {                                          │
    │    OrderCode: "ABCD1234",                   │
    │    Status: "picked",                        │
    │    Time: "2024-01-15T10:30:00"              │
    │  }                                          │
    └────────┬────────────────────────────────────┘
             │
             │ Backend nhận webhook
             ▼
    ┌─────────────────────────────────────────────┐
    │  GHNWebhookController.cs                    │
    │  ┌───────────────────────────────────────┐  │
    │  │ 1. Tìm order theo OrderCode           │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 2. Map GHN status → Order status      │  │
    │  │    - "picked" → "Shipped"             │  │
    │  │    - "delivered" → "Delivered"        │  │
    │  │    - "return" → "Cancelled"           │  │
    │  └───────────────┬───────────────────────┘  │
    │                  │                           │
    │  ┌───────────────▼───────────────────────┐  │
    │  │ 3. Cập nhật database                  │  │
    │  │    - Update order.status              │  │
    │  │    - Add status history               │  │
    │  └───────────────────────────────────────┘  │
    └─────────────────────────────────────────────┘
             │
             │ Tự động cập nhật
             ▼
    ┌─────────────────────────────────────────────┐
    │  Frontend tự động refresh                   │
    │  - React Query invalidate                   │
    │  - Hiển thị status mới                      │
    └─────────────────────────────────────────────┘
```

### 💡 GIẢI THÍCH CHI TIẾT

#### Bước 1: Tạo Outbound Record
```typescript
// Ghi nhận hàng xuất kho
POST /operations/inventory/outbound
{
  orderId: "order-123"
}

// Backend sẽ:
// 1. Trừ số lượng trong kho
// 2. Tạo transaction record
// 3. Cập nhật inventory
```

#### Bước 2: Tạo GHN Order
```typescript
// Gửi request đến backend
POST /operations/orders/{orderId}/ghn
{
  weight: 200,      // gram
  length: 20,       // cm
  width: 15,        // cm
  height: 10,       // cm
  requiredNote: "CHOXEMHANGKHONGTHU"
}
```

#### Bước 3: Backend gọi GHN API
```csharp
// Tính phí vận chuyển
var feeResponse = await _httpClient.PostAsync(
  "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee",
  new {
    to_district_id = districtId,
    to_ward_code = wardCode,
    weight = 200,
    service_type_id = 2
  }
);

// Tạo đơn GHN
var createResponse = await _httpClient.PostAsync(
  "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create",
  new {
    to_name = order.CustomerName,
    to_phone = order.CustomerPhone,
    to_address = order.ShippingAddress,
    to_ward_code = wardCode,
    to_district_id = districtId,
    weight = 200,
    length = 20,
    width = 15,
    height = 10,
    service_type_id = 2,
    payment_type_id = 1,  // 1 = Người bán trả phí
    required_note = "CHOXEMHANGKHONGTHU",
    items = order.Items.Select(i => new {
      name = i.ProductName,
      quantity = i.Quantity,
      price = i.Price
    })
  }
);
```

#### Bước 4: GHN Webhook
```csharp
[HttpPost("/api/webhooks/ghn")]
public async Task<IActionResult> HandleGHNWebhook([FromBody] GHNWebhookDto dto)
{
  // Tìm order
  var order = await _db.Orders
    .FirstOrDefaultAsync(o => o.TrackingCode == dto.OrderCode);
  
  // Map status
  var newStatus = dto.Status switch {
    "picked" => OrderStatus.Shipped,
    "delivering" => OrderStatus.Shipped,
    "delivered" => OrderStatus.Delivered,
    "return" => OrderStatus.Cancelled,
    _ => order.Status
  };
  
  // Cập nhật
  order.Status = newStatus;
  await _db.SaveChangesAsync();
  
  return Ok();
}
```

### 🔑 ĐIỂM QUAN TRỌNG

1. **2-Step Process**: Outbound record trước, GHN order sau
2. **Address Parsing**: Phải parse địa chỉ thành Province/District/Ward code
3. **Required Note**: Hướng dẫn cho shipper (cho xem hàng, không cho xem, v.v.)
4. **Webhooks**: Tự động cập nhật status khi shipper thay đổi
5. **Print Label**: In tem vận chuyển A5 để dán lên hộp
6. **Error Handling**: Xử lý lỗi khi GHN API fail

### 📝 GHN Required Notes

| Code | Ý nghĩa |
|------|---------|
| `CHOTHUHANG` | Cho thử hàng |
| `CHOXEMHANGKHONGTHU` | Cho xem hàng không cho thử |
| `KHONGCHOXEMHANG` | Không cho xem hàng |

---

## 🎓 TÓM TẮT CHO HỌC SINH CẤP 3

### Chatbot AI
**Giống như:** Nhân viên tư vấn ảo  
**Hoạt động:** Bạn hỏi → AI tìm trong database → Gợi ý 3 sản phẩm phù hợp  
**Công nghệ:** OpenAI GPT-4o-mini

### Virtual Try-On
**Giống như:** Gương thử kính ảo  
**Hoạt động:** Mở camera → Phát hiện mặt → Vẽ kính lên → Chụp ảnh  
**Công nghệ:** MediaPipe FaceMesh (468 điểm trên mặt)

### View in 3D
**Giống như:** Xoay sản phẩm trong tay  
**Hoạt động:** Load mô hình 3D → Xoay 360° → Zoom in/out  
**Công nghệ:** Three.js + WebGL

### GHN Integration
**Giống như:** Gọi shipper tự động  
**Hoạt động:** Tạo đơn → Gửi GHN → Nhận mã vận đơn → Theo dõi tự động  
**Công nghệ:** GHN API + Webhooks

---

## 📚 TÀI LIỆU THAM KHẢO

- **MediaPipe FaceMesh**: https://google.github.io/mediapipe/solutions/face_mesh
- **Three.js**: https://threejs.org/docs/
- **OpenAI API**: https://platform.openai.com/docs/
- **GHN API**: https://api.ghn.vn/home/docs/detail

---

**Tài liệu được tạo:** 2024  
**Phiên bản:** 1.0  
**Tác giả:** Development Team
