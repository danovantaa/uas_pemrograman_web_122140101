# RuangPulih: Aplikasi Konsultasi Psikolog Online

RuangPulih adalah platform konsultasi psikolog online yang dirancang untuk menyediakan ruang yang aman, nyaman, dan mudah diakses bagi individu yang membutuhkan dukungan kesehatan mental. Aplikasi ini menghubungkan klien dengan psikolog profesional terverifikasi untuk sesi konsultasi online, serta menyediakan fitur manajemen jadwal dan booking yang efisien.

## Overview Aplikasi

RuangPulih bertujuan untuk mengatasi hambatan akses ke layanan kesehatan mental dengan menawarkan konsultasi yang fleksibel dari mana saja dan kapan saja. Aplikasi ini berfokus pada privasi, keamanan data, dan profesionalisme. Pengguna dapat mendaftar sebagai klien untuk mencari psikolog dan membuat jadwal booking, atau sebagai psikolog untuk mengelola ketersediaan jadwal dan booking klien.

## Fitur Utama

**Fitur Umum:**
* **Registrasi dan Login:** Pengguna dapat mendaftar dan masuk sebagai `client` atau `psychologist`.
* **Keamanan:** Menggunakan `AuthTktAuthenticationPolicy` dan `ACLAuthorizationPolicy` untuk autentikasi dan otorisasi, serta `bcrypt` untuk hashing password. CORS diimplementasikan untuk mengizinkan permintaan dari origin tertentu (misalnya, `http://localhost:5173`).

**Fitur untuk Klien:**
* **Mencari Psikolog:** Klien dapat melihat daftar psikolog profesional yang tersedia, lengkap dengan informasi kontak, rating, dan jadwal yang masih kosong.
* **Melihat Detail Psikolog:** Klien dapat melihat profil detail psikolog, termasuk jadwal yang tersedia dan ulasan dari klien lain.
* **Booking Sesi:** Klien dapat membuat booking untuk jadwal psikolog yang tersedia.
* **Melihat Riwayat Booking:** Klien dapat melihat daftar semua booking mereka, termasuk status (pending, confirmed, rejected).
* **Membatalkan Booking:** Klien dapat membatalkan booking yang berstatus `pending`.
* **Memberikan Ulasan:** Klien dapat memberikan rating dan komentar untuk sesi yang telah dikonfirmasi.

**Fitur untuk Psikolog:**
* **Manajemen Jadwal:** Psikolog dapat menambah, melihat, memperbarui, dan menghapus jadwal ketersediaan mereka. Jadwal yang sudah `is_booked` tidak bisa dihapus.
* **Manajemen Booking:** Psikolog dapat melihat semua booking yang terkait dengan jadwal mereka. Mereka juga dapat mengkonfirmasi atau menolak booking yang berstatus `pending`.
* **Melihat Ulasan:** Psikolog dapat melihat semua ulasan yang diberikan oleh klien terkait sesi mereka.

## Endpoint API (Backend)

Berikut adalah daftar endpoint API utama yang disediakan oleh backend aplikasi:

