# Backend Jawara - Sistem Manajemen RT/RW

Backend Express.js dengan ES Modules untuk sistem manajemen RT/RW dengan fitur marketplace terintegrasi AI untuk validasi kebersihan produk.

## 🚀 Fitur

- **Authentication & Authorization** - JWT-based auth dengan role-based access control
- **User Management** - Sistem user dengan berbagai role (adminSistem, ketuaRT, ketuaRW, bendahara, sekretaris, warga)
- **Data Keluarga** - Manajemen data keluarga dengan kepala keluarga
- **Data Warga** - Manajemen data warga dengan NIK sebagai primary key
- **Data Rumah** - Manajemen rumah dengan status kepemilikan
- **MarketPlace** - Upload produk dengan validasi AI otomatis untuk kebersihan gambar
- **Swagger Documentation** - API documentation lengkap di `/api-docs`

## 📋 Prerequisites

- Node.js (v16 atau lebih tinggi)
- Supabase Account (untuk database & storage)
- NPM atau Yarn

## 🛠️ Installation

```bash
# Clone repository
git clone <repository-url>
cd backend_jawara

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

## ⚙️ Environment Variables

Buat file `.env` dengan konfigurasi berikut:

```env
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## 🗄️ Database Setup

### 1. Setup Supabase Tables

Buat tabel-tabel berikut di Supabase:

**Table: `user`**
```sql
CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  nama TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  nomor_telefon TEXT,
  role TEXT DEFAULT 'warga',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `rumah`**
```sql
CREATE TABLE rumah (
  id SERIAL PRIMARY KEY,
  statusKepemilikan TEXT NOT NULL,
  alamat TEXT NOT NULL,
  jumlahPenghuni INTEGER NOT NULL,
  keluargaId INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `keluarga`**
```sql
CREATE TABLE keluarga (
  id SERIAL PRIMARY KEY,
  namaKeluarga TEXT NOT NULL,
  jumlahAnggota INTEGER NOT NULL,
  rumahId INTEGER REFERENCES rumah(id),
  kepala_Keluarga_Id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `warga`**
```sql
CREATE TABLE warga (
  nik TEXT PRIMARY KEY,
  namaWarga TEXT NOT NULL,
  jenisKelamin TEXT NOT NULL,
  statusDomisili TEXT NOT NULL,
  statusHidup TEXT NOT NULL,
  keluargaId INTEGER REFERENCES keluarga(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Table: `marketPlace`**
```sql
CREATE TABLE marketPlace (
  id SERIAL PRIMARY KEY,
  namaProduk TEXT NOT NULL,
  harga DECIMAL NOT NULL,
  deskripsi TEXT NOT NULL,
  gambar TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Setup Supabase Storage

1. Buka Supabase Dashboard → Storage
2. Buat bucket baru bernama `marketplace`
3. Set bucket sebagai **Public** atau configure RLS policies:

```sql
-- Policy untuk INSERT
CREATE POLICY "Allow authenticated upload to marketplace"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'marketplace');

-- Policy untuk SELECT
CREATE POLICY "Allow public to view marketplace"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'marketplace');

-- Policy untuk DELETE
CREATE POLICY "Allow authenticated delete from marketplace"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'marketplace');
```

## 🚀 Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server akan berjalan di: **http://localhost:3000**

## 📚 API Documentation

API documentation tersedia di: **http://localhost:3000/api-docs**

## 🔐 Authentication Flow

### 1. Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "nomor_telefon": "081234567890",
  "role": "warga"
}
```

**Roles:** `adminSistem`, `ketuaRT`, `ketuaRW`, `bendahara`, `sekretaris`, `warga`

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response akan berisi JWT token yang harus disimpan.

### 3. Authenticated Requests
Gunakan token di header:
```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Data Flow

### Hierarchy Data
```
Rumah
  └─ Keluarga
       ├─ Kepala Keluarga (FK ke Warga.nik)
       └─ Warga (multiple)
```

### Flow Input Data

**Urutan yang disarankan:**

1. **Register User** dengan role yang sesuai
2. **Buat Rumah** (oleh adminSistem/ketuaRT/ketuaRW)
3. **Buat Warga** dengan NIK unik
4. **Buat Keluarga** dengan referensi:
   - `rumahId` → dari Rumah
   - `kepala_Keluarga_Id` → dari Warga.nik
5. **Update Warga** untuk set `keluargaId`

## 🏪 MarketPlace Flow dengan AI Validation

### Upload Produk
```http
POST /api/marketplace
Authorization: Bearer <token>
Content-Type: multipart/form-data

