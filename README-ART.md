# Pirate Fruit Adventure — pembaruan artwork

Buka `Pirate Fruite Adventure V3_1.html` langsung di browser untuk bermain.
Semua gambar dan kode renderer tertanam di HTML; tidak memerlukan internet,
server, atau instalasi paket.

Buka `Art Preview.html` untuk melihat karakter, memilih salah satu dari 29
pulau, dan membandingkan musuh normal, elite, serta boss. Tombol Idle/Jalan
memperlihatkan animasi karakter.

## Isi perubahan

- Karakter bajak laut orisinal dibuat melalui skill sprite-gen, provider GPT.
- Atlas transparan 192 × 192 per frame: idle dan berjalan.
- 29 background SVG dengan tema, landmark, palet, dan detail tanah masing-masing.
- 87 sprite SVG musuh: normal, elite, dan boss untuk setiap pulau. LavaEnemy
  juga memakai renderer sprite, dengan efek lava yang sudah ada.
- Sprite tetap tegak saat membidik. Arah horizontal mengikuti bidikan.
  Area bayangan menunjukkan posisi karakter; hitbox, damage, dan kecepatan
  tetap menggunakan data gameplay lama.
- Karakter mulai di tengah viewport agar terlihat jelas di luar HUD.
- Transformasi dragon/Zoan, skill, portal, inventory, dan sistem pertarungan
  tetap menggunakan implementasi game asli.
- Background dirasterisasi sekali per pulau/ukuran layar dan cache dibatasi
  dua permukaan untuk menghindari rendering SVG berulang setiap frame.

Bangunan, air, pohon, dan jalur pada background adalah dekorasi. Perubahan ini
tidak menambahkan collision map atau sistem navigasi baru.

## File sumber

- `backups/Pirate Fruite Adventure V3_1.original.html`: salinan asli sebelum edit.
- `assets/generated/hero/pirate-base.png`: gambar dasar karakter transparan.
- `assets/generated/sprites/captain/sprite-sheet-alpha.png`: atlas runtime.
- `assets/generated/sprites/captain/manifest.json`: koordinat frame dari pipeline.
- `assets/generated/sprites/captain/exports/`: GIF idle dan berjalan.
- `assets/generated/sprites/captain/qa-notes.md`: catatan kualitas animasi.
- `assets/illustrated/`: 29 background dan 87 musuh dalam SVG yang dapat diedit.
- `assets/illustrated/gallery.html`: contact sheet seluruh pulau dan musuh.
- `qa/`: hasil pemeriksaan integrasi dan screenshot.

## Membangun ulang artwork dan HTML

Jalankan dari folder project dengan Node.js:

```powershell
node tools/build-art.mjs
node tools/build-game.mjs
node tools/build-preview.mjs
node tools/verify-game.mjs
```

Source gameplay dan UI ada di `src/`. `build-game.mjs` menggabungkan source,
aset vektor, dan atlas menjadi satu HTML offline. `integrate-art.mjs` kini
meneruskan ke builder yang sama agar perubahan kontrol tidak tertimpa.

Pembuatan ulang aset GPT memakai venv milik skill sprite-gen dan memerlukan
akses generasi gambar. Build artwork vektor dan integrasi HTML tidak memakai
layanan jaringan.

## Verifikasi

`tools/verify-game.mjs` menjalankan kode game asli dengan DOM/Canvas mock untuk
memeriksa semua pulau, 116 kombinasi renderer musuh termasuk lava, tiga ukuran
dunia, dua perpindahan pulau, serta normal/dragon/Zoan. Pemeriksaan ini memastikan
koordinat atlas valid dan stat dasar pemain tetap sama. Ini bukan pengganti
playtest seluruh skill atau kampanye.

Halaman preview juga memuat semua 117 aset runtime dengan decoder gambar
browser dan menampilkan status jika ada gambar yang gagal dimuat.

## Kontrol dan menu baru

- Joystick dengan pointer capture mendukung gerak sambil menyerang.
- Basic Attack: tahan tombol atau Space, cooldown 0,45 detik.
- Satu Ultimate per buah: tombol Ultimate / Q / klik kanan, cooldown 10–26 detik.
- WASD / panah untuk gerak; E ambil/portal; I tas; B toko; Esc menu.
- Menu, tas, toko dan katalog menjeda permainan serta cooldown.
- Healthbar berada di atas karakter; panel kiri dapat diringkas.
- 73 buah memakai SVG sesuai tema dan label nama; katalog dapat dicari.
- Backup sebelum perubahan kontrol: `backups/Pirate Fruit Art Edition.html`.

Pengujian VM mencakup cooldown, ganti buah tanpa reset cooldown, jeda, pelepasan
pointer joystick/attack secara independen, serta aktivasi seluruh 73 ultimate.
Pengujian sentuhan pada perangkat fisik belum dilakukan. Pratinjau browser
untuk revisi ini diblokir kebijakan URL file lokal.