| Method | Endpoint                             | Deskripsi                                                | Peran yang Memiliki Akses (Authenticated) |
| :----- | :----------------------------------- | :------------------------------------------------------- | :---------------------------------------- |
| `POST` | `/register`                          | Mendaftarkan pengguna baru (client atau psychologist)    | Public                                    |
| `POST` | `/login`                             | Melakukan autentikasi pengguna dan mengembalikan token sesi | Public                                    |
| `POST` | `/logout`                            | Mengakhiri sesi pengguna                                 | Authenticated (Client, Psychologist)      |
| `GET`  | `/schedules`                         | Mendapatkan daftar semua jadwal (psikolog melihat jadwalnya sendiri) | Authenticated (Client, Psychologist)      |
| `POST` | `/schedules`                         | Menambah jadwal baru                                     | Psychologist Only                         |
| `GET`  | `/schedules/{id}`                    | Mendapatkan detail jadwal tertentu                       | Authenticated (Client, Psychologist)      |
| `PUT`  | `/schedules/{id}`                    | Memperbarui detail jadwal                                | Psychologist (hanya jadwal sendiri)      |
| `DELETE` | `/schedules/{id}`                  | Menghapus jadwal (tidak bisa jika sudah terbooking)      | Psychologist (hanya jadwal sendiri)      |
| `GET`  | `/bookings`                          | Mendapatkan daftar booking (klien: booking mereka; psikolog: booking terkait jadwal mereka) | Authenticated (Client, Psychologist)      |
| `POST` | `/bookings`                          | Membuat booking baru                                     | Client Only                               |
| `GET`  | `/bookings/{id}`                     | Mendapatkan detail booking tertentu                      | Authenticated (Owner of booking or related psychologist) |
| `PUT`  | `/bookings/{id}`                     | Memperbarui status booking (confirm/reject)             | Psychologist (hanya booking terkait jadwal sendiri) |
| `DELETE` | `/bookings/{id}`                   | Menghapus booking                                        | Authenticated (Owner of booking or related psychologist) |
| `GET`  | `/psychologists/available`           | Mendapatkan daftar psikolog dengan jadwal yang tersedia dari hari ini dan seterusnya | Authenticated (Client)                    |
| `GET`  | `/psychologists/{id}`                | Mendapatkan detail profil psikolog, termasuk jadwal tersedia dan ulasan | Authenticated (Client)                    |
| `POST` | `/reviews`                           | Menambahkan ulasan untuk booking yang sudah dikonfirmasi | Client Only                               |
| `GET`  | `/reviews`                           | Mendapatkan daftar semua ulasan                          | Authenticated (Client, Psychologist)      |

## Folder Structure

### Backend (Pyramid Framework)
```
back-end - ruangpulih/
├── ruangpulih/
│   ├── alembic/                      # Konfigurasi Alembic untuk migrasi database
│   │   ├── versions/                 # Skrip migrasi database (mis. 20250524_88291d9da7f4.py)
│   │   └── env.py                    # Environment untuk Alembic
│   ├── models/                       # Definisi model SQLAlchemy (Database Schemas)
│   │   ├── init.py               # Inisialisasi model dan SQLAlchemy session
│   │   ├── booking.py                # Model untuk tabel bookings
│   │   ├── meta.py                   # Metadata SQLAlchemy (Base, Naming Convention)
│   │   ├── review.py                 # Model untuk tabel reviews
│   │   ├── schedule.py               # Model untuk tabel schedules
│   │   └── user.py                   # Model untuk tabel users
│   ├── scripts/                      # Skrip untuk inisialisasi atau tugas lainnya
│   │   └── initialize_db.py          # Skrip untuk inisialisasi database dengan dummy data
│   ├── static/                       # File statis (CSS, gambar)
│   │   └── theme.css                 # Contoh file CSS
│   ├── templates/                    # Template HTML (digunakan Pyramid untuk error pages)
│   ├── views/                        # Logika View/Controller untuk setiap resource API
│   │   ├── init.py
│   │   ├── auth.py                   # Views untuk autentikasi (register, login, logout)
│   │   ├── bookings.py               # Views untuk manajemen booking
│   │   ├── default.py                # View default (home)
│   │   ├── notfound.py               # View untuk halaman 404
│   │   ├── psychologist.py           # Views untuk psikolog (daftar, detail)
│   │   ├── reviews.py                # Views untuk ulasan
│   │   └── schedules.py              # Views untuk manajemen jadwal
│   ├── init.py                   # Konfigurasi aplikasi Pyramid (termasuk CORS, Auth)
│   ├── cors.py                       # Middleware CORS kustom
│   ├── development.ini               # Konfigurasi aplikasi untuk pengembangan
│   ├── production.ini                # Konfigurasi aplikasi untuk produksi
│   ├── pytest.ini                    # Konfigurasi Pytest
│   ├── pshell.py                     # Konfigurasi untuk Pyramid Shell
│   ├── routes.py                     # Definisi rute API
│   ├── setup.py                      # Konfigurasi setup Python package
│   └── tests.py                      # Unit tests untuk backend
└─── README.txt
```