gambar: <file>
namaProduk: "Sepatu Nike"
harga: 500000
deskripsi: "Sepatu olahraga kondisi baik"
```

### Validation Flow:
1. **User upload gambar + data produk**
2. **Backend mengirim gambar ke AI API** (`http://virtualtech.icu:3000/predict`)
3. **AI melakukan analisis kebersihan**
   - Jika `predicted_label === "bersih"` → Lanjut
   - Jika `predicted_label === "kotor"` → Ditolak
4. **Upload gambar ke Supabase Storage** (bucket: marketplace)
5. **Simpan data produk ke database** dengan URL gambar

### Response Success (201)
```json
{
  "success": true,
  "message": "Marketplace item created successfully",
  "data": {
    "id": 1,
    "namaProduk": "Sepatu Nike",
    "harga": 500000,
    "deskripsi": "Sepatu olahraga kondisi baik",
    "gambar": "https://...supabase.co/storage/v1/object/public/marketplace/..."
  },
  "validationResult": {
    "predicted_label": "bersih",
    "confidence": 0.95
  }
}
```

### Response Rejected (400)
```json
{
  "success": false,
  "message": "Image rejected: Product appears to be dirty or unclean",
  "validationResult": {
    "predicted_label": "kotor"
  }
}
```

## 🔒 Role-Based Access Control

### Public Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`

### Authenticated (All Roles)
- `GET /api/auth/profile`
- `GET /api/keluarga`
- `GET /api/keluarga/:id`
- `GET /api/warga`
- `GET /api/warga/:nik`
- `GET /api/rumah`
- `GET /api/rumah/:id`
- `GET /api/marketplace`
- `GET /api/marketplace/:id`

### Admin Only (adminSistem, ketuaRT, ketuaRW)
- `POST /api/keluarga`
- `PUT /api/keluarga/:id`
- `DELETE /api/keluarga/:id`
- `POST /api/warga`
- `PUT /api/warga/:nik`
- `DELETE /api/warga/:nik`
- `POST /api/rumah`
- `PUT /api/rumah/:id`
- `DELETE /api/rumah/:id`

### Marketplace (All Authenticated)
- `POST /api/marketplace` (upload produk)
- `PUT /api/marketplace/:id`
- `DELETE /api/marketplace/:id`

## 📝 API Endpoints Summary

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile user (protected)

### Keluarga
- `GET /api/keluarga` - Get semua keluarga
- `GET /api/keluarga/:id` - Get keluarga by ID
- `POST /api/keluarga` - Create keluarga (admin only)
- `PUT /api/keluarga/:id` - Update keluarga (admin only)
- `DELETE /api/keluarga/:id` - Delete keluarga (admin only)

### Warga
- `GET /api/warga` - Get semua warga
- `GET /api/warga/:nik` - Get warga by NIK
- `POST /api/warga` - Create warga (admin only)
- `PUT /api/warga/:nik` - Update warga (admin only)
- `DELETE /api/warga/:nik` - Delete warga (admin only)

### Rumah
- `GET /api/rumah` - Get semua rumah
- `GET /api/rumah/:id` - Get rumah by ID
- `POST /api/rumah` - Create rumah (admin only)
- `PUT /api/rumah/:id` - Update rumah (admin only)
- `DELETE /api/rumah/:id` - Delete rumah (admin only)

### MarketPlace
- `GET /api/marketplace` - Get semua produk
- `GET /api/marketplace/:id` - Get produk by ID
- `POST /api/marketplace` - Upload produk dengan validasi AI
- `PUT /api/marketplace/:id` - Update produk
- `DELETE /api/marketplace/:id` - Delete produk

## 🧪 Testing dengan Postman

1. **Import collection** dari Swagger: `http://localhost:3000/api-docs`
2. **Register** user baru
3. **Login** dan simpan token
4. **Set Authorization** → Bearer Token
5. **Test endpoints** sesuai role

## 🛡️ Security Features

- ✅ Password hashing dengan bcryptjs
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Input validation
- ✅ File upload validation (size & mime type)
- ✅ AI-based image validation
- ✅ Supabase Row Level Security (RLS)

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** JWT
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **HTTP Client:** Axios
- **Documentation:** Swagger (OpenAPI 3.0)
- **AI Integration:** External API for image validation

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

ISC

## 👥 Authors

Backend Jawara Team

## 📞 Support

Untuk pertanyaan atau bantuan, silakan buka issue di repository ini.
