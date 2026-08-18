@echo off
rem Klik dua kali berkas ini: server lokal jalan, browser terbuka sendiri.
rem Folder kerja bisa disetel:  Susmax.cmd --ws "C:\Users\...\project"
rem Tanpa itu, folder kerjanya folder repo ini sendiri.
rem Tutup jendela ini kalau sudah selesai.
cd /d "%~dp0"
start "" http://127.0.0.1:7654
node scripts\app.js %*
pause