### Frontend (React.js + Vite)
```
front-end/
├── public/
│   └── data/
│       └── ruangpulih-data.json      # Contoh data dummy (mungkin tidak terpakai sepenuhnya jika menggunakan API backend)
├── src/
│   ├── assets/                       # Aset seperti gambar, ikon (jika ada)
│   ├── components/                   # Komponen UI yang dapat digunakan kembali
│   │   ├── ui/                       # Komponen UI dari Shadcn/ui (Button, Input, Dialog, dll.)
│   │   ├── landing-page/             # Komponen spesifik untuk halaman landing
│   │   ├── AppLogoIcon.jsx
│   │   ├── BookingDetailDialog.jsx   # Dialog untuk menampilkan detail booking
│   │   ├── BookingTable.jsx          # Tabel untuk menampilkan daftar booking
│   │   ├── Footer.jsx                # Komponen Footer
│   │   ├── MainLayout.jsx            # Layout utama aplikasi
│   │   ├── Navbar.jsx                # Komponen Navbar
│   │   ├── NotFound.jsx              # Halaman Not Found (404)
│   │   ├── ReviewFormDialog.jsx      # Dialog untuk form ulasan
│   │   ├── ScheduleForm.jsx          # Form untuk menambah/mengedit jadwal
│   │   ├── ScheduleTable.jsx         # Tabel untuk menampilkan jadwal
│   │   └── TextLink.jsx
│   ├── hooks/                        # Custom React Hooks untuk logika bisnis dan fetching data
│   │   ├── useAuth.js                # Hook untuk autentikasi (login, register, logout, check session)
│   │   ├── useBookings.js            # Hook untuk mengelola data booking
│   │   ├── usePsychologists.js       # Hook untuk mengambil data psikolog
│   │   ├── useReviews.js             # Hook untuk mengelola ulasan
│   │   ├── useRuangPulihDataHooks.js # Hooks untuk data lokal (ruangpulih-data.json) - mungkin tidak terpakai jika backend API aktif
│   │   └── useSchedules.js           # Hook untuk mengelola jadwal
│   ├── layouts/                      # Layout untuk halaman tertentu
│   │   ├── AuthLayout.jsx            # Layout untuk halaman autentikasi
│   │   ├── AuthSimpleLayout.jsx
│   │   ├── ClientDashboardLayout.jsx # Layout untuk dashboard klien
│   │   └── DashboardLayout.jsx       # Layout untuk dashboard psikolog
│   ├── lib/
│   │   └── utils.js                  # Utility functions (misalnya cn untuk Tailwind CSS)
│   ├── pages/                        # Halaman utama aplikasi
│   │   ├── client/                   # Halaman khusus klien
│   │   │   ├── dashboard/            # Dashboard klien
│   │   │   ├── my-bookings/          # Riwayat booking klien
│   │   │   ├── my-reviews/           # Ulasan klien
│   │   │   └── psikolog/             # Daftar dan detail psikolog untuk klien
│   │   ├── dashboard/                # Halaman khusus psikolog (admin)
│   │   │   ├── index.jsx             # Dashboard psikolog
│   │   │   ├── manage-bookings/      # Manajemen booking oleh psikolog
│   │   │   ├── manage-reviews/       # Manajemen ulasan (psikolog melihat ulasan untuk dirinya)
│   │   │   └── manage-schedules/     # Manajemen jadwal oleh psikolog
│   │   ├── contact/                  # Halaman kontak
│   │   ├── login/                    # Halaman login
│   │   ├── register/                 # Halaman registrasi
│   │   └── tentang/                  # Halaman "Tentang Kami"
│   ├── App.jsx                       # Komponen utama aplikasi (Landing Page)
│   ├── index.css                     # Main CSS (Tailwind CSS imports)
│   └── main.jsx                      # Entry point aplikasi React (Routing)
├── .eslint.config.js                 # Konfigurasi ESLint
├── index.html                        # File HTML utama
├── jsconfig.json                     # Konfigurasi JavaScript untuk VS Code
├── package.json                      # Dependensi dan skrip proyek Frontend
├── vite.config.js                    # Konfigurasi Vite
└── scan_frontend_src.py
```

## Tabel Backend

