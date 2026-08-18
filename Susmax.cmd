@echo off
rem Klik dua kali berkas ini: server lokal jalan, browser terbuka sendiri.
rem Tutup jendela ini kalau sudah selesai.
cd /d "%~dp0"
start "" http://127.0.0.1:7654
node scripts\app.js
pause
