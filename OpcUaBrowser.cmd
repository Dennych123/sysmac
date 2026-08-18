@echo off
rem Penjelajah OPC UA buat simulator NX. Jalankan simulasinya dulu di Sysmac Studio (F5),
rem lalu Simulation -> Use the OPC UA Server for the simulator.
cd /d "%~dp0"
start "" http://127.0.0.1:7655
node tools\opcua\server.js
pause
