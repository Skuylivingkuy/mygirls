# 🥺 Love Confirmation Screen

Project React kecil yang isinya cuma satu fitur: layar "Kamu sayang aku gak?" dengan tombol
TIDAK yang kabur tiap didekatin, tombol IYA yang meledakkan confetti, dan kartu undangan
jalan-jalan yang bisa langsung dikirim ke WhatsApp.

## Cara Menjalankan

Pastikan sudah terinstall **Node.js versi 18 ke atas**.

```bash
# 1. Masuk ke folder project
cd love-confirmation-screen

# 2. Install semua dependency
npm install

# 3. Jalankan development server
npm run dev
```

Buka link yang muncul di terminal (biasanya `http://localhost:5173`) di browser laptop,
atau dari HP yang nyambung ke WiFi yang sama lewat alamat `http://<IP-laptop-kamu>:5173`
(IP-nya muncul di terminal sebagai "Network:").

## Cara Custom

Semua yang perlu kamu ganti ada di objek `CONFIG` di bagian paling atas
**`src/components/LoveConfirmationScreen.jsx`**:

- `question` / `subtitle` — teks pertanyaan utama
- `phoneNumber` — nomor WhatsApp tujuan, format lokal (`08xxxxxxxxxx`), otomatis dikonversi
  ke format internasional pas bikin link WA
- `dateInvite` — `date`, `time`, `activity` yang muncul di kartu undangan
- `taunts` — daftar teks jahil yang muncul tiap tombol TIDAK gagal diklik

Pesan WhatsApp yang terkirim juga otomatis menyesuaikan `date`, `time`, dan `activity`
yang kamu isi, jadi cukup edit sekali di `CONFIG`.

## Build untuk Deploy (opsional)

```bash
npm run build
```

Hasilnya ada di folder `dist/` — tinggal upload, atau hubungkan repo-nya ke Vercel/Netlify.

## Struktur Project

```
love-confirmation-screen/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx                          # tinggal render LoveConfirmationScreen
    └── components/
        └── LoveConfirmationScreen.jsx    # ⭐ semua logic & tampilan ada di sini
```
# mygirls
