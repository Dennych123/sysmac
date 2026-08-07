# Program PLC: mdf ats new

Diekstrak dari file project Sysmac. Berkas ini memuat seluruh konteks yang
dibutuhkan untuk memahami program: logika tiap rung, komentarnya, arti tiap
bit, dan silang-rujuk siapa menulis siapa membaca.

- Program: 10
- Section: 101
- Rung: 2276
- Variabel: 6850

## Cara membaca

`/BIT` berarti kontak normally-closed (kebalikan). `->` menunjuk keluaran
(coil). Baris bertanda `~` artinya susunan cabangnya disederhanakan.


---

# PROGRAM P000_Main


## P000_Main / Initial


**1. ==============================
Design Coil
==============================**
```
P_On  ->  GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
P_Off  ->  GSB001
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
/GSB001  ->  GSB002
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB002` Ghani_Add Sensor Product

**4.**
```
GSB001  ->  GSB003
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB003` FOR MACHINE DESIGN_

**5.**
```
GSB001  ->  GSB004
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB004` FOR MACHINE DESIGN_

**6.**
```
GSB001  ->  GSB005
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB005` FOR MACHINE DESIGN_ SPARE4

**7.**
```
GSB001  ->  GSB006
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB006` FOR MACHINE DESIGN_

**8.**
```
GSB001  ->  GSB007
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB007` FOR MACHINE DESIGN_

**9.**
```
GSB001  ->  GSB008
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB008` FOR MACHINE DESIGN_

**10.**
```
/GSB001  ->  GSB009
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB009` Modify Ghani After Moving to Line

**11.**
```
/GSB001  ->  GSB010
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB010` FOR MACHINE ADJUST_SPARE1

**12.**
```
/GSB001  ->  GSB011
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB011` Ghani_Trial W/O Product

**13.**
```
GSB000 AND (Get1sClk() OR Get100msClk())  ->  aP_1s, aP_0_1s
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `aP_1s` 1SEC CLOCK PULSE
- `aP_0_1s` 0.1SEC CLOCK PULSE

**14. ==============================
Adjust Coil
==============================**
```
/GSB001  ->  GSB020
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB020` Add Function : Flash 1 / 2 Disable

**15.**
```
/GSB001  ->  GSB021
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB021` Add Sequence when Flash Breakdown

**16.**
```
GSB001  ->  GSB022
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB022` FOR MACHINE ADJUST

**17.**
```
/GSB001  ->  GSB023
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB023` Improvement After MassPro DNIA MCH

**18.**
```
GSB001  ->  GSB024
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB024` FOR MACHINE ADJUST

**19.**
```
GSB001  ->  GSB025
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB025` FOR MACHINE ADJUST

**20.**
```
GSB001  ->  GSB026
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB026` FOR MACHINE ADJUST

**21.**
```
GSB001  ->  GSB027
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB027` FOR MACHINE ADJUST

**22.**
```
GSB001  ->  GSB028
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB028` FOR MACHINE ADJUST

**23.**
```
GSB001  ->  GSB029
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB029` FOR MACHINE ADJUST

**24.**
```
GSB001  ->  GSB030
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB030` MACHINE ADJUST SPARE 1_GHANI 12/27 BYPASS MASTER ON

**25.**
```
GB000[100]  ->  GSB031
```
- `GSB031` FOR MACHINE ADJUST_NG HANDLING CHANGE SQ

**26.**
```
(PB013_003 OR P_First_Run) AND /GB000[100]  ->  GB000[100]
```
- `PB013_003` PB MTC Operation Spare

**27.**
```
/PB013_003 AND GB000[100]  ->  GB000[101]
```
- `PB013_003` PB MTC Operation Spare

**28.**
```
PB013_003 AND GB000[101]  ->  GB000[100]
```
- `PB013_003` PB MTC Operation Spare

**29.**
```
/PB013_003 AND /GB000[100]  ->  GB000[101]
```
- `PB013_003` PB MTC Operation Spare

**30.**
```
GSB001  ->  GSB032
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB032` FOR MACHINE ADJUST

**31.**
```
GSB001  ->  GSB033
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB033` FOR MACHINE ADJUST

**32.**
```
GSB001  ->  GSB034
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB034` FOR MACHINE ADJUST

**33.**
```
GSB001  ->  GSB035
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB035` FOR MACHINE ADJUST

**34.**
```
GSB001  ->  GSB036
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB036` FOR MACHINE ADJUST

**35.**
```
GSB001  ->  GSB037
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB037` FOR MACHINE ADJUST

**36.**
```
GSB001  ->  GSB038
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB038` FOR MACHINE ADJUST

**37.**
```
GSB001  ->  GSB039
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB039` FOR MACHINE ADJUST

**38.**
```
GSB001  ->  GSB040
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB040` FOR MACHINE ADJUST

## P000_Main / Station_Input


**1.**
```
GSB001  ->  NOP
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `NOP` No Operation

## P000_Main / Device_Input


**1.**
```
CH0000_00  ->  PB_EMERGENCY_STOP
```
- `CH0000_00` PB EMERGENCY STOP [IOBus://unit#2/Input Bit 16 bits/Input Bit 00]
- `PB_EMERGENCY_STOP` PB Emergency Stop

**2.**
```
CH0000_01  ->  FUSE_GOOD
```
- `CH0000_01` FUSE GOOD CONFIRM. [IOBus://unit#2/Input Bit 16 bits/Input Bit 01]
- `FUSE_GOOD` FUSE GOOD

**3.**
```
CH0000_03  ->  SAFETY_CONFIRM
```
- `CH0000_03` SAFETY CONFIRM. [IOBus://unit#2/Input Bit 16 bits/Input Bit 03]
- `SAFETY_CONFIRM` SAFETY_CONFIRM

**4.**
```
/CH0000_04  ->  SS_AUTO_IND
```
- `CH0000_04` SS AUTO/IND. [IOBus://unit#2/Input Bit 16 bits/Input Bit 04]
- `SS_AUTO_IND` SS Auto/Ind

**5.**
```
CH0000_05  ->  PB_MASTER_ON
```
- `CH0000_05` PB MASTER ON [IOBus://unit#2/Input Bit 16 bits/Input Bit 05]
- `PB_MASTER_ON` PB Master ON

**6.**
```
CH0000_06  ->  MASTER_READY
```
- `CH0000_06` MASTER ON CONFIRM. [IOBus://unit#2/Input Bit 16 bits/Input Bit 06]
- `MASTER_READY` Master ON Confirmation

**7.**
```
CH0000_07  ->  PB_AUTO_RUN
```
- `CH0000_07` PB AUTO RUN [IOBus://unit#2/Input Bit 16 bits/Input Bit 07]
- `PB_AUTO_RUN` Automatic start button

**8.**
```
CH0000_09  ->  PB_RLS_LEFT
```
- `CH0000_09` PB LEFT GRIPPER RELEASE [IOBus://unit#2/Input Bit 16 bits/Input Bit 09]
- `PB_RLS_LEFT` PB Release Left Gripper

**9.**
```
CH0000_10  ->  PB_RLS_RIGHT
```
- `CH0000_10` PB RIGHT GRIPPER RELEASE [IOBus://unit#2/Input Bit 16 bits/Input Bit 10]
- `PB_RLS_RIGHT` PB Release Right Gripper

**10.**
```
CH0000_11  ->  PB_OP_ATS_MODE
```
- `CH0000_11` PB MODE OPERATOR/ATS [IOBus://unit#2/Input Bit 16 bits/Input Bit 11]
- `PB_OP_ATS_MODE` Operator or ATS Mode

**11. FLASH 1 MC
========**
```
CH0001_00  ->  PB_MSTR_ON_FLASH1
```
- `CH0001_00` PB MASTER ON FLASH1 [IOBus://unit#3/Input Bit 16 bits/Input Bit 00]
- `PB_MSTR_ON_FLASH1` PB Master ON Flash 1

**12.**
```
CH0001_01  ->  PB_EMG_STOP_FLASH1
```
- `CH0001_01` PB EMERGENCY STOP FLASH1 [IOBus://unit#3/Input Bit 16 bits/Input Bit 01]
- `PB_EMG_STOP_FLASH1` PB Emergency Stop Flash 1

**13.**
```
CH0001_02  ->  AIR_SOURCE_CONF_FLASH1
```
- `CH0001_02` AIR SOURCE CONFIRM FLASH1 [IOBus://unit#3/Input Bit 16 bits/Input Bit 02]
- `AIR_SOURCE_CONF_FLASH1` Air Source Confirm Flash 1

**14.**
```
CH0001_03  ->  MSTR_RDY_FLASH1
```
- `CH0001_03` MASTER ON CONFIRM FLASH1 [IOBus://unit#3/Input Bit 16 bits/Input Bit 03]
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1

**15. FLASH2 MC
=======**
```
CH0001_04  ->  PB_MSTR_ON_FLASH2
```
- `CH0001_04` PB MASTER ON FLASH2 [IOBus://unit#3/Input Bit 16 bits/Input Bit 04]
- `PB_MSTR_ON_FLASH2` PB Master ON Flash 2

**16.**
```
CH0001_05  ->  PB_EMG_STOP_FLASH2
```
- `CH0001_05` PB EMERGENCY STOP FLASH2 [IOBus://unit#3/Input Bit 16 bits/Input Bit 05]
- `PB_EMG_STOP_FLASH2` PB Emergency Stop Flash 2

**17.**
```
CH0001_06  ->  AIR_SOURCE_CONF_FLASH2
```
- `CH0001_06` AIR SOURCE COFNRIM FLASH2 [IOBus://unit#3/Input Bit 16 bits/Input Bit 06]
- `AIR_SOURCE_CONF_FLASH2` Air Source Confirm fLASH 2

**18.**
```
CH0001_07  ->  MSTR_RDY_FLASH2
```
- `CH0001_07` MASTER ON CONFIRM FLASH2 [IOBus://unit#3/Input Bit 16 bits/Input Bit 07]
- `MSTR_RDY_FLASH2` Master ON Confirm Flash 2

**19. SHUTTE POKAYOKE**
```
CH0001_08  ->  PB_MSTR_ON_SHUTTE
```
- `CH0001_08` PB MASTER ON SHUTTE POKAYOKE [IOBus://unit#3/Input Bit 16 bits/Input Bit 08]
- `PB_MSTR_ON_SHUTTE` PB Master ON Shutte Pokayoke

**20.**
```
CH0001_09  ->  PB_EMG_STOP_SHUTTE
```
- `CH0001_09` PB EMERGENCY STOP SHUTTE POKAYOKE [IOBus://unit#3/Input Bit 16 bits/Input Bit 09]
- `PB_EMG_STOP_SHUTTE` PB Emergency Stop Shutte Pokayoke

**21.**
```
CH0001_10  ->  AIR_SOURCE_CONF_SHUTTE
```
- `CH0001_10` AIR SOURCE CONFIRM SHUTTE POKAYOKE [IOBus://unit#3/Input Bit 16 bits/Input Bit 10]
- `AIR_SOURCE_CONF_SHUTTE` Air Source Confirm Shutte Pokayoke

**22.**
```
CH0001_11  ->  MSTR_RDY_SHUTTE
```
- `CH0001_11` MASTER ON CONFIRM SHUTTE POKAYOKE [IOBus://unit#3/Input Bit 16 bits/Input Bit 11]
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter

**23.**
```
CH0001_12  ->  PB_RLS_FLASH1
```
- `CH0001_12` PB RELEASE FLASH1 [IOBus://unit#3/Input Bit 16 bits/Input Bit 12]
- `PB_RLS_FLASH1` PB Release Flash 1

**24.**
```
CH0001_13  ->  PB_RLS_FLASH2
```
- `CH0001_13` PB RELEASE FLASH2 [IOBus://unit#3/Input Bit 16 bits/Input Bit 13]
- `PB_RLS_FLASH2` PB Release Flash 2

**25.**
```
CH0001_14  ->  PB_RELEASE_SHUTTE
```
- `CH0001_14` PB RELEASE SHUTTE POKAYOKE [IOBus://unit#3/Input Bit 16 bits/Input Bit 14]
- `PB_RELEASE_SHUTTE` PB Release Shutte Pokayoke

## P000_Main / HMI_Input


**1.**
```
GSB001  ->  PB_ALL_HOMEPOS
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PB_ALL_HOMEPOS` PB All Home Pos.

## P000_Main / Timers


**1.**
```
GSB000 AND TON()  ->  LT000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
MASTER_READY AND TON()  ->  LT001
```
- `MASTER_READY` Master ON Confirmation

**3.**
```
/MASTER_READY AND TON()  ->  LT003
```
- `MASTER_READY` Master ON Confirmation

**4.**
```
LT001 AND SS_AUTO_IND AND TON()  ->  LT004
```
- `SS_AUTO_IND` SS Auto/Ind

**5.**
```
LT001 AND /SS_AUTO_IND AND TON()  ->  LT005
```
- `SS_AUTO_IND` SS Auto/Ind

**6.**
```
MSTR_RDY_FLASH1 AND TON()  ->  LT006
```
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1

**7.**
```
MSTR_RDY_FLASH2 AND TON()  ->  LT007
```
- `MSTR_RDY_FLASH2` Master ON Confirm Flash 2

## P000_Main / Fault


**1. ■PLC FAULT**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
GSB000 AND MD_FLT_Reset400()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**3.**
```
GSB000 AND PLC_ERR_STA.PLC_ERR_BOOL[7]  ->  PLC_MAJOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PLC_MAJOR_FAULT` PLC Full Stop Fault Level$tPLC ALL STOP FAULT LEVEL

**4.**
```
GSB000 AND PLC_ERR_STA.PLC_ERR_BOOL[6]  ->  PLC_PARTIAL_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PLC_PARTIAL_FAULT` PLC Part Stop Fault Level$tPLC PARTIAL STOP FAULT LEVEL

**5.**
```
GSB000 AND PLC_ERR_STA.PLC_ERR_BOOL[5]  ->  PLC_MINOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PLC_MINOR_FAULT` PLC Mild Fault Level$tPLC SLIGHT FAULT LEVEL

**6.**
```
GSB000 AND PLC_ERR_STA.PLC_ERR_BOOL[4]  ->  PLC_OBSERVATION
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PLC_OBSERVATION` PLC Monitoring Information Level$tPLC MONITOR INFORMATION LEVEL

**7.**
```
~ PB_FAULT_RST AND /AUTO_RUN AND (PLC_ERR_STA.PLC_ERR_BOOL[7] OR PLC_ERR_STA.PLC_ERR_BOOL[6] OR PLC_ERR_STA.PLC_ERR_BOOL[5] OR PLC_ERR_STA.PLC_ERR_BOOL[4]) AND ResetPLCError()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running

**8.**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**9.**
```
GSB000 AND MC_ERR_STA.MC_ERR_BOOL[7]  ->  EC_MAJOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_MAJOR_FAULT` EtherCAT All Stop Fault Level$tEtherCAT ALL STOP FAULT LEVEL

**10.**
```
GSB000 AND MC_ERR_STA.MC_ERR_BOOL[6]  ->  EC_PARTIAL_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_PARTIAL_FAULT` EtherCAT Partial Stop Fault Level$tEtherCAT PARTIAL STOP FAULT LEVEL

**11.**
```
GSB000 AND MC_ERR_STA.MC_ERR_BOOL[5]  ->  EC_MINOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_MINOR_FAULT` EtherCAT Mild Fault Level$tEtherCAT SLIGHT FAULT LEVEL

**12.**
```
GSB000 AND MC_ERR_STA.MC_ERR_BOOL[4]  ->  EC_OBSERVATION
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_OBSERVATION` EtherCAT Monitoring Information Level$tEtherCAT MONITOR INFORMATION LEVEL

**13.**
```
~ PB_FAULT_RST AND /AUTO_RUN AND (MC_ERR_STA.MC_ERR_BOOL[7] OR MC_ERR_STA.MC_ERR_BOOL[6] OR MC_ERR_STA.MC_ERR_BOOL[5] OR MC_ERR_STA.MC_ERR_BOOL[4]) AND ResetMCError()  ->  LB190
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB190` MC SUPERVISION INFO LV FAULT RESET

**14.**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**15.**
```
GSB000 AND EC_ERR_STA.EC_ERR_BOOL[7]  ->  EC_MAJOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_MAJOR_FAULT` EtherCAT All Stop Fault Level$tEtherCAT ALL STOP FAULT LEVEL

**16.**
```
GSB000 AND EC_ERR_STA.EC_ERR_BOOL[6]  ->  EC_PARTIAL_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_PARTIAL_FAULT` EtherCAT Partial Stop Fault Level$tEtherCAT PARTIAL STOP FAULT LEVEL

**17.**
```
GSB000 AND EC_ERR_STA.EC_ERR_BOOL[5]  ->  EC_MINOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_MINOR_FAULT` EtherCAT Mild Fault Level$tEtherCAT SLIGHT FAULT LEVEL

**18.**
```
GSB000 AND EC_ERR_STA.EC_ERR_BOOL[4]  ->  EC_OBSERVATION
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EC_OBSERVATION` EtherCAT Monitoring Information Level$tEtherCAT MONITOR INFORMATION LEVEL

**19.**
```
/MC_ERR_STA.MC_ERR_BOOL[7] AND /MC_ERR_STA.MC_ERR_BOOL[6] AND /MC_ERR_STA.MC_ERR_BOOL[5] AND /MC_ERR_STA.MC_ERR_BOOL[4] AND /LB190 AND TON()
```
- `LB190` MC SUPERVISION INFO LV FAULT RESET

**20.**
```
~ (PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND GSB001) AND LB191 AND (EC_ERR_STA.EC_ERR_BOOL[7] OR EC_ERR_STA.EC_ERR_BOOL[6] OR EC_ERR_STA.EC_ERR_BOOL[5] OR EC_ERR_STA.EC_ERR_BOOL[4]) AND ResetECError()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `MASTER_READY` Master ON Confirmation
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB191` EtherCAT MONITORING INFORMATION LV FAULT RESET

**21.**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**22.**
```
GSB000 AND EIP_ERR_STA.EIP_ERR_BOOL[7]  ->  EIP_MAJOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EIP_MAJOR_FAULT` EtherNET/IP Total Shutdown Fault Level$tEtherNET/IP ALL STOP FAULT LEVEL

**23.**
```
GSB000 AND EIP_ERR_STA.EIP_ERR_BOOL[6]  ->  EIP_PARTIAL_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EIP_PARTIAL_FAULT` EtherNET/IP PART STOP FAULT LEVEL$tEtherNET/IP PARTIAL STOP FAULT LEVEL

**24.**
```
GSB000 AND EIP_ERR_STA.EIP_ERR_BOOL[5]  ->  EIP_MINOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EIP_MINOR_FAULT` EtherNET/IP MINOR FAULT LEVEL

**25.**
```
GSB000 AND EIP_ERR_STA.EIP_ERR_BOOL[4]  ->  EIP_OBSERVATION
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `EIP_OBSERVATION` MONITORING INFORMATION LEVEL

**26.**
```
(MASTER_READY OR LB008) AND /PB_MASTER_ON AND (/LB009 OR /MASTER_READY)  ->  LB008, LB009
```
- `MASTER_READY` Master ON Confirmation
- `PB_MASTER_ON` PB Master ON
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**27. EMERGENCY STOP FAULT
================**
```
(LT000 OR AL[001]) AND /PB_EMERGENCY_STOP  ->  AL[001]
```
- `PB_EMERGENCY_STOP` PB Emergency Stop

**28.**
```
(LT000 OR AL[002]) AND /FUSE_GOOD  ->  AL[002]
```
- `FUSE_GOOD` FUSE GOOD

**29.**
```
(MASTER_READY OR AL[003]) AND /PL013_004 AND /SAFETY_CONFIRM  ->  AL[003]
```
- `MASTER_READY` Master ON Confirmation
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `SAFETY_CONFIRM` SAFETY_CONFIRM

**30.**
```
(LT000 OR AL[004]) AND /FUSE_GOOD  ->  AL[004]
```
- `FUSE_GOOD` FUSE GOOD

**31.**
```
(LT000 OR AL[005]) AND /GSB000  ->  AL[005]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**32.**
```
(LT000 OR AL[006]) AND GSB001  ->  AL[006]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**33.**
```
(LT000 OR AL[007]) AND GSB001  ->  AL[007]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**34.**
```
(LT000 OR AL[008]) AND GSB001  ->  AL[008]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**35.**
```
(LT000 OR AL[009]) AND GSB001  ->  AL[009]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**36.**
```
~ (LT000 OR AL[010]) AND (PLC_MAJOR_FAULT OR PLC_PARTIAL_FAULT OR PLC_MINOR_FAULT) AND TON()  ->  AL[010]
```
- `PLC_MAJOR_FAULT` PLC Full Stop Fault Level$tPLC ALL STOP FAULT LEVEL
- `PLC_PARTIAL_FAULT` PLC Part Stop Fault Level$tPLC PARTIAL STOP FAULT LEVEL
- `PLC_MINOR_FAULT` PLC Mild Fault Level$tPLC SLIGHT FAULT LEVEL

**37.**
```
(LT000 OR AL[011]) AND (EIP_MAJOR_FAULT OR EIP_PARTIAL_FAULT) AND TON()  ->  AL[011]
```
- `EIP_MAJOR_FAULT` EtherNET/IP Total Shutdown Fault Level$tEtherNET/IP ALL STOP FAULT LEVEL
- `EIP_PARTIAL_FAULT` EtherNET/IP PART STOP FAULT LEVEL$tEtherNET/IP PARTIAL STOP FAULT LEVEL

**38.**
```
(LT000 OR AL[012]) AND (EC_MAJOR_FAULT OR EC_PARTIAL_FAULT) AND TON()  ->  AL[012]
```
- `EC_MAJOR_FAULT` EtherCAT All Stop Fault Level$tEtherCAT ALL STOP FAULT LEVEL
- `EC_PARTIAL_FAULT` EtherCAT Partial Stop Fault Level$tEtherCAT PARTIAL STOP FAULT LEVEL

**39.**
```
(LT000 OR AL[013]) AND GSB001  ->  AL[013]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**40.**
```
(LT000 OR AL[014]) AND GSB001  ->  AL[014]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**41. AUTO STOP FAULT
================**
```
(GSB001 OR AL[76]) AND GSB001  ->  AL[76]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**42.**
```
(GSB001 OR AL[77]) AND GSB001  ->  AL[77]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**43.**
```
(GSB001 OR AL[78]) AND GSB001  ->  AL[78]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**44.**
```
(GSB001 OR AL[79]) AND GSB001  ->  AL[79]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**45.**
```
(GSB001 OR AL[80]) AND GSB001  ->  AL[80]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**46. CYCLE STOP FAULT
============
**
```
GSB001  ->  AL[101]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**47.**
```
(GSB001 OR AL[102]) AND /GSB000  ->  AL[102]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**48.**
```
(GSB001 OR AL[103]) AND /GSB000  ->  AL[103]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**49.**
```
(GSB001 OR AL[104]) AND /GSB000  ->  AL[104]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**50.**
```
(GSB001 OR AL[105]) AND /GSB000  ->  AL[105]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**51. FAULT STOP
========
**
```
(GSB001 OR AL[201]) AND /GSB000  ->  AL[201]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**52.**
```
(GSB001 OR AL[202]) AND /GSB000  ->  AL[202]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**53. NOTICE/WARNING
=============**
```
(GSB001 OR AL[300]) AND /GSB000  ->  AL[300]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**54.**
```
(GSB001 OR AL[301]) AND /GSB000  ->  AL[301]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**55.**
```
LT000 AND PLC_OBSERVATION AND TON()  ->  AL[304]
```
- `PLC_OBSERVATION` PLC Monitoring Information Level$tPLC MONITOR INFORMATION LEVEL

**56.**
```
LT000 AND EIP_OBSERVATION AND GSB001 AND TON()  ->  AL[305]
```
- `EIP_OBSERVATION` MONITORING INFORMATION LEVEL
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**57.**
```
LT000 AND EC_OBSERVATION AND TON()  ->  AL[306]
```
- `EC_OBSERVATION` EtherCAT Monitoring Information Level$tEtherCAT MONITOR INFORMATION LEVEL

**58.**
```
LT000 AND EC_MINOR_FAULT AND TON()  ->  AL[307]
```
- `EC_MINOR_FAULT` EtherCAT Mild Fault Level$tEtherCAT SLIGHT FAULT LEVEL

**59.**
```
GetPLCError()  ->  PLC_ERROR
```

**60.**
```
GSB000 AND (DWORD_TO_UDINT() OR DWORD_TO_UDINT())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**61.**
```
=()  ->  AL[299]
```

**62. Emergency Stopping All
================**
```
GSB000 AND /AL[1] AND /AL[2] AND /AL[3] AND /AL[4] AND /AL[5]  ->  LB010
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB010` 品番未設定

**63.**
```
GSB000 AND /AL[10] AND /AL[11] AND /AL[12]  ->  LB011
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB011` 検索品番未検出

**64.**
```
GB011_002 AND GB012_002 AND (GB014_002 OR GSB000) AND GB015_002 AND GB002_001  ->  LB012
```
- `GB011_002` WIP Transfer Emergency Stop Fault Off
- `GB012_002` PNP ATS3 Emergency Stop Fault Off
- `GB014_002` Flash 1 Unit Emergency Stop Off
- `GB015_002` Flash 2 Emergency Stop Fault Off
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB002_001` MOTION CONTROLLER  EMERGENCY STOP OFF
- `LB012` Emergency Stopping All Aux 3

**65.**
```
GSB000  ->  LB013
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB013` Emergency Stopping All Aux 4

**66.**
```
LB010 AND LB011 AND LB012 AND LB013  ->  LB014
```
- `LB010` 品番未設定
- `LB011` 検索品番未検出
- `LB012` Emergency Stopping All Aux 3
- `LB013` Emergency Stopping All Aux 4
- `LB014` Emergency Stop OFF

**67. Auto Stopping All
============**
```
GSB000  ->  LB015
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB015` Auto Stopping All Aux 1

**68.**
```
GSB000  ->  LB016
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB016` Auto Stopping All Aux 2

**69.**
```
GB011_003 AND GB012_003 AND GB014_003 AND GB015_003  ->  LB017
```
- `GB011_003` WIP Transfer Auto Stop Fault Off
- `GB012_003` PNP ATS3 Auto Stop Fault Off
- `GB014_003` Flash 1 Unit Auto Stopping Off
- `GB015_003` Flash 2 Auto Stop Fault Off
- `LB017` Auto Stopping All Aux 3

**70.**
```
GSB000  ->  LB018
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB018` Auto Stopping All Aux 4

**71.**
```
LB015 AND LB016 AND LB017 AND LB018  ->  LB019
```
- `LB015` Auto Stopping All Aux 1
- `LB016` Auto Stopping All Aux 2
- `LB017` Auto Stopping All Aux 3
- `LB018` Auto Stopping All Aux 4
- `LB019` Auto Stop OFF

**72. Cycle Stopping All
==============**
```
GSB000  ->  LB020
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB020` MD異常でない

**73.**
```
GSB000  ->  LB021
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB021` Cycle Stopping All Aux 2

**74.**
```
GB011_004 AND GB012_004 AND GB014_004 AND GB015_004 AND GB002_003  ->  LB022
```
- `GB011_004` WIP Transfer Cycle Stop Fault Off
- `GB012_004` PNP ATS3 Cycle Stop Fault Off
- `GB014_004` Flash 1 Cycle Stop Off
- `GB015_004` Flash 2 Cycle Stop Fault Off
- `GB002_003` MOTION CONTROLLER  CYCLE STOP OFF
- `LB022` Cycle Stopping All Aux 3

**75.**
```
GSB000  ->  LB023
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB023` Cycle Stopping All Aux 4

**76.**
```
LB020 AND LB021 AND LB022 AND LB023  ->  LB024
```
- `LB020` MD異常でない
- `LB021` Cycle Stopping All Aux 2
- `LB022` Cycle Stopping All Aux 3
- `LB023` Cycle Stopping All Aux 4
- `LB024` Cycle Stop OFF

**77. Fault Stopping All
==============**
```
GSB000  ->  LB025
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB025` Fault Stopping All Aux 1

**78.**
```
GSB000  ->  LB026
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB026` Fault Stopping All Aux 2

**79.**
```
GB011_005 AND GB012_005 AND GB014_005 AND GB015_005  ->  LB027
```
- `GB011_005` WIP Transfer Fault Stopping Off
- `GB012_005` PNP ATS3 Fault Stopping Off
- `GB014_005` Flash 1 Fault Stopping Off
- `GB015_005` Flash 2 Fault Stopping Fault
- `LB027` Fault Stopping All Aux 3

**80.**
```
GSB000  ->  LB028
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB028` Fault Stopping All Aux 4

**81.**
```
LB025 AND LB026 AND LB027 AND LB028  ->  LB029
```
- `LB025` Fault Stopping All Aux 1
- `LB026` Fault Stopping All Aux 2
- `LB027` Fault Stopping All Aux 3
- `LB028` Fault Stopping All Aux 4
- `LB029` Fault Stop OFF

**82. Notice/Warning All
=============**
```
GSB000 AND /AL[304] AND /AL[305] AND /AL[306] AND /AL[307]  ->  LB030
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB030` Warning/Notice All Aux 1

**83.**
```
GSB000  ->  LB031
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB031` Warning/Notice All Aux 2

**84.**
```
GB011_006 AND GB012_006 AND GB014_006 AND GB015_006 AND GB002_005  ->  LB032
```
- `GB011_006` WIP Transfer Notice/Warning Off
- `GB012_006` PNP ATS3 Notice/Warning Off
- `GB014_006` Flash 1 Unit Warning Off
- `GB015_006` Flash 2 Notice/Warning Off
- `GB002_005` MOTION CONTROLLER  NOTICE WARNING OFF
- `LB032` Warning/Notice All Aux 3

**85.**
```
GSB000  ->  LB033
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB033` Warning/Notice All Aux 4

**86.**
```
LB030 AND LB031 AND LB032 AND LB033  ->  LB034
```
- `LB030` Warning/Notice All Aux 1
- `LB031` Warning/Notice All Aux 2
- `LB032` Warning/Notice All Aux 3
- `LB033` Warning/Notice All Aux 4
- `LB034` Warning/Notice OFF

**87. Buzzer & Alarm Reset**
```
LB014 AND LB019 AND LB024 AND LB029  ->  LB060
```
- `LB014` Emergency Stop OFF
- `LB019` Auto Stop OFF
- `LB024` Cycle Stop OFF
- `LB029` Fault Stop OFF
- `LB060` LS Shutter FG Open

**88.**
```
(PB_ALARM_RST OR LB061) AND /LB060 AND LT000  ->  LB061
```
- `LB061` LS Shutter FG Close
- `LB060` LS Shutter FG Open

**89.**
```
LB034 AND /AL[299]  ->  LB062
```
- `LB034` Warning/Notice OFF
- `LB062` FG Shutter Area Sensor

**90.**
```
(PB_ALARM_RST OR LB063) AND /LB062 AND LT000  ->  LB063
```
- `LB063` AS Additional Chutter FG Close
- `LB062` FG Shutter Area Sensor

**91.**
```
/AL[299]  ->  LB064
```
- `LB064` AS Additional Chutter FG Open

**92.**
```
(PB_ALARM_RST OR LB065) AND /LB064 AND LT000  ->  LB065
```
- `LB065` Alarm Reset (Battery Warning)
- `LB064` AS Additional Chutter FG Open

**93.**
```
~ (/LB060 AND /LB061 OR /LB062 AND /LB063 OR /LB064 AND /LB065) AND LT000  ->  LB069
```
- `LB060` LS Shutter FG Open
- `LB061` LS Shutter FG Close
- `LB062` FG Shutter Area Sensor
- `LB063` AS Additional Chutter FG Close
- `LB064` AS Additional Chutter FG Open
- `LB065` Alarm Reset (Battery Warning)
- `LB069` Buzzer

## P000_Main / Master_Preparation


**1. MACHINE STOP
===========**
```
(GSB001 OR LB077) AND MASTER_READY AND (/LB120)  ->  LB077, LB078
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB077` Preparation Off Compl. Operation
- `MASTER_READY` Master ON Confirmation
- `LB120` 検索品番有
- `LB078` Master Off Preparation

**2. Discharge Mode**
```
PB003_001 AND /AUTO_RUN AND (LB501 OR /LB501 AND /GB012_030)  ->  LB500, LB500
```
- `PB003_001` PB Discharge Mode
- `AUTO_RUN` Auto Running
- `LB501` Shutter FG Motion
- `GB012_030` No Product on All Station Confirm.

**3.**
```
GB012_030  ->  LB500
```
- `GB012_030` No Product on All Station Confirm.

**4.**
```
LB500  ->  LB501
```
- `LB501` Shutter FG Motion

**5. Maintenance Operation**
```
PB013_001 AND /AUTO_RUN AND (LB1001 OR /LB1001)  ->  LB1000, LB1000
```
- `PB013_001` PB Without Product
- `AUTO_RUN` Auto Running
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB1000` Air Blow Process Start

**6.**
```
LB1000  ->  LB1001
```
- `LB1000` Air Blow Process Start
- `LB1001` Air Blow FG Take Out Compl. Memory

**7.**
```
PB013_004 AND /AUTO_RUN AND (LB1006 OR /LB1006)  ->  LB1005, LB1005
```
- `PB013_004` PB Bypass Safety Sensor
- `AUTO_RUN` Auto Running
- `LB1006` Bypass Safety Sensor
- `LB1005` MTC Operation : Bypass Safety Sensor

**8.**
```
LB1005  ->  LB1006
```
- `LB1005` MTC Operation : Bypass Safety Sensor
- `LB1006` Bypass Safety Sensor

**9.**
```
PB013_002 AND GSB001 AND /AUTO_RUN AND /PB013_003  ->  LB1010, LB1011
```
- `PB013_002` PB Bypass Airblow
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `AUTO_RUN` Auto Running
- `PB013_003` PB MTC Operation Spare
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type

**10.**
```
PB013_003 AND GSB001 AND /AUTO_RUN AND /PB013_002  ->  LB1011, LB1010
```
- `PB013_003` PB MTC Operation Spare
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `AUTO_RUN` Auto Running
- `PB013_002` PB Bypass Airblow
- `LB1011` Running GD1B Type
- `LB1010` Running Abilcore Type

**11.**
```
PB013_008 AND /AUTO_RUN AND (LB1013 OR /LB1013)  ->  LB1012, LB1012
```
- `PB013_008` PB Teaching Mode ON/OFF
- `AUTO_RUN` Auto Running
- `LB1013` Teaching Mode
- `LB1012` Teaching Mode ON/OFF

**12.**
```
LB1012  ->  LB1013
```
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode

**13.**
```
PB013_009 AND GB014_012 AND /PB013_010 AND /LB1017 AND /AUTO_RUN AND TON()
```
- `PB013_009` PB Flash 1 Disable
- `GB014_012` Flash 1 No Product Confirm.
- `PB013_010` PB Flash 2 Disable
- `LB1017` Flash 2 Disable
- `AUTO_RUN` Auto Running
- `LT075` Delay Flash 1 Disable

**14.**
```
LT075.Q AND (LB1015 OR /LB1015)  ->  LB1014, LB1014
```
- `LB1015` Warning : Forget to NAGARA
- `LB1014` Warning : Air Blow Double Process

**15.**
```
LB1014  ->  LB1015
```
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA

**16.**
```
PB013_010 AND GB015_012 AND /PB013_009 AND /LB1015 AND /AUTO_RUN AND TON()
```
- `PB013_010` PB Flash 2 Disable
- `GB015_012` PH Flash 2 No Product Confirm.
- `PB013_009` PB Flash 1 Disable
- `LB1015` Warning : Forget to NAGARA
- `AUTO_RUN` Auto Running
- `LT076` Delay Flash 2 Disable

**17.**
```
LT076.Q AND (LB1017 OR /LB1017)  ->  LB1016, LB1016
```
- `LB1017` Flash 2 Disable
- `LB1016` Flash 2 Disable/Enable

**18.**
```
~ (GSB000 OR P_First_Run OR LT000)  ->  LB1016
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB1016` Flash 2 Disable/Enable

**19.**
```
LB1016  ->  LB1017
```
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable

**20.**
```
PB013_002 AND /AUTO_RUN AND TON()
```
- `PB013_002` PB Bypass Airblow
- `AUTO_RUN` Auto Running
- `LT077` Delay Bypass Airblow

**21.**
```
LT077.Q AND (LB1019 OR /LB1019)  ->  LB1018, LB1018
```
- `LB1019` Bypass Air Blow
- `LB1018` Bypass Airblow Enable/Disable

**22.**
```
LB1018  ->  LB1019
```
- `LB1018` Bypass Airblow Enable/Disable
- `LB1019` Bypass Air Blow

**23.**
```
PB_RELEASE_SHUTTE AND TON()
```
- `PB_RELEASE_SHUTTE` PB Release Shutte Pokayoke
- `LT078` Delay Hold&Release Chutter for Box Changing

**24.**
```
LT078.Q AND (LB1021 OR /LB1021)  ->  LB1020, LB1020
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing

**25.**
```
LB1020  ->  LB1021
```
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1021` Hold & Release Chutter FG for Box Changing

**26.**
```
PB700_000 AND /AUTO_RUN AND IND_MODE AND /PL431_03M AND TON()
```
- `PB700_000` PB Master Check Mode
- `AUTO_RUN` Auto Running
- `IND_MODE` Individual Mode
- `PL431_03M` PL Flash 1 Debug Mode
- `LT079` Master Mode Delay

**27.**
```
GB014_007 AND GB012_007  ->  LB1022A
```
- `GB014_007` Flash 1 Master Check Complete
- `GB012_007` MRC Master Check Complete
- `LB1022A` All Master Check Compl.

**28.**
```
~ (LT079.Q OR PB431_03M OR LB1022A) AND LB1023  ->  LB1022
```
- `PB431_03M` PB Flash 1 Debugging Mode
- `LB1022A` All Master Check Compl.
- `LB1023` Master Check Mode
- `LB1022` Enable/Disable Master Check Mode

**29.**
```
LT079.Q AND /LB1023 AND PL013_004 AND PL031_004 AND PL031_005 AND PL031_006  ->  LB1022
```
- `LB1023` Master Check Mode
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `PL031_004` PL Auto Cond. : MRC3 MC Ready
- `PL031_005` PL Auto Cond. : Flash 1 MC Ready
- `PL031_006` PL Auto Cond. : Flash 2 MC Ready
- `LB1022` Enable/Disable Master Check Mode

**30.**
```
LB1022  ->  LB1023
```
- `LB1022` Enable/Disable Master Check Mode
- `LB1023` Master Check Mode

**31.**
```
PB013_012 AND /AUTO_RUN AND TON()
```
- `PB013_012` PB Bypass Judgment MRC
- `AUTO_RUN` Auto Running
- `LT080` Delay Bypass Judgment MRC

**32.**
```
LT080.Q AND (LB1025 OR /LB1025)  ->  LB1024, LB1024
```
- `LB1025` Bypass Judgment MRC
- `LB1024` Enable/Disable Bypass Judgment MRC

**33.**
```
LB1024  ->  LB1025
```
- `LB1024` Enable/Disable Bypass Judgment MRC
- `LB1025` Bypass Judgment MRC

## P000_Main / Condition


**1. MACHINE ABEYANCE
==============**
```
GSB000  ->  LB080
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB080` Machine Abeyance Aux 1

**2.**
```
GSB000  ->  LB081
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB081` Machine Abeyance Aux 2

**3.**
```
GB011_009 AND GB012_009 AND GB014_009 AND GB015_009  ->  LB082
```
- `GB011_009` WIP Transfer Machine Abeyance
- `GB012_009` PNP ATS3 Machine Abeyance
- `GB014_009` Flash 1 Machine Abeyance
- `GB015_009` Flash 2 Machine Abeyance
- `LB082` Machine Abeyance Aux 3

**4.**
```
LB080 AND LB081 AND LB082  ->  LB086
```
- `LB080` Machine Abeyance Aux 1
- `LB081` Machine Abeyance Aux 2
- `LB082` Machine Abeyance Aux 3
- `LB086` Machine Abeyance Aux

**5.**
```
LB086  ->  LB089
```
- `LB086` Machine Abeyance Aux
- `LB089` Machine Abeyance

**6. HOME POSITION
============**
```
GSB000  ->  LB090
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件

**7.**
```
GSB000  ->  LB091
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB091` All Machine Home Pos Aux 2

**8.**
```
GB011_001 AND GB012_001 AND GB014_001 AND GB015_001  ->  LB092
```
- `GB011_001` WIP Transfer Home Pos.
- `GB012_001` PNP ATS3 Home Pos.
- `GB014_001` Flash 1 Unit Home Pos.
- `GB015_001` Flash2 Home Pos.
- `LB092` All Machine Home Pos Aux 3

**9.**
```
LB090 AND LB091 AND LB092  ->  LB096
```
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件
- `LB091` All Machine Home Pos Aux 2
- `LB092` All Machine Home Pos Aux 3
- `LB096` All Machine Home Pos Aux

**10.**
```
LB096  ->  LB099
```
- `LB096` All Machine Home Pos Aux
- `LB099` WIP Transfer Unit Home Pos.

**11. Auto Start Cond. (Except Home Pos)
=======================**
```
GSB000  ->  LB100
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB100` Assy品番検索

**12.**
```
GB011_008 AND GB012_008 AND GB014_008 AND GB015_008  ->  LB101
```
- `GB011_008` WIP Transfer Auto Cond. (Except Home Pos.)
- `GB012_008` PNP3 Auto Cond. (Home Pos. Except)
- `GB014_008` Flash 1 Auto Cond. (Home Pos. Except)
- `GB015_008` Flash 2 Auto Cond. (Home Pos. Except)
- `LB101` 品番検索開始(開始位置0)

**13.**
```
PL_AUTO_COND AND PL_AUTO_COND2  ->  LB102
```
- `PL_AUTO_COND` PL Auto Run Condition
- `PL_AUTO_COND2` PL Auto Run Condition 2
- `LB102` 品番途中検索開始(開始位置0以外)

**14.**
```
LB100 AND LB101 AND LB102  ->  LB106
```
- `LB100` Assy品番検索
- `LB101` 品番検索開始(開始位置0)
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB106` Ind Spare

**15.**
```
LB106  ->  LB109
```
- `LB106` Ind Spare
- `LB109` Ind Spare

## P000_Main / Auto_Main_Loop


**1.**
```
SAFETY_CONFIRM AND MASTER_READY AND LT004 AND LB014 AND LB019  ->  LB110
```
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `MASTER_READY` Master ON Confirmation
- `LB014` Emergency Stop OFF
- `LB019` Auto Stop OFF
- `LB110` 検索品番有

**2.**
```
LB110  ->  LB119
```
- `LB110` 検索品番有
- `LB119` Auto Running Condition

**3.**
```
~ (PB_AUTO_RUN OR LB120) AND LB099 AND LB109 AND LB119 AND (/LB121 OR /LB089 OR /LB099)  ->  LB120
```
- `PB_AUTO_RUN` Automatic start button
- `LB099` WIP Transfer Unit Home Pos.
- `LB109` Ind Spare
- `LB120` 検索品番有
- `LB119` Auto Running Condition
- `LB121` 品番検索完了
- `LB089` Machine Abeyance

**4.**
```
~ (PB_CYCLE_STOP OR /LB024 OR LB121 OR PL_CYCLE_STOP AND GSB001) AND LB120  ->  LB121
```
- `PB_CYCLE_STOP` PB Cycle Stop
- `LB024` Cycle Stop OFF
- `LB121` 品番検索完了
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB120` 検索品番有

## P000_Main / TowerLight


**1.**
```
(SS_AUTO_IND AND /LB060 OR /SS_AUTO_IND AND /LB064 AND /LB065)  ->  CH0005_13
```
- `SS_AUTO_IND` SS Auto/Ind
- `LB060` LS Shutter FG Open
- `LB064` AS Additional Chutter FG Open
- `LB065` Alarm Reset (Battery Warning)
- `CH0005_13` PL RED TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 13]

**2.**
```
MASTER_READY AND AUTO_RUN AND /LB062 AND /CH0005_13  ->  CH0005_14
```
- `MASTER_READY` Master ON Confirmation
- `AUTO_RUN` Auto Running
- `LB062` FG Shutter Area Sensor
- `CH0005_13` PL RED TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 13]
- `CH0005_14` PL YELLOW TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 14]

**3.**
```
(LB120 OR MASTER_READY AND /LB120 AND aP_1s) AND /CH0005_13 AND /CH0005_14  ->  CH0005_15
```
- `LB120` 検索品番有
- `MASTER_READY` Master ON Confirmation
- `aP_1s` 1SEC CLOCK PULSE
- `CH0005_13` PL RED TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 13]
- `CH0005_14` PL YELLOW TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 14]
- `CH0005_15` PL GREEN TOWER LAMP [IOBus://unit#7/Output Bit 16 bits/Output Bit 15]

## P000_Main / Operation


**1.**
```
GSB001  ->  NOP
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `NOP` No Operation

## P000_Main / HMI_Output


**1.**
```
/LB060  ->  PL_FLT
```
- `LB060` LS Shutter FG Open
- `PL_FLT` PL Fault

**2.**
```
/LB060  ->  PL_NO_FLT
```
- `LB060` LS Shutter FG Open
- `PL_NO_FLT` PL No Fault

**3.**
```
LB121 AND aP_1s  ->  PL_CYCLE_STOP
```
- `LB121` 品番検索完了
- `aP_1s` 1SEC CLOCK PULSE

**4.**
```
LB501  ->  PL003_001
```
- `LB501` Shutter FG Motion

**5.**
```
LB1001  ->  PL013_001
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `PL013_001` PL MTC OP. Bypass Product

**6.**
```
LB1019  ->  PL013_002
```
- `LB1019` Bypass Air Blow
- `PL013_002` PL Airblow Bypass

**7.**
```
GB000[100]  ->  PL013_003
```
- `PL013_003` PL NG HANDLING CHANGE SQUENCE

**8.**
```
LB1006  ->  PL013_004
```
- `LB1006` Bypass Safety Sensor
- `PL013_004` PL MTC OP. Bypass Safety Sensor

**9.**
```
LPPSelectDt.Gripper[5].LSComb.LS  ->  PL013_005
```
- `PL013_005` PL MTC OP. Left Gripper Unchuck

**10.**
```
RPPSelectDt.Gripper[5].LSComb.LS  ->  PL013_006
```
- `PL013_006` PL MTC OP. Right Gripper Unchuck

**11.**
```
LB1013  ->  PL013_008
```
- `LB1013` Teaching Mode
- `PL013_008` PL MTC OP. Teaching Mode

**12.**
```
LB1015  ->  PL013_009
```
- `LB1015` Warning : Forget to NAGARA
- `PL013_009` PL MTC OP. Flash 1 Disable

**13.**
```
LB1017  ->  PL013_010
```
- `LB1017` Flash 2 Disable
- `PL013_010` PL MTC OP. Flash 2 Disable

**14.**
```
LB1025  ->  PL013_012
```
- `LB1025` Bypass Judgment MRC
- `PL013_012` PL MTC OP MRC Judgment BYPASS

**15.**
```
(PPWIPAxis.Post[5].LSComb.LS OR PPWIPAxis.Post[2].LSComb.LS) AND GB011_022 AND GB011_024 AND AUTO_RUN AND TON()  ->  PL_PART_CONF
```
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `AUTO_RUN` Auto Running

**16.**
```
MASTER_MODE  ->  PL700_000
```
- `MASTER_MODE` Master Check Mode
- `PL700_000` PL Master Check Mode

**17. ================
MASTER ON CONDITON
================**
```
PLC_GOOD  ->  PL021_001
```
- `PLC_GOOD` PLC Good
- `PL021_001` PL Master ON Cond : PLC Good

**18.**
```
FUSE_GOOD  ->  PL021_002
```
- `FUSE_GOOD` FUSE GOOD
- `PL021_002` PL Master ON Cond : Fuse Good

**19.**
```
CH0007_15  ->  PL021_003
```
- `CH0007_15` Saftey Area WIP Confirm. [IOBus://unit#9/Input Bit 16 bits/Input Bit 15]
- `PL021_003` PL Master ON Cond : Spare

**20.**
```
SAFETY_CONFIRM  ->  PL021_004
```
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `PL021_004` PL Master ON Cond : Safety Confirm.

**21.**
```
/GSB001  ->  PL021_005
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_005` PL Master ON Cond : Spare

**22.**
```
/GSB001  ->  PL021_006
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_006` PL Master ON Cond : Spare

**23.**
```
/GSB001  ->  PL021_007
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_007` PL Master ON Cond : Spare

**24.**
```
/GSB001  ->  PL021_008
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_008` PL Master ON Cond : Spare

**25.**
```
/GSB001  ->  PL021_009
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_009` PL Master ON Cond : Spare

**26.**
```
LB014  ->  PL021_010
```
- `LB014` Emergency Stop OFF
- `PL021_010` PL Master ON Cond : Not Emergency Stop

**27.**
```
/GSB001  ->  PL021_011
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL021_011` PL Master On Condition 11

**28. ================
AUTO RUN CONDITON 1
================**
```
HOME_POS  ->  PL031_001
```
- `HOME_POS` Machine Home Pos.
- `PL031_001` PL Auto Cond. : Machine Home Pos.

**29.**
```
LT004  ->  PL031_002
```
- `PL031_002` PL Auto Cond. : SS Auto

**30.**
```
(GSB001 OR GSB000)  ->  PL031_003
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PL031_003` PL Auto Cond. : Part No Select Compl

**31.**
```
NJ_TO_NX_Bool[11]  ->  PL031_004
```
- `PL031_004` PL Auto Cond. : MRC3 MC Ready

**32.**
```
MSTR_RDY_FLASH1 AND Flash1_COM_OK  ->  PL031_005
```
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1
- `Flash1_COM_OK` Flash 1 Communication OK
- `PL031_005` PL Auto Cond. : Flash 1 MC Ready

**33.**
```
MSTR_RDY_FLASH2  ->  PL031_006
```
- `MSTR_RDY_FLASH2` Master ON Confirm Flash 2
- `PL031_006` PL Auto Cond. : Flash 2 MC Ready

**34.**
```
RCON_In_Axis0_Status_Signal.B[4] AND RCON_In_Axis1_Status_Signal.B[4] AND RCON_In_Axis2_Status_Signal.B[4] AND RCON_In_Axis3_Status_Signal.B[4] AND RCON_In_Axis4_Status_Signal.B[4] AND RCON_In_Axis5_Status_Signal.B[4] AND RCON_In_Axis6_Status_Signal.B[4] AND RCON_In_Axis7_Status_Signal.B[4] AND RCON_In_Axis8_Status_Signal.B[4]  ->  PL031_007
```
- `PL031_007` PL Auto Cond. : IAI Ready

**35.**
```
PB_OP_ATS_MODE  ->  PL031_008
```
- `PB_OP_ATS_MODE` Operator or ATS Mode
- `PL031_008` PL Auto Cond. :  ATS Mode

**36.**
```
/LB1005  ->  PL031_009
```
- `LB1005` MTC Operation : Bypass Safety Sensor
- `PL031_009` PL Auto Cond. : Safety Sensor not Bypass

**37.**
```
RCON_In_Axis0_Status_Signal.B[1]  ->  PL031_010
```
- `PL031_010` PL Auto Cond. : SM2 Rotate Homing Compl.

**38.**
```
RCON_In_Axis1_Status_Signal.B[1]  ->  PL031_011
```
- `PL031_011` PL Auto Cond. : SM3 Rotate Homing Compl.

**39.**
```
/TEACH_ON  ->  PL031_012
```
- `TEACH_ON` Teaching included
- `PL031_012` PL Auto Cond. : Not Teach Mode

**40.**
```
MSTR_RDY_SHUTTE  ->  PL031_013
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `PL031_013` PL Auto Cond. : FG Chutter Ready

**41.**
```
LB060  ->  PL031_014
```
- `LB060` LS Shutter FG Open
- `PL031_014` PL Auto Cond. : Not Fault

**42. ================
AUTO RUN CONDITON 2
================**
```
GB011_015  ->  PL032_001
```
- `GB011_015` Air Blow MC Ready
- `PL032_001` PL Auto Run Cond : Air Blow MC Ready

**43.**
```
/AirBlow_Bypass  ->  PL032_002
```
- `AirBlow_Bypass` Bypass Airblow MC
- `PL032_002` PL Auto Run Cond : Airblow not Bypass

**44.**
```
/MASTER_MODE  ->  PL032_003
```
- `MASTER_MODE` Master Check Mode
- `PL032_003` PL Auto Run Cond : Not Master Check Mode

**45.**
```
GB012_007  ->  PL032_004
```
- `GB012_007` MRC Master Check Complete
- `PL032_004` PL Auto Run Cond : MRC Master Check Complete

**46.**
```
GB014_007  ->  PL032_005
```
- `GB014_007` Flash 1 Master Check Complete
- `PL032_005` PL Auto Run Cond : Flash 1 Master Check Complete

**47.**
```
/GSB001  ->  PL032_006
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_006` PL Auto Run Cond : Flash 2 Master Check Complete

**48.**
```
ATS_XAxis_Ready  ->  PL032_007
```
- `ATS_XAxis_Ready` ATS X Axis Servo Ready
- `PL032_007` PL Auto Run Cond : 7 X Axis Servo Ready

**49.**
```
/PL431_03M  ->  PL032_008
```
- `PL431_03M` PL Flash 1 Debug Mode
- `PL032_008` PL Auto Run Cond : 8 Flash 1 NOT Debug Mode

**50.**
```
/GSB001  ->  PL032_009
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_009` PL Auto Run Cond : 9

**51.**
```
/GSB001  ->  PL032_010
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_010` PL Auto Run Cond : 10

**52.**
```
/GSB001  ->  PL032_011
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_011` PL Auto Run Cond : 11

**53.**
```
/GSB001  ->  PL032_012
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_012` PL Auto Run Cond : 12

**54.**
```
/GSB001  ->  PL032_013
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_013` PL Auto Run Cond : 13

**55.**
```
/GSB001  ->  PL032_014
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL032_014` PL Auto Run Cond : 14

## P000_Main / Device_Output


**1.**
```
PWR_ON  ->  RCON_Out_Gateway0.B[15]
```
- `PWR_ON` POWER ON DELAY

**2.**
```
LB014 AND PLC_GOOD  ->  CH0003_00
```
- `LB014` Emergency Stop OFF
- `PLC_GOOD` PLC Good
- `CH0003_00` EMERGENCY STOP INTERLOCK [IOBus://unit#5/Output Bit 16 bits/Output Bit 00]

**3.**
```
MASTER_READY  ->  CH0003_01
```
- `MASTER_READY` Master ON Confirmation
- `CH0003_01` PL MASTER ON [IOBus://unit#5/Output Bit 16 bits/Output Bit 01]

**4.**
```
AUTO_RUN  ->  CH0003_02
```
- `AUTO_RUN` Auto Running
- `CH0003_02` PL AUTO RUNNING [IOBus://unit#5/Output Bit 16 bits/Output Bit 02]

**5.**
```
LB069  ->  CH0003_03
```
- `LB069` Buzzer
- `CH0003_03` BUZZER-1 [IOBus://unit#5/Output Bit 16 bits/Output Bit 03]

**6.**
```
LB1006  ->  CH0003_04
```
- `LB1006` Bypass Safety Sensor
- `CH0003_04` SAFETY PREEMPT [IOBus://unit#5/Output Bit 16 bits/Output Bit 04]

**7.**
```
MSTR_RDY_FLASH1  ->  CH0004_00
```
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1
- `CH0004_00` PL MASTER ON  (FLASH1) [IOBus://unit#6/Output Bit 16 bits/Output Bit 00]

**8.**
```
GSB000 AND LB069  ->  CH0004_01
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB069` Buzzer
- `CH0004_01` BUZZER-2 (FLASH1) [IOBus://unit#6/Output Bit 16 bits/Output Bit 01]

**9.**
```
MSTR_RDY_FLASH2  ->  CH0004_02
```
- `MSTR_RDY_FLASH2` Master ON Confirm Flash 2
- `CH0004_02` PL MASTER ON (FLASH2) [IOBus://unit#6/Output Bit 16 bits/Output Bit 02]

**10.**
```
GSB000 AND LB069  ->  CH0004_03
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB069` Buzzer
- `CH0004_03` BUZZER-3 (FLASH2) [IOBus://unit#6/Output Bit 16 bits/Output Bit 03]

**11.**
```
MSTR_RDY_SHUTTE  ->  CH0004_04
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `CH0004_04` PL MASTER ON (SHUTTE POKAYOKE) [IOBus://unit#6/Output Bit 16 bits/Output Bit 04]

**12.**
```
(LB069 OR FGChutterBoxChanging AND aP_1s)  ->  CH0004_05
```
- `LB069` Buzzer
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing
- `aP_1s` 1SEC CLOCK PULSE
- `CH0004_05` BUZZER-4 (SHUTTE POKAYOKE) [IOBus://unit#6/Output Bit 16 bits/Output Bit 05]

**13.**
```
GSB000 AND GB014_002 AND PLC_GOOD  ->  CH0004_06
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB014_002` Flash 1 Unit Emergency Stop Off
- `PLC_GOOD` PLC Good
- `CH0004_06` EMERGENCY STOP INTL (FLASH1) [IOBus://unit#6/Output Bit 16 bits/Output Bit 06]

**14.**
```
(LB1006 OR GSB000)  ->  CH0004_07
```
- `LB1006` Bypass Safety Sensor
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `CH0004_07` SAFETY PREEMPT (FLASH1) [IOBus://unit#6/Output Bit 16 bits/Output Bit 07]

**15.**
```
GSB000 AND GB015_002 AND PLC_GOOD  ->  CH0004_08
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB015_002` Flash 2 Emergency Stop Fault Off
- `PLC_GOOD` PLC Good
- `CH0004_08` EMERGENCY STOP INTL (FLASH2) [IOBus://unit#6/Output Bit 16 bits/Output Bit 08]

**16.**
```
(LB1006 OR GSB000)  ->  CH0004_09
```
- `LB1006` Bypass Safety Sensor
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `CH0004_09` SAFETY PREEMPT (FLASH2) [IOBus://unit#6/Output Bit 16 bits/Output Bit 09]

**17.**
```
GSB000 AND /AL[16] AND /AL[17] AND /AL[18] AND /AL[19] AND PLC_GOOD  ->  CH0004_10
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PLC_GOOD` PLC Good
- `CH0004_10` EMERGENCY STOP INTL (SHUTTE POKAYOKE) [IOBus://unit#6/Output Bit 16 bits/Output Bit 10]

## P000_Main / Station_Output


**1.**
```
/PLC_MAJOR_FAULT AND /PLC_PARTIAL_FAULT AND /PLC_MINOR_FAULT AND /EC_MAJOR_FAULT AND /EC_PARTIAL_FAULT AND /EIP_MAJOR_FAULT AND /EIP_PARTIAL_FAULT AND PWR_ON  ->  PLC_GOOD
```
- `PLC_MAJOR_FAULT` PLC Full Stop Fault Level$tPLC ALL STOP FAULT LEVEL
- `PLC_PARTIAL_FAULT` PLC Part Stop Fault Level$tPLC PARTIAL STOP FAULT LEVEL
- `PLC_MINOR_FAULT` PLC Mild Fault Level$tPLC SLIGHT FAULT LEVEL
- `EC_MAJOR_FAULT` EtherCAT All Stop Fault Level$tEtherCAT ALL STOP FAULT LEVEL
- `EC_PARTIAL_FAULT` EtherCAT Partial Stop Fault Level$tEtherCAT PARTIAL STOP FAULT LEVEL
- `EIP_MAJOR_FAULT` EtherNET/IP Total Shutdown Fault Level$tEtherNET/IP ALL STOP FAULT LEVEL
- `EIP_PARTIAL_FAULT` EtherNET/IP PART STOP FAULT LEVEL$tEtherNET/IP PARTIAL STOP FAULT LEVEL
- `PWR_ON` POWER ON DELAY
- `PLC_GOOD` PLC Good

**2.**
```
LT000  ->  PWR_ON
```
- `PWR_ON` POWER ON DELAY

**3.**
```
LT001  ->  MASTER_ON
```
- `MASTER_ON` Master ON ATS Delay

**4.**
```
LT006  ->  MASTER_ON_FLASH1
```
- `MASTER_ON_FLASH1` Master ON Flash 1 Delay

**5.**
```
LT007  ->  MASTER_ON_FLASH2
```
- `MASTER_ON_FLASH2` Master ON Flash 2 Delay

**6.**
```
LT004  ->  AUTO_MODE
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE

**7.**
```
LT005  ->  IND_MODE
```
- `IND_MODE` Individual Mode

**8.**
```
LB120  ->  AUTO_RUN
```
- `LB120` 検索品番有
- `AUTO_RUN` Auto Running

**9.**
```
LB121  ->  CYCLE_STOPPING
```
- `LB121` 品番検索完了
- `CYCLE_STOPPING` Cycle Stopping

**10.**
```
LB1001  ->  WITHOUT_PRODUCT
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `WITHOUT_PRODUCT` Bypass Without Product

**11.**
```
(LB1010 OR =()) AND GSB001  ->  Running_Type1
```
- `LB1010` Running Abilcore Type
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `Running_Type1` Running Abilcore Model

**12.**
```
(LB1011 OR =()) AND GSB001  ->  Running_Type2
```
- `LB1011` Running GD1B Type
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `Running_Type2` Running GD1B Model

**13.**
```
LB1013  ->  TEACH_ON
```
- `LB1013` Teaching Mode
- `TEACH_ON` Teaching included

**14.**
```
LB099  ->  HOME_POS
```
- `LB099` WIP Transfer Unit Home Pos.
- `HOME_POS` Machine Home Pos.

**15.**
```
LB501  ->  DISCH_MODE
```
- `LB501` Shutter FG Motion
- `DISCH_MODE` Discharge Mode

**16.**
```
LB1015  ->  FLASH1_DISABLE
```
- `LB1015` Warning : Forget to NAGARA
- `FLASH1_DISABLE` Flash 1 Disable

**17.**
```
LB1017  ->  FLASH2_DISABLE
```
- `LB1017` Flash 2 Disable
- `FLASH2_DISABLE` Flash 2 Disable

**18.**
```
LB1019  ->  AirBlow_Bypass
```
- `LB1019` Bypass Air Blow
- `AirBlow_Bypass` Bypass Airblow MC

**19.**
```
LB1021  ->  FGChutterBoxChanging
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing

**20.**
```
LB1023  ->  MASTER_MODE
```
- `LB1023` Master Check Mode
- `MASTER_MODE` Master Check Mode

## P000_Main / QRReader


**1.**
```
GSB001 AND AryByteTo()
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**2.**
```
/GSB001 AND AryByteTo()  ->  ARYBYTEOK
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
AryToString()
```

**4.**
```
/LD043[0].FEED.B[0] AND /OUT_TO_NL20[1].FEED.B[0] AND PWR_ON AND /PB_FAULT_RST  ->  OUT_TO_NL20[0].FEED.B[8]
```
- `PWR_ON` POWER ON DELAY
- `PB_FAULT_RST` PB Fault Reset

**5.**
```
/PB500_015 AND LD043[1].FEED.B[0] AND TON() AND /PB_FAULT_RST AND /PB008[1]  ->  OUT_TO_NL20[1].FEED.B[0]
```
- `PB_FAULT_RST` PB Fault Reset

**6.**
```
LD043[1].FEED.B[0] AND /AUTO_RUN  ->  GB000[90]
```
- `AUTO_RUN` Auto Running

**7.**
```
MID()
```

**8.**
```
MOVE()
```

---

# PROGRAM P001_HMI


## P001_HMI / TP_Control


**1.**
```
MASTER_ON  ->  PL_MSTR_RDY
```
- `MASTER_ON` Master ON ATS Delay

**2.**
```
AUTO_RUN  ->  PL_AUTO_RUN
```
- `AUTO_RUN` Auto Running

**3.**
```
HOME_POS  ->  PL_HOME_POS
```
- `HOME_POS` Machine Home Pos.

**4.**
```
IND_MODE  ->  PL_IND_MODE
```
- `IND_MODE` Individual Mode

**5.**
```
PB_FAULT_RST AND /AUTO_RUN  ->  FLT_RST
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `FLT_RST` Fault Reset

**6.**
```
AUTO_RUN AND MOVE()
```
- `AUTO_RUN` Auto Running

**7.**
```
/AUTO_RUN AND MOVE()
```
- `AUTO_RUN` Auto Running

**8.**
```
P_First_RunMode AND @MOVE()
```

**9.**
```
~ GSB000 AND (=() AND @MOVE() OR PB_MASTER_ON AND /PL_MSTR_COND AND @MOVE() OR AUTO_MODE AND /PL_FLT AND @MOVE() OR IND_MODE AND /PL_FLT AND @MOVE() OR PL_FLT AND @MOVE() OR PB_AUTO_RUN AND /PL_AUTO_COND AND @MOVE() OR IND_MODE AND @MOVE() OR /SS_AUTO_IND OR AUTO_MODE AND @MOVE() OR SS_AUTO_IND)
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `PB_MASTER_ON` PB Master ON
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `PL_FLT` PL Fault
- `IND_MODE` Individual Mode
- `PB_AUTO_RUN` Automatic start button
- `PL_AUTO_COND` PL Auto Run Condition
- `PL_AUTO_COND2` PL Auto Run Condition 2
- `SS_AUTO_IND` SS Auto/Ind

**10.**
```
PL021_001 AND PL021_002 AND PL021_003 AND PL021_004 AND PL021_005 AND PL021_006 AND PL021_007 AND PL021_008 AND PL021_009 AND PL021_010 AND PL021_011  ->  PL_MSTR_COND
```
- `PL021_001` PL Master ON Cond : PLC Good
- `PL021_002` PL Master ON Cond : Fuse Good
- `PL021_003` PL Master ON Cond : Spare
- `PL021_004` PL Master ON Cond : Safety Confirm.
- `PL021_005` PL Master ON Cond : Spare
- `PL021_006` PL Master ON Cond : Spare
- `PL021_007` PL Master ON Cond : Spare
- `PL021_008` PL Master ON Cond : Spare
- `PL021_009` PL Master ON Cond : Spare
- `PL021_010` PL Master ON Cond : Not Emergency Stop
- `PL021_011` PL Master On Condition 11

**11.**
```
PL031_001 AND PL031_002 AND PL031_003 AND PL031_004 AND PL031_005 AND PL031_006 AND PL031_007 AND PL031_008 AND PL031_009 AND PL031_010 AND PL031_011 AND PL031_012 AND PL031_013 AND PL031_014 AND PL_AUTO_COND2  ->  PL_AUTO_COND
```
- `PL031_001` PL Auto Cond. : Machine Home Pos.
- `PL031_002` PL Auto Cond. : SS Auto
- `PL031_003` PL Auto Cond. : Part No Select Compl
- `PL031_004` PL Auto Cond. : MRC3 MC Ready
- `PL031_005` PL Auto Cond. : Flash 1 MC Ready
- `PL031_006` PL Auto Cond. : Flash 2 MC Ready
- `PL031_007` PL Auto Cond. : IAI Ready
- `PL031_008` PL Auto Cond. :  ATS Mode
- `PL031_009` PL Auto Cond. : Safety Sensor not Bypass
- `PL031_010` PL Auto Cond. : SM2 Rotate Homing Compl.
- `PL031_011` PL Auto Cond. : SM3 Rotate Homing Compl.
- `PL031_012` PL Auto Cond. : Not Teach Mode
- `PL031_013` PL Auto Cond. : FG Chutter Ready
- `PL031_014` PL Auto Cond. : Not Fault
- `PL_AUTO_COND2` PL Auto Run Condition 2
- `PL_AUTO_COND` PL Auto Run Condition

**12.**
```
PL032_001 AND PL032_002 AND PL032_003 AND PL032_004 AND PL032_005 AND PL032_006 AND PL032_007 AND PL032_008 AND PL032_009 AND PL032_010 AND PL032_011 AND PL032_012 AND PL032_013 AND PL032_014  ->  PL_AUTO_COND2
```
- `PL032_001` PL Auto Run Cond : Air Blow MC Ready
- `PL032_002` PL Auto Run Cond : Airblow not Bypass
- `PL032_003` PL Auto Run Cond : Not Master Check Mode
- `PL032_004` PL Auto Run Cond : MRC Master Check Complete
- `PL032_005` PL Auto Run Cond : Flash 1 Master Check Complete
- `PL032_006` PL Auto Run Cond : Flash 2 Master Check Complete
- `PL032_007` PL Auto Run Cond : 7 X Axis Servo Ready
- `PL032_008` PL Auto Run Cond : 8 Flash 1 NOT Debug Mode
- `PL032_009` PL Auto Run Cond : 9
- `PL032_010` PL Auto Run Cond : 10
- `PL032_011` PL Auto Run Cond : 11
- `PL032_012` PL Auto Run Cond : 12
- `PL032_013` PL Auto Run Cond : 13
- `PL032_014` PL Auto Run Cond : 14
- `PL_AUTO_COND2` PL Auto Run Condition 2

## P001_HMI / DataSetup


**1. Initial Setting Maximum Number of Registered Product Numbers = 1000**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2. Reset search results when switching setup data input screen**
```
GSB000 AND <>() AND <>() AND <>() AND <>() AND <>() AND TON() AND @MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**3. Permission to edit setup data**
```
(PB060[3] OR LB140) AND /MASTER_READY AND /PB060[4] AND (=() OR =()) AND /LB142  ->  LB140, PL060[3]
```
- `LB140` SET-UP DATA EDIT PERMISSION
- `MASTER_READY` Master ON Confirmation
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**4.**
```
(/PB060[3] OR LB141) AND LB140  ->  LB141
```
- `LB141` SET-UP DATA EDIT PB OFF CONFIRMATION
- `LB140` SET-UP DATA EDIT PERMISSION

**5.**
```
(LB141 OR LB142) AND PB060[3]  ->  LB142
```
- `LB141` SET-UP DATA EDIT PB OFF CONFIRMATION
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**6. Permission to delete setup data**
```
(PB060[4] OR LB145) AND /MASTER_READY AND /PB060[3] AND =() AND /LB147  ->  LB145, PL060[4]
```
- `LB145` SET-UP DATA DELETE PERMISSION
- `MASTER_READY` Master ON Confirmation
- `LB147` SET-UP DATA DELETE PERMISSION

**7.**
```
(/PB060[4] OR LB146) AND LB145  ->  LB146
```
- `LB146` SET-UP DATA DELETE  PB OFF CONFIRMATION
- `LB145` SET-UP DATA DELETE PERMISSION

**8.**
```
(LB146 OR LB147) AND PB060[4]  ->  LB147
```
- `LB146` SET-UP DATA DELETE  PB OFF CONFIRMATION
- `LB147` SET-UP DATA DELETE PERMISSION

**9. Reset search results when changing extraction assy part number**
```
~ (<>() OR <>() OR <>()) AND /LB137 AND (@MOVE() OR @MOVE() OR @MOVE())  ->  LB136
```
- `LB137` ASSY PARTS NUMBER CHANGE(ASSY HIGH RANK 6 DIGIT)
- `LB136` ASSY PARTS NUMBER CHANGE(GROUP COMPANY CODE)

**10.**
```
~ (=() OR =() OR =())  ->  LB137
```
- `LB137` ASSY PARTS NUMBER CHANGE(ASSY HIGH RANK 6 DIGIT)

**11.**
```
LB136 AND @MOVE()
```
- `LB136` ASSY PARTS NUMBER CHANGE(GROUP COMPANY CODE)

**12. Assy part number search**
```
(PB060[2] OR LB150) AND <>() AND /LB154 AND /LB164 AND /LB165  ->  LB150
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]
- `LB164` ASSY PARTS NUMBER NON-REGISTERED SEARCH  NORMAL  END
- `LB165` ASSY PARTS NUMBER NON-REGISTERED SEARCH  COMPLETE(NO REGISTER)

**13.**
```
~ LB150 AND (INT_TO_UINT() OR CONCAT() OR MOVE() OR MOVE() OR MOVE())
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**14.**
```
LB150 AND ArySearch()
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**15.**
```
~ LB150 AND (>() AND /LB155 OR LB154 OR <=() AND /LB154 OR LB155)  ->  LB154, LB155
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]
- `LB155` PH Tipe 1 No Floating Confirm. [Abilcore]

**16.**
```
~ LB154 AND (MOVE() OR UINT_TO_INT() OR MOVE())
```
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]

**17. Assy part number unregistered first search**
```
LB155  ->  LB160
```
- `LB155` PH Tipe 1 No Floating Confirm. [Abilcore]
- `LB160` ASSY PARTS NUMBER NON-REGISTERED TOP SEARCH

**18.**
```
LB160 AND (MOVE() OR MOVE())
```
- `LB160` ASSY PARTS NUMBER NON-REGISTERED TOP SEARCH

**19.**
```
LB160 AND ArySearch()
```
- `LB160` ASSY PARTS NUMBER NON-REGISTERED TOP SEARCH

**20.**
```
~ LB160 AND (>() AND /LB165 OR LB164 OR <=() AND /LB164 OR LB165)  ->  LB164, LB165
```
- `LB160` ASSY PARTS NUMBER NON-REGISTERED TOP SEARCH
- `LB164` ASSY PARTS NUMBER NON-REGISTERED SEARCH  NORMAL  END
- `LB165` ASSY PARTS NUMBER NON-REGISTERED SEARCH  COMPLETE(NO REGISTER)

**21.**
```
~ LB164 AND (MOVE() OR UINT_TO_INT() OR MOVE())
```
- `LB164` ASSY PARTS NUMBER NON-REGISTERED SEARCH  NORMAL  END

**22.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB170
```
- `LB170` SET-UP DATA1-4_OK

**23.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB171
```
- `LB171` SET-UP DATA5-8_OK

**24.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB172
```
- `LB172` SET-UP DATA9-12_OK

**25.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB173
```
- `LB173` SET-UP DATA13-15_OK

**26.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB176
```
- `LB176` SET-UP DATA16-19_OK

**27.**
```
<=() AND <=() AND <=() AND <=()  ->  LB177
```
- `LB177` SET-UP DATA20-23_OK

**28.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB178
```
- `LB178` SET-UP DATA24-27_OK

**29.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB179
```
- `LB179` SET-UP DATA28-30_OK

**30.**
```
<=() AND <=() AND <=() AND <=()  ->  LB270
```

**31.**
```
<=() AND <=() AND <=() AND <=()  ->  LB271
```

**32.**
```
<=() AND <=() AND <=() AND <=()  ->  LB272
```

**33.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB273
```

**34.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB276
```

**35.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB277
```

**36.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB278
```

**37.**
```
<=() AND <=() AND <=() AND <=() AND <=() AND <=()  ->  LB279
```

**38.**
```
LB170 AND LB171 AND LB172 AND LB173 AND LB176 AND LB177 AND LB178 AND LB179 AND LB270 AND LB271 AND LB272 AND LB273 AND LB276 AND LB277 AND LB278 AND LB279  ->  LB175
```
- `LB170` SET-UP DATA1-4_OK
- `LB171` SET-UP DATA5-8_OK
- `LB172` SET-UP DATA9-12_OK
- `LB173` SET-UP DATA13-15_OK
- `LB176` SET-UP DATA16-19_OK
- `LB177` SET-UP DATA20-23_OK
- `LB178` SET-UP DATA24-27_OK
- `LB179` SET-UP DATA28-30_OK
- `LB175` SET-UP DATA UPPER AND LOWER LIMITS RANGE OK(WRITE OK)

**39. Execute writing after editing setup data**
```
PB060[1] AND PL060[3] AND LB175 AND (=() OR =())  ->  LB180, LB181
```
- `LB175` SET-UP DATA UPPER AND LOWER LIMITS RANGE OK(WRITE OK)
- `LB180` SET-UP DATA AFTER EDIT  WRITE (EDIT REGIST)
- `LB181` SET-UP DATA AFTER EDIT  WRITE (NEW REGIST)

**40. Write setup data (edit registration) Setup data only**
```
LB180 AND MOVE()
```
- `LB180` SET-UP DATA AFTER EDIT  WRITE (EDIT REGIST)

**41. Write setup data (new registration)**
```
~ LB181 AND (MOVE() OR CONCAT() OR MOVE())
```
- `LB181` SET-UP DATA AFTER EDIT  WRITE (NEW REGIST)

**42. Execute setup data deletion write**
```
PB060[1] AND PL060[4] AND =()  ->  LB182
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**43.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**44.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**45.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**46.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**47.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**48.**
```
~ LB182 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**49.**
```
LB182  ->  LB183
```
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE
- `LB183` SET-UP DATA DELETE  COMPLETE

**50.**
```
~ LB183 AND (MOVE() OR CONCAT() OR MOVE())
```
- `LB183` SET-UP DATA DELETE  COMPLETE

**51. Setup data confirmed PL**
```
PL060[1] AND /PB060[1] AND @MOVE()
```

**52.**
```
~ (LB180 OR LB181 OR LB182)  ->  PL060[1]
```
- `LB180` SET-UP DATA AFTER EDIT  WRITE (EDIT REGIST)
- `LB181` SET-UP DATA AFTER EDIT  WRITE (NEW REGIST)
- `LB182` SET-UP DATA DELETE  WRITE EXECUTE

**53.**
```
MOVE()
```

**54.**
```
(PB060[5] AND MOVE() OR PB060[5] AND MOVE())  ->  PB060[5]
```

**55. Write setup upper and lower limit data**
```
PB064_001  ->  PL063[1]
```

**56.**
```
~ PL063[1] AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**57.**
```
~ PL063[1] AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**58.**
```
~ PL063[1] AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**59.**
```
~ PL063[1] AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**60. Read setup upper and lower limit data**
```
~ <>() AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**61.**
```
~ <>() AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**62.**
```
~ <>() AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move())
```

**63.**
```
~ <>() AND <() AND (=() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR =() AND @Move() OR @Move())
```

## P001_HMI / Counter


**1. ｶｳﾝﾀ1回路
COUNTER 1  CIRCUIT**
```
GCT001 AND <() AND Inc()
```

**2.**
```
<>() AND <=() AND /PC071_012  ->  PC071_011
```

**3.**
```
<>() AND <=()  ->  PC071_012
```

**4. ｶｳﾝﾀ2回路
COUNTER 2  CIRCUIT**
```
GCT002 AND <() AND Inc()
```

**5.**
```
<>() AND <=() AND /PC071_022  ->  PC071_021
```

**6.**
```
<>() AND <=()  ->  PC071_022
```

**7. ｶｳﾝﾀ3回路
COUNTER 3  CIRCUIT**
```
GCT003 AND <() AND Inc()
```

**8.**
```
<>() AND <=() AND /PC071_032  ->  PC071_031
```

**9.**
```
<>() AND <=()  ->  PC071_032
```

**10. ｶｳﾝﾀ4回路
COUNTER 4  CIRCUIT**
```
GCT004 AND <() AND Inc()
```
- `GCT004` COUNTER 4 COUNT

**11.**
```
<>() AND <=() AND /PC071_042  ->  PC071_041
```

**12.**
```
<>() AND <=()  ->  PC071_042
```

**13. ｶｳﾝﾀ5回路
COUNTER 5  CIRCUIT**
```
GCT005 AND <() AND Inc()
```

**14.**
```
<>() AND <=() AND /PC071_052  ->  PC071_051
```

**15.**
```
<>() AND <=()  ->  PC071_052
```

**16. ｶｳﾝﾀ6回路
COUNTER 6  CIRCUIT**
```
GCT006 AND <() AND Inc()
```

**17.**
```
<>() AND <=() AND /PC071_062  ->  PC071_061
```

**18.**
```
<>() AND <=()  ->  PC071_062
```

**19. ｶｳﾝﾀ7回路
COUNTER 7 CIRCUIT**
```
GCT007 AND <() AND Inc()
```

**20.**
```
<>() AND <=() AND /PC071_072  ->  PC071_071
```

**21.**
```
<>() AND <=()  ->  PC071_072
```

**22. ｶｳﾝﾀ8回路
COUNTER 8  CIRCUIT**
```
GCT008 AND <() AND Inc()
```

**23.**
```
<>() AND <=() AND /PC071_082  ->  PC071_081
```

**24.**
```
<>() AND <=()  ->  PC071_082
```

**25. ｶｳﾝﾀ9回路
COUNTER 9 CIRCUIT**
```
GCT009 AND <() AND Inc()
```

**26.**
```
<>() AND <=() AND /PC072_092  ->  PC072_091
```

**27.**
```
<>() AND <=()  ->  PC072_092
```

**28. ｶｳﾝﾀ10回路
COUNTER 10 CIRCUIT**
```
GCT010 AND <() AND Inc()
```

**29.**
```
<>() AND <=() AND /PC072_102  ->  PC072_101
```

**30.**
```
<>() AND <=()  ->  PC072_102
```

**31. ｶｳﾝﾀ11回路
COUNTER 11 CIRCUIT**
```
GCT011 AND <() AND Inc()
```

**32.**
```
<>() AND <=() AND /PC072_112  ->  PC072_111
```

**33.**
```
<>() AND <=()  ->  PC072_112
```

**34. ｶｳﾝﾀ12回路
COUNTER 12 CIRCUIT**
```
GCT012 AND <() AND Inc()
```

**35.**
```
<>() AND <=() AND /PC072_122  ->  PC072_121
```

**36.**
```
<>() AND <=()  ->  PC072_122
```

**37. ｶｳﾝﾀ13回路
COUNTER 13 CIRCUIT**
```
GCT013 AND <() AND Inc()
```

**38.**
```
<>() AND <=() AND /PC072_132  ->  PC072_131
```

**39.**
```
<>() AND <=()  ->  PC072_132
```

**40. ｶｳﾝﾀ14回路
COUNTER 14 CIRCUIT**
```
GCT014 AND <() AND Inc()
```

**41.**
```
<>() AND <=() AND /PC072_142  ->  PC072_141
```

**42.**
```
<>() AND <=()  ->  PC072_142
```

**43. ｶｳﾝﾀ15回路
COUNTER 15 CIRCUIT**
```
GCT015 AND <() AND Inc()
```

**44.**
```
<>() AND <=() AND /PC072_152  ->  PC072_151
```

**45.**
```
<>() AND <=()  ->  PC072_152
```

**46. カウンタ設定値書込み
COUNTER SET VALUE WRITE**
```
~ PB070_001 AND <() AND (@MOVE() OR @-() OR @MOVE() OR @MOVE())
```

**47. カウンタ設定値読出し
COUNTER SET VALUE READING**
```
~ PB070_002 AND <() AND (@MOVE() OR @-() OR @MOVE() OR @MOVE())  ->  PB070_002
```

## P001_HMI / TimerS


**1. ■サイクルタイム計測回路
■CYCLE TIME MEASUREMENT CIRCUIT **
```
GTM_CT AND (@MOVE() OR @MOVE())
```
- `GTM_CT` CYCLETIMECOUNT START

**2.**
```
GTM_CT AND (@MOVE() OR @MOVE())
```
- `GTM_CT` CYCLETIMECOUNT START

**3.**
```
AUTO_RUN AND aP_0_1s AND >=() AND @Inc()
```
- `AUTO_RUN` Auto Running
- `aP_0_1s` 0.1SEC CLOCK PULSE

**4.**
```
P_Off AND aP_0_1s AND >=() AND @Inc()
```
- `aP_0_1s` 0.1SEC CLOCK PULSE

**5. タイマ1回路
TIMER 1 CIRCUIT **
```
GTM001 AND aP_0_1s AND <() AND @Inc()
```
- `GTM001` TIMER 1 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**6.**
```
<>() AND <>()  ->  PT081_001
```

**7. タイマ2回路
TIMER 2 CIRCUIT**
```
GTM002 AND aP_0_1s AND <() AND @Inc()
```
- `GTM002` TIMER 2 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**8.**
```
<>() AND <>()  ->  PT081_002
```

**9. タイマ3回路
TIMER 3 CIRCUIT**
```
GTM003 AND aP_0_1s AND <() AND @Inc()
```
- `GTM003` TIMER 3 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**10.**
```
<>() AND <>()  ->  PT081_003
```

**11. タイマ4回路
TIMER 4 CIRCUIT**
```
GTM004 AND aP_0_1s AND <() AND @Inc()
```
- `GTM004` TIMER 4 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**12.**
```
<>() AND <>()  ->  PT081_004
```

**13. タイマ5回路
TIMER 5 CIRCUIT**
```
GTM005 AND aP_0_1s AND <() AND @Inc()
```
- `GTM005` TIMER 5 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**14.**
```
<>() AND <>()  ->  PT081_005
```

**15. タイマ6回路
TIMER 6 CIRCUIT**
```
GTM006 AND aP_0_1s AND <() AND @Inc()
```
- `GTM006` TIMER 6 COUNT
- `aP_0_1s` 0.1SEC CLOCK PULSE

**16.**
```
<>() AND <>()  ->  PT081_006
```

**17. タイマ設定値書込み
TIMER SET VALUE WRITE**
```
~ PB080_001 AND <() AND (@MOVE() OR @-() OR @MOVE())
```

**18. タイマ設定値読出し
TIMER SET VALUE READING**
```
~ PB080_002 AND <() AND (@MOVE() OR @-() OR @MOVE())  ->  PB080_002
```

## P001_HMI / DataSearch


**1. Production Direction
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
===============================================================================**
```
~ (PB008[15] OR GB000[90] OR LB1000) AND /AUTO_RUN AND /NX_TO_NJ_Bool[13] AND TON() AND =() AND <>() AND <>() AND /LB1021  ->  LB1000
```
- `AUTO_RUN` Auto Running
- `LB1000` Air Blow Process Start
- `LB1021` Hold & Release Chutter FG for Box Changing

**2.**
```
~ (/PB008[15] OR /GB000[90] OR LB1001) AND LB1000  ->  LB1001
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB1000` Air Blow Process Start

**3.**
```
~ LB1000 AND (INT_TO_UINT() OR CONCAT() OR MOVE() OR MOVE())
```
- `LB1000` Air Blow Process Start

**4.**
```
LB1000 AND ArySearch()
```
- `LB1000` Air Blow Process Start

**5.**
```
~ LB1000 AND (>() AND /LB1155 OR LB1154 OR <=() AND /LB1154 OR LB1155)  ->  LB1154, LB1155
```
- `LB1000` Air Blow Process Start
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1155` ASSY PARTS NUMBER EXTRACT END (NO REGISTER)

**6.**
```
LB1154 AND =() AND @MOVE() AND @MOVE() AND @MOVE()  ->  LB1010
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type

**7.**
```
LB1154 AND /LB1010 AND =() AND @MOVE() AND @MOVE()  ->  LB1011
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type

**8.**
```
LB1154 AND /LB1010 AND /LB1011 AND =() AND @MOVE() AND @MOVE()  ->  LB1012
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF

**9.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND =() AND @MOVE() AND @MOVE()  ->  LB1013
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode

**10.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND =() AND @MOVE() AND @MOVE()  ->  LB1014
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process

**11.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND =() AND @MOVE() AND @MOVE()  ->  LB1015
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA

**12.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND /LB1015 AND =() AND @MOVE() AND @MOVE()  ->  LB1016
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable

**13.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND /LB1015 AND /LB1016 AND =() AND @MOVE() AND @MOVE()  ->  LB1017
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable

**14.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND /LB1015 AND /LB1016 AND /LB1017 AND =() AND @MOVE() AND @MOVE()  ->  LB1018
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB1018` Bypass Airblow Enable/Disable

**15.**
```
LB1154 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND /LB1015 AND /LB1016 AND /LB1017 AND /LB1018 AND =() AND @MOVE() AND @MOVE()  ->  LB1019
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB1018` Bypass Airblow Enable/Disable
- `LB1019` Bypass Air Blow

**16.**
```
LB1154 AND /LB1010 AND /LB1010 AND /LB1011 AND /LB1012 AND /LB1013 AND /LB1014 AND /LB1015 AND /LB1016 AND /LB1017 AND /LB1018  ->  LB1022
```
- `LB1154` ASSY PARTS NUMBER EXTRACT NORMAL END
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB1018` Bypass Airblow Enable/Disable
- `LB1022` Enable/Disable Master Check Mode

**17.**
```
LB1021 AND /GSB009 AND @MOVE() AND @MOVE()
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `GSB009` Modify Ghani After Moving to Line

**18.**
```
~ (LB1010 OR LB1011 OR LB1012 OR LB1013 OR LB1014 OR LB1015 OR LB1016 OR LB1017 OR LB1018 OR LB1019 OR LB1020 OR LB1022 OR LB1155)  ->  LB1021
```
- `LB1010` Running Abilcore Type
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB1018` Bypass Airblow Enable/Disable
- `LB1019` Bypass Air Blow
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1022` Enable/Disable Master Check Mode
- `LB1155` ASSY PARTS NUMBER EXTRACT END (NO REGISTER)
- `LB1021` Hold & Release Chutter FG for Box Changing

**19.**
```
~ (PB008[14] AND ton() OR <>() AND =() OR LB2021 AND /LB820 AND /LB2032 AND /LB2023)  ->  LB2021
```
- `LB820` Flash2 Master OK Check Compl.
- `LB2032` PartNo. Not Change

**20.**
```
LB2021 AND @move()
```

**21.**
```
~ LB2021 AND (<>() AND <>() AND /LB2023 AND /LB2024 OR LB2022 OR =() AND =() AND /LB2022 AND /LB2024 OR LB2023 OR /LB2022 AND /LB2023)  ->  LB2022, LB2023, LB2024
```

**22.**
```
LB2022 AND @move() AND @move() AND @move() AND @move() AND @move()
```

**23.**
```
LB2022 AND @move() AND @move() AND @move() AND @move() AND @move()
```

**24.**
```
~ LB2022 AND (<>() OR LB2030 OR /LB2030) AND <>() AND /LB2031  ->  LB2030, LB2031
```
- `LB2030` Next Product Indication Data Set Complete
- `LB2031` Next Product Indication Data Set Fault

**25.**
```
~ LB2030 AND (=() OR LB2032 OR /LB2032) AND /LB2033  ->  LB2032, LB2033
```
- `LB2030` Next Product Indication Data Set Complete
- `LB2032` PartNo. Not Change
- `LB2033` PartNo. Change Detect

**26. Rot Chenge Next PARTS No. Dta Load@(DANDORI).@**
```
LB2033  ->  LB2050
```
- `LB2033` PartNo. Change Detect
- `LB2050` Lot Change Next PartNo. Setting Condition

**27.**
```
~ (LB2050 OR LB2023 OR <>() AND /GSB009)  ->  LB2051
```
- `LB2050` Lot Change Next PartNo. Setting Condition
- `GSB009` Modify Ghani After Moving to Line
- `LB2051` Lot Change Next PartNo. Setting Start

**28. ■MD_In

Substitute SETUP_START to proper variable. 抽出開始信号を割り付けてください**
```
~ (LB2051 OR PB008[15] OR GB000[90]) AND /NX_TO_NJ_Bool[13] AND @Clear() AND @MOVE()  ->  LB800
```
- `LB2051` Lot Change Next PartNo. Setting Start
- `LB800` Memory WIP Trans. Confirm.

**29. ■Fault
　Fault reset**
```
MD_FLT_Reset50()
```

**30. ■Fault
　Fault reset**
```
LD800[1]  ->  ALZBD01[1]
```

**31.**
```
LD800[2]  ->  ALZBD01[2]
```

**32. 　CycleStop**
```
/ALZBD01[1] AND /ALZBD01[2]  ->  LB803
```
- `LB803` Unit cycle stop off auxiliary 1

**33.**
```
LB803  ->  LB807
```
- `LB803` Unit cycle stop off auxiliary 1
- `LB807` MD cycle stop off

**34. ■Condition**
```
LB800 AND (LB817 OR LB810) AND /LB820  ->  LB810
```
- `LB800` Memory WIP Trans. Confirm.
- `LB817` Setup extraction MD start condition
- `LB810` Air Blow FG Take Out Memory
- `LB820` Flash2 Master OK Check Compl.

**35. ■AutoRun**
```
LB810 AND SetUpDataSearch_ZBD()  ->  LB815
```
- `LB810` Air Blow FG Take Out Memory
- `LB815` 段取り抽出OK完了

**36.**
```
(LB815 AND /LB1236 OR LB816 AND LB815)  ->  LB820
```
- `LB815` 段取り抽出OK完了
- `LB816` 段取り抽出NG完了
- `LB1236` Right PP Z Axis Pos 2 Moving Start
- `LB820` Flash2 Master OK Check Compl.

**37. ■MD_Out**
```
LB807  ->  GB001_CycleStopOff
```
- `LB807` MD cycle stop off
- `GB001_CycleStopOff` HMI (段取り抽出MD)_ｻｲｸﾙ停止OFF

**38.**
```
LB815  ->  GB001_000
```
- `LB815` 段取り抽出OK完了
- `GB001_000` SET-UP DATA EXTRACT NORMAL END$tSET-UP DATA EXTRACT NORMAL END

**39.**
```
LB816  ->  GB001_001
```
- `LB816` 段取り抽出NG完了
- `GB001_001` SET-UP DATA EXTRACT END(NO REGISTER)$tSET-UP DATA EXTRACT END(NO REGISTER)

**40.**
```
(LB2107 OR <>() AND aP_1s)  ->  GB001_002
```
- `LB2107` Set-Up Data Extact Compl
- `aP_1s` 1SEC CLOCK PULSE
- `GB001_002` SET-UP DATA EXTRACT COMPL

**41.**
```
GSB000 AND (<>() AND HexStringToNum_DINT() OR =() AND MOVE()) AND DINT_TO_WORD()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**42.**
```
<>()  ->  LB2100
```
- `LB2100` Flash 1 Take Out Priority

**43.**
```
X1 AND LB803 AND <>()  ->  LB2101
```
- `LB803` Unit cycle stop off auxiliary 1
- `LB2101` Flash 2 Take Out Priority

**44.**
```
~ LB2101 AND (LB2100 OR LB2105 OR /LB2105) AND /LB2106  ->  LB2105, LB2106
```
- `LB2101` Flash 2 Take Out Priority
- `LB2100` Flash 1 Take Out Priority
- `LB2105` Set-Up Data Content Good Condition
- `LB2106` Set-Up Data Content Fault Condition

**45.**
```
LB2105  ->  LB2107
```
- `LB2105` Set-Up Data Content Good Condition
- `LB2107` Set-Up Data Extact Compl

**46.**
```
(LB2033 OR LB2023)  ->  LB2107
```
- `LB2033` PartNo. Change Detect
- `LB2107` Set-Up Data Extact Compl

**47.**
```
~ (LB2107 AND MOVE() OR LB2023 AND MOVE() OR LB815)
```
- `LB2107` Set-Up Data Extact Compl
- `LB815` 段取り抽出OK完了

**48.**
```
/LB2107 AND MOVE()
```
- `LB2107` Set-Up Data Extact Compl

**49.**
```
LB2107 AND MOVE()
```
- `LB2107` Set-Up Data Extact Compl

**50.**
```
(<>() OR =()) AND aP_1s AND MOVE()
```
- `aP_1s` 1SEC CLOCK PULSE

**51.**
```
=() AND <>()  ->  PL008[15]
```

**52.**
```
GB000[90] AND /NX_TO_NJ_Bool[13] AND MOVE()
```

**53.**
```
PL008[15] AND (TON() OR /LT816.Q)  ->  GB001[1]
```

**54.**
```
~ (LB2107 OR LB2023 OR LB815) AND /GSB009
```
- `LB2107` Set-Up Data Extact Compl
- `LB815` 段取り抽出OK完了
- `GSB009` Modify Ghani After Moving to Line

**55.**
```
~ (LB2107 OR LB2023 OR LB815 OR IND_MODE OR AUTO_MODE) AND GSB009 AND <>()
```
- `LB2107` Set-Up Data Extact Compl
- `LB815` 段取り抽出OK完了
- `IND_MODE` Individual Mode
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `GSB009` Modify Ghani After Moving to Line

**56.**
```
/GSB010 AND Running_Type1
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `Running_Type1` Running Abilcore Model

**57.**
```
/GSB010 AND Running_Type2
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `Running_Type2` Running GD1B Model

---

# PROGRAM P002_ServoMain


## P002_ServoMain / Initial


**1. ++++++++++++++++++++++++++++++++++++++
Axis feed mode selection finite axis: OFF infinite axis: ON
++++++++++++++++++++++++++++++++++++++**
```
GSB001  ->  LB030[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**2.**
```
GSB001  ->  LB030[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
GSB001  ->  LB030[3]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4.**
```
GSB001  ->  LB030[4]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**5.**
```
GSB001  ->  LB030[5]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6.**
```
GSB001  ->  LB030[6]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**7.**
```
GSB001  ->  LB030[7]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**8.**
```
GSB001  ->  LB030[8]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**9.**
```
GSB001  ->  LB030[9]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**10.**
```
GSB001  ->  LB030[10]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11.**
```
GSB001  ->  LB030[11]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**12.**
```
GSB001  ->  LB030[12]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**13.**
```
GSB001  ->  LB030[13]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
GSB001  ->  LB030[14]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
GSB001  ->  LB030[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**16.**
```
~ PWR_ON AND (LB030[1] OR LB030[2] OR LB030[3] OR LB030[4] OR LB030[5] OR LB030[6] OR LB030[7] OR LB030[8]) AND Clear()
```
- `PWR_ON` POWER ON DELAY

**17.**
```
=()  ->  LB000[1]
```

**18.**
```
=()  ->  LB000[2]
```

**19.**
```
=()  ->  LB000[3]
```

**20.**
```
=()  ->  LB000[4]
```

**21.**
```
=()  ->  LB000[5]
```

**22.**
```
=()  ->  LB000[6]
```

**23.**
```
=()  ->  LB000[7]
```

**24.**
```
=()  ->  LB000[8]
```

**25. ++++++++++++++++++++++
■ Servo lock conditions
++++++++++++++++++++++**
```
(MASTER_READY OR GSB052) AND (SAFETY_CONFIRM OR TEACH_ON) AND /LB020 AND TON()
```
- `MASTER_READY` Master ON Confirmation
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `TEACH_ON` Teaching included
- `LB020` MD異常でない
- `GSB052` Robot Yes/No (ON with Yes)

**26.**
```
MASTER_READY AND (TEACH_SAFE_CONF OR /GSB052)  ->  LB001
```
- `MASTER_READY` Master ON Confirmation
- `TEACH_SAFE_CONF` TEACHING COVER SAFETY CONFIRMATION
- `GSB052` Robot Yes/No (ON with Yes)
- `LB001` 異常あり$tFAULT EXIST

**27.**
```
~ LT000.Q AND (/LB043 OR LB002 OR /LB002) AND /LB003  ->  LB002, LB003
```
- `LB043` STO NOT FAULT$tSTO NOT FAULT
- `LB002` MRC Ready toTake In Signal
- `LB003` MRC3 Processing

**28.**
```
LB002 AND /LB005  ->  LB004
```
- `LB002` MRC Ready toTake In Signal
- `LB005` PH MRC Product Confirm.
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**29.**
```
(LB043 OR LB005) AND LB002  ->  LB005
```
- `LB043` STO NOT FAULT$tSTO NOT FAULT
- `LB005` PH MRC Product Confirm.
- `LB002` MRC Ready toTake In Signal

**30.**
```
(LB001 OR LB006) AND LB010 AND /LB008  ->  LB006
```
- `LB001` 異常あり$tFAULT EXIST
- `LB006` LS Cover MRC Open
- `LB010` 品番未設定
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION

**31.**
```
LB006 AND /LB008  ->  LB007
```
- `LB006` LS Cover MRC Open
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION
- `LB007` LS Cover MRC Close

**32.**
```
(LB043 OR LB008) AND LB006  ->  LB008
```
- `LB043` STO NOT FAULT$tSTO NOT FAULT
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION
- `LB006` LS Cover MRC Open

**33.**
```
(LB004 OR LB007)  ->  LB009
```
- `LB004` MRC3 Cover in Motion (Cover is Moving)
- `LB007` LS Cover MRC Close
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**34.**
```
(LB003 OR LB005)  ->  LB010
```
- `LB003` MRC3 Processing
- `LB005` PH MRC Product Confirm.
- `LB010` 品番未設定

**35. +++++++++++++
■ System area
+++++++++++++**
```
P_First_RunMode AND MOVE()
```

**36.**
```
~ GSB010 AND P_First_RunMode AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `GSB010` FOR MACHINE ADJUST_SPARE1

**37.**
```
GSB000 AND DINT_TO_LREAL() AND /()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**38.**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**39. +++++++++++++++++++
■ Input parameter settings
+++++++++++++++++++**
```
~ GSB000 AND (MOVE() OR LB092 AND DINT_TO_LREAL() AND /() AND MOVE() OR MOVE() OR MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB092` All Machine Home Pos Aux 3

**40.**
```
~ GSB000 AND (GSB010 AND GSB001 AND MOVE() OR GSB010 AND GSB001 AND MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**41. +++++++++++++++++
■ Servo current value
+++++++++++++++++**
```
~ GSB000 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**42. +++++++++++++++++++++++++++++
■ PB Operation_Servo Adjustment
+++++++++++++++++++++++++++++**
```
(PB351_000 OR LB012) AND /LB020 AND /LB024 AND IND_MODE AND /LB014 AND /MASTER_READY AND (GSB009 OR /GSB009) AND TEACH_ON  ->  LB012
```
- `LB020` MD異常でない
- `LB024` Cycle Stop OFF
- `LB012` Emergency Stopping All Aux 3
- `IND_MODE` Individual Mode
- `LB014` Emergency Stop OFF
- `MASTER_READY` Master ON Confirmation
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included

**43.**
```
(/PB351_000 OR LB013) AND LB012  ->  LB013
```
- `LB013` Emergency Stopping All Aux 4
- `LB012` Emergency Stopping All Aux 3

**44.**
```
(LB013 OR LB014) AND PB351_000  ->  LB014
```
- `LB013` Emergency Stopping All Aux 4
- `LB014` Emergency Stop OFF

**45. ++++++++++++++++++++++++++++
■ PB Operation_JOG Adjustment Enabled
++++++++++++++++++++++++++++**
```
(PB354_000 OR LB016) AND /LB020 AND IND_MODE AND LB012 AND /LB018  ->  LB016
```
- `LB020` MD異常でない
- `LB016` Auto Stopping All Aux 2
- `IND_MODE` Individual Mode
- `LB012` Emergency Stopping All Aux 3
- `LB018` Auto Stopping All Aux 4

**46.**
```
(/PB354_000 OR LB017) AND LB016  ->  LB017
```
- `LB017` Auto Stopping All Aux 3
- `LB016` Auto Stopping All Aux 2

**47.**
```
(LB017 OR LB018) AND PB354_000  ->  LB018
```
- `LB017` Auto Stopping All Aux 3
- `LB018` Auto Stopping All Aux 4

**48. +++++++++++++++++++++++++++++++++++++++
■ PB Operation_PC Adjustment Effective
+++++++++++++++++++++++++++++++++++++++**
```
(PB351_001 OR LB020) AND /LB012 AND /LB024 AND SS_IND AND /LB022 AND /MASTER_READY  ->  LB020
```
- `LB012` Emergency Stopping All Aux 3
- `LB024` Cycle Stop OFF
- `LB020` MD異常でない
- `LB022` Cycle Stopping All Aux 3
- `MASTER_READY` Master ON Confirmation

**49.**
```
(/PB351_001 OR LB021) AND LB020  ->  LB021
```
- `LB021` Cycle Stopping All Aux 2
- `LB020` MD異常でない

**50.**
```
(LB021 OR LB022) AND PB351_001  ->  LB022
```
- `LB021` Cycle Stopping All Aux 2
- `LB022` Cycle Stopping All Aux 3

**51. ++++++++++++++++++++++++++++++++
■ PB Operation_Brake Adjustment Enabled
++++++++++++++++++++++++++++++++**
```
(PB351_002 OR LB024) AND /LB012 AND /LB020 AND SS_IND AND /LB026 AND /MASTER_READY  ->  LB024
```
- `LB012` Emergency Stopping All Aux 3
- `LB020` MD異常でない
- `LB024` Cycle Stop OFF
- `LB026` Fault Stopping All Aux 2
- `MASTER_READY` Master ON Confirmation

**52.**
```
(/PB351_002 OR LB025) AND LB024  ->  LB025
```
- `LB025` Fault Stopping All Aux 1
- `LB024` Cycle Stop OFF

**53.**
```
(LB025 OR LB026) AND PB351_002  ->  LB026
```
- `LB025` Fault Stopping All Aux 1
- `LB026` Fault Stopping All Aux 2

## P002_ServoMain / Fault


**1. +++++++++++++++++++++++++++++++++++
■ Function Performs abnormal processing in Md
■ Fault reset
+++++++++++++++++++++++++++++++++++**
```
MD_FLT_Reset400()
```

**2. +++++++++
■ STO alarm
+++++++++**
```
=()  ->  LB040[1]
```

**3.**
```
=()  ->  LB040[2]
```

**4.**
```
=()  ->  LB040[3]
```

**5.**
```
=()  ->  LB040[4]
```

**6.**
```
=()  ->  LB040[5]
```

**7.**
```
=()  ->  LB040[6]
```

**8.**
```
=()  ->  LB040[7]
```

**9.**
```
=()  ->  LB040[8]
```

**10.**
```
/LB040[1] AND /LB040[2] AND /LB040[3] AND /LB040[4]  ->  LB041
```
- `LB041` STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY

**11.**
```
/LB040[5] AND /LB040[6] AND /LB040[7] AND /LB040[8]  ->  LB042
```
- `LB042` STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY

**12.**
```
LB041 AND LB042  ->  LB043
```
- `LB041` STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY
- `LB042` STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY
- `LB043` STO NOT FAULT$tSTO NOT FAULT

**13. ++++++++++++++
■ Abnormal status
++++++++++++++**
```
GSB000 AND MOVE()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**14.**
```
GSB000 AND MC_ERR_STA.B[7]  ->  MC_MAJOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `MC_MAJOR_FAULT` MC ALL STOP FAULT LEVEL

**15.**
```
GSB000 AND MC_ERR_STA.B[6]  ->  MC_PARTIAL_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `MC_PARTIAL_FAULT` MC PARTIAL STOP FAULT LEVEL

**16.**
```
GSB000 AND MC_ERR_STA.B[5] AND LB043  ->  MC_MINOR_FAULT
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB043` STO NOT FAULT$tSTO NOT FAULT
- `MC_MINOR_FAULT` MC SLIGHT FAULT LEVEL

**17.**
```
GSB000 AND MC_ERR_STA.B[4]  ->  MC_OBSERVATION
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `MC_OBSERVATION` MC MONITOR INFORMATION LEVEL

**18.**
```
~ (PB_FAULT_RST OR LB010) AND /AUTO_RUN AND (MC_ERR_STA.B[7] OR MC_ERR_STA.B[6] OR MC_ERR_STA.B[5] OR MC_ERR_STA.B[4]) AND ResetMCError()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB010` 品番未設定

**19. +++++++++++++++
■ Emergency stop
+++++++++++++++**
```
(PWR_ON OR AL[15]) AND (MC_MAJOR_FAULT OR MC_PARTIAL_FAULT)  ->  AL[15]
```
- `PWR_ON` POWER ON DELAY
- `MC_MAJOR_FAULT` MC ALL STOP FAULT LEVEL
- `MC_PARTIAL_FAULT` MC PARTIAL STOP FAULT LEVEL

**20. +++++++++++++++++
■ Cycle stop
+++++++++++++++++**
```
(PWR_ON OR AL[110]) AND MC_MINOR_FAULT  ->  AL[110]
```
- `PWR_ON` POWER ON DELAY
- `MC_MINOR_FAULT` MC SLIGHT FAULT LEVEL

**21.**
```
~ (LB076 OR LB096 OR LB109 OR LB121 OR LB048 OR _MC_COM.PFaultLvl.Active OR _MC_COM.MFaultLvl.Active OR _MC_COM.Obsr.Active OR AL[111])  ->  AL[111]
```
- `LB076` SERVO LOCK ERROR$tSERVO LOCK ERROR
- `LB096` All Machine Home Pos Aux
- `LB109` Ind Spare
- `LB121` 品番検索完了
- `LB048` AXIS ALARM  OUTPUT$tAXIS ALARM  OUTPUT

**22. ++++++++++++++
■ Notice warning
++++++++++++++**
```
PWR_ON AND MC_OBSERVATION AND TON()  ->  AL[309]
```
- `PWR_ON` POWER ON DELAY
- `MC_OBSERVATION` MC MONITOR INFORMATION LEVEL
- `LT010` Delay

**23. +++++++++++++++++++++++++++++
■ Encoder battery abnormal converter
+++++++++++++++++++++++++++++**
```
~ GSB000 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**24.**
```
~ GSB000 AND (MOVE() OR MOVE() OR MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**25.**
```
_EC_MBXSlavTbl[1] AND EC_CoESDORead()
```

**26.**
```
_EC_MBXSlavTbl[2] AND EC_CoESDORead()
```

**27.**
```
_EC_MBXSlavTbl[3] AND EC_CoESDORead()
```

**28.**
```
_EC_MBXSlavTbl[4] AND EC_CoESDORead()
```

**29.**
```
_EC_MBXSlavTbl[5] AND EC_CoESDORead()
```

**30.**
```
_EC_MBXSlavTbl[6] AND EC_CoESDORead()
```

**31.**
```
_EC_MBXSlavTbl[7] AND EC_CoESDORead()
```

**32.**
```
_EC_MBXSlavTbl[8] AND EC_CoESDORead()
```

**33.**
```
=()  ->  AL[350]
```

**34.**
```
=()  ->  AL[351]
```

**35.**
```
=()  ->  AL[352]
```

**36.**
```
=()  ->  AL[353]
```

**37.**
```
=()  ->  AL[354]
```

**38.**
```
=()  ->  AL[355]
```

**39.**
```
=()  ->  AL[356]
```

**40.**
```
=()  ->  AL[357]
```

**41. ++++++++++++++++++
■ Servo axis alarm reset
++++++++++++++++++**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[1].Details.Idle AND MC_Reset()  ->  LB046[1]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**42.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[2].Details.Idle AND MC_Reset()  ->  LB046[2]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**43.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[3].Details.Idle AND MC_Reset()  ->  LB046[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**44.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[4].Details.Idle AND MC_Reset()  ->  LB046[4]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**45.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[5].Details.Idle AND MC_Reset()  ->  LB046[5]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**46.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[6].Details.Idle AND MC_Reset()  ->  LB046[6]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**47.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[7].Details.Idle AND MC_Reset()  ->  LB046[7]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**48.**
```
(PB_FAULT_RST OR LB009) AND <>() AND _MC_AX[8].Details.Idle AND MC_Reset()  ->  LB046[8]
```
- `PB_FAULT_RST` PB Fault Reset
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**49.**
```
~ (LB047[1] OR LB047[2] OR LB047[3] OR LB047[4] OR LB047[5] OR LB047[6] OR LB047[7] OR LB047[8])  ->  LB048
```
- `LB048` AXIS ALARM  OUTPUT$tAXIS ALARM  OUTPUT

**50. +++++++++++++++++++++++
■ Emergency stop integration
+++++++++++++++++++++++**
```
/AL[15]  ->  LB051
```
- `LB051` PH Workpiece Detect 2

**51. +++++++++++++++++
■ Cycle stop integration
+++++++++++++++++**
```
/AL[110] AND /AL[111]  ->  LB053
```
- `LB053` PH Floating Check Type 1

**52. ++++++++++++++++++++++++
■ Integrated warning and warning
++++++++++++++++++++++++**
```
/AL[309]  ->  LB055
```
- `LB055` PX Dandori Point 2^1

**53.**
```
/AL[350] AND /AL[351] AND /AL[352] AND /AL[353] AND /AL[354] AND /AL[355] AND /AL[356] AND /AL[357]  ->  LB056
```
- `LB056` PX Dandori Point 2^2

**54.**
```
LB056  ->  LB057
```
- `LB056` PX Dandori Point 2^2
- `LB057` PH Limit Pos Left Side

## P002_ServoMain / SV_Ready


**1. +++++++++++++++++++++
■ Each axis servo lock / unlock
+++++++++++++++++++++**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[1].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**2.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[1].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[1].Cfg.NodeAddress] AND MC_Power()  ->  LB060[1]
```
- `LB010` 品番未設定

**3.**
```
MASTER_READY AND (MOVE() AND TON() OR sdasd.Q AND MOVE())
```
- `MASTER_READY` Master ON Confirmation

**4.**
```
/MASTER_READY AND MOVE()
```
- `MASTER_READY` Master ON Confirmation

**5.**
```
MASTER_READY AND @move()
```
- `MASTER_READY` Master ON Confirmation

**6.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[2].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**7.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[2].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[2].Cfg.NodeAddress] AND MC_Power()  ->  LB060[2]
```
- `LB010` 品番未設定

**8.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[3].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**9.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[3].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[3].Cfg.NodeAddress] AND MC_Power()  ->  LB060[3]
```
- `LB010` 品番未設定

**10.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[4].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**11.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[4].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[4].Cfg.NodeAddress] AND MC_Power()  ->  LB060[4]
```
- `LB010` 品番未設定

**12.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[5].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**13.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[5].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[5].Cfg.NodeAddress] AND MC_Power()  ->  LB060[5]
```
- `LB010` 品番未設定

**14.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[6].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**15.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[6].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[6].Cfg.NodeAddress] AND MC_Power()  ->  LB060[6]
```
- `LB010` 品番未設定

**16.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[7].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**17.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[7].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[7].Cfg.NodeAddress] AND MC_Power()  ->  LB060[7]
```
- `LB010` 品番未設定

**18.**
```
(PB_FAULT_RST OR LB004) AND /AUTO_RUN AND <>() AND _MC_AX[8].Details.Idle AND MC_Reset()
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**19.**
```
LB010 AND _EC_PDSlavTbl[_MC_AX[8].Cfg.NodeAddress] AND /_EC_CommErrTbl[_MC_AX[8].Cfg.NodeAddress] AND MC_Power()  ->  LB060[8]
```
- `LB010` 品番未設定

**20.**
```
(LB060[1] AND LB060[2] AND LB060[3] AND LB060[4] AND LB060[5] AND LB060[6] AND LB060[7] AND LB060[8] OR /LB000[1] AND /LB000[2] AND /LB000[3] AND /LB000[4] AND /LB000[5] AND /LB000[6] AND /LB000[7] AND /LB000[8])  ->  LB064
```
- `LB064` AS Additional Chutter FG Open

**21.**
```
GSB000  ->  LB065
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB065` Alarm Reset (Battery Warning)

**22.**
```
LB064 AND LB065  ->  LB066
```
- `LB064` AS Additional Chutter FG Open
- `LB065` Alarm Reset (Battery Warning)
- `LB066` ALL AXIS SERVO LOCK$tALL AXIS SERVO LOCK

**23.**
```
(LB061[1] AND LB061[2] AND LB061[3] AND LB061[4] AND LB061[5] AND LB061[6] AND LB061[7] AND LB061[8] OR /LB000[1] AND /LB000[2] AND /LB000[3] AND /LB000[4] AND /LB000[5] AND /LB000[6] AND /LB000[7] AND /LB000[8])  ->  LB070
```
- `LB070` Safety Sensor WIP Confirm.

**24.**
```
GSB000  ->  LB071
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB071` PX Pokayoke Homing Left Arm

**25.**
```
LB070 AND LB071 AND _MC_COM.Status.RunMode  ->  LB072
```
- `LB070` Safety Sensor WIP Confirm.
- `LB071` PX Pokayoke Homing Left Arm
- `LB072` ALL AXIS SERVO AUTO_MODE$tALL AXIS SERVO AUTO_MODE

**26.**
```
~ (LB062[1] OR LB062[2] OR LB062[3] OR LB062[4] OR LB062[5] OR LB062[6] OR LB062[7] OR LB062[8])  ->  LB076
```
- `LB076` SERVO LOCK ERROR$tSERVO LOCK ERROR

**27. +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
[Axis stop command during single axis operation]
* The axis stop command during group operation should be provided in SV_Preparation of each PRG.
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++**
```
~ (AUTO_MODE AND /_MC_AX[1].Details.Idle AND /_MC_AX[1].Status.Coordinated OR IND_MODE AND /_MC_AX[2].Details.Idle AND /_MC_AX[2].Status.Coordinated)  ->  LB080[1], LB080[2], LB080[3], LB080[4], LB080[5], LB080[6], LB080[7], LB080[8]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode

**28.**
```
LB080[1] AND MC_Stop()
```

**29.**
```
LB080[2] AND MC_Stop()
```

**30.**
```
LB080[3] AND MC_Stop()
```

**31.**
```
LB080[4] AND MC_Stop()
```

**32.**
```
LB080[5] AND MC_Stop()
```

**33.**
```
LB080[6] AND MC_Stop()
```

**34.**
```
LB080[7] AND MC_Stop()
```

**35.**
```
LB080[8] AND MC_Stop()
```

## P002_ServoMain / TableData


**1. +++++++++++++++++++
■ Servo coordinate setting
+++++++++++++++++++**
```
GSB000 AND (>=())  ->  PL364_005
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2. Data Read for IAI SERVO P&P UNIT Tacble (364)**
```
=()
```

**3.**
```
<>() AND (MOVE() OR MOVE())
```

**4. Data setting Enable Conf**
```
/AUTO_RUN AND (GSB009 OR /GSB009) AND TEACH_ON  ->  PL364_004
```
- `AUTO_RUN` Auto Running
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included

**5. ■ Coordinate data storage**
```
PB364_003 AND PL364_004  ->  LB1011
```
- `LB1011` Running GD1B Type

**6.**
```
LB1011 AND =()  ->  PL364_003
```
- `LB1011` Running GD1B Type

**7. LS Combination**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

## P002_ServoMain / SV_Adjust


**1. +++++++++++++++++++++++
■ Each axis overriding setting
+++++++++++++++++++++++**
```
GSB000 AND MC_SetOverride()  ->  LB084[1]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
GSB000 AND MC_SetOverride()  ->  LB084[2]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**3.**
```
GSB000 AND MC_SetOverride()  ->  LB084[3]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**4.**
```
GSB000 AND MC_SetOverride()  ->  LB084[4]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**5.**
```
GSB000 AND MC_SetOverride()  ->  LB084[5]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**6.**
```
GSB000 AND MC_SetOverride()  ->  LB084[6]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**7.**
```
GSB000 AND MC_SetOverride()  ->  LB084[7]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**8.**
```
GSB000 AND MC_SetOverride()  ->  LB084[8]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**9.**
```
(LB084[1] AND LB084[2] AND LB084[3] AND LB084[4] AND LB084[5] AND LB084[6] AND LB084[7] AND LB084[8] OR /LB000[1] AND /LB000[2] AND /LB000[3] AND /LB000[4] AND /LB000[5] AND /LB000[6] AND /LB000[7] AND /LB000[8])  ->  LB090
```
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件

**10.**
```
GSB000  ->  LB091
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB091` All Machine Home Pos Aux 2

**11.**
```
PB353_000 AND LB090 AND LB091  ->  LB092
```
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件
- `LB091` All Machine Home Pos Aux 2
- `LB092` All Machine Home Pos Aux 3

**12.**
```
~ (LB085[1] OR LB085[2] OR LB085[3] OR LB085[4] OR LB085[5] OR LB085[6] OR LB085[7] OR LB085[8])  ->  LB096
```
- `LB096` All Machine Home Pos Aux

**13. ++++++++++++++++++++++
■ Calculation for each axis JOG
++++++++++++++++++++++**
```
~ GSB000 AND (*() AND /() OR *() AND /() OR *() AND /() OR *() AND /() OR *() AND /() OR *() AND /() OR *() AND /() OR *() AND /())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**14. +++++++++++++++++
■ Each axis JOG setting
+++++++++++++++++**
```
~ LB012 AND (PB354_001 AND =() AND /CH0002_08 OR PB354_002 AND =() AND /CH0002_07)  ->  LB100[LD010], LB101[LD010]
```
- `LB012` Emergency Stopping All Aux 3
- `CH0002_08` PH LIMIT POS RIGH SIDE [IOBus://unit#4/Input Bit 16 bits/Input Bit 08]
- `CH0002_07` PH LIMIT POS LEFT SIDE [IOBus://unit#4/Input Bit 16 bits/Input Bit 07]

**15.**
```
LB100[1] AND MC_MoveJog()  ->  LB104[1]
```

**16.**
```
LB100[2] AND MC_MoveJog()  ->  LB104[2]
```

**17.**
```
LB100[3] AND MC_MoveJog()  ->  LB104[3]
```

**18.**
```
LB100[4] AND MC_MoveJog()  ->  LB104[4]
```

**19.**
```
LB100[5] AND MC_MoveJog()  ->  LB104[5]
```

**20.**
```
LB100[6] AND MC_MoveJog()  ->  LB104[6]
```

**21.**
```
LB100[7] AND MC_MoveJog()  ->  LB104[7]
```

**22.**
```
LB100[8] AND MC_MoveJog()  ->  LB104[8]
```

**23.**
```
~ (LB104[1] OR LB104[2] OR LB104[3] OR LB104[4] OR LB104[5] OR LB104[6] OR LB104[7] OR LB104[8])  ->  LB108
```
- `LB108` Ind Spare

**24.**
```
~ (LB105[1] OR LB105[2] OR LB105[3] OR LB105[4] OR LB105[5] OR LB105[6] OR LB105[7] OR LB105[8])  ->  LB109
```
- `LB109` Ind Spare

**25. ++++++++++++++++++++++++
■ Origin set parameter setting
++++++++++++++++++++++++**
```
GSB000 AND (MOVE() OR MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**26.**
```
PB352_000 AND TON()  ->  LB114
```
- `LT020` Delay Air Source FG Store Drop

**27.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[1]
```

**28.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[2]
```

**29.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[3]
```

**30.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[4]
```

**31.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[5]
```

**32.**
```
GSB001 AND =() AND LB114 AND MC_HomeWithParameter()  ->  LB118[6]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**33.**
```
GSB001 AND =() AND LB114 AND MC_HomeWithParameter()  ->  LB118[7]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**34.**
```
=() AND LB114 AND MC_HomeWithParameter()  ->  LB118[8]
```

**35.**
```
~ (LB116[1] OR LB116[2] OR LB116[3] OR LB116[4] OR LB116[5] OR LB116[6] OR LB116[7] OR LB116[8])  ->  LB120
```
- `LB120` 検索品番有

**36.**
```
~ (LB117[1] OR LB117[2] OR LB117[3] OR LB117[4] OR LB117[5] OR LB117[6] OR LB117[7] OR LB117[8])  ->  LB121
```
- `LB121` 品番検索完了

**37.**
```
~ (LB118[1] OR LB118[2] OR LB118[3] OR LB118[4] OR LB118[5] OR LB118[6] OR LB118[7] OR LB118[8])  ->  LB122
```
- `LB122` 検索品番再開始

**38. +++++++++++++++++++++++++
■ Release the brakes on each axis

Axis 1 Brake Release 
+++++++++++++++++++++++++**
```
(PB355_000 OR LB126[1]) AND =() AND LB024 AND /LB128[1]  ->  LB126[1]
```
- `LB024` Cycle Stop OFF

**39.**
```
(/PB355_000 OR LB127[1]) AND =() AND LB126[1]  ->  LB127[1]
```

**40.**
```
(LB127[1] OR LB128[1]) AND =() AND PB355_000  ->  LB128[1]
```

**41. +++++++++++++++
Axis 2 Brake Release
+++++++++++++++
**
```
(PB355_000 OR LB126[2]) AND =() AND LB024 AND /LB128[2]  ->  LB126[2]
```
- `LB024` Cycle Stop OFF

**42.**
```
(/PB355_000 OR LB127[2]) AND =() AND LB126[2]  ->  LB127[2]
```

**43.**
```
(LB127[2] OR LB128[2]) AND =() AND PB355_000  ->  LB128[2]
```

**44. +++++++++++++++
Axis 3 Brake Release
+++++++++++++++**
```
(PB355_000 OR LB126[3]) AND =() AND LB024 AND /LB128[3]  ->  LB126[3]
```
- `LB024` Cycle Stop OFF

**45.**
```
(/PB355_000 OR LB127[3]) AND =() AND LB126[3]  ->  LB127[3]
```

**46.**
```
(LB127[3] OR LB128[3]) AND =() AND PB355_000  ->  LB128[3]
```

**47. ++++++++++++++++
Axis 4 Brake Release
++++++++++++++++**
```
(PB355_000 OR LB126[4]) AND =() AND LB024 AND /LB128[4]  ->  LB126[4]
```
- `LB024` Cycle Stop OFF

**48.**
```
(/PB355_000 OR LB127[4]) AND =() AND LB126[4]  ->  LB127[4]
```

**49.**
```
(LB127[4] OR LB128[4]) AND =() AND PB355_000  ->  LB128[4]
```

**50. ++++++++++++++++
Axis 5 Brake Release
++++++++++++++++**
```
(PB355_000 OR LB126[5]) AND =() AND LB024 AND /LB128[5]  ->  LB126[5]
```
- `LB024` Cycle Stop OFF

**51.**
```
(/PB355_000 OR LB127[5]) AND =() AND LB126[5]  ->  LB127[5]
```

**52.**
```
(LB127[5] OR LB128[5]) AND =() AND PB355_000  ->  LB128[5]
```

**53. +++++++++++++++
6-axis brake release
+++++++++++++++**
```
(PB355_000 OR LB126[6]) AND =() AND LB024 AND /LB128[6]  ->  LB126[6]
```
- `LB024` Cycle Stop OFF

**54.**
```
(/PB355_000 OR LB127[6]) AND =() AND LB126[6]  ->  LB127[6]
```

**55.**
```
(LB127[6] OR LB128[6]) AND =() AND PB355_000  ->  LB128[6]
```

**56. +++++++++++++++
7-axis brake release
+++++++++++++++**
```
(PB355_000 OR LB126[7]) AND =() AND LB024 AND /LB128[7]  ->  LB126[7]
```
- `LB024` Cycle Stop OFF

**57.**
```
(/PB355_000 OR LB127[7]) AND =() AND LB126[7]  ->  LB127[7]
```

**58.**
```
(LB127[7] OR LB128[7]) AND =() AND PB355_000  ->  LB128[7]
```

**59. +++++++++++++++
8-axis brake release
+++++++++++++++**
```
(PB355_000 OR LB126[8]) AND =() AND LB024 AND /LB128[8]  ->  LB126[8]
```
- `LB024` Cycle Stop OFF

**60.**
```
(/PB355_000 OR LB127[8]) AND =() AND LB126[8]  ->  LB127[8]
```

**61.**
```
(LB127[8] OR LB128[8]) AND =() AND PB355_000  ->  LB128[8]
```

**62.**
```
~ (LB126[1] AND =() OR LB126[2] AND =() OR LB126[3] AND =() OR LB126[4] AND =() OR LB126[5] AND =() OR LB126[6] AND =() OR LB126[7] AND =() OR LB126[8] AND =())  ->  LB130
```
- `LB130` Assy品番抽出正常終了

**63.**
```
~ (LB126[1] OR LB126[2] OR LB126[3] OR LB126[4] OR LB126[5] OR LB126[6] OR LB126[7] OR LB126[8])  ->  LB131
```
- `LB131` Assy品番抽出異常終了

**64.**
```
/GSB001 AND MC()
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**65. +++++++++++++++++++
■ Servo coordinate setting
+++++++++++++++++++**
```
(=() OR =())  ->  LB140
```
- `LB140` SET-UP DATA EDIT PERMISSION

**66.**
```
LB140 AND MOVE()
```
- `LB140` SET-UP DATA EDIT PERMISSION

**67.**
```
GSB000 AND (-() OR UINT_TO_USINT())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**68.**
```
TestABit()  ->  LB142
```
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**69. +++++++++++++++++++
Coordinate / speed writing
+++++++++++++++++++**
```
(PB356_001 OR GSB010 AND PB364_003) AND /MASTER_READY  ->  LB144
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `MASTER_READY` Master ON Confirmation
- `LB144` COORDINATE ・ SPEED  WRITE START

**70.**
```
~ LB144 AND (MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START

**71.**
```
~ LB144 AND (=() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE() OR MOVE()) AND MOVE()
```
- `LB144` COORDINATE ・ SPEED  WRITE START

**72.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**73.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**74.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**75.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**76.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**77.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**78.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**79.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**80.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**81.**
```
~ LB144 AND LB142 AND (=() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE() OR =() AND MOVE())
```
- `LB144` COORDINATE ・ SPEED  WRITE START
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**82. ++++++++++++++++++
Display data update
++++++++++++++++++**
```
<>()  ->  LB146
```
- `LB146` SET-UP DATA DELETE  PB OFF CONFIRMATION

**83.**
```
LB146 AND MOVE()
```
- `LB146` SET-UP DATA DELETE  PB OFF CONFIRMATION

**84.**
```
MCR()
```

## P002_ServoMain / HMI_Out


**1. +++++++++++++
■ PL display
+++++++++++++**
```
LB012  ->  PL351_000
```
- `LB012` Emergency Stopping All Aux 3
- `PL351_000` PL Servo Adjustment ON

**2.**
```
LB020  ->  PL351_001
```
- `LB020` MD異常でない
- `PL351_001` PL Adjustment ON

**3.**
```
LB024  ->  PL351_002
```
- `LB024` Cycle Stop OFF
- `PL351_002` PL Brake Reset ON

**4.**
```
LB120  ->  PL352_000
```
- `LB120` 検索品番有
- `PL352_000` PL Origin Set

**5.**
```
LB092  ->  PL353_000
```
- `LB092` All Machine Home Pos Aux 3
- `PL353_000` PL Override Set

**6.**
```
LB016  ->  PL354_000
```
- `LB016` Auto Stopping All Aux 2
- `PL354_000` PL Jog Adjustment ON

**7.**
```
LB130  ->  PL355_000
```
- `LB130` Assy品番抽出正常終了
- `PL355_000` PL Brake Reset

**8.**
```
LB131  ->  PL355_001
```
- `LB131` Assy品番抽出異常終了

**9.**
```
LB144  ->  PL356_001
```
- `LB144` COORDINATE ・ SPEED  WRITE START

**10.**
```
/MASTER_READY  ->  PL356_002
```
- `MASTER_READY` Master ON Confirmation

**11.**
```
LB142  ->  PL094[3]
```
- `LB142` SET-UP DATA EDIT PERMISSION OFF

**12.**
```
GSB000 AND (PL094[3] OR /PL094[3])  ->  PL356_004, PL356_003
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**13.**
```
GSB000 AND (GSB000 AND *() AND GSB000 AND LREAL_TO_DINT() OR <>() AND MOVE() AND *() AND LREAL_TO_DINT())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

## P002_ServoMain / MD_Out


**1.**
```
LB051  ->  GB002_001
```
- `LB051` PH Workpiece Detect 2
- `GB002_001` MOTION CONTROLLER  EMERGENCY STOP OFF

**2.**
```
LB053  ->  GB002_003
```
- `LB053` PH Floating Check Type 1
- `GB002_003` MOTION CONTROLLER  CYCLE STOP OFF

**3.**
```
LB055  ->  GB002_005
```
- `LB055` PX Dandori Point 2^1
- `GB002_005` MOTION CONTROLLER  NOTICE WARNING OFF

**4.**
```
LB057  ->  GB002_006
```
- `LB057` PH Limit Pos Left Side
- `GB002_006` SERVO AMPLIFIER BATTERY REPLACE OFF

**5.**
```
LB189  ->  GB002_010
```
- `GB002_010` MOTION CONTROLLER  NOT FAULT

**6.**
```
LB066 AND LB072  ->  GB002_011
```
- `LB066` ALL AXIS SERVO LOCK$tALL AXIS SERVO LOCK
- `LB072` ALL AXIS SERVO AUTO_MODE$tALL AXIS SERVO AUTO_MODE
- `GB002_011` MOTION CONTROLLER  ALL AXIS SERVO ON

**7.**
```
/LB012 AND /LB020  ->  GB002_012
```
- `LB012` Emergency Stopping All Aux 3
- `LB020` MD異常でない
- `GB002_012` MOTION CONTROLLER  NOT SERVO ADJUSTMENT

**8.**
```
LB051 AND LB053 AND LB066 AND /PL351_000 AND /PL354_000  ->  ATS_XAxis_Ready
```
- `LB051` PH Workpiece Detect 2
- `LB053` PH Floating Check Type 1
- `LB066` ALL AXIS SERVO LOCK$tALL AXIS SERVO LOCK
- `PL351_000` PL Servo Adjustment ON
- `PL354_000` PL Jog Adjustment ON
- `ATS_XAxis_Ready` ATS X Axis Servo Ready

**9. ■ﾌﾞﾚｰｷ解除ﾘﾚｰﾃﾞﾊﾞｲｽ出力回路**
```
LB126[1]  ->  SM1_BKIR
```
- `SM1_BKIR` 1 AXIS BRAKE RESET

**10.**
```
(LB126[2] OR TESTBRAKE)  ->  SM2_BKIR
```
- `SM2_BKIR` 2 AXIS BRAKE RESET

**11.**
```
LB126[3]  ->  SM3_BKIR
```
- `SM3_BKIR` 3 AXIS BRAKE RESET

**12.**
```
LB126[4]  ->  SM4_BKIR
```
- `SM4_BKIR` 4 AXIS BRAKE RESET

**13.**
```
LB126[5]  ->  SM5_BKIR
```
- `SM5_BKIR` 5 AXIS BRAKE RESET

**14.**
```
LB126[6]  ->  SM6_BKIR
```
- `SM6_BKIR` 6 AXIS BRAKE RESET

**15.**
```
LB126[7]  ->  SM7_BKIR
```
- `SM7_BKIR` 7 AXIS BRAKE RESET

**16.**
```
LB126[8]  ->  SM8_BKIR
```
- `SM8_BKIR` 8 AXIS BRAKE RESET

**17.**
```
LB126[9]  ->  SM9_BKIR
```
- `SM9_BKIR` 9 AXIS BRAKE RESET

**18.**
```
LB126[10]  ->  SM10_BKIR
```
- `SM10_BKIR` 10 AXIS BRAKE RESET

**19.**
```
LB126[11]  ->  SM11_BKIR
```
- `SM11_BKIR` 11 AXIS BRAKE RESET

**20.**
```
LB126[12]  ->  SM12_BKIR
```
- `SM12_BKIR` 12 AXIS BRAKE RESET

**21.**
```
LB126[13]  ->  SM13_BKIR
```
- `SM13_BKIR` 13 AXIS BRAKE RESET

**22.**
```
LB126[14]  ->  SM14_BKIR
```
- `SM14_BKIR` 14 AXIS BRAKE RESET

**23.**
```
LB126[15]  ->  SM15_BKIR
```
- `SM15_BKIR` 15 AXIS BRAKE RESET

---

# PROGRAM P003_ServoIAI


## P003_ServoIAI / Initial


**1. Axis Table                                           Axis IAI
SM2 Right Arm Rotary Unit     =       Axis no 0
SM3 Left Arm Rotary Unit       =       Axis no 1
SM4 Right Arm Gripper Unit   =       Axis no 2
SM5 Left Arm Gripper Unit     =       Axis no 3
SM6 Right Arm Z Axis Unit     =       Axis no 4
SM7 Left Arm Z Axis Unit       =       Axis no 5
SM8 Right Arm Y Axis Unit     =       Axis no 6
SM9 Left Arm Y Axis Unit       =       Axis no 7
SM10 WIP Transfer Unit         =       Axis no 8**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
=()
```

**3.**
```
=()
```

**4.**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

## P003_ServoIAI / TableData_PPUnit


**1. ■ Reading setting data when the coordinate setting screen is displayed
Table Data for PP Unit 
===========================



**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2. Data Read for IAI SERVO P&P UNIT Tacble (362)**
```
=()
```

**3.**
```
~ <>() AND (MOVE() OR MOVE() OR MOVE() OR MOVE())
```

**4. Data setting Enable Conf**
```
/AUTO_RUN AND (GSB009 OR /GSB009) AND TEACH_ON  ->  PL362_001
```
- `AUTO_RUN` Auto Running
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included

**5. ■ Coordinate data storage**
```
PB362_000 AND PL362_001  ->  LB1011
```
- `LB1011` Running GD1B Type

**6.**
```
LB1011 AND =()  ->  PL362_000
```
- `LB1011` Running GD1B Type

**7. LS Combination**
```
/GSB010 AND GSB000
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**8.**
```
GSB010
```
- `GSB010` FOR MACHINE ADJUST_SPARE1

**9.**
```
/GSB010 AND GSB000
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**10.**
```
GSB010
```
- `GSB010` FOR MACHINE ADJUST_SPARE1

## P003_ServoIAI / TableData_WIPUnit


**1. ■ Reading setting data when the coordinate setting screen is displayed
Table Data for WIP Unit 
===========================



**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**3. Data Read for IAI SERVO WIP UNIT Table ( Screen 363)**
```
=()
```

**4.**
```
<>() AND MOVE()
```

**5. Data setting Enable Conf**
```
/AUTO_RUN AND (GSB009 OR /GSB009) AND TEACH_ON  ->  PL363_004
```
- `AUTO_RUN` Auto Running
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included

**6. ■ Coordinate data storage**
```
PB363_005 AND PL363_004  ->  LB1011B
```
- `LB1011B` Data Storage Save

**7.**
```
/GSB010 AND LB1011B AND =()  ->  PL363_005
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB1011B` Data Storage Save

**8.**
```
GSB010 AND LB1011B AND =()  ->  PL363_005
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB1011B` Data Storage Save

**9. LS Combination**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

## P003_ServoIAI / Adjust


**1. JOG Adjuster for PP Unit


**
```
=()  ->  LB3000
```
- `LB3000` Flash 2 Ready to Take In : ATS No Need to Move

**2.**
```
LB3000  ->  LB3001
```
- `LB3000` Flash 2 Ready to Take In : ATS No Need to Move
- `LB3001` Flash 2 Not Ready to Take In : ATS Move to Parking Area

**3.**
```
LB3001 AND (GSB009 OR /GSB009) AND TEACH_ON  ->  LB3010
```
- `LB3001` Flash 2 Not Ready to Take In : ATS Move to Parking Area
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included
- `LB3010` Flash 1 Ready to Take In : ATS No Need to Move

**4.**
```
~ LB3000 AND (PB361_002 AND LB3010 OR LB3011 OR /PB361_002 AND LB3011 OR LB3012 OR LB3012 AND PB361_002 OR LB3013) AND /LB3013  ->  LB3011, LB3012, LB3013
```
- `LB3000` Flash 2 Ready to Take In : ATS No Need to Move
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3010` Flash 1 Ready to Take In : ATS No Need to Move
- `LB3013` relieve
- `LB3012` Check PBoff

**5. ■ Start JOG**
```
PB361_000 AND /PB361_001 AND LB3011  ->  LB3110
```
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3110` JOG +

**6.**
```
PB361_001 AND /PB361_000 AND LB3011  ->  LB3111
```
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3111` JOG -

**7. JOG Adjuster for WIP


**
```
=()  ->  LB3300
```
- `LB3300` Screen In IAI Adjust_WIP

**8.**
```
LB3300  ->  LB3301
```
- `LB3300` Screen In IAI Adjust_WIP
- `LB3301` Conditions for JOG adjustment enable switching

**9.**
```
LB3301 AND (GSB009 OR /GSB009) AND TEACH_ON  ->  LB3310
```
- `LB3301` Conditions for JOG adjustment enable switching
- `GSB009` Modify Ghani After Moving to Line
- `TEACH_ON` Teaching included
- `LB3310` JOG adjustment valid condition

**10.**
```
~ LB3300 AND (PB363_002 AND LB3310 OR LB3311 OR /PB363_002 AND LB3311 OR LB3312 OR LB3312 AND PB363_002 OR LB3313) AND /LB3313  ->  LB3311, LB3312, LB3313
```
- `LB3300` Screen In IAI Adjust_WIP
- `LB3311` JOG adjustment enabled
- `LB3310` JOG adjustment valid condition
- `LB3313` relieve
- `LB3312` Check PBoff

**11. ■ Start JOG**
```
PB363_000 AND /PB363_001 AND LB3311  ->  LB3410
```
- `LB3311` JOG adjustment enabled
- `LB3410` JOG +

**12.**
```
PB363_001 AND /PB363_000 AND LB3311  ->  LB3411
```
- `LB3311` JOG adjustment enabled
- `LB3411` JOG -

## P003_ServoIAI / HMI_Out


**1. IAI SERVO P&P UNIT Screen 362**
```
GSB001  ->  PL362_002
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**2. IAI P&P UNIT JOG Screen 361

PP Position No. =  1: Left, 2 Right
Axis No.             =  1 :Y Axis, 2: Z Axis, 3: Rotate  4: Gripper

Axis Table                                           Axis IAI
SM2 Right Arm Rotary Unit     =       Axis no 0
SM3 Left Arm Rotary Unit       =       Axis no 1
SM4 Right Arm Gripper Unit   =       Axis no 2
SM5 Left Arm Gripper Unit     =       Axis no 3
SM6 Right Arm Z Axis Unit     =       Axis no 4
SM7 Left Arm Z Axis Unit       =       Axis no 5
SM8 Right Arm Y Axis Unit     =       Axis no 6
SM9 Left Arm Y Axis Unit       =       Axis no 7
SM10 WIP Transfer Unit         =       Axis no 8**
```
LB3011  ->  PL361_002
```
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area

**3.**
```
LB3311  ->  PL363_002
```
- `LB3311` JOG adjustment enabled

**4.**
```
~ (GSB000 AND =() AND =() AND RCON_Out_Axis0_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis1_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis2_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis3_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis4_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis5_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis6_Control_Signal.B[5] OR GSB000 AND =() AND =() AND RCON_Out_Axis7_Control_Signal.B[5])  ->  PL361_003
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**5.**
```
GSB000 AND RCON_Out_Axis8_Control_Signal.B[5]  ->  PL363_003
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**6.**
```
~ (GSB000 AND =() AND =() AND RCON_Out_Axis0_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis1_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis2_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis3_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis4_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis5_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis6_Control_Signal.B[15] OR GSB000 AND =() AND =() AND RCON_Out_Axis7_Control_Signal.B[15])  ->  PL361_004
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

## P003_ServoIAI / Station_Output


**1. PP Unit**
```
LB3111  ->  GB003_010
```
- `LB3111` JOG -
- `GB003_010` IAI JOG- Operation

**2.**
```
LB3110  ->  GB003_011
```
- `LB3110` JOG +
- `GB003_011` IAI JOG+ Operation

**3.**
```
LB3115  ->  GB003_012
```
- `LB3115` Inching Mode On
- `GB003_012` Inching Mode On

**4. WIP Unit**
```
(LB3311 AND /GSB000 OR GSB000 AND LB3411)  ->  GB003_020
```
- `LB3311` JOG adjustment enabled
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB3411` JOG -
- `GB003_020` IAI JOG- Operation

**5.**
```
(LB3310 AND /GSB000 OR GSB000 AND LB3410)  ->  GB003_021
```
- `LB3310` JOG adjustment valid condition
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB3410` JOG +
- `GB003_021` IAI JOG+ Operation

**6.**
```
LB3315  ->  GB003_022
```
- `LB3315` Inching Mode On
- `GB003_022` Inching Mode On

---

# PROGRAM P011_WIP_Transfer


## P011_WIP_Transfer / StationInput


**1. Network from Air Blow MC
======================**
```
CP2E_TO_NX_Word[1]  ->  LB1000
```
- `LB1000` Air Blow Process Start

**2.**
```
CP2E_TO_NX_Word[2]  ->  LB1001
```
- `LB1001` Air Blow FG Take Out Compl. Memory

**3.**
```
CP2E_TO_NX_Word[3]  ->  LB1002
```
- `LB1002` PH Air Blow Product Confirm.

**4.**
```
CP2E_TO_NX_Word[4]  ->  LB1003
```
- `LB1003` Air Blow Finish Process Memory

**5.**
```
CP2E_TO_NX_Word[8]  ->  LB1007
```
- `LB1007` Air Blow MC Ready

**6.**
```
CP2E_TO_NX_Word[15]  ->  LB1014
```
- `LB1014` Warning : Air Blow Double Process

**7.**
```
CP2E_TO_NX_Word[16]  ->  LB1015
```
- `LB1015` Warning : Forget to NAGARA

## P011_WIP_Transfer / DeviceInput


**1. WIP Transfer
==============**
```
CH0002_00  ->  LB050
```
- `CH0002_00` PH WORKPIECE 1 DETECT [IOBus://unit#4/Input Bit 16 bits/Input Bit 00]
- `LB050` PH Workpiece Detect 1

**2.**
```
CH0002_01  ->  LB051
```
- `CH0002_01` PH WORKPIECE DETECT 2 [IOBus://unit#4/Input Bit 16 bits/Input Bit 01]
- `LB051` PH Workpiece Detect 2

**3.**
```
CH0000_12  ->  LB052
```
- `CH0000_12`  [IOBus://unit#2/Input Bit 16 bits/Input Bit 12]
- `LB052` Nagara Switch

**4.**
```
CH0002_02  ->  LB053
```
- `CH0002_02` PH FLOATING CHECK TYPE 1 [IOBus://unit#4/Input Bit 16 bits/Input Bit 02]
- `LB053` PH Floating Check Type 1

**5.**
```
CH0002_03  ->  LB054
```
- `CH0002_03` PH FLOATING CHECK TYPE 2 [IOBus://unit#4/Input Bit 16 bits/Input Bit 03]
- `LB054` PH Floating Check Type 2

**6. Shutter FG
===============**
```
CH0006_03 AND /CH0006_02  ->  LB060
```
- `CH0006_03` AS  Cover FG Open [IOBus://unit#8/Input Bit 16 bits/Input Bit 03]
- `CH0006_02` AS Cover FG Close [IOBus://unit#8/Input Bit 16 bits/Input Bit 02]
- `LB060` LS Shutter FG Open

**7.**
```
CH0006_02 AND /CH0006_03  ->  LB061
```
- `CH0006_02` AS Cover FG Close [IOBus://unit#8/Input Bit 16 bits/Input Bit 02]
- `CH0006_03` AS  Cover FG Open [IOBus://unit#8/Input Bit 16 bits/Input Bit 03]
- `LB061` LS Shutter FG Close

**8.**
```
/CH0006_04  ->  LB062
```
- `CH0006_04` FG Shutter Area Sensor [IOBus://unit#8/Input Bit 16 bits/Input Bit 04]
- `LB062` FG Shutter Area Sensor

**9.**
```
CH0006_12 AND /CH0006_13  ->  LB063
```
- `CH0006_12` AS Additional Chutter FG Close [IOBus://unit#8/Input Bit 16 bits/Input Bit 12]
- `CH0006_13` AS Additional Chutter FG Open [IOBus://unit#8/Input Bit 16 bits/Input Bit 13]
- `LB063` AS Additional Chutter FG Close

**10.**
```
CH0006_13 AND /CH0006_12  ->  LB064
```
- `CH0006_13` AS Additional Chutter FG Open [IOBus://unit#8/Input Bit 16 bits/Input Bit 13]
- `CH0006_12` AS Additional Chutter FG Close [IOBus://unit#8/Input Bit 16 bits/Input Bit 12]
- `LB064` AS Additional Chutter FG Open

**11. Additional Safety Sensor or WIP Area**
```
CH0007_15  ->  LB070
```
- `CH0007_15` Saftey Area WIP Confirm. [IOBus://unit#9/Input Bit 16 bits/Input Bit 15]
- `LB070` Safety Sensor WIP Confirm.

**12.**
```
~ (PPWIPAxis.Post[10].LSComb.LS OR LB070) AND (LB050 AND /LB051 AND Running_Type1 OR /LB050 OR GSB000 OR LB051 AND /LB050 AND Running_Type2 OR /LB051 OR GSB000)  ->  LB079
```
- `LB050` PH Workpiece Detect 1
- `LB051` PH Workpiece Detect 2
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB070` Safety Sensor WIP Confirm.
- `LB079` Safety Area on WIP Confirmation

**13.**
```
(PPWIPAxis.Post[10].LSComb.LS AND LB061 AND LB063 OR PPWIPAxis.Post[2].LSComb.LS AND LB1001 AND LB060 AND LB1001 AND FGChutterBoxChanging AND LB064)  ->  LB099
```
- `LB061` LS Shutter FG Close
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB060` LS Shutter FG Open
- `LB063` AS Additional Chutter FG Close
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing
- `LB064` AS Additional Chutter FG Open
- `LB099` WIP Transfer Unit Home Pos.

## P011_WIP_Transfer / HMI_Input


**1.**
```
PB004_01S  ->  LB101
```
- `LB101` 品番検索開始(開始位置0)

**2.**
```
PB004_01R  ->  LB102
```
- `LB102` 品番途中検索開始(開始位置0以外)

**3.**
```
PB411_01M  ->  LB103
```
- `LB103` 品番設定ﾁｪｯｸOK

**4.**
```
PB411_01R  ->  LB104
```
- `LB104` 品番設定ﾁｪｯｸNG

**5.**
```
PB411_02M  ->  LB105
```
- `LB105` Ind Spare

**6.**
```
PB411_02R  ->  LB106
```
- `LB106` Ind Spare

**7.**
```
PB411_03M  ->  LB107
```
- `LB107` Ind Spare

**8.**
```
PB411_03R  ->  LB108
```
- `LB108` Ind Spare

**9.**
```
PB411_04M  ->  LB109
```
- `LB109` Ind Spare

**10.**
```
PB411_04R  ->  LB110
```
- `LB110` 検索品番有

**11.**
```
PB412_01M  ->  LB130
```
- `PB412_01M` PB Ind. Shutter FG Cover Open
- `LB130` Assy品番抽出正常終了

**12.**
```
PB412_01R  ->  LB131
```
- `PB412_01R` PB Ind. Shutter FG Cover Close
- `LB131` Assy品番抽出異常終了

**13.**
```
PB412_02M  ->  LB132
```
- `PB412_02M` PB Ind. Add Shutter FG Cover Open
- `LB132` PB Ind. Add Chutter FG Open

**14.**
```
PB412_02R  ->  LB133
```
- `PB412_02R` PB Ind. Add Shutter FG Cover Close
- `LB133` PB Ind. Add Shutter FG Cover Close

## P011_WIP_Transfer / Timers


**1.**
```
LB050 AND TON()  ->  LB150
```
- `LB050` PH Workpiece Detect 1
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**2.**
```
/LB050 AND TON()  ->  LB151
```
- `LB050` PH Workpiece Detect 1
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]

**3.**
```
LB051 AND TON()  ->  LB152
```
- `LB051` PH Workpiece Detect 2
- `LB152` PH Workpiece 2 Confirm. [GD1B]

**4.**
```
/LB051 AND TON()  ->  LB153
```
- `LB051` PH Workpiece Detect 2
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]

**5.**
```
LB053 AND TON()  ->  LB154
```
- `LB053` PH Floating Check Type 1
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]

**6.**
```
/LB053 AND TON()  ->  LB155
```
- `LB053` PH Floating Check Type 1
- `LB155` PH Tipe 1 No Floating Confirm. [Abilcore]

**7.**
```
LB054 AND TON()  ->  LB156
```
- `LB054` PH Floating Check Type 2
- `LB156` PH Tipe 2 Floating Confirm. [GD1B]

**8.**
```
/LB054 AND TON()  ->  LB157
```
- `LB054` PH Floating Check Type 2
- `LB157` PH Tipe 2 No Floating Confirm. [GD1B]

**9.**
```
LB062 AND TON()  ->  LB158
```
- `LB062` FG Shutter Area Sensor
- `LB158` FG Shutter Area Sensor ON Confirm.

**10.**
```
/LB062 AND TON()  ->  LB159
```
- `LB062` FG Shutter Area Sensor
- `LB159` FG Shutter Area Sensor OFF Confirm.

## P011_WIP_Transfer / Fault


**1. FAULT RESET**
```
MD_FLT_Reset400()
```

**2. EMERGENCY STOP FAULT
=================**
```
~ (LB610 OR LB611 OR AL[16]) AND LB062  ->  AL[16]
```
- `LB610` SOL FG Shutter Open
- `LB611` SOL FG Shutter Close
- `LB062` FG Shutter Area Sensor

**3.**
```
(/PB_EMG_STOP_SHUTTE OR AL[17])  ->  AL[17]
```
- `PB_EMG_STOP_SHUTTE` PB Emergency Stop Shutte Pokayoke

**4.**
```
(MSTR_RDY_SHUTTE OR AL[18]) AND /AIR_SOURCE_CONF_SHUTTE AND (LT020.Q OR TON())  ->  AL[18]
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `AIR_SOURCE_CONF_SHUTTE` Air Source Confirm Shutte Pokayoke
- `LT020` Delay Air Source FG Store Drop

**5.**
```
~ (MSTR_RDY_SHUTTE AND /AIR_SOURCE_CONF_SHUTTE AND LT021.Q OR /MSTR_RDY_SHUTTE AND AIR_SOURCE_CONF_SHUTTE AND TON() OR AL[19])  ->  AL[19]
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `AIR_SOURCE_CONF_SHUTTE` Air Source Confirm Shutte Pokayoke
- `LT021` Delay Air Source FG Store Error

**6.**
```
(/LB079 OR AL[20]) AND /LB070  ->  AL[20]
```
- `LB079` Safety Area on WIP Confirmation
- `LB070` Safety Sensor WIP Confirm.

**7. AUTO STOP FAULT
=================**
```
GSB001  ->  AL[81]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**8. CYCLE STOP FAULT
=================**
```
(LB061 OR AL[121]) AND LB062  ->  AL[121]
```
- `LB061` LS Shutter FG Close
- `LB062` FG Shutter Area Sensor

**9.**
```
(/LB1007 OR AL[122]) AND AUTO_RUN  ->  AL[122]
```
- `LB1007` Air Blow MC Ready
- `AUTO_RUN` Auto Running

**10. FAULT STOP FAULT
=================**
```
GSB001  ->  AL[211]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11.**
```
~ (LB610 AND /LB060 AND LT022.Q OR LB611 AND /LB061 AND TON() OR MF[1])  ->  MF[1]
```
- `LB610` SOL FG Shutter Open
- `LB060` LS Shutter FG Open
- `LB611` SOL FG Shutter Close
- `LB061` LS Shutter FG Close
- `LT022` Delay Cover FG Store Motion Faultt

**12. NOTICE/WARNING
=================**
```
(LB152 AND Running_Type1 OR LB150 AND Running_Type2) AND PPWIPAxis.Post[10].LSComb.LS AND /LB801 AND (LT010.Q OR TON())  ->  AL[310]
```
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `Running_Type1` Running Abilcore Model
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `Running_Type2` Running GD1B Model
- `LB801` ATS Finish Process Memory
- `LT010` Delay

**13.**
```
LB1015  ->  AL[311]
```
- `LB1015` Warning : Forget to NAGARA

**14.**
```
/LB802 AND LB1002 AND /LB1000 AND /LB1003  ->  AL[312]
```
- `LB802` ATS Work Finish Take Out from WIP
- `LB1002` PH Air Blow Product Confirm.
- `LB1000` Air Blow Process Start
- `LB1003` Air Blow Finish Process Memory

**15.**
```
LB1014  ->  AL[313]
```
- `LB1014` Warning : Air Blow Double Process

**16.**
```
LB802 AND /LB1003 AND (TON() OR LT011.Q)  ->  AL[314]
```
- `LB802` ATS Work Finish Take Out from WIP
- `LB1003` Air Blow Finish Process Memory
- `LT011` Delay ATS FG Not Processed in Air Blow

**17. EMERGENCY STOPPING ALL
=================**
```
GSB000 AND /AL[20]  ->  LB200
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB200` UNIT EMERGENCY STOP OFF AUX 1

**18.**
```
GSB000  ->  LB201
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB201` UNIT EMERGENCY STOP OFF AUX 2

**19.**
```
GSB000  ->  LB202
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB202` UNIT EMERGENCY STOP OFF AUX 3

**20.**
```
LB200 AND LB201 AND LB202  ->  LB209
```
- `LB200` UNIT EMERGENCY STOP OFF AUX 1
- `LB201` UNIT EMERGENCY STOP OFF AUX 2
- `LB202` UNIT EMERGENCY STOP OFF AUX 3
- `LB209` UNIT EMERGENCY STOP OFF

**21. AUTO STOPPING ALL
=================**
```
GSB000  ->  LB210
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB210` UNIT AUTO STOP OFF AUX 1

**22.**
```
GSB000  ->  LB211
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB211` UNIT AUTO STOP OFF AUX 2

**23.**
```
GSB000  ->  LB212
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB212` UNIT AUTO STOP OFF AUX 3

**24.**
```
LB210 AND LB211 AND LB212  ->  LB219
```
- `LB210` UNIT AUTO STOP OFF AUX 1
- `LB211` UNIT AUTO STOP OFF AUX 2
- `LB212` UNIT AUTO STOP OFF AUX 3
- `LB219` UNIT AUTO STOP OFF

**25. CYCLE STOPPING ALL
=================**
```
GSB000 AND /AL[16] AND /AL[17] AND /AL[18] AND /AL[19] AND /AL[121] AND /AL[122]  ->  LB220
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB220` UNIT CYCLE STOP OFF AUX 1

**26.**
```
GSB000  ->  LB221
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB221` UNIT CYCLE STOP OFF AUX 2

**27.**
```
GSB000  ->  LB222
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB222` UNIT CYCLE STOP OFF AUX 3

**28.**
```
LB220 AND LB221 AND LB222  ->  LB229
```
- `LB220` UNIT CYCLE STOP OFF AUX 1
- `LB221` UNIT CYCLE STOP OFF AUX 2
- `LB222` UNIT CYCLE STOP OFF AUX 3
- `LB229` UNIT CYCLE STOP OFF

**29. FAULT STOPPING ALL
=================**
```
GSB000 AND /MF[001]  ->  LB230
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB230` UNIT FAULT STOP OFF AUX 1

**30.**
```
GSB000  ->  LB231
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB231` UNIT FAULT STOP OFF AUX 2

**31.**
```
GSB000  ->  LB232
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB232` UNIT FAULT STOP OFFAUX 3

**32.**
```
LB230 AND LB231 AND LB232  ->  LB239
```
- `LB230` UNIT FAULT STOP OFF AUX 1
- `LB231` UNIT FAULT STOP OFF AUX 2
- `LB232` UNIT FAULT STOP OFFAUX 3
- `LB239` UNIT FAULT STOP OFF

**33. NOTICE/WARNING
=================**
```
GSB000 AND /AL[310] AND /AL[311] AND /AL[312] AND /AL[314]  ->  LB240
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB240` UNIT NOTICE/WARNING OFF AUX 1

**34.**
```
GSB000  ->  LB241
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB241` UNIT NOTICE/WARNING OFF AUX 2

**35.**
```
GSB000  ->  LB242
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB242` UNIT NOTICE/WARNING OFF AUX 3

**36.**
```
LB240 AND LB241 AND LB242  ->  LB249
```
- `LB240` UNIT NOTICE/WARNING OFF AUX 1
- `LB241` UNIT NOTICE/WARNING OFF AUX 2
- `LB242` UNIT NOTICE/WARNING OFF AUX 3
- `LB249` UNIT NOTICE/WARNING OFF

## P011_WIP_Transfer / Condition


**1. WIP Transfer Unit
=====================
=====================**
```
~ (/DISCH_MODE AND LB150 AND /LB152 AND Running_Type1 OR GSB011 AND WITHOUT_PRODUCT OR GSB009 AND DISCH_MODE AND LB151 AND LB153) AND LB154 AND LB052 AND AUTO_MODE AND /LB800 AND (/PPXAxis.Post[10].LSComb.LS AND /PPXAxis.Post[5].LSComb.LS OR LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS) AND /LB801 AND PPWIPAxis.Post[10].LSComb.LS AND LB070  ->  LB300
```
- `DISCH_MODE` Discharge Mode
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `Running_Type1` Running Abilcore Model
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]
- `Running_Type2` Running GD1B Model
- `LB156` PH Tipe 2 Floating Confirm. [GD1B]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `GSB009` Modify Ghani After Moving to Line
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `LB052` Nagara Switch
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `LB070` Safety Sensor WIP Confirm.
- `LB300` WIP Transfer Cond.

**2.**
```
~ (LB150 AND LB801 AND /LB802 OR LB152 OR GSB011 AND WITHOUT_PRODUCT OR LB151 AND LB153 AND GSB009 AND /DISCH_MODE AND GB014_012 AND /GB012_026 AND /GB012_021 AND GSB020 AND /FLASH1_DISABLE) AND (/PPXAxis.Post[10].LSComb.LS AND /PPXAxis.Post[5].LSComb.LS OR LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS) AND /LB800 AND PPWIPAxis.Post[2].LSComb.LS  ->  LB301
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `GSB009` Modify Ghani After Moving to Line
- `DISCH_MODE` Discharge Mode
- `GB014_012` Flash 1 No Product Confirm.
- `GB012_026` Flash1 Take In Compl. Memory
- `GB012_021` Flash 1 Take Out Compl. Memory
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH1_DISABLE` Flash 1 Disable
- `GB015_012` PH Flash 2 No Product Confirm.
- `GB012_027` Flash 2 Take In Compl. Memory
- `GB012_022` Flash 2 Take Out Compl. Memory
- `FLASH2_DISABLE` Flash 2 Disable
- `GB014_011` Flash 1 Product Confirm.
- `GB015_011` PH Flash 2 Product Confirm.
- `LB800` Memory WIP Trans. Confirm.
- `LB301` WIP Return Cond.

**3.**
```
(LB300 OR LB301)  ->  LB304
```
- `LB300` WIP Transfer Cond.
- `LB301` WIP Return Cond.
- `LB304` WIP Transfer 1 Cycle Condition

**4. Shutter FG Unit
=====================
=====================**
```
LB1001 AND LB061  ->  LB305
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB061` LS Shutter FG Close
- `LB305` Shutter FG Motion Start

**5.**
```
(LB304 OR LB305)  ->  LB309
```
- `LB304` WIP Transfer 1 Cycle Condition
- `LB305` Shutter FG Motion Start
- `LB309` Unit 1 Cycle Start Condition

## P011_WIP_Transfer / Individual


**1. IND 1 CYCLE**
```
IND_MODE  ->  LB310
```
- `IND_MODE` Individual Mode
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX

**2.**
```
LB310 AND LB209 AND LB219  ->  LB319
```
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB319` UNIT 1 CYCLE OPERATION COND.

**3.**
```
(LB101 AND LB309 AND LB219 OR LB320 AND LB400[3] AND /LB409) AND LB319  ->  LB320
```
- `LB101` 品番検索開始(開始位置0)
- `LB309` Unit 1 Cycle Start Condition
- `LB219` UNIT AUTO STOP OFF
- `LB320` Unit  1 Cycle Operation Start
- `LB409` WIP Transfer Cycle Complete
- `LB319` UNIT 1 CYCLE OPERATION COND.

**4.**
```
IND_MODE AND /LB320 AND MC()
```
- `IND_MODE` Individual Mode
- `LB320` Unit  1 Cycle Operation Start

**5.**
```
(LB102 OR LB340) AND /LB099  ->  LB340
```
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB340` Ind. Home Pos Return
- `LB099` WIP Transfer Unit Home Pos.

**6.**
```
~ PPWIPAxis.Post[10].LSComb.LS AND (LB150 AND Running_Type1 AND >() OR LB152 AND Running_Type2 AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS OR GSB011 AND WITHOUT_PRODUCT) AND /LB344  ->  LB341
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `Running_Type1` Running Abilcore Model
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `Running_Type2` Running GD1B Model
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB344` Ind. SM10 BWD Motion
- `LB341` SM10 FWD Cond.

**7.**
```
~ (LB103 AND LB341 OR LB342 AND LB600) AND /PPWIPAxis.Post[2].LSComb.LS AND /RCON_In_Axis8_Status_Signal.B[3] AND MOVE()  ->  LB342
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB341` SM10 FWD Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB342` Ind. SM10 FWD Motion
- `LB600` SM10 FWD Motion

**8.**
```
~ (/PPXAxis.Post[10].LSComb.LS AND /PPXAxis.Post[5].LSComb.LS OR LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS) AND /LB342 AND (GB014_012 AND /GB012_026 AND /GB012_021 AND /FLASH1_DISABLE OR GB015_012 AND /GB012_027 AND /GB012_022 AND /FLASH2_DISABLE OR GB014_011 OR FLASH1_DISABLE AND GSB020 AND FLASH2_DISABLE AND GSB020) AND (LPPSelectDt.Gripper[5].LSComb.LS AND RPPSelectDt.Gripper[5].LSComb.LS) AND (>() OR LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS)  ->  LB343
```
- `LB342` Ind. SM10 FWD Motion
- `GB014_012` Flash 1 No Product Confirm.
- `GB012_026` Flash1 Take In Compl. Memory
- `GB012_021` Flash 1 Take Out Compl. Memory
- `FLASH1_DISABLE` Flash 1 Disable
- `GB015_012` PH Flash 2 No Product Confirm.
- `GB012_027` Flash 2 Take In Compl. Memory
- `GB012_022` Flash 2 Take Out Compl. Memory
- `FLASH2_DISABLE` Flash 2 Disable
- `GB014_011` Flash 1 Product Confirm.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `GB015_011` PH Flash 2 Product Confirm.
- `LB343` SM10 BWD Cond.

**9.**
```
~ (LB104 AND LB343 OR LB340 AND /GSB011 OR LB344 AND LB601) AND /PPWIPAxis.Post[10].LSComb.LS AND /RCON_In_Axis8_Status_Signal.B[3] AND MOVE()  ->  LB344
```
- `LB104` 品番設定ﾁｪｯｸNG
- `LB340` Ind. Home Pos Return
- `LB343` SM10 BWD Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB344` Ind. SM10 BWD Motion
- `LB601` SM10 BWD Motion

**10.**
```
MSTR_RDY_SHUTTE AND /LB060  ->  LB360
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `LB060` LS Shutter FG Open
- `LB360` Shutter FG Cover Open Cond.

**11.**
```
LB130 AND LB360  ->  LB361
```
- `LB130` Assy品番抽出正常終了
- `LB360` Shutter FG Cover Open Cond.
- `LB361` Ind. Shutter FG Cover Open

**12.**
```
MSTR_RDY_SHUTTE  ->  LB362
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `LB362` Shutter FG Cover Close Cond.

**13.**
```
(LB131 OR LB340) AND LB362  ->  LB363
```
- `LB131` Assy品番抽出異常終了
- `LB340` Ind. Home Pos Return
- `LB362` Shutter FG Cover Close Cond.
- `LB363` Ind. Shutter FG Cover Close

**14.**
```
MSTR_RDY_SHUTTE AND /LB064  ->  LB364
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `LB064` AS Additional Chutter FG Open
- `LB364` Additional Chutter FG Open Cond.

**15.**
```
LB132 AND LB364  ->  LB365
```
- `LB132` PB Ind. Add Chutter FG Open
- `LB364` Additional Chutter FG Open Cond.
- `LB365` Ind. Additional Chutter FG Open

**16.**
```
MSTR_RDY_SHUTTE AND /LB063  ->  LB366
```
- `MSTR_RDY_SHUTTE` Master ON Confirm FG Chutter
- `LB063` AS Additional Chutter FG Close
- `LB366` Additional Chutter FG Close Cond.

**17.**
```
(LB133 OR LB340) AND LB366  ->  LB367
```
- `LB133` PB Ind. Add Shutter FG Cover Close
- `LB340` Ind. Home Pos Return
- `LB366` Additional Chutter FG Close Cond.
- `LB367` Ind. Additional Chutter FG Close

**18.**
```
MCR()
```

## P011_WIP_Transfer / AutoRunning


**1. AUTO MOTION START : WIP TRANSFER**
```
(LB304 OR LB400[1]) AND /LB409 AND /CYCLE_STOPPING AND AUTO_RUN AND /LB400[2]  ->  LB400[1]
```
- `LB304` WIP Transfer 1 Cycle Condition
- `LB409` WIP Transfer Cycle Complete
- `CYCLE_STOPPING` Cycle Stopping
- `AUTO_RUN` Auto Running

**2.**
```
(LB409 OR LB400[2]) AND LB400[3] AND LB400[1]  ->  LB400[2]
```
- `LB409` WIP Transfer Cycle Complete

**3. AUTO MOTION START : SHUTTER FG**
```
(LB305 OR LB500[1]) AND /LB509 AND /CYCLE_STOPPING AND AUTO_RUN AND /LB500[2]  ->  LB500[1]
```
- `LB305` Shutter FG Motion Start
- `LB509` Shutter FG 1 Cycle Complete
- `CYCLE_STOPPING` Cycle Stopping
- `AUTO_RUN` Auto Running

**4.**
```
(LB509 OR LB500[2]) AND LB500[3] AND LB500[1]  ->  LB500[2]
```
- `LB509` Shutter FG 1 Cycle Complete

**5. WIP TRANSFER CONDITION RUNNING
=============================**
```
(LB400[1] OR LB320)  ->  LB400[3]
```
- `LB320` Unit  1 Cycle Operation Start

**6.**
```
~ LB400[3] AND (LB300 AND /LB402 OR LB401 OR LB301 AND /LB401 OR LB402)  ->  LB401, LB402
```
- `LB300` WIP Transfer Cond.
- `LB401` WIP Transfer Motion
- `LB402` WIP Return Motion
- `LB301` WIP Return Cond.

**7.**
```
(LB449 OR LB499)  ->  LB409
```
- `LB449` WIP Transfer Cycle Complete
- `LB499` WIP Return Cycle Complete
- `LB409` WIP Transfer Cycle Complete

**8. SHUTTER FG CONDITION RUNNING
=============================**
```
LB500[1]  ->  LB500[3]
```

**9.**
```
LB500[3] AND (LB305 OR LB501)  ->  LB501
```
- `LB305` Shutter FG Motion Start
- `LB501` Shutter FG Motion

**10.**
```
LB549  ->  LB509
```
- `LB549` Shutter FG Cycle Complete
- `LB509` Shutter FG 1 Cycle Complete

**11. WIP TRANSFER MOTION
==================**
```
(LB401 OR LB342 AND /GSB010)  ->  LB410
```
- `LB401` WIP Transfer Motion
- `LB342` Ind. SM10 FWD Motion
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB410` WIP Transfer Motion Start

**12.**
```
~ LB410 AND (/PPWIPAxis.Post[2].LSComb.LS AND /LB413 OR LB411 OR LB411 AND LB600 AND LB411 AND /LB413 OR LB412 OR LB600 AND PPWIPAxis.Post[2].LSComb.LS OR LB413)  ->  LB411, LB412, LB413
```
- `LB410` WIP Transfer Motion Start
- `LB411` SM10 FWD Motion Starting
- `LB413` SM10 FWD Motion Compl.
- `LB600` SM10 FWD Motion
- `LB412` SM10 FWD Motion Running

**13.**
```
~ LB413 AND (LB800 OR DISCH_MODE) AND (LB150 AND Running_Type1 OR LB152 AND Running_Type2 OR GSB011 AND WITHOUT_PRODUCT)  ->  LB415
```
- `LB413` SM10 FWD Motion Compl.
- `LB800` Memory WIP Trans. Confirm.
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `Running_Type1` Running Abilcore Model
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `Running_Type2` Running GD1B Model
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `DISCH_MODE` Discharge Mode
- `LB415` WIP Transfer Compl.

**14.**
```
LB415  ->  LB449
```
- `LB415` WIP Transfer Compl.
- `LB449` WIP Transfer Cycle Complete

**15. WIP TRANSFER RETURN
==================**
```
(LB402 OR LB344 AND /GSB010)  ->  LB450
```
- `LB402` WIP Return Motion
- `LB344` Ind. SM10 BWD Motion
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB450` WIP Return Motion Start

**16.**
```
~ LB450 AND (/PPWIPAxis.Post[10].LSComb.LS AND /LB453 OR LB451 OR LB451 AND LB601 AND LB451 AND /LB453 OR LB452 OR LB601 AND PPWIPAxis.Post[10].LSComb.LS OR LB453)  ->  LB451, LB452, LB453
```
- `LB450` WIP Return Motion Start
- `LB451` SM10 BWD Motion Starting
- `LB453` SM10 BWD Motion Complete
- `LB601` SM10 BWD Motion
- `LB452` SM10 BWD Motion Running

**17.**
```
LB453  ->  LB455
```
- `LB453` SM10 BWD Motion Complete
- `LB455` WIP Return Complete

**18.**
```
LB455  ->  LB499
```
- `LB455` WIP Return Complete
- `LB499` WIP Return Cycle Complete

**19. SHUTTER FG **
```
LB501  ->  LB510
```
- `LB501` Shutter FG Motion
- `LB510` Shutter FG Motion Start

**20.**
```
~ LB510 AND (/LB512 OR LB610 AND LB060 OR LB512)  ->  LB511, LB512
```
- `LB510` Shutter FG Motion Start
- `LB512` Cover Shutter Open Confirm.
- `LB511` Auto : Cover Shutter Open Start
- `LB610` SOL FG Shutter Open
- `LB060` LS Shutter FG Open

**21.**
```
~ LB510 AND (FGChutterBoxChanging AND /LB512A OR LB511A OR LB612 AND LB064 OR LB512A)  ->  LB511A, LB512A
```
- `LB510` Shutter FG Motion Start
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing
- `LB511A` Auto : Additional Chutter Open Start
- `LB512A` Additional Chutter Open Confirm.
- `LB612` SOL FG Additional Chutter Open
- `LB064` AS Additional Chutter FG Open

**22.**
```
LB512 AND (LB158 OR LB513)  ->  LB513
```
- `LB512` Cover Shutter Open Confirm.
- `LB158` FG Shutter Area Sensor ON Confirm.
- `LB513` Product Take In to Shutter Confirm.

**23.**
```
LB513 AND (LB159 OR LB514) AND /FGChutterBoxChanging AND (LT054.Q OR TON())  ->  LB514
```
- `LB513` Product Take In to Shutter Confirm.
- `LB159` FG Shutter Area Sensor OFF Confirm.
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing
- `LB514` Safety Confirm. [Sensor is OFF]
- `LT054` Delay after Take In

**24.**
```
~ LB514 AND (/LB516 OR LB611 AND LB061 OR LB516)  ->  LB515, LB516
```
- `LB514` Safety Confirm. [Sensor is OFF]
- `LB516` Cover Shutter Close Confirm.
- `LB515` Auto : Cover Shutter Close Start
- `LB611` SOL FG Shutter Close
- `LB061` LS Shutter FG Close

**25.**
```
~ LB514 AND (GSB001 OR LB517 OR /LB517) AND /LB518  ->  LB517, LB518
```
- `LB514` Safety Confirm. [Sensor is OFF]
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB517` Additional Chutter No Need to Move
- `LB518` Additional Chutter Move Close

**26.**
```
~ LB518 AND (/LB520 OR LB613 AND LB063 OR LB520)  ->  LB519, LB520
```
- `LB518` Additional Chutter Move Close
- `LB520` Additional Chutter Close Confirm.
- `LB519` Auto : Additional Chutter Close Start
- `LB613` SOL FG Additional Chutter Close
- `LB063` AS Additional Chutter FG Close

**27.**
```
LB516 AND (LB517 OR LB518 AND LB520)  ->  LB529
```
- `LB516` Cover Shutter Close Confirm.
- `LB517` Additional Chutter No Need to Move
- `LB518` Additional Chutter Move Close
- `LB520` Additional Chutter Close Confirm.
- `LB529` Shutter FG Motion Compl.

**28.**
```
LB529  ->  LB549
```
- `LB529` Shutter FG Motion Compl.
- `LB549` Shutter FG Cycle Complete

## P011_WIP_Transfer / AutoRunningOutput


**1.**
```
(LB411 OR LB342 AND GSB010)  ->  LB600
```
- `LB411` SM10 FWD Motion Starting
- `LB342` Ind. SM10 FWD Motion
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB600` SM10 FWD Motion

**2.**
```
(LB451 OR LB344 AND GSB010)  ->  LB601
```
- `LB451` SM10 BWD Motion Starting
- `LB344` Ind. SM10 BWD Motion
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB601` SM10 BWD Motion

**3.**
```
(LB361 OR LB511) AND /LB611  ->  LB610
```
- `LB361` Ind. Shutter FG Cover Open
- `LB511` Auto : Cover Shutter Open Start
- `LB611` SOL FG Shutter Close
- `LB610` SOL FG Shutter Open

**4.**
```
(LB363 OR LB515) AND /LB610  ->  LB611
```
- `LB363` Ind. Shutter FG Cover Close
- `LB515` Auto : Cover Shutter Close Start
- `LB610` SOL FG Shutter Open
- `LB611` SOL FG Shutter Close

**5.**
```
(LB511A OR LB365) AND /LB613  ->  LB612
```
- `LB511A` Auto : Additional Chutter Open Start
- `LB365` Ind. Additional Chutter FG Open
- `LB613` SOL FG Additional Chutter Close
- `LB612` SOL FG Additional Chutter Open

**6.**
```
(LB519 OR LB367) AND /LB612  ->  LB613
```
- `LB519` Auto : Additional Chutter Close Start
- `LB367` Ind. Additional Chutter FG Close
- `LB612` SOL FG Additional Chutter Open
- `LB613` SOL FG Additional Chutter Close

**7.**
```
(LB600 OR LB601)  ->  LB650
```
- `LB600` SM10 FWD Motion
- `LB601` SM10 BWD Motion
- `LB650` SM10 WIP Trans Moving Start

**8.**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**9. MEMORY
=========**
```
LB413 AND /DISCH_MODE  ->  LB800
```
- `LB413` SM10 FWD Motion Compl.
- `DISCH_MODE` Discharge Mode
- `LB800` Memory WIP Trans. Confirm.

**10.**
```
GB012_028  ->  LB801
```
- `GB012_028` WIP Take In Compl. Memory
- `LB801` ATS Finish Process Memory

**11.**
```
LB801 AND LB151 AND LB153 AND (LB1002 OR GSB009)  ->  LB802
```
- `LB801` ATS Finish Process Memory
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `LB1002` PH Air Blow Product Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `LB802` ATS Work Finish Take Out from WIP

**12.**
```
LB1001  ->  LB810
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB810` Air Blow FG Take Out Memory

**13.**
```
~ (PPWIPAxis.Post[10].LSComb.LS OR GSB000 OR GB012_025) AND LB151 AND LB153  ->  LB800
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `GB012_025` Left Arm WIP Take Out Compl.
- `LB800` Memory WIP Trans. Confirm.

**14.**
```
~ (LB151 AND LB153 AND PPWIPAxis.Post[10].LSComb.LS OR GSB009 AND LB802 AND /GSB009 OR PB500_001 AND TON()) AND LB802  ->  LB801
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `LB802` ATS Work Finish Take Out from WIP
- `GSB009` Modify Ghani After Moving to Line
- `PB500_001` PB Reset ATS Finish Process Memory
- `LB801` ATS Finish Process Memory

**15.**
```
(CP2E_TO_NX_Word[1] OR PB500_002 AND TON())  ->  LB802
```
- `PB500_002` PB Reset ATS FG Take Out Memory
- `LB802` ATS Work Finish Take Out from WIP

**16.**
```
LB513  ->  LB810
```
- `LB513` Product Take In to Shutter Confirm.
- `LB810` Air Blow FG Take Out Memory

## P011_WIP_Transfer / DeviceOutput


**1. ■ Servo IAI 
**Right  Side PP Unit==========================================
Conviguration Axis:

Axis Table                                           Axis IAI
SM2 Right Arm Rotary Unit     =       Axis no 0
SM3 Left Arm Rotary Unit       =       Axis no 1
SM4 Right Arm Gripper Unit   =       Axis no 2
SM5 Left Arm Gripper Unit     =       Axis no 3
SM6 Right Arm Z Axis Unit     =       Axis no 4
SM7 Left Arm Z Axis Unit       =       Axis no 5
SM8 Right Arm Y Axis Unit     =       Axis no 6
SM9 Left Arm Y Axis Unit       =       Axis no 7
SM10 WIP Transfer Unit         =       Axis no 8

+++++++++++++++++++++++++++++++++++++++++++++++++
Right Side PP Unit __Y Axis Device Output**
```
LB650  ->  RCON_Out_Axis8_Control_Signal.B[0]
```
- `LB650` SM10 WIP Trans Moving Start

**2.**
```
GSB001  ->  RCON_Out_Axis8_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
GSB001  ->  RCON_Out_Axis8_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4.**
```
(FLT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB650 AND (RCON_In_Axis8_Status_Signal.B[3] OR RCON_In_Axis8_Status_Signal.B[5])  ->  RCON_Out_Axis8_Control_Signal.B[3]
```
- `FLT_RST` Fault Reset
- `AUTO_RUN` Auto Running
- `LB650` SM10 WIP Trans Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**5.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis8_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis8_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**6.**
```
=() AND (PB363_003 AND /RCON_Out_Axis8_Control_Signal.B[5] OR /PB363_003 AND RCON_Out_Axis8_Control_Signal.B[5])  ->  RCON_Out_Axis8_Control_Signal.B[5]
```

**7.**
```
=() AND GB003_022  ->  RCON_Out_Axis8_Control_Signal.B[6]
```
- `GB003_022` Inching Mode On

**8.**
```
=() AND GB003_020  ->  RCON_Out_Axis8_Control_Signal.B[7]
```
- `GB003_020` IAI JOG- Operation

**9.**
```
=() AND GB003_021  ->  RCON_Out_Axis8_Control_Signal.B[8]
```
- `GB003_021` IAI JOG+ Operation

**10.**
```
GSB001  ->  RCON_Out_Axis8_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11. SOL FG Shutter
=============**
```
LB610  ->  CH0005_04
```
- `LB610` SOL FG Shutter Open
- `CH0005_04` SOL Cover FG Shutter Open [IOBus://unit#7/Output Bit 16 bits/Output Bit 04]

**12.**
```
LB611  ->  CH0005_05
```
- `LB611` SOL FG Shutter Close
- `CH0005_05` SOL Cover FG Shutter Close [IOBus://unit#7/Output Bit 16 bits/Output Bit 05]

**13.**
```
(LB613 OR PBTest)  ->  CH0005_06
```
- `LB613` SOL FG Additional Chutter Close
- `CH0005_06` SOL Chutter FG Additional Close [IOBus://unit#7/Output Bit 16 bits/Output Bit 06]

**14.**
```
(LB612 OR PBTest2)  ->  CH0005_07
```
- `LB612` SOL FG Additional Chutter Open
- `CH0005_07` SOL Chutter FG Additional Open [IOBus://unit#7/Output Bit 16 bits/Output Bit 07]

**15.**
```
LB079  ->  CH0005_10
```
- `LB079` Safety Area on WIP Confirmation
- `CH0005_10` Safety Area on WIP Bypass [IOBus://unit#7/Output Bit 16 bits/Output Bit 10]

## P011_WIP_Transfer / HMI_Output


**1.**
```
LB400[3]  ->  PL004_01S
```

**2.**
```
LB099  ->  PL004_01R
```
- `LB099` WIP Transfer Unit Home Pos.

**3.**
```
PPWIPAxis.Post[2].LSComb.LS  ->  PL411_01M
```

**4.**
```
PPWIPAxis.Post[10].LSComb.LS  ->  PL411_01R
```

**5.**
```
GSB001  ->  PL411_02M
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6.**
```
GSB001  ->  PL411_02R
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**7.**
```
GSB001  ->  PL411_03M
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**8.**
```
GSB001  ->  PL411_03R
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**9.**
```
GSB001  ->  PL411_04M
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**10.**
```
GSB001  ->  PL411_04R
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11.**
```
LB060  ->  PL412_01M
```
- `LB060` LS Shutter FG Open
- `PL412_01M` PL Chutter FG Open

**12.**
```
LB061  ->  PL412_01R
```
- `LB061` LS Shutter FG Close
- `PL412_01R` PL Chutter FG Close

**13.**
```
LB064  ->  PL412_02M
```
- `LB064` AS Additional Chutter FG Open
- `PL412_02M` PL Add Chutter FG Open

**14.**
```
LB063  ->  PL412_02R
```
- `LB063` AS Additional Chutter FG Close
- `PL412_02R` PL Add Chutter FG Close

**15. MEMORY SCREEN**
```
LB801  ->  PL500_001
```
- `LB801` ATS Finish Process Memory
- `PL500_001` PL ATS Finish Process Memory

**16.**
```
LB802  ->  PL500_002
```
- `LB802` ATS Work Finish Take Out from WIP
- `PL500_002` PL ATS FG Take Out Memory

**17.**
```
LB1003  ->  PL500_003
```
- `LB1003` Air Blow Finish Process Memory
- `PL500_003` PL Air Blow Finish Process Memory

**18.**
```
LB1001  ->  PL500_004
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `PL500_004` PL Air Blow FG Take Out Memory

## P011_WIP_Transfer / StationOutput


**1.**
```
LB099  ->  GB011_001
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB011_001` WIP Transfer Home Pos.

**2.**
```
LB209  ->  GB011_002
```
- `LB209` UNIT EMERGENCY STOP OFF
- `GB011_002` WIP Transfer Emergency Stop Fault Off

**3.**
```
LB219  ->  GB011_003
```
- `LB219` UNIT AUTO STOP OFF
- `GB011_003` WIP Transfer Auto Stop Fault Off

**4.**
```
LB229  ->  GB011_004
```
- `LB229` UNIT CYCLE STOP OFF
- `GB011_004` WIP Transfer Cycle Stop Fault Off

**5.**
```
LB239  ->  GB011_005
```
- `LB239` UNIT FAULT STOP OFF
- `GB011_005` WIP Transfer Fault Stopping Off

**6.**
```
LB249  ->  GB011_006
```
- `LB249` UNIT NOTICE/WARNING OFF
- `GB011_006` WIP Transfer Notice/Warning Off

**7.**
```
GSB001  ->  GB011_007
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**8.**
```
GSB000  ->  GB011_008
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB011_008` WIP Transfer Auto Cond. (Except Home Pos.)

**9.**
```
/LB400[3] AND LB099  ->  GB011_009
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB011_009` WIP Transfer Machine Abeyance

**10.**
```
GSB001  ->  GB011_010
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11.**
```
LB800  ->  GB011_011
```
- `LB800` Memory WIP Trans. Confirm.
- `GB011_011` WIP Transfer Compl. Memory

**12.**
```
LB801  ->  GB011_012
```
- `LB801` ATS Finish Process Memory
- `GB011_012` Finish Good Compl. Memory

**13.**
```
GSB001  ->  GB011_013
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
GSB001  ->  GB011_014
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
LB1007  ->  GB011_015
```
- `LB1007` Air Blow MC Ready
- `GB011_015` Air Blow MC Ready

**16.**
```
GSB001  ->  GB011_016
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**17.**
```
GSB001  ->  GB011_017
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**18.**
```
GSB001  ->  GB011_018
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**19.**
```
GSB001  ->  GB011_019
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**20.**
```
GSB001  ->  GB011_020
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**21.**
```
LB150  ->  GB011_021
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB011_021` PH Workpiece 1 Confirm. [Abilcore]

**22.**
```
LB151  ->  GB011_022
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB011_022` PH No Workpiece 1 [Abilcore]

**23.**
```
LB152  ->  GB011_023
```
- `LB152` PH Workpiece 2 Confirm. [GD1B]
- `GB011_023` PH Workpiece 2 Confirm. [GD1B]

**24.**
```
LB153  ->  GB011_024
```
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]
- `GB011_024` PH No Workpiece 2 [GD1B]

**25.**
```
LB154  ->  GB011_025
```
- `LB154` PH Tipe 1 Floating Confirm. [Abilcore]
- `GB011_025` PH Tipe 1 Floating Confirm. [Abilcore]

**26.**
```
LB155  ->  GB011_026
```
- `LB155` PH Tipe 1 No Floating Confirm. [Abilcore]
- `GB011_026` PH Tipe 1 No Floating Confirm. [Abilcore]

**27.**
```
LB156  ->  GB011_027
```
- `LB156` PH Tipe 2 Floating Confirm. [GD1B]
- `GB011_027` PH Tipe 2 Floating Confirm. [GD1B]

**28.**
```
LB157  ->  GB011_028
```
- `LB157` PH Tipe 2 No Floating Confirm. [GD1B]
- `GB011_028` PH Tipe 2 No Floating Confirm. [GD1B]

**29. Network to Air Blow MC
[Note : Use 2nd Ethernet Port of NX]**
```
LB802 AND /FGChutterBoxChanging  ->  NX_TO_CP2E_Word[1]
```
- `LB802` ATS Work Finish Take Out from WIP
- `FGChutterBoxChanging` Hold & Releaser Chutter FG for Box Changing

**30.**
```
LB510  ->  NX_TO_CP2E_Word[2]
```
- `LB510` Shutter FG Motion Start

**31.**
```
PB500_003 AND TON()  ->  NX_TO_CP2E_Word[8]
```
- `PB500_003` PB Reset AirBlow Finish Memory

**32.**
```
PB500_004 AND TON()  ->  NX_TO_CP2E_Word[9]
```
- `PB500_004` PB Reset AirBlow FG Take Out Memory

**33.**
```
AL[312]  ->  NX_TO_CP2E_Word[15]
```

**34.**
```
AirBlow_Bypass  ->  NX_TO_CP2E_Word[16]
```
- `AirBlow_Bypass` Bypass Airblow MC

---

# PROGRAM P012_ATS3_Unit


## P012_ATS3_Unit / Station_Input


**1. FROM MRC3 **
```
~ (GSB009 AND LT100.Q AND GSB001 OR GSB011 AND WITHOUT_PRODUCT AND LT100.Q)  ->  LB000
```
- `GSB009` Modify Ghani After Moving to Line
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `PL013_012` PL MTC OP MRC Judgment BYPASS
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product

**2.**
```
GSB009 AND (LB2001 OR LB151 AND LB006)  ->  LB000
```
- `GSB009` Modify Ghani After Moving to Line
- `LB2001` Flash 2 Debugging Mode
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open

**3.**
```
NJ_TO_NX_Bool[4] AND NJ_TO_NX_Bool[3]  ->  LB001
```
- `LB001` 異常あり$tFAULT EXIST

**4.**
```
LB151 AND NJ_TO_NX_Bool[3]  ->  LB002
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB002` MRC Ready toTake In Signal

**5.**
```
/GSB001  ->  LB003
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB003` MRC3 Processing

**6.**
```
NJ_TO_NX_Bool[9]  ->  LB004
```
- `LB004` MRC3 Cover in Motion (Cover is Moving)

**7.**
```
(NJ_TO_NX_Bool[1] OR WITHOUT_PRODUCT)  ->  LB005
```
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB005` PH MRC Product Confirm.

**8.**
```
NJ_TO_NX_Bool[3]  ->  LB006
```
- `LB006` LS Cover MRC Open

**9.**
```
NJ_TO_NX_Bool[2]  ->  LB007
```
- `LB007` LS Cover MRC Close

**10.**
```
NJ_TO_NX_Bool[5]  ->  LB008
```
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION

**11. FROM FLASH 1**
```
(GSB011 OR GSB001) AND GB014_024  ->  LB010
```
- `GSB011` Ghani_Trial W/O Product
- `GB014_024` Flash 1 OK Compl. Memory
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB010` 品番未設定

**12.**
```
GSB001  ->  LB011
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB011` 検索品番未検出

**13.**
```
GSB001  ->  LB012
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB012` Emergency Stopping All Aux 3

**14.**
```
GSB001  ->  LB013
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB013` Emergency Stopping All Aux 4

**15. FROM FLASH 2**
```
(GSB011 OR GSB001) AND GB015_024  ->  LB020
```
- `GSB011` Ghani_Trial W/O Product
- `GB015_024` Flash 2 OK Compl. Memory
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB020` MD異常でない

**16.**
```
GSB001  ->  LB021
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB021` Cycle Stopping All Aux 2

**17.**
```
GSB001  ->  LB022
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB022` Cycle Stopping All Aux 3

**18.**
```
GSB001  ->  LB023
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB023` Cycle Stopping All Aux 4

## P012_ATS3_Unit / Device_Input


**1.**
```
GSB001  ->  LB050
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB050` PH Workpiece Detect 1

**2.**
```
GSB001  ->  LB051
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB051` PH Workpiece Detect 2

**3.**
```
CH0002_04  ->  LB054
```
- `CH0002_04` PX DANDORI POINT 2^0 [IOBus://unit#4/Input Bit 16 bits/Input Bit 04]
- `LB054` PH Floating Check Type 2

**4.**
```
CH0002_05  ->  LB055
```
- `CH0002_05` PX DANDORI POINT 2^1 [IOBus://unit#4/Input Bit 16 bits/Input Bit 05]
- `LB055` PX Dandori Point 2^1

**5.**
```
CH0002_06  ->  LB056
```
- `CH0002_06` PX DANDORI POINT 2^2 [IOBus://unit#4/Input Bit 16 bits/Input Bit 06]
- `LB056` PX Dandori Point 2^2

**6.**
```
CH0002_07  ->  LB057
```
- `CH0002_07` PH LIMIT POS LEFT SIDE [IOBus://unit#4/Input Bit 16 bits/Input Bit 07]
- `LB057` PH Limit Pos Left Side

**7.**
```
CH0002_08  ->  LB058
```
- `CH0002_08` PH LIMIT POS RIGH SIDE [IOBus://unit#4/Input Bit 16 bits/Input Bit 08]
- `LB058` PH Limit Pos Right Side

**8.**
```
GSB002 AND GSB001  ->  LB059
```
- `GSB002` Ghani_Add Sensor Product
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB059` PH MRC3 Product Confirm.

**9.**
```
CH0006_14  ->  LB070
```
- `CH0006_14` PX Pokayoke Homing Right Arm [IOBus://unit#8/Input Bit 16 bits/Input Bit 14]
- `LB070` Safety Sensor WIP Confirm.

**10.**
```
CH0006_15  ->  LB071
```
- `CH0006_15` PX Pokayoke Homing Left Arm [IOBus://unit#8/Input Bit 16 bits/Input Bit 15]
- `LB071` PX Pokayoke Homing Left Arm

**11.**
```
~ (/GSB009 AND RPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND PPXAxis.Post[2].LSComb.LS AND /LB2010 AND LPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.Rotate[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS OR GSB009 AND RPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND PPXAxis.Post[5].LSComb.LS AND LPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.Rotate[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.Rotate[5].LSComb.LS) AND RPPSelectDt.Rotate[5].LSComb.LS AND RCON_In_Axis0_Status_Signal.B[1] AND RCON_In_Axis1_Status_Signal.B[1]  ->  LB099
```
- `GSB009` Modify Ghani After Moving to Line
- `LB2010` MRC Take In Compl. Memory
- `LB2009` WIP Take In Compl. Memory
- `LB2011` Flash 1 Take In Compl. Memory
- `LB099` WIP Transfer Unit Home Pos.

## P012_ATS3_Unit / HMI_Input


**1.**
```
PB004_02S  ->  LB101
```
- `LB101` 品番検索開始(開始位置0)

**2.**
```
PB004_02R  ->  LB102
```
- `LB102` 品番途中検索開始(開始位置0以外)

**3.**
```
PB422_05M  ->  LB103
```
- `LB103` 品番設定ﾁｪｯｸOK

**4.**
```
PB421_01R  ->  LB104
```
- `LB104` 品番設定ﾁｪｯｸNG

**5.**
```
PB421_02M  ->  LB105
```
- `LB105` Ind Spare

**6.**
```
PB421_02R  ->  LB106
```
- `LB106` Ind Spare

**7.**
```
PB421_03M  ->  LB107
```
- `LB107` Ind Spare

**8.**
```
PB421_03R  ->  LB108
```
- `LB108` Ind Spare

**9.**
```
PB421_04M  ->  LB109
```
- `LB109` Ind Spare

**10.**
```
PB421_04R  ->  LB110
```
- `LB110` 検索品番有

**11.**
```
PB421_05M  ->  LB111
```
- `LB111` 品番検索完了

**12.**
```
PB421_05R  ->  LB112
```
- `LB112` 検索品番無

**13.**
```
PB422_01M  ->  LB113
```

**14.**
```
PB422_01R  ->  LB114
```

**15.**
```
PB422_02M  ->  LB115
```
- `LB115` 検索品番有

**16.**
```
PB422_02R  ->  LB116
```

**17.**
```
PB422_03M  ->  LB117
```

**18.**
```
PB422_03R  ->  LB118
```

**19.**
```
PB422_04M  ->  LB119
```
- `LB119` Auto Running Condition

**20.**
```
PB422_04R  ->  LB120
```
- `LB120` 検索品番有

## P012_ATS3_Unit / Timers


**1.**
```
LB005 AND TON()  ->  LB150
```
- `LB005` PH MRC Product Confirm.
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**2.**
```
/LB005 AND TON()  ->  LB151
```
- `LB005` PH MRC Product Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]

**3.**
```
LPPSelectDt.Gripper[5].LSComb.LS AND TON()  ->  LB152
```
- `LB152` PH Workpiece 2 Confirm. [GD1B]

**4.**
```
RPPSelectDt.Gripper[5].LSComb.LS AND TON()  ->  LB153
```
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]

## P012_ATS3_Unit / Fault


**1. FAULT RESET
=========**
```
MD_FLT_Reset400()
```

**2.**
```
MD_MF_Reset200()
```

**3. EMERGENCY STOP
==============**
```
GSB001  ->  AL[31]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4. AUTO STOP
==============**
```
GSB001  ->  AL[86]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**5. CYCLE STOP
==============**
```
~ (RCON_In_Axis0_Status_Signal.B[3] OR RCON_In_Axis0_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis0_Status_Signal.B[14] OR AL[141])  ->  AL[141]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**6.**
```
~ (RCON_In_Axis1_Status_Signal.B[3] OR RCON_In_Axis1_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis1_Status_Signal.B[14] OR AL[142])  ->  AL[142]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**7.**
```
~ (RCON_In_Axis2_Status_Signal.B[3] OR RCON_In_Axis2_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis2_Status_Signal.B[14] OR AL[143])  ->  AL[143]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**8.**
```
~ (RCON_In_Axis3_Status_Signal.B[3] OR RCON_In_Axis3_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis3_Status_Signal.B[14] OR AL[144])  ->  AL[144]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**9.**
```
~ (RCON_In_Axis4_Status_Signal.B[3] OR RCON_In_Axis4_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis4_Status_Signal.B[14] OR AL[145])  ->  AL[145]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**10.**
```
~ (RCON_In_Axis5_Status_Signal.B[3] OR RCON_In_Axis5_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis5_Status_Signal.B[14] OR AL[146])  ->  AL[146]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**11.**
```
~ (RCON_In_Axis6_Status_Signal.B[3] OR RCON_In_Axis6_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis6_Status_Signal.B[14] OR AL[147])  ->  AL[147]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**12.**
```
~ (RCON_In_Axis7_Status_Signal.B[3] OR RCON_In_Axis7_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis7_Status_Signal.B[14] OR AL[148])  ->  AL[148]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**13.**
```
~ (RCON_In_Axis8_Status_Signal.B[3] OR RCON_In_Axis8_Status_Signal.B[5] AND GSB001 OR MASTER_ON AND /RCON_In_Axis8_Status_Signal.B[14] OR AL[149])  ->  AL[149]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `MASTER_ON` Master ON ATS Delay

**14.**
```
(LB008 OR AL[150]) AND /CP2E_TO_NX_Word[2] AND /NX_TO_CP2E_Word[1] AND /PL013_012  ->  AL[150]
```
- `LB008` Operation readiness confirmation$tMASTER ON CONFIRMATION
- `PL013_012` PL MTC OP MRC Judgment BYPASS

**15.**
```
GSB031 AND LB006 AND LB151  ->  AL[150]
```
- `GSB031` FOR MACHINE ADJUST_NG HANDLING CHANGE SQ
- `LB006` LS Cover MRC Open
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]

**16.**
```
~ (LB2010 AND LB151 AND /AL[150] OR /LB2010 AND LB150 AND /GSB000 OR AL[151]) AND GSB000 AND AUTO_MODE AND LT070.Q  ->  AL[151]
```
- `LB2010` MRC Take In Compl. Memory
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `LT070` Delay

**17.**
```
~ (LB2011 AND GB014_012 AND AUTO_MODE OR /LB2011 AND GB014_011 AND TON() OR AL[152]) AND LT071.Q  ->  AL[152]
```
- `LB2011` Flash 1 Take In Compl. Memory
- `GB014_012` Flash 1 No Product Confirm.
- `GB014_011` Flash 1 Product Confirm.
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `LT071` Delay

**18.**
```
~ (LB2012 AND GB015_012 AND AUTO_MODE OR /LB2012 AND GB015_011 AND TON() OR AL[153]) AND LT072.Q  ->  AL[153]
```
- `LB2012` Flash 2 Take In Compl. Memory
- `GB015_012` PH Flash 2 No Product Confirm.
- `GB015_011` PH Flash 2 Product Confirm.
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `LT072` Delay

**19.**
```
~ (NJ_TO_NX_Bool[15] AND Running_Type1 OR NJ_TO_NX_Bool[16] AND Running_Type2 OR AL[155])  ->  AL[155]
```
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model

**20.**
```
(GSB001 OR AL[156])  ->  AL[156]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**21.**
```
(GSB001 OR AL[157])  ->  AL[157]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**22.**
```
(LB10005 OR AL[158]) AND NJ_TO_NX_Bool[5]  ->  AL[158]
```
- `LB10005` Flash 2 Master OK Check Start

**23.**
```
(LB10006 OR AL[159]) AND NJ_TO_NX_Bool[4]  ->  AL[159]
```
- `LB10006` Flash 2 Master NG Check Start

**24. FAULT STOP
==============**
```
GSB001  ->  AL[221]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**25. NOTICE/WARNING
==============**
```
~ AL[155] AND (LB150 OR GB014_011 OR GB015_011)  ->  AL[320]
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB014_011` Flash 1 Product Confirm.
- `GB015_011` PH Flash 2 Product Confirm.

**26.**
```
(LB10016 OR AL[321])  ->  AL[321]
```
- `LB10016` Flash 2 Cover Close Motion Start

**27.**
```
/RCON_In_Axis0_Status_Signal.B[1]  ->  AL[322]
```

**28.**
```
/RCON_In_Axis1_Status_Signal.B[1]  ->  AL[323]
```

**29. EMERGENCY STOPPING ALL
=================**
```
GSB000  ->  LB200
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB200` UNIT EMERGENCY STOP OFF AUX 1

**30.**
```
GSB000  ->  LB201
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB201` UNIT EMERGENCY STOP OFF AUX 2

**31.**
```
GSB000  ->  LB202
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB202` UNIT EMERGENCY STOP OFF AUX 3

**32.**
```
LB200 AND LB201 AND LB202  ->  LB209
```
- `LB200` UNIT EMERGENCY STOP OFF AUX 1
- `LB201` UNIT EMERGENCY STOP OFF AUX 2
- `LB202` UNIT EMERGENCY STOP OFF AUX 3
- `LB209` UNIT EMERGENCY STOP OFF

**33. AUTO STOPPING ALL
=================**
```
GSB000  ->  LB210
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB210` UNIT AUTO STOP OFF AUX 1

**34.**
```
GSB000  ->  LB211
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB211` UNIT AUTO STOP OFF AUX 2

**35.**
```
GSB000  ->  LB212
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB212` UNIT AUTO STOP OFF AUX 3

**36.**
```
LB210 AND LB211 AND LB212  ->  LB219
```
- `LB210` UNIT AUTO STOP OFF AUX 1
- `LB211` UNIT AUTO STOP OFF AUX 2
- `LB212` UNIT AUTO STOP OFF AUX 3
- `LB219` UNIT AUTO STOP OFF

**37. CYCLE STOPPING ALL
=================**
```
/AL[141] AND /AL[142] AND /AL[143] AND /AL[144] AND /AL[145] AND /AL[146] AND /AL[147] AND /AL[148] AND /AL[149] AND (/AL[150] OR GSB031) AND /GSB031  ->  LB220
```
- `GSB031` FOR MACHINE ADJUST_NG HANDLING CHANGE SQ
- `LB220` UNIT CYCLE STOP OFF AUX 1

**38.**
```
GSB000 AND /AL[151] AND /AL[152] AND /AL[153] AND /AL[155] AND /AL[156] AND /AL[157]  ->  LB221
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB221` UNIT CYCLE STOP OFF AUX 2

**39.**
```
GSB000 AND /AL[158] AND /AL[159]  ->  LB222
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB222` UNIT CYCLE STOP OFF AUX 3

**40.**
```
LB220 AND LB221 AND LB222  ->  LB229
```
- `LB220` UNIT CYCLE STOP OFF AUX 1
- `LB221` UNIT CYCLE STOP OFF AUX 2
- `LB222` UNIT CYCLE STOP OFF AUX 3
- `LB229` UNIT CYCLE STOP OFF

**41. FAULT STOPPING ALL
=================**
```
GSB000 AND (/GSB031 OR GSB031 AND /AL[150])  ->  LB230
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GSB031` FOR MACHINE ADJUST_NG HANDLING CHANGE SQ
- `LB230` UNIT FAULT STOP OFF AUX 1

**42.**
```
GSB000  ->  LB231
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB231` UNIT FAULT STOP OFF AUX 2

**43.**
```
GSB000  ->  LB232
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB232` UNIT FAULT STOP OFFAUX 3

**44.**
```
LB230 AND LB231 AND LB232  ->  LB239
```
- `LB230` UNIT FAULT STOP OFF AUX 1
- `LB231` UNIT FAULT STOP OFF AUX 2
- `LB232` UNIT FAULT STOP OFFAUX 3
- `LB239` UNIT FAULT STOP OFF

**45. NOTICE/WARNING
=================**
```
GSB000 AND /AL[320] AND /AL[321] AND /AL[322] AND /AL[323]  ->  LB240
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB240` UNIT NOTICE/WARNING OFF AUX 1

**46.**
```
GSB000  ->  LB241
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB241` UNIT NOTICE/WARNING OFF AUX 2

**47.**
```
GSB000  ->  LB242
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB242` UNIT NOTICE/WARNING OFF AUX 3

**48.**
```
LB240 AND LB241 AND LB242  ->  LB249
```
- `LB240` UNIT NOTICE/WARNING OFF AUX 1
- `LB241` UNIT NOTICE/WARNING OFF AUX 2
- `LB242` UNIT NOTICE/WARNING OFF AUX 3
- `LB249` UNIT NOTICE/WARNING OFF

## P012_ATS3_Unit / Condition


**1. ATS CYCLE CONDITION
========================**
```
/LB2001 AND (LB2002 OR LB2003) AND /GB011_011 AND /GB011_012 AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND (GB011_022 OR GSB009) AND GB011_024 AND PPWIPAxis.Post[2].LSComb.LS AND /GSB009  ->  LB300
```
- `LB2001` Flash 2 Debugging Mode
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2003` Flash 1 Continous Debugging Enable
- `GB011_011` WIP Transfer Compl. Memory
- `GB011_012` Finish Good Compl. Memory
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `GSB009` Modify Ghani After Moving to Line
- `LB300` WIP Transfer Cond.

**2.**
```
~ (Running_Type1 AND GB011_021 AND GB011_025 OR Running_Type2 AND GB011_023 AND GB011_027 OR GSB011 AND WITHOUT_PRODUCT) AND GB011_011 AND LPPSelectDt.Gripper[5].LSComb.LS AND RPPSelectDt.Gripper[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND PPWIPAxis.Post[2].LSComb.LS  ->  LB301
```
- `Running_Type1` Running Abilcore Model
- `GB011_021` PH Workpiece 1 Confirm. [Abilcore]
- `GB011_025` PH Tipe 1 Floating Confirm. [Abilcore]
- `Running_Type2` Running GD1B Model
- `GB011_023` PH Workpiece 2 Confirm. [GD1B]
- `GB011_027` PH Tipe 2 Floating Confirm. [GD1B]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `GB011_011` WIP Transfer Compl. Memory
- `LB301` WIP Return Cond.

**3.**
```
~ <>() AND <>() AND =() AND LB2000 AND /LB2010 AND (LB151 AND LB006 AND GSB009 OR GSB011 AND WITHOUT_PRODUCT AND /LB2010) AND /LB2010 AND LPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS  ->  LB302
```
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB2010` MRC Take In Compl. Memory
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open
- `GSB009` Modify Ghani After Moving to Line
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product

**4.**
```
~ (GSB009 AND GSB001 OR GSB011 AND WITHOUT_PRODUCT) AND LT100.Q AND LB2010 AND (LPPSelectDt.Gripper[2].LSComb.LS AND LB2000 OR GSB009 AND DISCH_MODE AND GB011_022 AND GB011_024 AND LPPSelectDt.Gripper[5].LSComb.LS) AND RPPSelectDt.Gripper[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /LB300  ->  LB303
```
- `GSB009` Modify Ghani After Moving to Line
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB006` LS Cover MRC Open
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB2010` MRC Take In Compl. Memory
- `LB2000` Flash 1 Debugging Enable/Disable
- `DISCH_MODE` Discharge Mode
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `LB300` WIP Transfer Cond.
- `LB303` MRC Take Out Condition

**5.**
```
(GB014_012 AND /WITHOUT_PRODUCT OR GSB011 AND WITHOUT_PRODUCT AND /LB2011) AND LB2001 AND (GSB009 OR /GSB009) AND /LB2000 AND (LPPSelectDt.Gripper[5].LSComb.LS OR LPPSelectDt.Gripper[2].LSComb.LS) AND RPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND GB014_012 AND GB014_022 AND /LB306 AND (GSB020 OR /GSB020) AND /FLASH1_DISABLE  ->  LB304
```
- `GB014_012` Flash 1 No Product Confirm.
- `WITHOUT_PRODUCT` Bypass Without Product
- `GSB011` Ghani_Trial W/O Product
- `LB2011` Flash 1 Take In Compl. Memory
- `LB2001` Flash 2 Debugging Mode
- `GSB009` Modify Ghani After Moving to Line
- `LB2000` Flash 1 Debugging Enable/Disable
- `GB014_022` LS Cover Flash 1 Open
- `LB306` Flash 2 Take In Cond.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH1_DISABLE` Flash 1 Disable
- `LB304` WIP Transfer 1 Cycle Condition

**6.**
```
~ (GB014_011 AND GB015_011 OR GSB011 AND WITHOUT_PRODUCT) AND GB014_010 AND (GSB009 OR /GSB009) AND LB2011 AND (LB2001 OR DISCH_MODE AND /LB2001 AND LB151) AND LPPSelectDt.Gripper[5].LSComb.LS AND (RPPSelectDt.Gripper[5].LSComb.LS OR RPPSelectDt.Gripper[2].LSComb.LS AND GB015_011) AND GB014_022 AND (Flash1_WP_Removed OR GSB001) AND /GSB001 AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND (/PPXAxis.Post[5].LSComb.LS OR GSB009) AND /LB2101 AND /GB011_011 AND (GSB020 OR /GSB020) AND /FLASH1_DISABLE  ->  LB305
```
- `GB014_011` Flash 1 Product Confirm.
- `GB015_011` PH Flash 2 Product Confirm.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH2_DISABLE` Flash 2 Disable
- `DISCH_MODE` Discharge Mode
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `GB014_010` Flash 1 Process Compl.
- `LB010` 品番未設定
- `GSB009` Modify Ghani After Moving to Line
- `LB2011` Flash 1 Take In Compl. Memory
- `LB2001` Flash 2 Debugging Mode
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB2012` Flash 2 Take In Compl. Memory
- `GB014_022` LS Cover Flash 1 Open
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB2101` Flash 2 Take Out Priority
- `GB011_011` WIP Transfer Compl. Memory
- `FLASH1_DISABLE` Flash 1 Disable
- `LB305` Shutter FG Motion Start

**7.**
```
(GB015_012 AND /WITHOUT_PRODUCT OR GSB011 AND WITHOUT_PRODUCT AND /LB2012) AND LB2001 AND (GSB009 OR /GSB009) AND /LB2000 AND (LPPSelectDt.Gripper[5].LSComb.LS OR LPPSelectDt.Gripper[2].LSComb.LS) AND RPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND GB015_012 AND GB015_022 AND /LB304 AND (GSB020 OR /GSB020) AND /FLASH2_DISABLE  ->  LB306
```
- `GB015_012` PH Flash 2 No Product Confirm.
- `WITHOUT_PRODUCT` Bypass Without Product
- `GSB011` Ghani_Trial W/O Product
- `LB2012` Flash 2 Take In Compl. Memory
- `LB2001` Flash 2 Debugging Mode
- `GSB009` Modify Ghani After Moving to Line
- `LB2000` Flash 1 Debugging Enable/Disable
- `GB015_022` LS Cover Flash 2 Open
- `LB304` WIP Transfer 1 Cycle Condition
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH2_DISABLE` Flash 2 Disable
- `LB306` Flash 2 Take In Cond.

**8.**
```
~ (GB015_011 AND GB014_011 OR GSB011 AND WITHOUT_PRODUCT) AND GB015_010 AND (GSB009 OR /GSB009) AND LB2012 AND (LB2001 OR DISCH_MODE AND /LB2001 AND LB151) AND LPPSelectDt.Gripper[5].LSComb.LS AND (RPPSelectDt.Gripper[5].LSComb.LS OR RPPSelectDt.Gripper[2].LSComb.LS AND GB014_011) AND GB015_022 AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND (/PPXAxis.Post[5].LSComb.LS OR GSB009) AND /LB2100 AND /GB011_011 AND (GSB020 OR /GSB020) AND /FLASH2_DISABLE  ->  LB307
```
- `GB015_011` PH Flash 2 Product Confirm.
- `GB014_011` Flash 1 Product Confirm.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH1_DISABLE` Flash 1 Disable
- `DISCH_MODE` Discharge Mode
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `GB015_010` Flash 2 Process Compl.
- `LB020` MD異常でない
- `GSB009` Modify Ghani After Moving to Line
- `LB2012` Flash 2 Take In Compl. Memory
- `LB2001` Flash 2 Debugging Mode
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB2011` Flash 1 Take In Compl. Memory
- `GB015_022` LS Cover Flash 2 Open
- `LB2100` Flash 1 Take Out Priority
- `GB011_011` WIP Transfer Compl. Memory
- `FLASH2_DISABLE` Flash 2 Disable
- `LB307` Flash 2 Take Out Cond.

**9.**
```
~ (LB300 OR LB301 OR LB302 OR LB303 OR LB304 OR LB305 OR LB306 OR LB307)  ->  LB309
```
- `LB300` WIP Transfer Cond.
- `LB301` WIP Return Cond.
- `LB303` MRC Take Out Condition
- `LB304` WIP Transfer 1 Cycle Condition
- `LB305` Shutter FG Motion Start
- `LB306` Flash 2 Take In Cond.
- `LB307` Flash 2 Take Out Cond.
- `LB309` Unit 1 Cycle Start Condition

## P012_ATS3_Unit / Preparation


**1. MRC Master Check**
```
IND_MODE AND MASTER_READY AND MASTER_MODE AND LB209 AND LB219 AND PB_OP_ATS_MODE  ->  LB10000
```
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation
- `MASTER_MODE` Master Check Mode
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `PB_OP_ATS_MODE` Operator or ATS Mode
- `LB10000` Flash 2 Master Check Operation Condition

**2.**
```
LB006 AND LB151 AND LB229 AND (Running_Type1 AND NJ_TO_NX_Bool[7] AND NJ_TO_NX_Bool[16] OR Running_Type2 AND NJ_TO_NX_Bool[6] AND NJ_TO_NX_Bool[15])  ->  LB10001
```
- `LB006` LS Cover MRC Open
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB229` UNIT CYCLE STOP OFF
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB10001` Flash 2 Master Check Start Cond.

**3. Master Check Sequential**
```
(PB700_001 OR LB10005) AND /PB700_003 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10005
```
- `PB700_001` PB MRC Master OK Start
- `PB700_003` PB MRC Master NG Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10005` Flash 2 Master OK Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**4.**
```
(PB700_003 OR LB10006) AND /PB700_001 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10006
```
- `PB700_003` PB MRC Master NG Start
- `PB700_001` PB MRC Master OK Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10006` Flash 2 Master NG Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**5.**
```
(LB10005 OR LB10006)  ->  LB10010
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10006` Flash 2 Master NG Check Start
- `LB10010` Flash 2 Master Check Start

**6.**
```
~ LB10010 AND (Running_Type1 AND <>() OR Running_Type2 AND <>() OR Running_Type1 AND =() OR Running_Type2 AND =()) AND /LB10012  ->  LB10011, LB10012
```
- `LB10010` Flash 2 Master Check Start
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB10012` Send Part No to Flash 2 Start
- `LB10011` Flash 2 Req Part No Confirm.

**7.**
```
~ LB10012 AND (LB150 AND LB007 AND /LB10017 OR LB10013 OR LB10013 AND LB10005 AND NJ_TO_NX_Bool[4] OR LB10013 AND LB10014 AND LB006 OR LB10017)  ->  LB10013, LB10014, LB10015, LB10016, LB10017
```
- `LB10012` Send Part No to Flash 2 Start
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB007` LS Cover MRC Close
- `LB10013` Send Part No to Flash 2 Compl.
- `LB10017` Flash 2 Cover Close Motion Confirm.
- `LB10005` Flash 2 Master OK Check Start
- `LB10014` MRC Master OK Check Compl.
- `LB10006` Flash 2 Master NG Check Start
- `LB10015` Flash 2 Writing  Starting
- `LB10016` Flash 2 Cover Close Motion Start
- `LB006` LS Cover MRC Open

**8.**
```
LB10017 AND (LB151 OR LB10049)  ->  LB10049
```
- `LB10017` Flash 2 Cover Close Motion Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB10049` Flash Writing 2 Motion Compl.

**9. Dandory Change Jig**
```
(Running_Type1 AND NJ_TO_NX_Bool[6] OR Running_Type2 AND NJ_TO_NX_Bool[7]) AND LB151 AND LB006  ->  LB1500
```
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open
- `LB1500` Jig Dandori Request to MRC

**10.**
```
(Running_Type1 AND NJ_TO_NX_Bool[7] AND NJ_TO_NX_Bool[16] OR Running_Type2 AND NJ_TO_NX_Bool[6] AND NJ_TO_NX_Bool[15]) AND LB151 AND LB006  ->  LB1500
```
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open
- `LB1500` Jig Dandori Request to MRC

**11. Dandori Part No MRC3**
```
(GSB000 OR Tombol11) AND RIGHT()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**12.**
```
GSB000 AND LEFT()
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**13.**
```
GSB000 AND (Running_Type1 AND MOVE() OR Running_Type2 AND MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model

**14.**
```
(<>() OR LB10011) AND <>() AND (/LB10010 AND <>() AND Running_Type1 AND NJ_TO_NX_Bool[7] AND NJ_TO_NX_Bool[16] AND LB2000 OR LB10010 AND <>() AND Running_Type2 AND NJ_TO_NX_Bool[6] AND NJ_TO_NX_Bool[15] AND LB10010) AND LB151 AND LB006 AND /LB1500  ->  LB1510
```
- `LB10010` Flash 2 Master Check Start
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open
- `LB1500` Jig Dandori Request to MRC
- `LB10011` Flash 2 Req Part No Confirm.
- `LB1510` Dandori Part No Signal

**15.**
```
(/LB10010 AND =() OR LB10010 AND =()) AND LB151 AND LB006  ->  LB1510
```
- `LB10010` Flash 2 Master Check Start
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open
- `LB1510` Dandori Part No Signal

**16.**
```
/LB1500 AND /LB1510 AND MOVE()
```
- `LB1500` Jig Dandori Request to MRC
- `LB1510` Dandori Part No Signal

**17.**
```
LB1500 AND (Running_Type1 AND /NJ_TO_NX_Bool[7] AND Running_Type1 AND <>() AND INSERT() OR Running_Type2 AND /NJ_TO_NX_Bool[6] AND Running_Type2 AND <>() AND INSERT())
```
- `LB1500` Jig Dandori Request to MRC
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model

**18.**
```
~ LB1510 AND (Running_Type1 AND NJ_TO_NX_Bool[7] OR Running_Type2 AND NJ_TO_NX_Bool[6]) AND (Running_Type1 AND /MASTER_MODE AND <>() AND INSERT() OR Running_Type2 AND /MASTER_MODE AND <>() AND INSERT())
```
- `LB1510` Dandori Part No Signal
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model
- `MASTER_MODE` Master Check Mode

## P012_ATS3_Unit / Individual


**1. IND 1 CYCLE**
```
IND_MODE AND RCON_In_Axis0_Status_Signal.B[1] AND RCON_In_Axis1_Status_Signal.B[1]  ->  LB310
```
- `IND_MODE` Individual Mode
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX

**2.**
```
LB310 AND LB209 AND LB219  ->  LB319
```
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB319` UNIT 1 CYCLE OPERATION COND.

**3.**
```
(LB101 AND LB309 AND LB219 OR LB320 AND LB400[3] AND /LB409) AND LB319  ->  LB320
```
- `LB101` 品番検索開始(開始位置0)
- `LB309` Unit 1 Cycle Start Condition
- `LB219` UNIT AUTO STOP OFF
- `LB320` Unit  1 Cycle Operation Start
- `LB409` WIP Transfer Cycle Complete
- `LB319` UNIT 1 CYCLE OPERATION COND.

**4.**
```
IND_MODE AND /LB320 AND MC()
```
- `IND_MODE` Individual Mode
- `LB320` Unit  1 Cycle Operation Start

**5.**
```
(LB102 OR LB340) AND /LB099  ->  LB340
```
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB340` Ind. Home Pos Return
- `LB099` WIP Transfer Unit Home Pos.

**6. SM1 X Axis Unit
=========================**
```
GSB001  ->  LB341
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB341` SM10 FWD Cond.

**7.**
```
(LB103 AND LB341 OR LB342 AND LB1200) AND =() AND /PPXAxis.Post[1].LSComb.LS AND MOVE()  ->  LB342
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB341` SM10 FWD Cond.
- `LB342` Ind. SM10 FWD Motion
- `LB1200` X Axis Pos 1 Moving Start

**8.**
```
LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /PPXAxis.Post[2].LSComb.LS AND GB014_021 AND GB015_021  ->  LB343
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB343` SM10 BWD Cond.

**9.**
```
(LB103 OR LB344) AND LB343 AND =() AND /PPXAxis.Post[2].LSComb.LS AND MOVE()  ->  LB344
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB343` SM10 BWD Cond.
- `LB344` Ind. SM10 BWD Motion

**10.**
```
LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND /PPXAxis.Post[3].LSComb.LS AND GB014_021 AND GB015_021  ->  LB345
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB345` Ind. Flash 2 Cover Open

**11.**
```
(LB103 OR LB346) AND LB345 AND =() AND /PPXAxis.Post[3].LSComb.LS AND MOVE()  ->  LB346
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB345` Ind. Flash 2 Cover Open
- `LB346` Ind. Move SM1 X Axis Pos. 3

**12.**
```
LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND /PPXAxis.Post[4].LSComb.LS AND GB014_021 AND GB015_021  ->  LB347
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB347` X Axis Pos. 4 Move Cond.

**13.**
```
(LB103 OR LB348) AND LB347 AND =() AND /PPXAxis.Post[4].LSComb.LS AND (LB348 AND MOVE())  ->  LB348
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB347` X Axis Pos. 4 Move Cond.
- `LB348` Ind. Move SM1 X Axis Pos. 4

**14.**
```
(LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS OR GSB009 AND <() AND GSB009 AND <() AND GSB009 AND <=() AND GSB009 AND <=()) AND /PPXAxis.Post[5].LSComb.LS AND GB014_021 AND GB015_021  ->  LB349
```
- `GSB009` Modify Ghani After Moving to Line
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB349` X Axis Pos. 5 Move Cond.

**15.**
```
(LB103 OR LB350) AND LB349 AND =() AND /PPXAxis.Post[5].LSComb.LS AND MOVE()  ->  LB350
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB349` X Axis Pos. 5 Move Cond.
- `LB350` Ind. Move SM1 X Axis Pos. 5

**16.**
```
(LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS OR GSB009 AND GSB009 AND GSB009 AND <=() AND GSB009 AND <=()) AND /PPXAxis.Post[10].LSComb.LS AND GB014_021 AND GB015_021  ->  LB351
```
- `GSB009` Modify Ghani After Moving to Line
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB351` X Axis Pos. 10 Move Cond.

**17.**
```
~ (LB103 OR LB340 OR LB352) AND LB351 AND (=() OR LB340) AND /PPXAxis.Post[10].LSComb.LS AND MOVE()  ->  LB352
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB340` Ind. Home Pos Return
- `LB351` X Axis Pos. 10 Move Cond.
- `LB352` Ind. Move SM1 X Axis Pos. 10

**18.**
```
LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND /PPXAxis.Post[11].LSComb.LS AND GB014_021 AND GB015_021  ->  LB353
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB353` X Axis  Pos. 11 Move Cond.

**19.**
```
(LB103 OR LB354) AND LB353 AND =() AND /PPXAxis.Post[11].LSComb.LS AND MOVE()  ->  LB354
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB353` X Axis  Pos. 11 Move Cond.
- `LB354` Ind. Move SM1 X Axis Pos. 11

**20.**
```
LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /PPXAxis.Post[12].LSComb.LS AND GB014_021 AND GB015_021  ->  LB355
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB355` X Axis  Pos. 12 Move Cond.

**21.**
```
(LB103 OR LB356) AND LB355 AND =() AND /PPXAxis.Post[12].LSComb.LS AND MOVE()  ->  LB356
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB355` X Axis  Pos. 12 Move Cond.
- `LB356` Ind. Move SM1 X Axis Pos. 12

**22.**
```
LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /PPXAxis.Post[13].LSComb.LS AND GB014_021 AND GB015_021  ->  LB357
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB357` X Axis  Pos. 13 Move Cond.

**23.**
```
(LB103 OR LB358) AND LB357 AND =() AND /PPXAxis.Post[13].LSComb.LS AND MOVE()  ->  LB358
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB357` X Axis  Pos. 13 Move Cond.
- `LB358` Ind. Move SM1 X Axis Pos. 13

**24.**
```
LPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /PPXAxis.Post[14].LSComb.LS AND GB014_021 AND GB015_021  ->  LB359
```
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `LB359` X Axis  Pos. 14 Move Cond.

**25.**
```
(LB103 OR LB360) AND LB359 AND =() AND /PPXAxis.Post[14].LSComb.LS AND MOVE()  ->  LB360
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB359` X Axis  Pos. 14 Move Cond.
- `LB360` Shutter FG Cover Open Cond.

**26. SM2 Right Rotary
=========================**
```
GSB001  ->  LB361
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB361` Ind. Shutter FG Cover Open

**27.**
```
(LB105 AND LB361 OR LB362 AND LB1240) AND /RCON_In_Axis0_Status_Signal.B[3] AND =() AND /RPPSelectDt.Rotate[1].LSComb.LS AND MOVE()  ->  LB362
```
- `LB105` Ind Spare
- `LB361` Ind. Shutter FG Cover Open
- `LB362` Shutter FG Cover Close Cond.
- `LB1240` Right PP Rotate Unit Pos 1 Moving Start

**28.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS) AND RCON_In_Axis0_Status_Signal.B[1] AND RPPSelectDt.ZAxis[5].LSComb.LS AND RPPSelectDt.YAxis[5].LSComb.LS AND /RPPSelectDt.Rotate[2].LSComb.LS AND /LB362 AND /LB366 AND /LB368 AND /LB370  ->  LB363
```
- `LB362` Shutter FG Cover Close Cond.
- `LB366` Additional Chutter FG Close Cond.
- `LB368` Ind. Move SM2 R Rotary Pos. 4
- `LB370` Ind. Move SM2 R Rotary Pos. 5
- `LB363` Ind. Shutter FG Cover Close

**29.**
```
(LB105 AND LB363 OR LB364 AND LB1241) AND /RCON_In_Axis0_Status_Signal.B[3] AND =() AND /RPPSelectDt.Rotate[2].LSComb.LS AND MOVE()  ->  LB364
```
- `LB105` Ind Spare
- `LB363` Ind. Shutter FG Cover Close
- `LB364` Additional Chutter FG Open Cond.
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start

**30.**
```
GSB001  ->  LB365
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB365` Ind. Additional Chutter FG Open

**31.**
```
(LB105 AND LB365 OR LB366 AND LB1242) AND /RCON_In_Axis0_Status_Signal.B[3] AND =() AND /RPPSelectDt.Rotate[3].LSComb.LS AND MOVE()  ->  LB366
```
- `LB105` Ind Spare
- `LB365` Ind. Additional Chutter FG Open
- `LB366` Additional Chutter FG Close Cond.
- `LB1242` Right PP Rotate Unit Pos 3 Moving Start

**32.**
```
GSB001  ->  LB367
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB367` Ind. Additional Chutter FG Close

**33.**
```
(LB105 AND LB367 OR LB368 AND LB1243) AND /RCON_In_Axis0_Status_Signal.B[3] AND =() AND /RPPSelectDt.Rotate[4].LSComb.LS AND MOVE()  ->  LB368
```
- `LB105` Ind Spare
- `LB367` Ind. Additional Chutter FG Close
- `LB368` Ind. Move SM2 R Rotary Pos. 4
- `LB1243` Right PP Rotate Unit Pos 4 Moving Start

**34.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB009 AND <()) AND (RCON_In_Axis0_Status_Signal.B[1] AND /RPPSelectDt.Rotate[5].LSComb.LS OR /RCON_In_Axis0_Status_Signal.B[1] AND LB070) AND RPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS AND /LB362 AND /LB364 AND /LB366 AND /LB368  ->  LB369
```
- `GSB009` Modify Ghani After Moving to Line
- `LB070` Safety Sensor WIP Confirm.
- `LB362` Shutter FG Cover Close Cond.
- `LB364` Additional Chutter FG Open Cond.
- `LB366` Additional Chutter FG Close Cond.
- `LB368` Ind. Move SM2 R Rotary Pos. 4
- `LB369` SM2 Right Rotary Pos 5 Move Cond.

**35.**
```
~ (LB105 OR LB340 AND /LB1250 AND PPXAxis.Post[2].LSComb.LS OR LB370 AND LB1244 AND /RPPSelectDt.Rotate[5].LSComb.LS AND RCON_In_Axis0_Status_Signal.B[1]) AND LB369 AND (=() OR LB340) AND MOVE() AND /RCON_In_Axis0_Status_Signal.B[3]  ->  LB370
```
- `LB105` Ind Spare
- `LB340` Ind. Home Pos Return
- `LB1250` SM1 X Axis Moving Start
- `GSB009` Modify Ghani After Moving to Line
- `LB369` SM2 Right Rotary Pos 5 Move Cond.
- `LB370` Ind. Move SM2 R Rotary Pos. 5
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start
- `LB1244A` Right Rotary Zero Position Start

**36. SM4 Right Gripper Unit
=========================**
```
GSB001  ->  LB371
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB371` SM4 R Gripper Pos 1 Move Cond.

**37.**
```
(LB107 AND LB371 OR LB372 AND LB1245) AND =() AND /RPPSelectDt.Gripper[1].LSComb.LS AND MOVE() AND /RCON_In_Axis2_Status_Signal.B[3]  ->  LB372
```
- `LB107` Ind Spare
- `LB371` SM4 R Gripper Pos 1 Move Cond.
- `LB372` Ind. Move SM4 R Gripper Pos. 1
- `LB1245` Right PP Chuck Unit Pos 1 Moving Start

**38.**
```
PPXAxis.Post[12].LSComb.LS AND RPPSelectDt.ZAxis[2].LSComb.LS AND /RPPSelectDt.Gripper[2].LSComb.LS AND /LB372 AND /LB376 AND /LB378 AND /LB380  ->  LB373
```
- `LB372` Ind. Move SM4 R Gripper Pos. 1
- `LB376` Ind. Move SM4 R Gripper Pos. 3
- `LB378` Ind. Move SM4 R Gripper Pos. 4
- `LB380` Flash 2 Debugging Operation Condition
- `LB373` SM4 R Gripper Pos 2 Move Cond.

**39.**
```
~ (LB107 AND LB373 OR LB374 AND LB1246) AND =() AND /RPPSelectDt.Gripper[2].LSComb.LS AND MOVE() AND /RCON_In_Axis2_Status_Signal.B[3]  ->  LB374
```
- `LB107` Ind Spare
- `LB373` SM4 R Gripper Pos 2 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB374` Ind. Move SM4 R Gripper Pos. 2 (Chuck)
- `LB1246` Right PP Chuck Unit Pos 2 Moving Start

**40.**
```
GSB001  ->  LB375
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB375` SM4 R Gripper Pos 3 Move Cond.

**41.**
```
(LB107 AND LB375 OR LB376 AND LB1247) AND =() AND /RPPSelectDt.Gripper[3].LSComb.LS AND MOVE() AND /RCON_In_Axis2_Status_Signal.B[3]  ->  LB376
```
- `LB107` Ind Spare
- `LB375` SM4 R Gripper Pos 3 Move Cond.
- `LB376` Ind. Move SM4 R Gripper Pos. 3
- `LB1247` Right PP Chuck Unit Pos 3 Moving Start

**42.**
```
GSB001  ->  LB377
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB377` SM4 R Gripper Pos 4 Move Cond.

**43.**
```
(LB107 AND LB377 OR LB378 AND LB1248) AND =() AND /RPPSelectDt.Gripper[4].LSComb.LS AND MOVE() AND /RCON_In_Axis2_Status_Signal.B[3]  ->  LB378
```
- `LB107` Ind Spare
- `LB377` SM4 R Gripper Pos 4 Move Cond.
- `LB378` Ind. Move SM4 R Gripper Pos. 4
- `LB1248` Right PP Chuck Unit Pos 4 Moving Start

**44.**
```
(PPXAxis.Post[13].LSComb.LS AND RPPSelectDt.Gripper[2].LSComb.LS AND RPPSelectDt.ZAxis[2].LSComb.LS OR PPXAxis.Post[14].LSComb.LS AND /RPPSelectDt.Gripper[2].LSComb.LS AND RPPSelectDt.ZAxis[5].LSComb.LS) AND /RPPSelectDt.Gripper[5].LSComb.LS AND /LB372 AND /LB374 AND /LB376 AND /LB378  ->  LB379
```
- `LB372` Ind. Move SM4 R Gripper Pos. 1
- `LB374` Ind. Move SM4 R Gripper Pos. 2 (Chuck)
- `LB376` Ind. Move SM4 R Gripper Pos. 3
- `LB378` Ind. Move SM4 R Gripper Pos. 4
- `LB379` SM4 R Gripper Pos 5 Move Cond.

**45.**
```
~ (LB107 AND LB379 OR PB013_006 OR CH0000_10 OR LB380 AND LB1249) AND (=() OR PB013_006 OR CH0000_10) AND /RPPSelectDt.Gripper[5].LSComb.LS AND MOVE() AND /RCON_In_Axis2_Status_Signal.B[3]  ->  LB380
```
- `LB107` Ind Spare
- `LB379` SM4 R Gripper Pos 5 Move Cond.
- `CH0000_10` PB RIGHT GRIPPER RELEASE [IOBus://unit#2/Input Bit 16 bits/Input Bit 10]
- `LB380` Flash 2 Debugging Operation Condition
- `LB1249` Right PP Chuck Unit Pos 5 Moving Start

**46. SM6 Right Z Axis
=========================**
```
GSB001  ->  LB381
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB381` Flash 2 Debugging Start

**47.**
```
(LB109 AND LB381 OR LB382 AND LB1235) AND =() AND /RPPSelectDt.ZAxis[1].LSComb.LS AND MOVE() AND /RCON_In_Axis4_Status_Signal.B[3]  ->  LB382
```
- `LB109` Ind Spare
- `LB381` Flash 2 Debugging Start
- `LB382` Ind. Move SM6 R Z Axis Pos. 1
- `LB1235` Right PP Z Axis Pos 1 Moving Start

**48.**
```
~ (PPXAxis.Post[12].LSComb.LS AND RPPSelectDt.Rotate[5].LSComb.LS AND /GSB009 AND RPPSelectDt.YAxis[5].LSComb.LS AND RPPSelectDt.Gripper[5].LSComb.LS OR PPXAxis.Post[13].LSComb.LS AND GB014_012 AND RPPSelectDt.Rotate[2].LSComb.LS AND RPPSelectDt.YAxis[2].LSComb.LS AND RPPSelectDt.Gripper[2].LSComb.LS OR PPXAxis.Post[14].LSComb.LS AND GB015_012) AND /RPPSelectDt.ZAxis[2].LSComb.LS AND /LB382 AND /LB386 AND /LB388 AND /LB390  ->  LB383
```
- `GSB009` Modify Ghani After Moving to Line
- `GB014_012` Flash 1 No Product Confirm.
- `GB015_012` PH Flash 2 No Product Confirm.
- `LB382` Ind. Move SM6 R Z Axis Pos. 1
- `LB386` Ind. Move SM6 R Z Axis Pos. 3
- `LB388` Ind. Move SM6 R Z Axis Pos. 4
- `LB390` Ind. Move SM6 R Z Axis Pos. 5
- `LB383` SM6 R Z Axis Pos 2 Move Cond.

**49.**
```
~ (LB109 AND LB383 OR LB384 AND LB1236) AND =() AND /RPPSelectDt.ZAxis[2].LSComb.LS AND MOVE() AND /RCON_In_Axis4_Status_Signal.B[3]  ->  LB384
```
- `LB109` Ind Spare
- `LB383` SM6 R Z Axis Pos 2 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB384` Ind. Move SM6 R Z Axis Pos. 2
- `LB1236` Right PP Z Axis Pos 2 Moving Start

**50.**
```
GSB001  ->  LB385
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB385` SM6 R Z Axis Pos 3 Move Cond.

**51.**
```
(LB109 AND LB385 OR LB386 AND LB1237) AND =() AND /RPPSelectDt.ZAxis[3].LSComb.LS AND MOVE() AND /RCON_In_Axis4_Status_Signal.B[3]  ->  LB386
```
- `LB109` Ind Spare
- `LB385` SM6 R Z Axis Pos 3 Move Cond.
- `LB386` Ind. Move SM6 R Z Axis Pos. 3
- `LB1237` Right PP Z Axis Pos 3 Moving Start

**52.**
```
GSB001  ->  LB387
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB387` SM6 R Z Axis Pos 4 Move Cond.

**53.**
```
(LB109 AND LB387 OR LB388 AND LB1238) AND =() AND /RPPSelectDt.ZAxis[4].LSComb.LS AND MOVE() AND /RCON_In_Axis4_Status_Signal.B[3]  ->  LB388
```
- `LB109` Ind Spare
- `LB387` SM6 R Z Axis Pos 4 Move Cond.
- `LB388` Ind. Move SM6 R Z Axis Pos. 4
- `LB1238` Right PP Z Axis Pos 4 Moving Start

**54.**
```
~ (PPXAxis.Post[12].LSComb.LS AND RPPSelectDt.Rotate[5].LSComb.LS OR PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[13].LSComb.LS AND RPPSelectDt.Rotate[2].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR GSB009 AND <()) AND /RPPSelectDt.ZAxis[5].LSComb.LS AND /LB382 AND /LB384 AND /LB386 AND /LB388  ->  LB389
```
- `GSB009` Modify Ghani After Moving to Line
- `LB382` Ind. Move SM6 R Z Axis Pos. 1
- `LB384` Ind. Move SM6 R Z Axis Pos. 2
- `LB386` Ind. Move SM6 R Z Axis Pos. 3
- `LB388` Ind. Move SM6 R Z Axis Pos. 4
- `LB389` SM6 R Z Axis Pos 5 Move Cond.

**55.**
```
~ (LB109 AND LB389 AND =() OR LB340 AND /GSB011 AND LB340 OR LB388 AND LB1239) AND /RPPSelectDt.ZAxis[5].LSComb.LS AND MOVE() AND /RCON_In_Axis4_Status_Signal.B[3]  ->  LB390
```
- `LB109` Ind Spare
- `LB340` Ind. Home Pos Return
- `LB389` SM6 R Z Axis Pos 5 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB388` Ind. Move SM6 R Z Axis Pos. 4
- `LB1239` Right PP Z Axis Pos 5 Moving Start
- `LB390` Ind. Move SM6 R Z Axis Pos. 5

**56. SM8 Right Y Axis
=========================**
```
GSB001  ->  LB391
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB391` SM8 R Y Axis Pos 1 Move Cond.

**57.**
```
(LB111 AND LB391 OR LB392 AND LB1230) AND =() AND /RPPSelectDt.YAxis[1].LSComb.LS AND MOVE() AND /RCON_In_Axis6_Status_Signal.B[3]  ->  LB392
```
- `LB111` 品番検索完了
- `LB391` SM8 R Y Axis Pos 1 Move Cond.
- `LB392` Ind. Move SM8 R Y Axis Pos. 1
- `LB1230` Right PP Y Axis Pos 1 Moving Start

**58.**
```
~ (PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB009 AND PPXAxis.Post[12].LSComb.LS) AND RPPSelectDt.ZAxis[5].LSComb.LS AND /RPPSelectDt.YAxis[2].LSComb.LS AND /LB392 AND /LB396 AND /LB398 AND /LB399  ->  LB393
```
- `GSB009` Modify Ghani After Moving to Line
- `LB392` Ind. Move SM8 R Y Axis Pos. 1
- `LB396` Ind. Move SM8 R Y Axis Pos. 3
- `LB398` Ind. Move SM8 R Y Axis Pos. 4
- `LB399` Ind. Move SM8 R Y Axis Pos. 5
- `LB393` SM8 R Y Axis Pos 2 Move Cond.

**59.**
```
(LB111 AND LB393 OR LB394 AND LB1231) AND =() AND /RPPSelectDt.YAxis[2].LSComb.LS AND MOVE() AND /RCON_In_Axis6_Status_Signal.B[3]  ->  LB394
```
- `LB111` 品番検索完了
- `LB393` SM8 R Y Axis Pos 2 Move Cond.
- `LB394` Ind. Move SM8 R Y Axis Pos. 2
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**60.**
```
GSB001  ->  LB395
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB395` SM8 R Y Axis Pos 3 Move Cond.

**61.**
```
(LB111 AND LB395 OR LB396 AND LB1232) AND =() AND /RPPSelectDt.YAxis[3].LSComb.LS AND MOVE() AND /RCON_In_Axis6_Status_Signal.B[3]  ->  LB396
```
- `LB111` 品番検索完了
- `LB395` SM8 R Y Axis Pos 3 Move Cond.
- `LB396` Ind. Move SM8 R Y Axis Pos. 3
- `LB1232` Right PP Y Axis Pos 3 Moving Start

**62.**
```
GSB001  ->  LB397
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB397` SM8 R Y Axis Pos 4 Move Cond.

**63.**
```
(LB111 AND LB397 OR LB398 AND LB1233) AND =() AND /RPPSelectDt.YAxis[4].LSComb.LS AND MOVE() AND /RCON_In_Axis6_Status_Signal.B[3]  ->  LB398
```
- `LB111` 品番検索完了
- `LB397` SM8 R Y Axis Pos 4 Move Cond.
- `LB398` Ind. Move SM8 R Y Axis Pos. 4
- `LB1233` Right PP Y Axis Pos 4 Moving Start

**64.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB009 AND <()) AND RPPSelectDt.ZAxis[5].LSComb.LS AND /RPPSelectDt.YAxis[5].LSComb.LS AND /LB392 AND /LB394 AND /LB396 AND /LB398  ->  LB399A
```
- `GSB009` Modify Ghani After Moving to Line
- `LB392` Ind. Move SM8 R Y Axis Pos. 1
- `LB394` Ind. Move SM8 R Y Axis Pos. 2
- `LB396` Ind. Move SM8 R Y Axis Pos. 3
- `LB398` Ind. Move SM8 R Y Axis Pos. 4
- `LB399A` SM8 R Y Axis Pos 5 Move Cond.

**65.**
```
~ (LB111 AND LB399A AND =() OR LB340 AND /LB1250 AND PPXAxis.Post[2].LSComb.LS AND /GSB011 AND LB340 OR LB399 AND LB1234) AND /RPPSelectDt.YAxis[5].LSComb.LS AND MOVE() AND /RCON_In_Axis6_Status_Signal.B[3]  ->  LB399
```
- `LB111` 品番検索完了
- `LB340` Ind. Home Pos Return
- `LB1250` SM1 X Axis Moving Start
- `GSB009` Modify Ghani After Moving to Line
- `LB399A` SM8 R Y Axis Pos 5 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB399` Ind. Move SM8 R Y Axis Pos. 5
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**66. SM3 Left Rotary
=========================**
```
GSB001  ->  LB1301
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1301` SM3 L Rotary Axis Pos 1 Move Cond.

**67.**
```
(LB113 AND LB1301 OR LB1302 AND LB1220) AND =() AND /LPPSelectDt.Rotate[1].LSComb.LS AND MOVE() AND /RCON_In_Axis1_Status_Signal.B[3]  ->  LB1302
```
- `LB1301` SM3 L Rotary Axis Pos 1 Move Cond.
- `LB1302` Ind. Move SM3 L Rotary Pos. 1
- `LB1220` Left PP Rotate Unit Pos 1 Moving Start

**68.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS) AND RCON_In_Axis1_Status_Signal.B[1] AND LPPSelectDt.ZAxis[5].LSComb.LS AND LPPSelectDt.YAxis[5].LSComb.LS AND /LPPSelectDt.Rotate[2].LSComb.LS AND /LB1302 AND /LB1306 AND /LB1308 AND /LB1310  ->  LB1303
```
- `LB1302` Ind. Move SM3 L Rotary Pos. 1
- `LB1306` Ind. Move SM3 L Rotary Pos. 3
- `LB1308` Ind. Move SM3 L Rotary Pos. 4
- `LB1310` Ind. Move SM3 L Rotary Pos. 5
- `LB1303` SM3 L Rotary Axis Pos 2 Move Cond.

**69.**
```
(LB113 AND LB1303 OR LB1304 AND LB1221) AND =() AND /LPPSelectDt.Rotate[2].LSComb.LS AND MOVE() AND /RCON_In_Axis1_Status_Signal.B[3]  ->  LB1304
```
- `LB1303` SM3 L Rotary Axis Pos 2 Move Cond.
- `LB1304` Ind. Move SM3 L Rotary Pos. 2
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start

**70.**
```
GSB001  ->  LB1305
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1305` SM3 L Rotary Axis Pos 3 Move Cond.

**71.**
```
(LB113 AND LB1305 OR LB1306 AND LB1222) AND =() AND /LPPSelectDt.Rotate[3].LSComb.LS AND MOVE() AND /RCON_In_Axis1_Status_Signal.B[3]  ->  LB1306
```
- `LB1305` SM3 L Rotary Axis Pos 3 Move Cond.
- `LB1306` Ind. Move SM3 L Rotary Pos. 3
- `LB1222` Left PP Rotate Unit Pos 3 Moving Start

**72.**
```
GSB001  ->  LB1307
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1307` SM3 L Rotary Axis Pos 4 Move Cond.

**73.**
```
(LB113 AND LB1307 OR LB1308 AND LB1223) AND =() AND /LPPSelectDt.Rotate[4].LSComb.LS AND MOVE() AND /RCON_In_Axis1_Status_Signal.B[3]  ->  LB1308
```
- `LB1307` SM3 L Rotary Axis Pos 4 Move Cond.
- `LB1308` Ind. Move SM3 L Rotary Pos. 4
- `LB1223` Left PP Rotate Unit Pos 4 Moving Start

**74.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB009 AND >()) AND (RCON_In_Axis1_Status_Signal.B[1] AND /LPPSelectDt.Rotate[5].LSComb.LS OR /RCON_In_Axis1_Status_Signal.B[1] AND LB071) AND LPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND /LB1302 AND /LB1304 AND /LB1306 AND /LB1308  ->  LB1309
```
- `GSB009` Modify Ghani After Moving to Line
- `LB071` PX Pokayoke Homing Left Arm
- `LB1302` Ind. Move SM3 L Rotary Pos. 1
- `LB1304` Ind. Move SM3 L Rotary Pos. 2
- `LB1306` Ind. Move SM3 L Rotary Pos. 3
- `LB1308` Ind. Move SM3 L Rotary Pos. 4
- `LB1309` SM3 L Rotary Axis Pos 5 Move Cond.

**75.**
```
~ (LB113 OR LB340 AND PPXAxis.Post[2].LSComb.LS OR LB1310 AND LB1224 AND RCON_In_Axis1_Status_Signal.B[1] AND /LPPSelectDt.Rotate[5].LSComb.LS) AND LB1309 AND =() AND MOVE() AND /RCON_In_Axis1_Status_Signal.B[3]  ->  LB1310
```
- `LB340` Ind. Home Pos Return
- `GSB009` Modify Ghani After Moving to Line
- `LB1250` SM1 X Axis Moving Start
- `LB1309` SM3 L Rotary Axis Pos 5 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB1310` Ind. Move SM3 L Rotary Pos. 5
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start
- `LB1224A` Left Rotary Zero Position Start

**76. SM5 Left Gripper Unit
=========================**
```
GSB001  ->  LB1311
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1311` SM5 L Gripper Pos 1 Move Cond.

**77.**
```
(LB115 AND LB1311 OR LB1312 AND LB1225) AND =() AND /LPPSelectDt.Gripper[1].LSComb.LS AND MOVE() AND /RCON_In_Axis3_Status_Signal.B[3]  ->  LB1312
```
- `LB115` 検索品番有
- `LB1311` SM5 L Gripper Pos 1 Move Cond.
- `LB1312` Ind. Move SM5 L Gripper Pos. 1
- `LB1225` Left PP Chuck Unit Pos 1 Moving Start

**78.**
```
~ (PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[10].LSComb.LS) AND LPPSelectDt.ZAxis[2].LSComb.LS AND /LPPSelectDt.Gripper[2].LSComb.LS AND /LB1312 AND /LB1316 AND /LB1318 AND /LB1320  ->  LB1313
```
- `LB1312` Ind. Move SM5 L Gripper Pos. 1
- `LB1316` Ind. Move SM5 L Gripper Pos. 3
- `LB1318` Ind. Move SM5 L Gripper Pos. 4
- `LB1320` Ind. Move SM5 L Gripper Pos. 5
- `LB1313` SM5 L Gripper Pos 2 Move Cond.

**79.**
```
~ (LB115 AND LB1313 OR LB1314 AND LB1226) AND =() AND /LPPSelectDt.Gripper[2].LSComb.LS AND MOVE() AND /RCON_In_Axis3_Status_Signal.B[3]  ->  LB1314
```
- `LB115` 検索品番有
- `LB1313` SM5 L Gripper Pos 2 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB1314` Ind. Move SM5 L Gripper Pos. 2
- `LB1226` Left PP Chuck Unit Pos 2 Moving Start

**80.**
```
GSB001  ->  LB1315
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1315` SM5 L Gripper Pos 3 Move Cond.

**81.**
```
(LB115 AND LB1315 OR LB1316 AND LB1227) AND =() AND /LPPSelectDt.Gripper[3].LSComb.LS AND MOVE() AND /RCON_In_Axis3_Status_Signal.B[3]  ->  LB1316
```
- `LB115` 検索品番有
- `LB1315` SM5 L Gripper Pos 3 Move Cond.
- `LB1316` Ind. Move SM5 L Gripper Pos. 3
- `LB1227` Left PP Chuck Unit Pos 3 Moving Start

**82.**
```
GSB001  ->  LB1317
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1317` SM5 L Gripper Pos 4 Move Cond.

**83.**
```
(LB115 AND LB1317 OR LB1318 AND LB1228) AND =() AND /LPPSelectDt.Gripper[4].LSComb.LS AND MOVE() AND /RCON_In_Axis3_Status_Signal.B[3]  ->  LB1318
```
- `LB115` 検索品番有
- `LB1317` SM5 L Gripper Pos 4 Move Cond.
- `LB1318` Ind. Move SM5 L Gripper Pos. 4
- `LB1228` Left PP Chuck Unit Pos 4 Moving Start

**84.**
```
(PPXAxis.Post[2].LSComb.LS AND LPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.ZAxis[2].LSComb.LS OR PPXAxis.Post[5].LSComb.LS AND /LPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS) AND /LPPSelectDt.Gripper[5].LSComb.LS AND /LB1312 AND /LB1314 AND /LB1316 AND /LB1318  ->  LB1319
```
- `LB1312` Ind. Move SM5 L Gripper Pos. 1
- `LB1314` Ind. Move SM5 L Gripper Pos. 2
- `LB1316` Ind. Move SM5 L Gripper Pos. 3
- `LB1318` Ind. Move SM5 L Gripper Pos. 4
- `LB1319` SM5 L Gripper Pos 5 Move Cond.

**85.**
```
~ (LB115 AND LB1319 OR PB013_005 OR CH0000_09 OR LB1320 AND LB1229) AND (=() OR CH0000_09) AND /LPPSelectDt.Gripper[5].LSComb.LS AND MOVE() AND /RCON_In_Axis3_Status_Signal.B[3]  ->  LB1320
```
- `LB115` 検索品番有
- `LB1319` SM5 L Gripper Pos 5 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `CH0000_09` PB LEFT GRIPPER RELEASE [IOBus://unit#2/Input Bit 16 bits/Input Bit 09]
- `LB1320` Ind. Move SM5 L Gripper Pos. 5
- `LB1229` Left PP Chuck Unit Pos 5 Moving Start

**86. SM7 Left Z Axis
=========================**
```
GSB001  ->  LB1321
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1321` SM7 L Z Axis Pos 1 Move Cond.

**87.**
```
(LB117 AND LB1321 OR LB1322 AND LB1215) AND =() AND /LPPSelectDt.ZAxis[1].LSComb.LS AND MOVE() AND /RCON_In_Axis5_Status_Signal.B[3]  ->  LB1322
```
- `LB1321` SM7 L Z Axis Pos 1 Move Cond.
- `LB1322` Ind. Move SM7 L Z Axis Pos. 1
- `LB1215` Left PP Z Axis Pos 1 Moving Start

**88.**
```
~ (LPPSelectDt.Rotate[5].LSComb.LS AND PPXAxis.Post[2].LSComb.LS AND LPPSelectDt.Gripper[2].LSComb.LS AND LPPSelectDt.YAxis[2].LSComb.LS OR LPPSelectDt.YAxis[2].LSComb.LS AND LPPSelectDt.Rotate[2].LSComb.LS AND PPXAxis.Post[3].LSComb.LS AND RPPSelectDt.Gripper[5].LSComb.LS) AND /LPPSelectDt.ZAxis[2].LSComb.LS AND /LB1322 AND /LB1326 AND /LB1328 AND /LB1330  ->  LB1323
```
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `LB1322` Ind. Move SM7 L Z Axis Pos. 1
- `LB1326` Ind. Move SM7 L Z Axis Pos. 3
- `LB1328` Ind. Move SM7 L Z Axis Pos. 4
- `LB1330` Ind. Move SM7 L Z Axis Pos. 5
- `LB1323` SM7 L Z Axis Pos 2 Move Cond.

**89.**
```
(LB117 AND LB1323 OR LB1324 AND LB1216) AND =() AND /LPPSelectDt.ZAxis[2].LSComb.LS AND MOVE() AND /RCON_In_Axis5_Status_Signal.B[3]  ->  LB1324
```
- `LB1323` SM7 L Z Axis Pos 2 Move Cond.
- `LB1324` Ind. Move SM7 L Z Axis Pos. 2
- `LB1216` Left PP Z Axis Pos 2 Moving Start

**90.**
```
GSB001  ->  LB1325
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1325` SM7 L Z Axis Pos 3 Move Cond.

**91.**
```
(LB117 AND LB1325 OR LB1326 AND LB1217) AND =() AND /LPPSelectDt.ZAxis[3].LSComb.LS AND MOVE() AND /RCON_In_Axis5_Status_Signal.B[3]  ->  LB1326
```
- `LB1325` SM7 L Z Axis Pos 3 Move Cond.
- `LB1326` Ind. Move SM7 L Z Axis Pos. 3
- `LB1217` Left PP Z Axis Pos 3 Moving Start

**92.**
```
GSB001  ->  LB1327
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1327` SM7 L Z Axis Pos 4 Move Cond.

**93.**
```
(LB117 AND LB1327 OR LB1328 AND LB1218) AND =() AND /LPPSelectDt.ZAxis[4].LSComb.LS AND MOVE() AND /RCON_In_Axis5_Status_Signal.B[3]  ->  LB1328
```
- `LB1327` SM7 L Z Axis Pos 4 Move Cond.
- `LB1328` Ind. Move SM7 L Z Axis Pos. 4
- `LB1218` Left PP Z Axis Pos 4 Moving Start

**94.**
```
~ (PPXAxis.Post[2].LSComb.LS AND RPPSelectDt.Rotate[5].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[3].LSComb.LS AND RPPSelectDt.Rotate[2].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR GSB009 AND >()) AND /LB1322 AND /LB1324 AND /LB1326 AND /LB1328 AND /LPPSelectDt.ZAxis[5].LSComb.LS  ->  LB1329
```
- `GSB009` Modify Ghani After Moving to Line
- `LB1322` Ind. Move SM7 L Z Axis Pos. 1
- `LB1324` Ind. Move SM7 L Z Axis Pos. 2
- `LB1326` Ind. Move SM7 L Z Axis Pos. 3
- `LB1328` Ind. Move SM7 L Z Axis Pos. 4
- `LB1329` SM7 L Z Axis Pos 5 Move Cond.

**95.**
```
~ (LB117 OR GSB009 AND LB340 OR LB1330 AND LB1219) AND LB1329 AND (=() OR LB340) AND /LPPSelectDt.ZAxis[5].LSComb.LS AND MOVE() AND /RCON_In_Axis5_Status_Signal.B[3]  ->  LB1330
```
- `GSB009` Modify Ghani After Moving to Line
- `LB340` Ind. Home Pos Return
- `LB1329` SM7 L Z Axis Pos 5 Move Cond.
- `LB1330` Ind. Move SM7 L Z Axis Pos. 5
- `LB1219` Left PP Z Axis Pos 5 Moving Start

**96. SM9 Left Y Axis
=========================**
```
GSB001  ->  LB1331
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1331` SM9 L Y Axis Pos 1 Move Cond.

**97.**
```
(LB119 AND LB1331 OR LB1332 AND LB1210) AND =() AND /LPPSelectDt.YAxis[1].LSComb.LS AND MOVE() AND /RCON_In_Axis7_Status_Signal.B[3]  ->  LB1332
```
- `LB119` Auto Running Condition
- `LB1331` SM9 L Y Axis Pos 1 Move Cond.
- `LB1332` Ind. Move SM9 L Y Axis Pos. 1
- `LB1210` Left PP Y Axis Pos 1 Moving Start

**98.**
```
~ (PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB009 AND PPXAxis.Post[2].LSComb.LS) AND /LPPSelectDt.YAxis[2].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND /LB1332 AND /LB1336 AND /LB1338 AND /LB1340  ->  LB1333
```
- `GSB009` Modify Ghani After Moving to Line
- `LB1332` Ind. Move SM9 L Y Axis Pos. 1
- `LB1336` Ind. Move SM9 L Y Axis Pos. 3
- `LB1338` Ind. Move SM9 L Y Axis Pos. 4
- `LB1340` Ind. Move SM9 L Y Axis Pos. 5
- `LB1333` SM9 L Y Axis Pos 2 Move Cond.

**99.**
```
(LB119 AND LB1333 OR LB1334 AND LB1211) AND =() AND /LPPSelectDt.YAxis[2].LSComb.LS AND MOVE() AND /RCON_In_Axis7_Status_Signal.B[3]  ->  LB1334
```
- `LB119` Auto Running Condition
- `LB1333` SM9 L Y Axis Pos 2 Move Cond.
- `LB1334` Ind. Move SM9 L Y Axis Pos. 2
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**100.**
```
GSB001  ->  LB1335
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1335` SM9 L Y Axis Pos 3 Move Cond.

**101.**
```
(LB119 AND LB1335 OR LB1336 AND LB1212) AND =() AND /LPPSelectDt.YAxis[3].LSComb.LS AND MOVE() AND /RCON_In_Axis7_Status_Signal.B[3]  ->  LB1336
```
- `LB119` Auto Running Condition
- `LB1335` SM9 L Y Axis Pos 3 Move Cond.
- `LB1336` Ind. Move SM9 L Y Axis Pos. 3
- `LB1212` Left PP Y Axis Pos 3 Moving Start

**102.**
```
GSB001  ->  LB1337
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB1337` SM9 L Y Axis Pos 4 Move Cond.

**103.**
```
(LB119 AND LB1337 OR LB1338 AND LB1213) AND =() AND /LPPSelectDt.YAxis[4].LSComb.LS AND MOVE() AND /RCON_In_Axis7_Status_Signal.B[3]  ->  LB1338
```
- `LB119` Auto Running Condition
- `LB1337` SM9 L Y Axis Pos 4 Move Cond.
- `LB1338` Ind. Move SM9 L Y Axis Pos. 4
- `LB1213` Left PP Y Axis Pos 4 Moving Start

**104.**
```
~ (PPXAxis.Post[2].LSComb.LS OR PPXAxis.Post[3].LSComb.LS OR PPXAxis.Post[4].LSComb.LS OR PPXAxis.Post[5].LSComb.LS OR PPXAxis.Post[10].LSComb.LS OR PPXAxis.Post[12].LSComb.LS OR PPXAxis.Post[13].LSComb.LS OR PPXAxis.Post[14].LSComb.LS OR GSB011 AND >()) AND /LPPSelectDt.YAxis[5].LSComb.LS AND LPPSelectDt.ZAxis[5].LSComb.LS AND /LB1332 AND /LB1334 AND /LB1336 AND /LB1338  ->  LB1339
```
- `GSB011` Ghani_Trial W/O Product
- `LB1332` Ind. Move SM9 L Y Axis Pos. 1
- `LB1334` Ind. Move SM9 L Y Axis Pos. 2
- `LB1336` Ind. Move SM9 L Y Axis Pos. 3
- `LB1338` Ind. Move SM9 L Y Axis Pos. 4
- `LB1339` SM9 L Y Axis Pos 5 Move Cond.

**105.**
```
~ (LB119 OR LB340 AND /LB1250 AND PPXAxis.Post[2].LSComb.LS OR LB1340 AND LB1214) AND (LB1339 AND =() OR /GSB011 AND LB340) AND /LPPSelectDt.YAxis[5].LSComb.LS AND MOVE() AND /RCON_In_Axis7_Status_Signal.B[3]  ->  LB1340
```
- `LB119` Auto Running Condition
- `LB340` Ind. Home Pos Return
- `LB1250` SM1 X Axis Moving Start
- `GSB009` Modify Ghani After Moving to Line
- `LB1339` SM9 L Y Axis Pos 5 Move Cond.
- `GSB011` Ghani_Trial W/O Product
- `LB1340` Ind. Move SM9 L Y Axis Pos. 5
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**106.**
```
MCR()
```

## P012_ATS3_Unit / Auto_Running


**1. AUTO MOTION ATS3 UNIT
===================**
```
(LB309 OR LB400[1]) AND /LB409 AND /CYCLE_STOPPING AND AUTO_RUN AND /LB400[2]  ->  LB400[1]
```
- `LB309` Unit 1 Cycle Start Condition
- `LB409` WIP Transfer Cycle Complete
- `CYCLE_STOPPING` Cycle Stopping
- `AUTO_RUN` Auto Running

**2.**
```
(LB409 OR LB400[2]) AND LB400[3] AND LB400[1]  ->  LB400[2]
```
- `LB409` WIP Transfer Cycle Complete

**3.**
```
~ (LB459 OR LB509 OR LB559 OR LB609 OR LB659 OR LB709 OR LB759 OR LB809)  ->  LB409
```
- `LB459` Flash 2 Cover Close Complete
- `LB509` Shutter FG 1 Cycle Complete
- `LB559` MRC3 Take In Operation Complete
- `LB609` MRC3 Take Out Operation Complete
- `LB659` Flash 1 Take In Operation Complete
- `LB709` Flash 1 Take Out Operation Complete
- `LB759` Flash 2 Take In Operation Complete
- `LB809` Flash 2 Take Out Operation Complete
- `LB409` WIP Transfer Cycle Complete

**4. 1 CYCLE MOTION START
====================**
```
(LB400[1] OR LB320)  ->  LB400[3]
```
- `LB320` Unit  1 Cycle Operation Start

**5.**
```
~ LB400[3] AND (LB300 AND /LB402 AND /LB403 AND /LB404 AND /LB405 AND /LB406 AND /LB407 AND /LB408 OR LB401 OR LB301 AND /LB401 AND /LB403 AND /LB404 AND /LB405 AND /LB406 AND /LB407 AND /LB408 OR LB402 OR LB302 AND /LB401 AND /LB402 AND /LB404 AND /LB405 AND /LB406 AND /LB407 AND /LB408 OR LB403 OR LB303 AND /LB401 AND /LB402 AND /LB403 AND /LB405 AND /LB406 AND /LB407 AND /LB408 OR LB404 OR LB304 AND /LB401 AND /LB402 AND /LB403 AND /LB404 AND /LB406 AND /LB407 AND /LB408 OR LB405 OR LB305 AND /LB401 AND /LB402 AND /LB403 AND /LB404 AND /LB405 AND /LB407 AND /LB408 OR LB406 OR LB306 AND /LB401 AND /LB402 AND /LB403 AND /LB404 AND /LB405 AND /LB406 AND /LB408 OR LB407 OR LB307 AND /LB401 AND /LB402 AND /LB403 AND /LB404 AND /LB405 AND /LB406 AND /LB407 OR LB408)  ->  LB401, LB402, LB403, LB404, LB405, LB406, LB407, LB408
```
- `LB300` WIP Transfer Cond.
- `LB401` WIP Transfer Motion
- `LB402` WIP Return Motion
- `LB403` Flash 2 Processing Motion
- `LB404` MRC3 Take Out Operation
- `LB405` Flash 1 Take In Operation
- `LB406` Flash 1 Take Out Operation
- `LB407` Flash 2 Take In Operation
- `LB408` Flash 2 Take Out Operation
- `LB301` WIP Return Cond.
- `LB303` MRC Take Out Condition
- `LB304` WIP Transfer 1 Cycle Condition
- `LB305` Shutter FG Motion Start
- `LB306` Flash 2 Take In Cond.
- `LB307` Flash 2 Take Out Cond.

**6. WIP TAKE IN MOTION : Left Arm
===============================**
```
LB401 AND (GSB009 OR /GSB009) AND (LB1000 AND MOVE() OR LB420 AND GSB009 AND MOVE())  ->  LB420
```
- `LB401` WIP Transfer Motion
- `GSB009` Modify Ghani After Moving to Line
- `LB1000` Air Blow Process Start
- `LB420` WIP Take In Operation Start

**7.**
```
~ LB420 AND (PPXAxis.Post[5].LSComb.LS OR LB421 OR /LB421) AND /LB422  ->  LB421, LB422
```
- `LB420` WIP Take In Operation Start
- `LB421` PNP at WIP Pos Confirm.
- `LB422` PNP not at WIP Pos Confirm.

**8.**
```
LB422  ->  LB423
```
- `LB422` PNP not at WIP Pos Confirm.
- `LB423` Auto Continue : PNP Move To WIP Pos.

**9.**
```
~ LB423 AND (/LB425 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB427 AND MOVE() OR LB425 OR LB425 AND /LB1204 AND /PPXAxis.Post[5].LSComb.LS AND /LB427 OR LB426 OR LB1204 AND LB1551 AND LB1552 AND /LB427 OR LB426A OR LB426A AND PPXAxis.Post[5].LSComb.LS OR LB427)  ->  LB424, LB425, LB426, LB426A, LB427
```
- `LB423` Auto Continue : PNP Move To WIP Pos.
- `LB425` PNP Moving Interlock Confirm.
- `LB424` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB427` PNP Move To WIP Take In Pos Complete
- `LB1204` X Axis Pos 5 [WIP Take In] Moving Start
- `LB426` PNP Move To WIP Take In Pos Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB426A` PNP Move To WIP Take In Pos Running

**10.**
```
~ LB420 AND (LPPSelectDt.Rotate[5].LSComb.LS OR LB428 OR /LB428) AND /LB429  ->  LB428, LB429
```
- `LB420` WIP Take In Operation Start
- `LB428` Left Arm Chuck at Return Pos. Confirm.
- `LB429` Left Arm Chuck not at Return Pos.

**11.**
```
~ LB429 AND (/LB1253 AND /LB431 OR LB430 OR LB1224 AND LPPSelectDt.Rotate[5].LSComb.LS OR LB431) AND MOVE()  ->  LB430, LB431
```
- `LB429` Left Arm Chuck not at Return Pos.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB430` Left Arm Chuck Return Operation Start
- `LB431` Left Arm Chuck Return Complete
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start

**12.**
```
~ LB420 AND (RPPSelectDt.Rotate[5].LSComb.LS OR LB432 OR /LB432) AND /LB433  ->  LB432, LB433
```
- `LB420` WIP Take In Operation Start
- `LB432` Right Arm Chuck at Return Pos. Confirm.
- `LB433` Right Arm Chuck not at Return Pos.

**13.**
```
~ LB433 AND (/LB1258 AND /LB435 OR LB434 OR LB1244 AND RPPSelectDt.Rotate[5].LSComb.LS OR LB435) AND MOVE()  ->  LB434, LB435
```
- `LB433` Right Arm Chuck not at Return Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB434` Right Arm Chuck Return Operation Start
- `LB435` Right Arm Chuck Return Complete
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**14.**
```
~ LB420 AND (LPPSelectDt.YAxis[5].LSComb.LS OR LB440 OR /LB440) AND /LB441  ->  LB440, LB441
```
- `LB420` WIP Take In Operation Start
- `LB440` Left Arm Y Axis at BWD Pos. Confirm.
- `LB441` Left Arm Y Axis not at BWD Pos.

**15.**
```
~ LB420 AND (RPPSelectDt.YAxis[5].LSComb.LS OR LB442 OR /LB442) AND /LB443  ->  LB442, LB443
```
- `LB420` WIP Take In Operation Start
- `LB442` Right Arm Y Axis at BWD Pos. Confirm.
- `LB443` Right Arm Y Axis not at BWD Pos.

**16.**
```
~ LB441 AND (/LB1251 AND /LB445 OR LB444 OR LB1214 AND LPPSelectDt.YAxis[5].LSComb.LS OR LB445) AND MOVE()  ->  LB444, LB445
```
- `LB441` Left Arm Y Axis not at BWD Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB444` Left Arm Y Axis BWD Operation Start
- `LB445` Left Arm Y Axis BWD Complete
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**17.**
```
~ LB443 AND (/LB1256 AND /LB447 OR LB446 OR LB1234 AND RPPSelectDt.YAxis[5].LSComb.LS OR LB447) AND MOVE()  ->  LB446, LB447
```
- `LB443` Right Arm Y Axis not at BWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB446` Right Arm Y Axis BWD Operation Start
- `LB447` Right Arm Y Axis BWD Complete
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**18.**
```
~ LB420 AND (LB421 AND LB428 AND LB432 AND LB440 AND LB442 AND GSB009 OR LB422 AND LB427 AND LB429 AND LB431 AND LB433 AND LB435 AND LB441 AND LB445 AND LB443 AND LB447 AND /GSB009) AND GB011_022 AND GB011_024 AND PPWIPAxis.Post[2].LSComb.LS  ->  LB449
```
- `LB420` WIP Take In Operation Start
- `LB421` PNP at WIP Pos Confirm.
- `LB422` PNP not at WIP Pos Confirm.
- `LB427` PNP Move To WIP Take In Pos Complete
- `LB428` Left Arm Chuck at Return Pos. Confirm.
- `LB429` Left Arm Chuck not at Return Pos.
- `LB431` Left Arm Chuck Return Complete
- `LB432` Right Arm Chuck at Return Pos. Confirm.
- `LB433` Right Arm Chuck not at Return Pos.
- `LB435` Right Arm Chuck Return Complete
- `LB440` Left Arm Y Axis at BWD Pos. Confirm.
- `LB441` Left Arm Y Axis not at BWD Pos.
- `LB445` Left Arm Y Axis BWD Complete
- `LB442` Right Arm Y Axis at BWD Pos. Confirm.
- `LB443` Right Arm Y Axis not at BWD Pos.
- `LB447` Right Arm Y Axis BWD Complete
- `GSB009` Modify Ghani After Moving to Line
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `LB449` WIP Transfer Cycle Complete

**19.**
```
~ LB449 AND (/LB900 AND /LB451 OR LB450 OR LB900 AND LB949 AND LB2009 OR LB451)  ->  LB450, LB451
```
- `LB449` WIP Transfer Cycle Complete
- `LB900` Left Arm Take In Operation Start
- `LB450` WIP Return Motion Start
- `LB451` SM10 BWD Motion Starting
- `LB949` Left Arm Take In Operation Complete
- `LB2009` WIP Take In Compl. Memory

**20.**
```
LB451  ->  LB459
```
- `LB451` SM10 BWD Motion Starting
- `LB459` Flash 2 Cover Close Complete

**21. WIP TAKE OUT MOTION : Left Arm
===============================**
```
LB402 AND (GSB009 OR /GSB009) AND (LB1000 AND MOVE() OR LB460 AND GSB009 AND MOVE())  ->  LB460
```
- `LB402` WIP Return Motion
- `GSB009` Modify Ghani After Moving to Line
- `LB1000` Air Blow Process Start
- `LB460` WIP Take Out Operation Start

**22.**
```
~ LB460 AND (PPXAxis.Post[10].LSComb.LS OR LB461 OR /LB461) AND /LB462  ->  LB461, LB462
```
- `LB460` WIP Take Out Operation Start
- `LB461` PNP at WIP Pos Confirm
- `LB462` PNP not at WIP Pos Confirm.

**23.**
```
LB462  ->  LB463
```
- `LB462` PNP not at WIP Pos Confirm.
- `LB463` Auto Continue : PNP Move to WIP Pos.

**24.**
```
~ LB463 AND (/LB465 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB467 AND MOVE() OR LB465 OR LB465 AND /LB1209 AND /PPXAxis.Post[10].LSComb.LS AND /LB467 OR LB466 OR LB1209 AND LB1551 AND LB1552 AND /LB467 OR LB466A OR LB466A AND PPXAxis.Post[10].LSComb.LS OR LB467)  ->  LB464, LB465, LB466, LB466A, LB467
```
- `LB463` Auto Continue : PNP Move to WIP Pos.
- `LB465` PNP Moving Interlock Confirm.
- `LB464` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB467` PNP Moving to WIP Take Out Pos Complete
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB466` PNP Moving to WIP Take Out Pos Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB466A` PNP Moving to WIP Take Out Pos Running

**25.**
```
~ LB460 AND (LPPSelectDt.Rotate[5].LSComb.LS OR LB468 OR /LB468) AND /LB469  ->  LB468, LB469
```
- `LB460` WIP Take Out Operation Start
- `LB468` Left Arm Chuck at Return Pos. Confirm.
- `LB469` Left Arm Chuck not at Return Pos.

**26.**
```
~ LB469 AND (/LB1253 AND /LB471 OR LB470 OR LB1224 AND LPPSelectDt.Rotate[5].LSComb.LS OR LB471) AND MOVE()  ->  LB470, LB471
```
- `LB469` Left Arm Chuck not at Return Pos.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB470` Left Arm Chuck Return Operartion Start
- `LB471` Left Arm Chuck Return Complete
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start

**27.**
```
~ LB460 AND (LPPSelectDt.YAxis[5].LSComb.LS OR LB472 OR /LB472) AND /LB473  ->  LB472, LB473
```
- `LB460` WIP Take Out Operation Start
- `LB472` Left Arm Y Axis at BWD Pos. Confirm.
- `LB473` Left Arm Y Axis not at BWD Pos.

**28.**
```
~ LB473 AND (/LPPSelectDt.YAxis[5].LSComb.LS AND /LB475 OR LB474 OR LB1214 AND LPPSelectDt.YAxis[5].LSComb.LS OR LB475) AND MOVE()  ->  LB474, LB475
```
- `LB473` Left Arm Y Axis not at BWD Pos.
- `LB474` Left Arm Y Axis BWD Operation Start
- `LB475` Left Arm Y Axis BWD Complete
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**29.**
```
~ LB460 AND (RPPSelectDt.Rotate[5].LSComb.LS OR LB476 OR /LB476) AND /LB477  ->  LB476, LB477
```
- `LB460` WIP Take Out Operation Start
- `LB476` Right Arm Chuck at Return Pos. Confirm.
- `LB477` Right Arm Chuck not at Return Pos.

**30.**
```
~ LB477 AND (/LB1258 AND /LB479 OR LB478 OR LB1244 AND RPPSelectDt.Rotate[5].LSComb.LS OR LB479) AND MOVE()  ->  LB478, LB479
```
- `LB477` Right Arm Chuck not at Return Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB478` Right Arm Chuck Return Operartion Start
- `LB479` Right Arm Chuck Return Complete
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**31.**
```
~ LB460 AND (RPPSelectDt.YAxis[5].LSComb.LS OR LB480 OR /LB480) AND /LB481  ->  LB480, LB481
```
- `LB460` WIP Take Out Operation Start
- `LB480` Right Arm Y Axis at BWD Pos. Confirm.
- `LB481` Right Arm Y Axis not at BWD Pos.

**32.**
```
~ LB481 AND (/LB1234 AND /LB483 OR LB482 OR LB1234 AND RPPSelectDt.YAxis[5].LSComb.LS OR LB483) AND MOVE()  ->  LB482, LB483
```
- `LB481` Right Arm Y Axis not at BWD Pos.
- `LB1234` Right PP Y Axis Pos 5 Moving Start
- `LB482` Right Arm Y Axis BWD Operation Start
- `LB483` Right Arm Y Axis BWD Complete

**33.**
```
LB460 AND (LB461 AND LB468 AND LB472 AND LB476 AND LB480 OR LB462 AND LB467 AND LB469 AND LB471 AND LB473 AND LB475 AND LB477 AND LB479 AND LB481 AND LB483)  ->  LB499
```
- `LB460` WIP Take Out Operation Start
- `LB461` PNP at WIP Pos Confirm
- `LB462` PNP not at WIP Pos Confirm.
- `LB467` PNP Moving to WIP Take Out Pos Complete
- `LB468` Left Arm Chuck at Return Pos. Confirm.
- `LB469` Left Arm Chuck not at Return Pos.
- `LB471` Left Arm Chuck Return Complete
- `LB472` Left Arm Y Axis at BWD Pos. Confirm.
- `LB473` Left Arm Y Axis not at BWD Pos.
- `LB475` Left Arm Y Axis BWD Complete
- `LB476` Right Arm Chuck at Return Pos. Confirm.
- `LB477` Right Arm Chuck not at Return Pos.
- `LB479` Right Arm Chuck Return Complete
- `LB480` Right Arm Y Axis at BWD Pos. Confirm.
- `LB481` Right Arm Y Axis not at BWD Pos.
- `LB483` Right Arm Y Axis BWD Complete
- `LB499` WIP Return Cycle Complete

**34.**
```
~ LB499 AND (/LB901 AND /LB501 OR LB500 OR LB901 AND LB999 OR LB501)  ->  LB500, LB501
```
- `LB499` WIP Return Cycle Complete
- `LB901` Left Arm Take Out Operation Start
- `LB501` Shutter FG Motion
- `LB999` Left Arm Take Out Operation Complete

**35.**
```
LB501  ->  LB509
```
- `LB501` Shutter FG Motion
- `LB509` Shutter FG 1 Cycle Complete

**36. MRC3 TAKE IN MOTION : Left Arm
===============================**
```
LB403 AND (GSB009 OR /GSB009) AND (LB1001 AND MOVE() OR LB510 AND GSB009 AND MOVE())  ->  LB510
```
- `LB403` Flash 2 Processing Motion
- `GSB009` Modify Ghani After Moving to Line
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB510` Shutter FG Motion Start

**37.**
```
~ LB510 AND (PPXAxis.Post[2].LSComb.LS OR LB511 OR /LB511) AND /LB512  ->  LB511, LB512
```
- `LB510` Shutter FG Motion Start
- `LB511` Auto : Cover Shutter Open Start
- `LB512` Cover Shutter Open Confirm.

**38.**
```
LB512  ->  LB513
```
- `LB512` Cover Shutter Open Confirm.
- `LB513` Product Take In to Shutter Confirm.

**39.**
```
~ LB512 AND (/LB515 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB517 AND MOVE() OR LB515 OR LB515 AND /LB1201 AND /PPXAxis.Post[2].LSComb.LS AND /LB517 OR LB516 OR LB1201 AND LB1551 AND LB1552 AND /LB517 OR LB516A OR LB516A AND PPXAxis.Post[2].LSComb.LS OR LB517)  ->  LB514, LB515, LB516, LB516A, LB517
```
- `LB512` Cover Shutter Open Confirm.
- `LB515` Auto : Cover Shutter Close Start
- `LB514` Safety Confirm. [Sensor is OFF]
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB517` Additional Chutter No Need to Move
- `LB1201` X Axis Pos 2 [MRC3 Take In] Moving Start
- `LB516` Cover Shutter Close Confirm.
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB516A` PNP Moving to MRC3 Take In Pos.  Running

**40.**
```
~ (/GSB009 AND LB510 AND LPPSelectDt.Rotate[5].LSComb.LS OR GSB009 AND LB512 AND LB518) AND /LB519  ->  LB518, LB519
```
- `GSB009` Modify Ghani After Moving to Line
- `LB510` Shutter FG Motion Start
- `LB512` Cover Shutter Open Confirm.
- `LB511` Auto : Cover Shutter Open Start
- `LB518` Additional Chutter Move Close
- `LB519` Auto : Additional Chutter Close Start

**41.**
```
~ LB519 AND (/LB1253 AND /LB521 OR LB520 OR LB1220 AND LPPSelectDt.Rotate[5].LSComb.LS OR LB521) AND MOVE()  ->  LB520, LB521
```
- `LB519` Auto : Additional Chutter Close Start
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB520` Additional Chutter Close Confirm.
- `LB521` Left Arm Chuck Return Complete
- `LB1220` Left PP Rotate Unit Pos 1 Moving Start

**42.**
```
~ (/GSB009 AND LB510 AND LPPSelectDt.YAxis[2].LSComb.LS OR GSB009 AND LB512 AND LB522) AND /LB523  ->  LB522, LB523
```
- `GSB009` Modify Ghani After Moving to Line
- `LB510` Shutter FG Motion Start
- `LB512` Cover Shutter Open Confirm.
- `LB511` Auto : Cover Shutter Open Start
- `LB522` Left Arm Y Axis at FWD Pos. Confirm.
- `LB523` Left Arm Y Axis not at FWD Pos.

**43.**
```
~ LB523 AND (/LB1251 AND /LB525 OR LB524 OR LB1211 AND LPPSelectDt.YAxis[2].LSComb.LS OR LB525) AND MOVE()  ->  LB524, LB525
```
- `LB523` Left Arm Y Axis not at FWD Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB524` Left Arm Y Axis FWD Operation Start
- `LB525` Left Arm Y Axis FWD Complete
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**44.**
```
LB510 AND (LB511 AND LB518 AND LB522 OR LB512 AND LB517 AND LB519 AND LB521 AND LB523 AND LB525)  ->  LB529
```
- `LB510` Shutter FG Motion Start
- `LB511` Auto : Cover Shutter Open Start
- `LB512` Cover Shutter Open Confirm.
- `LB517` Additional Chutter No Need to Move
- `LB518` Additional Chutter Move Close
- `LB519` Auto : Additional Chutter Close Start
- `LB521` Left Arm Chuck Return Complete
- `LB522` Left Arm Y Axis at FWD Pos. Confirm.
- `LB523` Left Arm Y Axis not at FWD Pos.
- `LB525` Left Arm Y Axis FWD Complete
- `LB529` Shutter FG Motion Compl.

**45.**
```
~ LB529 AND (/LB900 AND /LB531 OR LB530 OR LB900 AND LB949 OR LB531)  ->  LB530, LB531
```
- `LB529` Shutter FG Motion Compl.
- `LB900` Left Arm Take In Operation Start
- `LB530` Left Arm MRC3 Take In Operation Start
- `LB531` Left Arm MRC3 Take In Complete
- `LB949` Left Arm Take In Operation Complete

**46.**
```
~ (LB531 AND GSB009 AND RPPSelectDt.Gripper[2].LSComb.LS OR /GSB009 AND LB5533 AND LB532) AND /LB533  ->  LB532, LB533
```
- `LB531` Left Arm MRC3 Take In Complete
- `GSB009` Modify Ghani After Moving to Line
- `LB5533` Left Arm Y Axis BWD Complete
- `LB532` Right Gripper is Chuck : No Moving to WIP
- `LB533` Right Gripper is Unchuck : Moving To WIP

**47.**
```
~ GSB021 AND LB532 AND (FLASH1_DISABLE AND /LB532B AND /LB532C OR LB532A OR FLASH2_DISABLE AND /LB532A AND /LB532C OR LB532B OR /LB532A AND /LB532B)  ->  LB532A, LB532B, LB532C
```
- `GSB021` Add Sequence when Flash Breakdown
- `LB532` Right Gripper is Chuck : No Moving to WIP
- `FLASH1_DISABLE` Flash 1 Disable
- `LB532A` Flash 1 is Disabled
- `LB532B` Flash 2 is Disabled
- `LB532C` All Flash is USED
- `FLASH2_DISABLE` Flash 2 Disable

**48.**
```
~ GSB021 AND LB532A AND (GB015_010 OR GB015_012 OR /LB3000) AND /LB3001  ->  LB3000, LB3001
```
- `GSB021` Add Sequence when Flash Breakdown
- `LB532A` Flash 1 is Disabled
- `GB015_010` Flash 2 Process Compl.
- `GB015_012` PH Flash 2 No Product Confirm.
- `LB3001` Flash 2 Not Ready to Take In : ATS Move to Parking Area
- `LB3000` Flash 2 Ready to Take In : ATS No Need to Move

**49.**
```
~ GSB021 AND LB532B AND (GB014_010 OR GB014_012 OR /LB3010) AND /LB3011  ->  LB3010, LB3011
```
- `GSB021` Add Sequence when Flash Breakdown
- `LB532B` Flash 2 is Disabled
- `GB014_010` Flash 1 Process Compl.
- `GB014_012` Flash 1 No Product Confirm.
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3010` Flash 1 Ready to Take In : ATS No Need to Move

**50. Add Sequence : Move to Park Area when Flash 1 is Disable
Park Area : Flash 1 Take In Position**
```
LB3001  ->  LB3100
```
- `LB3001` Flash 2 Not Ready to Take In : ATS Move to Parking Area
- `LB3100` ATS Move to Park Area [Flash 1 Take In Pos] Start

**51.**
```
~ LB3100 AND (/LB3102 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB3105 AND MOVE() OR LB3102 OR LB3102 AND /LB1202A AND /PPXAxis.Post[13].LSComb.LS AND /LB3105 OR LB3103 OR LB1202A AND LB1551 AND LB1552 AND /LB3105 OR LB3104 OR LB3104 AND PPXAxis.Post[13].LSComb.LS OR LB3105)  ->  LB3101, LB3102, LB3103, LB3104, LB3105
```
- `LB3100` ATS Move to Park Area [Flash 1 Take In Pos] Start
- `LB3102` PNP Moving Interlock Confirm.
- `LB3101` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB3105` PNP Move to Park Area [Flash 1 Take In] Complete
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB3103` PNP Moving to Park Area [Flash 1 Take In Pos.] Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB3104` PNP Moving to Park Area [Flash 1 Take In Pos.] Running

**52. Add Sequence : Move to Park Area when Flash 2 is Disable
Park Area : Flash 2 Take In Position**
```
GSB021 AND LB3011  ->  LB3150
```
- `GSB021` Add Sequence when Flash Breakdown
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3150` ATS Move to Park Area [Flash 2 Take In Pos] Start

**53.**
```
~ LB3150 AND (/LB3152 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB3155 AND MOVE() OR LB3152 OR LB3152 AND /LB1203 AND /PPXAxis.Post[4].LSComb.LS AND /LB3155 OR LB3153 OR LB1203 AND LB1551 AND LB1552 AND /LB3155 OR LB3154 OR LB3154 AND PPXAxis.Post[4].LSComb.LS OR LB3155)  ->  LB3151, LB3152, LB3153, LB3154, LB3155
```
- `LB3150` ATS Move to Park Area [Flash 2 Take In Pos] Start
- `LB3152` PNP Moving Interlock Confirm.
- `LB3151` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB3155` PNP Move to Park Area [Flash 2 Take Out] Complete
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB3153` PNP Moving to Park Area [Flash 2 Take Out Pos.] Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB3154` PNP Moving to Park Area [Flash 2 Take Out Pos.] Running

**54.**
```
GSB009 AND LB533  ->  LB5531
```
- `GSB009` Modify Ghani After Moving to Line
- `LB533` Right Gripper is Unchuck : Moving To WIP
- `LB5531` Auto Continue : Arm & ATS Home Pos.

**55.**
```
~ GSB009 AND LB5531 AND (/LPPSelectDt.YAxis[5].LSComb.LS AND /LB5533 OR LB5532 OR LB1214 AND LPPSelectDt.YAxis[5].LSComb.LS OR LB5533) AND MOVE()  ->  LB5532, LB5533
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5531` Auto Continue : Arm & ATS Home Pos.
- `LB5532` Left Arm Y Axis BWD Operation Start
- `LB5533` Left Arm Y Axis BWD Complete
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**56.**
```
~ LB5531 AND (/LB535 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB537 AND MOVE() OR LB535 OR LB535 AND /LB1209 AND /PPXAxis.Post[10].LSComb.LS AND /LB537 OR LB536 OR LB1209 AND LB1551 AND LB1552 AND /LB537 OR LB536A OR LB536A AND PPXAxis.Post[10].LSComb.LS OR LB537)  ->  LB534, LB535, LB536, LB536A, LB537
```
- `LB5531` Auto Continue : Arm & ATS Home Pos.
- `LB535` PNP Moving Interlock Confirm.
- `LB534` PNP Moving Interlock Request.
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB537` PNP Moving to WIP Take Out Pos. Compl.
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB536` PNP Moving to WIP Take Out Pos. Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB536A` PNP Moving to WIP Take Out Pos. Running

**57.**
```
~ (LB532 AND LB532A AND LB3000 OR LB533 AND LB5533 AND LB537)  ->  LB559
```
- `LB532` Right Gripper is Chuck : No Moving to WIP
- `LB532A` Flash 1 is Disabled
- `LB3000` Flash 2 Ready to Take In : ATS No Need to Move
- `LB3001` Flash 2 Not Ready to Take In : ATS Move to Parking Area
- `LB3105` PNP Move to Park Area [Flash 1 Take In] Complete
- `LB532B` Flash 2 is Disabled
- `LB3010` Flash 1 Ready to Take In : ATS No Need to Move
- `LB3011` Flash 1 Not Ready to Take In : ATS Move to Parking Area
- `LB3155` PNP Move to Park Area [Flash 2 Take Out] Complete
- `LB532C` All Flash is USED
- `LB533` Right Gripper is Unchuck : Moving To WIP
- `LB5533` Left Arm Y Axis BWD Complete
- `LB537` PNP Moving to WIP Take Out Pos. Compl.
- `LB559` MRC3 Take In Operation Complete

**58. MRC3 TAKE OUT MOTION : Right Arm
===============================**
```
LB404 AND (GSB009 OR /GSB009) AND (LB1001 AND MOVE() OR LB560 AND GSB009 AND MOVE())  ->  LB560
```
- `LB404` MRC3 Take Out Operation
- `GSB009` Modify Ghani After Moving to Line
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB560` MRC3 Take Out Operation Start

**59.**
```
~ LB560 AND (PPXAxis.Post[12].LSComb.LS OR LB561 OR /LB561) AND /LB562  ->  LB561, LB562
```
- `LB560` MRC3 Take Out Operation Start
- `LB561` PNP at MRC3 Pos. Confim.
- `LB562` PNP not at MRC3 Pos.

**60.**
```
LB562  ->  LB563
```
- `LB562` PNP not at MRC3 Pos.
- `LB563` Auto Continue : PNP Move to MRC3 Pos.

**61.**
```
~ LB563 AND (/LB565 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB567 AND MOVE() OR LB565 OR LB565 AND /LB1201A AND /PPXAxis.Post[12].LSComb.LS AND /LB567 OR LB566 OR LB1201A AND LB1551 AND LB1552 AND /LB567 OR LB566A OR LB566A AND PPXAxis.Post[12].LSComb.LS OR LB567)  ->  LB564, LB565, LB566, LB566A, LB567
```
- `LB563` Auto Continue : PNP Move to MRC3 Pos.
- `LB565` PNP Moving Interlock Confirm.
- `LB564` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB567` PNP Move to MRC3 Take Out Pos. Completet
- `LB1201A` X Axis Pos 12 [MRC3 Take Out] Moving Start
- `LB566` PNP Move to MRC3 Take Out Pos. Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB566A` PNP Move to MRC3 Take Out Pos. Running

**62.**
```
~ (/GSB009 AND LB560 AND RPPSelectDt.Rotate[5].LSComb.LS OR GSB009 AND LB562 AND LB568) AND /LB569  ->  LB568, LB569
```
- `GSB009` Modify Ghani After Moving to Line
- `LB560` MRC3 Take Out Operation Start
- `LB562` PNP not at MRC3 Pos.
- `LB561` PNP at MRC3 Pos. Confim.
- `LB568` Right Arm Chuck at Return Pos. Confirm.
- `LB569` Right Arm Chuck not at Return Pos.

**63.**
```
~ LB569 AND (/LB1258 AND /LB571 OR LB570 OR LB1244 AND RPPSelectDt.Rotate[5].LSComb.LS OR LB571) AND MOVE()  ->  LB570, LB571
```
- `LB569` Right Arm Chuck not at Return Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB570` Right Arm Chuck Return Operation Start
- `LB571` Right Arm Chuck Return Complete
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**64.**
```
~ (/GSB009 AND LB560 AND RPPSelectDt.YAxis[2].LSComb.LS OR GSB009 AND LB562 AND LB572) AND /LB573  ->  LB572, LB573
```
- `GSB009` Modify Ghani After Moving to Line
- `LB560` MRC3 Take Out Operation Start
- `LB562` PNP not at MRC3 Pos.
- `LB561` PNP at MRC3 Pos. Confim.
- `LB572` Right Arm Y Axis at FWD Pos. Confirm.
- `LB573` Right Arm Y Axis not at FWD Pos.

**65.**
```
~ LB573 AND (/LB1256 AND /LB575 OR LB574 OR LB1231 AND RPPSelectDt.YAxis[2].LSComb.LS OR LB575) AND MOVE()  ->  LB574, LB575
```
- `LB573` Right Arm Y Axis not at FWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB574` Right Arm Y Axis FWD Operation Start
- `LB575` Right Arm Y Axis FWD Complete
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**66.**
```
LB560 AND (LB561 AND LB568 AND LB572 OR LB562 AND LB567 AND LB569 AND LB571 AND LB573 AND LB575)  ->  LB579
```
- `LB560` MRC3 Take Out Operation Start
- `LB561` PNP at MRC3 Pos. Confim.
- `LB562` PNP not at MRC3 Pos.
- `LB567` PNP Move to MRC3 Take Out Pos. Completet
- `LB568` Right Arm Chuck at Return Pos. Confirm.
- `LB569` Right Arm Chuck not at Return Pos.
- `LB571` Right Arm Chuck Return Complete
- `LB572` Right Arm Y Axis at FWD Pos. Confirm.
- `LB573` Right Arm Y Axis not at FWD Pos.
- `LB575` Right Arm Y Axis FWD Complete
- `LB579` Auto Continue : Right Arm MRC3 Take Out

**67.**
```
~ LB579 AND (/LB906 AND /LB581 OR LB580 OR LB906 AND LB1099 OR LB581)  ->  LB580, LB581
```
- `LB579` Auto Continue : Right Arm MRC3 Take Out
- `LB906` Right Arm Take Out Operation Start
- `LB580` Right Arm MRC3 Take Out Operation Start
- `LB581` Right Arm MRC3 Take Out Complete
- `LB1099` Right Arm Take Out Operation Complete

**68.**
```
~ LB581 AND (/LB1510 OR LB582 OR /LB582) AND /LB583  ->  LB582, LB583
```
- `LB581` Right Arm MRC3 Take Out Complete
- `LB1510` Dandori Part No Signal
- `LB582` MRC3 No Change Assy No. [No Need move to WIP]
- `LB583` MRC3 Change Assy No Req. [Move to WIP]

**69.**
```
GSB009 AND LB583  ->  LB5581
```
- `GSB009` Modify Ghani After Moving to Line
- `LB583` MRC3 Change Assy No Req. [Move to WIP]
- `LB5581` Auto Continue : Arm & ATS Home Pos.

**70.**
```
~ GSB009 AND LB5581 AND (/RPPSelectDt.YAxis[5].LSComb.LS AND /LB5583 OR LB5582 OR LB1234 AND RPPSelectDt.YAxis[5].LSComb.LS OR LB5583) AND MOVE()  ->  LB5582, LB5583
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5581` Auto Continue : Arm & ATS Home Pos.
- `LB5582` Right Arm Y Axis BWD Operation Start
- `LB5583` Right Arm Y Axis BWD Complete
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**71.**
```
~ LB5581 AND (/LB585 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB587 AND MOVE() OR LB585 OR LB585 AND /LB1209 AND /PPXAxis.Post[10].LSComb.LS AND /LB587 OR LB586 OR LB1209 AND LB1551 AND LB1552 AND /LB587 OR LB586A OR LB586A AND PPXAxis.Post[10].LSComb.LS OR LB587)  ->  LB584, LB585, LB586, LB586A, LB587
```
- `LB5581` Auto Continue : Arm & ATS Home Pos.
- `LB585` PNP Moving Interlock Confirm.
- `LB584` PNP Moving Interlock Request.
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB587` PNP Moving to WIP Take Out Pos. Compl.
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB586` PNP Moving to WIP Take Out Pos. Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB586A` PNP Moving to WIP Take Out Pos. Running

**72.**
```
(LB582 OR LB583 AND LB5583 AND LB587)  ->  LB609
```
- `LB582` MRC3 No Change Assy No. [No Need move to WIP]
- `LB583` MRC3 Change Assy No Req. [Move to WIP]
- `LB5583` Right Arm Y Axis BWD Complete
- `LB587` PNP Moving to WIP Take Out Pos. Compl.
- `LB609` MRC3 Take Out Operation Complete

**73. FLASH 1 TAKE IN MOTION : Right Arm
===============================**
```
LB405 AND (GSB009 OR /GSB009) AND (LB1002 AND MOVE() OR LB610 AND GSB009 AND MOVE())  ->  LB610
```
- `LB405` Flash 1 Take In Operation
- `GSB009` Modify Ghani After Moving to Line
- `LB1002` PH Air Blow Product Confirm.
- `LB610` SOL FG Shutter Open

**74.**
```
~ LB610 AND (PPXAxis.Post[13].LSComb.LS OR LB611 OR /LB611) AND /LB612  ->  LB611, LB612
```
- `LB610` SOL FG Shutter Open
- `LB611` SOL FG Shutter Close
- `LB612` SOL FG Additional Chutter Open

**75.**
```
LB612  ->  LB613
```
- `LB612` SOL FG Additional Chutter Open
- `LB613` SOL FG Additional Chutter Close

**76.**
```
~ LB613 AND (/LB615 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB617 AND MOVE() OR LB615 OR LB615 AND /LB1202A AND /PPXAxis.Post[13].LSComb.LS AND /LB617 OR LB616 OR LB1202A AND LB1551 AND LB1552 AND /LB617 OR LB616A OR LB616A AND PPXAxis.Post[13].LSComb.LS OR LB617)  ->  LB614, LB615, LB616, LB616A, LB617
```
- `LB613` SOL FG Additional Chutter Close
- `LB615` PNP Moving Interlock Confirm.
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB617` PNP Move to Flash Take In 1 Complete
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB616` PNP Move to Flash 1 Take In Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB616A` PNP Move to Flash 1 Take In Running

**77.**
```
~ LB610 AND (RPPSelectDt.Rotate[2].LSComb.LS OR LB618 OR /LB618) AND /LB619  ->  LB618, LB619
```
- `LB610` SOL FG Shutter Open
- `LB618` Right Arm Chuck at Rotate Pos. Confirm.
- `LB619` Right Arm Chuck not at Rotate Pos. Cofirm.

**78.**
```
~ LB619 AND (/LB1258 AND /LB621 OR LB620 OR LB1241 AND RPPSelectDt.Rotate[2].LSComb.LS OR LB621) AND MOVE()  ->  LB620, LB621
```
- `LB619` Right Arm Chuck not at Rotate Pos. Cofirm.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB620` Right Arm Chuck Rotate Operation Start
- `LB621` Right Arm Chuck Rotate Complete
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start

**79.**
```
~ LB610 AND (RPPSelectDt.YAxis[2].LSComb.LS OR LB622 OR /LB622) AND /LB623  ->  LB622, LB623
```
- `LB610` SOL FG Shutter Open
- `LB622` Right Arm Y Axis at FWD Pos. Confirm.
- `LB623` Right Arm Y Axis not at FWD Pos.

**80.**
```
~ LB623 AND (/LB1256 AND /LB625 OR LB624 OR LB1231 AND RPPSelectDt.YAxis[2].LSComb.LS OR LB625) AND MOVE()  ->  LB624, LB625
```
- `LB623` Right Arm Y Axis not at FWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB624` Right Arm Y Axis FWD Operation Start
- `LB625` Right Arm Y Axis FWD Complete
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**81.**
```
~ LB610 AND (LPPSelectDt.Rotate[2].LSComb.LS OR LB626 OR /LB626) AND /LB627  ->  LB626, LB627
```
- `LB610` SOL FG Shutter Open
- `LB626` Left Arm Chuck at Rotate Pos. Confirm.
- `LB627` Left Arm Chuck not at Rotate Pos. Cofirm.

**82.**
```
~ LB627 AND (/LB1253 AND /LB629 OR LB628 OR LB1221 AND LPPSelectDt.Rotate[2].LSComb.LS OR LB629) AND MOVE()  ->  LB628, LB629
```
- `LB627` Left Arm Chuck not at Rotate Pos. Cofirm.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB628` Left Arm Chuck Rotate Operation Start
- `LB629` Left Arm Chuck Rotate Complete
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start

**83.**
```
~ LB610 AND (LPPSelectDt.YAxis[2].LSComb.LS OR LB630 OR /LB630) AND /LB631  ->  LB630, LB631
```
- `LB610` SOL FG Shutter Open
- `LB630` Left Arm Y Axis at FWD Pos. Confirm.
- `LB631` Left Arm Y Axis not at FWD Pos.

**84.**
```
~ LB631 AND (/LB1251 AND /LB633 OR LB632 OR LB1211 AND LPPSelectDt.YAxis[2].LSComb.LS OR LB633) AND MOVE()  ->  LB632, LB633
```
- `LB631` Left Arm Y Axis not at FWD Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB632` Leftt Arm Y Axis FWD Operation Start
- `LB633` Leftt Arm Y Axis FWD Complete
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**85.**
```
LB610 AND (LB611 AND LB618 AND LB622 AND LB626 AND LB630 OR LB612 AND LB617 AND LB619 AND LB621 AND LB623 AND LB625 AND LB627 AND LB629 AND LB631 AND LB633)  ->  LB649
```
- `LB610` SOL FG Shutter Open
- `LB611` SOL FG Shutter Close
- `LB612` SOL FG Additional Chutter Open
- `LB617` PNP Move to Flash Take In 1 Complete
- `LB618` Right Arm Chuck at Rotate Pos. Confirm.
- `LB619` Right Arm Chuck not at Rotate Pos. Cofirm.
- `LB621` Right Arm Chuck Rotate Complete
- `LB622` Right Arm Y Axis at FWD Pos. Confirm.
- `LB623` Right Arm Y Axis not at FWD Pos.
- `LB625` Right Arm Y Axis FWD Complete
- `LB626` Left Arm Chuck at Rotate Pos. Confirm.
- `LB627` Left Arm Chuck not at Rotate Pos. Cofirm.
- `LB629` Left Arm Chuck Rotate Complete
- `LB630` Left Arm Y Axis at FWD Pos. Confirm.
- `LB631` Left Arm Y Axis not at FWD Pos.
- `LB633` Leftt Arm Y Axis FWD Complete
- `LB649` Auto Continue : Right Arm Flash 1 Take In Operation

**86.**
```
~ LB649 AND (/LB905 AND GB014_013 OR LB650 OR LB905 AND LB1049 OR LB651) AND /LB651  ->  LB650, LB651
```
- `LB649` Auto Continue : Right Arm Flash 1 Take In Operation
- `LB905` Right Arm Take In Operation Start
- `GB014_013` Flash 1 Send PN Complete Confirm.
- `LB650` SM10 WIP Trans Moving Start
- `LB651` Right Arm Flash 1 Take In Complete
- `LB1049` Right Arm Take In Operation Complete

**87.**
```
~ LB651 AND (GSB001 OR LB652 OR /LB652) AND /LB653  ->  LB652, LB653
```
- `LB651` Right Arm Flash 1 Take In Complete
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB652` Left Arm is Chuck Confirm. [No Moving]
- `LB653` Left Armis Unchuck Confirm [Move to WIP Take Out]

**88.**
```
GSB009 AND LB653  ->  LB5651
```
- `GSB009` Modify Ghani After Moving to Line
- `LB653` Left Armis Unchuck Confirm [Move to WIP Take Out]
- `LB5651` Auto Continue : Gripper & ATS Home Pos.

**89.**
```
~ GSB009 AND LB5651 AND (/LB1258 AND /LB5653 OR LB5652 OR LB1244 AND RPPSelectDt.Rotate[5].LSComb.LS OR LB5653) AND MOVE()  ->  LB5652, LB5653
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB5652` Rotary Right Arm Return Operation Start
- `LB5653` Rotary Right Arm Return Complete
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**90.**
```
~ GSB009 AND LB5651 AND (/LB1253 AND /LB5655 OR LB5654 OR LB1224 AND LPPSelectDt.Rotate[5].LSComb.LS OR LB5655) AND MOVE()  ->  LB5654, LB5655
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB5654` Rotary Left Arm Return Operation Start
- `LB5655` Rotary Left Arm Return Complete
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start

**91.**
```
~ GSB009 AND LB5651 AND (/LB1256 AND /LB5657 OR LB5656 OR LB1234 AND RPPSelectDt.YAxis[5].LSComb.LS OR LB5657) AND MOVE()  ->  LB5656, LB5657
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB5656` Right Arm Y Axis BWD Operation Start
- `LB5657` Right Arm Y Axis BWD Complete
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**92.**
```
~ GSB009 AND LB5651 AND (/LB1251 AND /LB5659 OR LB5658 OR LB1214 AND LPPSelectDt.YAxis[5].LSComb.LS OR LB5659) AND MOVE()  ->  LB5658, LB5659
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB5658` Leftt Arm Y Axis BWD Operation Start
- `LB5659` Leftt Arm Y Axis BWD Complete
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**93.**
```
LB5651 AND LB5653 AND LB5655 AND LB5657 AND LB5659  ->  LB5660
```
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB5653` Rotary Right Arm Return Complete
- `LB5655` Rotary Left Arm Return Complete
- `LB5657` Right Arm Y Axis BWD Complete
- `LB5659` Leftt Arm Y Axis BWD Complete
- `LB5660` Auto Continue : ATS Homing

**94.**
```
~ (/GSB009 AND LB653 AND /LB655 OR GSB009 AND LB5651 AND LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB657 AND MOVE())  ->  LB654, LB655, LB656, LB656A, LB657
```
- `GSB009` Modify Ghani After Moving to Line
- `LB653` Left Armis Unchuck Confirm [Move to WIP Take Out]
- `LB5651` Auto Continue : Gripper & ATS Home Pos.
- `LB655` PNP Moving Interlock Confirm.
- `LB654` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB657` PNP Move to WIP TO Pos. Complete
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB656` PNP Move to WIP TO Position Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB656A` PNP Move to WIP TO Pos. Running

**95.**
```
(LB652 OR LB653 AND LB5660 AND LB657)  ->  LB659
```
- `LB652` Left Arm is Chuck Confirm. [No Moving]
- `LB653` Left Armis Unchuck Confirm [Move to WIP Take Out]
- `LB5660` Auto Continue : ATS Homing
- `LB657` PNP Move to WIP TO Pos. Complete
- `LB659` Flash 1 Take In Operation Complete

**96. FLASH 1 TAKE OUT MOTION : Left Arm
===============================**
```
LB406 AND (GSB009 OR /GSB009) AND (LB1002 AND MOVE() OR LB660 AND GSB009 AND MOVE())  ->  LB660
```
- `LB406` Flash 1 Take Out Operation
- `GSB009` Modify Ghani After Moving to Line
- `LB1002` PH Air Blow Product Confirm.
- `LB660` Flash 1 Take Out Operation Start

**97.**
```
~ LB660 AND (PPXAxis.Post[3].LSComb.LS OR LB661 OR /LB661) AND /LB662  ->  LB661, LB662
```
- `LB660` Flash 1 Take Out Operation Start
- `LB661` PNP at Flash 1 Pos. Confim.
- `LB662` PNP not at Flash 1 Pos.

**98.**
```
LB662  ->  LB663
```
- `LB662` PNP not at Flash 1 Pos.
- `LB663` Auto Continue : PNP Move to Flash 1 Pos.

**99.**
```
~ LB663 AND (/LB665 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB667 AND MOVE() OR LB665 OR LB665 AND /LB1202 AND /PPXAxis.Post[3].LSComb.LS AND /LB667 OR LB666 OR LB1202 AND LB1551 AND LB1552 AND /LB667 OR LB666A OR LB666A AND PPXAxis.Post[3].LSComb.LS OR LB667)  ->  LB664, LB665, LB666, LB666A, LB667
```
- `LB663` Auto Continue : PNP Move to Flash 1 Pos.
- `LB665` PNP Moving Interlock Confirm.
- `LB664` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB667` PNP Move to Flash 1 Take Out Pos. Complete
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start
- `LB666` PNP Move to Flash 1 Take Out Pos. Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB666A` PNP Move to Flash 1 Take Out Pos. Running

**100.**
```
~ LB660 AND (LPPSelectDt.Rotate[2].LSComb.LS OR LB668 OR /LB668) AND /LB669  ->  LB668, LB669
```
- `LB660` Flash 1 Take Out Operation Start
- `LB668` Left Arm Chuck at Rotate Pos. Confirm.
- `LB669` Left Arm Chuck not at Rotate Pos.

**101.**
```
~ LB669 AND (/LB1221 AND /LB671 OR LB670 OR LB1221 AND LPPSelectDt.Rotate[2].LSComb.LS OR LB671) AND MOVE()  ->  LB670, LB671
```
- `LB669` Left Arm Chuck not at Rotate Pos.
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start
- `LB670` Left Arm Chuck Rotate Operation Start
- `LB671` Left Arm Chuck Rotate Complete

**102.**
```
~ LB660 AND (LPPSelectDt.YAxis[2].LSComb.LS OR LB672 OR /LB672) AND /LB673  ->  LB672, LB673
```
- `LB660` Flash 1 Take Out Operation Start
- `LB672` Left Arm Y Axis at FWD Pos. Confirm.
- `LB673` Left Arm Y Axis not at FWD Pos.

**103.**
```
~ LB673 AND (/LB1251 AND /LB675 OR LB674 OR LB1211 AND LPPSelectDt.YAxis[2].LSComb.LS OR LB675) AND MOVE()  ->  LB674, LB675
```
- `LB673` Left Arm Y Axis not at FWD Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB674` Left Arm Y Axis FWD Operation Start
- `LB675` Left Arm Y Axis FWD Complete
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**104.**
```
~ LB660 AND (RPPSelectDt.Rotate[2].LSComb.LS OR LB676 OR /LB676) AND /LB677  ->  LB676, LB677
```
- `LB660` Flash 1 Take Out Operation Start
- `LB676` Right Arm Chuck at Rotate Pos. Confirm.
- `LB677` Right Arm Chuck not at Rotate Pos.

**105.**
```
~ LB677 AND (/LB1241 AND /LB679 OR LB678 OR LB1241 AND RPPSelectDt.Rotate[2].LSComb.LS OR LB679) AND MOVE()  ->  LB678, LB679
```
- `LB677` Right Arm Chuck not at Rotate Pos.
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start
- `LB678` Right Arm Chuck Rotate Operation Start
- `LB679` Right Arm Chuck Rotate Complete

**106.**
```
~ LB660 AND (RPPSelectDt.YAxis[2].LSComb.LS OR LB680 OR /LB680) AND /LB681  ->  LB680, LB681
```
- `LB660` Flash 1 Take Out Operation Start
- `LB680` Right Arm Y Axis at FWD Pos. Confirm.
- `LB681` Right Arm Y Axis not at FWD Pos.

**107.**
```
~ LB681 AND (/LB1256 AND /LB683 OR LB682 OR LB1231 AND RPPSelectDt.YAxis[2].LSComb.LS OR LB683) AND MOVE()  ->  LB682, LB683
```
- `LB681` Right Arm Y Axis not at FWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB682` Right Arm Y Axis FWD Operation Start
- `LB683` Right Arm Y Axis FWD Complete
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**108.**
```
LB660 AND (LB661 AND LB668 AND LB672 AND LB676 AND LB680 OR LB662 AND LB667 AND LB669 AND LB671 AND LB673 AND LB675 AND LB677 AND LB679 AND LB681 AND LB683)  ->  LB699
```
- `LB660` Flash 1 Take Out Operation Start
- `LB661` PNP at Flash 1 Pos. Confim.
- `LB662` PNP not at Flash 1 Pos.
- `LB667` PNP Move to Flash 1 Take Out Pos. Complete
- `LB668` Left Arm Chuck at Rotate Pos. Confirm.
- `LB669` Left Arm Chuck not at Rotate Pos.
- `LB671` Left Arm Chuck Rotate Complete
- `LB672` Left Arm Y Axis at FWD Pos. Confirm.
- `LB673` Left Arm Y Axis not at FWD Pos.
- `LB675` Left Arm Y Axis FWD Complete
- `LB676` Right Arm Chuck at Rotate Pos. Confirm.
- `LB677` Right Arm Chuck not at Rotate Pos.
- `LB679` Right Arm Chuck Rotate Complete
- `LB680` Right Arm Y Axis at FWD Pos. Confirm.
- `LB681` Right Arm Y Axis not at FWD Pos.
- `LB683` Right Arm Y Axis FWD Complete
- `LB699` Auto Continue : Left Arm Flash 1 Take Out

**109.**
```
~ LB699 AND (/LB901 AND /LB701 OR LB700 OR LB901 AND LB999 OR LB701)  ->  LB700, LB701
```
- `LB699` Auto Continue : Left Arm Flash 1 Take Out
- `LB901` Left Arm Take Out Operation Start
- `LB700` Left Arm Flash 1 Take Out Operation Start
- `LB701` Left Arm Flash 1 Take Out Complete
- `LB999` Left Arm Take Out Operation Complete

**110.**
```
LB701  ->  LB709
```
- `LB701` Left Arm Flash 1 Take Out Complete
- `LB709` Flash 1 Take Out Operation Complete

**111. FLASH 2 TAKE IN MOTION : Right Arm
===============================**
```
LB407 AND (GSB009 OR /GSB009) AND (LB1003 AND MOVE() OR LB710 AND GSB009 AND MOVE())  ->  LB710
```
- `LB407` Flash 2 Take In Operation
- `GSB009` Modify Ghani After Moving to Line
- `LB1003` Air Blow Finish Process Memory
- `LB710` Flash 2 Take In Operation Start

**112.**
```
~ LB710 AND (PPXAxis.Post[14].LSComb.LS OR LB711 OR /LB711) AND /LB712  ->  LB711, LB712
```
- `LB710` Flash 2 Take In Operation Start
- `LB711` PNP at Flash 2 Pos. Confirm.
- `LB712` PNP not at Flash 2 Pos.

**113.**
```
LB712  ->  LB713
```
- `LB712` PNP not at Flash 2 Pos.
- `LB713` Auto Continue : PNP Move to Flash 2

**114.**
```
~ LB713 AND (/LB715 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB717 AND MOVE() OR LB715 OR LB715 AND /LB1203A AND /PPXAxis.Post[14].LSComb.LS AND /LB717 OR LB716 OR LB1203A AND LB1551 AND LB1552 AND /LB717 OR LB716A OR LB716A AND PPXAxis.Post[14].LSComb.LS OR LB717)  ->  LB714, LB715, LB716, LB716A, LB717
```
- `LB713` Auto Continue : PNP Move to Flash 2
- `LB715` PNP Moving Interlock Confirm.
- `LB714` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB717` PNP Move to Flash 2 Take In Complete
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start
- `LB716` PNP Move to Flash 2 Take In Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB716A` PNP Move to Flash 2 Take In Running

**115.**
```
~ LB710 AND (RPPSelectDt.Rotate[2].LSComb.LS OR LB718 OR /LB718) AND /LB719  ->  LB718, LB719
```
- `LB710` Flash 2 Take In Operation Start
- `LB718` Right Arm Chuck at Rotate Pos. Confirm.
- `LB719` Right Arm Chuck not at Rotate Pos. Cofirm.

**116.**
```
~ LB719 AND (/LB1258 AND /LB721 OR LB720 OR LB1241 AND RPPSelectDt.Rotate[2].LSComb.LS OR LB721) AND MOVE()  ->  LB720, LB721
```
- `LB719` Right Arm Chuck not at Rotate Pos. Cofirm.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB720` Right Arm Chuck Rotate Operation Start
- `LB721` Right Arm Chuck Rotate Complete
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start

**117.**
```
~ LB710 AND (RPPSelectDt.YAxis[2].LSComb.LS OR LB722 OR /LB722) AND /LB723  ->  LB722, LB723
```
- `LB710` Flash 2 Take In Operation Start
- `LB722` Right Arm Y Axis at FWD Pos. Confirm.
- `LB723` Right Arm Y Axis not at FWD Pos.

**118.**
```
~ LB723 AND (/LB1256 AND /LB725 OR LB724 OR LB1231 AND RPPSelectDt.YAxis[2].LSComb.LS OR LB725) AND MOVE()  ->  LB724, LB725
```
- `LB723` Right Arm Y Axis not at FWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB724` Right Arm Y Axis FWD Operation Start
- `LB725` Right Arm Y Axis FWD Complete
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**119.**
```
~ LB710 AND (LPPSelectDt.Rotate[2].LSComb.LS OR LB726 OR /LB726) AND /LB727  ->  LB726, LB727
```
- `LB710` Flash 2 Take In Operation Start
- `LB726` Left Arm Chuck at Rotate Pos. Confirm.
- `LB727` Left Arm Chuck not at Rotate Pos. Cofirm.

**120.**
```
~ LB727 AND (/LB1253 AND /LB729 OR LB728 OR LB1221 AND LPPSelectDt.Rotate[2].LSComb.LS OR LB729) AND MOVE()  ->  LB728, LB729
```
- `LB727` Left Arm Chuck not at Rotate Pos. Cofirm.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB728` Left Arm Chuck Rotate Operation Start
- `LB729` Leftt Arm Chuck Rotate Complete
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start

**121.**
```
~ LB710 AND (LPPSelectDt.YAxis[2].LSComb.LS OR LB730 OR /LB730) AND /LB731  ->  LB730, LB731
```
- `LB710` Flash 2 Take In Operation Start
- `LB730` Left Arm Y Axis at FWD Pos. Confirm.
- `LB731` Left Arm Y Axis not at FWD Pos. Confirm.

**122.**
```
~ LB731 AND (/LB1251 AND /LB733 OR LB732 OR LB1211 AND LPPSelectDt.YAxis[2].LSComb.LS OR LB733) AND MOVE()  ->  LB732, LB733
```
- `LB731` Left Arm Y Axis not at FWD Pos. Confirm.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB732` Left Arm Y Axis FWD Operation Start
- `LB733` Left Arm Y Axis FWD Complete
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**123.**
```
LB710 AND (LB711 AND LB718 AND LB722 AND LB726 AND LB730 OR LB712 AND LB717 AND LB719 AND LB721 AND LB723 AND LB725 AND LB727 AND LB729 AND LB731 AND LB733)  ->  LB749
```
- `LB710` Flash 2 Take In Operation Start
- `LB711` PNP at Flash 2 Pos. Confirm.
- `LB712` PNP not at Flash 2 Pos.
- `LB717` PNP Move to Flash 2 Take In Complete
- `LB718` Right Arm Chuck at Rotate Pos. Confirm.
- `LB719` Right Arm Chuck not at Rotate Pos. Cofirm.
- `LB721` Right Arm Chuck Rotate Complete
- `LB722` Right Arm Y Axis at FWD Pos. Confirm.
- `LB723` Right Arm Y Axis not at FWD Pos.
- `LB725` Right Arm Y Axis FWD Complete
- `LB726` Left Arm Chuck at Rotate Pos. Confirm.
- `LB727` Left Arm Chuck not at Rotate Pos. Cofirm.
- `LB729` Leftt Arm Chuck Rotate Complete
- `LB730` Left Arm Y Axis at FWD Pos. Confirm.
- `LB731` Left Arm Y Axis not at FWD Pos. Confirm.
- `LB733` Left Arm Y Axis FWD Complete
- `LB749` Auto Continue : Right Arm Flash 2 Take In Operation

**124.**
```
~ LB749 AND (/LB905 AND /LB751 OR LB750 OR LB905 AND LB1049 OR LB751)  ->  LB750, LB751
```
- `LB749` Auto Continue : Right Arm Flash 2 Take In Operation
- `LB905` Right Arm Take In Operation Start
- `LB750` Right Arm Flash 2 Take In Operation Start
- `LB751` Right Arm Flash 2 Take In Complete
- `LB1049` Right Arm Take In Operation Complete

**125.**
```
~ LB751 AND (GSB001 OR LB752 OR /LB752) AND /LB753  ->  LB752, LB753
```
- `LB751` Right Arm Flash 2 Take In Complete
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB752` Left Arm is Chuck Confirm [No Moving]
- `LB753` Left Arm is Unhuck Confirm [Moving to WIP Take Out]

**126.**
```
GSB009 AND LB753  ->  LB5751
```
- `GSB009` Modify Ghani After Moving to Line
- `LB753` Left Arm is Unhuck Confirm [Moving to WIP Take Out]
- `LB5751` Auto Continue : Gripper & ATS Home Pos.

**127.**
```
~ GSB009 AND LB5751 AND (/LB1258 AND /LB5753 OR LB5752 OR LB1244 AND RPPSelectDt.Rotate[5].LSComb.LS OR LB5753) AND MOVE()  ->  LB5752, LB5753
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB5752` Rotary Right Arm Return Operation Start
- `LB5753` Rotary Right Arm Return Complete
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**128.**
```
~ GSB009 AND LB5751 AND (/LB1253 AND /LB5755 OR LB5754 OR LB1224 AND LPPSelectDt.Rotate[5].LSComb.LS OR LB5755) AND MOVE()  ->  LB5754, LB5755
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB5754` Rotary Left Arm Return Operation Start
- `LB5755` Rotary Left Arm Return Complete
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start

**129.**
```
~ GSB009 AND LB5751 AND (/LB1256 AND /LB5757 OR LB5756 OR LB1234 AND RPPSelectDt.YAxis[5].LSComb.LS OR LB5757) AND MOVE()  ->  LB5756, LB5757
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB5756` Right Arm Y Axis BWD Operation Start
- `LB5757` Right Arm Y Axis BWD Complete
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**130.**
```
~ GSB009 AND LB5751 AND (/LB1251 AND /LB5759 OR LB5758 OR LB1214 AND LPPSelectDt.YAxis[5].LSComb.LS OR LB5759) AND MOVE()  ->  LB5758, LB5759
```
- `GSB009` Modify Ghani After Moving to Line
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB5758` Leftt Arm Y Axis BWD Operation Start
- `LB5759` Leftt Arm Y Axis BWD Complete
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**131.**
```
LB5751 AND LB5753 AND LB5755 AND LB5757 AND LB5759  ->  LB5760
```
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB5753` Rotary Right Arm Return Complete
- `LB5755` Rotary Left Arm Return Complete
- `LB5757` Right Arm Y Axis BWD Complete
- `LB5759` Leftt Arm Y Axis BWD Complete
- `LB5760` Auto Continue : ATS Homing

**132.**
```
~ (/GSB009 AND LB753 AND /LB755 OR GSB009 AND LB5751 AND LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB015_020 AND /LB757 AND MOVE())  ->  LB754, LB755, LB756, LB756A, LB757
```
- `GSB009` Modify Ghani After Moving to Line
- `LB753` Left Arm is Unhuck Confirm [Moving to WIP Take Out]
- `LB5751` Auto Continue : Gripper & ATS Home Pos.
- `LB755` PNP Moving Interlock Confirm.
- `LB754` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)
- `LB757` PNP Move to WIP TO Pos. Complete
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB756` PNP Move to WIP TO Position Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB756A` PNP Move to WIP TO Pos. Running

**133.**
```
(LB752 OR LB753 AND LB5760 AND LB757)  ->  LB759
```
- `LB752` Left Arm is Chuck Confirm [No Moving]
- `LB753` Left Arm is Unhuck Confirm [Moving to WIP Take Out]
- `LB5760` Auto Continue : ATS Homing
- `LB757` PNP Move to WIP TO Pos. Complete
- `LB759` Flash 2 Take In Operation Complete

**134. FLASH 2 TAKE OUT MOTION : Left Arm
===============================**
```
LB408 AND (GSB009 OR /GSB009) AND (LB1003 AND MOVE() OR LB760 AND GSB009 AND MOVE())  ->  LB760
```
- `LB408` Flash 2 Take Out Operation
- `GSB009` Modify Ghani After Moving to Line
- `LB1003` Air Blow Finish Process Memory
- `LB760` Flash 2 Take Out Operation Start

**135.**
```
~ LB760 AND (PPXAxis.Post[4].LSComb.LS OR LB761 OR /LB761) AND /LB762  ->  LB761, LB762
```
- `LB760` Flash 2 Take Out Operation Start
- `LB761` PNP at Flash 2 Pos. Confim.
- `LB762` PNP not at Flash 2 Pos.

**136.**
```
LB762  ->  LB763
```
- `LB762` PNP not at Flash 2 Pos.
- `LB763` Auto Continue : PNP Move to Flash 2 Pos.

**137.**
```
~ LB763 AND (/LB765 OR LB1300 AND GB014_021 AND GB015_021 AND NJ_TO_NX_Bool[2] AND /NJ_TO_NX_Bool[9] AND NJ_TO_NX_Bool[10] AND /GB014_020 AND /GB014_020 AND /LB767 AND MOVE() OR LB765 OR LB765 AND /LB1203 AND /PPXAxis.Post[4].LSComb.LS AND /LB767 OR LB766 OR LB1203 AND LB1551 AND LB1552 AND /LB767 OR LB766A OR LB766A AND PPXAxis.Post[4].LSComb.LS OR LB767)  ->  LB764, LB765, LB766, LB766A, LB767
```
- `LB763` Auto Continue : PNP Move to Flash 2 Pos.
- `LB765` PNP Moving Interlock Confirm.
- `LB764` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.
- `GB014_021` Flash 1 Cover Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)
- `LB767` PNP Move to Flash 2 Take Out Pos. Complete
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB766` PNP Move to Flash 2 Take Out Pos. Operation Start
- `LB1551` SM10 Moving Point 1 [FWD Pos] Running
- `LB1552` SM10 Moving Point 1 [FWD Pos] Ready
- `LB766A` PNP Move to Flash 2 Take Out Pos. Running

**138.**
```
~ LB760 AND (LPPSelectDt.Rotate[2].LSComb.LS OR LB768 OR /LB768) AND /LB769  ->  LB768, LB769
```
- `LB760` Flash 2 Take Out Operation Start
- `LB768` Left Arm Chuck at Rotate Pos. Confirm.
- `LB769` Left Arm Chuck not at Rotate Pos.

**139.**
```
~ LB769 AND (/LB1253 AND /LB771 OR LB770 OR LB1221 AND LPPSelectDt.Rotate[2].LSComb.LS OR LB771) AND MOVE()  ->  LB770, LB771
```
- `LB769` Left Arm Chuck not at Rotate Pos.
- `LB1253` SM3 Left Rotate Unit Moving Start
- `LB770` Left Arm Chuck Rotate Operation Start
- `LB771` Left Arm Chuck Rotate Complete
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start

**140.**
```
~ LB760 AND (LPPSelectDt.YAxis[2].LSComb.LS OR LB772 OR /LB772) AND /LB773  ->  LB772, LB773
```
- `LB760` Flash 2 Take Out Operation Start
- `LB772` Left Arm Y Axis at FWD Pos. Confirm.
- `LB773` Left Arm Y Axis not at FWD Pos.

**141.**
```
~ LB773 AND (/LB1251 AND /LB775 OR LB774 OR LB1211 AND LPPSelectDt.YAxis[2].LSComb.LS OR LB775) AND MOVE()  ->  LB774, LB775
```
- `LB773` Left Arm Y Axis not at FWD Pos.
- `LB1251` SM9 Left Y Axis Moving Start
- `LB774` Left Arm Y Axis FWD Operation Start
- `LB775` Left Arm Y Axis FWD Complete
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**142.**
```
~ LB760 AND (RPPSelectDt.Rotate[2].LSComb.LS OR LB776 OR /LB776) AND /LB777  ->  LB776, LB777
```
- `LB760` Flash 2 Take Out Operation Start
- `LB776` Right Arm Chuck at Rotate Pos. Confirm.
- `LB777` Right Arm Chuck not at Rotate Pos.

**143.**
```
~ LB777 AND (/LB1258 AND /LB779 OR LB778 OR LB1241 AND RPPSelectDt.Rotate[2].LSComb.LS OR LB779) AND MOVE()  ->  LB778, LB779
```
- `LB777` Right Arm Chuck not at Rotate Pos.
- `LB1258` SM2 Right Rotate Unit Moving Start
- `LB778` Right Arm Chuck Rotate Operation Start
- `LB779` Right Arm Chuck Rotate Complete
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start

**144.**
```
~ LB760 AND (RPPSelectDt.YAxis[2].LSComb.LS OR LB780 OR /LB780) AND /LB781  ->  LB780, LB781
```
- `LB760` Flash 2 Take Out Operation Start
- `LB780` Right Arm Y Axis at FWD Pos. Confirm.
- `LB781` Right Arm Y Axis not at FWD Pos.

**145.**
```
~ LB781 AND (/LB1256 AND /LB783 OR LB782 OR LB1231 AND RPPSelectDt.YAxis[2].LSComb.LS OR LB783) AND MOVE()  ->  LB782, LB783
```
- `LB781` Right Arm Y Axis not at FWD Pos.
- `LB1256` SM8 Right Y Axis Moving Start
- `LB782` Right Arm Y Axis FWD Operation Start
- `LB783` Right Arm Y Axis FWD Complete
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**146.**
```
LB760 AND (LB761 AND LB768 AND LB772 AND LB776 AND LB780 OR LB762 AND LB767 AND LB769 AND LB771 AND LB773 AND LB775 AND LB777 AND LB779 AND LB781 AND LB783)  ->  LB799
```
- `LB760` Flash 2 Take Out Operation Start
- `LB761` PNP at Flash 2 Pos. Confim.
- `LB762` PNP not at Flash 2 Pos.
- `LB767` PNP Move to Flash 2 Take Out Pos. Complete
- `LB768` Left Arm Chuck at Rotate Pos. Confirm.
- `LB769` Left Arm Chuck not at Rotate Pos.
- `LB771` Left Arm Chuck Rotate Complete
- `LB772` Left Arm Y Axis at FWD Pos. Confirm.
- `LB773` Left Arm Y Axis not at FWD Pos.
- `LB775` Left Arm Y Axis FWD Complete
- `LB776` Right Arm Chuck at Rotate Pos. Confirm.
- `LB777` Right Arm Chuck not at Rotate Pos.
- `LB779` Right Arm Chuck Rotate Complete
- `LB780` Right Arm Y Axis at FWD Pos. Confirm.
- `LB781` Right Arm Y Axis not at FWD Pos.
- `LB783` Right Arm Y Axis FWD Complete
- `LB799` Auto Continue : Left Arm Flash 2 Take Out

**147.**
```
~ LB799 AND (/LB901 AND /LB801 OR LB800 OR LB901 AND LB999 OR LB801)  ->  LB800, LB801
```
- `LB799` Auto Continue : Left Arm Flash 2 Take Out
- `LB901` Left Arm Take Out Operation Start
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `LB999` Left Arm Take Out Operation Complete

**148.**
```
LB801  ->  LB809
```
- `LB801` ATS Finish Process Memory
- `LB809` Flash 2 Take Out Operation Complete

## P012_ATS3_Unit / ATS3_PP


**1. PNP Operation Program Selection
===============**
```
(LB450 OR LB530)  ->  LB900
```
- `LB450` WIP Return Motion Start
- `LB530` Left Arm MRC3 Take In Operation Start
- `LB900` Left Arm Take In Operation Start

**2.**
```
~ (LB500 OR LB700 OR LB800)  ->  LB901
```
- `LB700` Left Arm Flash 1 Take Out Operation Start
- `LB800` Memory WIP Trans. Confirm.
- `LB901` Left Arm Take Out Operation Start

**3.**
```
(LB650 OR LB750)  ->  LB905
```
- `LB650` SM10 WIP Trans Moving Start
- `LB750` Right Arm Flash 2 Take In Operation Start
- `LB905` Right Arm Take In Operation Start

**4.**
```
LB580  ->  LB906
```
- `LB580` Right Arm MRC3 Take Out Operation Start
- `LB906` Right Arm Take Out Operation Start

**5. Left Arm Take In Motion
===============**
```
LB900  ->  LB910
```
- `LB900` Left Arm Take In Operation Start
- `LB910` Left Arm Take In Operartion Starting

**6.**
```
~ LB910 AND (/LB1252 AND /LB912 OR LB911 OR LB1216 AND LPPSelectDt.ZAxis[2].LSComb.LS OR LB912) AND MOVE()  ->  LB911, LB912
```
- `LB910` Left Arm Take In Operartion Starting
- `LB1252` SM7 Left Z Axis Moving Start
- `LB911` Left Arm Moving Down Start Opertion
- `LB912` Left Arm Moving Down Complete
- `LB1216` Left PP Z Axis Pos 2 Moving Start

**7.**
```
LB912  ->  LB913
```
- `LB912` Left Arm Moving Down Complete
- `LB913` Auto Continue : Left Arm Unchuck

**8.**
```
~ LB913 AND (/LB1254 AND /LB915 OR LB914 OR LB1229 AND LPPSelectDt.Gripper[5].LSComb.LS OR LB915) AND MOVE()  ->  LB914, LB915
```
- `LB913` Auto Continue : Left Arm Unchuck
- `LB1254` SM5 Left Gripper Moving Start
- `LB914` Left Arm Unhuck Start Operation
- `LB915` Left Arm Unchuck Complete
- `LB1229` Left PP Chuck Unit Pos 5 Moving Start

**9.**
```
~ LB915 AND (/LB1252 AND /LB922 OR LB921 OR LB1219 AND LPPSelectDt.ZAxis[5].LSComb.LS OR LB922) AND MOVE()  ->  LB921, LB922
```
- `LB915` Left Arm Unchuck Complete
- `LB1252` SM7 Left Z Axis Moving Start
- `LB921` Left Arm Moving Up Start Operation
- `LB922` Left Arm Moving Up Complete
- `LB1219` Left PP Z Axis Pos 5 Moving Start

**10.**
```
~ LB922 AND (LB450 AND GB011_021 OR LB530 AND GSB000 OR LB916 OR /LB916 AND TON()) AND /LB917 AND (TON())  ->  LB916, LB917
```
- `LB922` Left Arm Moving Up Complete
- `LB450` WIP Return Motion Start
- `GB011_021` PH Workpiece 1 Confirm. [Abilcore]
- `GB011_023` PH Workpiece 2 Confirm. [GD1B]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB530` Left Arm MRC3 Take In Operation Start
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB916` Left Arm Unchuck Normal Confirm.
- `LB917` Left Arm Unchuck Abnormal
- `LT010` Delay

**11.**
```
LB916 AND LT010.Q  ->  LB920
```
- `LB916` Left Arm Unchuck Normal Confirm.
- `LB920` Left Arm Unchuck Normal

**12.**
```
(LB920 OR LB917)  ->  LB949
```
- `LB920` Left Arm Unchuck Normal
- `LB917` Left Arm Unchuck Abnormal
- `LB949` Left Arm Take In Operation Complete

**13. Left Arm Take Out Motion
===============**
```
LB901  ->  LB960
```
- `LB901` Left Arm Take Out Operation Start
- `LB960` Left Arm Take Out Operation Starting

**14.**
```
~ LB960 AND (/LB1252 AND /LB962 OR LB961 OR LB1216 AND LPPSelectDt.ZAxis[2].LSComb.LS OR LB962) AND MOVE()  ->  LB961, LB962
```
- `LB960` Left Arm Take Out Operation Starting
- `LB1252` SM7 Left Z Axis Moving Start
- `LB961` Left Arm Moving Down Start Operation
- `LB962` Left Arm Moving Down Complete
- `LB1216` Left PP Z Axis Pos 2 Moving Start

**15.**
```
LB962  ->  LB963
```
- `LB962` Left Arm Moving Down Complete
- `LB963` Auto Continue : Left Arm Chuck

**16.**
```
~ LB963 AND (/LB1254 AND /LB965 OR LB964 OR LB1226 AND LPPSelectDt.Gripper[2].LSComb.LS OR LB965) AND MOVE()  ->  LB964, LB965
```
- `LB963` Auto Continue : Left Arm Chuck
- `LB1254` SM5 Left Gripper Moving Start
- `LB964` Left Arm Chuck Start Operation
- `LB965` Left Arm Chuck Complete
- `LB1226` Left PP Chuck Unit Pos 2 Moving Start

**17.**
```
~ LB965 AND (/LB1252 AND /LB972 OR LB971 OR LB1219 AND LPPSelectDt.ZAxis[5].LSComb.LS OR LB972) AND MOVE()  ->  LB971, LB972
```
- `LB965` Left Arm Chuck Complete
- `LB1252` SM7 Left Z Axis Moving Start
- `LB971` Left Arm Moving UP Start Operation
- `LB972` Left Arm Moving Up Complete
- `LB1219` Left PP Z Axis Pos 5 Moving Start

**18.**
```
~ LB972 AND (LB500 AND GB011_022 OR LB700 AND GB014_012 OR LB800 AND GB015_012 OR LB966 OR /LB966 AND TON()) AND GB011_024 AND /LB967 AND (TON())  ->  LB966, LB967
```
- `LB972` Left Arm Moving Up Complete
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB700` Left Arm Flash 1 Take Out Operation Start
- `GB014_012` Flash 1 No Product Confirm.
- `LB800` Memory WIP Trans. Confirm.
- `GB015_012` PH Flash 2 No Product Confirm.
- `LB966` Left Arm Chuck Normal Confirm.
- `LB967` Left Arm Chuck Abnormal
- `LT011` Delay ATS FG Not Processed in Air Blow

**19.**
```
LB966 AND LT011.Q  ->  LB970
```
- `LB966` Left Arm Chuck Normal Confirm.
- `LB970` Left Arm Chuck Normal

**20.**
```
(LB970 OR LB967)  ->  LB999
```
- `LB970` Left Arm Chuck Normal
- `LB967` Left Arm Chuck Abnormal
- `LB999` Left Arm Take Out Operation Complete

**21. Right Arm Take In Motion
===============**
```
LB905  ->  LB1010
```
- `LB905` Right Arm Take In Operation Start
- `LB1010` Running Abilcore Type

**22.**
```
~ LB1010 AND (/LB1257 AND /LB1012 OR LB1011 OR LB1236 AND RPPSelectDt.ZAxis[2].LSComb.LS OR LB1012) AND MOVE()  ->  LB1011, LB1012
```
- `LB1010` Running Abilcore Type
- `LB1257` SM6 Right Z Axis Moving Start
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1236` Right PP Z Axis Pos 2 Moving Start

**23.**
```
LB1012  ->  LB1013
```
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode

**24.**
```
~ LB1013 AND (/LB1259 AND /LB1015 OR LB1014 OR LB1249 AND RPPSelectDt.Gripper[5].LSComb.LS OR LB1015) AND MOVE()  ->  LB1014, LB1015
```
- `LB1013` Teaching Mode
- `LB1259` SM4 Right Gripper Moving Start
- `LB1014` Warning : Air Blow Double Process
- `LB1015` Warning : Forget to NAGARA
- `LB1249` Right PP Chuck Unit Pos 5 Moving Start

**25.**
```
~ LB1015 AND (/LB1257 AND /LB1022 OR LB1021 OR LB1239 AND RPPSelectDt.ZAxis[5].LSComb.LS OR LB1022) AND MOVE()  ->  LB1021, LB1022
```
- `LB1015` Warning : Forget to NAGARA
- `LB1257` SM6 Right Z Axis Moving Start
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1022` Enable/Disable Master Check Mode
- `LB1239` Right PP Z Axis Pos 5 Moving Start

**26.**
```
~ LB1022 AND (LB650 AND GB014_011 OR LB750 AND GB015_011 OR LB1016 OR /LB1016 AND TON()) AND /LB1017 AND (TON())  ->  LB1016, LB1017
```
- `LB1022` Enable/Disable Master Check Mode
- `LB650` SM10 WIP Trans Moving Start
- `GB014_011` Flash 1 Product Confirm.
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB750` Right Arm Flash 2 Take In Operation Start
- `GB015_011` PH Flash 2 Product Confirm.
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable

**27.**
```
LB1016 AND LT012.Q  ->  LB1020
```
- `LB1016` Flash 2 Disable/Enable
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing

**28.**
```
(LB1020 OR LB1017)  ->  LB1049
```
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1017` Flash 2 Disable
- `LB1049` Right Arm Take In Operation Complete

**29. Right Arm Take Out Motion
===============**
```
LB906  ->  LB1060
```
- `LB906` Right Arm Take Out Operation Start
- `LB1060` Right Arm Take Out Operation Starting

**30.**
```
~ LB1060 AND (/LB1257 AND /LB1062 OR LB1061 OR LB1236 AND RPPSelectDt.ZAxis[2].LSComb.LS OR LB1062) AND MOVE()  ->  LB1061, LB1062
```
- `LB1060` Right Arm Take Out Operation Starting
- `LB1257` SM6 Right Z Axis Moving Start
- `LB1061` Right Arm Moving Down Start Operation
- `LB1062` Right Arm Moving Down Complete
- `LB1236` Right PP Z Axis Pos 2 Moving Start

**31.**
```
LB1062  ->  LB1063
```
- `LB1062` Right Arm Moving Down Complete
- `LB1063` Auto Continue : Right Arm Chuck

**32.**
```
~ LB1063 AND (/LB1259 AND /LB1065 OR LB1064 OR LB1246 AND RPPSelectDt.Gripper[2].LSComb.LS OR LB1065) AND MOVE()  ->  LB1064, LB1065
```
- `LB1063` Auto Continue : Right Arm Chuck
- `LB1259` SM4 Right Gripper Moving Start
- `LB1064` Right Arm Chuck Start Operation'
- `LB1065` Right Arm Chuck Complete
- `LB1246` Right PP Chuck Unit Pos 2 Moving Start

**33.**
```
~ LB1065 AND (/LB1257 AND /LB1072 OR LB1071 OR LB1239 AND RPPSelectDt.ZAxis[5].LSComb.LS OR LB1072) AND MOVE()  ->  LB1071, LB1072
```
- `LB1065` Right Arm Chuck Complete
- `LB1257` SM6 Right Z Axis Moving Start
- `LB1071` Right Arm Moving UP Start Operation
- `LB1072` Right Arm Moving Up Complete
- `LB1239` Right PP Z Axis Pos 5 Moving Start

**34.**
```
~ LB1072 AND (LB580 AND GSB000 OR LB1066 OR /LB1066 AND TON()) AND /LB1067 AND (TON())  ->  LB1066, LB1067
```
- `LB1072` Right Arm Moving Up Complete
- `LB580` Right Arm MRC3 Take Out Operation Start
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GSB011` Ghani_Trial W/O Product
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB1066` Right Arm Chuck Normal Confirm.
- `LB1067` Right Arm Chcuck Abnormal

**35.**
```
LB1065 AND LT013.Q  ->  LB1070
```
- `LB1065` Right Arm Chuck Complete
- `LB1070` Right Arm Chuck Normal

**36.**
```
(LB1070 OR LB1067)  ->  LB1099
```
- `LB1070` Right Arm Chuck Normal
- `LB1067` Right Arm Chcuck Abnormal
- `LB1099` Right Arm Take Out Operation Complete

## P012_ATS3_Unit / Auto_Running_Output


**1. PP Output Operation
+++++++++++++++++++++++++++++++++++
+++++++++++++++++++++++++++++++++++
Arm Selected Operation

**
```
GSB001 AND /LeftArmTOutOpr  ->  LeftArmTInOpr
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**2.**
```
GSB001 AND /LeftArmTInOpr  ->  LeftArmTOutOpr
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
TRUE  ->  LeftGrpPot
```

**4.**
```
GSB001 AND /RightArmTOutOpr  ->  RightArmTInOpr
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**5.**
```
GSB001 AND /RightArmTInOpr  ->  RightArmTOutOpr
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6. ++++++++++++++++++++++++++++
Gripper Arm Good Condition Checked
**
```
~ (LeftArmTInOpr AND GSB001 AND GSB001 OR LeftArmTOutOpr AND GSB001 OR RightArmTInOpr AND GSB001 AND GSB001 OR RightArmTOutOpr AND GSB001)  ->  GrGoodPost
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**7. ++++++++++++++++++++++++++++
PP forward motion condition Checked
**
```
GSB001  ->  PPFwdGoodCnd
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**8.**
```
GSB001  ->  PPFwdOPR
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**9.**
```
GSB001  ->  PPFwdNOOPR
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**10. ++++++++++++++++++++++++++++
PP Down motion condition Checked
**
```
GSB001  ->  PPDownGoodCnd
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11. Individual Motion Data IAI Table Selection
==============================**
```
~ GSB000 AND /LB320 AND IND_MODE AND (PPXAxis.Post[5].LSComb.LS AND MOVE() OR PPXAxis.Post[10].LSComb.LS OR LB340 OR PPXAxis.Post[2].LSComb.LS AND /LB340 AND MOVE() OR PPXAxis.Post[3].LSComb.LS AND /LB340 AND MOVE() OR PPXAxis.Post[4].LSComb.LS AND /LB340 AND MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB320` Unit  1 Cycle Operation Start
- `IND_MODE` Individual Mode
- `LB340` Ind. Home Pos Return

**12.**
```
~ GSB000 AND /LB320 AND IND_MODE AND (PPXAxis.Post[12].LSComb.LS AND /LB340 AND MOVE() OR PPXAxis.Post[13].LSComb.LS AND /LB340 AND MOVE() OR PPXAxis.Post[14].LSComb.LS AND /LB340 AND MOVE() OR LB340 AND MOVE())
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB320` Unit  1 Cycle Operation Start
- `IND_MODE` Individual Mode
- `LB340` Ind. Home Pos Return

**13. ++++++++++++++++++++++++++++
Data IAI Table Selected

1: WIP_Load
2: MRC3_MC
3: Flash_1
4: Flash_2
**
```
~ GSB000 AND (LB401 AND MOVE() AND GSB009 OR LB402 OR LB403 AND MOVE() AND GSB009 OR LB404 OR LB405 AND MOVE() AND GSB009 OR LB406 OR LB407 AND MOVE() AND GSB009 OR LB408)  ->  LB1000, LB1001, LB1002, LB1003
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB401` WIP Transfer Motion
- `LB402` WIP Return Motion
- `GSB009` Modify Ghani After Moving to Line
- `LB1000` Air Blow Process Start
- `LB403` Flash 2 Processing Motion
- `LB404` MRC3 Take Out Operation
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB405` Flash 1 Take In Operation
- `LB406` Flash 1 Take Out Operation
- `LB1002` PH Air Blow Product Confirm.
- `LB407` Flash 2 Take In Operation
- `LB408` Flash 2 Take Out Operation
- `LB1003` Air Blow Finish Process Memory

**14.**
```
~ GSB010 AND /LB320 AND IND_MODE AND (PPXAxis.Post[5].LSComb.LS AND MOVE() OR PPXAxis.Post[10].LSComb.LS OR GSB009 AND LB340 OR PPXAxis.Post[2].LSComb.LS AND GSB009 AND /LB340 AND MOVE() OR PPXAxis.Post[12].LSComb.LS AND /GSB009 OR PPXAxis.Post[3].LSComb.LS AND GSB009 AND /LB340 AND MOVE() OR PPXAxis.Post[13].LSComb.LS AND /GSB009 OR PPXAxis.Post[4].LSComb.LS AND GSB009 AND /LB340 AND MOVE() OR PPXAxis.Post[14].LSComb.LS AND /GSB009)
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB320` Unit  1 Cycle Operation Start
- `IND_MODE` Individual Mode
- `GSB009` Modify Ghani After Moving to Line
- `LB340` Ind. Home Pos Return

**15.**
```
GSB000
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**16. PP X Axis
LEFT ARM
====================**
```
LB342  ->  LB1200
```
- `LB342` Ind. SM10 FWD Motion
- `LB1200` X Axis Pos 1 Moving Start

**17.**
```
(LB516 OR LB344)  ->  LB1201
```
- `LB516` Cover Shutter Close Confirm.
- `LB344` Ind. SM10 BWD Motion
- `LB1201` X Axis Pos 2 [MRC3 Take In] Moving Start

**18.**
```
(LB666 OR LB346)  ->  LB1202
```
- `LB666` PNP Move to Flash 1 Take Out Pos. Operation Start
- `LB346` Ind. Move SM1 X Axis Pos. 3
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start

**19.**
```
~ (LB766 OR GSB021 AND LB3153 OR LB348)  ->  LB1203
```
- `LB766` PNP Move to Flash 2 Take Out Pos. Operation Start
- `GSB021` Add Sequence when Flash Breakdown
- `LB3153` PNP Moving to Park Area [Flash 2 Take Out Pos.] Operation Start
- `LB348` Ind. Move SM1 X Axis Pos. 4
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start

**20.**
```
(LB426 OR LB350)  ->  LB1204
```
- `LB426` PNP Move To WIP Take In Pos Operation Start
- `LB350` Ind. Move SM1 X Axis Pos. 5
- `LB1204` X Axis Pos 5 [WIP Take In] Moving Start

**21.**
```
~ (LB466 OR LB536 OR LB586 OR GSB009 AND LB656 OR LB352)  ->  LB1209
```
- `LB466` PNP Moving to WIP Take Out Pos Operation Start
- `LB536` PNP Moving to WIP Take Out Pos. Operation Start
- `LB586` PNP Moving to WIP Take Out Pos. Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB656` PNP Move to WIP TO Position Operation Start
- `LB756` PNP Move to WIP TO Position Operation Start
- `LB352` Ind. Move SM1 X Axis Pos. 10
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start

**22. PP X Axis
RIGHT ARM
====================**
```
LB354  ->  LB1200A
```
- `LB354` Ind. Move SM1 X Axis Pos. 11
- `LB1200A` X Axis Pos 11 [Reserve Pos.] Moving Start

**23.**
```
(LB566 OR LB356)  ->  LB1201A
```
- `LB566` PNP Move to MRC3 Take Out Pos. Operation Start
- `LB356` Ind. Move SM1 X Axis Pos. 12
- `LB1201A` X Axis Pos 12 [MRC3 Take Out] Moving Start

**24.**
```
~ (LB616 OR GSB021 AND LB3103 OR LB358)  ->  LB1202A
```
- `LB616` PNP Move to Flash 1 Take In Operation Start
- `GSB021` Add Sequence when Flash Breakdown
- `LB3103` PNP Moving to Park Area [Flash 1 Take In Pos.] Operation Start
- `LB358` Ind. Move SM1 X Axis Pos. 13
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start

**25.**
```
(LB716 OR LB360)  ->  LB1203A
```
- `LB716` PNP Move to Flash 2 Take In Operation Start
- `LB360` Shutter FG Cover Open Cond.
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start

**26. Left PP Y Axis
====================**
```
LB1332  ->  LB1210
```
- `LB1332` Ind. Move SM9 L Y Axis Pos. 1
- `LB1210` Left PP Y Axis Pos 1 Moving Start

**27.**
```
~ (LB674 OR LB732 OR LB774 OR LB632 OR GSB009 AND LB524 OR LB1334)  ->  LB1211
```
- `LB674` Left Arm Y Axis FWD Operation Start
- `LB732` Left Arm Y Axis FWD Operation Start
- `LB774` Left Arm Y Axis FWD Operation Start
- `LB632` Leftt Arm Y Axis FWD Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB524` Left Arm Y Axis FWD Operation Start
- `LB1334` Ind. Move SM9 L Y Axis Pos. 2
- `LB1211` Left PP Y Axis Pos 2 Moving Start

**28.**
```
LB1336  ->  LB1212
```
- `LB1336` Ind. Move SM9 L Y Axis Pos. 3
- `LB1212` Left PP Y Axis Pos 3 Moving Start

**29.**
```
LB1338  ->  LB1213
```
- `LB1338` Ind. Move SM9 L Y Axis Pos. 4
- `LB1213` Left PP Y Axis Pos 4 Moving Start

**30.**
```
~ (LB444 OR LB474 OR /GSB009 AND LB524 OR LB1340 OR GSB009 AND LB5532 OR GSB009 AND LB5658)  ->  LB1214
```
- `LB444` Left Arm Y Axis BWD Operation Start
- `LB474` Left Arm Y Axis BWD Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB524` Left Arm Y Axis FWD Operation Start
- `LB1340` Ind. Move SM9 L Y Axis Pos. 5
- `LB5532` Left Arm Y Axis BWD Operation Start
- `LB5658` Leftt Arm Y Axis BWD Operation Start
- `LB5758` Leftt Arm Y Axis BWD Operation Start
- `LB1214` Left PP Y Axis Pos 5 Moving Start

**31. Left PP Z Axis
====================**
```
LB1322  ->  LB1215
```
- `LB1322` Ind. Move SM7 L Z Axis Pos. 1
- `LB1215` Left PP Z Axis Pos 1 Moving Start

**32.**
```
~ (LB911 OR LB961 OR LB1324)  ->  LB1216
```
- `LB911` Left Arm Moving Down Start Opertion
- `LB961` Left Arm Moving Down Start Operation
- `LB1324` Ind. Move SM7 L Z Axis Pos. 2
- `LB1216` Left PP Z Axis Pos 2 Moving Start

**33.**
```
LB1326  ->  LB1217
```
- `LB1326` Ind. Move SM7 L Z Axis Pos. 3
- `LB1217` Left PP Z Axis Pos 3 Moving Start

**34.**
```
LB1328  ->  LB1218
```
- `LB1328` Ind. Move SM7 L Z Axis Pos. 4
- `LB1218` Left PP Z Axis Pos 4 Moving Start

**35.**
```
~ (LB921 OR LB971 OR LB1330)  ->  LB1219
```
- `LB921` Left Arm Moving Up Start Operation
- `LB971` Left Arm Moving UP Start Operation
- `LB1330` Ind. Move SM7 L Z Axis Pos. 5
- `LB1219` Left PP Z Axis Pos 5 Moving Start

**36. Left PP Rotate Unit
====================**
```
LB1302  ->  LB1220
```
- `LB1302` Ind. Move SM3 L Rotary Pos. 1
- `LB1220` Left PP Rotate Unit Pos 1 Moving Start

**37.**
```
~ (LB670 OR LB728 OR LB770 OR LB628 OR LB1304)  ->  LB1221
```
- `LB670` Left Arm Chuck Rotate Operation Start
- `LB728` Left Arm Chuck Rotate Operation Start
- `LB770` Left Arm Chuck Rotate Operation Start
- `LB628` Left Arm Chuck Rotate Operation Start
- `LB1304` Ind. Move SM3 L Rotary Pos. 2
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start

**38.**
```
LB1306  ->  LB1222
```
- `LB1306` Ind. Move SM3 L Rotary Pos. 3
- `LB1222` Left PP Rotate Unit Pos 3 Moving Start

**39.**
```
LB1308  ->  LB1223
```
- `LB1308` Ind. Move SM3 L Rotary Pos. 4
- `LB1223` Left PP Rotate Unit Pos 4 Moving Start

**40.**
```
~ (LB430 OR LB470 OR LB520 OR GSB009 AND LB5654 OR LB1310 AND RCON_In_Axis1_Status_Signal.B[1])  ->  LB1224
```
- `LB430` Left Arm Chuck Return Operation Start
- `LB470` Left Arm Chuck Return Operartion Start
- `LB520` Additional Chutter Close Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `LB5654` Rotary Left Arm Return Operation Start
- `LB5754` Rotary Left Arm Return Operation Start
- `LB1310` Ind. Move SM3 L Rotary Pos. 5
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start

**41.**
```
LB1310 AND /RCON_In_Axis1_Status_Signal.B[1]  ->  LB1224A
```
- `LB1310` Ind. Move SM3 L Rotary Pos. 5
- `LB1224A` Left Rotary Zero Position Start

**42. Left PP Chuck Unit
====================**
```
LB1312  ->  LB1225
```
- `LB1312` Ind. Move SM5 L Gripper Pos. 1
- `LB1225` Left PP Chuck Unit Pos 1 Moving Start

**43.**
```
(LB964 OR LB1314)  ->  LB1226
```
- `LB964` Left Arm Chuck Start Operation
- `LB1314` Ind. Move SM5 L Gripper Pos. 2
- `LB1226` Left PP Chuck Unit Pos 2 Moving Start

**44.**
```
LB1316  ->  LB1227
```
- `LB1316` Ind. Move SM5 L Gripper Pos. 3
- `LB1227` Left PP Chuck Unit Pos 3 Moving Start

**45.**
```
LB1318  ->  LB1228
```
- `LB1318` Ind. Move SM5 L Gripper Pos. 4
- `LB1228` Left PP Chuck Unit Pos 4 Moving Start

**46.**
```
(LB914 OR LB1320)  ->  LB1229
```
- `LB914` Left Arm Unhuck Start Operation
- `LB1320` Ind. Move SM5 L Gripper Pos. 5
- `LB1229` Left PP Chuck Unit Pos 5 Moving Start

**47. Right PP Y Axis
====================**
```
LB392  ->  LB1230
```
- `LB392` Ind. Move SM8 R Y Axis Pos. 1
- `LB1230` Right PP Y Axis Pos 1 Moving Start

**48.**
```
~ (LB624 OR LB682 OR LB724 OR LB782 OR GSB009 AND LB574 OR LB394)  ->  LB1231
```
- `LB624` Right Arm Y Axis FWD Operation Start
- `LB682` Right Arm Y Axis FWD Operation Start
- `LB724` Right Arm Y Axis FWD Operation Start
- `LB782` Right Arm Y Axis FWD Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB574` Right Arm Y Axis FWD Operation Start
- `LB394` Ind. Move SM8 R Y Axis Pos. 2
- `LB1231` Right PP Y Axis Pos 2 Moving Start

**49.**
```
LB396  ->  LB1232
```
- `LB396` Ind. Move SM8 R Y Axis Pos. 3
- `LB1232` Right PP Y Axis Pos 3 Moving Start

**50.**
```
LB398  ->  LB1233
```
- `LB398` Ind. Move SM8 R Y Axis Pos. 4
- `LB1233` Right PP Y Axis Pos 4 Moving Start

**51.**
```
~ (/GSB009 AND LB574 OR LB482 OR GSB009 AND LB5656 OR LB446 OR LB5582 OR LB399)  ->  LB1234
```
- `GSB009` Modify Ghani After Moving to Line
- `LB574` Right Arm Y Axis FWD Operation Start
- `LB482` Right Arm Y Axis BWD Operation Start
- `LB5656` Right Arm Y Axis BWD Operation Start
- `LB5756` Right Arm Y Axis BWD Operation Start
- `LB446` Right Arm Y Axis BWD Operation Start
- `LB5582` Right Arm Y Axis BWD Operation Start
- `LB399` Ind. Move SM8 R Y Axis Pos. 5
- `LB1234` Right PP Y Axis Pos 5 Moving Start

**52. Right PP Z Axis
====================**
```
LB382  ->  LB1235
```
- `LB382` Ind. Move SM6 R Z Axis Pos. 1
- `LB1235` Right PP Z Axis Pos 1 Moving Start

**53.**
```
~ (LB1011 OR LB1061 OR LB384)  ->  LB1236
```
- `LB1011` Running GD1B Type
- `LB1061` Right Arm Moving Down Start Operation
- `LB384` Ind. Move SM6 R Z Axis Pos. 2
- `LB1236` Right PP Z Axis Pos 2 Moving Start

**54.**
```
LB386  ->  LB1237
```
- `LB386` Ind. Move SM6 R Z Axis Pos. 3
- `LB1237` Right PP Z Axis Pos 3 Moving Start

**55.**
```
LB388  ->  LB1238
```
- `LB388` Ind. Move SM6 R Z Axis Pos. 4
- `LB1238` Right PP Z Axis Pos 4 Moving Start

**56.**
```
~ (LB1021 OR LB1071 OR LB390)  ->  LB1239
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1071` Right Arm Moving UP Start Operation
- `LB390` Ind. Move SM6 R Z Axis Pos. 5
- `LB1239` Right PP Z Axis Pos 5 Moving Start

**57. Right PP Rotate Unit
====================**
```
LB362  ->  LB1240
```
- `LB362` Shutter FG Cover Close Cond.
- `LB1240` Right PP Rotate Unit Pos 1 Moving Start

**58.**
```
~ (LB620 OR LB720 OR LB778 OR LB678 OR LB364)  ->  LB1241
```
- `LB620` Right Arm Chuck Rotate Operation Start
- `LB720` Right Arm Chuck Rotate Operation Start
- `LB778` Right Arm Chuck Rotate Operation Start
- `LB678` Right Arm Chuck Rotate Operation Start
- `LB364` Additional Chutter FG Open Cond.
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start

**59.**
```
LB366  ->  LB1242
```
- `LB366` Additional Chutter FG Close Cond.
- `LB1242` Right PP Rotate Unit Pos 3 Moving Start

**60.**
```
LB368  ->  LB1243
```
- `LB368` Ind. Move SM2 R Rotary Pos. 4
- `LB1243` Right PP Rotate Unit Pos 4 Moving Start

**61.**
```
~ (LB570 OR LB478 OR LB434 OR GSB009 AND LB5652 OR LB370 AND RCON_In_Axis0_Status_Signal.B[1])  ->  LB1244
```
- `LB570` Right Arm Chuck Return Operation Start
- `LB478` Right Arm Chuck Return Operartion Start
- `LB434` Right Arm Chuck Return Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB5652` Rotary Right Arm Return Operation Start
- `LB5752` Rotary Right Arm Return Operation Start
- `LB370` Ind. Move SM2 R Rotary Pos. 5
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start

**62.**
```
LB370 AND /RCON_In_Axis0_Status_Signal.B[1]  ->  LB1244A
```
- `LB370` Ind. Move SM2 R Rotary Pos. 5
- `LB1244A` Right Rotary Zero Position Start

**63. Right PP Chuck Unit
====================**
```
LB372  ->  LB1245
```
- `LB372` Ind. Move SM4 R Gripper Pos. 1
- `LB1245` Right PP Chuck Unit Pos 1 Moving Start

**64.**
```
(LB1064 OR LB374)  ->  LB1246
```
- `LB1064` Right Arm Chuck Start Operation'
- `LB374` Ind. Move SM4 R Gripper Pos. 2 (Chuck)
- `LB1246` Right PP Chuck Unit Pos 2 Moving Start

**65.**
```
LB376  ->  LB1247
```
- `LB376` Ind. Move SM4 R Gripper Pos. 3
- `LB1247` Right PP Chuck Unit Pos 3 Moving Start

**66.**
```
LB378  ->  LB1248
```
- `LB378` Ind. Move SM4 R Gripper Pos. 4
- `LB1248` Right PP Chuck Unit Pos 4 Moving Start

**67.**
```
(LB1014 OR LB380)  ->  LB1249
```
- `LB1014` Warning : Air Blow Double Process
- `LB380` Flash 2 Debugging Operation Condition
- `LB1249` Right PP Chuck Unit Pos 5 Moving Start

**68. Servo Output
====================**
```
~ (LB1200 OR LB1201 OR LB1202 OR LB1203 OR LB1204 OR LB1205 OR LB1209 OR LB1200A OR LB1201A OR LB1202A OR LB1203A)  ->  LB1250
```
- `LB1200` X Axis Pos 1 Moving Start
- `LB1201` X Axis Pos 2 [MRC3 Take In] Moving Start
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB1204` X Axis Pos 5 [WIP Take In] Moving Start
- `LB1205` X Axis Pos 6 Moving Start
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `LB1200A` X Axis Pos 11 [Reserve Pos.] Moving Start
- `LB1201A` X Axis Pos 12 [MRC3 Take Out] Moving Start
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start
- `LB1250` SM1 X Axis Moving Start

**69.**
```
~ (LB1210 OR LB1211 OR LB1212 OR LB1213 OR LB1214)  ->  LB1251
```
- `LB1210` Left PP Y Axis Pos 1 Moving Start
- `LB1211` Left PP Y Axis Pos 2 Moving Start
- `LB1212` Left PP Y Axis Pos 3 Moving Start
- `LB1213` Left PP Y Axis Pos 4 Moving Start
- `LB1214` Left PP Y Axis Pos 5 Moving Start
- `LB1251` SM9 Left Y Axis Moving Start

**70.**
```
~ (LB1215 OR LB1216 OR LB1217 OR LB1218 OR LB1219)  ->  LB1252
```
- `LB1215` Left PP Z Axis Pos 1 Moving Start
- `LB1216` Left PP Z Axis Pos 2 Moving Start
- `LB1217` Left PP Z Axis Pos 3 Moving Start
- `LB1218` Left PP Z Axis Pos 4 Moving Start
- `LB1219` Left PP Z Axis Pos 5 Moving Start
- `LB1252` SM7 Left Z Axis Moving Start

**71.**
```
~ (LB1220 OR LB1221 OR LB1222 OR LB1223 OR LB1224)  ->  LB1253
```
- `LB1220` Left PP Rotate Unit Pos 1 Moving Start
- `LB1221` Left PP Rotate Unit Pos 2 Moving Start
- `LB1222` Left PP Rotate Unit Pos 3 Moving Start
- `LB1223` Left PP Rotate Unit Pos 4 Moving Start
- `LB1224` Left PP Rotate Unit Pos 5 Moving Start
- `LB1253` SM3 Left Rotate Unit Moving Start

**72.**
```
~ (LB1225 OR LB1226 OR LB1227 OR LB1228 OR LB1229)  ->  LB1254
```
- `LB1225` Left PP Chuck Unit Pos 1 Moving Start
- `LB1226` Left PP Chuck Unit Pos 2 Moving Start
- `LB1227` Left PP Chuck Unit Pos 3 Moving Start
- `LB1228` Left PP Chuck Unit Pos 4 Moving Start
- `LB1229` Left PP Chuck Unit Pos 5 Moving Start
- `LB1254` SM5 Left Gripper Moving Start

**73.**
```
~ (LB1230 OR LB1231 OR LB1232 OR LB1233 OR LB1234)  ->  LB1256
```
- `LB1230` Right PP Y Axis Pos 1 Moving Start
- `LB1231` Right PP Y Axis Pos 2 Moving Start
- `LB1232` Right PP Y Axis Pos 3 Moving Start
- `LB1233` Right PP Y Axis Pos 4 Moving Start
- `LB1234` Right PP Y Axis Pos 5 Moving Start
- `LB1256` SM8 Right Y Axis Moving Start

**74.**
```
~ (LB1235 OR LB1236 OR LB1237 OR LB1238 OR LB1239)  ->  LB1257
```
- `LB1235` Right PP Z Axis Pos 1 Moving Start
- `LB1236` Right PP Z Axis Pos 2 Moving Start
- `LB1237` Right PP Z Axis Pos 3 Moving Start
- `LB1238` Right PP Z Axis Pos 4 Moving Start
- `LB1239` Right PP Z Axis Pos 5 Moving Start
- `LB1257` SM6 Right Z Axis Moving Start

**75.**
```
~ (LB1240 OR LB1241 OR LB1242 OR LB1243 OR LB1244)  ->  LB1258
```
- `LB1240` Right PP Rotate Unit Pos 1 Moving Start
- `LB1241` Right PP Rotate Unit Pos 2 Moving Start
- `LB1242` Right PP Rotate Unit Pos 3 Moving Start
- `LB1243` Right PP Rotate Unit Pos 4 Moving Start
- `LB1244` Right PP Rotate Unit Pos 5 Moving Start
- `LB1258` SM2 Right Rotate Unit Moving Start

**76.**
```
~ (LB1245 OR LB1246 OR LB1247 OR LB1248 OR LB1249)  ->  LB1259
```
- `LB1245` Right PP Chuck Unit Pos 1 Moving Start
- `LB1246` Right PP Chuck Unit Pos 2 Moving Start
- `LB1247` Right PP Chuck Unit Pos 3 Moving Start
- `LB1248` Right PP Chuck Unit Pos 4 Moving Start
- `LB1249` Right PP Chuck Unit Pos 5 Moving Start
- `LB1259` SM4 Right Gripper Moving Start

**77.**
```
~ (LB424 OR LB464 OR LB514 OR LB534 OR LB584 OR LB564 OR LB614 OR LB654 OR LB664 OR LB714 OR LB754 OR LB764 OR GSB021 AND LB3101)  ->  LB1300
```
- `LB424` PNP Moving Interlock Request
- `LB464` PNP Moving Interlock Request
- `LB514` Safety Confirm. [Sensor is OFF]
- `LB534` PNP Moving Interlock Request.
- `LB584` PNP Moving Interlock Request.
- `LB564` PNP Moving Interlock Request
- `LB654` PNP Moving Interlock Request
- `LB664` PNP Moving Interlock Request
- `LB714` PNP Moving Interlock Request
- `LB754` PNP Moving Interlock Request
- `LB764` PNP Moving Interlock Request
- `GSB021` Add Sequence when Flash Breakdown
- `LB3101` PNP Moving Interlock Request
- `LB3151` PNP Moving Interlock Request
- `LB1300` Auto : ATS Moving Interlock Request.

## P012_ATS3_Unit / Servo_XAxis


**1. X Axis Motion**
```
GSB010 AND GSB000
```
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**2.**
```
/GSB010 AND (MOVE() OR MOVE())
```
- `GSB010` FOR MACHINE ADJUST_SPARE1

**3.**
```
LB1250 AND MC_Move()
```
- `LB1250` SM1 X Axis Moving Start

## P012_ATS3_Unit / Memory_Feeding


**1.**
```
~ (LB501 AND /GSB010 OR LB500 AND /GSB009 AND LB966 AND GSB010)  ->  LB2000
```
- `LB501` Shutter FG Motion
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `GSB009` Modify Ghani After Moving to Line
- `LB966` Left Arm Chuck Normal Confirm.
- `LB965` Left Arm Chuck Complete
- `LB2000` Flash 1 Debugging Enable/Disable

**2.**
```
~ (LB581 AND /GSB010 OR LB580 AND /GSB009 AND LB1066 AND GSB010)  ->  LB2001
```
- `LB581` Right Arm MRC3 Take Out Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB580` Right Arm MRC3 Take Out Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB1066` Right Arm Chuck Normal Confirm.
- `LB1065` Right Arm Chuck Complete
- `LB2001` Flash 2 Debugging Mode

**3.**
```
~ (LB701 AND /GSB010 OR LB700 AND /GSB009 AND LB966 AND GSB010)  ->  LB2002
```
- `LB701` Left Arm Flash 1 Take Out Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB700` Left Arm Flash 1 Take Out Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB966` Left Arm Chuck Normal Confirm.
- `LB965` Left Arm Chuck Complete
- `LB2002` Flash 2 Continous Debugging Enable/Disable

**4.**
```
~ (LB801 AND /GSB010 OR LB800 AND /GSB009 AND LB966 AND GSB010)  ->  LB2003
```
- `LB801` ATS Finish Process Memory
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB800` Memory WIP Trans. Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `LB966` Left Arm Chuck Normal Confirm.
- `LB965` Left Arm Chuck Complete
- `LB2003` Flash 1 Continous Debugging Enable

**5.**
```
~ (LB451 AND /GSB010 OR LB450 AND /GSB009 AND LB916 AND GSB010)  ->  LB2009
```
- `LB451` SM10 BWD Motion Starting
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB450` WIP Return Motion Start
- `GSB009` Modify Ghani After Moving to Line
- `LB916` Left Arm Unchuck Normal Confirm.
- `LB915` Left Arm Unchuck Complete
- `LB2009` WIP Take In Compl. Memory

**6.**
```
~ (LB531 AND /GSB010 OR LB530 AND /GSB009 AND LB916 AND GSB010)  ->  LB2010
```
- `LB531` Left Arm MRC3 Take In Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB530` Left Arm MRC3 Take In Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB916` Left Arm Unchuck Normal Confirm.
- `LB915` Left Arm Unchuck Complete
- `LB2010` MRC Take In Compl. Memory

**7.**
```
~ (LB651 AND /GSB010 OR LB650 AND /GSB009 AND LB1016 AND GSB010)  ->  LB2011
```
- `LB651` Right Arm Flash 1 Take In Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB650` SM10 WIP Trans Moving Start
- `GSB009` Modify Ghani After Moving to Line
- `LB1016` Flash 2 Disable/Enable
- `LB1015` Warning : Forget to NAGARA
- `LB2011` Flash 1 Take In Compl. Memory

**8.**
```
~ (LB751 AND /GSB010 OR LB750 AND /GSB009 AND LB1016 AND GSB010)  ->  LB2012
```
- `LB751` Right Arm Flash 2 Take In Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB750` Right Arm Flash 2 Take In Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `LB1016` Flash 2 Disable/Enable
- `LB1015` Warning : Forget to NAGARA
- `LB2012` Flash 2 Take In Compl. Memory

**9. PN BUFFER MEMORY**
```
(GB011_011 AND @MOVE() OR Tombol1 AND @MOVE())
```
- `GB011_011` WIP Transfer Compl. Memory

**10.**
```
~ (LB2000 AND @MOVE() OR Tombol2 AND @MOVE())
```
- `LB2000` Flash 1 Debugging Enable/Disable

**11.**
```
~ (LB2010 AND @MOVE() OR Tombol3 AND @MOVE())
```
- `LB2010` MRC Take In Compl. Memory

**12.**
```
~ (LB2001 AND @MOVE() OR Tombol4 AND @MOVE())
```
- `LB2001` Flash 2 Debugging Mode

**13.**
```
~ (LB2011 AND @MOVE() OR Tombol5 AND @MOVE())
```
- `LB2011` Flash 1 Take In Compl. Memory

**14.**
```
~ (LB2012 AND @MOVE() OR Tombol6 AND @MOVE())
```
- `LB2012` Flash 2 Take In Compl. Memory

**15.**
```
~ (LB2002 AND @MOVE() OR Tombol7 AND @MOVE())
```
- `LB2002` Flash 2 Continous Debugging Enable/Disable

**16.**
```
~ (LB2003 AND @MOVE() OR Tombol8 AND @MOVE())
```
- `LB2003` Flash 1 Continous Debugging Enable

**17.**
```
~ (LB2009 AND @MOVE() OR Tombol9 AND @MOVE())
```
- `LB2009` WIP Take In Compl. Memory

**18.**
```
LPPSelectDt.Gripper[5].LSComb.LS AND LB152 AND (MOVE() OR MOVE())
```
- `LB152` PH Workpiece 2 Confirm. [GD1B]

**19.**
```
RPPSelectDt.Gripper[5].LSComb.LS AND LB153 AND (MOVE() OR MOVE())
```
- `LB153` PH Workpiece 2 OFF Confirm. [GD1B]

**20.**
```
GB011_022 AND GB011_024 AND /WITHOUT_PRODUCT AND (PPXAxis.Post[5].LSComb.LS AND MOVE() OR PPXAxis.Post[10].LSComb.LS AND MOVE())
```
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `WITHOUT_PRODUCT` Bypass Without Product

**21.**
```
LB151 AND LB006 AND (MOVE() OR MOVE())
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB006` LS Cover MRC Open

**22.**
```
GB014_012 AND (MOVE() OR MOVE())
```
- `GB014_012` Flash 1 No Product Confirm.

**23.**
```
GB015_012 AND (MOVE() OR MOVE())
```
- `GB015_012` PH Flash 2 No Product Confirm.

**24.**
```
~ (LB531 AND /GSB010 OR LB530 AND LB916 AND GSB010 OR GSB009 AND LPPSelectDt.Gripper[5].LSComb.LS AND /AUTO_RUN)  ->  LB2000
```
- `LB531` Left Arm MRC3 Take In Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB530` Left Arm MRC3 Take In Operation Start
- `LB916` Left Arm Unchuck Normal Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `AUTO_RUN` Auto Running
- `LB2000` Flash 1 Debugging Enable/Disable

**25.**
```
~ (LB651 AND /GSB010 OR LB650 AND LB1016 AND GSB010 OR LB751 AND /GSB010 OR LB750 AND LB1016 AND GSB010 OR GSB009 AND RPPSelectDt.Gripper[5].LSComb.LS AND /AUTO_RUN)  ->  LB2001
```
- `LB651` Right Arm Flash 1 Take In Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB650` SM10 WIP Trans Moving Start
- `LB1016` Flash 2 Disable/Enable
- `LB751` Right Arm Flash 2 Take In Complete
- `LB750` Right Arm Flash 2 Take In Operation Start
- `GSB009` Modify Ghani After Moving to Line
- `AUTO_RUN` Auto Running
- `LB2001` Flash 2 Debugging Mode

**26.**
```
~ (LB451 AND /GSB010 AND LB2002 OR LB450 AND LB916 AND GSB010 AND LB2003 OR GSB009 AND LPPSelectDt.Gripper[5].LSComb.LS AND /AUTO_RUN)  ->  LB2002, LB2003
```
- `LB451` SM10 BWD Motion Starting
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB450` WIP Return Motion Start
- `LB916` Left Arm Unchuck Normal Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `AUTO_RUN` Auto Running
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2003` Flash 1 Continous Debugging Enable

**27.**
```
GB011_022 AND GB011_024 AND PPWIPAxis.Post[10].LSComb.LS  ->  LB2009
```
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `LB2009` WIP Take In Compl. Memory

**28.**
```
GSB009 AND LB151 AND /AUTO_RUN AND TON()
```
- `GSB009` Modify Ghani After Moving to Line
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `AUTO_RUN` Auto Running
- `LT060` Delay Flash 2 Debugging Mode

**29.**
```
~ (LB581 AND /GSB010 OR LB580 AND LB1066 AND GSB010 OR LT060.Q OR GSB031 AND NJ_TO_NX_Bool[12])  ->  LB2010
```
- `LB581` Right Arm MRC3 Take Out Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB580` Right Arm MRC3 Take Out Operation Start
- `LB1066` Right Arm Chuck Normal Confirm.
- `GSB031` FOR MACHINE ADJUST_NG HANDLING CHANGE SQ
- `LB2010` MRC Take In Compl. Memory

**30.**
```
~ (LB701 AND /GSB010 OR LB700 AND LB966 AND GSB010 OR GSB009 AND GB014_012 AND /AUTO_RUN OR GB014_012 AND /AUTO_RUN)  ->  LB2011
```
- `LB701` Left Arm Flash 1 Take Out Complete
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB700` Left Arm Flash 1 Take Out Operation Start
- `LB966` Left Arm Chuck Normal Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `GB014_012` Flash 1 No Product Confirm.
- `AUTO_RUN` Auto Running
- `LB2011` Flash 1 Take In Compl. Memory

**31.**
```
~ (LB801 AND /GSB010 OR LB800 AND LB966 AND GSB010 OR GSB009 AND GB015_012 AND /AUTO_RUN OR GB015_012 AND /AUTO_RUN)  ->  LB2012
```
- `LB801` ATS Finish Process Memory
- `GSB010` FOR MACHINE ADJUST_SPARE1
- `LB800` Memory WIP Trans. Confirm.
- `LB966` Left Arm Chuck Normal Confirm.
- `GSB009` Modify Ghani After Moving to Line
- `GB015_012` PH Flash 2 No Product Confirm.
- `AUTO_RUN` Auto Running
- `LB2012` Flash 2 Take In Compl. Memory

**32.**
```
LB010 AND /LB2101  ->  LB2100
```
- `LB010` 品番未設定
- `LB2101` Flash 2 Take Out Priority
- `LB2100` Flash 1 Take Out Priority

**33.**
```
/LB010  ->  LB2100
```
- `LB010` 品番未設定
- `LB2100` Flash 1 Take Out Priority

**34.**
```
LB020 AND /LB2100  ->  LB2101
```
- `LB020` MD異常でない
- `LB2100` Flash 1 Take Out Priority
- `LB2101` Flash 2 Take Out Priority

**35.**
```
/LB020  ->  LB2101
```
- `LB020` MD異常でない
- `LB2101` Flash 2 Take Out Priority

**36.**
```
LB10014  ->  LB820
```
- `LB10014` MRC Master OK Check Compl.
- `LB820` Flash2 Master OK Check Compl.

**37.**
```
LB10015  ->  LB821
```
- `LB10015` Flash 2 Writing  Starting
- `LB821` Flash 2 Master NG Check Compl.

**38.**
```
~ GSB000 AND (LB10005 OR P_First_Run OR LB10006 OR P_First_Run)  ->  LB820, LB821
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB10005` Flash 2 Master OK Check Start
- `LB820` Flash2 Master OK Check Compl.
- `LB10006` Flash 2 Master NG Check Start
- `LB821` Flash 2 Master NG Check Compl.

**39. FOR TRIAL ONLY**
```
Running_Type1 AND (MOVE() OR MOVE())
```
- `Running_Type1` Running Abilcore Model

**40.**
```
Running_Type2 AND (MOVE() OR MOVE())
```
- `Running_Type2` Running GD1B Model

**41.**
```
LB2010 AND TON()
```
- `LB2010` MRC Take In Compl. Memory

**42.**
```
LB2011 AND TON()
```
- `LB2011` Flash 1 Take In Compl. Memory

**43.**
```
LB2012 AND TON()
```
- `LB2012` Flash 2 Take In Compl. Memory

## P012_ATS3_Unit / HMI_Output


**1.**
```
LB400[3]  ->  PL004_02S
```
- `PL004_02S` PL ATS 1 Cycle Running

**2.**
```
(LB099 OR aP_1s AND LB340)  ->  PL004_02R
```
- `LB099` WIP Transfer Unit Home Pos.
- `aP_1s` 1SEC CLOCK PULSE
- `LB340` Ind. Home Pos Return
- `PL004_02R` PL ATS Homepos.

**3.**
```
LB1256  ->  PL421_05M
```
- `LB1256` SM8 Right Y Axis Moving Start
- `PL421_05M` PL SM8 R Y Axis Moving

**4.**
```
RPPSelectDt.YAxis[PW421_005].LSComb.LS  ->  PL421_05R
```
- `PL421_05R` PL SM8 R Y Axis Home

**5.**
```
LB1257  ->  PL421_04M
```
- `LB1257` SM6 Right Z Axis Moving Start
- `PL421_04M` PL SM6 R Z Axis Moving

**6.**
```
RPPSelectDt.ZAxis[PW421_004].LSComb.LS  ->  PL421_04R
```
- `PL421_04R` PL SM6 R Z Axis Home

**7.**
```
LB1258  ->  PL421_02M
```
- `LB1258` SM2 Right Rotate Unit Moving Start
- `PL421_02M` PL SM2 R Rotate Axis Moving

**8.**
```
RPPSelectDt.Rotate[PW421_002].LSComb.LS AND RCON_In_Axis0_Status_Signal.B[1]  ->  PL421_02R
```
- `PL421_02R` PL SM2 R Rotate Axis Home

**9.**
```
LB1259  ->  PL421_03M
```
- `LB1259` SM4 Right Gripper Moving Start
- `PL421_03M` PL SM4 R Gripper Moving

**10.**
```
RPPSelectDt.Gripper[PW421_003].LSComb.LS  ->  PL421_03R
```
- `PL421_03R` PL SM4 R Gripper Home

**11.**
```
LB1251  ->  PL422_04M
```
- `LB1251` SM9 Left Y Axis Moving Start
- `PL422_04M` PL SM9 L Y Axis Moving

**12.**
```
LPPSelectDt.YAxis[PW422_004].LSComb.LS  ->  PL422_04R
```
- `PL422_04R` PL SM9 L Y Axis  Home

**13.**
```
LB1252  ->  PL422_03M
```
- `LB1252` SM7 Left Z Axis Moving Start
- `PL422_03M` PL SM7 L Z Axis Moving

**14.**
```
LPPSelectDt.ZAxis[PW422_003].LSComb.LS  ->  PL422_03R
```
- `PL422_03R` PL SM7 L Z Axis Home

**15.**
```
LB1253  ->  PL422_01M
```
- `LB1253` SM3 Left Rotate Unit Moving Start
- `PL422_01M` PL SM3 L Rotate Axis Moving

**16.**
```
LPPSelectDt.Rotate[PW422_001].LSComb.LS AND RCON_In_Axis1_Status_Signal.B[1]  ->  PL422_01R
```
- `PL422_01R` PL SM3 L Rotate Axis Home

**17.**
```
LB1254  ->  PL422_02M
```
- `LB1254` SM5 Left Gripper Moving Start
- `PL422_02M` PL SM5 L Gripper Moving

**18.**
```
LPPSelectDt.Gripper[PW422_002].LSComb.LS  ->  PL422_02R
```
- `PL422_02R` PL SM5 L Gripper Home

**19.**
```
LB1250  ->  PL422_05M
```
- `LB1250` SM1 X Axis Moving Start
- `PL422_05M` PL SM1 X Axis Moving

**20.**
```
PPXAxis.Post[PW422_005].LSComb.LS  ->  PL422_05R
```
- `PL422_05R` PL SM1 X Axis Home

**21. FOR TRIAL ONLY (DUMMY)**
```
GSB011 AND (LB2010 OR LB000) AND aP_1s  ->  PL004_05C
```
- `GSB011` Ghani_Trial W/O Product
- `LB2010` MRC Take In Compl. Memory
- `aP_1s` 1SEC CLOCK PULSE

**22.**
```
GSB011 AND (GB014_023 OR LB010) AND aP_1s  ->  PL004_03C
```
- `GSB011` Ghani_Trial W/O Product
- `GB014_023` Flash 1 Compl. Memory
- `aP_1s` 1SEC CLOCK PULSE
- `LB010` 品番未設定

**23.**
```
GSB011 AND (GB015_023 OR LB020) AND aP_1s  ->  PL004_04C
```
- `GSB011` Ghani_Trial W/O Product
- `GB015_023` Flash 2 Compl. Memory
- `aP_1s` 1SEC CLOCK PULSE
- `LB020` MD異常でない

**24. MRC Master Check**
```
LB10005  ->  PL700_001
```
- `LB10005` Flash 2 Master OK Check Start
- `PL700_001` PL MRC Master OK Start

**25.**
```
LB10006  ->  PL700_003
```
- `LB10006` Flash 2 Master NG Check Start
- `PL700_003` PL MRC Master NG Start

**26.**
```
LB820  ->  PL700_002
```
- `LB820` Flash2 Master OK Check Compl.
- `PL700_002` PL MRC Master OK Compl

**27.**
```
LB821  ->  PL700_004
```
- `LB821` Flash 2 Master NG Check Compl.
- `PL700_004` PL MRC Master NG Compl

## P012_ATS3_Unit / Device_Output


**1.**
```
GSB001  ->  CH0005_00
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `CH0005_00` SOL COVER CLOSE (FLASH1) [IOBus://unit#7/Output Bit 16 bits/Output Bit 00]

**2.**
```
GSB001  ->  CH0005_01
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `CH0005_01` SOL COVER OPEN (FLASH1) [IOBus://unit#7/Output Bit 16 bits/Output Bit 01]

**3.**
```
GSB001  ->  CH0005_02
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `CH0005_02` SOL COVER CLOSE (FLASH2) [IOBus://unit#7/Output Bit 16 bits/Output Bit 02]

**4.**
```
GSB001  ->  CH0005_03
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `CH0005_03` SOL COVER OPEN (FLASH2) [IOBus://unit#7/Output Bit 16 bits/Output Bit 03]

**5.**
```
GSB000 AND (LB2009 OR CP2E_TO_NX_Word[4]) AND PPWIPAxis.Post[10].LSComb.LS  ->  CH0005_12, CH0005_11
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB2009` WIP Take In Compl. Memory
- `CH0005_12`  [IOBus://unit#7/Output Bit 16 bits/Output Bit 12]
- `CH0005_11`  [IOBus://unit#7/Output Bit 16 bits/Output Bit 11]

## P012_ATS3_Unit / LPP_Device_Output


**1. ■ Servo IAI 
**Left Side PP Unit==========================================
Conviguration Axis:

Axis Table                                           Axis IAI
SM2 Right Arm Rotary Unit     =       Axis no 0
SM3 Left Arm Rotary Unit       =       Axis no 1
SM4 Right Arm Gripper Unit   =       Axis no 2
SM5 Left Arm Gripper Unit     =       Axis no 3
SM6 Right Arm Z Axis Unit     =       Axis no 4
SM7 Left Arm Z Axis Unit       =       Axis no 5
SM8 Right Arm Y Axis Unit     =       Axis no 6
SM9 Left Arm Y Axis Unit       =       Axis no 7
SM10 WIP Transfer Unit         =       Axis no 8

+++++++++++++++++++++++++++++++++++++++++++++++++
Left Side PP Unit __Y Axis Device Output**
```
LB1251  ->  RCON_Out_Axis7_Control_Signal.B[0]
```
- `LB1251` SM9 Left Y Axis Moving Start

**2.**
```
GSB001  ->  RCON_Out_Axis7_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
GSB001  ->  RCON_Out_Axis7_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1251 AND (RCON_In_Axis7_Status_Signal.B[3] OR RCON_In_Axis7_Status_Signal.B[5])  ->  RCON_Out_Axis7_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1251` SM9 Left Y Axis Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**5.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis7_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis7_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**6.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis7_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis7_Control_Signal.B[5])  ->  RCON_Out_Axis7_Control_Signal.B[5]
```

**7.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis7_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**8.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis7_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**9.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis7_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**10.**
```
GSB001  ->  RCON_Out_Axis7_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11. +++++++++++++++++++++++++++++++++++++++++++++++++
Left Side PP Unit __Z Axis Device Output**
```
LB1252  ->  RCON_Out_Axis5_Control_Signal.B[0]
```
- `LB1252` SM7 Left Z Axis Moving Start

**12.**
```
GSB001  ->  RCON_Out_Axis5_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**13.**
```
GSB001  ->  RCON_Out_Axis5_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1252 AND (RCON_In_Axis5_Status_Signal.B[3] OR RCON_In_Axis5_Status_Signal.B[5])  ->  RCON_Out_Axis5_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1252` SM7 Left Z Axis Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**15.**
```
~ (AUTO_MODE OR IND_MODE OR MASTER_READY OR RCON_In_Axis5_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis5_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**16.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis5_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis5_Control_Signal.B[5])  ->  RCON_Out_Axis5_Control_Signal.B[5]
```

**17.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis5_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**18.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis5_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**19.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis5_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**20.**
```
=() AND =() AND =() AND (PB361_004 AND /RCON_Out_Axis5_Control_Signal.B[15] OR /PB361_004 AND RCON_Out_Axis5_Control_Signal.B[15])  ->  RCON_Out_Axis5_Control_Signal.B[15]
```

**21. +++++++++++++++++++++++++++++++++++++++++++++++++
Left Side PP Unit __Rotate Device Output**
```
LB1253  ->  RCON_Out_Axis1_Control_Signal.B[0]
```
- `LB1253` SM3 Left Rotate Unit Moving Start

**22.**
```
LB1224A  ->  RCON_Out_Axis1_Control_Signal.B[1]
```
- `LB1224A` Left Rotary Zero Position Start

**23.**
```
GSB001  ->  RCON_Out_Axis1_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**24.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1253 AND (RCON_In_Axis1_Status_Signal.B[3] OR RCON_In_Axis1_Status_Signal.B[5])  ->  RCON_Out_Axis1_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1253` SM3 Left Rotate Unit Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**25.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis1_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis1_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**26.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis1_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis1_Control_Signal.B[5])  ->  RCON_Out_Axis1_Control_Signal.B[5]
```

**27.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis1_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**28.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis1_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**29.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis1_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**30.**
```
GSB001  ->  RCON_Out_Axis1_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**31. +++++++++++++++++++++++++++++++++++++++++++++++++
Left Side PP Unit __Chuck Device Output**
```
LB1254  ->  RCON_Out_Axis3_Control_Signal.B[0]
```
- `LB1254` SM5 Left Gripper Moving Start

**32.**
```
GSB001  ->  RCON_Out_Axis3_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**33.**
```
GSB001  ->  RCON_Out_Axis3_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**34.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1254 AND (RCON_In_Axis3_Status_Signal.B[3] OR RCON_In_Axis3_Status_Signal.B[5])  ->  RCON_Out_Axis3_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1254` SM5 Left Gripper Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**35.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis3_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis3_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**36.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis3_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis3_Control_Signal.B[5])  ->  RCON_Out_Axis3_Control_Signal.B[5]
```

**37.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis3_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**38.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis3_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**39.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis3_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**40.**
```
GSB001  ->  RCON_Out_Axis3_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

## P012_ATS3_Unit / RPP_Device_Output


**1. ■ Servo IAI 
**Right  Side PP Unit==========================================
Conviguration Axis:

Axis Table                                           Axis IAI
SM2 Right Arm Rotary Unit     =       Axis no 0
SM3 Left Arm Rotary Unit       =       Axis no 1
SM4 Right Arm Gripper Unit   =       Axis no 2
SM5 Left Arm Gripper Unit     =       Axis no 3
SM6 Right Arm Z Axis Unit     =       Axis no 4
SM7 Left Arm Z Axis Unit       =       Axis no 5
SM8 Right Arm Y Axis Unit     =       Axis no 6
SM9 Left Arm Y Axis Unit       =       Axis no 7
SM10 WIP Transfer Unit         =       Axis no 8

+++++++++++++++++++++++++++++++++++++++++++++++++
Right Side PP Unit __Y Axis Device Output**
```
LB1256  ->  RCON_Out_Axis6_Control_Signal.B[0]
```
- `LB1256` SM8 Right Y Axis Moving Start

**2.**
```
GSB001  ->  RCON_Out_Axis6_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**3.**
```
GSB001  ->  RCON_Out_Axis6_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1256 AND (RCON_In_Axis6_Status_Signal.B[3] OR RCON_In_Axis6_Status_Signal.B[5])  ->  RCON_Out_Axis6_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1256` SM8 Right Y Axis Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**5.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis6_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis6_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**6.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis6_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis6_Control_Signal.B[5])  ->  RCON_Out_Axis6_Control_Signal.B[5]
```

**7.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis6_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**8.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis6_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**9.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis6_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**10.**
```
GSB001  ->  RCON_Out_Axis6_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11. +++++++++++++++++++++++++++++++++++++++++++++++++
Right Side PP Unit __Z Axis Device Output**
```
LB1257  ->  RCON_Out_Axis4_Control_Signal.B[0]
```
- `LB1257` SM6 Right Z Axis Moving Start

**12.**
```
GSB001  ->  RCON_Out_Axis4_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**13.**
```
GSB001  ->  RCON_Out_Axis4_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1257 AND (RCON_In_Axis4_Status_Signal.B[3] OR RCON_In_Axis4_Status_Signal.B[5])  ->  RCON_Out_Axis4_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1257` SM6 Right Z Axis Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**15.**
```
~ (AUTO_MODE OR IND_MODE OR MASTER_READY OR RCON_In_Axis4_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis4_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**16.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis4_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis4_Control_Signal.B[5])  ->  RCON_Out_Axis4_Control_Signal.B[5]
```

**17.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis4_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**18.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis4_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**19.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis4_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**20.**
```
=() AND =() AND =() AND (PB361_004 AND /RCON_Out_Axis4_Control_Signal.B[15] OR /PB361_004 AND RCON_Out_Axis4_Control_Signal.B[15])  ->  RCON_Out_Axis4_Control_Signal.B[15]
```

**21. +++++++++++++++++++++++++++++++++++++++++++++++++
Right Side PP Unit __Rotate Device Output**
```
LB1258  ->  RCON_Out_Axis0_Control_Signal.B[0]
```
- `LB1258` SM2 Right Rotate Unit Moving Start

**22.**
```
LB1244A  ->  RCON_Out_Axis0_Control_Signal.B[1]
```
- `LB1244A` Right Rotary Zero Position Start

**23.**
```
GSB001  ->  RCON_Out_Axis0_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**24.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1258 AND (RCON_In_Axis0_Status_Signal.B[3] OR RCON_In_Axis0_Status_Signal.B[5])  ->  RCON_Out_Axis0_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1258` SM2 Right Rotate Unit Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**25.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis0_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis0_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**26.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis0_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis0_Control_Signal.B[5])  ->  RCON_Out_Axis0_Control_Signal.B[5]
```

**27.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis0_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**28.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis0_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**29.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis0_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**30.**
```
GSB001  ->  RCON_Out_Axis0_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**31. +++++++++++++++++++++++++++++++++++++++++++++++++
Right Side PP Unit __Chuck Device Output**
```
LB1259  ->  RCON_Out_Axis2_Control_Signal.B[0]
```
- `LB1259` SM4 Right Gripper Moving Start

**32.**
```
GSB001  ->  RCON_Out_Axis2_Control_Signal.B[1]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**33.**
```
GSB001  ->  RCON_Out_Axis2_Control_Signal.B[2]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**34.**
```
(PB_FAULT_RST AND /AUTO_RUN OR MASTER_READY AND /MASTER_ON) AND /LB1259 AND (RCON_In_Axis2_Status_Signal.B[3] OR RCON_In_Axis2_Status_Signal.B[5])  ->  RCON_Out_Axis2_Control_Signal.B[3]
```
- `PB_FAULT_RST` PB Fault Reset
- `AUTO_RUN` Auto Running
- `LB1259` SM4 Right Gripper Moving Start
- `MASTER_READY` Master ON Confirmation
- `MASTER_ON` Master ON ATS Delay

**35.**
```
~ (AUTO_MODE OR IND_MODE OR RCON_In_Axis2_Status_Signal.B[2]) AND MASTER_READY  ->  RCON_Out_Axis2_Control_Signal.B[4]
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `IND_MODE` Individual Mode
- `MASTER_READY` Master ON Confirmation

**36.**
```
=() AND =() AND =() AND (PB361_003 AND /RCON_Out_Axis2_Control_Signal.B[5] OR /PB361_003 AND RCON_Out_Axis2_Control_Signal.B[5])  ->  RCON_Out_Axis2_Control_Signal.B[5]
```

**37.**
```
=() AND =() AND =() AND GB003_012  ->  RCON_Out_Axis2_Control_Signal.B[6]
```
- `GB003_012` Inching Mode On

**38.**
```
=() AND =() AND =() AND GB003_010  ->  RCON_Out_Axis2_Control_Signal.B[7]
```
- `GB003_010` IAI JOG- Operation

**39.**
```
=() AND =() AND =() AND GB003_011  ->  RCON_Out_Axis2_Control_Signal.B[8]
```
- `GB003_011` IAI JOG+ Operation

**40.**
```
GSB001  ->  RCON_Out_Axis2_Control_Signal.B[15]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

## P012_ATS3_Unit / Station_Output


**1.**
```
LB099  ->  GB012_001
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB012_001` PNP ATS3 Home Pos.

**2.**
```
LB209  ->  GB012_002
```
- `LB209` UNIT EMERGENCY STOP OFF
- `GB012_002` PNP ATS3 Emergency Stop Fault Off

**3.**
```
LB219  ->  GB012_003
```
- `LB219` UNIT AUTO STOP OFF
- `GB012_003` PNP ATS3 Auto Stop Fault Off

**4.**
```
LB229  ->  GB012_004
```
- `LB229` UNIT CYCLE STOP OFF
- `GB012_004` PNP ATS3 Cycle Stop Fault Off

**5.**
```
LB239  ->  GB012_005
```
- `LB239` UNIT FAULT STOP OFF
- `GB012_005` PNP ATS3 Fault Stopping Off

**6.**
```
LB249  ->  GB012_006
```
- `LB249` UNIT NOTICE/WARNING OFF
- `GB012_006` PNP ATS3 Notice/Warning Off

**7.**
```
PL700_002 AND PL700_004  ->  GB012_007
```
- `PL700_002` PL MRC Master OK Compl
- `PL700_004` PL MRC Master NG Compl
- `GB012_007` MRC Master Check Complete

**8.**
```
GSB000  ->  GB012_008
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB012_008` PNP3 Auto Cond. (Home Pos. Except)

**9.**
```
/LB400[3]  ->  GB012_009
```
- `GB012_009` PNP ATS3 Machine Abeyance

**10.**
```
GSB001  ->  GB012_010
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**11.**
```
GSB001  ->  GB012_011
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**12.**
```
GSB001  ->  GB012_012
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**13.**
```
GSB001  ->  GB012_013
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
GSB001  ->  GB012_014
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
(LB1204 OR LB1209)  ->  GB012_015
```
- `LB1204` X Axis Pos 5 [WIP Take In] Moving Start
- `LB1209` X Axis Pos 10 [WIP Take Out] Moving Start
- `GB012_015` ATS Moving to WIP Position

**16.**
```
GSB001  ->  GB012_016
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**17.**
```
GSB001  ->  GB012_017
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**18.**
```
GSB001  ->  GB012_018
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**19.**
```
GSB001  ->  GB012_019
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**20.**
```
~ (LB1250 OR LB425 OR LB465 OR LB515 OR LB535 OR GSB021 AND LB3102 OR LB565 OR LB615 OR LB655 OR LB665 OR LB715 OR LB755 OR LB765)  ->  GB012_020
```
- `LB1250` SM1 X Axis Moving Start
- `LB425` PNP Moving Interlock Confirm.
- `LB465` PNP Moving Interlock Confirm.
- `LB515` Auto : Cover Shutter Close Start
- `LB535` PNP Moving Interlock Confirm.
- `GSB021` Add Sequence when Flash Breakdown
- `LB3102` PNP Moving Interlock Confirm.
- `LB3152` PNP Moving Interlock Confirm.
- `LB565` PNP Moving Interlock Confirm.
- `LB615` PNP Moving Interlock Confirm.
- `LB655` PNP Moving Interlock Confirm.
- `LB665` PNP Moving Interlock Confirm.
- `LB715` PNP Moving Interlock Confirm.
- `LB755` PNP Moving Interlock Confirm.
- `LB765` PNP Moving Interlock Confirm.
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)

**21.**
```
LB2002  ->  GB012_021
```
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `GB012_021` Flash 1 Take Out Compl. Memory

**22.**
```
LB2003  ->  GB012_022
```
- `LB2003` Flash 1 Continous Debugging Enable
- `GB012_022` Flash 2 Take Out Compl. Memory

**23.**
```
GSB001  ->  GB012_023
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**24.**
```
GSB001  ->  GB012_024
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**25.**
```
LB501  ->  GB012_025
```
- `LB501` Shutter FG Motion
- `GB012_025` Left Arm WIP Take Out Compl.

**26.**
```
LB2011  ->  GB012_026
```
- `LB2011` Flash 1 Take In Compl. Memory
- `GB012_026` Flash1 Take In Compl. Memory

**27.**
```
LB2012  ->  GB012_027
```
- `LB2012` Flash 2 Take In Compl. Memory
- `GB012_027` Flash 2 Take In Compl. Memory

**28.**
```
LB2009  ->  GB012_028
```
- `LB2009` WIP Take In Compl. Memory
- `GB012_028` WIP Take In Compl. Memory

**29.**
```
GSB001  ->  GB012_029
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**30.**
```
LB151 AND GB014_012 AND GB015_012 AND (GB011_022 OR GSB000) AND GB011_024 AND RPPSelectDt.Gripper[5].LSComb.LS AND LPPSelectDt.Gripper[5].LSComb.LS  ->  GB012_030
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB014_012` Flash 1 No Product Confirm.
- `GB015_012` PH Flash 2 No Product Confirm.
- `GB011_022` PH No Workpiece 1 [Abilcore]
- `GB011_024` PH No Workpiece 2 [GD1B]
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB012_030` No Product on All Station Confirm.

**31.**
```
LB2001  ->  GB012_041
```
- `LB2001` Flash 2 Debugging Mode
- `GB012_041` MRC 3 Take Out Compl. Memory

**32.**
```
LB2010  ->  GB012_042
```
- `LB2010` MRC Take In Compl. Memory
- `GB012_042` MRC 3 Take Out Compl. Memory

**33.**
```
LB405  ->  GB012_046
```
- `LB405` Flash 1 Take In Operation
- `GB012_046` Flash 1 Take In Motion Start

**34.**
```
LB407  ->  GB012_047
```
- `LB407` Flash 2 Take In Operation
- `GB012_047` Flash 2 Take In Motion Start

**35.**
```
LB450 AND LB916  ->  GTM_CT
```
- `LB450` WIP Return Motion Start
- `LB916` Left Arm Unchuck Normal Confirm.
- `GTM_CT` CYCLETIMECOUNT START

**36.**
```
LB450 AND LB916  ->  GCT001
```
- `LB450` WIP Return Motion Start
- `LB916` Left Arm Unchuck Normal Confirm.

**37. Add Connection to MRC**
```
~ (<() OR >() OR Test1) AND GSB000  ->  NX_TO_NJ_Bool[1]
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON

**38.**
```
~ (/GB012_020 OR >() AND LB1202 OR Test2)  ->  NX_TO_NJ_Bool[2]
```
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start

**39.**
```
~ (NJ_TO_NX_Bool[8] OR Test8) AND (/GB012_020 AND <() OR >() AND LB1202)  ->  NX_TO_NJ_Bool[8]
```
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start

**40.**
```
~ (/GB012_020 AND <() OR >() AND LB1202 OR Test4 OR LB10013) AND LB2010 AND PB_OP_ATS_MODE  ->  NX_TO_NJ_Bool[10]
```
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)
- `LB1202` X Axis Pos 3 [Flash 1 Take Out] Moving Start
- `LB1203` X Axis Pos 4 [Flash 2 Take Out] Moving Start
- `LB1202A` X Axis Pos 13 [Flash 1 Take In] Moving Start
- `LB1203A` X Axis Pos 14 [Flash 2 Take In] Moving Start
- `LB2010` MRC Take In Compl. Memory
- `LB10013` Send Part No to Flash 2 Compl.
- `PB_OP_ATS_MODE` Operator or ATS Mode

**41.**
```
LB1300  ->  NX_TO_NJ_Bool[11]
```
- `LB1300` Auto : ATS Moving Interlock Request.

**42.**
```
~ (LB1500 OR LB1510 OR LB10011 OR Tombol10) AND PB_OP_ATS_MODE  ->  NX_TO_NJ_Bool[13]
```
- `LB1500` Jig Dandori Request to MRC
- `LB1510` Dandori Part No Signal
- `LB10011` Flash 2 Req Part No Confirm.
- `PB_OP_ATS_MODE` Operator or ATS Mode

---

# PROGRAM P014_Flash1


## P014_Flash1 / Station_Input


**1. FROM ATS**
```
GB012_020  ->  LB010
```
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)
- `LB010` 品番未設定

**2.**
```
(<() OR >())  ->  LB011
```
- `LB011` 検索品番未検出

## P014_Flash1 / Device_Input


**1.**
```
CH0002_10 AND /CH0002_11  ->  LB050
```
- `CH0002_10` AS COVER CLOSE (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 10]
- `CH0002_11` AS COVER OPEN (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 11]
- `LB050` PH Workpiece Detect 1

**2.**
```
CH0002_11 AND /CH0002_10  ->  LB051
```
- `CH0002_11` AS COVER OPEN (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 11]
- `CH0002_10` AS COVER CLOSE (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 10]
- `LB051` PH Workpiece Detect 2

**3.**
```
(LB051 OR LB050)  ->  LB099
```
- `LB051` PH Workpiece Detect 2
- `LB050` PH Workpiece Detect 1
- `LB099` WIP Transfer Unit Home Pos.

**4.**
```
/CH0006_10  ->  LB020
```
- `CH0006_10` Flash 1 Nagara [IOBus://unit#8/Input Bit 16 bits/Input Bit 10]
- `LB020` MD異常でない

**5.**
```
CH0007_01  ->  LB021
```
- `CH0007_01` PH Workpiece Flash 1 Confirm. [IOBus://unit#9/Input Bit 16 bits/Input Bit 01]
- `LB021` Cycle Stopping All Aux 2

**6.**
```
CH0007_00  ->  LB022
```
- `CH0007_00` PX Cover Flash 1 Close [IOBus://unit#9/Input Bit 16 bits/Input Bit 00]
- `LB022` Cycle Stopping All Aux 3

**7.**
```
CH0007_02  ->  LB023
```
- `CH0007_02` Flash 1 OK Signal [IOBus://unit#9/Input Bit 16 bits/Input Bit 02]
- `LB023` Cycle Stopping All Aux 4

**8.**
```
CH0007_03  ->  LB024
```
- `CH0007_03` Flash 1 NG Signal [IOBus://unit#9/Input Bit 16 bits/Input Bit 03]
- `LB024` Cycle Stop OFF

## P014_Flash1 / HMI_Input


**1.**
```
PB004_03S  ->  LB101
```
- `PB004_03S` PB Flash1 Unit 1 Cycle Start
- `LB101` 品番検索開始(開始位置0)

**2.**
```
PB004_03R  ->  LB102
```
- `PB004_03R` PB Flash1 Ind. Home Pos.
- `LB102` 品番途中検索開始(開始位置0以外)

**3.**
```
PB431_01M  ->  LB103
```
- `PB431_01M` PB Ind. Flash 1 Cover Close
- `LB103` 品番設定ﾁｪｯｸOK

**4.**
```
PB431_01R  ->  LB104
```
- `PB431_01R` PB Ind. Flash 1 Cover Open
- `LB104` 品番設定ﾁｪｯｸNG

**5.**
```
PB431_02M  ->  LB105
```
- `PB431_02M` PB Flash 1 Debugging Start
- `LB105` Ind Spare

**6.**
```
GSB001  ->  LB106
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB106` Ind Spare

**7.**
```
PB431_03M  ->  LB107
```
- `PB431_03M` PB Flash 1 Debugging Mode
- `LB107` Ind Spare

**8.**
```
PB431_03R  ->  LB108
```
- `PB431_03R` PB Flash 1 Continous Debugging
- `LB108` Ind Spare

**9.**
```
PB431_04M  ->  LB109
```
- `PB431_04M` PB Flash 1 Debug Mode Use Front PN
- `LB109` Ind Spare

**10.**
```
GSB001  ->  LB110
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB110` 検索品番有

**11.**
```
GSB001  ->  LB111
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB111` 品番検索完了

**12.**
```
GSB001  ->  LB112
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB112` 検索品番無

**13.**
```
GSB001  ->  LB113
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
GSB001  ->  LB114
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
GSB001  ->  LB115
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB115` 検索品番有

**16.**
```
GSB001  ->  LB116
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**17.**
```
GSB001  ->  LB117
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**18.**
```
GSB001  ->  LB118
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

## P014_Flash1 / Timers


**1.**
```
LB021 AND TON()  ->  LB150
```
- `LB021` Cycle Stopping All Aux 2
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**2.**
```
/LB021 AND TON()  ->  LB151
```
- `LB021` Cycle Stopping All Aux 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]

## P014_Flash1 / Fault


**1. FAULT RESET**
```
MD_FLT_Reset400()
```

**2. EMERGENCY STOP FAULT
=================**
```
(PWR_ON OR AL[46]) AND /PB_EMG_STOP_FLASH1  ->  AL[46]
```
- `PWR_ON` POWER ON DELAY
- `PB_EMG_STOP_FLASH1` PB Emergency Stop Flash 1

**3.**
```
(MASTER_ON_FLASH1 OR AL[47]) AND /AIR_SOURCE_CONF_FLASH1  ->  AL[47]
```
- `MASTER_ON_FLASH1` Master ON Flash 1 Delay
- `AIR_SOURCE_CONF_FLASH1` Air Source Confirm Flash 1

**4.**
```
~ (MSTR_RDY_FLASH1 AND /AIR_SOURCE_CONF_FLASH1 AND LT021.Q OR /MSTR_RDY_FLASH1 AND AIR_SOURCE_CONF_FLASH1 AND TON() OR AL[48])  ->  AL[48]
```
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1
- `AIR_SOURCE_CONF_FLASH1` Air Source Confirm Flash 1
- `LT021` Delay Air Source FG Store Error

**5. AUTO STOP FAULT
=================**
```
GSB001  ->  AL[91]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6. CYCLE STOP FAULT
=================**
```
(CH0002_10 OR AL[161]) AND CH0002_11  ->  AL[161]
```
- `CH0002_10` AS COVER CLOSE (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 10]
- `CH0002_11` AS COVER OPEN (FLASH1) [IOBus://unit#4/Input Bit 16 bits/Input Bit 11]

**7.**
```
~ (CH0006_06 AND Running_Type2 OR Running_Type1 AND CH0006_05 OR AL[162])  ->  AL[162]
```
- `CH0006_06` PH Jig Pokayoke Dandori : Abilcore [IOBus://unit#8/Input Bit 16 bits/Input Bit 06]
- `Running_Type2` Running GD1B Model
- `Running_Type1` Running Abilcore Model
- `CH0006_05` PH Jig Pokayoke Dandori : GD1B [IOBus://unit#8/Input Bit 16 bits/Input Bit 05]

**8.**
```
(PWR_ON OR AL[163]) AND /Flash1_COM_OK  ->  AL[163]
```
- `PWR_ON` POWER ON DELAY
- `Flash1_COM_OK` Flash 1 Communication OK

**9.**
```
(LB802 OR AL[164])  ->  AL[164]
```
- `LB802` ATS Work Finish Take Out from WIP

**10.**
```
(LB10005 OR AL[165]) AND LB10021  ->  AL[165]
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10021` Flash 2 NG Compl.

**11.**
```
(LB10006 OR AL[166]) AND LB10020  ->  AL[166]
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10020` Flash 2 OK Compl.

**12.**
```
(PWR_ON OR AL[167]) AND Flash1_Error_Confirm  ->  AL[167]
```
- `PWR_ON` POWER ON DELAY

**13. FAULT STOP FAULT
=================**
```
LB400[3] AND /LB403 AND /LB400[2] AND TON()  ->  AL[231]
```
- `LB403` Flash 2 Processing Motion

**14.**
```
(LB600 AND /LB050 OR LB601 AND /LB051) AND /LB022 AND TON()  ->  MF[51]
```
- `LB600` SM10 FWD Motion
- `LB050` PH Workpiece Detect 1
- `LB022` Cycle Stopping All Aux 3
- `LB601` SM10 BWD Motion
- `LB051` PH Workpiece Detect 2
- `LT010` Delay

**15. NOTICE/WARNING
=================**
```
~ (Flash1_Send_PartNo AND Flash1_PartNo_REQ AND GSB023 OR Flash1_WP_Removed AND Flash1_TakeOut AND /GSB023 OR Flash1_NG_Remove_REQ AND Flash1_NGReset OR TestButton) AND /LB1010A AND TON()  ->  AL[330]
```
- `Flash1_Send_PartNo` Flash 1 Send Part No
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `Flash1_TakeOut` Flash 1 Take Out
- `Flash1_NGReset` Flash 1 NG Reset
- `GSB023` Improvement After MassPro DNIA MCH
- `LB1010A` Flash 2 Dandori Signal

**16. EMERGENCY STOPPING ALL
=================**
```
GSB000 AND /AL[46] AND /AL[47] AND /AL[48]  ->  LB200
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB200` UNIT EMERGENCY STOP OFF AUX 1

**17.**
```
GSB000  ->  LB201
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB201` UNIT EMERGENCY STOP OFF AUX 2

**18.**
```
GSB000  ->  LB202
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB202` UNIT EMERGENCY STOP OFF AUX 3

**19.**
```
LB200 AND LB201 AND LB202  ->  LB209
```
- `LB200` UNIT EMERGENCY STOP OFF AUX 1
- `LB201` UNIT EMERGENCY STOP OFF AUX 2
- `LB202` UNIT EMERGENCY STOP OFF AUX 3
- `LB209` UNIT EMERGENCY STOP OFF

**20. AUTO STOPPING ALL
=================**
```
GSB000  ->  LB210
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB210` UNIT AUTO STOP OFF AUX 1

**21.**
```
GSB000  ->  LB211
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB211` UNIT AUTO STOP OFF AUX 2

**22.**
```
GSB000  ->  LB212
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB212` UNIT AUTO STOP OFF AUX 3

**23.**
```
LB210 AND LB211 AND LB212  ->  LB219
```
- `LB210` UNIT AUTO STOP OFF AUX 1
- `LB211` UNIT AUTO STOP OFF AUX 2
- `LB212` UNIT AUTO STOP OFF AUX 3
- `LB219` UNIT AUTO STOP OFF

**24. CYCLE STOPPING ALL
=================**
```
GSB000 AND /AL[161] AND /AL[162] AND /AL[163] AND /AL[164] AND /AL[165]  ->  LB220
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB220` UNIT CYCLE STOP OFF AUX 1

**25.**
```
GSB000 AND /AL[166] AND /AL[167]  ->  LB221
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB221` UNIT CYCLE STOP OFF AUX 2

**26.**
```
GSB000  ->  LB222
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB222` UNIT CYCLE STOP OFF AUX 3

**27.**
```
LB220 AND LB221 AND LB222  ->  LB229
```
- `LB220` UNIT CYCLE STOP OFF AUX 1
- `LB221` UNIT CYCLE STOP OFF AUX 2
- `LB222` UNIT CYCLE STOP OFF AUX 3
- `LB229` UNIT CYCLE STOP OFF

**28. FAULT STOPPING ALL
=================**
```
GSB000 AND /AL[231] AND /MF[51]  ->  LB230
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB230` UNIT FAULT STOP OFF AUX 1

**29.**
```
GSB000  ->  LB231
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB231` UNIT FAULT STOP OFF AUX 2

**30.**
```
GSB000  ->  LB232
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB232` UNIT FAULT STOP OFFAUX 3

**31.**
```
LB230 AND LB231 AND LB232  ->  LB239
```
- `LB230` UNIT FAULT STOP OFF AUX 1
- `LB231` UNIT FAULT STOP OFF AUX 2
- `LB232` UNIT FAULT STOP OFFAUX 3
- `LB239` UNIT FAULT STOP OFF

**32. NOTICE/WARNING
=================**
```
GSB000 AND /AL[330]  ->  LB240
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB240` UNIT NOTICE/WARNING OFF AUX 1

**33.**
```
GSB000  ->  LB241
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB241` UNIT NOTICE/WARNING OFF AUX 2

**34.**
```
GSB000  ->  LB242
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB242` UNIT NOTICE/WARNING OFF AUX 3

**35.**
```
LB240 AND LB241 AND LB242  ->  LB249
```
- `LB240` UNIT NOTICE/WARNING OFF AUX 1
- `LB241` UNIT NOTICE/WARNING OFF AUX 2
- `LB242` UNIT NOTICE/WARNING OFF AUX 3
- `LB249` UNIT NOTICE/WARNING OFF

## P014_Flash1 / Preparation


**1.**
```
LB107 AND /AUTO_RUN AND /LB381 AND /MASTER_MODE AND TON()
```
- `LB107` Ind Spare
- `AUTO_RUN` Auto Running
- `LB381` Flash 2 Debugging Start
- `MASTER_MODE` Master Check Mode
- `LT060` Delay Flash 2 Debugging Mode

**2.**
```
LT060.Q AND (LB2001 OR /LB2001)  ->  LB2000, LB2000
```
- `LB2001` Flash 2 Debugging Mode
- `LB2000` Flash 1 Debugging Enable/Disable

**3.**
```
LB2000  ->  LB2001
```
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB2001` Flash 2 Debugging Mode

**4.**
```
PB700_000  ->  LB2000
```
- `PB700_000` PB Master Check Mode
- `LB2000` Flash 1 Debugging Enable/Disable

**5.**
```
LB108 AND /AUTO_RUN AND /LB10010 AND LB2001 AND TON()
```
- `LB108` Ind Spare
- `AUTO_RUN` Auto Running
- `LB10010` Flash 2 Master Check Start
- `LB2001` Flash 2 Debugging Mode
- `LT061` Delay Flash 2 Continous Debugging

**6.**
```
LT061.Q AND (LB2003 OR /LB2003)  ->  LB2002, LB2002
```
- `LB2003` Flash 1 Continous Debugging Enable
- `LB2002` Flash 2 Continous Debugging Enable/Disable

**7.**
```
LB2002  ->  LB2003
```
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2003` Flash 1 Continous Debugging Enable

**8.**
```
LB109 AND /AUTO_RUN AND /LB10010 AND /LB381 AND LB2001 AND GSB001 AND TON()
```
- `LB109` Ind Spare
- `AUTO_RUN` Auto Running
- `LB10010` Flash 2 Master Check Start
- `LB381` Flash 2 Debugging Start
- `LB2001` Flash 2 Debugging Mode
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LT062` Delay Flash 1 Use Front PN

**9.**
```
LT062.Q AND (LB2005 OR /LB2005)  ->  LB2004, LB2004
```
- `LB2005` Flash 2 Use Front P/N
- `LB2004` Flash 2 Use/Not Use Front P/N

**10.**
```
LB2004  ->  LB2005
```
- `LB2004` Flash 2 Use/Not Use Front P/N
- `LB2005` Flash 2 Use Front P/N

**11.**
```
(AUTO_MODE OR PB700_000)  ->  LB2002, LB2004
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `PB700_000` PB Master Check Mode
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2004` Flash 2 Use/Not Use Front P/N

**12. FLASH 1 MASTER CHECK**
```
IND_MODE AND MASTER_ON_FLASH1 AND MASTER_MODE AND LB209 AND LB219  ->  LB10000
```
- `IND_MODE` Individual Mode
- `MASTER_ON_FLASH1` Master ON Flash 1 Delay
- `MASTER_MODE` Master Check Mode
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB10000` Flash 2 Master Check Operation Condition

**13.**
```
LB051 AND LB151 AND LB229  ->  LB10001
```
- `LB051` PH Workpiece Detect 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB229` UNIT CYCLE STOP OFF
- `LB10001` Flash 2 Master Check Start Cond.

**14. Master Check Sequential**
```
(PB700_005 OR LB10005) AND /PB700_007 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10005
```
- `PB700_005` PB Flash1 Master OK Start
- `PB700_007` PB Flash 1 Master NG Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10005` Flash 2 Master OK Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**15.**
```
(PB700_007 OR LB10006) AND /PB700_005 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10006
```
- `PB700_007` PB Flash 1 Master NG Start
- `PB700_005` PB Flash1 Master OK Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10006` Flash 2 Master NG Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**16.**
```
(LB10005 OR LB10006)  ->  LB10010
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10006` Flash 2 Master NG Check Start
- `LB10010` Flash 2 Master Check Start

**17.**
```
(LB10010 OR LB381)  ->  LB10010A
```
- `LB10010` Flash 2 Master Check Start
- `LB381` Flash 2 Debugging Start
- `LB10010A` Flash 2 Writing Motion Start

**18.**
```
~ LB10010A AND (Flash1_PartNo_REQ AND /LB10012 OR LB10011 OR LB10011 AND /LB10013 OR LB10012 OR LB10012 AND /Flash1_PartNo_REQ OR LB10013)  ->  LB10011, LB10012, LB10013
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10011` Flash 2 Req Part No Confirm.
- `LB10012` Send Part No to Flash 2 Start
- `LB10013` Send Part No to Flash 2 Compl.

**19.**
```
~ (LB10013 AND LB020 OR LB10010A AND /Flash1_PartNo_REQ AND LB10015) AND (LB150 OR LB10020 OR LB024 AND /LB10020 OR LB10021 OR LB10021)  ->  LB10015, LB10016, LB10017, LB10018, LB10019, LB10020, LB10021, LB10024
```
- `LB10013` Send Part No to Flash 2 Compl.
- `LB10010A` Flash 2 Writing Motion Start
- `LB020` MD異常でない
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB10015` Flash 2 Writing  Starting
- `LB10016` Flash 2 Cover Close Motion Start
- `LB10017` Flash 2 Cover Close Motion Confirm.
- `LB600` SM10 FWD Motion
- `LB050` PH Workpiece Detect 1
- `LB022` Cycle Stopping All Aux 3
- `LB10018` Flash 2 Writing Start
- `LB10024` Flash 2 Writing Complete
- `LB10019` Flash 2 is Writing
- `LB023` Cycle Stopping All Aux 4
- `LB10020` Flash 2 OK Compl.
- `LB10021` Flash 2 NG Compl.
- `LB024` Cycle Stop OFF

**20.**
```
~ LB10010A AND (LB10020 AND /LB10026 OR LB10025 OR LB10021 AND /LB10025 OR LB10026)  ->  LB10025, LB10026
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10020` Flash 2 OK Compl.
- `LB10025` OK Workpiece Take Out Procedure
- `LB10026` NG Workpiece Take Out Procedure
- `LB10021` Flash 2 NG Compl.

**21.**
```
~ LB10026 AND (Flash1_NG_Remove_REQ AND /LB10031 OR LB10030 OR LB10030 AND /Flash1_NG_Remove_REQ OR LB10031)  ->  LB10030, LB10031
```
- `LB10026` NG Workpiece Take Out Procedure
- `LB10030` Flash 2 Send NG Reset Signal Start
- `LB10031` Flash 2 Seng NG Reset Signal Confirm.

**22.**
```
~ LB10010A AND (LB10031 OR LB10025 OR LB10032) AND PB_RLS_FLASH1  ->  LB10032
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10031` Flash 2 Seng NG Reset Signal Confirm.
- `PB_RLS_FLASH1` PB Release Flash 1
- `LB10025` OK Workpiece Take Out Procedure
- `LB10032` Auto Continue : Flash 2 Cover Open

**23.**
```
~ LB10032 AND (/LB10034 OR LB601 AND LB051 OR LB10034)  ->  LB10033, LB10034
```
- `LB10032` Auto Continue : Flash 2 Cover Open
- `LB10034` Flash 2 Cover Open Motion Confirm.
- `LB10033` Flash 2 Cover Open Motion Start
- `LB601` SM10 BWD Motion
- `LB051` PH Workpiece Detect 2

**24.**
```
~ LB10034 AND (LB151 AND Flash1_WP_Removed OR LB10035 OR LB10035 AND /Flash1_WP_Removed OR LB10036) AND /LB10036  ->  LB10035, LB10036
```
- `LB10034` Flash 2 Cover Open Motion Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB10035` Flash 2 : Send WP Take Out Signal
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.

**25.**
```
LB10036  ->  LB10049
```
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB10049` Flash Writing 2 Motion Compl.

## P014_Flash1 / Condition


**1.**
```
(/LB010 OR GB012_015) AND LB011 AND LB050 AND LB801 AND LB800  ->  LB300
```
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB011` 検索品番未検出
- `LB050` PH Workpiece Detect 1
- `LB801` ATS Finish Process Memory
- `LB800` Memory WIP Trans. Confirm.
- `LB300` WIP Transfer Cond.

**2.**
```
~ (/LB010 OR GB012_015) AND LB011 AND LB051 AND /LB800 AND (LB150 AND GB012_026 OR WITHOUT_PRODUCT AND GB012_026)  ->  LB301
```
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB011` 検索品番未検出
- `LB051` PH Workpiece Detect 2
- `LB800` Memory WIP Trans. Confirm.
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB012_026` Flash1 Take In Compl. Memory
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB301` WIP Return Cond.

**3.**
```
LB050 AND /LB800 AND GSB001  ->  LB302
```
- `LB050` PH Workpiece Detect 1
- `LB800` Memory WIP Trans. Confirm.
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**4.**
```
~ (LB300 AND GSB020 OR LB301 AND /GSB020 OR LB302) AND /FLASH1_DISABLE  ->  LB309
```
- `LB300` WIP Transfer Cond.
- `LB301` WIP Return Cond.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH1_DISABLE` Flash 1 Disable
- `LB309` Unit 1 Cycle Start Condition

## P014_Flash1 / Individual


**1. IND 1 CYCLE**
```
IND_MODE  ->  LB310
```
- `IND_MODE` Individual Mode
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX

**2.**
```
LB310 AND LB209 AND LB219  ->  LB319
```
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB319` UNIT 1 CYCLE OPERATION COND.

**3.**
```
(LB101 AND LB309 AND LB219 OR LB320 AND LB400[3] AND /LB409) AND LB319  ->  LB320
```
- `LB101` 品番検索開始(開始位置0)
- `LB309` Unit 1 Cycle Start Condition
- `LB219` UNIT AUTO STOP OFF
- `LB320` Unit  1 Cycle Operation Start
- `LB409` WIP Transfer Cycle Complete
- `LB319` UNIT 1 CYCLE OPERATION COND.

**4.**
```
IND_MODE AND /LB320 AND /LB10010 AND MC()
```
- `IND_MODE` Individual Mode
- `LB320` Unit  1 Cycle Operation Start
- `LB10010` Flash 2 Master Check Start

**5.**
```
(LB102 OR LB340) AND /LB099  ->  LB340
```
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB340` Ind. Home Pos Return
- `LB099` WIP Transfer Unit Home Pos.

**6.**
```
LB011 AND /LB010  ->  LB342
```
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `LB342` Ind. SM10 FWD Motion

**7.**
```
LB103 AND LB342 AND /LB050 AND /LB345  ->  LB343
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB342` Ind. SM10 FWD Motion
- `LB050` PH Workpiece Detect 1
- `LB345` Ind. Flash 2 Cover Open
- `LB343` SM10 BWD Cond.

**8.**
```
LB011 AND /LB010  ->  LB344
```
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `LB344` Ind. SM10 BWD Motion

**9.**
```
~ (LB104 OR PB_RLS_FLASH1 AND LB802 AND LB022 OR LB345) AND LB344 AND /LB051 AND /LB343  ->  LB345
```
- `LB104` 品番設定ﾁｪｯｸNG
- `PB_RLS_FLASH1` PB Release Flash 1
- `LB802` ATS Work Finish Take Out from WIP
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB022` Cycle Stopping All Aux 3
- `LB345` Ind. Flash 2 Cover Open
- `LB344` Ind. SM10 BWD Motion
- `LB051` PH Workpiece Detect 2
- `LB343` SM10 BWD Cond.

**10.**
```
MCR()
```

**11.**
```
IND_MODE AND MASTER_ON_FLASH1 AND /MASTER_MODE AND LB209 AND LB219  ->  LB380
```
- `IND_MODE` Individual Mode
- `MASTER_ON_FLASH1` Master ON Flash 1 Delay
- `MASTER_MODE` Master Check Mode
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB380` Flash 2 Debugging Operation Condition

**12.**
```
~ (LB105 OR LB2003 OR LB381) AND LB051 AND (/LB2005 AND <>() OR LB2005 AND <>() AND <>()) AND LB2000 AND LB151 AND LB229 AND LB380 AND /LB10049  ->  LB381
```
- `LB105` Ind Spare
- `LB2003` Flash 1 Continous Debugging Enable
- `LB051` PH Workpiece Detect 2
- `LB2005` Flash 2 Use Front P/N
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB229` UNIT CYCLE STOP OFF
- `LB381` Flash 2 Debugging Start
- `LB380` Flash 2 Debugging Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

## P014_Flash1 / Auto_Running


**1. START AUTO MOTION : FLASH 1**
```
(LB309 OR LB400[1]) AND /LB409 AND /CYCLE_STOPPING AND AUTO_RUN AND /LB400[2]  ->  LB400[1]
```
- `LB309` Unit 1 Cycle Start Condition
- `LB409` WIP Transfer Cycle Complete
- `CYCLE_STOPPING` Cycle Stopping
- `AUTO_RUN` Auto Running

**2.**
```
(LB409 OR LB400[2]) AND LB400[3] AND LB400[1]  ->  LB400[2]
```
- `LB409` WIP Transfer Cycle Complete

**3. AUTO RUN CONDITION RUNNING**
```
(LB400[1] OR LB320)  ->  LB400[3]
```
- `LB320` Unit  1 Cycle Operation Start

**4.**
```
~ LB400[3] AND (LB300 AND /LB402 AND /LB403 OR LB401 OR LB301 AND /LB401 AND /LB403 OR LB402 OR LB302 AND /LB401 AND /LB402 OR LB403)  ->  LB401, LB402, LB403
```
- `LB300` WIP Transfer Cond.
- `LB401` WIP Transfer Motion
- `LB402` WIP Return Motion
- `LB403` Flash 2 Processing Motion
- `LB301` WIP Return Cond.

**5.**
```
~ (LB449 OR LB499 OR LB549)  ->  LB409
```
- `LB449` WIP Transfer Cycle Complete
- `LB499` WIP Return Cycle Complete
- `LB549` Shutter FG Cycle Complete
- `LB409` WIP Transfer Cycle Complete

**6. Flash 1 Cover Open Motion
===================**
```
~ (LB401 AND LT112.Q OR LB1020 AND LB022 AND AUTO_RUN AND LB801 AND TON())  ->  LB410
```
- `LB401` WIP Transfer Motion
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB022` Cycle Stopping All Aux 3
- `AUTO_RUN` Auto Running
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP
- `LB410` WIP Transfer Motion Start
- `LT112` Delay Cover Open

**7.**
```
~ LB410 AND (LB610 AND LB011 AND /LB010 AND /LB414 OR LB412 OR LB412 AND /LB414 OR LB601 AND LB051 OR LB414)  ->  LB411, LB412, LB413, LB414
```
- `LB410` WIP Transfer Motion Start
- `LB411` SM10 FWD Motion Starting
- `LB610` SOL FG Shutter Open
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB412` SM10 FWD Motion Running
- `LB414` Auto : Flash 2 Cover Open Motion Confirm.
- `LB413` SM10 FWD Motion Compl.
- `LB601` SM10 BWD Motion
- `LB051` PH Workpiece Detect 2

**8.**
```
LB414  ->  LB419
```
- `LB414` Auto : Flash 2 Cover Open Motion Confirm.
- `LB419` Flash 2 Cover Open Complete

**9.**
```
LB419  ->  LB449
```
- `LB419` Flash 2 Cover Open Complete
- `LB449` WIP Transfer Cycle Complete

**10. Flash 1 Cover Close Motion
===================**
```
LB402  ->  LB450
```
- `LB402` WIP Return Motion
- `LB450` WIP Return Motion Start

**11.**
```
~ LB450 AND (LB610 AND LB011 AND /LB010 AND /LB454 OR LB452 OR LB452 AND /LB454 OR LB600 AND LB050 OR LB454)  ->  LB451, LB452, LB453, LB454
```
- `LB450` WIP Return Motion Start
- `LB451` SM10 BWD Motion Starting
- `LB610` SOL FG Shutter Open
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB452` SM10 BWD Motion Running
- `LB454` Auto : Flash 2 Cover Close Motion Compl.
- `LB453` SM10 BWD Motion Complete
- `LB600` SM10 FWD Motion
- `LB050` PH Workpiece Detect 1

**12.**
```
LB454  ->  LB459
```
- `LB454` Auto : Flash 2 Cover Close Motion Compl.
- `LB459` Flash 2 Cover Close Complete

**13.**
```
LB459  ->  LB499
```
- `LB459` Flash 2 Cover Close Complete
- `LB499` WIP Return Cycle Complete

**14. Flash 1 Processing Motion
===================**
```
LB403  ->  LB500
```
- `LB403` Flash 2 Processing Motion

**15.**
```
~ LB500 AND (GSB000 OR LB501 OR LB501 AND GSB001 OR LB502 OR LB501 AND GSB001 AND /LB502 OR LB503) AND (/LB503)  ->  LB501, LB502, LB503
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB501` Shutter FG Motion
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `GSB009` Modify Ghani After Moving to Line
- `LB502` Flash 2 OK Compl.
- `LB503` Flash 2 NG Compl.

**16.**
```
(LB502 AND LB801 OR LB503 AND LB802)  ->  LB509
```
- `LB502` Flash 2 OK Compl.
- `LB801` ATS Finish Process Memory
- `LB503` Flash 2 NG Compl.
- `LB802` ATS Work Finish Take Out from WIP
- `LB509` Shutter FG 1 Cycle Complete

**17.**
```
LB509  ->  LB549
```
- `LB509` Shutter FG 1 Cycle Complete
- `LB549` Shutter FG Cycle Complete

**18. Flash 1 Processing
Real Machine**
```
(AUTO_RUN OR /AUTO_RUN) AND /LB800 AND Flash1_COM_OK AND LB051  ->  LB1000
```
- `AUTO_RUN` Auto Running
- `LB800` Memory WIP Trans. Confirm.
- `Flash1_COM_OK` Flash 1 Communication OK
- `LB051` PH Workpiece Detect 2
- `LB1000` Air Blow Process Start

**19.**
```
(AUTO_RUN AND GB012_046 AND /LB800 OR /AUTO_RUN AND GSB001 AND LB150)  ->  LB1001
```
- `AUTO_RUN` Auto Running
- `GB012_046` Flash 1 Take In Motion Start
- `LB800` Memory WIP Trans. Confirm.
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB1001` Air Blow FG Take Out Compl. Memory

**20.**
```
(LB1001 OR LB1010) AND LB1000 AND /LB1029 AND MSTR_RDY_FLASH1 AND Flash1_COM_OK AND (<>() AND <>())  ->  LB1010, LB1010A
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB1000` Air Blow Process Start
- `LB1010` Running Abilcore Type
- `LB1029` Flash 2 Writing Motion Complete
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1
- `Flash1_COM_OK` Flash 1 Communication OK
- `LB1010A` Flash 2 Dandori Signal

**21.**
```
~ LB1010 AND (/Flash1_PartNo_REQ AND GSB001 AND /LB850 AND /LB1010A AND /LB1012 OR Flash1_PartNo_REQ OR LB1010A AND Flash1_PartNo_REQ OR LB850 OR LB1011 OR LB1011 AND /LB1013 OR LB1012 OR LB1012 AND /Flash1_PartNo_REQ AND /LB1014 AND LB850 AND LT051.Q OR LB1013)  ->  LB1011, LB1012, LB1013, LB1010A
```
- `LB1010` Running Abilcore Type
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB850` First Cycle Flash 2 Memory
- `LB1010A` Flash 2 Dandori Signal
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `GSB023` Improvement After MassPro DNIA MCH

**22.**
```
~ LB1010 AND (LB022 AND LB050 AND Flash1_Standby OR LB1014 OR LB1014 AND Flash1_Process OR LB1015 OR LB1015 AND LB023 AND /LB1017 OR LB1015 AND LB1016 OR LB1018) AND /LB1018 AND (LT052.Q OR TON() OR GSB023 AND <>() AND MOVE())  ->  LB1014, LB1015, LB1016, LB1017, LB1018
```
- `LB1010` Running Abilcore Type
- `LB022` Cycle Stopping All Aux 3
- `LB050` PH Workpiece Detect 1
- `LB1014` Warning : Air Blow Double Process
- `LB1018` Bypass Airblow Enable/Disable
- `GSB023` Improvement After MassPro DNIA MCH
- `LB1015` Warning : Forget to NAGARA
- `LB023` Cycle Stopping All Aux 4
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB024` Cycle Stop OFF

**23.**
```
~ LB1010 AND LB1018 AND (LB1016 AND /LB1021 OR LB1020 OR LB1017 AND /LB1020 OR LB1021)  ->  LB1020, LB1021
```
- `LB1010` Running Abilcore Type
- `LB1018` Bypass Airblow Enable/Disable
- `LB1016` Flash 2 Disable/Enable
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1017` Flash 2 Disable

**24.**
```
~ LB1021 AND (Flash1_NG_Remove_REQ OR LB1022 OR LB1022 AND /Flash1_NG_Remove_REQ OR LB1023)  ->  LB1022, LB1023
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1022` Enable/Disable Master Check Mode
- `LB1023` Master Check Mode

**25.**
```
~ (LB1020 AND LB051 OR LB1021 AND LB1023 AND LB1025) AND LB151 AND (TON() OR TON())  ->  LB1025, LB1026, LB1027
```
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1023` Master Check Mode
- `LB051` PH Workpiece Detect 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB1025` Bypass Judgment MRC
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `LB1026` Flash 2 WIP Remove Start
- `GB014_017` Flash 1 WIP Take Out Confirm. Signal
- `LB1027` Flash 2 WIP Remove Confirm.

**26.**
```
LB1027 AND (LB151 OR LB1028)  ->  LB1028
```
- `LB1027` Flash 2 WIP Remove Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB1028` Product Take Out Confirm.

**27.**
```
(LB1028 AND AUTO_RUN OR /AUTO_RUN AND LB1028)  ->  LB1029
```
- `LB1028` Product Take Out Confirm.
- `AUTO_RUN` Auto Running
- `LB1029` Flash 2 Writing Motion Complete

## P014_Flash1 / Auto_Running_Output


**1.**
```
~ (LB453 OR LB10016 OR LB343)  ->  LB600
```
- `LB453` SM10 BWD Motion Complete
- `LB10016` Flash 2 Cover Close Motion Start
- `LB343` SM10 BWD Cond.
- `LB600` SM10 FWD Motion

**2.**
```
~ (LB413 OR LB10033 OR LB345)  ->  LB601
```
- `LB413` SM10 FWD Motion Compl.
- `LB10033` Flash 2 Cover Open Motion Start
- `LB345` Ind. Flash 2 Cover Open
- `LB601` SM10 BWD Motion

**3.**
```
(LB451 OR LB411)  ->  LB610
```
- `LB451` SM10 BWD Motion Starting
- `LB411` SM10 FWD Motion Starting
- `LB610` SOL FG Shutter Open

**4. FOR TRIAL ONLY**
```
Running_Type1 AND (MOVE() OR MOVE())
```
- `Running_Type1` Running Abilcore Model

**5.**
```
Running_Type2 AND (MOVE() OR MOVE())
```
- `Running_Type2` Running GD1B Model

**6. FOR TRIAL ONLY**
```
LB501 AND TON()
```
- `LB501` Shutter FG Motion

## P014_Flash1 / Memory_Feeding


**1.**
```
(LB801 OR LB802)  ->  LB800
```
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP
- `LB800` Memory WIP Trans. Confirm.

**2.**
```
(LB381 OR LB1016) AND LB10020  ->  LB801
```
- `LB381` Flash 2 Debugging Start
- `LB10020` Flash 2 OK Compl.
- `LB1016` Flash 2 Disable/Enable
- `LB801` ATS Finish Process Memory

**3.**
```
(LB381 OR LB1017) AND LB10021  ->  LB802
```
- `LB381` Flash 2 Debugging Start
- `LB10021` Flash 2 NG Compl.
- `LB1017` Flash 2 Disable
- `LB802` ATS Work Finish Take Out from WIP

**4.**
```
GB012_026  ->  LB810
```
- `GB012_026` Flash1 Take In Compl. Memory
- `LB810` Air Blow FG Take Out Memory

**5.**
```
LB10005 AND LB10020 AND LB10036  ->  LB820
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10020` Flash 2 OK Compl.
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB820` Flash2 Master OK Check Compl.

**6.**
```
LB10006 AND LB10021 AND LB10036  ->  LB821
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10021` Flash 2 NG Compl.
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB821` Flash 2 Master NG Check Compl.

**7.**
```
(/WITHOUT_PRODUCT OR GB012_021) AND LB151  ->  LB800, LB801, LB802
```
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB012_021` Flash 1 Take Out Compl. Memory
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP

**8.**
```
LB800  ->  LB810
```
- `LB800` Memory WIP Trans. Confirm.
- `LB810` Air Blow FG Take Out Memory

**9.**
```
(P_First_Run OR LB10005)  ->  LB820
```
- `LB10005` Flash 2 Master OK Check Start
- `LB820` Flash2 Master OK Check Compl.

**10.**
```
(P_First_Run OR LB10006)  ->  LB821
```
- `LB10006` Flash 2 Master NG Check Start
- `LB821` Flash 2 Master NG Check Compl.

**11.**
```
Flash1_COM_OK  ->  LB850
```
- `Flash1_COM_OK` Flash 1 Communication OK
- `LB850` First Cycle Flash 2 Memory

**12.**
```
LB1013  ->  LB850
```
- `LB1013` Teaching Mode
- `LB850` First Cycle Flash 2 Memory

## P014_Flash1 / HMI_Output


**1.**
```
LB320  ->  PL004_03S
```
- `LB320` Unit  1 Cycle Operation Start
- `PL004_03S` PL Flash 1 Unit 1 Cycle Start

**2.**
```
LB099  ->  PL004_03R
```
- `LB099` WIP Transfer Unit Home Pos.
- `PL004_03R` PL Flash 1 Home Pos.

**3.**
```
LB050  ->  PL431_01M
```
- `LB050` PH Workpiece Detect 1
- `PL431_01M` PL Flash 1 Cover Close

**4.**
```
LB051  ->  PL431_01R
```
- `LB051` PH Workpiece Detect 2
- `PL431_01R` PL Flash 1 Cover Open

**5.**
```
LB381  ->  PL431_02M
```
- `LB381` Flash 2 Debugging Start
- `PL431_02M` PL Flash Writing 1 Debug Starting

**6.**
```
LB800  ->  PL431_02R
```
- `LB800` Memory WIP Trans. Confirm.
- `PL431_02R` PL Flash 1 Writing Complete

**7.**
```
LB2001  ->  PL431_03M
```
- `LB2001` Flash 2 Debugging Mode
- `PL431_03M` PL Flash 1 Debug Mode

**8.**
```
LB2003  ->  PL431_03R
```
- `LB2003` Flash 1 Continous Debugging Enable
- `PL431_03R` PL Flash 1 Continous Debug

**9.**
```
LB2005  ->  PL431_04M
```
- `LB2005` Flash 2 Use Front P/N
- `PL431_04M` PL Flash 1 Use Front P/N

**10.**
```
LB10005 AND LB10010 AND aP_1s  ->  PL700_005
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10010` Flash 2 Master Check Start
- `aP_1s` 1SEC CLOCK PULSE
- `PL700_005` PL Flash1 Master OK Start

**11.**
```
LB820  ->  PL700_006
```
- `LB820` Flash2 Master OK Check Compl.
- `PL700_006` PL Flash 1 Master OK Compl

**12.**
```
LB10006 AND LB10010 AND aP_1s  ->  PL700_007
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10010` Flash 2 Master Check Start
- `aP_1s` 1SEC CLOCK PULSE
- `PL700_007` PL Flash 1 Master NG Start

**13.**
```
LB821  ->  PL700_008
```
- `LB821` Flash 2 Master NG Check Compl.
- `PL700_008` PL Flash 1 Master NG Compl

## P014_Flash1 / Device_Output


**1.**
```
LB600 AND (SAFETY_CONFIRM OR PL013_004)  ->  CH0005_02
```
- `LB600` SM10 FWD Motion
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `CH0005_02` SOL COVER CLOSE (FLASH2) [IOBus://unit#7/Output Bit 16 bits/Output Bit 02]

**2.**
```
LB601 AND (SAFETY_CONFIRM OR PL013_004)  ->  CH0005_03
```
- `LB601` SM10 BWD Motion
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `CH0005_03` SOL COVER OPEN (FLASH2) [IOBus://unit#7/Output Bit 16 bits/Output Bit 03]

## P014_Flash1 / Station_Output


**1.**
```
LB099  ->  GB014_001
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB014_001` Flash 1 Unit Home Pos.

**2.**
```
LB209  ->  GB014_002
```
- `LB209` UNIT EMERGENCY STOP OFF
- `GB014_002` Flash 1 Unit Emergency Stop Off

**3.**
```
LB219  ->  GB014_003
```
- `LB219` UNIT AUTO STOP OFF
- `GB014_003` Flash 1 Unit Auto Stopping Off

**4.**
```
LB229  ->  GB014_004
```
- `LB229` UNIT CYCLE STOP OFF
- `GB014_004` Flash 1 Cycle Stop Off

**5.**
```
LB239  ->  GB014_005
```
- `LB239` UNIT FAULT STOP OFF
- `GB014_005` Flash 1 Fault Stopping Off

**6.**
```
LB249  ->  GB014_006
```
- `LB249` UNIT NOTICE/WARNING OFF
- `GB014_006` Flash 1 Unit Warning Off

**7.**
```
LB820 AND LB821  ->  GB014_007
```
- `LB820` Flash2 Master OK Check Compl.
- `LB821` Flash 2 Master NG Check Compl.
- `GB014_007` Flash 1 Master Check Complete

**8.**
```
GSB000  ->  GB014_008
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB014_008` Flash 1 Auto Cond. (Home Pos. Except)

**9.**
```
/LB400[3]  ->  GB014_009
```
- `GB014_009` Flash 1 Machine Abeyance

**10.**
```
LB800 AND LB801  ->  GB014_010
```
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `GB014_010` Flash 1 Process Compl.

**11.**
```
LB150  ->  GB014_011
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB014_011` Flash 1 Product Confirm.

**12.**
```
LB151  ->  GB014_012
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB014_012` Flash 1 No Product Confirm.

**13.**
```
LB1013  ->  GB014_013
```
- `LB1013` Teaching Mode
- `GB014_013` Flash 1 Send PN Complete Confirm.

**14.**
```
GSB001  ->  GB014_014
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
(LB1012 OR LB10012)  ->  GB014_015
```
- `LB1012` Teaching Mode ON/OFF
- `LB10012` Send Part No to Flash 2 Start
- `GB014_015` Flash 1 Part No Send Signal

**16.**
```
(LB1014 OR LB10018)  ->  GB014_016
```
- `LB1014` Warning : Air Blow Double Process
- `LB10018` Flash 2 Writing Start
- `GB014_016` Flash 1 Process Start Signal

**17.**
```
~ (LB1026 OR LB10035 OR AUTO_RUN AND LB151) AND Flash1_COM_OK AND Flash1_WP_Removed  ->  GB014_017
```
- `LB1026` Flash 2 WIP Remove Start
- `LB10035` Flash 2 : Send WP Take Out Signal
- `AUTO_RUN` Auto Running
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `Flash1_COM_OK` Flash 1 Communication OK
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `GB014_017` Flash 1 WIP Take Out Confirm. Signal

**18.**
```
(LB1022 OR LB10030) AND Flash1_NG_Remove_REQ  ->  GB014_018
```
- `LB1022` Enable/Disable Master Check Mode
- `LB10030` Flash 2 Send NG Reset Signal Start
- `GB014_018` Flash 1 NG Remove Confirm. Signal

**19.**
```
GSB001  ->  GB014_019
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**20.**
```
~ (LB600 OR LB601 OR LB412 OR LB452)  ->  GB014_020
```
- `LB600` SM10 FWD Motion
- `LB601` SM10 BWD Motion
- `LB412` SM10 FWD Motion Running
- `LB452` SM10 BWD Motion Running
- `GB014_020` Flash 1 Cover is Ready to Move (Interlock Confirm.)

**21.**
```
LB099  ->  GB014_021
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB014_021` Flash 1 Cover Home Pos.

**22.**
```
LB051  ->  GB014_022
```
- `LB051` PH Workpiece Detect 2
- `GB014_022` LS Cover Flash 1 Open

**23.**
```
LB501  ->  GB014_023
```
- `LB501` Shutter FG Motion
- `GB014_023` Flash 1 Compl. Memory

**24.**
```
LB801  ->  GB014_024
```
- `LB801` ATS Finish Process Memory
- `GB014_024` Flash 1 OK Compl. Memory

**25.**
```
LB802  ->  GB014_025
```
- `LB802` ATS Work Finish Take Out from WIP
- `GB014_025` Flash  1 NG Compl. Memory

---

# PROGRAM P015_Flash2


## P015_Flash2 / Station_Input


**1.**
```
GB012_020  ->  LB010
```
- `GB012_020` ATS X Axis is Ready to Move (Interlock Confirm.)
- `LB010` 品番未設定

**2.**
```
GSB000 AND (<() OR >())  ->  LB011
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB011` 検索品番未検出

## P015_Flash2 / Device_Input


**1.**
```
CH0002_12 AND /CH0002_13  ->  LB050
```
- `CH0002_12` AS COVER CLOSE (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 12]
- `CH0002_13` AS COVER OPEN (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 13]
- `LB050` PH Workpiece Detect 1

**2.**
```
CH0002_13 AND /CH0002_12  ->  LB051
```
- `CH0002_13` AS COVER OPEN (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 13]
- `CH0002_12` AS COVER CLOSE (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 12]
- `LB051` PH Workpiece Detect 2

**3.**
```
(LB051 OR LB050)  ->  LB099
```
- `LB051` PH Workpiece Detect 2
- `LB050` PH Workpiece Detect 1
- `LB099` WIP Transfer Unit Home Pos.

**4. add wiring 12 Juli**
```
/CH0007_08  ->  LB020
```
- `CH0007_08` Flash 2 Nagara [IOBus://unit#9/Input Bit 16 bits/Input Bit 08]
- `LB020` MD異常でない

**5.**
```
CH0007_04  ->  LB021
```
- `CH0007_04`  [IOBus://unit#9/Input Bit 16 bits/Input Bit 04]
- `LB021` Cycle Stopping All Aux 2

**6.**
```
CH0007_07  ->  LB022
```
- `CH0007_07`  [IOBus://unit#9/Input Bit 16 bits/Input Bit 07]
- `LB022` Cycle Stopping All Aux 3

**7.**
```
CH0007_05  ->  LB023
```
- `CH0007_05`  [IOBus://unit#9/Input Bit 16 bits/Input Bit 05]
- `LB023` Cycle Stopping All Aux 4

**8.**
```
CH0007_06  ->  LB024
```
- `CH0007_06`  [IOBus://unit#9/Input Bit 16 bits/Input Bit 06]
- `LB024` Cycle Stop OFF

## P015_Flash2 / HMI_Input


**1.**
```
PB004_04S  ->  LB101
```
- `PB004_04S` PB Flash 2 1 Cycle Start
- `LB101` 品番検索開始(開始位置0)

**2.**
```
PB004_04R  ->  LB102
```
- `PB004_04R` PB Flash 2 Ind. Home Pos.
- `LB102` 品番途中検索開始(開始位置0以外)

**3.**
```
PB441_01M  ->  LB103
```
- `PB441_01M` PB Ind. Flash 2 Cover Close
- `LB103` 品番設定ﾁｪｯｸOK

**4.**
```
PB441_01R  ->  LB104
```
- `PB441_01R` PB Ind. Flash 2 Cover Open
- `LB104` 品番設定ﾁｪｯｸNG

**5.**
```
PB441_02M  ->  LB105
```
- `PB441_02M` PB Flash 2 Debugging Start
- `LB105` Ind Spare

**6.**
```
GSB001  ->  LB106
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB106` Ind Spare

**7.**
```
PB441_03M  ->  LB107
```
- `PB441_03M` PB Flash 2 Debugging Mode
- `LB107` Ind Spare

**8.**
```
GSB001  ->  LB108
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB108` Ind Spare

**9.**
```
GSB001  ->  LB109
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB109` Ind Spare

**10.**
```
GSB001  ->  LB110
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB110` 検索品番有

**11.**
```
GSB001  ->  LB111
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB111` 品番検索完了

**12.**
```
GSB001  ->  LB112
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB112` 検索品番無

**13.**
```
GSB001  ->  LB113
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**14.**
```
GSB001  ->  LB114
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
GSB001  ->  LB115
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB115` 検索品番有

**16.**
```
GSB001  ->  LB116
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**17.**
```
GSB001  ->  LB117
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**18.**
```
GSB001  ->  LB118
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

## P015_Flash2 / Timers


**1.**
```
LB021 AND TON()  ->  LB150
```
- `LB021` Cycle Stopping All Aux 2
- `LB150` PH Workpiece 1 Confirm [Abilcore]

**2.**
```
/LB021 AND TON()  ->  LB151
```
- `LB021` Cycle Stopping All Aux 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]

## P015_Flash2 / Fault


**1. FAULT RESET**
```
MD_FLT_Reset400()
```

**2. EMERGENCY STOP FAULT
=================**
```
(PWR_ON OR AL[61]) AND /PB_EMG_STOP_FLASH2  ->  AL[61]
```
- `PWR_ON` POWER ON DELAY
- `PB_EMG_STOP_FLASH2` PB Emergency Stop Flash 2

**3.**
```
(MASTER_ON_FLASH2 OR AL[62]) AND /AIR_SOURCE_CONF_FLASH2  ->  AL[62]
```
- `MASTER_ON_FLASH2` Master ON Flash 2 Delay
- `AIR_SOURCE_CONF_FLASH2` Air Source Confirm fLASH 2

**4.**
```
~ (MSTR_RDY_FLASH2 AND /AIR_SOURCE_CONF_FLASH2 AND LT021.Q OR /MSTR_RDY_FLASH2 AND AIR_SOURCE_CONF_FLASH2 AND TON() OR AL[63])  ->  AL[63]
```
- `MSTR_RDY_FLASH2` Master ON Confirm Flash 2
- `AIR_SOURCE_CONF_FLASH2` Air Source Confirm fLASH 2
- `LT021` Delay Air Source FG Store Error

**5. AUTO STOP FAULT
=================**
```
GSB001  ->  AL[96]
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6. CYCLE STOP FAULT
=================**
```
(CH0002_12 OR AL[181]) AND CH0002_13  ->  AL[181]
```
- `CH0002_12` AS COVER CLOSE (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 12]
- `CH0002_13` AS COVER OPEN (FLASH2) [IOBus://unit#4/Input Bit 16 bits/Input Bit 13]

**7.**
```
~ (CH0007_09 AND Running_Type2 OR Running_Type1 AND CH0007_10 OR AL[182])  ->  AL[182]
```
- `CH0007_09` PX runn type ABIL [IOBus://unit#9/Input Bit 16 bits/Input Bit 09]
- `Running_Type2` Running GD1B Model
- `Running_Type1` Running Abilcore Model
- `CH0007_10` PX runn type GD1B [IOBus://unit#9/Input Bit 16 bits/Input Bit 10]

**8.**
```
(PWR_ON OR AL[183]) AND /Flash2_COM_OK  ->  AL[183]
```
- `PWR_ON` POWER ON DELAY
- `Flash2_COM_OK` Flash 2 Communication OK

**9.**
```
(LB802 OR AL[184])  ->  AL[184]
```
- `LB802` ATS Work Finish Take Out from WIP

**10.**
```
(LB10005 OR AL[185]) AND LB10021  ->  AL[185]
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10021` Flash 2 NG Compl.

**11.**
```
(LB10006 OR AL[186]) AND LB10020  ->  AL[186]
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10020` Flash 2 OK Compl.

**12.**
```
(PWR_ON OR AL[187]) AND Flash2_Error_Confirm  ->  AL[187]
```
- `PWR_ON` POWER ON DELAY

**13. FAULT STOP FAULT
=================**
```
LB400[3] AND /LB400[2] AND /LB403 AND TON()  ->  AL[241]
```
- `LB403` Flash 2 Processing Motion

**14.**
```
(LB600 AND /LB051 OR LB601 AND /LB050) AND TON()  ->  MF[76]
```
- `LB600` SM10 FWD Motion
- `LB051` PH Workpiece Detect 2
- `LB601` SM10 BWD Motion
- `LB050` PH Workpiece Detect 1
- `LT010` Delay

**15. NOTICE/WARNING
=================**
```
~ (Flash2_Send_PartNo AND Flash2_PartNo_REQ AND GSB023 OR Flash2_WP_Removed AND Flash2_TakeOut AND /GSB023 OR Flash2_NG_Remove_REQ AND Flash2_NGReset OR TestButton) AND /LB1010A AND TON()  ->  AL[340]
```
- `Flash2_Send_PartNo` Flash 2 Send Part No
- `Flash2_TakeOut` Flash 2 Take Out
- `Flash2_NGReset` Flash 2 NG Reset
- `GSB023` Improvement After MassPro DNIA MCH
- `LB1010A` Flash 2 Dandori Signal

**16. EMERGENCY STOPPING ALL
=================**
```
GSB000 AND /AL[61] AND /AL[62] AND /AL[63]  ->  LB200
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB200` UNIT EMERGENCY STOP OFF AUX 1

**17.**
```
GSB000  ->  LB201
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB201` UNIT EMERGENCY STOP OFF AUX 2

**18.**
```
GSB000  ->  LB202
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB202` UNIT EMERGENCY STOP OFF AUX 3

**19.**
```
LB200 AND LB201 AND LB202  ->  LB209
```
- `LB200` UNIT EMERGENCY STOP OFF AUX 1
- `LB201` UNIT EMERGENCY STOP OFF AUX 2
- `LB202` UNIT EMERGENCY STOP OFF AUX 3
- `LB209` UNIT EMERGENCY STOP OFF

**20. AUTO STOPPING ALL
=================**
```
GSB000  ->  LB210
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB210` UNIT AUTO STOP OFF AUX 1

**21.**
```
GSB000  ->  LB211
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB211` UNIT AUTO STOP OFF AUX 2

**22.**
```
GSB000  ->  LB212
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB212` UNIT AUTO STOP OFF AUX 3

**23.**
```
LB210 AND LB211 AND LB212  ->  LB219
```
- `LB210` UNIT AUTO STOP OFF AUX 1
- `LB211` UNIT AUTO STOP OFF AUX 2
- `LB212` UNIT AUTO STOP OFF AUX 3
- `LB219` UNIT AUTO STOP OFF

**24. CYCLE STOPPING ALL
=================**
```
GSB000 AND /AL[181] AND /AL[182] AND /AL[183] AND /AL[184] AND /AL[185]  ->  LB220
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB220` UNIT CYCLE STOP OFF AUX 1

**25.**
```
GSB000 AND /AL[186] AND /AL[187]  ->  LB221
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB221` UNIT CYCLE STOP OFF AUX 2

**26.**
```
GSB000  ->  LB222
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB222` UNIT CYCLE STOP OFF AUX 3

**27.**
```
LB220 AND LB221 AND LB222  ->  LB229
```
- `LB220` UNIT CYCLE STOP OFF AUX 1
- `LB221` UNIT CYCLE STOP OFF AUX 2
- `LB222` UNIT CYCLE STOP OFF AUX 3
- `LB229` UNIT CYCLE STOP OFF

**28. FAULT STOPPING ALL
=================**
```
GSB000 AND /AL[241] AND /MF[76]  ->  LB230
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB230` UNIT FAULT STOP OFF AUX 1

**29.**
```
GSB000  ->  LB231
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB231` UNIT FAULT STOP OFF AUX 2

**30.**
```
GSB000  ->  LB232
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB232` UNIT FAULT STOP OFFAUX 3

**31.**
```
LB230 AND LB231 AND LB232  ->  LB239
```
- `LB230` UNIT FAULT STOP OFF AUX 1
- `LB231` UNIT FAULT STOP OFF AUX 2
- `LB232` UNIT FAULT STOP OFFAUX 3
- `LB239` UNIT FAULT STOP OFF

**32. NOTICE/WARNING
=================**
```
GSB000 AND /AL[340]  ->  LB240
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB240` UNIT NOTICE/WARNING OFF AUX 1

**33.**
```
GSB000  ->  LB241
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB241` UNIT NOTICE/WARNING OFF AUX 2

**34.**
```
GSB000  ->  LB242
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB242` UNIT NOTICE/WARNING OFF AUX 3

**35.**
```
LB240 AND LB241 AND LB242  ->  LB249
```
- `LB240` UNIT NOTICE/WARNING OFF AUX 1
- `LB241` UNIT NOTICE/WARNING OFF AUX 2
- `LB242` UNIT NOTICE/WARNING OFF AUX 3
- `LB249` UNIT NOTICE/WARNING OFF

## P015_Flash2 / Preparation


**1.**
```
LB107 AND /AUTO_RUN AND /LB381 AND /MASTER_MODE AND TON()
```
- `LB107` Ind Spare
- `AUTO_RUN` Auto Running
- `LB381` Flash 2 Debugging Start
- `MASTER_MODE` Master Check Mode
- `LT060` Delay Flash 2 Debugging Mode

**2.**
```
LT060.Q AND (LB2001 OR /LB2001)  ->  LB2000, LB2000
```
- `LB2001` Flash 2 Debugging Mode
- `LB2000` Flash 1 Debugging Enable/Disable

**3.**
```
LB2000  ->  LB2001
```
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB2001` Flash 2 Debugging Mode

**4.**
```
PB700_000  ->  LB2000
```
- `PB700_000` PB Master Check Mode
- `LB2000` Flash 1 Debugging Enable/Disable

**5.**
```
LB108 AND /AUTO_RUN AND /LB10010 AND LB2001 AND TON()
```
- `LB108` Ind Spare
- `AUTO_RUN` Auto Running
- `LB10010` Flash 2 Master Check Start
- `LB2001` Flash 2 Debugging Mode
- `LT061` Delay Flash 2 Continous Debugging

**6.**
```
LT061.Q AND (LB2003 OR /LB2003)  ->  LB2002, LB2002
```
- `LB2003` Flash 1 Continous Debugging Enable
- `LB2002` Flash 2 Continous Debugging Enable/Disable

**7.**
```
LB2002  ->  LB2003
```
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2003` Flash 1 Continous Debugging Enable

**8.**
```
LB109 AND /AUTO_RUN AND /LB10010 AND /LB381 AND LB2001 AND GSB001 AND TON()
```
- `LB109` Ind Spare
- `AUTO_RUN` Auto Running
- `LB10010` Flash 2 Master Check Start
- `LB381` Flash 2 Debugging Start
- `LB2001` Flash 2 Debugging Mode
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LT062` Delay Flash 1 Use Front PN

**9.**
```
LT062.Q AND (LB2005 OR /LB2005)  ->  LB2004, LB2004
```
- `LB2005` Flash 2 Use Front P/N
- `LB2004` Flash 2 Use/Not Use Front P/N

**10.**
```
LB2004  ->  LB2005
```
- `LB2004` Flash 2 Use/Not Use Front P/N
- `LB2005` Flash 2 Use Front P/N

**11.**
```
(AUTO_MODE OR PB700_000)  ->  LB2002, LB2004
```
- `AUTO_MODE` AUTOMATIC OPERATION MODE
- `PB700_000` PB Master Check Mode
- `LB2002` Flash 2 Continous Debugging Enable/Disable
- `LB2004` Flash 2 Use/Not Use Front P/N

**12. FLASH 2 MASTER CHECK**
```
IND_MODE AND MASTER_ON_FLASH2 AND MASTER_MODE AND LB209 AND LB219  ->  LB10000
```
- `IND_MODE` Individual Mode
- `MASTER_ON_FLASH2` Master ON Flash 2 Delay
- `MASTER_MODE` Master Check Mode
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB10000` Flash 2 Master Check Operation Condition

**13.**
```
LB051 AND LB151 AND LB229  ->  LB10001
```
- `LB051` PH Workpiece Detect 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB229` UNIT CYCLE STOP OFF
- `LB10001` Flash 2 Master Check Start Cond.

**14. Master Check Sequential**
```
(PB700_009 OR LB10005) AND /PB700_011 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10005
```
- `PB700_009` PB Flash 2 Master OK Start
- `PB700_011` PB Flash 2 Master NG Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10005` Flash 2 Master OK Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**15.**
```
(PB700_011 OR LB10006) AND /PB700_009 AND /LB10010 AND LB10001 AND LB10000 AND /LB10049  ->  LB10006
```
- `PB700_011` PB Flash 2 Master NG Start
- `PB700_009` PB Flash 2 Master OK Start
- `LB10010` Flash 2 Master Check Start
- `LB10001` Flash 2 Master Check Start Cond.
- `LB10006` Flash 2 Master NG Check Start
- `LB10000` Flash 2 Master Check Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

**16.**
```
(LB10005 OR LB10006)  ->  LB10010
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10006` Flash 2 Master NG Check Start
- `LB10010` Flash 2 Master Check Start

**17.**
```
(LB10010 OR LB381)  ->  LB10010A
```
- `LB10010` Flash 2 Master Check Start
- `LB381` Flash 2 Debugging Start
- `LB10010A` Flash 2 Writing Motion Start

**18.**
```
~ LB10010A AND (Flash2_PartNo_REQ AND /LB10012 OR LB10011 OR LB10011 AND /LB10013 OR LB10012 OR LB10012 AND /Flash2_PartNo_REQ OR LB10013)  ->  LB10011, LB10012, LB10013
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10011` Flash 2 Req Part No Confirm.
- `LB10012` Send Part No to Flash 2 Start
- `LB10013` Send Part No to Flash 2 Compl.

**19.**
```
~ (LB10013 AND LB020 OR LB10010A AND /Flash2_PartNo_REQ AND LB10015) AND (LB150 OR LB10020 OR LB024 AND /LB10020 OR LB10021 OR LB10021) AND (tst1)  ->  LB10015, LB10016, LB10017, LB10018, LB10019, LB10020, LB10021, LB10024
```
- `LB10013` Send Part No to Flash 2 Compl.
- `LB10010A` Flash 2 Writing Motion Start
- `LB020` MD異常でない
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB10015` Flash 2 Writing  Starting
- `LB10016` Flash 2 Cover Close Motion Start
- `LB10017` Flash 2 Cover Close Motion Confirm.
- `LB600` SM10 FWD Motion
- `LB050` PH Workpiece Detect 1
- `LB022` Cycle Stopping All Aux 3
- `LB10018` Flash 2 Writing Start
- `LB10024` Flash 2 Writing Complete
- `LB10019` Flash 2 is Writing
- `LB023` Cycle Stopping All Aux 4
- `LB10020` Flash 2 OK Compl.
- `LB10021` Flash 2 NG Compl.
- `LB024` Cycle Stop OFF

**20.**
```
~ LB10010A AND (LB10020 AND /LB10026 OR LB10025 OR LB10021 AND /LB10025 OR LB10026)  ->  LB10025, LB10026
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10020` Flash 2 OK Compl.
- `LB10025` OK Workpiece Take Out Procedure
- `LB10026` NG Workpiece Take Out Procedure
- `LB10021` Flash 2 NG Compl.

**21.**
```
~ LB10026 AND (Flash2_NG_Remove_REQ AND /LB10031 OR LB10030 OR LB10030 AND /Flash2_NG_Remove_REQ OR LB10031)  ->  LB10030, LB10031
```
- `LB10026` NG Workpiece Take Out Procedure
- `LB10030` Flash 2 Send NG Reset Signal Start
- `LB10031` Flash 2 Seng NG Reset Signal Confirm.

**22.**
```
~ LB10010A AND (LB10031 OR LB10025 OR LB10032) AND PB_RLS_FLASH2  ->  LB10032
```
- `LB10010A` Flash 2 Writing Motion Start
- `LB10031` Flash 2 Seng NG Reset Signal Confirm.
- `PB_RLS_FLASH2` PB Release Flash 2
- `LB10025` OK Workpiece Take Out Procedure
- `LB10032` Auto Continue : Flash 2 Cover Open

**23.**
```
~ LB10032 AND (/LB10034 OR LB601 AND LB051 OR LB10034)  ->  LB10033, LB10034
```
- `LB10032` Auto Continue : Flash 2 Cover Open
- `LB10034` Flash 2 Cover Open Motion Confirm.
- `LB10033` Flash 2 Cover Open Motion Start
- `LB601` SM10 BWD Motion
- `LB051` PH Workpiece Detect 2

**24.**
```
~ LB10034 AND (LB151 AND Flash2_WP_Removed OR LB10035 OR LB10035 AND /Flash2_WP_Removed OR LB10036) AND /LB10036  ->  LB10035, LB10036
```
- `LB10034` Flash 2 Cover Open Motion Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB10035` Flash 2 : Send WP Take Out Signal
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.

**25.**
```
LB10036  ->  LB10049
```
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB10049` Flash Writing 2 Motion Compl.

## P015_Flash2 / Condition


**1.**
```
(/LB010 OR GB012_015) AND LB011 AND LB050 AND LB800  ->  LB300
```
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB011` 検索品番未検出
- `LB050` PH Workpiece Detect 1
- `LB800` Memory WIP Trans. Confirm.
- `LB300` WIP Transfer Cond.

**2.**
```
(/LB010 OR GB012_015) AND LB011 AND LB051 AND /LB800 AND (LB150 AND GB012_027 OR WITHOUT_PRODUCT AND GB012_027)  ->  LB301
```
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB011` 検索品番未検出
- `LB051` PH Workpiece Detect 2
- `LB800` Memory WIP Trans. Confirm.
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB012_027` Flash 2 Take In Compl. Memory
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB301` WIP Return Cond.

**3.**
```
LB050 AND /LB800  ->  LB302
```
- `LB050` PH Workpiece Detect 1
- `LB800` Memory WIP Trans. Confirm.

**4.**
```
~ (LB300 AND GSB020 OR LB301 AND /GSB020 OR LB302) AND /FLASH2_DISABLE  ->  LB309
```
- `LB300` WIP Transfer Cond.
- `LB301` WIP Return Cond.
- `GSB020` Add Function : Flash 1 / 2 Disable
- `FLASH2_DISABLE` Flash 2 Disable
- `LB309` Unit 1 Cycle Start Condition

## P015_Flash2 / Individual


**1. IND 1 CYCLE**
```
IND_MODE  ->  LB310
```
- `IND_MODE` Individual Mode
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX

**2.**
```
LB310 AND LB209 AND LB219  ->  LB319
```
- `LB310` UNIT 1 CYCLE OPERATION COND. AUX
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB319` UNIT 1 CYCLE OPERATION COND.

**3.**
```
(LB101 AND LB309 AND LB219 OR LB320 AND LB400[3] AND /LB409) AND LB319  ->  LB320
```
- `LB101` 品番検索開始(開始位置0)
- `LB309` Unit 1 Cycle Start Condition
- `LB219` UNIT AUTO STOP OFF
- `LB320` Unit  1 Cycle Operation Start
- `LB409` WIP Transfer Cycle Complete
- `LB319` UNIT 1 CYCLE OPERATION COND.

**4.**
```
IND_MODE AND /LB320 AND MC()
```
- `IND_MODE` Individual Mode
- `LB320` Unit  1 Cycle Operation Start

**5.**
```
(LB102 OR LB340) AND /LB099  ->  LB340
```
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB340` Ind. Home Pos Return
- `LB099` WIP Transfer Unit Home Pos.

**6.**
```
LB011 AND /LB010  ->  LB342
```
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `LB342` Ind. SM10 FWD Motion

**7.**
```
LB103 AND LB342 AND /LB345  ->  LB343
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB342` Ind. SM10 FWD Motion
- `LB345` Ind. Flash 2 Cover Open
- `LB343` SM10 BWD Cond.

**8.**
```
LB011 AND /LB010  ->  LB344
```
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `LB344` Ind. SM10 BWD Motion

**9.**
```
~ (LB104 OR PB_RLS_FLASH2 AND LB802 AND LB022 OR LB345) AND LB344 AND /LB343 AND /LB051  ->  LB345
```
- `LB104` 品番設定ﾁｪｯｸNG
- `PB_RLS_FLASH2` PB Release Flash 2
- `LB802` ATS Work Finish Take Out from WIP
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB022` Cycle Stopping All Aux 3
- `LB345` Ind. Flash 2 Cover Open
- `LB344` Ind. SM10 BWD Motion
- `LB343` SM10 BWD Cond.
- `LB051` PH Workpiece Detect 2

**10.**
```
MCR()
```

**11.**
```
IND_MODE AND MASTER_ON_FLASH2 AND /MASTER_MODE AND LB209 AND LB219  ->  LB380
```
- `IND_MODE` Individual Mode
- `MASTER_ON_FLASH2` Master ON Flash 2 Delay
- `MASTER_MODE` Master Check Mode
- `LB209` UNIT EMERGENCY STOP OFF
- `LB219` UNIT AUTO STOP OFF
- `LB380` Flash 2 Debugging Operation Condition

**12.**
```
~ (LB105 OR LB381) AND LB051 AND (/LB2005 AND <>() OR LB2005 AND <>() AND <>()) AND LB2000 AND LB151 AND LB229 AND LB380 AND /LB10049  ->  LB381
```
- `LB105` Ind Spare
- `LB051` PH Workpiece Detect 2
- `LB2005` Flash 2 Use Front P/N
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB2000` Flash 1 Debugging Enable/Disable
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB229` UNIT CYCLE STOP OFF
- `LB381` Flash 2 Debugging Start
- `LB380` Flash 2 Debugging Operation Condition
- `LB10049` Flash Writing 2 Motion Compl.

## P015_Flash2 / Auto_Running


**1. START AUTO MOTION : FLASH 2**
```
(LB309 OR LB400[1]) AND /LB409 AND /CYCLE_STOPPING AND AUTO_RUN AND /LB400[2]  ->  LB400[1]
```
- `LB309` Unit 1 Cycle Start Condition
- `LB409` WIP Transfer Cycle Complete
- `CYCLE_STOPPING` Cycle Stopping
- `AUTO_RUN` Auto Running

**2.**
```
(LB409 OR LB400[2]) AND LB400[3] AND LB400[1]  ->  LB400[2]
```
- `LB409` WIP Transfer Cycle Complete

**3. AUTO RUN CONDITION RUNNING**
```
(LB400[1] OR LB320)  ->  LB400[3]
```
- `LB320` Unit  1 Cycle Operation Start

**4.**
```
~ LB400[3] AND (LB300 AND /LB402 AND /LB403 OR LB401 OR LB301 AND /LB401 AND /LB403 OR LB402 OR LB302 AND /LB401 AND /LB402 OR LB403)  ->  LB401, LB402, LB403
```
- `LB300` WIP Transfer Cond.
- `LB401` WIP Transfer Motion
- `LB402` WIP Return Motion
- `LB403` Flash 2 Processing Motion
- `LB301` WIP Return Cond.

**5.**
```
~ (LB449 OR LB499 OR LB549)  ->  LB409
```
- `LB449` WIP Transfer Cycle Complete
- `LB499` WIP Return Cycle Complete
- `LB549` Shutter FG Cycle Complete
- `LB409` WIP Transfer Cycle Complete

**6. Flash 2 Cover Open Motion
===================**
```
~ (LB401 AND LT112.Q OR LB1020 AND LB022 AND AUTO_RUN AND LB801 AND TON())  ->  LB410
```
- `LB401` WIP Transfer Motion
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB022` Cycle Stopping All Aux 3
- `AUTO_RUN` Auto Running
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP
- `LT112` Delay Cover Open
- `LB410` WIP Transfer Motion Start

**7.**
```
~ LB410 AND (LB610 AND LB011 AND /LB010 AND /LB414 OR LB412 OR LB412 AND /LB414 OR LB601 AND LB051 OR LB414)  ->  LB411, LB412, LB413, LB414
```
- `LB410` WIP Transfer Motion Start
- `LB411` SM10 FWD Motion Starting
- `LB610` SOL FG Shutter Open
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB412` SM10 FWD Motion Running
- `LB414` Auto : Flash 2 Cover Open Motion Confirm.
- `LB413` SM10 FWD Motion Compl.
- `LB601` SM10 BWD Motion
- `LB051` PH Workpiece Detect 2

**8.**
```
LB414  ->  LB419
```
- `LB414` Auto : Flash 2 Cover Open Motion Confirm.
- `LB419` Flash 2 Cover Open Complete

**9.**
```
LB419  ->  LB449
```
- `LB419` Flash 2 Cover Open Complete
- `LB449` WIP Transfer Cycle Complete

**10. Flash 2 Cover Close Motion
===================**
```
LB402  ->  LB450
```
- `LB402` WIP Return Motion
- `LB450` WIP Return Motion Start

**11.**
```
~ LB450 AND (LB610 AND LB011 AND /LB010 AND /LB454 OR LB452 OR LB452 AND /LB454 OR LB600 AND LB050 OR LB454)  ->  LB451, LB452, LB453, LB454
```
- `LB450` WIP Return Motion Start
- `LB451` SM10 BWD Motion Starting
- `LB610` SOL FG Shutter Open
- `LB011` 検索品番未検出
- `LB010` 品番未設定
- `GB012_015` ATS Moving to WIP Position
- `LB452` SM10 BWD Motion Running
- `LB454` Auto : Flash 2 Cover Close Motion Compl.
- `LB453` SM10 BWD Motion Complete
- `LB600` SM10 FWD Motion
- `LB050` PH Workpiece Detect 1

**12.**
```
LB454  ->  LB459
```
- `LB454` Auto : Flash 2 Cover Close Motion Compl.
- `LB459` Flash 2 Cover Close Complete

**13.**
```
LB459  ->  LB499
```
- `LB459` Flash 2 Cover Close Complete
- `LB499` WIP Return Cycle Complete

**14. Flash 2 Processing Motion
===================**
```
LB403  ->  LB500
```
- `LB403` Flash 2 Processing Motion

**15.**
```
~ LB500 AND (GSB000 OR LB501 OR LB500 AND GSB001 AND /LB503 OR LB502 OR LB500 AND GSB001 AND /LB502 OR LB503)  ->  LB501, LB502, LB503
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `LB501` Shutter FG Motion
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB502` Flash 2 OK Compl.
- `LB503` Flash 2 NG Compl.

**16.**
```
(LB502 AND LB801 OR LB503 AND LB802)  ->  LB509
```
- `LB502` Flash 2 OK Compl.
- `LB801` ATS Finish Process Memory
- `LB503` Flash 2 NG Compl.
- `LB802` ATS Work Finish Take Out from WIP
- `LB509` Shutter FG 1 Cycle Complete

**17.**
```
LB509  ->  LB549
```
- `LB509` Shutter FG 1 Cycle Complete
- `LB549` Shutter FG Cycle Complete

**18. Flash 1 Processing
Real Machine**
```
(AUTO_RUN OR /AUTO_RUN) AND /LB800 AND Flash2_COM_OK AND LB051  ->  LB1000
```
- `AUTO_RUN` Auto Running
- `LB800` Memory WIP Trans. Confirm.
- `Flash2_COM_OK` Flash 2 Communication OK
- `LB051` PH Workpiece Detect 2
- `LB1000` Air Blow Process Start

**19.**
```
(AUTO_RUN AND GB012_047 AND /LB800 OR /AUTO_RUN AND GSB001 AND LB150)  ->  LB1001
```
- `AUTO_RUN` Auto Running
- `GB012_047` Flash 2 Take In Motion Start
- `LB800` Memory WIP Trans. Confirm.
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `LB1001` Air Blow FG Take Out Compl. Memory

**20.**
```
(LB1001 OR LB1010) AND LB1000 AND /LB1029 AND MSTR_RDY_FLASH1 AND Flash2_COM_OK AND (<>() AND <>())  ->  LB1010, LB1010A
```
- `LB1001` Air Blow FG Take Out Compl. Memory
- `LB1000` Air Blow Process Start
- `LB1010` Running Abilcore Type
- `LB1029` Flash 2 Writing Motion Complete
- `MSTR_RDY_FLASH1` Master ON Confirm Flash1
- `Flash2_COM_OK` Flash 2 Communication OK
- `LB1010A` Flash 2 Dandori Signal

**21.**
```
~ LB1010 AND (/Flash2_PartNo_REQ AND GSB001 AND /LB850 AND /LB1010A AND /LB1012 OR Flash2_PartNo_REQ OR LB1010A AND Flash2_PartNo_REQ OR LB850 OR LB1011 OR LB1011 AND /LB1013 OR LB1012 OR LB1012 AND /Flash2_PartNo_REQ AND /LB1014 AND LB850 AND LT051.Q OR LB1013)  ->  LB1011, LB1012, LB1013, LB1010A
```
- `LB1010` Running Abilcore Type
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB850` First Cycle Flash 2 Memory
- `LB1010A` Flash 2 Dandori Signal
- `LB1011` Running GD1B Type
- `LB1012` Teaching Mode ON/OFF
- `LB1013` Teaching Mode
- `LB1014` Warning : Air Blow Double Process
- `GSB023` Improvement After MassPro DNIA MCH

**22.**
```
~ LB1010 AND (LB022 AND LB050 AND Flash2_Standby OR LB1014 OR LB1014 AND Flash2_Process OR LB1015 OR LB1015 AND LB023 AND /LB1017 OR LB1015 AND LB1016 OR LB1018) AND /LB1018 AND (LT052.Q OR TON() OR GSB023 AND <>() AND MOVE())  ->  LB1014, LB1015, LB1016, LB1017, LB1018
```
- `LB1010` Running Abilcore Type
- `LB022` Cycle Stopping All Aux 3
- `LB050` PH Workpiece Detect 1
- `LB1014` Warning : Air Blow Double Process
- `LB1018` Bypass Airblow Enable/Disable
- `GSB023` Improvement After MassPro DNIA MCH
- `LB1015` Warning : Forget to NAGARA
- `LB023` Cycle Stopping All Aux 4
- `LB1016` Flash 2 Disable/Enable
- `LB1017` Flash 2 Disable
- `LB024` Cycle Stop OFF

**23.**
```
~ LB1010 AND LB1018 AND (LB1016 AND /LB1021 OR LB1020 OR LB1017 AND /LB1020 OR LB1021)  ->  LB1020, LB1021
```
- `LB1010` Running Abilcore Type
- `LB1018` Bypass Airblow Enable/Disable
- `LB1016` Flash 2 Disable/Enable
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1017` Flash 2 Disable

**24.**
```
~ LB1021 AND (Flash2_NG_Remove_REQ OR LB1022 OR LB1022 AND /Flash2_NG_Remove_REQ OR LB1023)  ->  LB1022, LB1023
```
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1022` Enable/Disable Master Check Mode
- `LB1023` Master Check Mode

**25.**
```
~ (LB1020 AND LB051 OR LB1021 AND LB1023 AND LB1025) AND LB151 AND (TON() OR TON())  ->  LB1025, LB1026, LB1027
```
- `LB1020` Enable/Disable Hold & Release Chutter FG for Box Changing
- `LB1021` Hold & Release Chutter FG for Box Changing
- `LB1023` Master Check Mode
- `LB051` PH Workpiece Detect 2
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB1025` Bypass Judgment MRC
- `LB1026` Flash 2 WIP Remove Start
- `GB015_017` Flash 1 WIP Take Out Confirm. Signal
- `LB1027` Flash 2 WIP Remove Confirm.

**26.**
```
LB1027 AND (LB151 OR LB1028)  ->  LB1028
```
- `LB1027` Flash 2 WIP Remove Confirm.
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `LB1028` Product Take Out Confirm.

**27.**
```
(LB1028 AND AUTO_RUN OR /AUTO_RUN AND LB1028)  ->  LB1029
```
- `LB1028` Product Take Out Confirm.
- `AUTO_RUN` Auto Running
- `LB1029` Flash 2 Writing Motion Complete

## P015_Flash2 / Auto_Running_Output


**1.**
```
~ (LB453 OR LB343 OR LB10016)  ->  LB600
```
- `LB453` SM10 BWD Motion Complete
- `LB343` SM10 BWD Cond.
- `LB10016` Flash 2 Cover Close Motion Start
- `LB600` SM10 FWD Motion

**2.**
```
~ (LB413 OR LB345 OR LB10033)  ->  LB601
```
- `LB413` SM10 FWD Motion Compl.
- `LB345` Ind. Flash 2 Cover Open
- `LB10033` Flash 2 Cover Open Motion Start
- `LB601` SM10 BWD Motion

**3.**
```
(LB451 OR LB411)  ->  LB610
```
- `LB451` SM10 BWD Motion Starting
- `LB411` SM10 FWD Motion Starting
- `LB610` SOL FG Shutter Open

**4. FOR TRIAL ONLY**
```
Running_Type1 AND (MOVE() OR MOVE())
```
- `Running_Type1` Running Abilcore Model

**5.**
```
Running_Type2 AND (MOVE() OR MOVE())
```
- `Running_Type2` Running GD1B Model

**6.**
```
LB501 AND TON()
```
- `LB501` Shutter FG Motion

## P015_Flash2 / Memory_Feeding


**1.**
```
(LB801 OR LB802)  ->  LB800
```
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP
- `LB800` Memory WIP Trans. Confirm.

**2.**
```
GB012_027  ->  LB810
```
- `GB012_027` Flash 2 Take In Compl. Memory
- `LB810` Air Blow FG Take Out Memory

**3.**
```
LB502  ->  LB801
```
- `LB502` Flash 2 OK Compl.
- `LB801` ATS Finish Process Memory

**4.**
```
LB503  ->  LB802
```
- `LB503` Flash 2 NG Compl.
- `LB802` ATS Work Finish Take Out from WIP

**5.**
```
GB012_027  ->  LB810
```
- `GB012_027` Flash 2 Take In Compl. Memory
- `LB810` Air Blow FG Take Out Memory

**6.**
```
LB10005 AND LB10020 AND LB10036  ->  LB820
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10020` Flash 2 OK Compl.
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB820` Flash2 Master OK Check Compl.

**7.**
```
LB10006 AND LB10021 AND LB10036  ->  LB821
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10021` Flash 2 NG Compl.
- `LB10036` Flash 2 : Send WP Take Out Signal Confirm.
- `LB821` Flash 2 Master NG Check Compl.

**8.**
```
(/WITHOUT_PRODUCT OR GB012_022) AND LB151  ->  LB800, LB801, LB802
```
- `WITHOUT_PRODUCT` Bypass Without Product
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB012_022` Flash 2 Take Out Compl. Memory
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `LB802` ATS Work Finish Take Out from WIP

**9.**
```
LB800  ->  LB810
```
- `LB800` Memory WIP Trans. Confirm.
- `LB810` Air Blow FG Take Out Memory

**10.**
```
(P_First_Run OR LB10005)  ->  LB820
```
- `LB10005` Flash 2 Master OK Check Start
- `LB820` Flash2 Master OK Check Compl.

**11.**
```
(P_First_Run OR LB10006)  ->  LB821
```
- `LB10006` Flash 2 Master NG Check Start
- `LB821` Flash 2 Master NG Check Compl.

**12.**
```
Flash2_COM_OK  ->  LB850
```
- `Flash2_COM_OK` Flash 2 Communication OK
- `LB850` First Cycle Flash 2 Memory

**13.**
```
LB1013  ->  LB850
```
- `LB1013` Teaching Mode
- `LB850` First Cycle Flash 2 Memory

## P015_Flash2 / HMI_Output


**1.**
```
LB320  ->  PL004_04S
```
- `LB320` Unit  1 Cycle Operation Start

**2.**
```
LB099  ->  PL004_04R
```
- `LB099` WIP Transfer Unit Home Pos.

**3.**
```
LB050  ->  PL441_01M
```
- `LB050` PH Workpiece Detect 1

**4.**
```
LB051  ->  PL441_01R
```
- `LB051` PH Workpiece Detect 2

**5.**
```
GSB001  ->  PL441_02M
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**6.**
```
LB800  ->  PL441_02R
```
- `LB800` Memory WIP Trans. Confirm.

**7.**
```
LB2001  ->  PL441_03M
```
- `LB2001` Flash 2 Debugging Mode

**8.**
```
LB2003  ->  PL441_03R
```
- `LB2003` Flash 1 Continous Debugging Enable

**9.**
```
LB2005  ->  PL441_04M
```
- `LB2005` Flash 2 Use Front P/N

**10.**
```
LB10005 AND LB10010 AND aP_1s  ->  PL700_009
```
- `LB10005` Flash 2 Master OK Check Start
- `LB10010` Flash 2 Master Check Start
- `aP_1s` 1SEC CLOCK PULSE
- `PL700_009` PL Flash 2 Master OK Start

**11.**
```
LB820  ->  PL700_010
```
- `LB820` Flash2 Master OK Check Compl.
- `PL700_010` PL Flash 2 Master OK Compl

**12.**
```
LB10006 AND LB10010 AND aP_1s  ->  PL700_011
```
- `LB10006` Flash 2 Master NG Check Start
- `LB10010` Flash 2 Master Check Start
- `aP_1s` 1SEC CLOCK PULSE
- `PL700_011` PL Flash 2 Master NG Start

**13.**
```
LB821  ->  PL700_012
```
- `LB821` Flash 2 Master NG Check Compl.
- `PL700_012` PL Flash 2 Master NG Compl

## P015_Flash2 / Device_Output


**1.**
```
LB601 AND (SAFETY_CONFIRM OR PL013_004)  ->  CH0005_01
```
- `LB601` SM10 BWD Motion
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `CH0005_01` SOL COVER OPEN (FLASH1) [IOBus://unit#7/Output Bit 16 bits/Output Bit 01]

**2.**
```
LB600 AND (SAFETY_CONFIRM OR PL013_004)  ->  CH0005_00
```
- `LB600` SM10 FWD Motion
- `SAFETY_CONFIRM` SAFETY_CONFIRM
- `PL013_004` PL MTC OP. Bypass Safety Sensor
- `CH0005_00` SOL COVER CLOSE (FLASH1) [IOBus://unit#7/Output Bit 16 bits/Output Bit 00]

## P015_Flash2 / Station_Output


**1.**
```
LB099  ->  GB015_001
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB015_001` Flash2 Home Pos.

**2.**
```
LB209  ->  GB015_002
```
- `LB209` UNIT EMERGENCY STOP OFF
- `GB015_002` Flash 2 Emergency Stop Fault Off

**3.**
```
LB219  ->  GB015_003
```
- `LB219` UNIT AUTO STOP OFF
- `GB015_003` Flash 2 Auto Stop Fault Off

**4.**
```
LB229  ->  GB015_004
```
- `LB229` UNIT CYCLE STOP OFF
- `GB015_004` Flash 2 Cycle Stop Fault Off

**5.**
```
LB239  ->  GB015_005
```
- `LB239` UNIT FAULT STOP OFF
- `GB015_005` Flash 2 Fault Stopping Fault

**6.**
```
LB249  ->  GB015_006
```
- `LB249` UNIT NOTICE/WARNING OFF
- `GB015_006` Flash 2 Notice/Warning Off

**7.**
```
LB820 AND LB821  ->  GB015_007
```
- `LB820` Flash2 Master OK Check Compl.
- `LB821` Flash 2 Master NG Check Compl.
- `GB015_007` Flash 1 Master Check Complete

**8.**
```
GSB000  ->  GB015_008
```
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `GB015_008` Flash 2 Auto Cond. (Home Pos. Except)

**9.**
```
/LB400[3]  ->  GB015_009
```
- `GB015_009` Flash 2 Machine Abeyance

**10.**
```
LB800 AND LB801  ->  GB015_010
```
- `LB800` Memory WIP Trans. Confirm.
- `LB801` ATS Finish Process Memory
- `GB015_010` Flash 2 Process Compl.

**11.**
```
LB150  ->  GB015_011
```
- `LB150` PH Workpiece 1 Confirm [Abilcore]
- `GB015_011` PH Flash 2 Product Confirm.

**12.**
```
LB151  ->  GB015_012
```
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `GB015_012` PH Flash 2 No Product Confirm.

**13.**
```
LB1013  ->  GB015_013
```
- `LB1013` Teaching Mode
- `GB015_013` Flash 1 Send PN Complete Confirm.

**14.**
```
GSB001  ->  GB015_014
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**15.**
```
(LB1012 OR LB10012)  ->  GB015_015
```
- `LB1012` Teaching Mode ON/OFF
- `LB10012` Send Part No to Flash 2 Start
- `GB015_015` Flash2 Part No Send Signal

**16.**
```
(LB1014 OR LB10018)  ->  GB015_016
```
- `LB1014` Warning : Air Blow Double Process
- `LB10018` Flash 2 Writing Start
- `GB015_016` Flash 2 Process Start Signal

**17.**
```
~ (LB1026 OR LB10035 OR AUTO_RUN AND LB151) AND Flash2_COM_OK AND Flash2_WP_Removed  ->  GB015_017
```
- `LB1026` Flash 2 WIP Remove Start
- `LB10035` Flash 2 : Send WP Take Out Signal
- `AUTO_RUN` Auto Running
- `LB151` PH Workpiece 1 OFF Confirm [Abilcore]
- `Flash2_COM_OK` Flash 2 Communication OK
- `GB015_017` Flash 1 WIP Take Out Confirm. Signal

**18.**
```
(LB1022 OR LB10030) AND Flash2_NG_Remove_REQ  ->  GB015_018
```
- `LB1022` Enable/Disable Master Check Mode
- `LB10030` Flash 2 Send NG Reset Signal Start
- `GB015_018` Flash 2 NG Remove Confirm. Signal

**19.**
```
GSB001  ->  GB015_019
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF

**20.**
```
~ (LB600 OR LB601 OR LB413 OR LB453)  ->  GB015_020
```
- `LB600` SM10 FWD Motion
- `LB601` SM10 BWD Motion
- `LB413` SM10 FWD Motion Compl.
- `LB453` SM10 BWD Motion Complete
- `GB015_020` Flash 2 Cover is Ready to Move (Interlock Confirm.)

**21.**
```
LB099  ->  GB015_021
```
- `LB099` WIP Transfer Unit Home Pos.
- `GB015_021` Flash 2 Cover Home Pos.

**22.**
```
LB051  ->  GB015_022
```
- `LB051` PH Workpiece Detect 2
- `GB015_022` LS Cover Flash 2 Open

**23.**
```
LB501  ->  GB015_023
```
- `LB501` Shutter FG Motion
- `GB015_023` Flash 2 Compl. Memory

**24.**
```
LB801  ->  GB015_024
```
- `LB801` ATS Finish Process Memory
- `GB015_024` Flash 2 OK Compl. Memory

**25.**
```
LB802  ->  GB015_025
```
- `LB802` ATS Work Finish Take Out from WIP
- `GB015_025` Flash 2 NG Compl. Memory

---

# PROGRAM P200_COMM


## P200_COMM / HMI_Input


**1.**
```
GSB001  ->  NOP
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `NOP` No Operation

## P200_COMM / StationInput


**1. FLASH 1**
```
~ (GB014_015 AND /AUTO_RUN AND <>() OR Flash1_COM_OK AND AUTO_RUN AND <>() OR LB000)  ->  Flash1_Send_PartNo
```
- `GB014_015` Flash 1 Part No Send Signal
- `Flash1_COM_OK` Flash 1 Communication OK
- `AUTO_RUN` Auto Running
- `Flash1_Send_PartNo` Flash 1 Send Part No

**2.**
```
(GB014_016 OR LB001) AND /GSB001  ->  Flash1_Start
```
- `GB014_016` Flash 1 Process Start Signal
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB001` 異常あり$tFAULT EXIST
- `Flash1_Start` Flash 1 Start

**3.**
```
(GB014_017 AND aP_1s OR LB002 AND GSB000) AND Flash1_WP_Removed  ->  Flash1_TakeOut
```
- `GB014_017` Flash 1 WIP Take Out Confirm. Signal
- `LB002` MRC Ready toTake In Signal
- `aP_1s` 1SEC CLOCK PULSE
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `Flash1_WP_Removed` Flash 1 TP Take Out Request
- `Flash1_TakeOut` Flash 1 Take Out

**4.**
```
(GB014_018 OR LB003)  ->  Flash1_NGReset
```
- `GB014_018` Flash 1 NG Remove Confirm. Signal
- `LB003` MRC3 Processing
- `Flash1_NGReset` Flash 1 NG Reset

**5.**
```
(PB_FAULT_RST OR LB004) AND Flash1_Error_Confirm AND /AUTO_RUN  ->  Flash1_ErrorReset
```
- `PB_FAULT_RST` PB Fault Reset
- `LB004` MRC3 Cover in Motion (Cover is Moving)
- `AUTO_RUN` Auto Running
- `Flash1_ErrorReset` Flash 1 Error Reset

**6.**
```
AL[330] AND TON()
```

**7.**
```
~ (LB005 OR PB003_002 OR LT001.Q) AND AL[330]  ->  Flash1_Bypass
```
- `LB005` PH MRC Product Confirm.
- `PB003_002` Flash 1 Reconnect.
- `Flash1_Bypass` Flash1 Bypass Communication

**8. FLASH 2**
```
~ (GB015_015 AND /AUTO_RUN AND <>() OR Flash2_COM_OK AND AUTO_RUN AND <>() OR LB010)  ->  Flash2_Send_PartNo
```
- `GB015_015` Flash2 Part No Send Signal
- `Flash2_COM_OK` Flash 2 Communication OK
- `AUTO_RUN` Auto Running
- `LB010` 品番未設定
- `Flash2_Send_PartNo` Flash 2 Send Part No

**9.**
```
~ (GB015_016 OR LB001 OR LB011) AND /GSB001  ->  Flash2_Start
```
- `GB015_016` Flash 2 Process Start Signal
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB001` 異常あり$tFAULT EXIST
- `LB011` 検索品番未検出
- `Flash2_Start` Flash 2 Start

**10.**
```
(GB015_017 AND aP_1s OR LB012 AND GSB000) AND Flash2_WP_Removed  ->  Flash2_TakeOut
```
- `GB015_017` Flash 1 WIP Take Out Confirm. Signal
- `LB012` Emergency Stopping All Aux 3
- `aP_1s` 1SEC CLOCK PULSE
- `GSB000` FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON
- `Flash2_TakeOut` Flash 2 Take Out

**11.**
```
(GB015_018 OR LB013)  ->  Flash2_NGReset
```
- `GB015_018` Flash 2 NG Remove Confirm. Signal
- `LB013` Emergency Stopping All Aux 4
- `Flash2_NGReset` Flash 2 NG Reset

**12.**
```
(PB_FAULT_RST OR LB014) AND Flash1_Error_Confirm AND /AUTO_RUN  ->  Flash2_ErrorReset
```
- `PB_FAULT_RST` PB Fault Reset
- `LB014` Emergency Stop OFF
- `AUTO_RUN` Auto Running
- `Flash2_ErrorReset` Flash 2 Error Reset

**13.**
```
AL[340] AND TON()
```
- `LT010` Delay

**14.**
```
~ (LB015 OR PB003_003 OR LT010.Q) AND AL[340]  ->  Flash2_Bypass
```
- `LB015` Auto Stopping All Aux 1
- `PB003_003` Flash 2 reconnect

**15. Flash 1 & 2 Disable/Enable**
```
GSB001  ->  LB100
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB100` Assy品番検索

**16.**
```
GSB001  ->  LB101
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `LB101` 品番検索開始(開始位置0)

**17. Flash 1 Part No **
```
~ Running_Type1 AND (/AUTO_RUN AND /GB012_026 AND /MASTER_MODE OR PL431_03M AND /PL431_04M AND INSERT() OR AUTO_RUN AND INSERT()) AND /PL431_03M AND INSERT()
```
- `Running_Type1` Running Abilcore Model
- `AUTO_RUN` Auto Running
- `GB012_026` Flash1 Take In Compl. Memory
- `MASTER_MODE` Master Check Mode
- `PL431_03M` PL Flash 1 Debug Mode
- `PL431_04M` PL Flash 1 Use Front P/N

**18.**
```
~ Running_Type2 AND (/AUTO_RUN AND /GB012_026 AND /MASTER_MODE OR PL431_03M AND /PL431_04M AND INSERT() OR AUTO_RUN AND INSERT()) AND /PL431_03M AND INSERT()
```
- `Running_Type2` Running GD1B Model
- `AUTO_RUN` Auto Running
- `GB012_026` Flash1 Take In Compl. Memory
- `MASTER_MODE` Master Check Mode
- `PL431_03M` PL Flash 1 Debug Mode
- `PL431_04M` PL Flash 1 Use Front P/N

**19.**
```
MASTER_MODE AND (Running_Type1 AND INSERT() OR Running_Type2 AND INSERT())
```
- `MASTER_MODE` Master Check Mode
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model

**20. Flash 2 Part No **
```
~ Running_Type1 AND (/AUTO_RUN AND /GB012_026 AND /MASTER_MODE OR PL431_03M AND /PL431_04M AND INSERT() OR AUTO_RUN AND INSERT()) AND /PL431_03M AND INSERT()
```
- `Running_Type1` Running Abilcore Model
- `AUTO_RUN` Auto Running
- `GB012_026` Flash1 Take In Compl. Memory
- `MASTER_MODE` Master Check Mode
- `PL431_03M` PL Flash 1 Debug Mode
- `PL431_04M` PL Flash 1 Use Front P/N

**21.**
```
~ Running_Type2 AND (/AUTO_RUN AND /GB012_026 AND /MASTER_MODE OR PL431_03M AND /PL431_04M AND INSERT() OR AUTO_RUN AND INSERT()) AND /PL431_03M AND INSERT()
```
- `Running_Type2` Running GD1B Model
- `AUTO_RUN` Auto Running
- `GB012_026` Flash1 Take In Compl. Memory
- `MASTER_MODE` Master Check Mode
- `PL431_03M` PL Flash 1 Debug Mode
- `PL431_04M` PL Flash 1 Use Front P/N

**22.**
```
MASTER_MODE AND (Running_Type1 AND INSERT() OR Running_Type2 AND INSERT())
```
- `MASTER_MODE` Master Check Mode
- `Running_Type1` Running Abilcore Model
- `Running_Type2` Running GD1B Model

## P200_COMM / Process


**1.**
```
PWR_ON AND /Flash1_Lost AND /GSB001 AND SktTCPAccept() AND FunctionBlock0()  ->  Flash1_COM_OK
```
- `PWR_ON` POWER ON DELAY
- `Flash1_Lost` Flash 1 Lost Connection
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `Flash1_COM_OK` Flash 1 Communication OK

**2.**
```
PWR_ON AND /Flash2_Lost AND /GSB001 AND SktTCPAccept() AND FunctionBlock0()  ->  Flash2_COM_OK
```
- `PWR_ON` POWER ON DELAY
- `Flash2_Lost` Flash 2 Lost Connection
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `Flash2_COM_OK` Flash 2 Communication OK

## P200_COMM / StationOutput


**1.**
```
LB100  ->  GB200_001
```
- `LB100` Assy品番検索
- `GB200_001` Flash 1 Disable

**2.**
```
LB101  ->  GB200_002
```
- `LB101` 品番検索開始(開始位置0)
- `GB200_002` Flash 2 Disable

## P200_COMM / HMI_Output


**1.**
```
GSB001  ->  NOP
```
- `GSB001` FOR MACHINE DESIGN_ ALWAYS OFF
- `NOP` No Operation

---

# PROGRAM (tanpa program)


## (tanpa program) / LadderBody


**1.**
```
FLT_Reset AND SetBlock()
```
- `FLT_Reset` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ$tFAULT RESET TIMING

**2.**
```
ArySearch()
```

**3.**
```
/LB001  ->  NoFLT
```
- `LB001` 異常あり$tFAULT EXIST
- `NoFLT` 異常でない$tNOT FAULT

## (tanpa program) / LadderBody


**1.**
```
FLT_Reset AND SetBlock()
```
- `FLT_Reset` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ$tFAULT RESET TIMING

**2.**
```
ArySearch()
```

**3.**
```
/LB001  ->  NoFLT
```
- `LB001` 異常あり$tFAULT EXIST
- `NoFLT` 異常でない$tNOT FAULT

## (tanpa program) / LadderBody


**1.**
```
FLT_Reset AND SetBlock()
```
- `FLT_Reset` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ$tFAULT RESET TIMING

**2.**
```
ArySearch()
```

**3.**
```
/LB001  ->  NoFLT
```
- `LB001` 異常あり$tFAULT EXIST
- `NoFLT` 異常でない$tNOT FAULT

## (tanpa program) / LadderBody


**1. ■MD_In**
```
MOVE()
```

**2.**
```
MOVE()
```

**3. ■Fault
　Fault reset**
```
PB_FLT_RST AND /AUTO_RUN  ->  LB009
```
- `AUTO_RUN` Auto Running
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**4.**
```
LB009 AND Clear()
```
- `LB009` 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ

**5. ■Fault**
```
LB104  ->  LB010
```
- `LB104` 品番設定ﾁｪｯｸNG
- `LB010` 品番未設定

**6.**
```
(LB112 OR LB124)  ->  LB011
```
- `LB112` 検索品番無
- `LB124` 検索品番無
- `LB011` 検索品番未検出

**7.**
```
(LB010 OR FLT[1])  ->  FLT[1]
```
- `LB010` 品番未設定

**8.**
```
(LB011 OR FLT[2])  ->  FLT[2]
```
- `LB011` 検索品番未検出

**9.**
```
/LB010 AND /LB011  ->  LB020
```
- `LB010` 品番未設定
- `LB011` 検索品番未検出
- `LB020` MD異常でない

**10. ■Condition**
```
/OK AND /NG AND LB020  ->  LB090
```
- `OK` OK完了
- `NG` NG完了
- `LB020` MD異常でない
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件

**11. ■Auto Run**
```
(LB090 OR LB100) AND Start AND /LB135  ->  LB100
```
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件
- `LB100` Assy品番検索
- `Start` 段取ﾃﾞｰﾀ抽出開始
- `LB135` Assy品番検索終了

**12. 　Data Clear**
```
LB100 AND Clear()
```
- `LB100` Assy品番検索

**13. 　AssyNumber Clear
　SearchTimes Clear**
```
~ LB100 AND (MOVE() OR MOVE() OR MOVE())
```
- `LB100` Assy品番検索

**14. 　Put AssyNumber for Searching**
```
LB100 AND CONCAT()
```
- `LB100` Assy品番検索

**15.**
```
~ LB100 AND (<>() OR <>() OR <>() OR LB103 OR /LB103) AND /LB104  ->  LB103, LB104
```
- `LB100` Assy品番検索
- `LB103` 品番設定ﾁｪｯｸOK
- `LB104` 品番設定ﾁｪｯｸNG

**16.**
```
LB103 AND (=() AND /LB102 OR <>() AND /LB101)  ->  LB101, LB102
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB101` 品番検索開始(開始位置0)

**17.**
```
LB101 AND ArySearch()
```
- `LB101` 品番検索開始(開始位置0)

**18.**
```
~ LB101 AND (LB110 OR LB111 OR /LB111) AND /LB112 AND (MOVE() OR -() OR MOVE() OR -())  ->  LB111, LB112
```
- `LB101` 品番検索開始(開始位置0)
- `LB110` 検索品番有
- `LB111` 品番検索完了
- `LB112` 検索品番無

**19. 　Searching AssyNumber **
```
LB102 AND ArySearch()
```
- `LB102` 品番途中検索開始(開始位置0以外)

**20.**
```
~ LB102 AND (LB120 AND /LB122 OR LB121 OR /LB121 AND MOVE()) AND (MOVE() OR -() OR MOVE() AND -())  ->  LB121, LB122
```
- `LB102` 品番途中検索開始(開始位置0以外)
- `LB120` 検索品番有
- `LB121` 品番検索完了
- `LB122` 検索品番再開始

**21.**
```
LB122 AND ArySearch()
```
- `LB122` 検索品番再開始

**22.**
```
~ LB122 AND (LB115 OR LB123 OR /LB123) AND /LB124 AND (MOVE() OR MOVE() OR -())  ->  LB123, LB124
```
- `LB122` 検索品番再開始
- `LB115` 検索品番有
- `LB123` 品番検索完了
- `LB124` 検索品番無

**23.**
```
~ (LB103 AND LB111 OR LB104 AND LB121) AND /LB131  ->  LB130, LB131
```
- `LB103` 品番設定ﾁｪｯｸOK
- `LB104` 品番設定ﾁｪｯｸNG
- `LB111` 品番検索完了
- `LB121` 品番検索完了
- `LB123` 品番検索完了
- `LB130` Assy品番抽出正常終了
- `LB131` Assy品番抽出異常終了
- `LB112` 検索品番無
- `LB124` 検索品番無

**24.**
```
(LB130 OR LB131)  ->  LB135
```
- `LB130` Assy品番抽出正常終了
- `LB131` Assy品番抽出異常終了
- `LB135` Assy品番検索終了

**25. ■MD_Out**
```
LB090  ->  Ready
```
- `LB090` 段取りﾃﾞｰﾀ抽出起動条件
- `Ready` 段取りﾃﾞｰﾀ抽出起動条件

**26.**
```
LB130  ->  OK
```
- `LB130` Assy品番抽出正常終了
- `OK` OK完了

**27.**
```
LB131  ->  NG
```
- `LB131` Assy品番抽出異常終了
- `NG` NG完了

**28.**
```
LB130 AND MOVE()
```
- `LB130` Assy品番抽出正常終了

**29.**
```
/LB020 AND Clear()
```
- `LB020` MD異常でない

## (tanpa program) / LadderBody


**1. Check condition after receive data**
```
~ Serveropendone AND /RcvRetry AND /RcvAgain AND (SktTCPRcv() AND /phasedone AND =() OR phasedone AND /SendP2Ok AND SendRSend AND /ACKOK AND SktRcvInstance.Busy AND TON() AND phasedone AND /SendP2Ok AND SendRSend) AND (RdyRcvSQ AND /SendSHend AND /RdyRcvSW OR RdyRcvSW AND /SendSNend AND /RdyRcvSA OR RdyRcvSA AND /RdyRcvWW)  ->  RcvDone, RcvEOT, RcvEOT1, RcvErrorData, RcvErrorData1, datanottransfer7, datanottransfer12, datatrsnfer9, datatrsnfer1, datatrsnfer, datatrsnfer3, datatrsnfer4, datatrsnfer5, datatrsnfer6, datatrsnfer8, datatrsnfer10, sendP2, sendP2NG, RcvAgain1, datanottransfer1, datanottransfer3, datanottransfer5, datanottransfer10, datanottransfer11, datanottransfer13
```

**2.**
```
~ (sendP2fail AND MemCopy() OR phasedone AND =() AND /SendRSstart AND /RTreceived AND /SQreceived AND /SWreceived AND /SAreceived AND /RdyRcvWW AND /WWreceived AND /WFreceived AND /Ereceived AND /RdyRcvFP OR RdyRcvE AND ACKOK6 AND Sendok AND /SendRSstart OR RcvEOT AND /SendRSstart AND /SAreceived AND /RdyRcvWW AND /WWreceived AND /WFreceived AND /Ereceived)  ->  SendEOT
```

**3.**
```
(SendEOT OR SENDEOTREADY) AND /lostconnection AND /RcvRetry  ->  SENDEOTREADY
```

**4.**
```
~ (RcvEOT OR RcvAgain1 OR RcvDone OR RcvErrorData1 OR datatrsnfer1 OR datatrsnfer2 OR datatrsnfer OR datatrsnfer3 OR datatrsnfer4 OR datatrsnfer5 OR datatrsnfer6 OR datatrsnfer8 OR datatrsnfer7 OR datanottransfer7 OR datanottransfer12 OR datanottransfer9 OR datanottransfer1 OR datanottransfer3 OR datanottransfer5 OR datanottransfer10 OR datanottransfer11 OR datanottransfer13)  ->  RcvAgain
```

**5. Clear data in these variables**
```
~ (lostconnection AND Clear() OR Sendok AND Clear() OR RcvEOT AND Clear() OR SendEOT AND Clear())
```

**6. Indicate that enquiry had been done**
```
(Rcvfinish OR phasedone) AND /lostconnection AND /procrssdone AND /SendEOT AND /ACKOK6  ->  phasedone
```

**7.**
```
RcvError AND /SktRcvInstance.Busy AND TOF()  ->  noresponse
```

**8. Send data ACK or NAK to client**
```
~ (RcvErrorData AND /RcvRetry OR Sendok OR SktRcvInstance.Busy AND RcvError OR Rcvfinish OR Rcvfinish1 OR SENDEOTREADY OR SendEOT OR SendP2Ok) AND /RcvEOT AND MemCopy() AND SktTCPSend()  ->  Sendok
```

**9. Condition to send ACK to client**
```
~ (RcvDone AND /RdyRcvSQ AND /RdyRcvSW OR ArytoStringOk AND /RdyRcvSQ AND /RTreceived AND EQ() OR ArytoStringOk AND RdyRcvSQ AND /RdyRcvSW AND /SQreceived AND EQ() OR ArytoStringOk AND RdyRcvSW AND /SWreceived AND /RdyRcvSA AND EQ() OR ArytoStringOk AND RdyRcvSA AND /SAreceived AND /RdyRcvWW AND EQ() OR ArytoStringOk AND RdyRcvWW AND /WWreceived AND EQ() OR ArytoStringOk AND =() AND Eabnormaloccur OR datatrsnfer10 OR RdyRcvSQ AND RcvDone OR RdyRcvSW AND RcvDone OR RdyRcvSA AND RcvDone OR RdyRcvWW AND RcvDone) AND MemCopy()  ->  Rcvfinish
```

**10. Data that had been received from client**
```
(ArytoStringOk OR Ereceived) AND Eabnormaloccur AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone AND /ACKOK6  ->  Ereceived
```

**11.**
```
(ArytoStringOk OR RTreceived) AND /RdyRcvSQ AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone  ->  RTreceived
```

**12.**
```
(ArytoStringOk OR SQreceived) AND /RdyRcvSW AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone  ->  SQreceived
```

**13.**
```
(ArytoStringOk OR SWreceived) AND /RdyRcvSA AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone  ->  SWreceived
```

**14.**
```
(ArytoStringOk OR SAreceived) AND /RdyRcvFP AND EQ() AND <>() AND <>() AND /lostconnection AND /SendEOT AND /procrssdone  ->  SAreceived
```

**15.**
```
(ArytoStringOk OR WWreceived) AND RcvEOTConfirm AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone  ->  WWreceived
```

**16.**
```
(ArytoStringOk OR WFreceived) AND RcvEOTConfirm AND EQ() AND /lostconnection AND /SendEOT AND /procrssdone AND /WWreceived  ->  WFreceived
```

**17.**
```
~ (ArytoStringOk AND /RdyRcvSQ AND EQ() OR ArytoStringOk AND RdyRcvSQ AND EQ() OR ArytoStringOk AND RdyRcvSW AND EQ() OR ArytoStringOk AND RdyRcvWW AND EQ() OR ArytoStringOk AND RdyRcvWF AND EQ() OR ArytoStringOk AND EQ() OR Rcvfinish_CPY) AND /sendRSok AND /sendSHok AND /sendSNok AND /lostconnection AND /timeron4  ->  Rcvfinish_CPY
```

**18.**
```
Rcvfinish_CPY AND TON()  ->  timeron4
```

**19.**
```
(timeron4 OR Rcvfinish2) AND /sendRSok AND /sendSHok AND /sendSNok AND /lostconnection  ->  Rcvfinish2
```

**20.**
```
Rcvfinish2 AND TON()  ->  timeroff1
```

**21. Send EOT to client after successfully send data**
```
~ (RdyRcvSQ OR RdyRcvSW OR ACKOK6 OR RdyRcvSA OR RdyRcvFP) AND MemCopy()  ->  Rcvfinish1
```

**22.**
```
~ (RcvEOT1 AND /RdyRcvSQ OR Rcvfinish2 AND RcvEOT1 AND RdyRcvSQ AND /SAreceived OR Rcvfinish2 AND RcvEOT1 AND RdyRcvSW AND /SAreceived OR Rcvfinish2 AND RcvEOT1 AND RdyRcvSA AND /SAreceived OR Rcvfinish2 AND RcvEOT1 AND RdyRcvWW OR Rcvfinish2 AND RcvEOT1 AND RdyRcvFP OR sendP2NG OR Rcvfinish3) AND /lostconnection AND /ACKOK AND /ACKOK1 AND /ACKOK2 AND /ACKOK4 AND /procrssdone AND /SendEOT AND /SendP2Ok  ->  Rcvfinish3
```

**23.**
```
~ (sendP2NG OR SendP2Ok OR DUMMYDONE OR Sendok OR sendP2 OR RcvEOT1) AND TOF()  ->  RcvRetry
```

**24.**
```
~ (noresponse OR RcvRetry OR SktRcvInstance.Busy AND /RcvError OR Serveropendone) AND SktGetTCPStatus()  ->  status
```

**25.**
```
P_On AND TON()  ->  timerok
```

**26.**
```
(dummy7 OR DUMMYDONE) AND /lostconnection AND /RcvRetry  ->  DUMMYDONE
```

**27.**
```
~ (status AND EQ() OR DUMMYDONE AND SktClose() OR timerok OR /SktRcvInstance.Busy AND RcvError)  ->  lostconnection
```

**28.**
```
~ (RcvDone OR RcvEOTConfirm AND =() AND =() OR datatrsnfer9 OR datatrsnferstart) AND /lostconnection AND /procrssdone AND /RcvEOT AND /SendEOT AND /RTreceived AND /SQreceived AND /SWreceived AND /SAreceived AND /WWreceived  ->  datatrsnferstart
```

**29.**
```
~ datatrsnferstart AND (datatrsnfer AND AryToString() OR datatrsnfer3 AND AryToString() OR datatrsnfer4 AND AryToString() OR datatrsnfer5 AND AryToString() OR datatrsnfer6 AND AryToString() OR datatrsnfer8 AND AryToString() OR datatrsnfer9 AND StringToAry())  ->  ArytoStringOk
```

**30.**
```
~ (datatrsnfer1 OR RdyRcvFP OR ACKOK) AND SendRSend AND /RdyRcvSQ AND /lostconnection  ->  ACKOK
```

**31.**
```
(datatrsnfer1 OR ACKOK1) AND SendSHend AND /lostconnection AND /RdyRcvSW  ->  ACKOK1
```

**32.**
```
(datatrsnfer1 OR ACKOK2) AND SendSNend AND /lostconnection AND /RdyRcvSA  ->  ACKOK2
```

**33.**
```
(datatrsnfer1 OR ACKOK4) AND SendWRend AND /lostconnection AND /RdyRcvFP  ->  ACKOK4
```

**34.**
```
(datatrsnfer1 OR ACKOK5) AND SendWCend AND /lostconnection AND /SendEOT AND /procrssdone  ->  ACKOK5
```

**35.**
```
(SAreceived OR ACKOK3) AND /lostconnection AND /RdyRcvWW  ->  ACKOK3
```

**36.**
```
(datatrsnfer1 OR ACKOK6) AND SendECend AND /lostconnection AND /SendEOT AND /procrssdone  ->  ACKOK6
```

**37.**
```
(ACKOK OR RdyRcvSQ) AND /lostconnection AND /ACKOK4 AND /ACKOK6  ->  RdyRcvSQ
```

**38.**
```
(ACKOK1 OR RdyRcvSW) AND /lostconnection AND /SendEOT AND /ACKOK4  ->  RdyRcvSW
```

**39.**
```
(ACKOK2 OR RdyRcvSA) AND /lostconnection AND /SendEOT AND /ACKOK4  ->  RdyRcvSA
```

**40.**
```
(ACKOK3 OR RdyRcvWW) AND /lostconnection AND /SendEOT AND /ACKOK4  ->  RdyRcvWW
```

**41.**
```
~ (ACKOK4 OR ACKOK5 OR RdyRcvFP) AND /lostconnection AND /SendEOT AND /ACKOK AND /RdyRcvSQ AND /RcvDone  ->  RdyRcvFP
```

**42.**
```
(Eabnormaloccur OR RdyRcvE) AND /lostconnection AND /SendEOT  ->  RdyRcvE
```

**43. Abnormal check**
```
~ datatrsnferstart AND =() AND (EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ())  ->  Eabnormaloccur
```

**44. Check the RCV data**
```
~ datatrsnferstart AND (EQ() OR EQ() OR EQ() OR EQ() OR EQ() OR EQ())  ->  RTOk, SQOk, SWOk, SAOk, WWOk, WFOk
```

**45. Indicate to start send the data**
```
~ (RTOk OR sendP2NG OR datanottransfer1 OR SendRSstart) AND /lostconnection AND /sendRSok AND /SendEOT AND /RdyRcvSQ  ->  SendRSstart
```

**46.**
```
~ (SQOk OR sendP2NG OR datanottransfer3 OR SendSHstart) AND RdyRcvSQ AND /lostconnection AND /sendSHok AND /SendEOT AND /RdyRcvSW  ->  SendSHstart
```

**47.**
```
~ (SWOk OR sendP2NG OR datanottransfer5 OR SendSNstart) AND RdyRcvSW AND /lostconnection AND /sendSNok AND /SendEOT AND /RdyRcvSA  ->  SendSNstart
```

**48.**
```
~ (WWOk OR sendP2NG OR datanottransfer10 OR RCVWWstart) AND RdyRcvSA AND /lostconnection AND /SendEOT AND /RdyRcvFP  ->  RCVWWstart
```

**49.**
```
~ (WFOk OR sendP2NG OR datanottransfer11 OR RCVWFstart) AND RdyRcvSA AND /lostconnection AND /SendEOT AND /RdyRcvFP AND /WWreceived  ->  RCVWFstart
```

**50.**
```
~ (Eabnormaloccur OR sendP2NG OR datanottransfer13 OR SendECstart) AND RdyRcvE AND /lostconnection AND /SendEOT  ->  SendECstart
```

**51. Send STX EC ETX**
```
SendECstart AND StringToAry() AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY5
```

**52. Send STX RS ETX**
```
SendRSstart AND StringToAry() AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY
```

**53. Send STX SH MA partnumber quantity productid ETX**
```
~ SendSHstart AND CONCAT() AND CONCAT() AND (/Adjust_DNIA AND CONCAT() AND CONCAT() AND CONCAT() AND StringToAry() OR Adjust_DNIA AND CONCAT() AND StringToAry() AND MemCopy() AND MOVE()) AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY1
```
- `Adjust_DNIA` Adjustment coil For Change Only Part Number and QTY Send

**54. Send STX SNA0 ETX**
```
SendSNstart AND StringToAry() AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY2
```

**55. Send STX WR ETX**
```
RCVWWstart AND StringToAry() AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY3
```

**56. Send STX WC ETX**
```
RCVWFstart AND StringToAry() AND (MemCopy() OR MemCopy()) AND MOVE()  ->  SendP2READY4
```

**57.**
```
~ (datanottransfer1 AND /sendRSok OR datanottransfer3 AND /sendSHok OR datanottransfer5 AND /sendSNok OR datanottransfer10 AND /sendWROk OR datanottransfer11 AND /sendWCOk OR datanottransfer13 AND /sendECOk OR FAILTRANSFER1) AND /lostconnection AND /RcvEOT AND /SendEOT AND /procrssdone  ->  FAILTRANSFER1
```

**58.**
```
~ (SendP2READY OR SendP2READY1 OR SendP2READY2 OR SendP2READY3 OR SendP2READY4 OR SendP2READY5) AND /sendP2NG AND /lostconnection AND /FAILTRANSFER1  ->  sendP2check
```

**59.**
```
(sendP2NG OR SENDP2NGRETRY) AND /lostconnection AND /RcvEOT AND /SendEOT AND /procrssdone  ->  SENDP2NGRETRY
```

**60. Count until 3 times if fail to receive ACK after send data to client**
```
~ (sendP2NG OR datanottransfer1 OR datanottransfer3 OR datanottransfer5 OR datanottransfer10 OR datanottransfer11 OR datanottransfer13) AND CTU()  ->  sendP2fail
```

**61.**
```
(sendP2 OR SendRSdone) AND SendRSstart AND /lostconnection AND /sendRSok AND /SendEOT  ->  SendRSdone
```

**62.**
```
(sendP2 OR SendSHdone) AND SendSHstart AND /lostconnection AND /sendSHok AND /RdyRcvSW AND /SendEOT  ->  SendSHdone
```

**63.**
```
(sendP2 OR SendSNdone) AND SendSNstart AND /lostconnection AND /sendSNok AND /RdyRcvSA AND /SendEOT  ->  SendSNdone
```

**64.**
```
(sendP2 OR SendWRdone) AND RCVWWstart AND /lostconnection AND /sendWROk AND /RdyRcvFP AND /SendEOT  ->  SendWRdone
```

**65.**
```
(sendP2 OR SendWCdone) AND RCVWFstart AND /lostconnection AND /sendWCOk AND /RdyRcvFP AND /SendEOT  ->  SendWCdone
```

**66.**
```
(sendP2 OR SendECdone) AND SendECstart AND /lostconnection AND /SendEOT  ->  SendECdone
```

**67. send RS to client**
```
(SendRSdone OR SendP2READY AND FAILTRANSFER1) AND /ACKOK AND SktTCPSend()  ->  sendRSok
```

**68. send SH to client**
```
(SendSHdone AND sendP2 OR SendP2READY1 AND FAILTRANSFER1) AND /ACKOK1 AND SktTCPSend()  ->  sendSHok
```

**69. send SN to client**
```
(SendSNdone AND sendP2 OR SendP2READY2 AND FAILTRANSFER1) AND /ACKOK2 AND SktTCPSend()  ->  sendSNok
```

**70. send WR to client**
```
(SendWRdone AND sendP2 OR SendP2READY3 AND FAILTRANSFER1) AND /ACKOK4 AND SktTCPSend()  ->  sendWROk
```

**71. send WC to client**
```
(SendWCdone AND sendP2 OR SendP2READY4 AND FAILTRANSFER1) AND /ACKOK5 AND SktTCPSend()  ->  sendWCOk
```

**72. send EC to client**
```
(SendECdone AND sendP2 OR SendP2READY5 AND FAILTRANSFER1) AND SktTCPSend()  ->  SendECOk
```

**73.**
```
(sendRSok OR SendRSend) AND /lostconnection AND /RdyRcvSQ AND /SendEOT  ->  SendRSend
```

**74.**
```
(sendSHok OR SendSHend) AND /lostconnection AND /RdyRcvSW AND /SendEOT  ->  SendSHend
```

**75.**
```
(sendSNok OR SendSNend) AND /lostconnection AND /RdyRcvSA AND /SendEOT  ->  SendSNend
```

**76.**
```
(sendWROk OR SendWRend) AND /lostconnection AND /RdyRcvFP AND /SendEOT  ->  SendWRend
```

**77.**
```
(sendWCOk OR SendWCend) AND /lostconnection AND /SendEOT AND /ACKOK5  ->  SendWCend
```

**78.**
```
(SendECOk OR SendECend) AND /lostconnection AND /SendEOT  ->  SendECend
```

**79. Receive EOT from client before send data to client**
```
~ (RcvEOT OR RcvEOT1 OR RdyRcvFP AND Rcvfinish1 AND /RdyRcvE OR RcvEOTConfirm OR BPConnection) AND /SendP2Ok AND /WWreceived AND /WFreceived AND /SQreceived AND /lostconnection  ->  RcvEOTConfirm
```

**80.**
```
~ sendP2check AND (SQreceived AND IN_SH AND RcvEOTConfirm AND /RdyRcvSW OR SWreceived AND IN_SN AND RcvEOTConfirm AND /RdyRcvSA OR WWreceived AND IN_WR AND RcvEOTConfirm AND /IN_WC AND /RdyRcvFP OR WFreceived AND IN_WC AND RcvEOTConfirm AND /IN_WR AND /RdyRcvFP OR Ereceived AND IN_EC AND RcvEOTConfirm OR Rcvfinish3 AND RcvEOTConfirm AND /SendSHstart AND /SendSNstart AND /RCVWWstart) AND SktTCPSend()  ->  SendP2Ok
```

**81.**
```
~ (RdyRcvSQ OR RdyRcvSW OR RdyRcvSA OR datanottransfer7 OR datanottransfer12 OR ACKOK5 OR RdyRcvFP OR phasedone AND =() AND /RTreceived AND /SQreceived AND /SWreceived AND /SAreceived AND /Ereceived AND /RdyRcvWW AND /RdyRcvFP)  ->  procrssdone
```

**82.**
```
(SendP2Ok OR SENDP2DONE) AND /lostconnection AND /sendP2fail AND /procrssdone AND /ACKOK6  ->  SENDP2DONE
```

**83.**
```
~ (lostconnection OR RcvEOT OR SendEOT AND TON() OR sendP2)  ->  sendP2failreset
```

**84.**
```
P_On  ->  Adjust_DNIA
```
- `Adjust_DNIA` Adjustment coil For Change Only Part Number and QTY Send

---

# Silang-rujuk operand

| Operand | Arti | Ditulis di | Dibaca (kali) |
|---|---|---|---|
| `ACKOK` |  | (tanpa program)/LadderBody#30 | 10 |
| `ACKOK1` |  | (tanpa program)/LadderBody#31 | 9 |
| `ACKOK2` |  | (tanpa program)/LadderBody#32 | 9 |
| `ACKOK3` |  | (tanpa program)/LadderBody#35 | 3 |
| `ACKOK4` |  | (tanpa program)/LadderBody#33 | 13 |
| `ACKOK5` |  | (tanpa program)/LadderBody#34 | 9 |
| `ACKOK6` |  | (tanpa program)/LadderBody#36 | 12 |
| `AIR_SOURCE_CONF_FLASH1` | Air Source Confirm Flash 1 | P000_Main/Device_Input#13 | 3 |
| `AIR_SOURCE_CONF_FLASH2` | Air Source Confirm fLASH 2 | P000_Main/Device_Input#17 | 3 |
| `AIR_SOURCE_CONF_SHUTTE` | Air Source Confirm Shutte Pokayoke | P000_Main/Device_Input#21 | 3 |
| `ALZBD01[1]` |  | P001_HMI/DataSearch#30 | 1 |
| `ALZBD01[2]` |  | P001_HMI/DataSearch#31 | 1 |
| `AL[001]` |  | P000_Main/Fault#27 | 1 |
| `AL[002]` |  | P000_Main/Fault#28 | 1 |
| `AL[003]` |  | P000_Main/Fault#29 | 1 |
| `AL[004]` |  | P000_Main/Fault#30 | 1 |
| `AL[005]` |  | P000_Main/Fault#31 | 1 |
| `AL[006]` |  | P000_Main/Fault#32 | 1 |
| `AL[007]` |  | P000_Main/Fault#33 | 1 |
| `AL[008]` |  | P000_Main/Fault#34 | 1 |
| `AL[009]` |  | P000_Main/Fault#35 | 1 |
| `AL[010]` |  | P000_Main/Fault#36 | 1 |
| `AL[011]` |  | P000_Main/Fault#37 | 1 |
| `AL[012]` |  | P000_Main/Fault#38 | 1 |
| `AL[013]` |  | P000_Main/Fault#39 | 1 |
| `AL[014]` |  | P000_Main/Fault#40 | 1 |
| `AL[101]` |  | P000_Main/Fault#46 | 0 |
| `AL[102]` |  | P000_Main/Fault#47 | 1 |
| `AL[103]` |  | P000_Main/Fault#48 | 1 |
| `AL[104]` |  | P000_Main/Fault#49 | 1 |
| `AL[105]` |  | P000_Main/Fault#50 | 1 |
| `AL[10]` |  | (tidak ditulis di project ini) | 1 |
| `AL[110]` |  | P002_ServoMain/Fault#20 | 2 |
| `AL[111]` |  | P002_ServoMain/Fault#21 | 2 |
| `AL[11]` |  | (tidak ditulis di project ini) | 1 |
| `AL[121]` |  | P011_WIP_Transfer/Fault#8 | 2 |
| `AL[122]` |  | P011_WIP_Transfer/Fault#9 | 2 |
| `AL[12]` |  | (tidak ditulis di project ini) | 1 |
| `AL[141]` |  | P012_ATS3_Unit/Fault#5 | 2 |
| `AL[142]` |  | P012_ATS3_Unit/Fault#6 | 2 |
| `AL[143]` |  | P012_ATS3_Unit/Fault#7 | 2 |
| `AL[144]` |  | P012_ATS3_Unit/Fault#8 | 2 |
| `AL[145]` |  | P012_ATS3_Unit/Fault#9 | 2 |
| `AL[146]` |  | P012_ATS3_Unit/Fault#10 | 2 |
| `AL[147]` |  | P012_ATS3_Unit/Fault#11 | 2 |
| `AL[148]` |  | P012_ATS3_Unit/Fault#12 | 2 |
| `AL[149]` |  | P012_ATS3_Unit/Fault#13 | 2 |
| `AL[150]` |  | P012_ATS3_Unit/Fault#14, P012_ATS3_Unit/Fault#15 | 4 |
| `AL[151]` |  | P012_ATS3_Unit/Fault#16 | 2 |
| `AL[152]` |  | P012_ATS3_Unit/Fault#17 | 2 |
| `AL[153]` |  | P012_ATS3_Unit/Fault#18 | 2 |
| `AL[155]` |  | P012_ATS3_Unit/Fault#19 | 3 |
| `AL[156]` |  | P012_ATS3_Unit/Fault#20 | 2 |
| `AL[157]` |  | P012_ATS3_Unit/Fault#21 | 2 |
| `AL[158]` |  | P012_ATS3_Unit/Fault#22 | 2 |
| `AL[159]` |  | P012_ATS3_Unit/Fault#23 | 2 |
| `AL[15]` |  | P002_ServoMain/Fault#19 | 2 |
| `AL[161]` |  | P014_Flash1/Fault#6 | 2 |
| `AL[162]` |  | P014_Flash1/Fault#7 | 2 |
| `AL[163]` |  | P014_Flash1/Fault#8 | 2 |
| `AL[164]` |  | P014_Flash1/Fault#9 | 2 |
| `AL[165]` |  | P014_Flash1/Fault#10 | 2 |
| `AL[166]` |  | P014_Flash1/Fault#11 | 2 |
| `AL[167]` |  | P014_Flash1/Fault#12 | 2 |
| `AL[16]` |  | P011_WIP_Transfer/Fault#2 | 3 |
| `AL[17]` |  | P011_WIP_Transfer/Fault#3 | 3 |
| `AL[181]` |  | P015_Flash2/Fault#6 | 2 |
| `AL[182]` |  | P015_Flash2/Fault#7 | 2 |
| `AL[183]` |  | P015_Flash2/Fault#8 | 2 |
| `AL[184]` |  | P015_Flash2/Fault#9 | 2 |
| `AL[185]` |  | P015_Flash2/Fault#10 | 2 |
| `AL[186]` |  | P015_Flash2/Fault#11 | 2 |
| `AL[187]` |  | P015_Flash2/Fault#12 | 2 |
| `AL[18]` |  | P011_WIP_Transfer/Fault#4 | 3 |
| `AL[19]` |  | P011_WIP_Transfer/Fault#5 | 3 |
| `AL[1]` |  | (tidak ditulis di project ini) | 1 |
| `AL[201]` |  | P000_Main/Fault#51 | 1 |
| `AL[202]` |  | P000_Main/Fault#52 | 1 |
| `AL[20]` |  | P011_WIP_Transfer/Fault#6 | 2 |
| `AL[211]` |  | P011_WIP_Transfer/Fault#10 | 0 |
| `AL[221]` |  | P012_ATS3_Unit/Fault#24 | 0 |
| `AL[231]` |  | P014_Flash1/Fault#13 | 1 |
| `AL[241]` |  | P015_Flash2/Fault#13 | 1 |
| `AL[299]` |  | P000_Main/Fault#61 | 2 |
| `AL[2]` |  | (tidak ditulis di project ini) | 1 |
| `AL[300]` |  | P000_Main/Fault#53 | 1 |
| `AL[301]` |  | P000_Main/Fault#54 | 1 |
| `AL[304]` |  | P000_Main/Fault#55 | 1 |
| `AL[305]` |  | P000_Main/Fault#56 | 1 |
| `AL[306]` |  | P000_Main/Fault#57 | 1 |
| `AL[307]` |  | P000_Main/Fault#58 | 1 |
| `AL[309]` |  | P002_ServoMain/Fault#22 | 1 |
| `AL[310]` |  | P011_WIP_Transfer/Fault#12 | 1 |
| `AL[311]` |  | P011_WIP_Transfer/Fault#13 | 1 |
| `AL[312]` |  | P011_WIP_Transfer/Fault#14 | 2 |
| `AL[313]` |  | P011_WIP_Transfer/Fault#15 | 0 |
| `AL[314]` |  | P011_WIP_Transfer/Fault#16 | 1 |
| `AL[31]` |  | P012_ATS3_Unit/Fault#3 | 0 |
| `AL[320]` |  | P012_ATS3_Unit/Fault#25 | 1 |
| `AL[321]` |  | P012_ATS3_Unit/Fault#26 | 2 |
| `AL[322]` |  | P012_ATS3_Unit/Fault#27 | 1 |
| `AL[323]` |  | P012_ATS3_Unit/Fault#28 | 1 |
| `AL[330]` |  | P014_Flash1/Fault#15 | 3 |
| `AL[340]` |  | P015_Flash2/Fault#15 | 3 |
| `AL[350]` |  | P002_ServoMain/Fault#33 | 1 |
| `AL[351]` |  | P002_ServoMain/Fault#34 | 1 |
| `AL[352]` |  | P002_ServoMain/Fault#35 | 1 |
| `AL[353]` |  | P002_ServoMain/Fault#36 | 1 |
| `AL[354]` |  | P002_ServoMain/Fault#37 | 1 |
| `AL[355]` |  | P002_ServoMain/Fault#38 | 1 |
| `AL[356]` |  | P002_ServoMain/Fault#39 | 1 |
| `AL[357]` |  | P002_ServoMain/Fault#40 | 1 |
| `AL[3]` |  | (tidak ditulis di project ini) | 1 |
| `AL[46]` |  | P014_Flash1/Fault#2 | 2 |
| `AL[47]` |  | P014_Flash1/Fault#3 | 2 |
| `AL[48]` |  | P014_Flash1/Fault#4 | 2 |
| `AL[4]` |  | (tidak ditulis di project ini) | 1 |
| `AL[5]` |  | (tidak ditulis di project ini) | 1 |
| `AL[61]` |  | P015_Flash2/Fault#2 | 2 |
| `AL[62]` |  | P015_Flash2/Fault#3 | 2 |
| `AL[63]` |  | P015_Flash2/Fault#4 | 2 |
| `AL[76]` |  | P000_Main/Fault#41 | 1 |
| `AL[77]` |  | P000_Main/Fault#42 | 1 |
| `AL[78]` |  | P000_Main/Fault#43 | 1 |
| `AL[79]` |  | P000_Main/Fault#44 | 1 |
| `AL[80]` |  | P000_Main/Fault#45 | 1 |
| `AL[81]` |  | P011_WIP_Transfer/Fault#7 | 0 |
| `AL[86]` |  | P012_ATS3_Unit/Fault#4 | 0 |
| `AL[91]` |  | P014_Flash1/Fault#5 | 0 |
| `AL[96]` |  | P015_Flash2/Fault#5 | 0 |
| `ARYBYTEOK` |  | P000_Main/QRReader#2 | 0 |
| `ATS_XAxis_Ready` | ATS X Axis Servo Ready | P002_ServoMain/MD_Out#8 | 1 |
| `AUTO_MODE` | AUTOMATIC OPERATION MODE | P000_Main/Station_Output#6 | 19 |
| `AUTO_RUN` | Auto Running | P000_Main/Station_Output#8 | 96 |
| `Adjust_DNIA` | Adjustment coil For Change Only Part Number and QTY Send | (tanpa program)/LadderBody#84 | 2 |
| `AirBlow_Bypass` | Bypass Airblow MC | P000_Main/Station_Output#18 | 2 |
| `ArytoStringOk` |  | (tanpa program)/LadderBody#29 | 19 |
| `BPConnection` |  | (tidak ditulis di project ini) | 1 |
| `CH0000_00` | PB EMERGENCY STOP | (tidak ditulis di project ini) | 1 |
| `CH0000_01` | FUSE GOOD CONFIRM. | (tidak ditulis di project ini) | 1 |
| `CH0000_03` | SAFETY CONFIRM. | (tidak ditulis di project ini) | 1 |
| `CH0000_04` | SS AUTO/IND. | (tidak ditulis di project ini) | 1 |
| `CH0000_05` | PB MASTER ON | (tidak ditulis di project ini) | 1 |
| `CH0000_06` | MASTER ON CONFIRM. | (tidak ditulis di project ini) | 1 |
| `CH0000_07` | PB AUTO RUN | (tidak ditulis di project ini) | 1 |
| `CH0000_09` | PB LEFT GRIPPER RELEASE | (tidak ditulis di project ini) | 3 |
| `CH0000_10` | PB RIGHT GRIPPER RELEASE | (tidak ditulis di project ini) | 3 |
| `CH0000_11` | PB MODE OPERATOR/ATS | (tidak ditulis di project ini) | 1 |
| `CH0000_12` |  | (tidak ditulis di project ini) | 1 |
| `CH0001_00` | PB MASTER ON FLASH1 | (tidak ditulis di project ini) | 1 |
| `CH0001_01` | PB EMERGENCY STOP FLASH1 | (tidak ditulis di project ini) | 1 |
| `CH0001_02` | AIR SOURCE CONFIRM FLASH1 | (tidak ditulis di project ini) | 1 |
| `CH0001_03` | MASTER ON CONFIRM FLASH1 | (tidak ditulis di project ini) | 1 |
| `CH0001_04` | PB MASTER ON FLASH2 | (tidak ditulis di project ini) | 1 |
| `CH0001_05` | PB EMERGENCY STOP FLASH2 | (tidak ditulis di project ini) | 1 |
| `CH0001_06` | AIR SOURCE COFNRIM FLASH2 | (tidak ditulis di project ini) | 1 |
| `CH0001_07` | MASTER ON CONFIRM FLASH2 | (tidak ditulis di project ini) | 1 |
| `CH0001_08` | PB MASTER ON SHUTTE POKAYOKE | (tidak ditulis di project ini) | 1 |
| `CH0001_09` | PB EMERGENCY STOP SHUTTE POKAYOKE | (tidak ditulis di project ini) | 1 |
| `CH0001_10` | AIR SOURCE CONFIRM SHUTTE POKAYOKE | (tidak ditulis di project ini) | 1 |
| `CH0001_11` | MASTER ON CONFIRM SHUTTE POKAYOKE | (tidak ditulis di project ini) | 1 |
| `CH0001_12` | PB RELEASE FLASH1 | (tidak ditulis di project ini) | 1 |
| `CH0001_13` | PB RELEASE FLASH2 | (tidak ditulis di project ini) | 1 |
| `CH0001_14` | PB RELEASE SHUTTE POKAYOKE | (tidak ditulis di project ini) | 1 |
| `CH0002_00` | PH WORKPIECE 1 DETECT | (tidak ditulis di project ini) | 1 |
| `CH0002_01` | PH WORKPIECE DETECT 2 | (tidak ditulis di project ini) | 1 |
| `CH0002_02` | PH FLOATING CHECK TYPE 1 | (tidak ditulis di project ini) | 1 |
| `CH0002_03` | PH FLOATING CHECK TYPE 2 | (tidak ditulis di project ini) | 1 |
| `CH0002_04` | PX DANDORI POINT 2^0 | (tidak ditulis di project ini) | 1 |
| `CH0002_05` | PX DANDORI POINT 2^1 | (tidak ditulis di project ini) | 1 |
| `CH0002_06` | PX DANDORI POINT 2^2 | (tidak ditulis di project ini) | 1 |
| `CH0002_07` | PH LIMIT POS LEFT SIDE | (tidak ditulis di project ini) | 2 |
| `CH0002_08` | PH LIMIT POS RIGH SIDE | (tidak ditulis di project ini) | 2 |
| `CH0002_10` | AS COVER CLOSE (FLASH1) | (tidak ditulis di project ini) | 3 |
| `CH0002_11` | AS COVER OPEN (FLASH1) | (tidak ditulis di project ini) | 3 |
| `CH0002_12` | AS COVER CLOSE (FLASH2) | (tidak ditulis di project ini) | 3 |
| `CH0002_13` | AS COVER OPEN (FLASH2) | (tidak ditulis di project ini) | 3 |
| `CH0003_00` | EMERGENCY STOP INTERLOCK | P000_Main/Device_Output#2 | 0 |
| `CH0003_01` | PL MASTER ON | P000_Main/Device_Output#3 | 0 |
| `CH0003_02` | PL AUTO RUNNING | P000_Main/Device_Output#4 | 0 |
| `CH0003_03` | BUZZER-1 | P000_Main/Device_Output#5 | 0 |
| `CH0003_04` | SAFETY PREEMPT | P000_Main/Device_Output#6 | 0 |
| `CH0004_00` | PL MASTER ON  (FLASH1) | P000_Main/Device_Output#7 | 0 |
| `CH0004_01` | BUZZER-2 (FLASH1) | P000_Main/Device_Output#8 | 0 |
| `CH0004_02` | PL MASTER ON (FLASH2) | P000_Main/Device_Output#9 | 0 |
| `CH0004_03` | BUZZER-3 (FLASH2) | P000_Main/Device_Output#10 | 0 |
| `CH0004_04` | PL MASTER ON (SHUTTE POKAYOKE) | P000_Main/Device_Output#11 | 0 |
| `CH0004_05` | BUZZER-4 (SHUTTE POKAYOKE) | P000_Main/Device_Output#12 | 0 |
| `CH0004_06` | EMERGENCY STOP INTL (FLASH1) | P000_Main/Device_Output#13 | 0 |
| `CH0004_07` | SAFETY PREEMPT (FLASH1) | P000_Main/Device_Output#14 | 0 |
| `CH0004_08` | EMERGENCY STOP INTL (FLASH2) | P000_Main/Device_Output#15 | 0 |
| `CH0004_09` | SAFETY PREEMPT (FLASH2) | P000_Main/Device_Output#16 | 0 |
| `CH0004_10` | EMERGENCY STOP INTL (SHUTTE POKAYOKE) | P000_Main/Device_Output#17 | 0 |
| `CH0005_00` | SOL COVER CLOSE (FLASH1) | P012_ATS3_Unit/Device_Output#1, P015_Flash2/Device_Output#2 | 0 |
| `CH0005_01` | SOL COVER OPEN (FLASH1) | P012_ATS3_Unit/Device_Output#2, P015_Flash2/Device_Output#1 | 0 |
| `CH0005_02` | SOL COVER CLOSE (FLASH2) | P012_ATS3_Unit/Device_Output#3, P014_Flash1/Device_Output#1 | 0 |
| `CH0005_03` | SOL COVER OPEN (FLASH2) | P012_ATS3_Unit/Device_Output#4, P014_Flash1/Device_Output#2 | 0 |
| `CH0005_04` | SOL Cover FG Shutter Open | P011_WIP_Transfer/DeviceOutput#11 | 0 |
| `CH0005_05` | SOL Cover FG Shutter Close | P011_WIP_Transfer/DeviceOutput#12 | 0 |
| `CH0005_06` | SOL Chutter FG Additional Close | P011_WIP_Transfer/DeviceOutput#13 | 0 |
| `CH0005_07` | SOL Chutter FG Additional Open | P011_WIP_Transfer/DeviceOutput#14 | 0 |
| `CH0005_10` | Safety Area on WIP Bypass | P011_WIP_Transfer/DeviceOutput#15 | 0 |
| `CH0005_11` |  | P012_ATS3_Unit/Device_Output#5 | 0 |
| `CH0005_12` |  | P012_ATS3_Unit/Device_Output#5 | 0 |
| `CH0005_13` | PL RED TOWER LAMP | P000_Main/TowerLight#1 | 2 |
| `CH0005_14` | PL YELLOW TOWER LAMP | P000_Main/TowerLight#2 | 1 |
| `CH0005_15` | PL GREEN TOWER LAMP | P000_Main/TowerLight#3 | 0 |
| `CH0006_02` | AS Cover FG Close | (tidak ditulis di project ini) | 2 |
| `CH0006_03` | AS  Cover FG Open | (tidak ditulis di project ini) | 2 |
| `CH0006_04` | FG Shutter Area Sensor | (tidak ditulis di project ini) | 1 |
| `CH0006_05` | PH Jig Pokayoke Dandori : GD1B | (tidak ditulis di project ini) | 1 |
| `CH0006_06` | PH Jig Pokayoke Dandori : Abilcore | (tidak ditulis di project ini) | 1 |
| `CH0006_10` | Flash 1 Nagara | (tidak ditulis di project ini) | 1 |
| `CH0006_12` | AS Additional Chutter FG Close | (tidak ditulis di project ini) | 2 |
| `CH0006_13` | AS Additional Chutter FG Open | (tidak ditulis di project ini) | 2 |
| `CH0006_14` | PX Pokayoke Homing Right Arm | (tidak ditulis di project ini) | 1 |
| `CH0006_15` | PX Pokayoke Homing Left Arm | (tidak ditulis di project ini) | 1 |
| `CH0007_00` | PX Cover Flash 1 Close | (tidak ditulis di project ini) | 1 |
| `CH0007_01` | PH Workpiece Flash 1 Confirm. | (tidak ditulis di project ini) | 1 |
| `CH0007_02` | Flash 1 OK Signal | (tidak ditulis di project ini) | 1 |
| `CH0007_03` | Flash 1 NG Signal | (tidak ditulis di project ini) | 1 |
| `CH0007_04` |  | (tidak ditulis di project ini) | 1 |
| `CH0007_05` |  | (tidak ditulis di project ini) | 1 |
| `CH0007_06` |  | (tidak ditulis di project ini) | 1 |
| `CH0007_07` |  | (tidak ditulis di project ini) | 1 |
| `CH0007_08` | Flash 2 Nagara | (tidak ditulis di project ini) | 1 |
| `CH0007_09` | PX runn type ABIL | (tidak ditulis di project ini) | 1 |
| `CH0007_10` | PX runn type GD1B | (tidak ditulis di project ini) | 1 |
| `CH0007_15` | Saftey Area WIP Confirm. | (tidak ditulis di project ini) | 2 |
| `CP2E_TO_NX_Word[15]` |  | (tidak ditulis di project ini) | 1 |
| `CP2E_TO_NX_Word[16]` |  | (tidak ditulis di project ini) | 1 |
| `CP2E_TO_NX_Word[1]` |  | (tidak ditulis di project ini) | 2 |
| `CP2E_TO_NX_Word[2]` |  | (tidak ditulis di project ini) | 2 |
| `CP2E_TO_NX_Word[3]` |  | (tidak ditulis di project ini) | 1 |
| `CP2E_TO_NX_Word[4]` |  | (tidak ditulis di project ini) | 2 |
| `CP2E_TO_NX_Word[8]` |  | (tidak ditulis di project ini) | 1 |
| `CYCLE_STOPPING` | Cycle Stopping | P000_Main/Station_Output#9 | 5 |
| `CloseInstance` |  | (tidak ditulis di project ini) | 1 |
| `DISCH_MODE` | Discharge Mode | P000_Main/Station_Output#15 | 10 |
| `DUMMYDONE` |  | (tanpa program)/LadderBody#26 | 3 |
| `EC_ERR_STA.EC_ERR_BOOL[4]` |  | (tidak ditulis di project ini) | 2 |
| `EC_ERR_STA.EC_ERR_BOOL[5]` |  | (tidak ditulis di project ini) | 2 |
| `EC_ERR_STA.EC_ERR_BOOL[6]` |  | (tidak ditulis di project ini) | 2 |
| `EC_ERR_STA.EC_ERR_BOOL[7]` |  | (tidak ditulis di project ini) | 2 |
| `EC_FAULT_READ01` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ02` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ03` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ04` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ05` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ06` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ07` |  | (tidak ditulis di project ini) | 1 |
| `EC_FAULT_READ08` |  | (tidak ditulis di project ini) | 1 |
| `EC_MAJOR_FAULT` | EtherCAT All Stop Fault Level$tEtherCAT ALL STOP FAULT LEVEL | P000_Main/Fault#9, P000_Main/Fault#15 | 2 |
| `EC_MINOR_FAULT` | EtherCAT Mild Fault Level$tEtherCAT SLIGHT FAULT LEVEL | P000_Main/Fault#11, P000_Main/Fault#17 | 1 |
| `EC_OBSERVATION` | EtherCAT Monitoring Information Level$tEtherCAT MONITOR INFORMATION LEVEL | P000_Main/Fault#12, P000_Main/Fault#18 | 1 |
| `EC_PARTIAL_FAULT` | EtherCAT Partial Stop Fault Level$tEtherCAT PARTIAL STOP FAULT LEVEL | P000_Main/Fault#10, P000_Main/Fault#16 | 2 |
| `EIP_ERR_STA.EIP_ERR_BOOL[4]` |  | (tidak ditulis di project ini) | 1 |
| `EIP_ERR_STA.EIP_ERR_BOOL[5]` |  | (tidak ditulis di project ini) | 1 |
| `EIP_ERR_STA.EIP_ERR_BOOL[6]` |  | (tidak ditulis di project ini) | 1 |
| `EIP_ERR_STA.EIP_ERR_BOOL[7]` |  | (tidak ditulis di project ini) | 1 |
| `EIP_MAJOR_FAULT` | EtherNET/IP Total Shutdown Fault Level$tEtherNET/IP ALL STOP FAULT LEVEL | P000_Main/Fault#22 | 2 |
| `EIP_MINOR_FAULT` | EtherNET/IP MINOR FAULT LEVEL | P000_Main/Fault#24 | 0 |
| `EIP_OBSERVATION` | MONITORING INFORMATION LEVEL | P000_Main/Fault#25 | 1 |
| `EIP_PARTIAL_FAULT` | EtherNET/IP PART STOP FAULT LEVEL$tEtherNET/IP PARTIAL STOP FAULT LEVEL | P000_Main/Fault#23 | 2 |
| `Eabnormaloccur` |  | (tanpa program)/LadderBody#43 | 4 |
| `Ereceived` |  | (tanpa program)/LadderBody#10 | 6 |
| `FAILTRANSFER1` |  | (tanpa program)/LadderBody#57 | 8 |
| `FGChutterBoxChanging` | Hold & Releaser Chutter FG for Box Changing | P000_Main/Station_Output#19 | 5 |
| `FLASH1_DISABLE` | Flash 1 Disable | P000_Main/Station_Output#16 | 10 |
| `FLASH2_DISABLE` | Flash 2 Disable | P000_Main/Station_Output#17 | 10 |
| `FLT[1]` |  | (tanpa program)/LadderBody#7 | 1 |
| `FLT[2]` |  | (tanpa program)/LadderBody#8 | 1 |
| `FLT_RST` | Fault Reset | P001_HMI/TP_Control#5 | 1 |
| `FLT_Reset` | 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ$tFAULT RESET TIMING | (tidak ditulis di project ini) | 3 |
| `FUSE_GOOD` | FUSE GOOD | P000_Main/Device_Input#2 | 3 |
| `Flash1COMM` |  | (tidak ditulis di project ini) | 1 |
| `Flash1_Bypass` | Flash1 Bypass Communication | P200_COMM/StationInput#7 | 0 |
| `Flash1_COM_OK` | Flash 1 Communication OK | P200_COMM/Process#1 | 7 |
| `Flash1_ErrorReset` | Flash 1 Error Reset | P200_COMM/StationInput#5 | 0 |
| `Flash1_Error_Confirm` |  | (tidak ditulis di project ini) | 3 |
| `Flash1_Lost` | Flash 1 Lost Connection | (tidak ditulis di project ini) | 1 |
| `Flash1_NGReset` | Flash 1 NG Reset | P200_COMM/StationInput#4 | 1 |
| `Flash1_NG_Remove_REQ` |  | (tidak ditulis di project ini) | 6 |
| `Flash1_PartNo_REQ` |  | (tidak ditulis di project ini) | 8 |
| `Flash1_Process` |  | (tidak ditulis di project ini) | 2 |
| `Flash1_Send_PartNo` | Flash 1 Send Part No | P200_COMM/StationInput#1 | 1 |
| `Flash1_Socket_ACC` |  | (tidak ditulis di project ini) | 1 |
| `Flash1_Standby` |  | (tidak ditulis di project ini) | 2 |
| `Flash1_Start` | Flash 1 Start | P200_COMM/StationInput#2 | 0 |
| `Flash1_TakeOut` | Flash 1 Take Out | P200_COMM/StationInput#3 | 1 |
| `Flash1_WP_Removed` | Flash 1 TP Take Out Request | (tidak ditulis di project ini) | 8 |
| `Flash2COMM` |  | (tidak ditulis di project ini) | 1 |
| `Flash2_Bypass` |  | P200_COMM/StationInput#14 | 0 |
| `Flash2_COM_OK` | Flash 2 Communication OK | P200_COMM/Process#2 | 6 |
| `Flash2_ErrorReset` | Flash 2 Error Reset | P200_COMM/StationInput#12 | 0 |
| `Flash2_Error_Confirm` |  | (tidak ditulis di project ini) | 1 |
| `Flash2_Lost` | Flash 2 Lost Connection | (tidak ditulis di project ini) | 1 |
| `Flash2_NGReset` | Flash 2 NG Reset | P200_COMM/StationInput#11 | 1 |
| `Flash2_NG_Remove_REQ` |  | (tidak ditulis di project ini) | 6 |
| `Flash2_PartNo_REQ` |  | (tidak ditulis di project ini) | 8 |
| `Flash2_Process` |  | (tidak ditulis di project ini) | 2 |
| `Flash2_Send_PartNo` | Flash 2 Send Part No | P200_COMM/StationInput#8 | 1 |
| `Flash2_Socket_ACC` |  | (tidak ditulis di project ini) | 1 |
| `Flash2_Standby` |  | (tidak ditulis di project ini) | 2 |
| `Flash2_Start` | Flash 2 Start | P200_COMM/StationInput#9 | 0 |
| `Flash2_TakeOut` | Flash 2 Take Out | P200_COMM/StationInput#10 | 1 |
| `Flash2_WP_Removed` |  | (tidak ditulis di project ini) | 7 |
| `GB000[100]` |  | P000_Main/Initial#26, P000_Main/Initial#28 | 5 |
| `GB000[101]` |  | P000_Main/Initial#27, P000_Main/Initial#29 | 1 |
| `GB000[90]` |  | P000_Main/QRReader#6 | 4 |
| `GB001[1]` |  | P001_HMI/DataSearch#53 | 0 |
| `GB001_000` | SET-UP DATA EXTRACT NORMAL END$tSET-UP DATA EXTRACT NORMAL END | P001_HMI/DataSearch#38 | 0 |
| `GB001_001` | SET-UP DATA EXTRACT END(NO REGISTER)$tSET-UP DATA EXTRACT END(NO REGISTER) | P001_HMI/DataSearch#39 | 0 |
| `GB001_002` | SET-UP DATA EXTRACT COMPL | P001_HMI/DataSearch#40 | 0 |
| `GB001_CycleStopOff` | HMI (段取り抽出MD)_ｻｲｸﾙ停止OFF | P001_HMI/DataSearch#37 | 0 |
| `GB002_001` | MOTION CONTROLLER  EMERGENCY STOP OFF | P002_ServoMain/MD_Out#1 | 1 |
| `GB002_003` | MOTION CONTROLLER  CYCLE STOP OFF | P002_ServoMain/MD_Out#2 | 1 |
| `GB002_005` | MOTION CONTROLLER  NOTICE WARNING OFF | P002_ServoMain/MD_Out#3 | 1 |
| `GB002_006` | SERVO AMPLIFIER BATTERY REPLACE OFF | P002_ServoMain/MD_Out#4 | 0 |
| `GB002_010` | MOTION CONTROLLER  NOT FAULT | P002_ServoMain/MD_Out#5 | 0 |
| `GB002_011` | MOTION CONTROLLER  ALL AXIS SERVO ON | P002_ServoMain/MD_Out#6 | 0 |
| `GB002_012` | MOTION CONTROLLER  NOT SERVO ADJUSTMENT | P002_ServoMain/MD_Out#7 | 0 |
| `GB003_010` | IAI JOG- Operation | P003_ServoIAI/Station_Output#1 | 8 |
| `GB003_011` | IAI JOG+ Operation | P003_ServoIAI/Station_Output#2 | 8 |
| `GB003_012` | Inching Mode On | P003_ServoIAI/Station_Output#3 | 8 |
| `GB003_020` | IAI JOG- Operation | P003_ServoIAI/Station_Output#4 | 1 |
| `GB003_021` | IAI JOG+ Operation | P003_ServoIAI/Station_Output#5 | 1 |
| `GB003_022` | Inching Mode On | P003_ServoIAI/Station_Output#6 | 1 |
| `GB011_001` | WIP Transfer Home Pos. | P011_WIP_Transfer/StationOutput#1 | 1 |
| `GB011_002` | WIP Transfer Emergency Stop Fault Off | P011_WIP_Transfer/StationOutput#2 | 1 |
| `GB011_003` | WIP Transfer Auto Stop Fault Off | P011_WIP_Transfer/StationOutput#3 | 1 |
| `GB011_004` | WIP Transfer Cycle Stop Fault Off | P011_WIP_Transfer/StationOutput#4 | 1 |
| `GB011_005` | WIP Transfer Fault Stopping Off | P011_WIP_Transfer/StationOutput#5 | 1 |
| `GB011_006` | WIP Transfer Notice/Warning Off | P011_WIP_Transfer/StationOutput#6 | 1 |
| `GB011_007` |  | P011_WIP_Transfer/StationOutput#7 | 0 |
| `GB011_008` | WIP Transfer Auto Cond. (Except Home Pos.) | P011_WIP_Transfer/StationOutput#8 | 1 |
| `GB011_009` | WIP Transfer Machine Abeyance | P011_WIP_Transfer/StationOutput#9 | 1 |
| `GB011_010` |  | P011_WIP_Transfer/StationOutput#10 | 0 |
| `GB011_011` | WIP Transfer Compl. Memory | P011_WIP_Transfer/StationOutput#11 | 5 |
| `GB011_012` | Finish Good Compl. Memory | P011_WIP_Transfer/StationOutput#12 | 1 |
| `GB011_013` |  | P011_WIP_Transfer/StationOutput#13 | 0 |
| `GB011_014` |  | P011_WIP_Transfer/StationOutput#14 | 0 |
| `GB011_015` | Air Blow MC Ready | P011_WIP_Transfer/StationOutput#15 | 1 |
| `GB011_016` |  | P011_WIP_Transfer/StationOutput#16 | 0 |
| `GB011_017` |  | P011_WIP_Transfer/StationOutput#17 | 0 |
| `GB011_018` |  | P011_WIP_Transfer/StationOutput#18 | 0 |
| `GB011_019` |  | P011_WIP_Transfer/StationOutput#19 | 0 |
| `GB011_020` |  | P011_WIP_Transfer/StationOutput#20 | 0 |
| `GB011_021` | PH Workpiece 1 Confirm. [Abilcore] | P011_WIP_Transfer/StationOutput#21 | 2 |
| `GB011_022` | PH No Workpiece 1 [Abilcore] | P011_WIP_Transfer/StationOutput#22 | 10 |
| `GB011_023` | PH Workpiece 2 Confirm. [GD1B] | P011_WIP_Transfer/StationOutput#23 | 2 |
| `GB011_024` | PH No Workpiece 2 [GD1B] | P011_WIP_Transfer/StationOutput#24 | 10 |
| `GB011_025` | PH Tipe 1 Floating Confirm. [Abilcore] | P011_WIP_Transfer/StationOutput#25 | 1 |
| `GB011_026` | PH Tipe 1 No Floating Confirm. [Abilcore] | P011_WIP_Transfer/StationOutput#26 | 0 |
| `GB011_027` | PH Tipe 2 Floating Confirm. [GD1B] | P011_WIP_Transfer/StationOutput#27 | 1 |
| `GB011_028` | PH Tipe 2 No Floating Confirm. [GD1B] | P011_WIP_Transfer/StationOutput#28 | 0 |
| `GB012_001` | PNP ATS3 Home Pos. | P012_ATS3_Unit/Station_Output#1 | 1 |
| `GB012_002` | PNP ATS3 Emergency Stop Fault Off | P012_ATS3_Unit/Station_Output#2 | 1 |
| `GB012_003` | PNP ATS3 Auto Stop Fault Off | P012_ATS3_Unit/Station_Output#3 | 1 |
| `GB012_004` | PNP ATS3 Cycle Stop Fault Off | P012_ATS3_Unit/Station_Output#4 | 1 |
| `GB012_005` | PNP ATS3 Fault Stopping Off | P012_ATS3_Unit/Station_Output#5 | 1 |
| `GB012_006` | PNP ATS3 Notice/Warning Off | P012_ATS3_Unit/Station_Output#6 | 1 |
| `GB012_007` | MRC Master Check Complete | P012_ATS3_Unit/Station_Output#7 | 2 |
| `GB012_008` | PNP3 Auto Cond. (Home Pos. Except) | P012_ATS3_Unit/Station_Output#8 | 1 |
| `GB012_009` | PNP ATS3 Machine Abeyance | P012_ATS3_Unit/Station_Output#9 | 1 |
| `GB012_010` |  | P012_ATS3_Unit/Station_Output#10 | 0 |
| `GB012_011` |  | P012_ATS3_Unit/Station_Output#11 | 0 |
| `GB012_012` |  | P012_ATS3_Unit/Station_Output#12 | 0 |
| `GB012_013` |  | P012_ATS3_Unit/Station_Output#13 | 0 |
| `GB012_014` |  | P012_ATS3_Unit/Station_Output#14 | 0 |
| `GB012_015` | ATS Moving to WIP Position | P012_ATS3_Unit/Station_Output#15 | 8 |
| `GB012_016` |  | P012_ATS3_Unit/Station_Output#16 | 0 |
| `GB012_017` |  | P012_ATS3_Unit/Station_Output#17 | 0 |
| `GB012_018` |  | P012_ATS3_Unit/Station_Output#18 | 0 |
| `GB012_019` |  | P012_ATS3_Unit/Station_Output#19 | 0 |
| `GB012_020` | ATS X Axis is Ready to Move (Interlock Confirm.) | P012_ATS3_Unit/Station_Output#20 | 5 |
| `GB012_021` | Flash 1 Take Out Compl. Memory | P012_ATS3_Unit/Station_Output#21 | 3 |
| `GB012_022` | Flash 2 Take Out Compl. Memory | P012_ATS3_Unit/Station_Output#22 | 3 |
| `GB012_023` |  | P012_ATS3_Unit/Station_Output#23 | 0 |
| `GB012_024` |  | P012_ATS3_Unit/Station_Output#24 | 0 |
| `GB012_025` | Left Arm WIP Take Out Compl. | P012_ATS3_Unit/Station_Output#25 | 1 |
| `GB012_026` | Flash1 Take In Compl. Memory | P012_ATS3_Unit/Station_Output#26 | 9 |
| `GB012_027` | Flash 2 Take In Compl. Memory | P012_ATS3_Unit/Station_Output#27 | 6 |
| `GB012_028` | WIP Take In Compl. Memory | P012_ATS3_Unit/Station_Output#28 | 1 |
| `GB012_029` |  | P012_ATS3_Unit/Station_Output#29 | 0 |
| `GB012_030` | No Product on All Station Confirm. | P012_ATS3_Unit/Station_Output#30 | 2 |
| `GB012_041` | MRC 3 Take Out Compl. Memory | P012_ATS3_Unit/Station_Output#31 | 0 |
| `GB012_042` | MRC 3 Take Out Compl. Memory | P012_ATS3_Unit/Station_Output#32 | 0 |
| `GB012_046` | Flash 1 Take In Motion Start | P012_ATS3_Unit/Station_Output#33 | 1 |
| `GB012_047` | Flash 2 Take In Motion Start | P012_ATS3_Unit/Station_Output#34 | 1 |
| `GB014_001` | Flash 1 Unit Home Pos. | P014_Flash1/Station_Output#1 | 1 |
| `GB014_002` | Flash 1 Unit Emergency Stop Off | P014_Flash1/Station_Output#2 | 2 |
| `GB014_003` | Flash 1 Unit Auto Stopping Off | P014_Flash1/Station_Output#3 | 1 |
| `GB014_004` | Flash 1 Cycle Stop Off | P014_Flash1/Station_Output#4 | 1 |
| `GB014_005` | Flash 1 Fault Stopping Off | P014_Flash1/Station_Output#5 | 1 |
| `GB014_006` | Flash 1 Unit Warning Off | P014_Flash1/Station_Output#6 | 1 |
| `GB014_007` | Flash 1 Master Check Complete | P014_Flash1/Station_Output#7 | 2 |
| `GB014_008` | Flash 1 Auto Cond. (Home Pos. Except) | P014_Flash1/Station_Output#8 | 1 |
| `GB014_009` | Flash 1 Machine Abeyance | P014_Flash1/Station_Output#9 | 1 |
| `GB014_010` | Flash 1 Process Compl. | P014_Flash1/Station_Output#10 | 2 |
| `GB014_011` | Flash 1 Product Confirm. | P014_Flash1/Station_Output#11 | 8 |
| `GB014_012` | Flash 1 No Product Confirm. | P014_Flash1/Station_Output#12 | 13 |
| `GB014_013` | Flash 1 Send PN Complete Confirm. | P014_Flash1/Station_Output#13 | 1 |
| `GB014_014` |  | P014_Flash1/Station_Output#14 | 0 |
| `GB014_015` | Flash 1 Part No Send Signal | P014_Flash1/Station_Output#15 | 1 |
| `GB014_016` | Flash 1 Process Start Signal | P014_Flash1/Station_Output#16 | 1 |
| `GB014_017` | Flash 1 WIP Take Out Confirm. Signal | P014_Flash1/Station_Output#17 | 2 |
| `GB014_018` | Flash 1 NG Remove Confirm. Signal | P014_Flash1/Station_Output#18 | 1 |
| `GB014_019` |  | P014_Flash1/Station_Output#19 | 0 |
| `GB014_020` | Flash 1 Cover is Ready to Move (Interlock Confirm.) | P014_Flash1/Station_Output#20 | 15 |
| `GB014_021` | Flash 1 Cover Home Pos. | P014_Flash1/Station_Output#21 | 23 |
| `GB014_022` | LS Cover Flash 1 Open | P014_Flash1/Station_Output#22 | 2 |
| `GB014_023` | Flash 1 Compl. Memory | P014_Flash1/Station_Output#23 | 1 |
| `GB014_024` | Flash 1 OK Compl. Memory | P014_Flash1/Station_Output#24 | 1 |
| `GB014_025` | Flash  1 NG Compl. Memory | P014_Flash1/Station_Output#25 | 0 |
| `GB015_001` | Flash2 Home Pos. | P015_Flash2/Station_Output#1 | 1 |
| `GB015_002` | Flash 2 Emergency Stop Fault Off | P015_Flash2/Station_Output#2 | 2 |
| `GB015_003` | Flash 2 Auto Stop Fault Off | P015_Flash2/Station_Output#3 | 1 |
| `GB015_004` | Flash 2 Cycle Stop Fault Off | P015_Flash2/Station_Output#4 | 1 |
| `GB015_005` | Flash 2 Fault Stopping Fault | P015_Flash2/Station_Output#5 | 1 |
| `GB015_006` | Flash 2 Notice/Warning Off | P015_Flash2/Station_Output#6 | 1 |
| `GB015_007` | Flash 1 Master Check Complete | P015_Flash2/Station_Output#7 | 0 |
| `GB015_008` | Flash 2 Auto Cond. (Home Pos. Except) | P015_Flash2/Station_Output#8 | 1 |
| `GB015_009` | Flash 2 Machine Abeyance | P015_Flash2/Station_Output#9 | 1 |
| `GB015_010` | Flash 2 Process Compl. | P015_Flash2/Station_Output#10 | 2 |
| `GB015_011` | PH Flash 2 Product Confirm. | P015_Flash2/Station_Output#11 | 8 |
| `GB015_012` | PH Flash 2 No Product Confirm. | P015_Flash2/Station_Output#12 | 13 |
| `GB015_013` | Flash 1 Send PN Complete Confirm. | P015_Flash2/Station_Output#13 | 0 |
| `GB015_014` |  | P015_Flash2/Station_Output#14 | 0 |
| `GB015_015` | Flash2 Part No Send Signal | P015_Flash2/Station_Output#15 | 1 |
| `GB015_016` | Flash 2 Process Start Signal | P015_Flash2/Station_Output#16 | 1 |
| `GB015_017` | Flash 1 WIP Take Out Confirm. Signal | P015_Flash2/Station_Output#17 | 2 |
| `GB015_018` | Flash 2 NG Remove Confirm. Signal | P015_Flash2/Station_Output#18 | 1 |
| `GB015_019` |  | P015_Flash2/Station_Output#19 | 0 |
| `GB015_020` | Flash 2 Cover is Ready to Move (Interlock Confirm.) | P015_Flash2/Station_Output#20 | 13 |
| `GB015_021` | Flash 2 Cover Home Pos. | P015_Flash2/Station_Output#21 | 23 |
| `GB015_022` | LS Cover Flash 2 Open | P015_Flash2/Station_Output#22 | 2 |
| `GB015_023` | Flash 2 Compl. Memory | P015_Flash2/Station_Output#23 | 1 |
| `GB015_024` | Flash 2 OK Compl. Memory | P015_Flash2/Station_Output#24 | 1 |
| `GB015_025` | Flash 2 NG Compl. Memory | P015_Flash2/Station_Output#25 | 0 |
| `GB200_001` | Flash 1 Disable | P200_COMM/StationOutput#1 | 0 |
| `GB200_002` | Flash 2 Disable | P200_COMM/StationOutput#2 | 0 |
| `GCT001` |  | P012_ATS3_Unit/Station_Output#36 | 1 |
| `GCT002` |  | (tidak ditulis di project ini) | 1 |
| `GCT003` |  | (tidak ditulis di project ini) | 1 |
| `GCT004` | COUNTER 4 COUNT | (tidak ditulis di project ini) | 1 |
| `GCT005` |  | (tidak ditulis di project ini) | 1 |
| `GCT006` |  | (tidak ditulis di project ini) | 1 |
| `GCT007` |  | (tidak ditulis di project ini) | 1 |
| `GCT008` |  | (tidak ditulis di project ini) | 1 |
| `GCT009` |  | (tidak ditulis di project ini) | 1 |
| `GCT010` |  | (tidak ditulis di project ini) | 1 |
| `GCT011` |  | (tidak ditulis di project ini) | 1 |
| `GCT012` |  | (tidak ditulis di project ini) | 1 |
| `GCT013` |  | (tidak ditulis di project ini) | 1 |
| `GCT014` |  | (tidak ditulis di project ini) | 1 |
| `GCT015` |  | (tidak ditulis di project ini) | 1 |
| `GSB000` | FOR MACHINE DESIGN_ALWAYS ON$tFOR MACHINE DESIGN_ALWAYS ON | P000_Main/Initial#1 | 225 |
| `GSB001` | FOR MACHINE DESIGN_ ALWAYS OFF | P000_Main/Initial#2 | 279 |
| `GSB002` | Ghani_Add Sensor Product | P000_Main/Initial#3 | 1 |
| `GSB003` | FOR MACHINE DESIGN_ | P000_Main/Initial#4 | 0 |
| `GSB004` | FOR MACHINE DESIGN_ | P000_Main/Initial#5 | 0 |
| `GSB005` | FOR MACHINE DESIGN_ SPARE4 | P000_Main/Initial#6 | 0 |
| `GSB006` | FOR MACHINE DESIGN_ | P000_Main/Initial#7 | 0 |
| `GSB007` | FOR MACHINE DESIGN_ | P000_Main/Initial#8 | 0 |
| `GSB008` | FOR MACHINE DESIGN_ | P000_Main/Initial#9 | 0 |
| `GSB009` | Modify Ghani After Moving to Line | P000_Main/Initial#10 | 164 |
| `GSB010` | FOR MACHINE ADJUST_SPARE1 | P000_Main/Initial#11 | 49 |
| `GSB011` | Ghani_Trial W/O Product | P000_Main/Initial#12 | 38 |
| `GSB020` | Add Function : Flash 1 / 2 Disable | P000_Main/Initial#14 | 24 |
| `GSB021` | Add Sequence when Flash Breakdown | P000_Main/Initial#15 | 8 |
| `GSB022` | FOR MACHINE ADJUST | P000_Main/Initial#16 | 0 |
| `GSB023` | Improvement After MassPro DNIA MCH | P000_Main/Initial#17 | 8 |
| `GSB024` | FOR MACHINE ADJUST | P000_Main/Initial#18 | 0 |
| `GSB025` | FOR MACHINE ADJUST | P000_Main/Initial#19 | 0 |
| `GSB026` | FOR MACHINE ADJUST | P000_Main/Initial#20 | 0 |
| `GSB027` | FOR MACHINE ADJUST | P000_Main/Initial#21 | 0 |
| `GSB028` | FOR MACHINE ADJUST | P000_Main/Initial#22 | 0 |
| `GSB029` | FOR MACHINE ADJUST | P000_Main/Initial#23 | 0 |
| `GSB030` | MACHINE ADJUST SPARE 1_GHANI 12/27 BYPASS MASTER ON | P000_Main/Initial#24 | 0 |
| `GSB031` | FOR MACHINE ADJUST_NG HANDLING CHANGE SQ | P000_Main/Initial#25 | 6 |
| `GSB032` | FOR MACHINE ADJUST | P000_Main/Initial#30 | 0 |
| `GSB033` | FOR MACHINE ADJUST | P000_Main/Initial#31 | 0 |
| `GSB034` | FOR MACHINE ADJUST | P000_Main/Initial#32 | 0 |
| `GSB035` | FOR MACHINE ADJUST | P000_Main/Initial#33 | 0 |
| `GSB036` | FOR MACHINE ADJUST | P000_Main/Initial#34 | 0 |
| `GSB037` | FOR MACHINE ADJUST | P000_Main/Initial#35 | 0 |
| `GSB038` | FOR MACHINE ADJUST | P000_Main/Initial#36 | 0 |
| `GSB039` | FOR MACHINE ADJUST | P000_Main/Initial#37 | 0 |
| `GSB040` | FOR MACHINE ADJUST | P000_Main/Initial#38 | 0 |
| `GSB052` | Robot Yes/No (ON with Yes) | (tidak ditulis di project ini) | 2 |
| `GTM001` | TIMER 1 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM002` | TIMER 2 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM003` | TIMER 3 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM004` | TIMER 4 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM005` | TIMER 5 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM006` | TIMER 6 COUNT | (tidak ditulis di project ini) | 1 |
| `GTM_CT` | CYCLETIMECOUNT START | P012_ATS3_Unit/Station_Output#35 | 2 |
| `GrGoodPost` |  | P012_ATS3_Unit/Auto_Running_Output#6 | 0 |
| `HOME_POS` | Machine Home Pos. | P000_Main/Station_Output#14 | 2 |
| `IND_MODE` | Individual Mode | P000_Main/Station_Output#7 | 34 |
| `IN_EC` |  | (tidak ditulis di project ini) | 1 |
| `IN_SH` |  | (tidak ditulis di project ini) | 1 |
| `IN_SN` |  | (tidak ditulis di project ini) | 1 |
| `IN_WC` |  | (tidak ditulis di project ini) | 2 |
| `IN_WR` |  | (tidak ditulis di project ini) | 2 |
| `LB000` |  | P012_ATS3_Unit/Station_Input#1, P012_ATS3_Unit/Station_Input#2 | 3 |
| `LB000[1]` |  | P002_ServoMain/Initial#17 | 3 |
| `LB000[2]` |  | P002_ServoMain/Initial#18 | 3 |
| `LB000[3]` |  | P002_ServoMain/Initial#19 | 3 |
| `LB000[4]` |  | P002_ServoMain/Initial#20 | 3 |
| `LB000[5]` |  | P002_ServoMain/Initial#21 | 3 |
| `LB000[6]` |  | P002_ServoMain/Initial#22 | 3 |
| `LB000[7]` |  | P002_ServoMain/Initial#23 | 3 |
| `LB000[8]` |  | P002_ServoMain/Initial#24 | 3 |
| `LB001` | 異常あり$tFAULT EXIST | P002_ServoMain/Initial#26, P012_ATS3_Unit/Station_Input#3 | 6 |
| `LB002` | MRC Ready toTake In Signal | P002_ServoMain/Initial#27, P012_ATS3_Unit/Station_Input#4 | 5 |
| `LB003` | MRC3 Processing | P002_ServoMain/Initial#27, P012_ATS3_Unit/Station_Input#5 | 3 |
| `LB004` | MRC3 Cover in Motion (Cover is Moving) | P002_ServoMain/Initial#28, P012_ATS3_Unit/Station_Input#6 | 10 |
| `LB005` | PH MRC Product Confirm. | P002_ServoMain/Initial#29, P012_ATS3_Unit/Station_Input#7 | 6 |
| `LB006` | LS Cover MRC Open | P002_ServoMain/Initial#30, P012_ATS3_Unit/Station_Input#8 | 14 |
| `LB007` | LS Cover MRC Close | P002_ServoMain/Initial#31, P012_ATS3_Unit/Station_Input#9 | 2 |
| `LB008` | Operation readiness confirmation$tMASTER ON CONFIRMATION | P000_Main/Fault#26, P002_ServoMain/Initial#32, P012_ATS3_Unit/Station_Input#10 | 6 |
| `LB009` | 異常ﾘｾｯﾄﾀｲﾐﾝｸﾞ | P000_Main/Fault#26, P002_ServoMain/Initial#33, (tanpa program)/LadderBody#3 | 10 |
| `LB010` | 品番未設定 | P000_Main/Fault#62, P002_ServoMain/Initial#34, P012_ATS3_Unit/Station_Input#11 | 30 |
| `LB011` | 検索品番未検出 | P000_Main/Fault#63, P012_ATS3_Unit/Station_Input#12, P014_Flash1/Station_Input#2 | 16 |
| `LB012` | Emergency Stopping All Aux 3 | P000_Main/Fault#64, P002_ServoMain/Initial#42, P012_ATS3_Unit/Station_Input#13 | 10 |
| `LB013` | Emergency Stopping All Aux 4 | P000_Main/Fault#65, P002_ServoMain/Initial#43, P012_ATS3_Unit/Station_Input#14 | 4 |
| `LB014` | Emergency Stop OFF | P000_Main/Fault#66, P002_ServoMain/Initial#44 | 7 |
| `LB015` | Auto Stopping All Aux 1 | P000_Main/Fault#67 | 2 |
| `LB016` | Auto Stopping All Aux 2 | P000_Main/Fault#68, P002_ServoMain/Initial#45 | 4 |
| `LB017` | Auto Stopping All Aux 3 | P000_Main/Fault#69, P002_ServoMain/Initial#46 | 3 |
| `LB018` | Auto Stopping All Aux 4 | P000_Main/Fault#70, P002_ServoMain/Initial#47 | 3 |
| `LB019` | Auto Stop OFF | P000_Main/Fault#71 | 2 |
| `LB020` | MD異常でない | P000_Main/Fault#72, P002_ServoMain/Initial#48, P012_ATS3_Unit/Station_Input#15 | 17 |
| `LB021` | Cycle Stopping All Aux 2 | P000_Main/Fault#73, P002_ServoMain/Initial#49, P012_ATS3_Unit/Station_Input#16 | 7 |
| `LB022` | Cycle Stopping All Aux 3 | P000_Main/Fault#74, P002_ServoMain/Initial#50, P012_ATS3_Unit/Station_Input#17 | 12 |
| `LB023` | Cycle Stopping All Aux 4 | P000_Main/Fault#75, P012_ATS3_Unit/Station_Input#18, P014_Flash1/Device_Input#7 | 5 |
| `LB024` | Cycle Stop OFF | P000_Main/Fault#76, P002_ServoMain/Initial#51, P014_Flash1/Device_Input#8 | 19 |
| `LB025` | Fault Stopping All Aux 1 | P000_Main/Fault#77, P002_ServoMain/Initial#52 | 3 |
| `LB026` | Fault Stopping All Aux 2 | P000_Main/Fault#78, P002_ServoMain/Initial#53 | 3 |
| `LB027` | Fault Stopping All Aux 3 | P000_Main/Fault#79 | 1 |
| `LB028` | Fault Stopping All Aux 4 | P000_Main/Fault#80 | 1 |
| `LB029` | Fault Stop OFF | P000_Main/Fault#81 | 1 |
| `LB030` | Warning/Notice All Aux 1 | P000_Main/Fault#82 | 1 |
| `LB030[10]` |  | P002_ServoMain/Initial#10 | 0 |
| `LB030[11]` |  | P002_ServoMain/Initial#11 | 0 |
| `LB030[12]` |  | P002_ServoMain/Initial#12 | 0 |
| `LB030[13]` |  | P002_ServoMain/Initial#13 | 0 |
| `LB030[14]` |  | P002_ServoMain/Initial#14 | 0 |
| `LB030[15]` |  | P002_ServoMain/Initial#15 | 0 |
| `LB030[1]` |  | P002_ServoMain/Initial#1 | 1 |
| `LB030[2]` |  | P002_ServoMain/Initial#2 | 1 |
| `LB030[3]` |  | P002_ServoMain/Initial#3 | 1 |
| `LB030[4]` |  | P002_ServoMain/Initial#4 | 1 |
| `LB030[5]` |  | P002_ServoMain/Initial#5 | 1 |
| `LB030[6]` |  | P002_ServoMain/Initial#6 | 1 |
| `LB030[7]` |  | P002_ServoMain/Initial#7 | 1 |
| `LB030[8]` |  | P002_ServoMain/Initial#8 | 1 |
| `LB030[9]` |  | P002_ServoMain/Initial#9 | 0 |
| `LB031` | Warning/Notice All Aux 2 | P000_Main/Fault#83 | 1 |
| `LB032` | Warning/Notice All Aux 3 | P000_Main/Fault#84 | 1 |
| `LB033` | Warning/Notice All Aux 4 | P000_Main/Fault#85 | 1 |
| `LB034` | Warning/Notice OFF | P000_Main/Fault#86 | 1 |
| `LB040[1]` |  | P002_ServoMain/Fault#2 | 1 |
| `LB040[2]` |  | P002_ServoMain/Fault#3 | 1 |
| `LB040[3]` |  | P002_ServoMain/Fault#4 | 1 |
| `LB040[4]` |  | P002_ServoMain/Fault#5 | 1 |
| `LB040[5]` |  | P002_ServoMain/Fault#6 | 1 |
| `LB040[6]` |  | P002_ServoMain/Fault#7 | 1 |
| `LB040[7]` |  | P002_ServoMain/Fault#8 | 1 |
| `LB040[8]` |  | P002_ServoMain/Fault#9 | 1 |
| `LB041` | STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY | P002_ServoMain/Fault#10 | 1 |
| `LB042` | STO NOT FAULT AUXILIARY$tSTO NOT FAULT AUXILIARY | P002_ServoMain/Fault#11 | 1 |
| `LB043` | STO NOT FAULT$tSTO NOT FAULT | P002_ServoMain/Fault#12 | 4 |
| `LB046[1]` |  | P002_ServoMain/Fault#41 | 0 |
| `LB046[2]` |  | P002_ServoMain/Fault#42 | 0 |
| `LB046[3]` |  | P002_ServoMain/Fault#43 | 0 |
| `LB046[4]` |  | P002_ServoMain/Fault#44 | 0 |
| `LB046[5]` |  | P002_ServoMain/Fault#45 | 0 |
| `LB046[6]` |  | P002_ServoMain/Fault#46 | 0 |
| `LB046[7]` |  | P002_ServoMain/Fault#47 | 0 |
| `LB046[8]` |  | P002_ServoMain/Fault#48 | 0 |
| `LB047[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB047[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB048` | AXIS ALARM  OUTPUT$tAXIS ALARM  OUTPUT | P002_ServoMain/Fault#49 | 1 |
| `LB050` | PH Workpiece Detect 1 | P011_WIP_Transfer/DeviceInput#1, P012_ATS3_Unit/Device_Input#1, P014_Flash1/Device_Input#1 | 24 |
| `LB051` | PH Workpiece Detect 2 | P002_ServoMain/Fault#50, P011_WIP_Transfer/DeviceInput#2, P012_ATS3_Unit/Device_Input#2 | 31 |
| `LB052` | Nagara Switch | P011_WIP_Transfer/DeviceInput#3 | 1 |
| `LB053` | PH Floating Check Type 1 | P002_ServoMain/Fault#51, P011_WIP_Transfer/DeviceInput#4 | 4 |
| `LB054` | PH Floating Check Type 2 | P011_WIP_Transfer/DeviceInput#5, P012_ATS3_Unit/Device_Input#3 | 2 |
| `LB055` | PX Dandori Point 2^1 | P002_ServoMain/Fault#52, P012_ATS3_Unit/Device_Input#4 | 1 |
| `LB056` | PX Dandori Point 2^2 | P002_ServoMain/Fault#53, P012_ATS3_Unit/Device_Input#5 | 1 |
| `LB057` | PH Limit Pos Left Side | P002_ServoMain/Fault#54, P012_ATS3_Unit/Device_Input#6 | 1 |
| `LB058` | PH Limit Pos Right Side | P012_ATS3_Unit/Device_Input#7 | 0 |
| `LB059` | PH MRC3 Product Confirm. | P012_ATS3_Unit/Device_Input#8 | 0 |
| `LB060` | LS Shutter FG Open | P000_Main/Fault#87, P011_WIP_Transfer/DeviceInput#6 | 11 |
| `LB060[1]` |  | P002_ServoMain/SV_Ready#2 | 1 |
| `LB060[2]` |  | P002_ServoMain/SV_Ready#7 | 1 |
| `LB060[3]` |  | P002_ServoMain/SV_Ready#9 | 1 |
| `LB060[4]` |  | P002_ServoMain/SV_Ready#11 | 1 |
| `LB060[5]` |  | P002_ServoMain/SV_Ready#13 | 1 |
| `LB060[6]` |  | P002_ServoMain/SV_Ready#15 | 1 |
| `LB060[7]` |  | P002_ServoMain/SV_Ready#17 | 1 |
| `LB060[8]` |  | P002_ServoMain/SV_Ready#19 | 1 |
| `LB061` | LS Shutter FG Close | P000_Main/Fault#88, P011_WIP_Transfer/DeviceInput#7 | 8 |
| `LB061[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB061[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB062` | FG Shutter Area Sensor | P000_Main/Fault#89, P011_WIP_Transfer/DeviceInput#8 | 7 |
| `LB062[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB062[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB063` | AS Additional Chutter FG Close | P000_Main/Fault#90, P011_WIP_Transfer/DeviceInput#9 | 6 |
| `LB064` | AS Additional Chutter FG Open | P000_Main/Fault#91, P002_ServoMain/SV_Ready#20, P011_WIP_Transfer/DeviceInput#10 | 8 |
| `LB065` | Alarm Reset (Battery Warning) | P000_Main/Fault#92, P002_ServoMain/SV_Ready#21 | 4 |
| `LB066` | ALL AXIS SERVO LOCK$tALL AXIS SERVO LOCK | P002_ServoMain/SV_Ready#22 | 2 |
| `LB069` | Buzzer | P000_Main/Fault#93 | 4 |
| `LB070` | Safety Sensor WIP Confirm. | P002_ServoMain/SV_Ready#23, P011_WIP_Transfer/DeviceInput#11, P012_ATS3_Unit/Device_Input#9 | 5 |
| `LB071` | PX Pokayoke Homing Left Arm | P002_ServoMain/SV_Ready#24, P012_ATS3_Unit/Device_Input#10 | 2 |
| `LB072` | ALL AXIS SERVO AUTO_MODE$tALL AXIS SERVO AUTO_MODE | P002_ServoMain/SV_Ready#25 | 1 |
| `LB076` | SERVO LOCK ERROR$tSERVO LOCK ERROR | P002_ServoMain/SV_Ready#26 | 1 |
| `LB077` | Preparation Off Compl. Operation | P000_Main/Master_Preparation#1 | 1 |
| `LB078` | Master Off Preparation | P000_Main/Master_Preparation#1 | 0 |
| `LB079` | Safety Area on WIP Confirmation | P011_WIP_Transfer/DeviceInput#12 | 2 |
| `LB080` | Machine Abeyance Aux 1 | P000_Main/Condition#1 | 1 |
| `LB080[1]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[2]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[3]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[4]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[5]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[6]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[7]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB080[8]` |  | P002_ServoMain/SV_Ready#27 | 1 |
| `LB081` | Machine Abeyance Aux 2 | P000_Main/Condition#2 | 1 |
| `LB082` | Machine Abeyance Aux 3 | P000_Main/Condition#3 | 1 |
| `LB084[1]` |  | P002_ServoMain/SV_Adjust#1 | 1 |
| `LB084[2]` |  | P002_ServoMain/SV_Adjust#2 | 1 |
| `LB084[3]` |  | P002_ServoMain/SV_Adjust#3 | 1 |
| `LB084[4]` |  | P002_ServoMain/SV_Adjust#4 | 1 |
| `LB084[5]` |  | P002_ServoMain/SV_Adjust#5 | 1 |
| `LB084[6]` |  | P002_ServoMain/SV_Adjust#6 | 1 |
| `LB084[7]` |  | P002_ServoMain/SV_Adjust#7 | 1 |
| `LB084[8]` |  | P002_ServoMain/SV_Adjust#8 | 1 |
| `LB085[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB085[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB086` | Machine Abeyance Aux | P000_Main/Condition#4 | 1 |
| `LB089` | Machine Abeyance | P000_Main/Condition#5 | 1 |
| `LB090` | 段取りﾃﾞｰﾀ抽出起動条件 | P000_Main/Condition#6, P002_ServoMain/SV_Adjust#9, (tanpa program)/LadderBody#10 | 4 |
| `LB091` | All Machine Home Pos Aux 2 | P000_Main/Condition#7, P002_ServoMain/SV_Adjust#10 | 2 |
| `LB092` | All Machine Home Pos Aux 3 | P000_Main/Condition#8, P002_ServoMain/SV_Adjust#11 | 3 |
| `LB096` | All Machine Home Pos Aux | P000_Main/Condition#9, P002_ServoMain/SV_Adjust#12 | 2 |
| `LB099` | WIP Transfer Unit Home Pos. | P000_Main/Condition#10, P011_WIP_Transfer/DeviceInput#13, P012_ATS3_Unit/Device_Input#11 | 18 |
| `LB100` | Assy品番検索 | P000_Main/Condition#11, P200_COMM/StationInput#15, (tanpa program)/LadderBody#11 | 7 |
| `LB1000` | Air Blow Process Start | P000_Main/Master_Preparation#5, P000_Main/Master_Preparation#5, P001_HMI/DataSearch#1 | 11 |
| `LB10000` | Flash 2 Master Check Operation Condition | P012_ATS3_Unit/Preparation#1, P014_Flash1/Preparation#12, P015_Flash2/Preparation#12 | 6 |
| `LB10001` | Flash 2 Master Check Start Cond. | P012_ATS3_Unit/Preparation#2, P014_Flash1/Preparation#13, P015_Flash2/Preparation#13 | 6 |
| `LB10005` | Flash 2 Master OK Check Start | P012_ATS3_Unit/Preparation#3, P014_Flash1/Preparation#14, P015_Flash2/Preparation#14 | 19 |
| `LB10006` | Flash 2 Master NG Check Start | P012_ATS3_Unit/Preparation#4, P014_Flash1/Preparation#15, P015_Flash2/Preparation#15 | 19 |
| `LB1001` | Air Blow FG Take Out Compl. Memory | P000_Main/Master_Preparation#6, P001_HMI/DataSearch#2, P011_WIP_Transfer/StationInput#2 | 14 |
| `LB10010` | Flash 2 Master Check Start | P012_ATS3_Unit/Preparation#5, P014_Flash1/Preparation#16, P015_Flash2/Preparation#16 | 23 |
| `LB10010A` | Flash 2 Writing Motion Start | P014_Flash1/Preparation#17, P015_Flash2/Preparation#17 | 8 |
| `LB10011` | Flash 2 Req Part No Confirm. | P012_ATS3_Unit/Preparation#6, P014_Flash1/Preparation#18, P015_Flash2/Preparation#18 | 6 |
| `LB10012` | Send Part No to Flash 2 Start | P012_ATS3_Unit/Preparation#6, P014_Flash1/Preparation#18, P015_Flash2/Preparation#18 | 10 |
| `LB10013` | Send Part No to Flash 2 Compl. | P012_ATS3_Unit/Preparation#7, P014_Flash1/Preparation#18, P015_Flash2/Preparation#18 | 10 |
| `LB10014` | MRC Master OK Check Compl. | P012_ATS3_Unit/Preparation#7 | 3 |
| `LB10015` | Flash 2 Writing  Starting | P012_ATS3_Unit/Preparation#7, P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 7 |
| `LB10016` | Flash 2 Cover Close Motion Start | P012_ATS3_Unit/Preparation#7, P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 7 |
| `LB10017` | Flash 2 Cover Close Motion Confirm. | P012_ATS3_Unit/Preparation#7, P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 9 |
| `LB10018` | Flash 2 Writing Start | P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 6 |
| `LB10019` | Flash 2 is Writing | P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 6 |
| `LB1002` | PH Air Blow Product Confirm. | P011_WIP_Transfer/StationInput#3, P012_ATS3_Unit/Auto_Running_Output#13 | 4 |
| `LB10020` | Flash 2 OK Compl. | P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 13 |
| `LB10021` | Flash 2 NG Compl. | P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 13 |
| `LB10024` | Flash 2 Writing Complete | P014_Flash1/Preparation#19, P015_Flash2/Preparation#19 | 4 |
| `LB10025` | OK Workpiece Take Out Procedure | P014_Flash1/Preparation#20, P015_Flash2/Preparation#20 | 6 |
| `LB10026` | NG Workpiece Take Out Procedure | P014_Flash1/Preparation#20, P015_Flash2/Preparation#20 | 6 |
| `LB1003` | Air Blow Finish Process Memory | P011_WIP_Transfer/StationInput#4, P012_ATS3_Unit/Auto_Running_Output#13 | 5 |
| `LB10030` | Flash 2 Send NG Reset Signal Start | P014_Flash1/Preparation#21, P015_Flash2/Preparation#21 | 6 |
| `LB10031` | Flash 2 Seng NG Reset Signal Confirm. | P014_Flash1/Preparation#21, P015_Flash2/Preparation#21 | 6 |
| `LB10032` | Auto Continue : Flash 2 Cover Open | P014_Flash1/Preparation#22, P015_Flash2/Preparation#22 | 4 |
| `LB10033` | Flash 2 Cover Open Motion Start | P014_Flash1/Preparation#23, P015_Flash2/Preparation#23 | 2 |
| `LB10034` | Flash 2 Cover Open Motion Confirm. | P014_Flash1/Preparation#23, P015_Flash2/Preparation#23 | 6 |
| `LB10035` | Flash 2 : Send WP Take Out Signal | P014_Flash1/Preparation#24, P015_Flash2/Preparation#24 | 6 |
| `LB10036` | Flash 2 : Send WP Take Out Signal Confirm. | P014_Flash1/Preparation#24, P015_Flash2/Preparation#24 | 10 |
| `LB10049` | Flash Writing 2 Motion Compl. | P012_ATS3_Unit/Preparation#8, P014_Flash1/Preparation#25, P015_Flash2/Preparation#25 | 9 |
| `LB1005` | MTC Operation : Bypass Safety Sensor | P000_Main/Master_Preparation#7, P000_Main/Master_Preparation#7 | 2 |
| `LB1006` | Bypass Safety Sensor | P000_Main/Master_Preparation#8 | 6 |
| `LB1007` | Air Blow MC Ready | P011_WIP_Transfer/StationInput#5 | 2 |
| `LB100[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB100[LD010]` |  | P002_ServoMain/SV_Adjust#14 | 0 |
| `LB101` | 品番検索開始(開始位置0) | P000_Main/Condition#12, P011_WIP_Transfer/HMI_Input#1, P012_ATS3_Unit/HMI_Input#1 | 9 |
| `LB1010` | Running Abilcore Type | P000_Main/Master_Preparation#9, P000_Main/Master_Preparation#10, P001_HMI/DataSearch#6 | 22 |
| `LB1010A` | Flash 2 Dandori Signal | P014_Flash1/Auto_Running#20, P014_Flash1/Auto_Running#21, P015_Flash2/Auto_Running#20 | 10 |
| `LB1011` | Running GD1B Type | P000_Main/Master_Preparation#9, P000_Main/Master_Preparation#10, P001_HMI/DataSearch#7 | 19 |
| `LB1011B` | Data Storage Save | P003_ServoIAI/TableData_WIPUnit#6 | 2 |
| `LB1012` | Teaching Mode ON/OFF | P000_Main/Master_Preparation#11, P000_Main/Master_Preparation#11, P001_HMI/DataSearch#8 | 21 |
| `LB1013` | Teaching Mode | P000_Main/Master_Preparation#12, P001_HMI/DataSearch#9, P012_ATS3_Unit/ATS3_PP#23 | 21 |
| `LB1014` | Warning : Air Blow Double Process | P000_Main/Master_Preparation#14, P000_Main/Master_Preparation#14, P001_HMI/DataSearch#10 | 19 |
| `LB1015` | Warning : Forget to NAGARA | P000_Main/Master_Preparation#15, P001_HMI/DataSearch#11, P011_WIP_Transfer/StationInput#7 | 23 |
| `LB1016` | Flash 2 Disable/Enable | P000_Main/Master_Preparation#17, P000_Main/Master_Preparation#17, P000_Main/Master_Preparation#18 | 22 |
| `LB1017` | Flash 2 Disable | P000_Main/Master_Preparation#19, P001_HMI/DataSearch#13, P012_ATS3_Unit/ATS3_PP#26 | 20 |
| `LB1018` | Bypass Airblow Enable/Disable | P000_Main/Master_Preparation#21, P000_Main/Master_Preparation#21, P001_HMI/DataSearch#14 | 10 |
| `LB1019` | Bypass Air Blow | P000_Main/Master_Preparation#22, P001_HMI/DataSearch#15 | 5 |
| `LB101[LD010]` |  | P002_ServoMain/SV_Adjust#14 | 0 |
| `LB102` | 品番途中検索開始(開始位置0以外) | P000_Main/Condition#13, P011_WIP_Transfer/HMI_Input#2, P012_ATS3_Unit/HMI_Input#2 | 8 |
| `LB1020` | Enable/Disable Hold & Release Chutter FG for Box Changing | P000_Main/Master_Preparation#24, P000_Main/Master_Preparation#24, P012_ATS3_Unit/ATS3_PP#27 | 11 |
| `LB1021` | Hold & Release Chutter FG for Box Changing | P000_Main/Master_Preparation#25, P001_HMI/DataSearch#18, P012_ATS3_Unit/ATS3_PP#25 | 15 |
| `LB1022` | Enable/Disable Master Check Mode | P000_Main/Master_Preparation#28, P000_Main/Master_Preparation#29, P001_HMI/DataSearch#16 | 11 |
| `LB1022A` | All Master Check Compl. | P000_Main/Master_Preparation#27 | 1 |
| `LB1023` | Master Check Mode | P000_Main/Master_Preparation#30, P014_Flash1/Auto_Running#24, P015_Flash2/Auto_Running#24 | 7 |
| `LB1024` | Enable/Disable Bypass Judgment MRC | P000_Main/Master_Preparation#32, P000_Main/Master_Preparation#32 | 1 |
| `LB1025` | Bypass Judgment MRC | P000_Main/Master_Preparation#33, P014_Flash1/Auto_Running#25, P015_Flash2/Auto_Running#25 | 7 |
| `LB1026` | Flash 2 WIP Remove Start | P014_Flash1/Auto_Running#25, P015_Flash2/Auto_Running#25 | 4 |
| `LB1027` | Flash 2 WIP Remove Confirm. | P014_Flash1/Auto_Running#25, P015_Flash2/Auto_Running#25 | 4 |
| `LB1028` | Product Take Out Confirm. | P014_Flash1/Auto_Running#26, P015_Flash2/Auto_Running#26 | 6 |
| `LB1029` | Flash 2 Writing Motion Complete | P014_Flash1/Auto_Running#27, P015_Flash2/Auto_Running#27 | 2 |
| `LB103` | 品番設定ﾁｪｯｸOK | P011_WIP_Transfer/HMI_Input#3, P012_ATS3_Unit/HMI_Input#3, P014_Flash1/HMI_Input#3 | 17 |
| `LB104` | 品番設定ﾁｪｯｸNG | P011_WIP_Transfer/HMI_Input#4, P012_ATS3_Unit/HMI_Input#4, P014_Flash1/HMI_Input#4 | 7 |
| `LB1049` | Right Arm Take In Operation Complete | P012_ATS3_Unit/ATS3_PP#28 | 2 |
| `LB104[1]` |  | P002_ServoMain/SV_Adjust#15 | 1 |
| `LB104[2]` |  | P002_ServoMain/SV_Adjust#16 | 1 |
| `LB104[3]` |  | P002_ServoMain/SV_Adjust#17 | 1 |
| `LB104[4]` |  | P002_ServoMain/SV_Adjust#18 | 1 |
| `LB104[5]` |  | P002_ServoMain/SV_Adjust#19 | 1 |
| `LB104[6]` |  | P002_ServoMain/SV_Adjust#20 | 1 |
| `LB104[7]` |  | P002_ServoMain/SV_Adjust#21 | 1 |
| `LB104[8]` |  | P002_ServoMain/SV_Adjust#22 | 1 |
| `LB105` | Ind Spare | P011_WIP_Transfer/HMI_Input#5, P012_ATS3_Unit/HMI_Input#5, P014_Flash1/HMI_Input#5 | 7 |
| `LB105[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB105[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB106` | Ind Spare | P000_Main/Condition#14, P011_WIP_Transfer/HMI_Input#6, P012_ATS3_Unit/HMI_Input#6 | 1 |
| `LB1060` | Right Arm Take Out Operation Starting | P012_ATS3_Unit/ATS3_PP#29 | 1 |
| `LB1061` | Right Arm Moving Down Start Operation | P012_ATS3_Unit/ATS3_PP#30 | 2 |
| `LB1062` | Right Arm Moving Down Complete | P012_ATS3_Unit/ATS3_PP#30 | 3 |
| `LB1063` | Auto Continue : Right Arm Chuck | P012_ATS3_Unit/ATS3_PP#31 | 1 |
| `LB1064` | Right Arm Chuck Start Operation' | P012_ATS3_Unit/ATS3_PP#32 | 2 |
| `LB1065` | Right Arm Chuck Complete | P012_ATS3_Unit/ATS3_PP#32 | 5 |
| `LB1066` | Right Arm Chuck Normal Confirm. | P012_ATS3_Unit/ATS3_PP#34 | 4 |
| `LB1067` | Right Arm Chcuck Abnormal | P012_ATS3_Unit/ATS3_PP#34 | 2 |
| `LB107` | Ind Spare | P011_WIP_Transfer/HMI_Input#7, P012_ATS3_Unit/HMI_Input#7, P014_Flash1/HMI_Input#7 | 7 |
| `LB1070` | Right Arm Chuck Normal | P012_ATS3_Unit/ATS3_PP#35 | 1 |
| `LB1071` | Right Arm Moving UP Start Operation | P012_ATS3_Unit/ATS3_PP#33 | 2 |
| `LB1072` | Right Arm Moving Up Complete | P012_ATS3_Unit/ATS3_PP#33 | 3 |
| `LB108` | Ind Spare | P002_ServoMain/SV_Adjust#23, P011_WIP_Transfer/HMI_Input#8, P012_ATS3_Unit/HMI_Input#8 | 2 |
| `LB109` | Ind Spare | P000_Main/Condition#15, P002_ServoMain/SV_Adjust#24, P011_WIP_Transfer/HMI_Input#9 | 9 |
| `LB1099` | Right Arm Take Out Operation Complete | P012_ATS3_Unit/ATS3_PP#36 | 1 |
| `LB110` | 検索品番有 | P000_Main/Auto_Main_Loop#1, P011_WIP_Transfer/HMI_Input#10, P012_ATS3_Unit/HMI_Input#10 | 2 |
| `LB111` | 品番検索完了 | P012_ATS3_Unit/HMI_Input#11, P014_Flash1/HMI_Input#11, P015_Flash2/HMI_Input#11 | 8 |
| `LB112` | 検索品番無 | P012_ATS3_Unit/HMI_Input#12, P014_Flash1/HMI_Input#12, P015_Flash2/HMI_Input#12 | 3 |
| `LB113` |  | P012_ATS3_Unit/HMI_Input#13, P014_Flash1/HMI_Input#13, P015_Flash2/HMI_Input#13 | 5 |
| `LB114` |  | P002_ServoMain/SV_Adjust#26, P012_ATS3_Unit/HMI_Input#14, P014_Flash1/HMI_Input#14 | 8 |
| `LB115` | 検索品番有 | P012_ATS3_Unit/HMI_Input#15, P014_Flash1/HMI_Input#15, P015_Flash2/HMI_Input#15 | 6 |
| `LB1154` | ASSY PARTS NUMBER EXTRACT NORMAL END | P001_HMI/DataSearch#5 | 13 |
| `LB1155` | ASSY PARTS NUMBER EXTRACT END (NO REGISTER) | P001_HMI/DataSearch#5 | 3 |
| `LB116` |  | P012_ATS3_Unit/HMI_Input#16, P014_Flash1/HMI_Input#16, P015_Flash2/HMI_Input#16 | 0 |
| `LB116[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB116[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB117` |  | P012_ATS3_Unit/HMI_Input#17, P014_Flash1/HMI_Input#17, P015_Flash2/HMI_Input#17 | 5 |
| `LB117[1]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[2]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[3]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[4]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[5]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[6]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[7]` |  | (tidak ditulis di project ini) | 1 |
| `LB117[8]` |  | (tidak ditulis di project ini) | 1 |
| `LB118` |  | P012_ATS3_Unit/HMI_Input#18, P014_Flash1/HMI_Input#18, P015_Flash2/HMI_Input#18 | 0 |
| `LB118[1]` |  | P002_ServoMain/SV_Adjust#27 | 1 |
| `LB118[2]` |  | P002_ServoMain/SV_Adjust#28 | 1 |
| `LB118[3]` |  | P002_ServoMain/SV_Adjust#29 | 1 |
| `LB118[4]` |  | P002_ServoMain/SV_Adjust#30 | 1 |
| `LB118[5]` |  | P002_ServoMain/SV_Adjust#31 | 1 |
| `LB118[6]` |  | P002_ServoMain/SV_Adjust#32 | 1 |
| `LB118[7]` |  | P002_ServoMain/SV_Adjust#33 | 1 |
| `LB118[8]` |  | P002_ServoMain/SV_Adjust#34 | 1 |
| `LB119` | Auto Running Condition | P000_Main/Auto_Main_Loop#2, P012_ATS3_Unit/HMI_Input#19 | 6 |
| `LB120` | 検索品番有 | P000_Main/Auto_Main_Loop#3, P002_ServoMain/SV_Adjust#35, P012_ATS3_Unit/HMI_Input#20 | 8 |
| `LB1200` | X Axis Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#16 | 2 |
| `LB1200A` | X Axis Pos 11 [Reserve Pos.] Moving Start | P012_ATS3_Unit/Auto_Running_Output#22 | 1 |
| `LB1201` | X Axis Pos 2 [MRC3 Take In] Moving Start | P012_ATS3_Unit/Auto_Running_Output#17 | 3 |
| `LB1201A` | X Axis Pos 12 [MRC3 Take Out] Moving Start | P012_ATS3_Unit/Auto_Running_Output#23 | 3 |
| `LB1202` | X Axis Pos 3 [Flash 1 Take Out] Moving Start | P012_ATS3_Unit/Auto_Running_Output#18 | 6 |
| `LB1202A` | X Axis Pos 13 [Flash 1 Take In] Moving Start | P012_ATS3_Unit/Auto_Running_Output#24 | 8 |
| `LB1203` | X Axis Pos 4 [Flash 2 Take Out] Moving Start | P012_ATS3_Unit/Auto_Running_Output#19 | 8 |
| `LB1203A` | X Axis Pos 14 [Flash 2 Take In] Moving Start | P012_ATS3_Unit/Auto_Running_Output#25 | 6 |
| `LB1204` | X Axis Pos 5 [WIP Take In] Moving Start | P012_ATS3_Unit/Auto_Running_Output#20 | 4 |
| `LB1205` | X Axis Pos 6 Moving Start | (tidak ditulis di project ini) | 1 |
| `LB1209` | X Axis Pos 10 [WIP Take Out] Moving Start | P012_ATS3_Unit/Auto_Running_Output#21 | 12 |
| `LB121` | 品番検索完了 | P000_Main/Auto_Main_Loop#4, P002_ServoMain/SV_Adjust#36, (tanpa program)/LadderBody#20 | 8 |
| `LB1210` | Left PP Y Axis Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#26 | 2 |
| `LB1211` | Left PP Y Axis Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#27 | 7 |
| `LB1212` | Left PP Y Axis Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#28 | 2 |
| `LB1213` | Left PP Y Axis Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#29 | 2 |
| `LB1214` | Left PP Y Axis Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#30 | 7 |
| `LB1215` | Left PP Z Axis Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#31 | 2 |
| `LB1216` | Left PP Z Axis Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#32 | 4 |
| `LB1217` | Left PP Z Axis Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#33 | 2 |
| `LB1218` | Left PP Z Axis Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#34 | 2 |
| `LB1219` | Left PP Z Axis Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#35 | 4 |
| `LB122` | 検索品番再開始 | P002_ServoMain/SV_Adjust#37, (tanpa program)/LadderBody#20 | 3 |
| `LB1220` | Left PP Rotate Unit Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#36 | 3 |
| `LB1221` | Left PP Rotate Unit Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#37 | 7 |
| `LB1222` | Left PP Rotate Unit Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#38 | 2 |
| `LB1223` | Left PP Rotate Unit Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#39 | 2 |
| `LB1224` | Left PP Rotate Unit Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#40 | 6 |
| `LB1224A` | Left Rotary Zero Position Start | P012_ATS3_Unit/Auto_Running_Output#41 | 2 |
| `LB1225` | Left PP Chuck Unit Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#42 | 2 |
| `LB1226` | Left PP Chuck Unit Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#43 | 3 |
| `LB1227` | Left PP Chuck Unit Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#44 | 2 |
| `LB1228` | Left PP Chuck Unit Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#45 | 2 |
| `LB1229` | Left PP Chuck Unit Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#46 | 3 |
| `LB123` | 品番検索完了 | (tanpa program)/LadderBody#22 | 3 |
| `LB1230` | Right PP Y Axis Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#47 | 2 |
| `LB1231` | Right PP Y Axis Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#48 | 7 |
| `LB1232` | Right PP Y Axis Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#49 | 2 |
| `LB1233` | Right PP Y Axis Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#50 | 2 |
| `LB1234` | Right PP Y Axis Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#51 | 8 |
| `LB1235` | Right PP Z Axis Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#52 | 2 |
| `LB1236` | Right PP Z Axis Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#53 | 5 |
| `LB1237` | Right PP Z Axis Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#54 | 2 |
| `LB1238` | Right PP Z Axis Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#55 | 2 |
| `LB1239` | Right PP Z Axis Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#56 | 4 |
| `LB124` | 検索品番無 | (tanpa program)/LadderBody#22 | 3 |
| `LB1240` | Right PP Rotate Unit Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#57 | 2 |
| `LB1241` | Right PP Rotate Unit Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#58 | 7 |
| `LB1242` | Right PP Rotate Unit Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#59 | 2 |
| `LB1243` | Right PP Rotate Unit Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#60 | 2 |
| `LB1244` | Right PP Rotate Unit Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#61 | 7 |
| `LB1244A` | Right Rotary Zero Position Start | P012_ATS3_Unit/Auto_Running_Output#62 | 2 |
| `LB1245` | Right PP Chuck Unit Pos 1 Moving Start | P012_ATS3_Unit/Auto_Running_Output#63 | 2 |
| `LB1246` | Right PP Chuck Unit Pos 2 Moving Start | P012_ATS3_Unit/Auto_Running_Output#64 | 3 |
| `LB1247` | Right PP Chuck Unit Pos 3 Moving Start | P012_ATS3_Unit/Auto_Running_Output#65 | 2 |
| `LB1248` | Right PP Chuck Unit Pos 4 Moving Start | P012_ATS3_Unit/Auto_Running_Output#66 | 2 |
| `LB1249` | Right PP Chuck Unit Pos 5 Moving Start | P012_ATS3_Unit/Auto_Running_Output#67 | 3 |
| `LB1250` | SM1 X Axis Moving Start | P012_ATS3_Unit/Auto_Running_Output#68 | 7 |
| `LB1251` | SM9 Left Y Axis Moving Start | P012_ATS3_Unit/Auto_Running_Output#69 | 11 |
| `LB1252` | SM7 Left Z Axis Moving Start | P012_ATS3_Unit/Auto_Running_Output#70 | 7 |
| `LB1253` | SM3 Left Rotate Unit Moving Start | P012_ATS3_Unit/Auto_Running_Output#71 | 11 |
| `LB1254` | SM5 Left Gripper Moving Start | P012_ATS3_Unit/Auto_Running_Output#72 | 5 |
| `LB1256` | SM8 Right Y Axis Moving Start | P012_ATS3_Unit/Auto_Running_Output#73 | 11 |
| `LB1257` | SM6 Right Z Axis Moving Start | P012_ATS3_Unit/Auto_Running_Output#74 | 7 |
| `LB1258` | SM2 Right Rotate Unit Moving Start | P012_ATS3_Unit/Auto_Running_Output#75 | 11 |
| `LB1259` | SM4 Right Gripper Moving Start | P012_ATS3_Unit/Auto_Running_Output#76 | 5 |
| `LB126[10]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[11]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[12]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[13]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[14]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[15]` |  | (tidak ditulis di project ini) | 1 |
| `LB126[1]` |  | P002_ServoMain/SV_Adjust#38 | 5 |
| `LB126[2]` |  | P002_ServoMain/SV_Adjust#41 | 5 |
| `LB126[3]` |  | P002_ServoMain/SV_Adjust#44 | 5 |
| `LB126[4]` |  | P002_ServoMain/SV_Adjust#47 | 5 |
| `LB126[5]` |  | P002_ServoMain/SV_Adjust#50 | 5 |
| `LB126[6]` |  | P002_ServoMain/SV_Adjust#53 | 5 |
| `LB126[7]` |  | P002_ServoMain/SV_Adjust#56 | 5 |
| `LB126[8]` |  | P002_ServoMain/SV_Adjust#59 | 5 |
| `LB126[9]` |  | (tidak ditulis di project ini) | 1 |
| `LB127[1]` |  | P002_ServoMain/SV_Adjust#39 | 2 |
| `LB127[2]` |  | P002_ServoMain/SV_Adjust#42 | 2 |
| `LB127[3]` |  | P002_ServoMain/SV_Adjust#45 | 2 |
| `LB127[4]` |  | P002_ServoMain/SV_Adjust#48 | 2 |
| `LB127[5]` |  | P002_ServoMain/SV_Adjust#51 | 2 |
| `LB127[6]` |  | P002_ServoMain/SV_Adjust#54 | 2 |
| `LB127[7]` |  | P002_ServoMain/SV_Adjust#57 | 2 |
| `LB127[8]` |  | P002_ServoMain/SV_Adjust#60 | 2 |
| `LB128[1]` |  | P002_ServoMain/SV_Adjust#40 | 2 |
| `LB128[2]` |  | P002_ServoMain/SV_Adjust#43 | 2 |
| `LB128[3]` |  | P002_ServoMain/SV_Adjust#46 | 2 |
| `LB128[4]` |  | P002_ServoMain/SV_Adjust#49 | 2 |
| `LB128[5]` |  | P002_ServoMain/SV_Adjust#52 | 2 |
| `LB128[6]` |  | P002_ServoMain/SV_Adjust#55 | 2 |
| `LB128[7]` |  | P002_ServoMain/SV_Adjust#58 | 2 |
| `LB128[8]` |  | P002_ServoMain/SV_Adjust#61 | 2 |
| `LB130` | Assy品番抽出正常終了 | P002_ServoMain/SV_Adjust#62, P011_WIP_Transfer/HMI_Input#11, (tanpa program)/LadderBody#23 | 7 |
| `LB1300` | Auto : ATS Moving Interlock Request. | P012_ATS3_Unit/Auto_Running_Output#77 | 15 |
| `LB1301` | SM3 L Rotary Axis Pos 1 Move Cond. | P012_ATS3_Unit/Individual#66 | 1 |
| `LB1302` | Ind. Move SM3 L Rotary Pos. 1 | P012_ATS3_Unit/Individual#67 | 4 |
| `LB1303` | SM3 L Rotary Axis Pos 2 Move Cond. | P012_ATS3_Unit/Individual#68 | 1 |
| `LB1304` | Ind. Move SM3 L Rotary Pos. 2 | P012_ATS3_Unit/Individual#69 | 3 |
| `LB1305` | SM3 L Rotary Axis Pos 3 Move Cond. | P012_ATS3_Unit/Individual#70 | 1 |
| `LB1306` | Ind. Move SM3 L Rotary Pos. 3 | P012_ATS3_Unit/Individual#71 | 4 |
| `LB1307` | SM3 L Rotary Axis Pos 4 Move Cond. | P012_ATS3_Unit/Individual#72 | 1 |
| `LB1308` | Ind. Move SM3 L Rotary Pos. 4 | P012_ATS3_Unit/Individual#73 | 4 |
| `LB1309` | SM3 L Rotary Axis Pos 5 Move Cond. | P012_ATS3_Unit/Individual#74 | 1 |
| `LB131` | Assy品番抽出異常終了 | P002_ServoMain/SV_Adjust#63, P011_WIP_Transfer/HMI_Input#12, (tanpa program)/LadderBody#23 | 6 |
| `LB1310` | Ind. Move SM3 L Rotary Pos. 5 | P012_ATS3_Unit/Individual#75 | 4 |
| `LB1311` | SM5 L Gripper Pos 1 Move Cond. | P012_ATS3_Unit/Individual#76 | 1 |
| `LB1312` | Ind. Move SM5 L Gripper Pos. 1 | P012_ATS3_Unit/Individual#77 | 4 |
| `LB1313` | SM5 L Gripper Pos 2 Move Cond. | P012_ATS3_Unit/Individual#78 | 1 |
| `LB1314` | Ind. Move SM5 L Gripper Pos. 2 | P012_ATS3_Unit/Individual#79 | 3 |
| `LB1315` | SM5 L Gripper Pos 3 Move Cond. | P012_ATS3_Unit/Individual#80 | 1 |
| `LB1316` | Ind. Move SM5 L Gripper Pos. 3 | P012_ATS3_Unit/Individual#81 | 4 |
| `LB1317` | SM5 L Gripper Pos 4 Move Cond. | P012_ATS3_Unit/Individual#82 | 1 |
| `LB1318` | Ind. Move SM5 L Gripper Pos. 4 | P012_ATS3_Unit/Individual#83 | 4 |
| `LB1319` | SM5 L Gripper Pos 5 Move Cond. | P012_ATS3_Unit/Individual#84 | 1 |
| `LB132` | PB Ind. Add Chutter FG Open | P011_WIP_Transfer/HMI_Input#13 | 1 |
| `LB1320` | Ind. Move SM5 L Gripper Pos. 5 | P012_ATS3_Unit/Individual#85 | 3 |
| `LB1321` | SM7 L Z Axis Pos 1 Move Cond. | P012_ATS3_Unit/Individual#86 | 1 |
| `LB1322` | Ind. Move SM7 L Z Axis Pos. 1 | P012_ATS3_Unit/Individual#87 | 4 |
| `LB1323` | SM7 L Z Axis Pos 2 Move Cond. | P012_ATS3_Unit/Individual#88 | 1 |
| `LB1324` | Ind. Move SM7 L Z Axis Pos. 2 | P012_ATS3_Unit/Individual#89 | 3 |
| `LB1325` | SM7 L Z Axis Pos 3 Move Cond. | P012_ATS3_Unit/Individual#90 | 1 |
| `LB1326` | Ind. Move SM7 L Z Axis Pos. 3 | P012_ATS3_Unit/Individual#91 | 4 |
| `LB1327` | SM7 L Z Axis Pos 4 Move Cond. | P012_ATS3_Unit/Individual#92 | 1 |
| `LB1328` | Ind. Move SM7 L Z Axis Pos. 4 | P012_ATS3_Unit/Individual#93 | 4 |
| `LB1329` | SM7 L Z Axis Pos 5 Move Cond. | P012_ATS3_Unit/Individual#94 | 1 |
| `LB133` | PB Ind. Add Shutter FG Cover Close | P011_WIP_Transfer/HMI_Input#14 | 1 |
| `LB1330` | Ind. Move SM7 L Z Axis Pos. 5 | P012_ATS3_Unit/Individual#95 | 3 |
| `LB1331` | SM9 L Y Axis Pos 1 Move Cond. | P012_ATS3_Unit/Individual#96 | 1 |
| `LB1332` | Ind. Move SM9 L Y Axis Pos. 1 | P012_ATS3_Unit/Individual#97 | 4 |
| `LB1333` | SM9 L Y Axis Pos 2 Move Cond. | P012_ATS3_Unit/Individual#98 | 1 |
| `LB1334` | Ind. Move SM9 L Y Axis Pos. 2 | P012_ATS3_Unit/Individual#99 | 3 |
| `LB1335` | SM9 L Y Axis Pos 3 Move Cond. | P012_ATS3_Unit/Individual#100 | 1 |
| `LB1336` | Ind. Move SM9 L Y Axis Pos. 3 | P012_ATS3_Unit/Individual#101 | 4 |
| `LB1337` | SM9 L Y Axis Pos 4 Move Cond. | P012_ATS3_Unit/Individual#102 | 1 |
| `LB1338` | Ind. Move SM9 L Y Axis Pos. 4 | P012_ATS3_Unit/Individual#103 | 4 |
| `LB1339` | SM9 L Y Axis Pos 5 Move Cond. | P012_ATS3_Unit/Individual#104 | 1 |
| `LB1340` | Ind. Move SM9 L Y Axis Pos. 5 | P012_ATS3_Unit/Individual#105 | 3 |
| `LB135` | Assy品番検索終了 | (tanpa program)/LadderBody#24 | 1 |
| `LB136` | ASSY PARTS NUMBER CHANGE(GROUP COMPANY CODE) | P001_HMI/DataSetup#9 | 1 |
| `LB137` | ASSY PARTS NUMBER CHANGE(ASSY HIGH RANK 6 DIGIT) | P001_HMI/DataSetup#10 | 1 |
| `LB140` | SET-UP DATA EDIT PERMISSION | P001_HMI/DataSetup#3, P002_ServoMain/SV_Adjust#65 | 3 |
| `LB141` | SET-UP DATA EDIT PB OFF CONFIRMATION | P001_HMI/DataSetup#4 | 2 |
| `LB142` | SET-UP DATA EDIT PERMISSION OFF | P001_HMI/DataSetup#5, P002_ServoMain/SV_Adjust#68 | 13 |
| `LB144` | COORDINATE ・ SPEED  WRITE START | P002_ServoMain/SV_Adjust#69 | 13 |
| `LB145` | SET-UP DATA DELETE PERMISSION | P001_HMI/DataSetup#6 | 2 |
| `LB146` | SET-UP DATA DELETE  PB OFF CONFIRMATION | P001_HMI/DataSetup#7, P002_ServoMain/SV_Adjust#82 | 3 |
| `LB147` | SET-UP DATA DELETE PERMISSION | P001_HMI/DataSetup#8 | 2 |
| `LB150` | PH Workpiece 1 Confirm [Abilcore] | P001_HMI/DataSetup#12, P011_WIP_Transfer/Timers#1, P012_ATS3_Unit/Timers#1 | 23 |
| `LB1500` | Jig Dandori Request to MRC | P012_ATS3_Unit/Preparation#9, P012_ATS3_Unit/Preparation#10 | 4 |
| `LB151` | PH Workpiece 1 OFF Confirm [Abilcore] | P011_WIP_Transfer/Timers#2, P012_ATS3_Unit/Timers#2, P014_Flash1/Timers#2 | 38 |
| `LB1510` | Dandori Part No Signal | P012_ATS3_Unit/Preparation#14, P012_ATS3_Unit/Preparation#15 | 4 |
| `LB152` | PH Workpiece 2 Confirm. [GD1B] | P011_WIP_Transfer/Timers#3, P012_ATS3_Unit/Timers#3 | 8 |
| `LB153` | PH Workpiece 2 OFF Confirm. [GD1B] | P011_WIP_Transfer/Timers#4, P012_ATS3_Unit/Timers#4 | 7 |
| `LB154` | PH Tipe 1 Floating Confirm. [Abilcore] | P001_HMI/DataSetup#15, P011_WIP_Transfer/Timers#5 | 6 |
| `LB155` | PH Tipe 1 No Floating Confirm. [Abilcore] | P001_HMI/DataSetup#15, P011_WIP_Transfer/Timers#6 | 4 |
| `LB1551` | SM10 Moving Point 1 [FWD Pos] Running | (tidak ditulis di project ini) | 14 |
| `LB1552` | SM10 Moving Point 1 [FWD Pos] Ready | (tidak ditulis di project ini) | 14 |
| `LB156` | PH Tipe 2 Floating Confirm. [GD1B] | P011_WIP_Transfer/Timers#7 | 2 |
| `LB157` | PH Tipe 2 No Floating Confirm. [GD1B] | P011_WIP_Transfer/Timers#8 | 1 |
| `LB158` | FG Shutter Area Sensor ON Confirm. | P011_WIP_Transfer/Timers#9 | 1 |
| `LB159` | FG Shutter Area Sensor OFF Confirm. | P011_WIP_Transfer/Timers#10 | 1 |
| `LB160` | ASSY PARTS NUMBER NON-REGISTERED TOP SEARCH | P001_HMI/DataSetup#17 | 3 |
| `LB164` | ASSY PARTS NUMBER NON-REGISTERED SEARCH  NORMAL  END | P001_HMI/DataSetup#20 | 4 |
| `LB165` | ASSY PARTS NUMBER NON-REGISTERED SEARCH  COMPLETE(NO REGISTER) | P001_HMI/DataSetup#20 | 3 |
| `LB170` | SET-UP DATA1-4_OK | P001_HMI/DataSetup#22 | 1 |
| `LB171` | SET-UP DATA5-8_OK | P001_HMI/DataSetup#23 | 1 |
| `LB172` | SET-UP DATA9-12_OK | P001_HMI/DataSetup#24 | 1 |
| `LB173` | SET-UP DATA13-15_OK | P001_HMI/DataSetup#25 | 1 |
| `LB175` | SET-UP DATA UPPER AND LOWER LIMITS RANGE OK(WRITE OK) | P001_HMI/DataSetup#38 | 1 |
| `LB176` | SET-UP DATA16-19_OK | P001_HMI/DataSetup#26 | 1 |
| `LB177` | SET-UP DATA20-23_OK | P001_HMI/DataSetup#27 | 1 |
| `LB178` | SET-UP DATA24-27_OK | P001_HMI/DataSetup#28 | 1 |
| `LB179` | SET-UP DATA28-30_OK | P001_HMI/DataSetup#29 | 1 |
| `LB180` | SET-UP DATA AFTER EDIT  WRITE (EDIT REGIST) | P001_HMI/DataSetup#39 | 2 |
| `LB181` | SET-UP DATA AFTER EDIT  WRITE (NEW REGIST) | P001_HMI/DataSetup#39 | 2 |
| `LB182` | SET-UP DATA DELETE  WRITE EXECUTE | P001_HMI/DataSetup#42 | 8 |
| `LB183` | SET-UP DATA DELETE  COMPLETE | P001_HMI/DataSetup#49 | 1 |
| `LB189` |  | (tidak ditulis di project ini) | 1 |
| `LB190` | MC SUPERVISION INFO LV FAULT RESET | P000_Main/Fault#13 | 1 |
| `LB191` | EtherCAT MONITORING INFORMATION LV FAULT RESET | (tidak ditulis di project ini) | 1 |
| `LB200` | UNIT EMERGENCY STOP OFF AUX 1 | P011_WIP_Transfer/Fault#17, P012_ATS3_Unit/Fault#29, P014_Flash1/Fault#16 | 4 |
| `LB2000` | Flash 1 Debugging Enable/Disable | P012_ATS3_Unit/Memory_Feeding#1, P012_ATS3_Unit/Memory_Feeding#24, P014_Flash1/Preparation#2 | 10 |
| `LB2001` | Flash 2 Debugging Mode | P012_ATS3_Unit/Memory_Feeding#2, P012_ATS3_Unit/Memory_Feeding#25, P014_Flash1/Preparation#3 | 20 |
| `LB2002` | Flash 2 Continous Debugging Enable/Disable | P012_ATS3_Unit/Memory_Feeding#3, P012_ATS3_Unit/Memory_Feeding#26, P014_Flash1/Preparation#6 | 6 |
| `LB2003` | Flash 1 Continous Debugging Enable | P012_ATS3_Unit/Memory_Feeding#4, P012_ATS3_Unit/Memory_Feeding#26, P014_Flash1/Preparation#7 | 11 |
| `LB2004` | Flash 2 Use/Not Use Front P/N | P014_Flash1/Preparation#9, P014_Flash1/Preparation#9, P014_Flash1/Preparation#11 | 2 |
| `LB2005` | Flash 2 Use Front P/N | P014_Flash1/Preparation#10, P015_Flash2/Preparation#10 | 10 |
| `LB2009` | WIP Take In Compl. Memory | P012_ATS3_Unit/Memory_Feeding#5, P012_ATS3_Unit/Memory_Feeding#27 | 5 |
| `LB201` | UNIT EMERGENCY STOP OFF AUX 2 | P011_WIP_Transfer/Fault#18, P012_ATS3_Unit/Fault#30, P014_Flash1/Fault#17 | 4 |
| `LB2010` | MRC Take In Compl. Memory | P012_ATS3_Unit/Memory_Feeding#6, P012_ATS3_Unit/Memory_Feeding#29 | 12 |
| `LB2011` | Flash 1 Take In Compl. Memory | P012_ATS3_Unit/Memory_Feeding#7, P012_ATS3_Unit/Memory_Feeding#30 | 10 |
| `LB2012` | Flash 2 Take In Compl. Memory | P012_ATS3_Unit/Memory_Feeding#8, P012_ATS3_Unit/Memory_Feeding#31 | 8 |
| `LB202` | UNIT EMERGENCY STOP OFF AUX 3 | P011_WIP_Transfer/Fault#19, P012_ATS3_Unit/Fault#31, P014_Flash1/Fault#18 | 4 |
| `LB2021` |  | P001_HMI/DataSearch#19 | 3 |
| `LB2022` |  | P001_HMI/DataSearch#21 | 6 |
| `LB2023` |  | P001_HMI/DataSearch#21 | 9 |
| `LB2024` |  | P001_HMI/DataSearch#21 | 2 |
| `LB2030` | Next Product Indication Data Set Complete | P001_HMI/DataSearch#24 | 3 |
| `LB2031` | Next Product Indication Data Set Fault | P001_HMI/DataSearch#24 | 1 |
| `LB2032` | PartNo. Not Change | P001_HMI/DataSearch#25 | 3 |
| `LB2033` | PartNo. Change Detect | P001_HMI/DataSearch#25 | 3 |
| `LB2050` | Lot Change Next PartNo. Setting Condition | P001_HMI/DataSearch#26 | 1 |
| `LB2051` | Lot Change Next PartNo. Setting Start | P001_HMI/DataSearch#27 | 1 |
| `LB209` | UNIT EMERGENCY STOP OFF | P011_WIP_Transfer/Fault#20, P012_ATS3_Unit/Fault#32, P014_Flash1/Fault#19 | 13 |
| `LB210` | UNIT AUTO STOP OFF AUX 1 | P011_WIP_Transfer/Fault#21, P012_ATS3_Unit/Fault#33, P014_Flash1/Fault#20 | 4 |
| `LB2100` | Flash 1 Take Out Priority | P001_HMI/DataSearch#42, P012_ATS3_Unit/Memory_Feeding#32, P012_ATS3_Unit/Memory_Feeding#33 | 3 |
| `LB2101` | Flash 2 Take Out Priority | P001_HMI/DataSearch#43, P012_ATS3_Unit/Memory_Feeding#34, P012_ATS3_Unit/Memory_Feeding#35 | 3 |
| `LB2105` | Set-Up Data Content Good Condition | P001_HMI/DataSearch#44 | 3 |
| `LB2106` | Set-Up Data Content Fault Condition | P001_HMI/DataSearch#44 | 1 |
| `LB2107` | Set-Up Data Extact Compl | P001_HMI/DataSearch#45, P001_HMI/DataSearch#46 | 6 |
| `LB211` | UNIT AUTO STOP OFF AUX 2 | P011_WIP_Transfer/Fault#22, P012_ATS3_Unit/Fault#34, P014_Flash1/Fault#21 | 4 |
| `LB212` | UNIT AUTO STOP OFF AUX 3 | P011_WIP_Transfer/Fault#23, P012_ATS3_Unit/Fault#35, P014_Flash1/Fault#22 | 4 |
| `LB219` | UNIT AUTO STOP OFF | P011_WIP_Transfer/Fault#24, P012_ATS3_Unit/Fault#36, P014_Flash1/Fault#23 | 17 |
| `LB220` | UNIT CYCLE STOP OFF AUX 1 | P011_WIP_Transfer/Fault#25, P012_ATS3_Unit/Fault#37, P014_Flash1/Fault#24 | 4 |
| `LB221` | UNIT CYCLE STOP OFF AUX 2 | P011_WIP_Transfer/Fault#26, P012_ATS3_Unit/Fault#38, P014_Flash1/Fault#25 | 4 |
| `LB222` | UNIT CYCLE STOP OFF AUX 3 | P011_WIP_Transfer/Fault#27, P012_ATS3_Unit/Fault#39, P014_Flash1/Fault#26 | 4 |
| `LB229` | UNIT CYCLE STOP OFF | P011_WIP_Transfer/Fault#28, P012_ATS3_Unit/Fault#40, P014_Flash1/Fault#27 | 9 |
| `LB230` | UNIT FAULT STOP OFF AUX 1 | P011_WIP_Transfer/Fault#29, P012_ATS3_Unit/Fault#41, P014_Flash1/Fault#28 | 4 |
| `LB231` | UNIT FAULT STOP OFF AUX 2 | P011_WIP_Transfer/Fault#30, P012_ATS3_Unit/Fault#42, P014_Flash1/Fault#29 | 4 |
| `LB232` | UNIT FAULT STOP OFFAUX 3 | P011_WIP_Transfer/Fault#31, P012_ATS3_Unit/Fault#43, P014_Flash1/Fault#30 | 4 |
| `LB239` | UNIT FAULT STOP OFF | P011_WIP_Transfer/Fault#32, P012_ATS3_Unit/Fault#44, P014_Flash1/Fault#31 | 4 |
| `LB240` | UNIT NOTICE/WARNING OFF AUX 1 | P011_WIP_Transfer/Fault#33, P012_ATS3_Unit/Fault#45, P014_Flash1/Fault#32 | 4 |
| `LB241` | UNIT NOTICE/WARNING OFF AUX 2 | P011_WIP_Transfer/Fault#34, P012_ATS3_Unit/Fault#46, P014_Flash1/Fault#33 | 4 |
| `LB242` | UNIT NOTICE/WARNING OFF AUX 3 | P011_WIP_Transfer/Fault#35, P012_ATS3_Unit/Fault#47, P014_Flash1/Fault#34 | 4 |
| `LB249` | UNIT NOTICE/WARNING OFF | P011_WIP_Transfer/Fault#36, P012_ATS3_Unit/Fault#48, P014_Flash1/Fault#35 | 4 |
| `LB270` |  | P001_HMI/DataSetup#30 | 1 |
| `LB271` |  | P001_HMI/DataSetup#31 | 1 |
| `LB272` |  | P001_HMI/DataSetup#32 | 1 |
| `LB273` |  | P001_HMI/DataSetup#33 | 1 |
| `LB276` |  | P001_HMI/DataSetup#34 | 1 |
| `LB277` |  | P001_HMI/DataSetup#35 | 1 |
| `LB278` |  | P001_HMI/DataSetup#36 | 1 |
| `LB279` |  | P001_HMI/DataSetup#37 | 1 |
| `LB300` | WIP Transfer Cond. | P011_WIP_Transfer/Condition#1, P012_ATS3_Unit/Condition#1, P014_Flash1/Condition#1 | 9 |
| `LB3000` | Flash 2 Ready to Take In : ATS No Need to Move | P003_ServoIAI/Adjust#1, P012_ATS3_Unit/Auto_Running#48 | 4 |
| `LB3001` | Flash 2 Not Ready to Take In : ATS Move to Parking Area | P003_ServoIAI/Adjust#2, P012_ATS3_Unit/Auto_Running#48 | 4 |
| `LB301` | WIP Return Cond. | P011_WIP_Transfer/Condition#2, P012_ATS3_Unit/Condition#2, P014_Flash1/Condition#2 | 8 |
| `LB3010` | Flash 1 Ready to Take In : ATS No Need to Move | P003_ServoIAI/Adjust#3, P012_ATS3_Unit/Auto_Running#49 | 3 |
| `LB3011` | Flash 1 Not Ready to Take In : ATS Move to Parking Area | P003_ServoIAI/Adjust#4, P012_ATS3_Unit/Auto_Running#49 | 8 |
| `LB3012` | Check PBoff | P003_ServoIAI/Adjust#4 | 2 |
| `LB3013` | relieve | P003_ServoIAI/Adjust#4 | 2 |
| `LB302` |  | P012_ATS3_Unit/Condition#3, P014_Flash1/Condition#3, P015_Flash2/Condition#3 | 6 |
| `LB303` | MRC Take Out Condition | P012_ATS3_Unit/Condition#4 | 2 |
| `LB304` | WIP Transfer 1 Cycle Condition | P011_WIP_Transfer/Condition#3, P012_ATS3_Unit/Condition#5 | 5 |
| `LB305` | Shutter FG Motion Start | P011_WIP_Transfer/Condition#4, P012_ATS3_Unit/Condition#6 | 5 |
| `LB306` | Flash 2 Take In Cond. | P012_ATS3_Unit/Condition#7 | 3 |
| `LB307` | Flash 2 Take Out Cond. | P012_ATS3_Unit/Condition#8 | 2 |
| `LB309` | Unit 1 Cycle Start Condition | P011_WIP_Transfer/Condition#5, P012_ATS3_Unit/Condition#9, P014_Flash1/Condition#4 | 7 |
| `LB310` | UNIT 1 CYCLE OPERATION COND. AUX | P011_WIP_Transfer/Individual#1, P012_ATS3_Unit/Individual#1, P014_Flash1/Individual#1 | 4 |
| `LB3100` | ATS Move to Park Area [Flash 1 Take In Pos] Start | P012_ATS3_Unit/Auto_Running#50 | 1 |
| `LB3101` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#51 | 1 |
| `LB3102` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#51 | 4 |
| `LB3103` | PNP Moving to Park Area [Flash 1 Take In Pos.] Operation Start | P012_ATS3_Unit/Auto_Running#51 | 2 |
| `LB3104` | PNP Moving to Park Area [Flash 1 Take In Pos.] Running | P012_ATS3_Unit/Auto_Running#51 | 2 |
| `LB3105` | PNP Move to Park Area [Flash 1 Take In] Complete | P012_ATS3_Unit/Auto_Running#51 | 5 |
| `LB3110` | JOG + | P003_ServoIAI/Adjust#5 | 1 |
| `LB3111` | JOG - | P003_ServoIAI/Adjust#6 | 1 |
| `LB3115` | Inching Mode On | (tidak ditulis di project ini) | 1 |
| `LB3150` | ATS Move to Park Area [Flash 2 Take In Pos] Start | P012_ATS3_Unit/Auto_Running#52 | 1 |
| `LB3151` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#53 | 1 |
| `LB3152` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#53 | 4 |
| `LB3153` | PNP Moving to Park Area [Flash 2 Take Out Pos.] Operation Start | P012_ATS3_Unit/Auto_Running#53 | 2 |
| `LB3154` | PNP Moving to Park Area [Flash 2 Take Out Pos.] Running | P012_ATS3_Unit/Auto_Running#53 | 2 |
| `LB3155` | PNP Move to Park Area [Flash 2 Take Out] Complete | P012_ATS3_Unit/Auto_Running#53 | 5 |
| `LB319` | UNIT 1 CYCLE OPERATION COND. | P011_WIP_Transfer/Individual#2, P012_ATS3_Unit/Individual#2, P014_Flash1/Individual#2 | 4 |
| `LB320` | Unit  1 Cycle Operation Start | P011_WIP_Transfer/Individual#3, P012_ATS3_Unit/Individual#3, P014_Flash1/Individual#3 | 17 |
| `LB3300` | Screen In IAI Adjust_WIP | P003_ServoIAI/Adjust#7 | 2 |
| `LB3301` | Conditions for JOG adjustment enable switching | P003_ServoIAI/Adjust#8 | 1 |
| `LB3310` | JOG adjustment valid condition | P003_ServoIAI/Adjust#9 | 2 |
| `LB3311` | JOG adjustment enabled | P003_ServoIAI/Adjust#10 | 6 |
| `LB3312` | Check PBoff | P003_ServoIAI/Adjust#10 | 2 |
| `LB3313` | relieve | P003_ServoIAI/Adjust#10 | 2 |
| `LB3315` | Inching Mode On | (tidak ditulis di project ini) | 1 |
| `LB340` | Ind. Home Pos Return | P011_WIP_Transfer/Individual#5, P012_ATS3_Unit/Individual#5, P014_Flash1/Individual#5 | 34 |
| `LB341` | SM10 FWD Cond. | P011_WIP_Transfer/Individual#6, P012_ATS3_Unit/Individual#6 | 2 |
| `LB3410` | JOG + | P003_ServoIAI/Adjust#11 | 1 |
| `LB3411` | JOG - | P003_ServoIAI/Adjust#12 | 1 |
| `LB342` | Ind. SM10 FWD Motion | P011_WIP_Transfer/Individual#7, P012_ATS3_Unit/Individual#7, P014_Flash1/Individual#6 | 8 |
| `LB343` | SM10 BWD Cond. | P011_WIP_Transfer/Individual#8, P012_ATS3_Unit/Individual#8, P014_Flash1/Individual#7 | 6 |
| `LB344` | Ind. SM10 BWD Motion | P011_WIP_Transfer/Individual#9, P012_ATS3_Unit/Individual#9, P014_Flash1/Individual#8 | 8 |
| `LB345` | Ind. Flash 2 Cover Open | P012_ATS3_Unit/Individual#10, P014_Flash1/Individual#9, P015_Flash2/Individual#9 | 7 |
| `LB346` | Ind. Move SM1 X Axis Pos. 3 | P012_ATS3_Unit/Individual#11 | 2 |
| `LB347` | X Axis Pos. 4 Move Cond. | P012_ATS3_Unit/Individual#12 | 1 |
| `LB348` | Ind. Move SM1 X Axis Pos. 4 | P012_ATS3_Unit/Individual#13 | 3 |
| `LB349` | X Axis Pos. 5 Move Cond. | P012_ATS3_Unit/Individual#14 | 1 |
| `LB350` | Ind. Move SM1 X Axis Pos. 5 | P012_ATS3_Unit/Individual#15 | 2 |
| `LB351` | X Axis Pos. 10 Move Cond. | P012_ATS3_Unit/Individual#16 | 1 |
| `LB352` | Ind. Move SM1 X Axis Pos. 10 | P012_ATS3_Unit/Individual#17 | 2 |
| `LB353` | X Axis  Pos. 11 Move Cond. | P012_ATS3_Unit/Individual#18 | 1 |
| `LB354` | Ind. Move SM1 X Axis Pos. 11 | P012_ATS3_Unit/Individual#19 | 2 |
| `LB355` | X Axis  Pos. 12 Move Cond. | P012_ATS3_Unit/Individual#20 | 1 |
| `LB356` | Ind. Move SM1 X Axis Pos. 12 | P012_ATS3_Unit/Individual#21 | 2 |
| `LB357` | X Axis  Pos. 13 Move Cond. | P012_ATS3_Unit/Individual#22 | 1 |
| `LB358` | Ind. Move SM1 X Axis Pos. 13 | P012_ATS3_Unit/Individual#23 | 2 |
| `LB359` | X Axis  Pos. 14 Move Cond. | P012_ATS3_Unit/Individual#24 | 1 |
| `LB360` | Shutter FG Cover Open Cond. | P011_WIP_Transfer/Individual#10, P012_ATS3_Unit/Individual#25 | 3 |
| `LB361` | Ind. Shutter FG Cover Open | P011_WIP_Transfer/Individual#11, P012_ATS3_Unit/Individual#26 | 2 |
| `LB362` | Shutter FG Cover Close Cond. | P011_WIP_Transfer/Individual#12, P012_ATS3_Unit/Individual#27 | 5 |
| `LB363` | Ind. Shutter FG Cover Close | P011_WIP_Transfer/Individual#13, P012_ATS3_Unit/Individual#28 | 2 |
| `LB364` | Additional Chutter FG Open Cond. | P011_WIP_Transfer/Individual#14, P012_ATS3_Unit/Individual#29 | 4 |
| `LB365` | Ind. Additional Chutter FG Open | P011_WIP_Transfer/Individual#15, P012_ATS3_Unit/Individual#30 | 2 |
| `LB366` | Additional Chutter FG Close Cond. | P011_WIP_Transfer/Individual#16, P012_ATS3_Unit/Individual#31 | 5 |
| `LB367` | Ind. Additional Chutter FG Close | P011_WIP_Transfer/Individual#17, P012_ATS3_Unit/Individual#32 | 2 |
| `LB368` | Ind. Move SM2 R Rotary Pos. 4 | P012_ATS3_Unit/Individual#33 | 4 |
| `LB369` | SM2 Right Rotary Pos 5 Move Cond. | P012_ATS3_Unit/Individual#34 | 1 |
| `LB370` | Ind. Move SM2 R Rotary Pos. 5 | P012_ATS3_Unit/Individual#35 | 4 |
| `LB371` | SM4 R Gripper Pos 1 Move Cond. | P012_ATS3_Unit/Individual#36 | 1 |
| `LB372` | Ind. Move SM4 R Gripper Pos. 1 | P012_ATS3_Unit/Individual#37 | 4 |
| `LB373` | SM4 R Gripper Pos 2 Move Cond. | P012_ATS3_Unit/Individual#38 | 1 |
| `LB374` | Ind. Move SM4 R Gripper Pos. 2 (Chuck) | P012_ATS3_Unit/Individual#39 | 3 |
| `LB375` | SM4 R Gripper Pos 3 Move Cond. | P012_ATS3_Unit/Individual#40 | 1 |
| `LB376` | Ind. Move SM4 R Gripper Pos. 3 | P012_ATS3_Unit/Individual#41 | 4 |
| `LB377` | SM4 R Gripper Pos 4 Move Cond. | P012_ATS3_Unit/Individual#42 | 1 |
| `LB378` | Ind. Move SM4 R Gripper Pos. 4 | P012_ATS3_Unit/Individual#43 | 4 |
| `LB379` | SM4 R Gripper Pos 5 Move Cond. | P012_ATS3_Unit/Individual#44 | 1 |
| `LB380` | Flash 2 Debugging Operation Condition | P012_ATS3_Unit/Individual#45, P014_Flash1/Individual#11, P015_Flash2/Individual#11 | 5 |
| `LB381` | Flash 2 Debugging Start | P012_ATS3_Unit/Individual#46, P014_Flash1/Individual#12, P015_Flash2/Individual#12 | 12 |
| `LB382` | Ind. Move SM6 R Z Axis Pos. 1 | P012_ATS3_Unit/Individual#47 | 4 |
| `LB383` | SM6 R Z Axis Pos 2 Move Cond. | P012_ATS3_Unit/Individual#48 | 1 |
| `LB384` | Ind. Move SM6 R Z Axis Pos. 2 | P012_ATS3_Unit/Individual#49 | 3 |
| `LB385` | SM6 R Z Axis Pos 3 Move Cond. | P012_ATS3_Unit/Individual#50 | 1 |
| `LB386` | Ind. Move SM6 R Z Axis Pos. 3 | P012_ATS3_Unit/Individual#51 | 4 |
| `LB387` | SM6 R Z Axis Pos 4 Move Cond. | P012_ATS3_Unit/Individual#52 | 1 |
| `LB388` | Ind. Move SM6 R Z Axis Pos. 4 | P012_ATS3_Unit/Individual#53 | 5 |
| `LB389` | SM6 R Z Axis Pos 5 Move Cond. | P012_ATS3_Unit/Individual#54 | 1 |
| `LB390` | Ind. Move SM6 R Z Axis Pos. 5 | P012_ATS3_Unit/Individual#55 | 2 |
| `LB391` | SM8 R Y Axis Pos 1 Move Cond. | P012_ATS3_Unit/Individual#56 | 1 |
| `LB392` | Ind. Move SM8 R Y Axis Pos. 1 | P012_ATS3_Unit/Individual#57 | 4 |
| `LB393` | SM8 R Y Axis Pos 2 Move Cond. | P012_ATS3_Unit/Individual#58 | 1 |
| `LB394` | Ind. Move SM8 R Y Axis Pos. 2 | P012_ATS3_Unit/Individual#59 | 3 |
| `LB395` | SM8 R Y Axis Pos 3 Move Cond. | P012_ATS3_Unit/Individual#60 | 1 |
| `LB396` | Ind. Move SM8 R Y Axis Pos. 3 | P012_ATS3_Unit/Individual#61 | 4 |
| `LB397` | SM8 R Y Axis Pos 4 Move Cond. | P012_ATS3_Unit/Individual#62 | 1 |
| `LB398` | Ind. Move SM8 R Y Axis Pos. 4 | P012_ATS3_Unit/Individual#63 | 4 |
| `LB399` | Ind. Move SM8 R Y Axis Pos. 5 | P012_ATS3_Unit/Individual#65 | 3 |
| `LB399A` | SM8 R Y Axis Pos 5 Move Cond. | P012_ATS3_Unit/Individual#64 | 1 |
| `LB400[1]` |  | P011_WIP_Transfer/AutoRunning#1, P012_ATS3_Unit/Auto_Running#1, P014_Flash1/Auto_Running#1 | 12 |
| `LB400[2]` |  | P011_WIP_Transfer/AutoRunning#2, P012_ATS3_Unit/Auto_Running#2, P014_Flash1/Auto_Running#2 | 10 |
| `LB400[3]` |  | P011_WIP_Transfer/AutoRunning#5, P012_ATS3_Unit/Auto_Running#4, P014_Flash1/Auto_Running#3 | 20 |
| `LB401` | WIP Transfer Motion | P011_WIP_Transfer/AutoRunning#6, P012_ATS3_Unit/Auto_Running#5, P014_Flash1/Auto_Running#4 | 21 |
| `LB402` | WIP Return Motion | P011_WIP_Transfer/AutoRunning#6, P012_ATS3_Unit/Auto_Running#5, P014_Flash1/Auto_Running#4 | 21 |
| `LB403` | Flash 2 Processing Motion | P012_ATS3_Unit/Auto_Running#5, P014_Flash1/Auto_Running#4, P015_Flash2/Auto_Running#4 | 20 |
| `LB404` | MRC3 Take Out Operation | P012_ATS3_Unit/Auto_Running#5 | 10 |
| `LB405` | Flash 1 Take In Operation | P012_ATS3_Unit/Auto_Running#5 | 11 |
| `LB406` | Flash 1 Take Out Operation | P012_ATS3_Unit/Auto_Running#5 | 10 |
| `LB407` | Flash 2 Take In Operation | P012_ATS3_Unit/Auto_Running#5 | 11 |
| `LB408` | Flash 2 Take Out Operation | P012_ATS3_Unit/Auto_Running#5 | 10 |
| `LB409` | WIP Transfer Cycle Complete | P011_WIP_Transfer/AutoRunning#7, P012_ATS3_Unit/Auto_Running#3, P014_Flash1/Auto_Running#5 | 12 |
| `LB410` | WIP Transfer Motion Start | P011_WIP_Transfer/AutoRunning#11, P014_Flash1/Auto_Running#6, P015_Flash2/Auto_Running#6 | 3 |
| `LB411` | SM10 FWD Motion Starting | P011_WIP_Transfer/AutoRunning#12, P014_Flash1/Auto_Running#7, P015_Flash2/Auto_Running#7 | 6 |
| `LB412` | SM10 FWD Motion Running | P011_WIP_Transfer/AutoRunning#12, P014_Flash1/Auto_Running#7, P015_Flash2/Auto_Running#7 | 6 |
| `LB413` | SM10 FWD Motion Compl. | P011_WIP_Transfer/AutoRunning#12, P014_Flash1/Auto_Running#7, P015_Flash2/Auto_Running#7 | 8 |
| `LB414` | Auto : Flash 2 Cover Open Motion Confirm. | P014_Flash1/Auto_Running#7, P015_Flash2/Auto_Running#7 | 8 |
| `LB415` | WIP Transfer Compl. | P011_WIP_Transfer/AutoRunning#13 | 1 |
| `LB419` | Flash 2 Cover Open Complete | P014_Flash1/Auto_Running#8, P015_Flash2/Auto_Running#8 | 2 |
| `LB420` | WIP Take In Operation Start | P012_ATS3_Unit/Auto_Running#6 | 7 |
| `LB421` | PNP at WIP Pos Confirm. | P012_ATS3_Unit/Auto_Running#7 | 3 |
| `LB422` | PNP not at WIP Pos Confirm. | P012_ATS3_Unit/Auto_Running#7 | 3 |
| `LB423` | Auto Continue : PNP Move To WIP Pos. | P012_ATS3_Unit/Auto_Running#8 | 1 |
| `LB424` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#9 | 1 |
| `LB425` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#9 | 4 |
| `LB426` | PNP Move To WIP Take In Pos Operation Start | P012_ATS3_Unit/Auto_Running#9 | 2 |
| `LB426A` | PNP Move To WIP Take In Pos Running | P012_ATS3_Unit/Auto_Running#9 | 2 |
| `LB427` | PNP Move To WIP Take In Pos Complete | P012_ATS3_Unit/Auto_Running#9 | 5 |
| `LB428` | Left Arm Chuck at Return Pos. Confirm. | P012_ATS3_Unit/Auto_Running#10 | 3 |
| `LB429` | Left Arm Chuck not at Return Pos. | P012_ATS3_Unit/Auto_Running#10 | 3 |
| `LB430` | Left Arm Chuck Return Operation Start | P012_ATS3_Unit/Auto_Running#11 | 2 |
| `LB431` | Left Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#11 | 3 |
| `LB432` | Right Arm Chuck at Return Pos. Confirm. | P012_ATS3_Unit/Auto_Running#12 | 3 |
| `LB433` | Right Arm Chuck not at Return Pos. | P012_ATS3_Unit/Auto_Running#12 | 3 |
| `LB434` | Right Arm Chuck Return Operation Start | P012_ATS3_Unit/Auto_Running#13 | 2 |
| `LB435` | Right Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#13 | 3 |
| `LB440` | Left Arm Y Axis at BWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#14 | 3 |
| `LB441` | Left Arm Y Axis not at BWD Pos. | P012_ATS3_Unit/Auto_Running#14 | 3 |
| `LB442` | Right Arm Y Axis at BWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#15 | 3 |
| `LB443` | Right Arm Y Axis not at BWD Pos. | P012_ATS3_Unit/Auto_Running#15 | 3 |
| `LB444` | Left Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#16 | 2 |
| `LB445` | Left Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#16 | 3 |
| `LB446` | Right Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#17 | 2 |
| `LB447` | Right Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#17 | 3 |
| `LB449` | WIP Transfer Cycle Complete | P011_WIP_Transfer/AutoRunning#14, P012_ATS3_Unit/Auto_Running#18, P014_Flash1/Auto_Running#9 | 5 |
| `LB450` | WIP Return Motion Start | P011_WIP_Transfer/AutoRunning#15, P012_ATS3_Unit/Auto_Running#19, P014_Flash1/Auto_Running#10 | 10 |
| `LB451` | SM10 BWD Motion Starting | P011_WIP_Transfer/AutoRunning#16, P012_ATS3_Unit/Auto_Running#19, P014_Flash1/Auto_Running#11 | 11 |
| `LB452` | SM10 BWD Motion Running | P011_WIP_Transfer/AutoRunning#16, P014_Flash1/Auto_Running#11, P015_Flash2/Auto_Running#11 | 6 |
| `LB453` | SM10 BWD Motion Complete | P011_WIP_Transfer/AutoRunning#16, P014_Flash1/Auto_Running#11, P015_Flash2/Auto_Running#11 | 7 |
| `LB454` | Auto : Flash 2 Cover Close Motion Compl. | P014_Flash1/Auto_Running#11, P015_Flash2/Auto_Running#11 | 8 |
| `LB455` | WIP Return Complete | P011_WIP_Transfer/AutoRunning#17 | 1 |
| `LB459` | Flash 2 Cover Close Complete | P012_ATS3_Unit/Auto_Running#20, P014_Flash1/Auto_Running#12, P015_Flash2/Auto_Running#12 | 3 |
| `LB460` | WIP Take Out Operation Start | P012_ATS3_Unit/Auto_Running#21 | 7 |
| `LB461` | PNP at WIP Pos Confirm | P012_ATS3_Unit/Auto_Running#22 | 3 |
| `LB462` | PNP not at WIP Pos Confirm. | P012_ATS3_Unit/Auto_Running#22 | 3 |
| `LB463` | Auto Continue : PNP Move to WIP Pos. | P012_ATS3_Unit/Auto_Running#23 | 1 |
| `LB464` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#24 | 1 |
| `LB465` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#24 | 4 |
| `LB466` | PNP Moving to WIP Take Out Pos Operation Start | P012_ATS3_Unit/Auto_Running#24 | 2 |
| `LB466A` | PNP Moving to WIP Take Out Pos Running | P012_ATS3_Unit/Auto_Running#24 | 2 |
| `LB467` | PNP Moving to WIP Take Out Pos Complete | P012_ATS3_Unit/Auto_Running#24 | 5 |
| `LB468` | Left Arm Chuck at Return Pos. Confirm. | P012_ATS3_Unit/Auto_Running#25 | 3 |
| `LB469` | Left Arm Chuck not at Return Pos. | P012_ATS3_Unit/Auto_Running#25 | 3 |
| `LB470` | Left Arm Chuck Return Operartion Start | P012_ATS3_Unit/Auto_Running#26 | 2 |
| `LB471` | Left Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#26 | 3 |
| `LB472` | Left Arm Y Axis at BWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#27 | 3 |
| `LB473` | Left Arm Y Axis not at BWD Pos. | P012_ATS3_Unit/Auto_Running#27 | 3 |
| `LB474` | Left Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#28 | 2 |
| `LB475` | Left Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#28 | 3 |
| `LB476` | Right Arm Chuck at Return Pos. Confirm. | P012_ATS3_Unit/Auto_Running#29 | 3 |
| `LB477` | Right Arm Chuck not at Return Pos. | P012_ATS3_Unit/Auto_Running#29 | 3 |
| `LB478` | Right Arm Chuck Return Operartion Start | P012_ATS3_Unit/Auto_Running#30 | 2 |
| `LB479` | Right Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#30 | 3 |
| `LB480` | Right Arm Y Axis at BWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#31 | 3 |
| `LB481` | Right Arm Y Axis not at BWD Pos. | P012_ATS3_Unit/Auto_Running#31 | 3 |
| `LB482` | Right Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#32 | 2 |
| `LB483` | Right Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#32 | 3 |
| `LB499` | WIP Return Cycle Complete | P011_WIP_Transfer/AutoRunning#18, P012_ATS3_Unit/Auto_Running#33, P014_Flash1/Auto_Running#13 | 4 |
| `LB500` |  | P000_Main/Master_Preparation#2, P000_Main/Master_Preparation#2, P000_Main/Master_Preparation#3 | 9 |
| `LB500[1]` |  | P011_WIP_Transfer/AutoRunning#3 | 3 |
| `LB500[2]` |  | P011_WIP_Transfer/AutoRunning#4 | 2 |
| `LB500[3]` |  | P011_WIP_Transfer/AutoRunning#8 | 2 |
| `LB501` | Shutter FG Motion | P000_Main/Master_Preparation#4, P011_WIP_Transfer/AutoRunning#9, P012_ATS3_Unit/Auto_Running#34 | 19 |
| `LB502` | Flash 2 OK Compl. | P014_Flash1/Auto_Running#15, P015_Flash2/Auto_Running#15 | 7 |
| `LB503` | Flash 2 NG Compl. | P014_Flash1/Auto_Running#15, P015_Flash2/Auto_Running#15 | 7 |
| `LB509` | Shutter FG 1 Cycle Complete | P011_WIP_Transfer/AutoRunning#10, P012_ATS3_Unit/Auto_Running#35, P014_Flash1/Auto_Running#16 | 5 |
| `LB510` | Shutter FG Motion Start | P011_WIP_Transfer/AutoRunning#19, P012_ATS3_Unit/Auto_Running#36 | 8 |
| `LB511` | Auto : Cover Shutter Open Start | P011_WIP_Transfer/AutoRunning#20, P012_ATS3_Unit/Auto_Running#37 | 6 |
| `LB511A` | Auto : Additional Chutter Open Start | P011_WIP_Transfer/AutoRunning#21 | 2 |
| `LB512` | Cover Shutter Open Confirm. | P011_WIP_Transfer/AutoRunning#20, P012_ATS3_Unit/Auto_Running#37 | 9 |
| `LB512A` | Additional Chutter Open Confirm. | P011_WIP_Transfer/AutoRunning#21 | 2 |
| `LB513` | Product Take In to Shutter Confirm. | P011_WIP_Transfer/AutoRunning#22, P012_ATS3_Unit/Auto_Running#38 | 3 |
| `LB514` | Safety Confirm. [Sensor is OFF] | P011_WIP_Transfer/AutoRunning#23, P012_ATS3_Unit/Auto_Running#39 | 4 |
| `LB515` | Auto : Cover Shutter Close Start | P011_WIP_Transfer/AutoRunning#24, P012_ATS3_Unit/Auto_Running#39 | 5 |
| `LB516` | Cover Shutter Close Confirm. | P011_WIP_Transfer/AutoRunning#24, P012_ATS3_Unit/Auto_Running#39 | 5 |
| `LB516A` | PNP Moving to MRC3 Take In Pos.  Running | P012_ATS3_Unit/Auto_Running#39 | 2 |
| `LB517` | Additional Chutter No Need to Move | P011_WIP_Transfer/AutoRunning#25, P012_ATS3_Unit/Auto_Running#39 | 8 |
| `LB518` | Additional Chutter Move Close | P011_WIP_Transfer/AutoRunning#25, P012_ATS3_Unit/Auto_Running#40 | 6 |
| `LB519` | Auto : Additional Chutter Close Start | P011_WIP_Transfer/AutoRunning#26, P012_ATS3_Unit/Auto_Running#40 | 4 |
| `LB520` | Additional Chutter Close Confirm. | P011_WIP_Transfer/AutoRunning#26, P012_ATS3_Unit/Auto_Running#41 | 5 |
| `LB521` | Left Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#41 | 3 |
| `LB522` | Left Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#42 | 3 |
| `LB523` | Left Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#42 | 3 |
| `LB524` | Left Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#43 | 3 |
| `LB525` | Left Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#43 | 3 |
| `LB529` | Shutter FG Motion Compl. | P011_WIP_Transfer/AutoRunning#27, P012_ATS3_Unit/Auto_Running#44 | 2 |
| `LB530` | Left Arm MRC3 Take In Operation Start | P012_ATS3_Unit/Auto_Running#45 | 5 |
| `LB531` | Left Arm MRC3 Take In Complete | P012_ATS3_Unit/Auto_Running#45 | 5 |
| `LB532` | Right Gripper is Chuck : No Moving to WIP | P012_ATS3_Unit/Auto_Running#46 | 4 |
| `LB532A` | Flash 1 is Disabled | P012_ATS3_Unit/Auto_Running#47 | 5 |
| `LB532B` | Flash 2 is Disabled | P012_ATS3_Unit/Auto_Running#47 | 5 |
| `LB532C` | All Flash is USED | P012_ATS3_Unit/Auto_Running#47 | 3 |
| `LB533` | Right Gripper is Unchuck : Moving To WIP | P012_ATS3_Unit/Auto_Running#46 | 3 |
| `LB534` | PNP Moving Interlock Request. | P012_ATS3_Unit/Auto_Running#56 | 1 |
| `LB535` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#56 | 4 |
| `LB536` | PNP Moving to WIP Take Out Pos. Operation Start | P012_ATS3_Unit/Auto_Running#56 | 2 |
| `LB536A` | PNP Moving to WIP Take Out Pos. Running | P012_ATS3_Unit/Auto_Running#56 | 2 |
| `LB537` | PNP Moving to WIP Take Out Pos. Compl. | P012_ATS3_Unit/Auto_Running#56 | 5 |
| `LB549` | Shutter FG Cycle Complete | P011_WIP_Transfer/AutoRunning#28, P014_Flash1/Auto_Running#17, P015_Flash2/Auto_Running#17 | 3 |
| `LB5531` | Auto Continue : Arm & ATS Home Pos. | P012_ATS3_Unit/Auto_Running#54 | 2 |
| `LB5532` | Left Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#55 | 2 |
| `LB5533` | Left Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#55 | 4 |
| `LB5581` | Auto Continue : Arm & ATS Home Pos. | P012_ATS3_Unit/Auto_Running#69 | 2 |
| `LB5582` | Right Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#70 | 2 |
| `LB5583` | Right Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#70 | 3 |
| `LB559` | MRC3 Take In Operation Complete | P012_ATS3_Unit/Auto_Running#57 | 1 |
| `LB560` | MRC3 Take Out Operation Start | P012_ATS3_Unit/Auto_Running#58 | 5 |
| `LB561` | PNP at MRC3 Pos. Confim. | P012_ATS3_Unit/Auto_Running#59 | 5 |
| `LB562` | PNP not at MRC3 Pos. | P012_ATS3_Unit/Auto_Running#59 | 5 |
| `LB563` | Auto Continue : PNP Move to MRC3 Pos. | P012_ATS3_Unit/Auto_Running#60 | 1 |
| `LB564` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#61 | 1 |
| `LB565` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#61 | 4 |
| `LB5651` | Auto Continue : Gripper & ATS Home Pos. | P012_ATS3_Unit/Auto_Running#88 | 6 |
| `LB5652` | Rotary Right Arm Return Operation Start | P012_ATS3_Unit/Auto_Running#89 | 2 |
| `LB5653` | Rotary Right Arm Return Complete | P012_ATS3_Unit/Auto_Running#89 | 3 |
| `LB5654` | Rotary Left Arm Return Operation Start | P012_ATS3_Unit/Auto_Running#90 | 2 |
| `LB5655` | Rotary Left Arm Return Complete | P012_ATS3_Unit/Auto_Running#90 | 3 |
| `LB5656` | Right Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#91 | 2 |
| `LB5657` | Right Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#91 | 3 |
| `LB5658` | Leftt Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#92 | 2 |
| `LB5659` | Leftt Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#92 | 3 |
| `LB566` | PNP Move to MRC3 Take Out Pos. Operation Start | P012_ATS3_Unit/Auto_Running#61 | 2 |
| `LB5660` | Auto Continue : ATS Homing | P012_ATS3_Unit/Auto_Running#93 | 1 |
| `LB566A` | PNP Move to MRC3 Take Out Pos. Running | P012_ATS3_Unit/Auto_Running#61 | 2 |
| `LB567` | PNP Move to MRC3 Take Out Pos. Completet | P012_ATS3_Unit/Auto_Running#61 | 5 |
| `LB568` | Right Arm Chuck at Return Pos. Confirm. | P012_ATS3_Unit/Auto_Running#62 | 3 |
| `LB569` | Right Arm Chuck not at Return Pos. | P012_ATS3_Unit/Auto_Running#62 | 3 |
| `LB570` | Right Arm Chuck Return Operation Start | P012_ATS3_Unit/Auto_Running#63 | 2 |
| `LB571` | Right Arm Chuck Return Complete | P012_ATS3_Unit/Auto_Running#63 | 3 |
| `LB572` | Right Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#64 | 3 |
| `LB573` | Right Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#64 | 3 |
| `LB574` | Right Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#65 | 3 |
| `LB575` | Right Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#65 | 3 |
| `LB5751` | Auto Continue : Gripper & ATS Home Pos. | P012_ATS3_Unit/Auto_Running#126 | 6 |
| `LB5752` | Rotary Right Arm Return Operation Start | P012_ATS3_Unit/Auto_Running#127 | 2 |
| `LB5753` | Rotary Right Arm Return Complete | P012_ATS3_Unit/Auto_Running#127 | 3 |
| `LB5754` | Rotary Left Arm Return Operation Start | P012_ATS3_Unit/Auto_Running#128 | 2 |
| `LB5755` | Rotary Left Arm Return Complete | P012_ATS3_Unit/Auto_Running#128 | 3 |
| `LB5756` | Right Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#129 | 2 |
| `LB5757` | Right Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#129 | 3 |
| `LB5758` | Leftt Arm Y Axis BWD Operation Start | P012_ATS3_Unit/Auto_Running#130 | 2 |
| `LB5759` | Leftt Arm Y Axis BWD Complete | P012_ATS3_Unit/Auto_Running#130 | 3 |
| `LB5760` | Auto Continue : ATS Homing | P012_ATS3_Unit/Auto_Running#131 | 1 |
| `LB579` | Auto Continue : Right Arm MRC3 Take Out | P012_ATS3_Unit/Auto_Running#66 | 1 |
| `LB580` | Right Arm MRC3 Take Out Operation Start | P012_ATS3_Unit/Auto_Running#67 | 5 |
| `LB581` | Right Arm MRC3 Take Out Complete | P012_ATS3_Unit/Auto_Running#67 | 5 |
| `LB582` | MRC3 No Change Assy No. [No Need move to WIP] | P012_ATS3_Unit/Auto_Running#68 | 3 |
| `LB583` | MRC3 Change Assy No Req. [Move to WIP] | P012_ATS3_Unit/Auto_Running#68 | 3 |
| `LB584` | PNP Moving Interlock Request. | P012_ATS3_Unit/Auto_Running#71 | 1 |
| `LB585` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#71 | 3 |
| `LB586` | PNP Moving to WIP Take Out Pos. Operation Start | P012_ATS3_Unit/Auto_Running#71 | 2 |
| `LB586A` | PNP Moving to WIP Take Out Pos. Running | P012_ATS3_Unit/Auto_Running#71 | 2 |
| `LB587` | PNP Moving to WIP Take Out Pos. Compl. | P012_ATS3_Unit/Auto_Running#71 | 5 |
| `LB600` | SM10 FWD Motion | P011_WIP_Transfer/AutoRunningOutput#1, P014_Flash1/Auto_Running_Output#1, P015_Flash2/Auto_Running_Output#1 | 14 |
| `LB601` | SM10 BWD Motion | P011_WIP_Transfer/AutoRunningOutput#2, P014_Flash1/Auto_Running_Output#2, P015_Flash2/Auto_Running_Output#2 | 14 |
| `LB609` | MRC3 Take Out Operation Complete | P012_ATS3_Unit/Auto_Running#72 | 1 |
| `LB610` | SOL FG Shutter Open | P011_WIP_Transfer/AutoRunningOutput#3, P012_ATS3_Unit/Auto_Running#73, P014_Flash1/Auto_Running_Output#3 | 16 |
| `LB611` | SOL FG Shutter Close | P011_WIP_Transfer/AutoRunningOutput#4, P012_ATS3_Unit/Auto_Running#74 | 8 |
| `LB612` | SOL FG Additional Chutter Open | P011_WIP_Transfer/AutoRunningOutput#5, P012_ATS3_Unit/Auto_Running#74 | 6 |
| `LB613` | SOL FG Additional Chutter Close | P011_WIP_Transfer/AutoRunningOutput#6, P012_ATS3_Unit/Auto_Running#75 | 4 |
| `LB614` |  | P012_ATS3_Unit/Auto_Running#76 | 1 |
| `LB615` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#76 | 4 |
| `LB616` | PNP Move to Flash 1 Take In Operation Start | P012_ATS3_Unit/Auto_Running#76 | 2 |
| `LB616A` | PNP Move to Flash 1 Take In Running | P012_ATS3_Unit/Auto_Running#76 | 2 |
| `LB617` | PNP Move to Flash Take In 1 Complete | P012_ATS3_Unit/Auto_Running#76 | 5 |
| `LB618` | Right Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#77 | 3 |
| `LB619` | Right Arm Chuck not at Rotate Pos. Cofirm. | P012_ATS3_Unit/Auto_Running#77 | 3 |
| `LB620` | Right Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#78 | 2 |
| `LB621` | Right Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#78 | 3 |
| `LB622` | Right Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#79 | 3 |
| `LB623` | Right Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#79 | 3 |
| `LB624` | Right Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#80 | 2 |
| `LB625` | Right Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#80 | 3 |
| `LB626` | Left Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#81 | 3 |
| `LB627` | Left Arm Chuck not at Rotate Pos. Cofirm. | P012_ATS3_Unit/Auto_Running#81 | 3 |
| `LB628` | Left Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#82 | 2 |
| `LB629` | Left Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#82 | 3 |
| `LB630` | Left Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#83 | 3 |
| `LB631` | Left Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#83 | 3 |
| `LB632` | Leftt Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#84 | 2 |
| `LB633` | Leftt Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#84 | 3 |
| `LB649` | Auto Continue : Right Arm Flash 1 Take In Operation | P012_ATS3_Unit/Auto_Running#85 | 1 |
| `LB650` | SM10 WIP Trans Moving Start | P011_WIP_Transfer/AutoRunningOutput#7, P012_ATS3_Unit/Auto_Running#86 | 7 |
| `LB651` | Right Arm Flash 1 Take In Complete | P012_ATS3_Unit/Auto_Running#86 | 5 |
| `LB652` | Left Arm is Chuck Confirm. [No Moving] | P012_ATS3_Unit/Auto_Running#87 | 3 |
| `LB653` | Left Armis Unchuck Confirm [Move to WIP Take Out] | P012_ATS3_Unit/Auto_Running#87 | 4 |
| `LB654` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#94 | 1 |
| `LB655` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#94 | 4 |
| `LB656` | PNP Move to WIP TO Position Operation Start | P012_ATS3_Unit/Auto_Running#94 | 2 |
| `LB656A` | PNP Move to WIP TO Pos. Running | P012_ATS3_Unit/Auto_Running#94 | 2 |
| `LB657` | PNP Move to WIP TO Pos. Complete | P012_ATS3_Unit/Auto_Running#94 | 5 |
| `LB659` | Flash 1 Take In Operation Complete | P012_ATS3_Unit/Auto_Running#95 | 1 |
| `LB660` | Flash 1 Take Out Operation Start | P012_ATS3_Unit/Auto_Running#96 | 7 |
| `LB661` | PNP at Flash 1 Pos. Confim. | P012_ATS3_Unit/Auto_Running#97 | 3 |
| `LB662` | PNP not at Flash 1 Pos. | P012_ATS3_Unit/Auto_Running#97 | 3 |
| `LB663` | Auto Continue : PNP Move to Flash 1 Pos. | P012_ATS3_Unit/Auto_Running#98 | 1 |
| `LB664` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#99 | 1 |
| `LB665` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#99 | 4 |
| `LB666` | PNP Move to Flash 1 Take Out Pos. Operation Start | P012_ATS3_Unit/Auto_Running#99 | 2 |
| `LB666A` | PNP Move to Flash 1 Take Out Pos. Running | P012_ATS3_Unit/Auto_Running#99 | 2 |
| `LB667` | PNP Move to Flash 1 Take Out Pos. Complete | P012_ATS3_Unit/Auto_Running#99 | 5 |
| `LB668` | Left Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#100 | 3 |
| `LB669` | Left Arm Chuck not at Rotate Pos. | P012_ATS3_Unit/Auto_Running#100 | 3 |
| `LB670` | Left Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#101 | 2 |
| `LB671` | Left Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#101 | 3 |
| `LB672` | Left Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#102 | 3 |
| `LB673` | Left Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#102 | 3 |
| `LB674` | Left Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#103 | 2 |
| `LB675` | Left Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#103 | 3 |
| `LB676` | Right Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#104 | 3 |
| `LB677` | Right Arm Chuck not at Rotate Pos. | P012_ATS3_Unit/Auto_Running#104 | 3 |
| `LB678` | Right Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#105 | 2 |
| `LB679` | Right Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#105 | 3 |
| `LB680` | Right Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#106 | 3 |
| `LB681` | Right Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#106 | 3 |
| `LB682` | Right Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#107 | 2 |
| `LB683` | Right Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#107 | 3 |
| `LB699` | Auto Continue : Left Arm Flash 1 Take Out | P012_ATS3_Unit/Auto_Running#108 | 1 |
| `LB700` | Left Arm Flash 1 Take Out Operation Start | P012_ATS3_Unit/Auto_Running#109 | 5 |
| `LB701` | Left Arm Flash 1 Take Out Complete | P012_ATS3_Unit/Auto_Running#109 | 5 |
| `LB709` | Flash 1 Take Out Operation Complete | P012_ATS3_Unit/Auto_Running#110 | 1 |
| `LB710` | Flash 2 Take In Operation Start | P012_ATS3_Unit/Auto_Running#111 | 7 |
| `LB711` | PNP at Flash 2 Pos. Confirm. | P012_ATS3_Unit/Auto_Running#112 | 3 |
| `LB712` | PNP not at Flash 2 Pos. | P012_ATS3_Unit/Auto_Running#112 | 3 |
| `LB713` | Auto Continue : PNP Move to Flash 2 | P012_ATS3_Unit/Auto_Running#113 | 1 |
| `LB714` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#114 | 1 |
| `LB715` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#114 | 4 |
| `LB716` | PNP Move to Flash 2 Take In Operation Start | P012_ATS3_Unit/Auto_Running#114 | 2 |
| `LB716A` | PNP Move to Flash 2 Take In Running | P012_ATS3_Unit/Auto_Running#114 | 2 |
| `LB717` | PNP Move to Flash 2 Take In Complete | P012_ATS3_Unit/Auto_Running#114 | 5 |
| `LB718` | Right Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#115 | 3 |
| `LB719` | Right Arm Chuck not at Rotate Pos. Cofirm. | P012_ATS3_Unit/Auto_Running#115 | 3 |
| `LB720` | Right Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#116 | 2 |
| `LB721` | Right Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#116 | 3 |
| `LB722` | Right Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#117 | 3 |
| `LB723` | Right Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#117 | 3 |
| `LB724` | Right Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#118 | 2 |
| `LB725` | Right Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#118 | 3 |
| `LB726` | Left Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#119 | 3 |
| `LB727` | Left Arm Chuck not at Rotate Pos. Cofirm. | P012_ATS3_Unit/Auto_Running#119 | 3 |
| `LB728` | Left Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#120 | 2 |
| `LB729` | Leftt Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#120 | 3 |
| `LB730` | Left Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#121 | 3 |
| `LB731` | Left Arm Y Axis not at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#121 | 3 |
| `LB732` | Left Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#122 | 2 |
| `LB733` | Left Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#122 | 3 |
| `LB749` | Auto Continue : Right Arm Flash 2 Take In Operation | P012_ATS3_Unit/Auto_Running#123 | 1 |
| `LB750` | Right Arm Flash 2 Take In Operation Start | P012_ATS3_Unit/Auto_Running#124 | 5 |
| `LB751` | Right Arm Flash 2 Take In Complete | P012_ATS3_Unit/Auto_Running#124 | 5 |
| `LB752` | Left Arm is Chuck Confirm [No Moving] | P012_ATS3_Unit/Auto_Running#125 | 3 |
| `LB753` | Left Arm is Unhuck Confirm [Moving to WIP Take Out] | P012_ATS3_Unit/Auto_Running#125 | 4 |
| `LB754` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#132 | 1 |
| `LB755` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#132 | 4 |
| `LB756` | PNP Move to WIP TO Position Operation Start | P012_ATS3_Unit/Auto_Running#132 | 2 |
| `LB756A` | PNP Move to WIP TO Pos. Running | P012_ATS3_Unit/Auto_Running#132 | 2 |
| `LB757` | PNP Move to WIP TO Pos. Complete | P012_ATS3_Unit/Auto_Running#132 | 5 |
| `LB759` | Flash 2 Take In Operation Complete | P012_ATS3_Unit/Auto_Running#133 | 1 |
| `LB760` | Flash 2 Take Out Operation Start | P012_ATS3_Unit/Auto_Running#134 | 7 |
| `LB761` | PNP at Flash 2 Pos. Confim. | P012_ATS3_Unit/Auto_Running#135 | 3 |
| `LB762` | PNP not at Flash 2 Pos. | P012_ATS3_Unit/Auto_Running#135 | 3 |
| `LB763` | Auto Continue : PNP Move to Flash 2 Pos. | P012_ATS3_Unit/Auto_Running#136 | 1 |
| `LB764` | PNP Moving Interlock Request | P012_ATS3_Unit/Auto_Running#137 | 1 |
| `LB765` | PNP Moving Interlock Confirm. | P012_ATS3_Unit/Auto_Running#137 | 4 |
| `LB766` | PNP Move to Flash 2 Take Out Pos. Operation Start | P012_ATS3_Unit/Auto_Running#137 | 2 |
| `LB766A` | PNP Move to Flash 2 Take Out Pos. Running | P012_ATS3_Unit/Auto_Running#137 | 2 |
| `LB767` | PNP Move to Flash 2 Take Out Pos. Complete | P012_ATS3_Unit/Auto_Running#137 | 5 |
| `LB768` | Left Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#138 | 3 |
| `LB769` | Left Arm Chuck not at Rotate Pos. | P012_ATS3_Unit/Auto_Running#138 | 3 |
| `LB770` | Left Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#139 | 2 |
| `LB771` | Left Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#139 | 3 |
| `LB772` | Left Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#140 | 3 |
| `LB773` | Left Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#140 | 3 |
| `LB774` | Left Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#141 | 2 |
| `LB775` | Left Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#141 | 3 |
| `LB776` | Right Arm Chuck at Rotate Pos. Confirm. | P012_ATS3_Unit/Auto_Running#142 | 3 |
| `LB777` | Right Arm Chuck not at Rotate Pos. | P012_ATS3_Unit/Auto_Running#142 | 3 |
| `LB778` | Right Arm Chuck Rotate Operation Start | P012_ATS3_Unit/Auto_Running#143 | 2 |
| `LB779` | Right Arm Chuck Rotate Complete | P012_ATS3_Unit/Auto_Running#143 | 3 |
| `LB780` | Right Arm Y Axis at FWD Pos. Confirm. | P012_ATS3_Unit/Auto_Running#144 | 3 |
| `LB781` | Right Arm Y Axis not at FWD Pos. | P012_ATS3_Unit/Auto_Running#144 | 3 |
| `LB782` | Right Arm Y Axis FWD Operation Start | P012_ATS3_Unit/Auto_Running#145 | 2 |
| `LB783` | Right Arm Y Axis FWD Complete | P012_ATS3_Unit/Auto_Running#145 | 3 |
| `LB799` | Auto Continue : Left Arm Flash 2 Take Out | P012_ATS3_Unit/Auto_Running#146 | 1 |
| `LB800` | Memory WIP Trans. Confirm. | P001_HMI/DataSearch#28, P011_WIP_Transfer/AutoRunningOutput#9, P011_WIP_Transfer/AutoRunningOutput#13 | 26 |
| `LB801` | ATS Finish Process Memory | P011_WIP_Transfer/AutoRunningOutput#10, P011_WIP_Transfer/AutoRunningOutput#14, P012_ATS3_Unit/Auto_Running#147 | 22 |
| `LB802` | ATS Work Finish Take Out from WIP | P011_WIP_Transfer/AutoRunningOutput#11, P011_WIP_Transfer/AutoRunningOutput#15, P014_Flash1/Memory_Feeding#3 | 19 |
| `LB803` | Unit cycle stop off auxiliary 1 | P001_HMI/DataSearch#32 | 2 |
| `LB807` | MD cycle stop off | P001_HMI/DataSearch#33 | 1 |
| `LB809` | Flash 2 Take Out Operation Complete | P012_ATS3_Unit/Auto_Running#148 | 1 |
| `LB810` | Air Blow FG Take Out Memory | P001_HMI/DataSearch#34, P011_WIP_Transfer/AutoRunningOutput#12, P011_WIP_Transfer/AutoRunningOutput#16 | 2 |
| `LB815` | 段取り抽出OK完了 | P001_HMI/DataSearch#35 | 6 |
| `LB816` | 段取り抽出NG完了 | (tidak ditulis di project ini) | 2 |
| `LB817` | Setup extraction MD start condition | (tidak ditulis di project ini) | 1 |
| `LB820` | Flash2 Master OK Check Compl. | P001_HMI/DataSearch#36, P012_ATS3_Unit/Memory_Feeding#36, P012_ATS3_Unit/Memory_Feeding#38 | 7 |
| `LB821` | Flash 2 Master NG Check Compl. | P012_ATS3_Unit/Memory_Feeding#37, P012_ATS3_Unit/Memory_Feeding#38, P014_Flash1/Memory_Feeding#6 | 5 |
| `LB850` | First Cycle Flash 2 Memory | P014_Flash1/Memory_Feeding#11, P014_Flash1/Memory_Feeding#12, P015_Flash2/Memory_Feeding#12 | 8 |
| `LB900` | Left Arm Take In Operation Start | P012_ATS3_Unit/ATS3_PP#1 | 5 |
| `LB901` | Left Arm Take Out Operation Start | P012_ATS3_Unit/ATS3_PP#2 | 7 |
| `LB905` | Right Arm Take In Operation Start | P012_ATS3_Unit/ATS3_PP#3 | 5 |
| `LB906` | Right Arm Take Out Operation Start | P012_ATS3_Unit/ATS3_PP#4 | 3 |
| `LB910` | Left Arm Take In Operartion Starting | P012_ATS3_Unit/ATS3_PP#5 | 1 |
| `LB911` | Left Arm Moving Down Start Opertion | P012_ATS3_Unit/ATS3_PP#6 | 2 |
| `LB912` | Left Arm Moving Down Complete | P012_ATS3_Unit/ATS3_PP#6 | 3 |
| `LB913` | Auto Continue : Left Arm Unchuck | P012_ATS3_Unit/ATS3_PP#7 | 1 |
| `LB914` | Left Arm Unhuck Start Operation | P012_ATS3_Unit/ATS3_PP#8 | 2 |
| `LB915` | Left Arm Unchuck Complete | P012_ATS3_Unit/ATS3_PP#8 | 5 |
| `LB916` | Left Arm Unchuck Normal Confirm. | P012_ATS3_Unit/ATS3_PP#10 | 9 |
| `LB917` | Left Arm Unchuck Abnormal | P012_ATS3_Unit/ATS3_PP#10 | 2 |
| `LB920` | Left Arm Unchuck Normal | P012_ATS3_Unit/ATS3_PP#11 | 1 |
| `LB921` | Left Arm Moving Up Start Operation | P012_ATS3_Unit/ATS3_PP#9 | 2 |
| `LB922` | Left Arm Moving Up Complete | P012_ATS3_Unit/ATS3_PP#9 | 3 |
| `LB949` | Left Arm Take In Operation Complete | P012_ATS3_Unit/ATS3_PP#12 | 2 |
| `LB960` | Left Arm Take Out Operation Starting | P012_ATS3_Unit/ATS3_PP#13 | 1 |
| `LB961` | Left Arm Moving Down Start Operation | P012_ATS3_Unit/ATS3_PP#14 | 2 |
| `LB962` | Left Arm Moving Down Complete | P012_ATS3_Unit/ATS3_PP#14 | 3 |
| `LB963` | Auto Continue : Left Arm Chuck | P012_ATS3_Unit/ATS3_PP#15 | 1 |
| `LB964` | Left Arm Chuck Start Operation | P012_ATS3_Unit/ATS3_PP#16 | 2 |
| `LB965` | Left Arm Chuck Complete | P012_ATS3_Unit/ATS3_PP#16 | 6 |
| `LB966` | Left Arm Chuck Normal Confirm. | P012_ATS3_Unit/ATS3_PP#18 | 8 |
| `LB967` | Left Arm Chuck Abnormal | P012_ATS3_Unit/ATS3_PP#18 | 2 |
| `LB970` | Left Arm Chuck Normal | P012_ATS3_Unit/ATS3_PP#19 | 1 |
| `LB971` | Left Arm Moving UP Start Operation | P012_ATS3_Unit/ATS3_PP#17 | 2 |
| `LB972` | Left Arm Moving Up Complete | P012_ATS3_Unit/ATS3_PP#17 | 3 |
| `LB999` | Left Arm Take Out Operation Complete | P012_ATS3_Unit/ATS3_PP#20 | 3 |
| `LD043[0].FEED.B[0]` |  | (tidak ditulis di project ini) | 1 |
| `LD043[1].FEED.B[0]` |  | (tidak ditulis di project ini) | 2 |
| `LD800[1]` |  | (tidak ditulis di project ini) | 1 |
| `LD800[2]` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Gripper[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Gripper[2].LSComb.LS` |  | (tidak ditulis di project ini) | 12 |
| `LPPSelectDt.Gripper[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Gripper[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Gripper[5].LSComb.LS` |  | (tidak ditulis di project ini) | 20 |
| `LPPSelectDt.Gripper[PW422_002].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Rotate[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Rotate[2].LSComb.LS` |  | (tidak ditulis di project ini) | 16 |
| `LPPSelectDt.Rotate[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Rotate[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.Rotate[5].LSComb.LS` |  | (tidak ditulis di project ini) | 15 |
| `LPPSelectDt.Rotate[PW422_001].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.YAxis[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.YAxis[2].LSComb.LS` |  | (tidak ditulis di project ini) | 20 |
| `LPPSelectDt.YAxis[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.YAxis[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.YAxis[5].LSComb.LS` |  | (tidak ditulis di project ini) | 28 |
| `LPPSelectDt.YAxis[PW422_004].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.ZAxis[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.ZAxis[2].LSComb.LS` |  | (tidak ditulis di project ini) | 6 |
| `LPPSelectDt.ZAxis[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.ZAxis[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LPPSelectDt.ZAxis[5].LSComb.LS` |  | (tidak ditulis di project ini) | 33 |
| `LPPSelectDt.ZAxis[PW422_003].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `LT000` |  | P000_Main/Timers#1 | 28 |
| `LT000.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT001` |  | P000_Main/Timers#2 | 8 |
| `LT001.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT002` |  | (tidak ditulis di project ini) | 2 |
| `LT003` |  | P000_Main/Timers#3 | 2 |
| `LT004` |  | P000_Main/Timers#4 | 4 |
| `LT005` |  | P000_Main/Timers#5 | 4 |
| `LT006` |  | P000_Main/Timers#6 | 2 |
| `LT007` |  | P000_Main/Timers#7 | 2 |
| `LT008` |  | (tidak ditulis di project ini) | 1 |
| `LT009` |  | (tidak ditulis di project ini) | 1 |
| `LT010` | Delay | (tidak ditulis di project ini) | 6 |
| `LT010.Q` |  | (tidak ditulis di project ini) | 3 |
| `LT011` | Delay ATS FG Not Processed in Air Blow | (tidak ditulis di project ini) | 2 |
| `LT011.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT012` |  | (tidak ditulis di project ini) | 3 |
| `LT012.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT013` |  | (tidak ditulis di project ini) | 2 |
| `LT013.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT014` |  | (tidak ditulis di project ini) | 1 |
| `LT015` |  | (tidak ditulis di project ini) | 1 |
| `LT020` | Delay Air Source FG Store Drop | (tidak ditulis di project ini) | 2 |
| `LT020.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT021` | Delay Air Source FG Store Error | (tidak ditulis di project ini) | 3 |
| `LT021.Q` |  | (tidak ditulis di project ini) | 3 |
| `LT022` | Delay Cover FG Store Motion Faultt | (tidak ditulis di project ini) | 1 |
| `LT022.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT030` |  | (tidak ditulis di project ini) | 1 |
| `LT041` |  | (tidak ditulis di project ini) | 1 |
| `LT042` |  | (tidak ditulis di project ini) | 1 |
| `LT043` |  | (tidak ditulis di project ini) | 1 |
| `LT044` |  | (tidak ditulis di project ini) | 1 |
| `LT050` |  | (tidak ditulis di project ini) | 5 |
| `LT050.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT051` |  | (tidak ditulis di project ini) | 4 |
| `LT051.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT052` |  | (tidak ditulis di project ini) | 4 |
| `LT052.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT053` |  | (tidak ditulis di project ini) | 2 |
| `LT054` | Delay after Take In | (tidak ditulis di project ini) | 1 |
| `LT054.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT060` | Delay Flash 2 Debugging Mode | (tidak ditulis di project ini) | 3 |
| `LT060.Q` |  | (tidak ditulis di project ini) | 3 |
| `LT061` | Delay Flash 2 Continous Debugging | (tidak ditulis di project ini) | 2 |
| `LT061.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT062` | Delay Flash 1 Use Front PN | (tidak ditulis di project ini) | 2 |
| `LT062.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT070` | Delay | (tidak ditulis di project ini) | 1 |
| `LT070.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT071` | Delay | (tidak ditulis di project ini) | 1 |
| `LT071.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT072` | Delay | (tidak ditulis di project ini) | 1 |
| `LT072.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT075` | Delay Flash 1 Disable | (tidak ditulis di project ini) | 1 |
| `LT075.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT076` | Delay Flash 2 Disable | (tidak ditulis di project ini) | 1 |
| `LT076.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT077` | Delay Bypass Airblow | (tidak ditulis di project ini) | 1 |
| `LT077.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT078` | Delay Hold&Release Chutter for Box Changing | (tidak ditulis di project ini) | 1 |
| `LT078.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT079` | Master Mode Delay | (tidak ditulis di project ini) | 1 |
| `LT079.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT080` | Delay Bypass Judgment MRC | (tidak ditulis di project ini) | 1 |
| `LT080.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT100` |  | (tidak ditulis di project ini) | 2 |
| `LT100.Q` |  | (tidak ditulis di project ini) | 4 |
| `LT101` |  | (tidak ditulis di project ini) | 2 |
| `LT101.Q` |  | (tidak ditulis di project ini) | 1 |
| `LT102` |  | (tidak ditulis di project ini) | 4 |
| `LT102.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT103` |  | (tidak ditulis di project ini) | 1 |
| `LT104` |  | (tidak ditulis di project ini) | 1 |
| `LT105` |  | (tidak ditulis di project ini) | 1 |
| `LT106` |  | (tidak ditulis di project ini) | 1 |
| `LT110` |  | (tidak ditulis di project ini) | 2 |
| `LT112` | Delay Cover Open | (tidak ditulis di project ini) | 2 |
| `LT112.Q` |  | (tidak ditulis di project ini) | 2 |
| `LT150` |  | (tidak ditulis di project ini) | 1 |
| `LT816` |  | (tidak ditulis di project ini) | 1 |
| `LT816.Q` |  | (tidak ditulis di project ini) | 1 |
| `LTMR[1]` |  | (tidak ditulis di project ini) | 1 |
| `LTMR[2]` |  | (tidak ditulis di project ini) | 1 |
| `LT_000` |  | (tidak ditulis di project ini) | 1 |
| `LeftArmTInOpr` |  | P012_ATS3_Unit/Auto_Running_Output#1 | 2 |
| `LeftArmTOutOpr` |  | P012_ATS3_Unit/Auto_Running_Output#2 | 2 |
| `LeftGrpPot` |  | P012_ATS3_Unit/Auto_Running_Output#3 | 0 |
| `MASTER_MODE` | Master Check Mode | P000_Main/Station_Output#20 | 19 |
| `MASTER_ON` | Master ON ATS Delay | P000_Main/Station_Output#3 | 19 |
| `MASTER_ON_FLASH1` | Master ON Flash 1 Delay | P000_Main/Station_Output#4 | 3 |
| `MASTER_ON_FLASH2` | Master ON Flash 2 Delay | P000_Main/Station_Output#5 | 3 |
| `MASTER_READY` | Master ON Confirmation | P000_Main/Device_Input#6 | 44 |
| `MC_ERR_STA.B[4]` |  | (tidak ditulis di project ini) | 2 |
| `MC_ERR_STA.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `MC_ERR_STA.B[6]` |  | (tidak ditulis di project ini) | 2 |
| `MC_ERR_STA.B[7]` |  | (tidak ditulis di project ini) | 2 |
| `MC_ERR_STA.MC_ERR_BOOL[4]` |  | (tidak ditulis di project ini) | 3 |
| `MC_ERR_STA.MC_ERR_BOOL[5]` |  | (tidak ditulis di project ini) | 3 |
| `MC_ERR_STA.MC_ERR_BOOL[6]` |  | (tidak ditulis di project ini) | 3 |
| `MC_ERR_STA.MC_ERR_BOOL[7]` |  | (tidak ditulis di project ini) | 3 |
| `MC_HOME_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX05` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX06` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX07` |  | (tidak ditulis di project ini) | 1 |
| `MC_HOME_AX08` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX05` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX06` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX07` |  | (tidak ditulis di project ini) | 1 |
| `MC_JOG_AX08` |  | (tidak ditulis di project ini) | 1 |
| `MC_MAJOR_FAULT` | MC ALL STOP FAULT LEVEL | P002_ServoMain/Fault#14 | 1 |
| `MC_MINOR_FAULT` | MC SLIGHT FAULT LEVEL | P002_ServoMain/Fault#16 | 1 |
| `MC_OBSERVATION` | MC MONITOR INFORMATION LEVEL | P002_ServoMain/Fault#17 | 1 |
| `MC_OVERRIDE_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX05` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX06` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX07` |  | (tidak ditulis di project ini) | 1 |
| `MC_OVERRIDE_AX08` |  | (tidak ditulis di project ini) | 1 |
| `MC_PARTIAL_FAULT` | MC PARTIAL STOP FAULT LEVEL | P002_ServoMain/Fault#15 | 1 |
| `MC_PWR_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX05` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX06` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX07` |  | (tidak ditulis di project ini) | 1 |
| `MC_PWR_AX08` |  | (tidak ditulis di project ini) | 1 |
| `MC_RESET_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_RESET_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_RESET_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_RESET_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_RESET_AX05` |  | (tidak ditulis di project ini) | 4 |
| `MC_SM10_MOVE` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX01` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX02` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX03` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX04` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX05` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX06` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX07` |  | (tidak ditulis di project ini) | 1 |
| `MC_STOP_AX08` |  | (tidak ditulis di project ini) | 1 |
| `MF[001]` |  | (tidak ditulis di project ini) | 1 |
| `MF[1]` |  | P011_WIP_Transfer/Fault#11 | 1 |
| `MF[51]` |  | P014_Flash1/Fault#14 | 1 |
| `MF[76]` |  | P015_Flash2/Fault#14 | 1 |
| `MSTR_RDY_FLASH1` | Master ON Confirm Flash1 | P000_Main/Device_Input#14 | 7 |
| `MSTR_RDY_FLASH2` | Master ON Confirm Flash 2 | P000_Main/Device_Input#18 | 5 |
| `MSTR_RDY_SHUTTE` | Master ON Confirm FG Chutter | P000_Main/Device_Input#22 | 9 |
| `NG` | NG完了 | (tanpa program)/LadderBody#27 | 1 |
| `NJ_TO_NX_Bool[10]` |  | (tidak ditulis di project ini) | 14 |
| `NJ_TO_NX_Bool[11]` |  | (tidak ditulis di project ini) | 1 |
| `NJ_TO_NX_Bool[12]` |  | (tidak ditulis di project ini) | 1 |
| `NJ_TO_NX_Bool[15]` |  | (tidak ditulis di project ini) | 4 |
| `NJ_TO_NX_Bool[16]` |  | (tidak ditulis di project ini) | 4 |
| `NJ_TO_NX_Bool[1]` |  | (tidak ditulis di project ini) | 1 |
| `NJ_TO_NX_Bool[2]` |  | (tidak ditulis di project ini) | 15 |
| `NJ_TO_NX_Bool[3]` |  | (tidak ditulis di project ini) | 17 |
| `NJ_TO_NX_Bool[4]` |  | (tidak ditulis di project ini) | 5 |
| `NJ_TO_NX_Bool[5]` |  | (tidak ditulis di project ini) | 4 |
| `NJ_TO_NX_Bool[6]` |  | (tidak ditulis di project ini) | 6 |
| `NJ_TO_NX_Bool[7]` |  | (tidak ditulis di project ini) | 6 |
| `NJ_TO_NX_Bool[8]` |  | (tidak ditulis di project ini) | 1 |
| `NJ_TO_NX_Bool[9]` |  | (tidak ditulis di project ini) | 15 |
| `NOP` | No Operation | P000_Main/Station_Input#1, P000_Main/Operation#1, P200_COMM/HMI_Input#1 | 0 |
| `NX_TO_CP2E_Word[15]` |  | P011_WIP_Transfer/StationOutput#33 | 0 |
| `NX_TO_CP2E_Word[16]` |  | P011_WIP_Transfer/StationOutput#34 | 0 |
| `NX_TO_CP2E_Word[1]` |  | P011_WIP_Transfer/StationOutput#29 | 1 |
| `NX_TO_CP2E_Word[2]` |  | P011_WIP_Transfer/StationOutput#30 | 0 |
| `NX_TO_CP2E_Word[8]` |  | P011_WIP_Transfer/StationOutput#31 | 0 |
| `NX_TO_CP2E_Word[9]` |  | P011_WIP_Transfer/StationOutput#32 | 0 |
| `NX_TO_NJ_Bool[10]` |  | P012_ATS3_Unit/Station_Output#40 | 0 |
| `NX_TO_NJ_Bool[11]` |  | P012_ATS3_Unit/Station_Output#41 | 0 |
| `NX_TO_NJ_Bool[13]` |  | P012_ATS3_Unit/Station_Output#42 | 3 |
| `NX_TO_NJ_Bool[1]` |  | P012_ATS3_Unit/Station_Output#37 | 0 |
| `NX_TO_NJ_Bool[2]` |  | P012_ATS3_Unit/Station_Output#38 | 0 |
| `NX_TO_NJ_Bool[8]` |  | P012_ATS3_Unit/Station_Output#39 | 0 |
| `NoFLT` | 異常でない$tNOT FAULT | (tanpa program)/LadderBody#3, (tanpa program)/LadderBody#3, (tanpa program)/LadderBody#3 | 0 |
| `Noacktimer` |  | (tidak ditulis di project ini) | 1 |
| `Noresponsetimer` |  | (tidak ditulis di project ini) | 1 |
| `OK` | OK完了 | (tanpa program)/LadderBody#26 | 1 |
| `OUT_TO_NL20[0].FEED.B[8]` |  | P000_Main/QRReader#4 | 0 |
| `OUT_TO_NL20[1].FEED.B[0]` |  | P000_Main/QRReader#5 | 1 |
| `PB003_001` | PB Discharge Mode | (tidak ditulis di project ini) | 1 |
| `PB003_002` | Flash 1 Reconnect. | (tidak ditulis di project ini) | 1 |
| `PB003_003` | Flash 2 reconnect | (tidak ditulis di project ini) | 1 |
| `PB004_01R` |  | (tidak ditulis di project ini) | 1 |
| `PB004_01S` |  | (tidak ditulis di project ini) | 2 |
| `PB004_02R` |  | (tidak ditulis di project ini) | 1 |
| `PB004_02S` |  | (tidak ditulis di project ini) | 1 |
| `PB004_03R` | PB Flash1 Ind. Home Pos. | (tidak ditulis di project ini) | 1 |
| `PB004_03S` | PB Flash1 Unit 1 Cycle Start | (tidak ditulis di project ini) | 1 |
| `PB004_04R` | PB Flash 2 Ind. Home Pos. | (tidak ditulis di project ini) | 1 |
| `PB004_04S` | PB Flash 2 1 Cycle Start | (tidak ditulis di project ini) | 1 |
| `PB008[14]` |  | (tidak ditulis di project ini) | 1 |
| `PB008[15]` |  | (tidak ditulis di project ini) | 3 |
| `PB008[1]` |  | (tidak ditulis di project ini) | 1 |
| `PB013_001` | PB Without Product | (tidak ditulis di project ini) | 1 |
| `PB013_002` | PB Bypass Airblow | (tidak ditulis di project ini) | 3 |
| `PB013_003` | PB MTC Operation Spare | (tidak ditulis di project ini) | 6 |
| `PB013_004` | PB Bypass Safety Sensor | (tidak ditulis di project ini) | 1 |
| `PB013_005` |  | (tidak ditulis di project ini) | 2 |
| `PB013_006` |  | (tidak ditulis di project ini) | 2 |
| `PB013_008` | PB Teaching Mode ON/OFF | (tidak ditulis di project ini) | 1 |
| `PB013_009` | PB Flash 1 Disable | (tidak ditulis di project ini) | 2 |
| `PB013_010` | PB Flash 2 Disable | (tidak ditulis di project ini) | 2 |
| `PB013_012` | PB Bypass Judgment MRC | (tidak ditulis di project ini) | 1 |
| `PB060[1]` |  | (tidak ditulis di project ini) | 3 |
| `PB060[2]` |  | (tidak ditulis di project ini) | 1 |
| `PB060[3]` |  | (tidak ditulis di project ini) | 4 |
| `PB060[4]` |  | (tidak ditulis di project ini) | 4 |
| `PB060[5]` |  | P001_HMI/DataSetup#54 | 2 |
| `PB064_001` |  | (tidak ditulis di project ini) | 1 |
| `PB070_001` |  | (tidak ditulis di project ini) | 1 |
| `PB070_002` |  | P001_HMI/Counter#47 | 1 |
| `PB080_001` |  | (tidak ditulis di project ini) | 1 |
| `PB080_002` |  | P001_HMI/TimerS#18 | 1 |
| `PB351_000` |  | (tidak ditulis di project ini) | 3 |
| `PB351_001` |  | (tidak ditulis di project ini) | 3 |
| `PB351_002` |  | (tidak ditulis di project ini) | 3 |
| `PB352_000` |  | (tidak ditulis di project ini) | 1 |
| `PB353_000` |  | (tidak ditulis di project ini) | 1 |
| `PB354_000` |  | (tidak ditulis di project ini) | 3 |
| `PB354_001` |  | (tidak ditulis di project ini) | 1 |
| `PB354_002` |  | (tidak ditulis di project ini) | 1 |
| `PB355_000` |  | (tidak ditulis di project ini) | 24 |
| `PB356_001` |  | (tidak ditulis di project ini) | 1 |
| `PB361_000` |  | (tidak ditulis di project ini) | 2 |
| `PB361_001` |  | (tidak ditulis di project ini) | 2 |
| `PB361_002` |  | (tidak ditulis di project ini) | 3 |
| `PB361_003` |  | (tidak ditulis di project ini) | 16 |
| `PB361_004` |  | (tidak ditulis di project ini) | 4 |
| `PB362_000` |  | (tidak ditulis di project ini) | 1 |
| `PB363_000` |  | (tidak ditulis di project ini) | 2 |
| `PB363_001` |  | (tidak ditulis di project ini) | 2 |
| `PB363_002` |  | (tidak ditulis di project ini) | 3 |
| `PB363_003` |  | (tidak ditulis di project ini) | 2 |
| `PB363_005` |  | (tidak ditulis di project ini) | 1 |
| `PB364_003` |  | (tidak ditulis di project ini) | 2 |
| `PB411_01M` |  | (tidak ditulis di project ini) | 1 |
| `PB411_01R` |  | (tidak ditulis di project ini) | 1 |
| `PB411_02M` |  | (tidak ditulis di project ini) | 1 |
| `PB411_02R` |  | (tidak ditulis di project ini) | 1 |
| `PB411_03M` |  | (tidak ditulis di project ini) | 1 |
| `PB411_03R` |  | (tidak ditulis di project ini) | 1 |
| `PB411_04M` |  | (tidak ditulis di project ini) | 1 |
| `PB411_04R` |  | (tidak ditulis di project ini) | 1 |
| `PB412_01M` | PB Ind. Shutter FG Cover Open | (tidak ditulis di project ini) | 1 |
| `PB412_01R` | PB Ind. Shutter FG Cover Close | (tidak ditulis di project ini) | 1 |
| `PB412_02M` | PB Ind. Add Shutter FG Cover Open | (tidak ditulis di project ini) | 1 |
| `PB412_02R` | PB Ind. Add Shutter FG Cover Close | (tidak ditulis di project ini) | 1 |
| `PB421_01R` |  | (tidak ditulis di project ini) | 1 |
| `PB421_02M` |  | (tidak ditulis di project ini) | 1 |
| `PB421_02R` |  | (tidak ditulis di project ini) | 1 |
| `PB421_03M` |  | (tidak ditulis di project ini) | 1 |
| `PB421_03R` |  | (tidak ditulis di project ini) | 1 |
| `PB421_04M` |  | (tidak ditulis di project ini) | 1 |
| `PB421_04R` |  | (tidak ditulis di project ini) | 1 |
| `PB421_05M` |  | (tidak ditulis di project ini) | 1 |
| `PB421_05R` |  | (tidak ditulis di project ini) | 1 |
| `PB422_01M` |  | (tidak ditulis di project ini) | 1 |
| `PB422_01R` |  | (tidak ditulis di project ini) | 1 |
| `PB422_02M` |  | (tidak ditulis di project ini) | 1 |
| `PB422_02R` |  | (tidak ditulis di project ini) | 1 |
| `PB422_03M` |  | (tidak ditulis di project ini) | 1 |
| `PB422_03R` |  | (tidak ditulis di project ini) | 1 |
| `PB422_04M` |  | (tidak ditulis di project ini) | 1 |
| `PB422_04R` |  | (tidak ditulis di project ini) | 1 |
| `PB422_05M` |  | (tidak ditulis di project ini) | 1 |
| `PB431_01M` | PB Ind. Flash 1 Cover Close | (tidak ditulis di project ini) | 1 |
| `PB431_01R` | PB Ind. Flash 1 Cover Open | (tidak ditulis di project ini) | 1 |
| `PB431_02M` | PB Flash 1 Debugging Start | (tidak ditulis di project ini) | 1 |
| `PB431_03M` | PB Flash 1 Debugging Mode | (tidak ditulis di project ini) | 2 |
| `PB431_03R` | PB Flash 1 Continous Debugging | (tidak ditulis di project ini) | 1 |
| `PB431_04M` | PB Flash 1 Debug Mode Use Front PN | (tidak ditulis di project ini) | 1 |
| `PB441_01M` | PB Ind. Flash 2 Cover Close | (tidak ditulis di project ini) | 1 |
| `PB441_01R` | PB Ind. Flash 2 Cover Open | (tidak ditulis di project ini) | 1 |
| `PB441_02M` | PB Flash 2 Debugging Start | (tidak ditulis di project ini) | 1 |
| `PB441_03M` | PB Flash 2 Debugging Mode | (tidak ditulis di project ini) | 1 |
| `PB500_001` | PB Reset ATS Finish Process Memory | (tidak ditulis di project ini) | 1 |
| `PB500_002` | PB Reset ATS FG Take Out Memory | (tidak ditulis di project ini) | 1 |
| `PB500_003` | PB Reset AirBlow Finish Memory | (tidak ditulis di project ini) | 1 |
| `PB500_004` | PB Reset AirBlow FG Take Out Memory | (tidak ditulis di project ini) | 1 |
| `PB500_015` |  | (tidak ditulis di project ini) | 1 |
| `PB700_000` | PB Master Check Mode | (tidak ditulis di project ini) | 5 |
| `PB700_001` | PB MRC Master OK Start | (tidak ditulis di project ini) | 2 |
| `PB700_003` | PB MRC Master NG Start | (tidak ditulis di project ini) | 2 |
| `PB700_005` | PB Flash1 Master OK Start | (tidak ditulis di project ini) | 2 |
| `PB700_007` | PB Flash 1 Master NG Start | (tidak ditulis di project ini) | 2 |
| `PB700_009` | PB Flash 2 Master OK Start | (tidak ditulis di project ini) | 2 |
| `PB700_011` | PB Flash 2 Master NG Start | (tidak ditulis di project ini) | 2 |
| `PBTest` |  | (tidak ditulis di project ini) | 1 |
| `PBTest2` |  | (tidak ditulis di project ini) | 1 |
| `PB_ALARM_RST` |  | (tidak ditulis di project ini) | 3 |
| `PB_ALL_HOMEPOS` | PB All Home Pos. | P000_Main/HMI_Input#1 | 0 |
| `PB_AUTO_RUN` | Automatic start button | P000_Main/Device_Input#7 | 2 |
| `PB_CYCLE_STOP` | PB Cycle Stop | (tidak ditulis di project ini) | 1 |
| `PB_EMERGENCY_STOP` | PB Emergency Stop | P000_Main/Device_Input#1 | 1 |
| `PB_EMG_STOP_FLASH1` | PB Emergency Stop Flash 1 | P000_Main/Device_Input#12 | 1 |
| `PB_EMG_STOP_FLASH2` | PB Emergency Stop Flash 2 | P000_Main/Device_Input#16 | 1 |
| `PB_EMG_STOP_SHUTTE` | PB Emergency Stop Shutte Pokayoke | P000_Main/Device_Input#20 | 1 |
| `PB_FAULT_RST` | PB Fault Reset | (tidak ditulis di project ini) | 33 |
| `PB_FLT_RST` |  | (tidak ditulis di project ini) | 1 |
| `PB_MASTER_ON` | PB Master ON | P000_Main/Device_Input#5 | 2 |
| `PB_MSTR_ON_FLASH1` | PB Master ON Flash 1 | P000_Main/Device_Input#11 | 0 |
| `PB_MSTR_ON_FLASH2` | PB Master ON Flash 2 | P000_Main/Device_Input#15 | 0 |
| `PB_MSTR_ON_SHUTTE` | PB Master ON Shutte Pokayoke | P000_Main/Device_Input#19 | 0 |
| `PB_OP_ATS_MODE` | Operator or ATS Mode | P000_Main/Device_Input#10 | 4 |
| `PB_RELEASE_SHUTTE` | PB Release Shutte Pokayoke | P000_Main/Device_Input#25 | 1 |
| `PB_RLS_FLASH1` | PB Release Flash 1 | P000_Main/Device_Input#23 | 2 |
| `PB_RLS_FLASH2` | PB Release Flash 2 | P000_Main/Device_Input#24 | 2 |
| `PB_RLS_LEFT` | PB Release Left Gripper | P000_Main/Device_Input#8 | 0 |
| `PB_RLS_RIGHT` | PB Release Right Gripper | P000_Main/Device_Input#9 | 0 |
| `PC071_011` |  | P001_HMI/Counter#2 | 0 |
| `PC071_012` |  | P001_HMI/Counter#3 | 1 |
| `PC071_021` |  | P001_HMI/Counter#5 | 0 |
| `PC071_022` |  | P001_HMI/Counter#6 | 1 |
| `PC071_031` |  | P001_HMI/Counter#8 | 0 |
| `PC071_032` |  | P001_HMI/Counter#9 | 1 |
| `PC071_041` |  | P001_HMI/Counter#11 | 0 |
| `PC071_042` |  | P001_HMI/Counter#12 | 1 |
| `PC071_051` |  | P001_HMI/Counter#14 | 0 |
| `PC071_052` |  | P001_HMI/Counter#15 | 1 |
| `PC071_061` |  | P001_HMI/Counter#17 | 0 |
| `PC071_062` |  | P001_HMI/Counter#18 | 1 |
| `PC071_071` |  | P001_HMI/Counter#20 | 0 |
| `PC071_072` |  | P001_HMI/Counter#21 | 1 |
| `PC071_081` |  | P001_HMI/Counter#23 | 0 |
| `PC071_082` |  | P001_HMI/Counter#24 | 1 |
| `PC072_091` |  | P001_HMI/Counter#26 | 0 |
| `PC072_092` |  | P001_HMI/Counter#27 | 1 |
| `PC072_101` |  | P001_HMI/Counter#29 | 0 |
| `PC072_102` |  | P001_HMI/Counter#30 | 1 |
| `PC072_111` |  | P001_HMI/Counter#32 | 0 |
| `PC072_112` |  | P001_HMI/Counter#33 | 1 |
| `PC072_121` |  | P001_HMI/Counter#35 | 0 |
| `PC072_122` |  | P001_HMI/Counter#36 | 1 |
| `PC072_131` |  | P001_HMI/Counter#38 | 0 |
| `PC072_132` |  | P001_HMI/Counter#39 | 1 |
| `PC072_141` |  | P001_HMI/Counter#41 | 0 |
| `PC072_142` |  | P001_HMI/Counter#42 | 1 |
| `PC072_151` |  | P001_HMI/Counter#44 | 0 |
| `PC072_152` |  | P001_HMI/Counter#45 | 1 |
| `PL003_001` |  | P000_Main/HMI_Output#4 | 0 |
| `PL004_01R` |  | P011_WIP_Transfer/HMI_Output#2 | 0 |
| `PL004_01S` |  | P011_WIP_Transfer/HMI_Output#1 | 0 |
| `PL004_02R` | PL ATS Homepos. | P012_ATS3_Unit/HMI_Output#2 | 0 |
| `PL004_02S` | PL ATS 1 Cycle Running | P012_ATS3_Unit/HMI_Output#1 | 0 |
| `PL004_03C` |  | P012_ATS3_Unit/HMI_Output#22 | 0 |
| `PL004_03R` | PL Flash 1 Home Pos. | P014_Flash1/HMI_Output#2 | 0 |
| `PL004_03S` | PL Flash 1 Unit 1 Cycle Start | P014_Flash1/HMI_Output#1 | 0 |
| `PL004_04C` |  | P012_ATS3_Unit/HMI_Output#23 | 0 |
| `PL004_04R` |  | P015_Flash2/HMI_Output#2 | 0 |
| `PL004_04S` |  | P015_Flash2/HMI_Output#1 | 0 |
| `PL004_05C` |  | P012_ATS3_Unit/HMI_Output#21 | 0 |
| `PL008[15]` |  | P001_HMI/DataSearch#51 | 1 |
| `PL013_001` | PL MTC OP. Bypass Product | P000_Main/HMI_Output#5 | 0 |
| `PL013_002` | PL Airblow Bypass | P000_Main/HMI_Output#6 | 0 |
| `PL013_003` | PL NG HANDLING CHANGE SQUENCE | P000_Main/HMI_Output#7 | 0 |
| `PL013_004` | PL MTC OP. Bypass Safety Sensor | P000_Main/HMI_Output#8 | 6 |
| `PL013_005` | PL MTC OP. Left Gripper Unchuck | P000_Main/HMI_Output#9 | 0 |
| `PL013_006` | PL MTC OP. Right Gripper Unchuck | P000_Main/HMI_Output#10 | 0 |
| `PL013_008` | PL MTC OP. Teaching Mode | P000_Main/HMI_Output#11 | 0 |
| `PL013_009` | PL MTC OP. Flash 1 Disable | P000_Main/HMI_Output#12 | 0 |
| `PL013_010` | PL MTC OP. Flash 2 Disable | P000_Main/HMI_Output#13 | 0 |
| `PL013_012` | PL MTC OP MRC Judgment BYPASS | P000_Main/HMI_Output#14 | 2 |
| `PL021_001` | PL Master ON Cond : PLC Good | P000_Main/HMI_Output#17 | 1 |
| `PL021_002` | PL Master ON Cond : Fuse Good | P000_Main/HMI_Output#18 | 1 |
| `PL021_003` | PL Master ON Cond : Spare | P000_Main/HMI_Output#19 | 1 |
| `PL021_004` | PL Master ON Cond : Safety Confirm. | P000_Main/HMI_Output#20 | 1 |
| `PL021_005` | PL Master ON Cond : Spare | P000_Main/HMI_Output#21 | 1 |
| `PL021_006` | PL Master ON Cond : Spare | P000_Main/HMI_Output#22 | 1 |
| `PL021_007` | PL Master ON Cond : Spare | P000_Main/HMI_Output#23 | 1 |
| `PL021_008` | PL Master ON Cond : Spare | P000_Main/HMI_Output#24 | 1 |
| `PL021_009` | PL Master ON Cond : Spare | P000_Main/HMI_Output#25 | 1 |
| `PL021_010` | PL Master ON Cond : Not Emergency Stop | P000_Main/HMI_Output#26 | 1 |
| `PL021_011` | PL Master On Condition 11 | P000_Main/HMI_Output#27 | 1 |
| `PL031_001` | PL Auto Cond. : Machine Home Pos. | P000_Main/HMI_Output#28 | 1 |
| `PL031_002` | PL Auto Cond. : SS Auto | P000_Main/HMI_Output#29 | 1 |
| `PL031_003` | PL Auto Cond. : Part No Select Compl | P000_Main/HMI_Output#30 | 1 |
| `PL031_004` | PL Auto Cond. : MRC3 MC Ready | P000_Main/HMI_Output#31 | 2 |
| `PL031_005` | PL Auto Cond. : Flash 1 MC Ready | P000_Main/HMI_Output#32 | 2 |
| `PL031_006` | PL Auto Cond. : Flash 2 MC Ready | P000_Main/HMI_Output#33 | 2 |
| `PL031_007` | PL Auto Cond. : IAI Ready | P000_Main/HMI_Output#34 | 1 |
| `PL031_008` | PL Auto Cond. :  ATS Mode | P000_Main/HMI_Output#35 | 1 |
| `PL031_009` | PL Auto Cond. : Safety Sensor not Bypass | P000_Main/HMI_Output#36 | 1 |
| `PL031_010` | PL Auto Cond. : SM2 Rotate Homing Compl. | P000_Main/HMI_Output#37 | 1 |
| `PL031_011` | PL Auto Cond. : SM3 Rotate Homing Compl. | P000_Main/HMI_Output#38 | 1 |
| `PL031_012` | PL Auto Cond. : Not Teach Mode | P000_Main/HMI_Output#39 | 1 |
| `PL031_013` | PL Auto Cond. : FG Chutter Ready | P000_Main/HMI_Output#40 | 1 |
| `PL031_014` | PL Auto Cond. : Not Fault | P000_Main/HMI_Output#41 | 1 |
| `PL032_001` | PL Auto Run Cond : Air Blow MC Ready | P000_Main/HMI_Output#42 | 1 |
| `PL032_002` | PL Auto Run Cond : Airblow not Bypass | P000_Main/HMI_Output#43 | 1 |
| `PL032_003` | PL Auto Run Cond : Not Master Check Mode | P000_Main/HMI_Output#44 | 1 |
| `PL032_004` | PL Auto Run Cond : MRC Master Check Complete | P000_Main/HMI_Output#45 | 1 |
| `PL032_005` | PL Auto Run Cond : Flash 1 Master Check Complete | P000_Main/HMI_Output#46 | 1 |
| `PL032_006` | PL Auto Run Cond : Flash 2 Master Check Complete | P000_Main/HMI_Output#47 | 1 |
| `PL032_007` | PL Auto Run Cond : 7 X Axis Servo Ready | P000_Main/HMI_Output#48 | 1 |
| `PL032_008` | PL Auto Run Cond : 8 Flash 1 NOT Debug Mode | P000_Main/HMI_Output#49 | 1 |
| `PL032_009` | PL Auto Run Cond : 9 | P000_Main/HMI_Output#50 | 1 |
| `PL032_010` | PL Auto Run Cond : 10 | P000_Main/HMI_Output#51 | 1 |
| `PL032_011` | PL Auto Run Cond : 11 | P000_Main/HMI_Output#52 | 1 |
| `PL032_012` | PL Auto Run Cond : 12 | P000_Main/HMI_Output#53 | 1 |
| `PL032_013` | PL Auto Run Cond : 13 | P000_Main/HMI_Output#54 | 1 |
| `PL032_014` | PL Auto Run Cond : 14 | P000_Main/HMI_Output#55 | 1 |
| `PL060[1]` |  | P001_HMI/DataSetup#52 | 1 |
| `PL060[3]` |  | P001_HMI/DataSetup#3 | 1 |
| `PL060[4]` |  | P001_HMI/DataSetup#6 | 1 |
| `PL063[1]` |  | P001_HMI/DataSetup#55 | 4 |
| `PL094[3]` |  | P002_ServoMain/HMI_Out#11 | 2 |
| `PL351_000` | PL Servo Adjustment ON | P002_ServoMain/HMI_Out#1 | 1 |
| `PL351_001` | PL Adjustment ON | P002_ServoMain/HMI_Out#2 | 0 |
| `PL351_002` | PL Brake Reset ON | P002_ServoMain/HMI_Out#3 | 0 |
| `PL352_000` | PL Origin Set | P002_ServoMain/HMI_Out#4 | 0 |
| `PL353_000` | PL Override Set | P002_ServoMain/HMI_Out#5 | 0 |
| `PL354_000` | PL Jog Adjustment ON | P002_ServoMain/HMI_Out#6 | 1 |
| `PL355_000` | PL Brake Reset | P002_ServoMain/HMI_Out#7 | 0 |
| `PL355_001` |  | P002_ServoMain/HMI_Out#8 | 0 |
| `PL356_001` |  | P002_ServoMain/HMI_Out#9 | 0 |
| `PL356_002` |  | P002_ServoMain/HMI_Out#10 | 0 |
| `PL356_003` |  | P002_ServoMain/HMI_Out#12 | 0 |
| `PL356_004` |  | P002_ServoMain/HMI_Out#12 | 0 |
| `PL361_002` |  | P003_ServoIAI/HMI_Out#2 | 0 |
| `PL361_003` |  | P003_ServoIAI/HMI_Out#4 | 0 |
| `PL361_004` |  | P003_ServoIAI/HMI_Out#6 | 0 |
| `PL362_000` |  | P003_ServoIAI/TableData_PPUnit#6 | 0 |
| `PL362_001` |  | P003_ServoIAI/TableData_PPUnit#4 | 1 |
| `PL362_002` |  | P003_ServoIAI/HMI_Out#1 | 0 |
| `PL363_002` |  | P003_ServoIAI/HMI_Out#3 | 0 |
| `PL363_003` |  | P003_ServoIAI/HMI_Out#5 | 0 |
| `PL363_004` |  | P003_ServoIAI/TableData_WIPUnit#5 | 1 |
| `PL363_005` |  | P003_ServoIAI/TableData_WIPUnit#7, P003_ServoIAI/TableData_WIPUnit#8 | 0 |
| `PL364_003` |  | P002_ServoMain/TableData#6 | 0 |
| `PL364_004` |  | P002_ServoMain/TableData#4 | 1 |
| `PL364_005` |  | P002_ServoMain/TableData#1 | 0 |
| `PL411_01M` |  | P011_WIP_Transfer/HMI_Output#3 | 0 |
| `PL411_01R` |  | P011_WIP_Transfer/HMI_Output#4 | 0 |
| `PL411_02M` |  | P011_WIP_Transfer/HMI_Output#5 | 0 |
| `PL411_02R` |  | P011_WIP_Transfer/HMI_Output#6 | 0 |
| `PL411_03M` |  | P011_WIP_Transfer/HMI_Output#7 | 0 |
| `PL411_03R` |  | P011_WIP_Transfer/HMI_Output#8 | 0 |
| `PL411_04M` |  | P011_WIP_Transfer/HMI_Output#9 | 0 |
| `PL411_04R` |  | P011_WIP_Transfer/HMI_Output#10 | 0 |
| `PL412_01M` | PL Chutter FG Open | P011_WIP_Transfer/HMI_Output#11 | 0 |
| `PL412_01R` | PL Chutter FG Close | P011_WIP_Transfer/HMI_Output#12 | 0 |
| `PL412_02M` | PL Add Chutter FG Open | P011_WIP_Transfer/HMI_Output#13 | 0 |
| `PL412_02R` | PL Add Chutter FG Close | P011_WIP_Transfer/HMI_Output#14 | 0 |
| `PL421_02M` | PL SM2 R Rotate Axis Moving | P012_ATS3_Unit/HMI_Output#7 | 0 |
| `PL421_02R` | PL SM2 R Rotate Axis Home | P012_ATS3_Unit/HMI_Output#8 | 0 |
| `PL421_03M` | PL SM4 R Gripper Moving | P012_ATS3_Unit/HMI_Output#9 | 0 |
| `PL421_03R` | PL SM4 R Gripper Home | P012_ATS3_Unit/HMI_Output#10 | 0 |
| `PL421_04M` | PL SM6 R Z Axis Moving | P012_ATS3_Unit/HMI_Output#5 | 0 |
| `PL421_04R` | PL SM6 R Z Axis Home | P012_ATS3_Unit/HMI_Output#6 | 0 |
| `PL421_05M` | PL SM8 R Y Axis Moving | P012_ATS3_Unit/HMI_Output#3 | 0 |
| `PL421_05R` | PL SM8 R Y Axis Home | P012_ATS3_Unit/HMI_Output#4 | 0 |
| `PL422_01M` | PL SM3 L Rotate Axis Moving | P012_ATS3_Unit/HMI_Output#15 | 0 |
| `PL422_01R` | PL SM3 L Rotate Axis Home | P012_ATS3_Unit/HMI_Output#16 | 0 |
| `PL422_02M` | PL SM5 L Gripper Moving | P012_ATS3_Unit/HMI_Output#17 | 0 |
| `PL422_02R` | PL SM5 L Gripper Home | P012_ATS3_Unit/HMI_Output#18 | 0 |
| `PL422_03M` | PL SM7 L Z Axis Moving | P012_ATS3_Unit/HMI_Output#13 | 0 |
| `PL422_03R` | PL SM7 L Z Axis Home | P012_ATS3_Unit/HMI_Output#14 | 0 |
| `PL422_04M` | PL SM9 L Y Axis Moving | P012_ATS3_Unit/HMI_Output#11 | 0 |
| `PL422_04R` | PL SM9 L Y Axis  Home | P012_ATS3_Unit/HMI_Output#12 | 0 |
| `PL422_05M` | PL SM1 X Axis Moving | P012_ATS3_Unit/HMI_Output#19 | 0 |
| `PL422_05R` | PL SM1 X Axis Home | P012_ATS3_Unit/HMI_Output#20 | 0 |
| `PL431_01M` | PL Flash 1 Cover Close | P014_Flash1/HMI_Output#3 | 0 |
| `PL431_01R` | PL Flash 1 Cover Open | P014_Flash1/HMI_Output#4 | 0 |
| `PL431_02M` | PL Flash Writing 1 Debug Starting | P014_Flash1/HMI_Output#5 | 0 |
| `PL431_02R` | PL Flash 1 Writing Complete | P014_Flash1/HMI_Output#6 | 0 |
| `PL431_03M` | PL Flash 1 Debug Mode | P014_Flash1/HMI_Output#7 | 10 |
| `PL431_03R` | PL Flash 1 Continous Debug | P014_Flash1/HMI_Output#8 | 0 |
| `PL431_04M` | PL Flash 1 Use Front P/N | P014_Flash1/HMI_Output#9 | 8 |
| `PL441_01M` |  | P015_Flash2/HMI_Output#3 | 0 |
| `PL441_01R` |  | P015_Flash2/HMI_Output#4 | 0 |
| `PL441_02M` |  | P015_Flash2/HMI_Output#5 | 0 |
| `PL441_02R` |  | P015_Flash2/HMI_Output#6 | 0 |
| `PL441_03M` |  | P015_Flash2/HMI_Output#7 | 0 |
| `PL441_03R` |  | P015_Flash2/HMI_Output#8 | 0 |
| `PL441_04M` |  | P015_Flash2/HMI_Output#9 | 0 |
| `PL500_001` | PL ATS Finish Process Memory | P011_WIP_Transfer/HMI_Output#15 | 0 |
| `PL500_002` | PL ATS FG Take Out Memory | P011_WIP_Transfer/HMI_Output#16 | 0 |
| `PL500_003` | PL Air Blow Finish Process Memory | P011_WIP_Transfer/HMI_Output#17 | 0 |
| `PL500_004` | PL Air Blow FG Take Out Memory | P011_WIP_Transfer/HMI_Output#18 | 0 |
| `PL700_000` | PL Master Check Mode | P000_Main/HMI_Output#16 | 0 |
| `PL700_001` | PL MRC Master OK Start | P012_ATS3_Unit/HMI_Output#24 | 0 |
| `PL700_002` | PL MRC Master OK Compl | P012_ATS3_Unit/HMI_Output#26 | 1 |
| `PL700_003` | PL MRC Master NG Start | P012_ATS3_Unit/HMI_Output#25 | 0 |
| `PL700_004` | PL MRC Master NG Compl | P012_ATS3_Unit/HMI_Output#27 | 1 |
| `PL700_005` | PL Flash1 Master OK Start | P014_Flash1/HMI_Output#10 | 0 |
| `PL700_006` | PL Flash 1 Master OK Compl | P014_Flash1/HMI_Output#11 | 0 |
| `PL700_007` | PL Flash 1 Master NG Start | P014_Flash1/HMI_Output#12 | 0 |
| `PL700_008` | PL Flash 1 Master NG Compl | P014_Flash1/HMI_Output#13 | 0 |
| `PL700_009` | PL Flash 2 Master OK Start | P015_Flash2/HMI_Output#10 | 0 |
| `PL700_010` | PL Flash 2 Master OK Compl | P015_Flash2/HMI_Output#11 | 0 |
| `PL700_011` | PL Flash 2 Master NG Start | P015_Flash2/HMI_Output#12 | 0 |
| `PL700_012` | PL Flash 2 Master NG Compl | P015_Flash2/HMI_Output#13 | 0 |
| `PLC_ERROR` |  | P000_Main/Fault#59 | 0 |
| `PLC_ERR_STA.PLC_ERR_BOOL[4]` |  | (tidak ditulis di project ini) | 2 |
| `PLC_ERR_STA.PLC_ERR_BOOL[5]` |  | (tidak ditulis di project ini) | 2 |
| `PLC_ERR_STA.PLC_ERR_BOOL[6]` |  | (tidak ditulis di project ini) | 2 |
| `PLC_ERR_STA.PLC_ERR_BOOL[7]` |  | (tidak ditulis di project ini) | 2 |
| `PLC_GOOD` | PLC Good | P000_Main/Station_Output#1 | 5 |
| `PLC_MAJOR_FAULT` | PLC Full Stop Fault Level$tPLC ALL STOP FAULT LEVEL | P000_Main/Fault#3 | 2 |
| `PLC_MINOR_FAULT` | PLC Mild Fault Level$tPLC SLIGHT FAULT LEVEL | P000_Main/Fault#5 | 2 |
| `PLC_OBSERVATION` | PLC Monitoring Information Level$tPLC MONITOR INFORMATION LEVEL | P000_Main/Fault#6 | 1 |
| `PLC_PARTIAL_FAULT` | PLC Part Stop Fault Level$tPLC PARTIAL STOP FAULT LEVEL | P000_Main/Fault#4 | 2 |
| `PL_AUTO_COND` | PL Auto Run Condition | P001_HMI/TP_Control#11 | 2 |
| `PL_AUTO_COND2` | PL Auto Run Condition 2 | P001_HMI/TP_Control#12 | 3 |
| `PL_AUTO_RUN` |  | P001_HMI/TP_Control#2 | 0 |
| `PL_CYCLE_STOP` |  | P000_Main/HMI_Output#3 | 1 |
| `PL_FLT` | PL Fault | P000_Main/HMI_Output#1 | 3 |
| `PL_HOME_POS` |  | P001_HMI/TP_Control#3 | 0 |
| `PL_IND_MODE` |  | P001_HMI/TP_Control#4 | 0 |
| `PL_MSTR_COND` |  | P001_HMI/TP_Control#10 | 1 |
| `PL_MSTR_RDY` |  | P001_HMI/TP_Control#1 | 0 |
| `PL_NO_FLT` | PL No Fault | P000_Main/HMI_Output#2 | 0 |
| `PL_PART_CONF` |  | P000_Main/HMI_Output#15 | 0 |
| `PPDownGoodCnd` |  | P012_ATS3_Unit/Auto_Running_Output#10 | 0 |
| `PPFwdGoodCnd` |  | P012_ATS3_Unit/Auto_Running_Output#7 | 0 |
| `PPFwdNOOPR` |  | P012_ATS3_Unit/Auto_Running_Output#9 | 0 |
| `PPFwdOPR` |  | P012_ATS3_Unit/Auto_Running_Output#8 | 0 |
| `PPWIPAxis.Post[10].LSComb.LS` |  | (tidak ditulis di project ini) | 13 |
| `PPWIPAxis.Post[2].LSComb.LS` |  | (tidak ditulis di project ini) | 10 |
| `PPWIPAxis.Post[5].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `PPXAxis.Post[10].LSComb.LS` |  | (tidak ditulis di project ini) | 34 |
| `PPXAxis.Post[11].LSComb.LS` |  | (tidak ditulis di project ini) | 3 |
| `PPXAxis.Post[12].LSComb.LS` |  | (tidak ditulis di project ini) | 23 |
| `PPXAxis.Post[13].LSComb.LS` |  | (tidak ditulis di project ini) | 22 |
| `PPXAxis.Post[14].LSComb.LS` |  | (tidak ditulis di project ini) | 20 |
| `PPXAxis.Post[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `PPXAxis.Post[2].LSComb.LS` |  | (tidak ditulis di project ini) | 24 |
| `PPXAxis.Post[3].LSComb.LS` |  | (tidak ditulis di project ini) | 21 |
| `PPXAxis.Post[4].LSComb.LS` |  | (tidak ditulis di project ini) | 23 |
| `PPXAxis.Post[5].LSComb.LS` |  | (tidak ditulis di project ini) | 28 |
| `PPXAxis.Post[PW422_005].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `PT081_001` |  | P001_HMI/TimerS#6 | 0 |
| `PT081_002` |  | P001_HMI/TimerS#8 | 0 |
| `PT081_003` |  | P001_HMI/TimerS#10 | 0 |
| `PT081_004` |  | P001_HMI/TimerS#12 | 0 |
| `PT081_005` |  | P001_HMI/TimerS#14 | 0 |
| `PT081_006` |  | P001_HMI/TimerS#16 | 0 |
| `PWR_ON` | POWER ON DELAY | P000_Main/Station_Output#2 | 15 |
| `P_First_Run` |  | (tidak ditulis di project ini) | 8 |
| `P_First_RunMode` |  | (tidak ditulis di project ini) | 3 |
| `P_Off` |  | (tidak ditulis di project ini) | 2 |
| `P_On` |  | (tidak ditulis di project ini) | 3 |
| `RCON_In_Axis0_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis0_Status_Signal.B[1]` |  | (tidak ditulis di project ini) | 12 |
| `RCON_In_Axis0_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis0_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis0_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis0_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis1_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis1_Status_Signal.B[1]` |  | (tidak ditulis di project ini) | 12 |
| `RCON_In_Axis1_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis1_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis1_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis1_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis2_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis2_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis2_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis2_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis2_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis3_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis3_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis3_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis3_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis3_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis4_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis4_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis4_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis4_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis4_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis5_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis5_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis5_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis5_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis5_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis6_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis6_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis6_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis6_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis6_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis7_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis7_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis7_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 7 |
| `RCON_In_Axis7_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis7_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_In_Axis8_Status_Signal.B[14]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis8_Status_Signal.B[2]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis8_Status_Signal.B[3]` |  | (tidak ditulis di project ini) | 4 |
| `RCON_In_Axis8_Status_Signal.B[4]` |  | (tidak ditulis di project ini) | 1 |
| `RCON_In_Axis8_Status_Signal.B[5]` |  | (tidak ditulis di project ini) | 2 |
| `RCON_Out_Axis0_Control_Signal.B[0]` |  | P012_ATS3_Unit/RPP_Device_Output#21 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[15]` |  | P012_ATS3_Unit/RPP_Device_Output#30 | 1 |
| `RCON_Out_Axis0_Control_Signal.B[1]` |  | P012_ATS3_Unit/RPP_Device_Output#22 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[2]` |  | P012_ATS3_Unit/RPP_Device_Output#23 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[3]` |  | P012_ATS3_Unit/RPP_Device_Output#24 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[4]` |  | P012_ATS3_Unit/RPP_Device_Output#25 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[5]` |  | P012_ATS3_Unit/RPP_Device_Output#26 | 3 |
| `RCON_Out_Axis0_Control_Signal.B[6]` |  | P012_ATS3_Unit/RPP_Device_Output#27 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[7]` |  | P012_ATS3_Unit/RPP_Device_Output#28 | 0 |
| `RCON_Out_Axis0_Control_Signal.B[8]` |  | P012_ATS3_Unit/RPP_Device_Output#29 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[0]` |  | P012_ATS3_Unit/LPP_Device_Output#21 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[15]` |  | P012_ATS3_Unit/LPP_Device_Output#30 | 1 |
| `RCON_Out_Axis1_Control_Signal.B[1]` |  | P012_ATS3_Unit/LPP_Device_Output#22 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[2]` |  | P012_ATS3_Unit/LPP_Device_Output#23 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[3]` |  | P012_ATS3_Unit/LPP_Device_Output#24 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[4]` |  | P012_ATS3_Unit/LPP_Device_Output#25 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[5]` |  | P012_ATS3_Unit/LPP_Device_Output#26 | 3 |
| `RCON_Out_Axis1_Control_Signal.B[6]` |  | P012_ATS3_Unit/LPP_Device_Output#27 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[7]` |  | P012_ATS3_Unit/LPP_Device_Output#28 | 0 |
| `RCON_Out_Axis1_Control_Signal.B[8]` |  | P012_ATS3_Unit/LPP_Device_Output#29 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[0]` |  | P012_ATS3_Unit/RPP_Device_Output#31 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[15]` |  | P012_ATS3_Unit/RPP_Device_Output#40 | 1 |
| `RCON_Out_Axis2_Control_Signal.B[1]` |  | P012_ATS3_Unit/RPP_Device_Output#32 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[2]` |  | P012_ATS3_Unit/RPP_Device_Output#33 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[3]` |  | P012_ATS3_Unit/RPP_Device_Output#34 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[4]` |  | P012_ATS3_Unit/RPP_Device_Output#35 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[5]` |  | P012_ATS3_Unit/RPP_Device_Output#36 | 3 |
| `RCON_Out_Axis2_Control_Signal.B[6]` |  | P012_ATS3_Unit/RPP_Device_Output#37 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[7]` |  | P012_ATS3_Unit/RPP_Device_Output#38 | 0 |
| `RCON_Out_Axis2_Control_Signal.B[8]` |  | P012_ATS3_Unit/RPP_Device_Output#39 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[0]` |  | P012_ATS3_Unit/LPP_Device_Output#31 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[15]` |  | P012_ATS3_Unit/LPP_Device_Output#40 | 1 |
| `RCON_Out_Axis3_Control_Signal.B[1]` |  | P012_ATS3_Unit/LPP_Device_Output#32 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[2]` |  | P012_ATS3_Unit/LPP_Device_Output#33 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[3]` |  | P012_ATS3_Unit/LPP_Device_Output#34 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[4]` |  | P012_ATS3_Unit/LPP_Device_Output#35 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[5]` |  | P012_ATS3_Unit/LPP_Device_Output#36 | 3 |
| `RCON_Out_Axis3_Control_Signal.B[6]` |  | P012_ATS3_Unit/LPP_Device_Output#37 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[7]` |  | P012_ATS3_Unit/LPP_Device_Output#38 | 0 |
| `RCON_Out_Axis3_Control_Signal.B[8]` |  | P012_ATS3_Unit/LPP_Device_Output#39 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[0]` |  | P012_ATS3_Unit/RPP_Device_Output#11 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[15]` |  | P012_ATS3_Unit/RPP_Device_Output#20 | 3 |
| `RCON_Out_Axis4_Control_Signal.B[1]` |  | P012_ATS3_Unit/RPP_Device_Output#12 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[2]` |  | P012_ATS3_Unit/RPP_Device_Output#13 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[3]` |  | P012_ATS3_Unit/RPP_Device_Output#14 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[4]` |  | P012_ATS3_Unit/RPP_Device_Output#15 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[5]` |  | P012_ATS3_Unit/RPP_Device_Output#16 | 3 |
| `RCON_Out_Axis4_Control_Signal.B[6]` |  | P012_ATS3_Unit/RPP_Device_Output#17 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[7]` |  | P012_ATS3_Unit/RPP_Device_Output#18 | 0 |
| `RCON_Out_Axis4_Control_Signal.B[8]` |  | P012_ATS3_Unit/RPP_Device_Output#19 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[0]` |  | P012_ATS3_Unit/LPP_Device_Output#11 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[15]` |  | P012_ATS3_Unit/LPP_Device_Output#20 | 3 |
| `RCON_Out_Axis5_Control_Signal.B[1]` |  | P012_ATS3_Unit/LPP_Device_Output#12 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[2]` |  | P012_ATS3_Unit/LPP_Device_Output#13 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[3]` |  | P012_ATS3_Unit/LPP_Device_Output#14 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[4]` |  | P012_ATS3_Unit/LPP_Device_Output#15 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[5]` |  | P012_ATS3_Unit/LPP_Device_Output#16 | 3 |
| `RCON_Out_Axis5_Control_Signal.B[6]` |  | P012_ATS3_Unit/LPP_Device_Output#17 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[7]` |  | P012_ATS3_Unit/LPP_Device_Output#18 | 0 |
| `RCON_Out_Axis5_Control_Signal.B[8]` |  | P012_ATS3_Unit/LPP_Device_Output#19 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[0]` |  | P012_ATS3_Unit/RPP_Device_Output#1 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[15]` |  | P012_ATS3_Unit/RPP_Device_Output#10 | 1 |
| `RCON_Out_Axis6_Control_Signal.B[1]` |  | P012_ATS3_Unit/RPP_Device_Output#2 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[2]` |  | P012_ATS3_Unit/RPP_Device_Output#3 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[3]` |  | P012_ATS3_Unit/RPP_Device_Output#4 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[4]` |  | P012_ATS3_Unit/RPP_Device_Output#5 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[5]` |  | P012_ATS3_Unit/RPP_Device_Output#6 | 3 |
| `RCON_Out_Axis6_Control_Signal.B[6]` |  | P012_ATS3_Unit/RPP_Device_Output#7 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[7]` |  | P012_ATS3_Unit/RPP_Device_Output#8 | 0 |
| `RCON_Out_Axis6_Control_Signal.B[8]` |  | P012_ATS3_Unit/RPP_Device_Output#9 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[0]` |  | P012_ATS3_Unit/LPP_Device_Output#1 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[15]` |  | P012_ATS3_Unit/LPP_Device_Output#10 | 1 |
| `RCON_Out_Axis7_Control_Signal.B[1]` |  | P012_ATS3_Unit/LPP_Device_Output#2 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[2]` |  | P012_ATS3_Unit/LPP_Device_Output#3 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[3]` |  | P012_ATS3_Unit/LPP_Device_Output#4 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[4]` |  | P012_ATS3_Unit/LPP_Device_Output#5 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[5]` |  | P012_ATS3_Unit/LPP_Device_Output#6 | 3 |
| `RCON_Out_Axis7_Control_Signal.B[6]` |  | P012_ATS3_Unit/LPP_Device_Output#7 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[7]` |  | P012_ATS3_Unit/LPP_Device_Output#8 | 0 |
| `RCON_Out_Axis7_Control_Signal.B[8]` |  | P012_ATS3_Unit/LPP_Device_Output#9 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[0]` |  | P011_WIP_Transfer/DeviceOutput#1 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[15]` |  | P011_WIP_Transfer/DeviceOutput#10 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[1]` |  | P011_WIP_Transfer/DeviceOutput#2 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[2]` |  | P011_WIP_Transfer/DeviceOutput#3 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[3]` |  | P011_WIP_Transfer/DeviceOutput#4 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[4]` |  | P011_WIP_Transfer/DeviceOutput#5 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[5]` |  | P011_WIP_Transfer/DeviceOutput#6 | 3 |
| `RCON_Out_Axis8_Control_Signal.B[6]` |  | P011_WIP_Transfer/DeviceOutput#7 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[7]` |  | P011_WIP_Transfer/DeviceOutput#8 | 0 |
| `RCON_Out_Axis8_Control_Signal.B[8]` |  | P011_WIP_Transfer/DeviceOutput#9 | 0 |
| `RCON_Out_Gateway0.B[15]` |  | P000_Main/Device_Output#1 | 0 |
| `RCVWFstart` |  | (tanpa program)/LadderBody#49 | 3 |
| `RCVWWstart` |  | (tanpa program)/LadderBody#48 | 4 |
| `RESET_EC` |  | (tidak ditulis di project ini) | 1 |
| `RESET_MC` |  | (tidak ditulis di project ini) | 2 |
| `RESET_PLC` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Gripper[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Gripper[2].LSComb.LS` |  | (tidak ditulis di project ini) | 12 |
| `RPPSelectDt.Gripper[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Gripper[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Gripper[5].LSComb.LS` |  | (tidak ditulis di project ini) | 17 |
| `RPPSelectDt.Gripper[PW421_003].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Rotate[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Rotate[2].LSComb.LS` |  | (tidak ditulis di project ini) | 18 |
| `RPPSelectDt.Rotate[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Rotate[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.Rotate[5].LSComb.LS` |  | (tidak ditulis di project ini) | 17 |
| `RPPSelectDt.Rotate[PW421_002].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.YAxis[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.YAxis[2].LSComb.LS` |  | (tidak ditulis di project ini) | 21 |
| `RPPSelectDt.YAxis[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.YAxis[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.YAxis[5].LSComb.LS` |  | (tidak ditulis di project ini) | 24 |
| `RPPSelectDt.YAxis[PW421_005].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.ZAxis[1].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.ZAxis[2].LSComb.LS` |  | (tidak ditulis di project ini) | 6 |
| `RPPSelectDt.ZAxis[3].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.ZAxis[4].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RPPSelectDt.ZAxis[5].LSComb.LS` |  | (tidak ditulis di project ini) | 33 |
| `RPPSelectDt.ZAxis[PW421_004].LSComb.LS` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX01` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX02` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX03` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX04` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX05` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX06` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX07` |  | (tidak ditulis di project ini) | 1 |
| `RST_AX08` |  | (tidak ditulis di project ini) | 1 |
| `RTOk` |  | (tanpa program)/LadderBody#44 | 1 |
| `RTreceived` |  | (tanpa program)/LadderBody#11 | 6 |
| `RcvAgain` |  | (tanpa program)/LadderBody#4 | 1 |
| `RcvAgain1` |  | (tanpa program)/LadderBody#1 | 1 |
| `RcvDone` |  | (tanpa program)/LadderBody#1 | 8 |
| `RcvEOT` |  | (tanpa program)/LadderBody#1 | 10 |
| `RcvEOT1` |  | (tanpa program)/LadderBody#1 | 8 |
| `RcvEOTConfirm` |  | (tanpa program)/LadderBody#79 | 10 |
| `RcvError` |  | (tidak ditulis di project ini) | 4 |
| `RcvErrorData` |  | (tanpa program)/LadderBody#1 | 1 |
| `RcvErrorData1` |  | (tanpa program)/LadderBody#1 | 1 |
| `RcvRetry` |  | (tanpa program)/LadderBody#23 | 5 |
| `RcvRetryTimer` |  | (tidak ditulis di project ini) | 1 |
| `Rcvfinish` |  | (tanpa program)/LadderBody#9 | 2 |
| `Rcvfinish1` |  | (tanpa program)/LadderBody#21 | 2 |
| `Rcvfinish2` |  | (tanpa program)/LadderBody#19 | 7 |
| `Rcvfinish3` |  | (tanpa program)/LadderBody#22 | 2 |
| `Rcvfinish_CPY` |  | (tanpa program)/LadderBody#17 | 2 |
| `RdyRcvE` |  | (tanpa program)/LadderBody#42 | 4 |
| `RdyRcvFP` |  | (tanpa program)/LadderBody#41 | 25 |
| `RdyRcvSA` |  | (tanpa program)/LadderBody#39 | 20 |
| `RdyRcvSQ` |  | (tanpa program)/LadderBody#37 | 22 |
| `RdyRcvSW` |  | (tanpa program)/LadderBody#38 | 21 |
| `RdyRcvWF` |  | (tidak ditulis di project ini) | 1 |
| `RdyRcvWW` |  | (tanpa program)/LadderBody#40 | 24 |
| `Ready` | 段取りﾃﾞｰﾀ抽出起動条件 | (tanpa program)/LadderBody#25 | 0 |
| `RightArmTInOpr` |  | P012_ATS3_Unit/Auto_Running_Output#4 | 2 |
| `RightArmTOutOpr` |  | P012_ATS3_Unit/Auto_Running_Output#5 | 2 |
| `Running_Type1` | Running Abilcore Model | P000_Main/Station_Output#11 | 28 |
| `Running_Type2` | Running GD1B Model | P000_Main/Station_Output#12 | 28 |
| `SAFETY_CONFIRM` | SAFETY_CONFIRM | P000_Main/Device_Input#3 | 8 |
| `SAOk` |  | (tanpa program)/LadderBody#44 | 0 |
| `SAreceived` |  | (tanpa program)/LadderBody#14 | 11 |
| `SENDEOTREADY` |  | (tanpa program)/LadderBody#3 | 2 |
| `SENDP2DONE` |  | (tanpa program)/LadderBody#82 | 3 |
| `SENDP2NGRETRY` |  | (tanpa program)/LadderBody#59 | 1 |
| `SM10_BKIR` | 10 AXIS BRAKE RESET | P002_ServoMain/MD_Out#18 | 0 |
| `SM11_BKIR` | 11 AXIS BRAKE RESET | P002_ServoMain/MD_Out#19 | 0 |
| `SM12_BKIR` | 12 AXIS BRAKE RESET | P002_ServoMain/MD_Out#20 | 0 |
| `SM13_BKIR` | 13 AXIS BRAKE RESET | P002_ServoMain/MD_Out#21 | 0 |
| `SM14_BKIR` | 14 AXIS BRAKE RESET | P002_ServoMain/MD_Out#22 | 0 |
| `SM15_BKIR` | 15 AXIS BRAKE RESET | P002_ServoMain/MD_Out#23 | 0 |
| `SM1_BKIR` | 1 AXIS BRAKE RESET | P002_ServoMain/MD_Out#9 | 0 |
| `SM2_BKIR` | 2 AXIS BRAKE RESET | P002_ServoMain/MD_Out#10 | 0 |
| `SM3_BKIR` | 3 AXIS BRAKE RESET | P002_ServoMain/MD_Out#11 | 0 |
| `SM4_BKIR` | 4 AXIS BRAKE RESET | P002_ServoMain/MD_Out#12 | 0 |
| `SM5_BKIR` | 5 AXIS BRAKE RESET | P002_ServoMain/MD_Out#13 | 0 |
| `SM6_BKIR` | 6 AXIS BRAKE RESET | P002_ServoMain/MD_Out#14 | 0 |
| `SM7_BKIR` | 7 AXIS BRAKE RESET | P002_ServoMain/MD_Out#15 | 0 |
| `SM8_BKIR` | 8 AXIS BRAKE RESET | P002_ServoMain/MD_Out#16 | 0 |
| `SM9_BKIR` | 9 AXIS BRAKE RESET | P002_ServoMain/MD_Out#17 | 0 |
| `SQOk` |  | (tanpa program)/LadderBody#44 | 1 |
| `SQreceived` |  | (tanpa program)/LadderBody#12 | 8 |
| `SS_AUTO_IND` | SS Auto/Ind | P000_Main/Device_Input#4 | 6 |
| `SS_IND` |  | (tidak ditulis di project ini) | 2 |
| `SWOk` |  | (tanpa program)/LadderBody#44 | 1 |
| `SWreceived` |  | (tanpa program)/LadderBody#13 | 7 |
| `SendECOk` |  | (tanpa program)/LadderBody#72 | 1 |
| `SendECdone` |  | (tanpa program)/LadderBody#66 | 2 |
| `SendECend` |  | (tanpa program)/LadderBody#78 | 7 |
| `SendECstart` |  | (tanpa program)/LadderBody#50 | 3 |
| `SendEOT` |  | (tanpa program)/LadderBody#2 | 41 |
| `SendP2Ok` |  | (tanpa program)/LadderBody#80 | 19 |
| `SendP2READY` |  | (tanpa program)/LadderBody#52 | 2 |
| `SendP2READY1` |  | (tanpa program)/LadderBody#53 | 2 |
| `SendP2READY2` |  | (tanpa program)/LadderBody#54 | 2 |
| `SendP2READY3` |  | (tanpa program)/LadderBody#55 | 2 |
| `SendP2READY4` |  | (tanpa program)/LadderBody#56 | 2 |
| `SendP2READY5` |  | (tanpa program)/LadderBody#51 | 2 |
| `SendRSdone` |  | (tanpa program)/LadderBody#61 | 2 |
| `SendRSend` |  | (tanpa program)/LadderBody#73 | 9 |
| `SendRSstart` |  | (tanpa program)/LadderBody#45 | 6 |
| `SendSHdone` |  | (tanpa program)/LadderBody#62 | 2 |
| `SendSHend` |  | (tanpa program)/LadderBody#74 | 9 |
| `SendSHstart` |  | (tanpa program)/LadderBody#46 | 4 |
| `SendSNdone` |  | (tanpa program)/LadderBody#63 | 2 |
| `SendSNend` |  | (tanpa program)/LadderBody#75 | 9 |
| `SendSNstart` |  | (tanpa program)/LadderBody#47 | 4 |
| `SendWCdone` |  | (tanpa program)/LadderBody#65 | 2 |
| `SendWCend` |  | (tanpa program)/LadderBody#77 | 8 |
| `SendWRdone` |  | (tanpa program)/LadderBody#64 | 2 |
| `SendWRend` |  | (tanpa program)/LadderBody#76 | 10 |
| `Sendcounter` |  | (tidak ditulis di project ini) | 1 |
| `Sendok` |  | (tanpa program)/LadderBody#8 | 4 |
| `Serveropendone` |  | (tidak ditulis di project ini) | 2 |
| `SetUpDataSerch1` |  | (tidak ditulis di project ini) | 1 |
| `SktECsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktRSsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktRcvInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktRcvInstance.Busy` |  | (tidak ditulis di project ini) | 5 |
| `SktSHsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktSNsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktSendP2Instance` |  | (tidak ditulis di project ini) | 1 |
| `SktTcpStatusInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktWCsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SktWRsendInstance` |  | (tidak ditulis di project ini) | 1 |
| `SkttcpSendInstance` |  | (tidak ditulis di project ini) | 1 |
| `Start` | 段取ﾃﾞｰﾀ抽出開始 | (tidak ditulis di project ini) | 1 |
| `TEACH_ON` | Teaching included | P000_Main/Station_Output#13 | 8 |
| `TEACH_SAFE_CONF` | TEACHING COVER SAFETY CONFIRMATION | (tidak ditulis di project ini) | 1 |
| `TESTBRAKE` |  | (tidak ditulis di project ini) | 1 |
| `TIMERONEOT` |  | (tidak ditulis di project ini) | 1 |
| `Test1` |  | (tidak ditulis di project ini) | 1 |
| `Test2` |  | (tidak ditulis di project ini) | 1 |
| `Test4` |  | (tidak ditulis di project ini) | 1 |
| `Test8` |  | (tidak ditulis di project ini) | 1 |
| `TestButton` |  | (tidak ditulis di project ini) | 2 |
| `Timeron` |  | (tidak ditulis di project ini) | 1 |
| `Timeron2` |  | (tidak ditulis di project ini) | 1 |
| `Timeron3` |  | (tidak ditulis di project ini) | 1 |
| `Tombol1` |  | (tidak ditulis di project ini) | 1 |
| `Tombol10` |  | (tidak ditulis di project ini) | 1 |
| `Tombol11` |  | (tidak ditulis di project ini) | 1 |
| `Tombol2` |  | (tidak ditulis di project ini) | 1 |
| `Tombol3` |  | (tidak ditulis di project ini) | 1 |
| `Tombol4` |  | (tidak ditulis di project ini) | 1 |
| `Tombol5` |  | (tidak ditulis di project ini) | 1 |
| `Tombol6` |  | (tidak ditulis di project ini) | 1 |
| `Tombol7` |  | (tidak ditulis di project ini) | 1 |
| `Tombol8` |  | (tidak ditulis di project ini) | 1 |
| `Tombol9` |  | (tidak ditulis di project ini) | 1 |
| `WFOk` |  | (tanpa program)/LadderBody#44 | 1 |
| `WFreceived` |  | (tanpa program)/LadderBody#16 | 9 |
| `WITHOUT_PRODUCT` | Bypass Without Product | P000_Main/Station_Output#10 | 32 |
| `WWOk` |  | (tanpa program)/LadderBody#44 | 1 |
| `WWreceived` |  | (tanpa program)/LadderBody#15 | 11 |
| `X1` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[1].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[2].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[3].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[4].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[5].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[6].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[7].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_CommErrTbl[_MC_AX[8].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[1]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[2]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[3]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[4]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[5]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[6]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[7]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_MBXSlavTbl[8]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[1].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[2].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[3].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[4].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[5].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[6].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[7].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_EC_PDSlavTbl[_MC_AX[8].Cfg.NodeAddress]` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[1].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[1].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[2].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[2].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[3].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[3].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[4].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[4].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[5].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[5].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[6].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[6].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[7].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[7].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_AX[8].Details.Idle` |  | (tidak ditulis di project ini) | 3 |
| `_MC_AX[8].Status.Coordinated` |  | (tidak ditulis di project ini) | 1 |
| `_MC_COM.MFaultLvl.Active` |  | (tidak ditulis di project ini) | 1 |
| `_MC_COM.Obsr.Active` |  | (tidak ditulis di project ini) | 1 |
| `_MC_COM.PFaultLvl.Active` |  | (tidak ditulis di project ini) | 1 |
| `_MC_COM.Status.RunMode` |  | (tidak ditulis di project ini) | 1 |
| `aP_0_1s` | 0.1SEC CLOCK PULSE | P000_Main/Initial#13 | 8 |
| `aP_1s` | 1SEC CLOCK PULSE | P000_Main/Initial#13 | 15 |
| `datanottransfer1` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer10` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer11` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer12` |  | (tanpa program)/LadderBody#1 | 2 |
| `datanottransfer13` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer3` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer5` |  | (tanpa program)/LadderBody#1 | 4 |
| `datanottransfer7` |  | (tanpa program)/LadderBody#1 | 2 |
| `datanottransfer9` |  | (tidak ditulis di project ini) | 1 |
| `datatrsnfer` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer1` |  | (tanpa program)/LadderBody#1 | 7 |
| `datatrsnfer10` |  | (tanpa program)/LadderBody#1 | 1 |
| `datatrsnfer2` |  | (tidak ditulis di project ini) | 1 |
| `datatrsnfer3` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer4` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer5` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer6` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer7` |  | (tidak ditulis di project ini) | 1 |
| `datatrsnfer8` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnfer9` |  | (tanpa program)/LadderBody#1 | 2 |
| `datatrsnferstart` |  | (tanpa program)/LadderBody#28 | 4 |
| `dummy7` |  | (tidak ditulis di project ini) | 1 |
| `lostconnection` |  | (tanpa program)/LadderBody#27 | 52 |
| `noresponse` |  | (tanpa program)/LadderBody#7 | 1 |
| `phasedone` |  | (tanpa program)/LadderBody#6 | 23 |
| `procrssdone` |  | (tanpa program)/LadderBody#81 | 15 |
| `sdasd` |  | (tidak ditulis di project ini) | 1 |
| `sdasd.Q` |  | (tidak ditulis di project ini) | 1 |
| `sendECOk` |  | (tidak ditulis di project ini) | 1 |
| `sendP2` |  | (tanpa program)/LadderBody#1 | 13 |
| `sendP2NG` |  | (tanpa program)/LadderBody#1 | 11 |
| `sendP2check` |  | (tanpa program)/LadderBody#58 | 1 |
| `sendP2fail` |  | (tanpa program)/LadderBody#60 | 2 |
| `sendP2failreset` |  | (tanpa program)/LadderBody#83 | 0 |
| `sendRSok` |  | (tanpa program)/LadderBody#67 | 6 |
| `sendSHok` |  | (tanpa program)/LadderBody#68 | 6 |
| `sendSNok` |  | (tanpa program)/LadderBody#69 | 6 |
| `sendWCOk` |  | (tanpa program)/LadderBody#71 | 3 |
| `sendWROk` |  | (tanpa program)/LadderBody#70 | 3 |
| `status` |  | (tanpa program)/LadderBody#24 | 1 |
| `timeroff1` |  | (tanpa program)/LadderBody#20 | 0 |
| `timerok` |  | (tanpa program)/LadderBody#25 | 1 |
| `timeron4` |  | (tanpa program)/LadderBody#18 | 2 |
| `tst1` |  | (tidak ditulis di project ini) | 1 |