Aplikasi backend menggunakan PostgreSQL sebagai database dengan migrasi yang dielola oleh Alembic. Berikut adalah skema tabel utama:

1.  **`users`**
    * `id` (String, Primary Key): UUID unik untuk setiap pengguna.
    * `username` (String, Unique, Not Null): Nama pengguna unik.
    * `email` (String, Unique, Not Null): Alamat email unik pengguna.
    * `password` (String, Not Null): Hash password pengguna.
    * `role` (Enum: 'client', 'psychologist', Not Null): Peran pengguna.

2.  **`schedules`**
    * `id` (String, Primary Key): UUID unik untuk setiap jadwal.
    * `psychologist_id` (String, Foreign Key to `users.id`): ID psikolog yang memiliki jadwal ini.
    * `date` (Date, Not Null): Tanggal jadwal.
    * `time_slot` (Time, Not Null): Slot waktu jadwal.
    * `is_booked` (Boolean, Default: False): Menunjukkan apakah jadwal sudah terbooking.

3.  **`bookings`**
    * `id` (String, Primary Key): UUID unik untuk setiap booking.
    * `client_id` (String, Foreign Key to `users.id`): ID klien yang membuat booking.
    * `schedule_id` (String, Foreign Key to `schedules.id`): ID jadwal yang dibooking.
    * `status` (Enum: 'pending', 'confirmed', 'rejected', Default: 'pending'): Status booking.
    * `created_at` (DateTime, Default: `datetime.utcnow`): Waktu booking dibuat.

4.  **`reviews`**
    * `id` (String, Primary Key): UUID unik untuk setiap ulasan.
    * `booking_id` (String, Foreign Key to `bookings.id`, Not Null): ID booking yang diulas.
    * `rating` (Integer, Not Null): Rating dari 1 sampai 5.
    * `comment` (Text): Komentar ulasan.

## Cara Menjalankan Aplikasi

Berikut adalah langkah-langkah untuk menjalankan aplikasi RuangPulih:

### Persyaratan

* Python 3.8+
* Node.js (LTS) & npm (atau yarn)
* PostgreSQL Database

### Setup Backend

1.  **Clone Repository:**
    ```bash
    git clone <URL_REPOSITORY>
    cd uas_pemrograman_web_122140101/back-end - ruangpulih/ruangpulih
    ```
2.  **Buat Virtual Environment:**
    ```bash
    python3 -m venv env
    source env/bin/activate
    ```
3.  **Install Dependensi:**
    ```bash
    env/bin/pip install -e ".[testing]"
    ```
4.  **Konfigurasi Database:**
    Buka `development.ini` dan sesuaikan `sqlalchemy.url` dengan kredensial database PostgreSQL Anda.
    Contoh:
    ```ini
    sqlalchemy.url = postgresql://user_db:password_db@localhost:5432/nama_database_anda
    ```
5.  **Migrasi Database dengan Alembic:**
    ```bash
    env/bin/alembic -c development.ini revision --autogenerate -m "Initial schema setup with SQLAlchemy Enum for User role"
    env/bin/alembic -c development.ini upgrade head
    ```
    *Note: Jika ada migrasi tambahan, jalankan kembali langkah kedua perintah ini setelahnya.*
6.  **Isi Dummy Data (Opsional):**
    ```bash
    env/bin/initialize_ruangpulih_db development.ini
    ```
7.  **Jalankan Backend Server:**
    ```bash
    env/bin/pserve development.ini
    ```
    Backend akan berjalan di `http://localhost:6543`.

### Setup Frontend

1.  **Pindah ke Direktori Frontend:**
    ```bash
    cd ../../front-end
    ```
2.  **Install Dependensi:**
    ```bash
    npm install
    # atau
    yarn
    ```
3.  **Jalankan Frontend Development Server:**
    ```bash
    npm run dev
    # atau
    yarn dev
    ```
    Frontend akan berjalan di `http://localhost:5173` (atau port lain yang tersedia).

## Copyright

Aplikasi ini dikembangkan sebagai bagian dari Ujian Akhir Semester (UAS) mata kuliah Pemrograman Web.

**Penulis:**
Zefanya Danovanta
NIM: 122140101
