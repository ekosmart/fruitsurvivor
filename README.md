# Pirate Fruit Adventure — PWA

Game offline dengan 29 pulau, sprite kapten, joystick sentuh, Basic Attack, dan satu Ultimate per buah.

## Build dan tes

Memerlukan Node.js 22 atau lebih baru. Tidak ada dependency runtime atau API key.

```sh
npm run build
npm test
npm run preview
```

Preview tersedia di `http://localhost:4173`. Buka melalui HTTP localhost atau HTTPS untuk mengaktifkan PWA; membuka HTML dengan `file://` hanya menjalankan game biasa.

## Deploy ke Vercel

1. Upload project ke repository Git lalu import repository di Vercel.
2. Pilih root folder project ini dan Framework Preset **Other**.
3. Build Command: `npm run build`; Output Directory: `dist`.
4. Deploy. Pengaturan sudah disediakan di `vercel.json`; tidak ada environment variable yang diperlukan.

Alternatif dengan CLI Vercel yang sudah terpasang: jalankan `vercel` dari root project, cek preview, lalu `vercel --prod` untuk produksi. Project ini belum dideploy oleh asisten.

Hanya isi `dist/` yang disajikan ke publik. Backup, source, dan hasil QA tidak masuk output deploy. Panduan konfigurasi: https://vercel.com/docs/project-configuration/vercel-json

## Instal dan offline

- Buka URL HTTPS hasil deploy sampai menu menampilkan **Siap dimainkan offline**.
- Chrome/Edge/Android: gunakan tombol **Pasang game** jika ditawarkan, atau menu instal browser.
- iPhone/iPad: Safari → Bagikan → Tambahkan ke Layar Utama.
- Setelah cache siap, game dapat dibuka tanpa internet. Jika data situs dihapus atau dikeluarkan oleh OS, buka online lagi untuk mengisi cache.
- Versi baru diunduh saat online; tutup semua jendela/tab game lalu buka kembali untuk mengaktifkannya. Tidak ada reload otomatis di tengah permainan.
- Cache offline menyimpan aplikasi dan aset, **bukan progres permainan**. Progres masih mengikuti perilaku game sebelumnya dan kembali awal saat halaman dimuat ulang.

Service worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

## Source

- `src/`: gameplay, UI, dan aset inline.
- `pwa/`: manifest, registrasi, template service worker, ikon.
- `tools/build-pwa.mjs`: build HTML offline, ikon PNG, dan cache dengan versi hash otomatis.
- `tools/make-icons.mjs`: ikon buah/kompas prosedural, tanpa dependency.
- `dist/index.html`: entry point Vercel hasil build.

Sesudah mengubah source, jalankan ulang build. Ikon maskable memiliki margin aman. Orientasi layar tidak dikunci sehingga game tetap mendukung portrait dan landscape.

## Verifikasi setelah deploy

Tes otomatis memeriksa gameplay dan simulasi service worker. Untuk verifikasi browser nyata: periksa Manifest/Service Workers di DevTools, buka game online sekali, aktifkan Offline di Network lalu reload, dan uji instal di perangkat Android/iOS. Uji update dengan deploy kedua lalu tutup semua jendela game dan buka kembali.

## Ultimate dari file referensi pengguna

Implementasi dasar 73 buah berasal dari `Pirate Fruite Adventure (2) (1) (1).html`. Delapan buah kini menggunakan rework yang dijelaskan di bawah; 65 lainnya tetap memakai implementasi referensi:
Petir memakai Ultimate V **Judgment Bolt**; buah lain memakai implementasi serangan khusus dalam `fruitSkill()` beserta controller pendukungnya. Buah boss memakai profil serangan boss dari referensi. File tersebut hanya menyediakan Ultimate V terpisah untuk Petir, sehingga skill utama buah lain dipetakan ke tombol Ultimate tunggal.

Cooldown dan parameter damage/speed untuk buah yang tidak dirework mengikuti referensi. Contoh: Rubber memakai Kong Organ, Mecha memakai 100 misil Sky Barrage Protocol, Seraph memakai Elysium Field, dan Zenith memakai Astral Maul. Nama pada katalog disesuaikan dengan serangan tersebut.

`src/reference-ultimates.js` dan `src/reference-fruit-data.js` menyimpan hasil impor; salinan referensi ada di `references/ultimate-source.html` dan tidak dipublikasikan. Adaptasi integrasi: target sentuh dibekukan saat cast, timer mengikuti jeda game, buff transformasi tidak menumpuk, shield menyerap damage, serta buah boss menyerang musuh alih-alih pemakainya. Perpindahan pulau membatalkan serangan tertunda dan membersihkan buff sementara.

Hasil tes per buah tersedia di `qa/reference-ultimates.json`. Pengujian otomatis menjalankan proyektil/controller selama 8,8 detik untuk masing-masing buah, berikut pemeriksaan cooldown, aim tertunda, transformasi, healing, shield, dan transisi pulau. Playtest visual di browser/perangkat nyata masih diperlukan.

## Delapan Ultimate rework

| Buah | Ultimate | Cooldown | Mekanik |
| --- | --- | --- | --- |
| Quetzalcoatl | Feathered Serpent Dominion | 24 dtk | Ular bersayap, pusaran penarik, racun berkala, terjangan akhir |
| Phoenix | Rebirth Dive | 14 dtk | Transformasi burung, perpindahan ke target, ledakan, area pemulihan |
| Sabertooth | Predator Execution | 11 dtk | Terjangan ke musuh, empat cakar, gigitan, bleed |
| Triceratops | Ironhorn Stampede | 14 dtk | Ancang-ancang, serudukan nyata, pengurangan damage 65%, dorongan, hentakan |
| Dragon | Dragon’s Breath | 12 dtk | Kepala naga, api kerucut kontinu, tanah terbakar |
| Azure Dragon | Heavenly Dragon Descent | 24 dtk | Naga badai, pusaran, hantaman petir dan stun |
| Kirin | Celestial Thunder Run | 18 dtk | Dash nyata, jejak petir, ledakan akhir, heal 10% HP |
| Origin | Genesis Reset | 22 dtk | Cleanse pemain, heal 35% HP, hapus proyektil masuk, gelombang dorongan |

Source: `src/reworked-ultimates.js`. Visual menggunakan gambar vektor prosedural pada Canvas, dengan fase animasi yang mengikuti waktu permainan. Pemain tetap melihat HP di atas avatar selama transformasi. Serangan yang mengendalikan gerak menahan joystick/basic attack sementara; kontrol dilepas setelah fase selesai, saat mati, atau berpindah pulau. Cooldown tidak direset ketika berganti buah. Origin mempertahankan debuff musuh dan proyektil milik pemain.

`qa/reworked-ultimates.json` mencatat pengujian mekanik delapan buah, batas dunia, pause/resume, dan pembersihan efek saat transisi. Cooldown baru adalah nilai awal balancing dan belum melalui playtest perangkat nyata. Backup sebelum perubahan ada di `backups/Before Eight Ultimate Reworks.html`.
