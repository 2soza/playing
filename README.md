# Roblox status (1 akun)

Hanya untuk akun milik sendiri. Selfbot melanggar ToS Discord, risiko ban ditanggung sendiri.

## Pakai
1. `npm install`
2. Isi token lewat environment variable `TOKEN` (lokal: salin `.env.example` jadi `.env`; hosting: menu Variables).
3. `npm start`

## config.json
- `applicationId`: ID application Discord yang dipakai untuk status ini
- `name`: nama yang tampil (`Roblox`)
- `largeImageUrl`: gambar besar (link langsung)
- `startYearsAgo`: waktu elapsed mulai sekian tahun lalu. `0` = mulai sekarang. Hapus baris ini kalau tidak mau ada waktu.
- `refreshMinutes`: status dipasang ulang tiap sekian menit
- Opsional: `details`, `state`, `largeText`

Jangan pernah commit `.env` atau menulis token di file.
