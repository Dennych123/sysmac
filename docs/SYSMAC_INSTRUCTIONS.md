# Instruksi Sysmac NJ/NX — FUN atau FB

Ditarik otomatis dari **W560 NY-series Instructions Reference Manual** (1562 halaman; set instruksinya sama dengan NJ/NX W502), lalu dicocokkan dengan bentuk pin dari project `.smc2` nyata yang sudah jalan di mesin.

Dibuat ulang dengan `scripts/…` di scratchpad; kalau manualnya diganti versi, tarik ulang — jangan disunting tangan satu-satu.

## Kenapa kolom FUN/FB itu yang paling penting

**FB butuh nama instance, FUN tidak.** Salah menaruhnya = `(DefinitionError)` waktu import, dan Studio TIDAK menyebut alasannya. Aturan lengkap + bentuk XML-nya ada di [CLAUDE.md](../CLAUDE.md#instruksi-di-luar-kontakcoil--fun-vs-fb).

Kolom **ENO**: `ya` = kotaknya punya pin ENO (aliran daya keluar). `tidak` = keluarannya cuma pin hasil; rung TIDAK bisa diteruskan lewat ENO karena tidak ada.

Kolom **Pin** diambil dari tabel Variables di manual: `In-out` artinya pin itu muncul di sisi masuk DAN sisi keluar sekaligus (lihat `Inc`).

`**` dalam nama itu tanda **keluarga**, bukan nama harfiah: manual menulis `Get**Clk` sekali untuk `Get1sClk`, `Get100msClk`, `Get10msClk`, dan seterusnya. Anggota keluarganya sekelas semua.

Satu baris ditambahkan tangan karena penarikan otomatisnya meleset: **`GE` / `>=`**. Halaman 2-108 memuat LT/LE/GT/GE sekaligus — satu halaman untuk empat instruksi — dan yang tertarik cuma tiga. Generator memakainya. Kalau manualnya ditarik ulang, periksa baris ini lagi.


## Ladder Diagram Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `LD` |  | Load | — |  |  | 2-14 |
| `LDN` |  | Load NOT | — |  |  | 2-14 |
| `AND` |  | Logical AND | — |  |  | 2-17 |
| `ANDN` |  | AND NOT | — |  |  | 2-17 |
| `OR` |  | Logical OR | — |  |  | 2-20 |
| `ORN` |  | OR NOT | — |  |  | 2-20 |
| `Out` |  | Output | — |  |  | 2-23 |
| `OutNot` |  | Output NOT | — |  |  | 2-23 |

## ST Statement Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `IF` |  | If | — |  |  | 2-28 |
| `CASE` |  | Case | — |  |  | 2-32 |
| `WHILE` |  | While | — |  |  | 2-36 |
| `REPEAT` |  | Repeat | — |  |  | 2-39 |
| `EXIT` |  | Break Loop | — |  |  | 2-42 |
| `RETURN` |  | Return | — |  |  | 2-45 |
| `FOR` |  | Repeat Start | — |  |  | 2-46 |

## Sequence Input Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `R_TRIG` | `Up` | Up Trigger Outputs TRUE for one task period | FB |  |  | 2-48 |
| `TestABit` |  | Test A Bit | FUN | tidak | Out (output), Sequence (input) | 2-52 |
| `TestABitN` |  | Test A Bit NOT | FUN | tidak | Out (output), Sequence (input) | 2-52 |

## Sequence Output Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `RS` |  | Reset-Priority Keep | FB | tidak | Q1 (output), ry (input), Sequence (output) | 2-56 |
| `SR` |  | Set-Priority Keep | FB | tidak | Q1 (output), Sequence (output), ry (input) | 2-59 |
| `Set` |  | Set Changes a BOOL variable to TRUE. | FB |  |  | 2-62 |
| `Reset` |  | PLC Controller Error | FB | tidak |  | 2-62 |
| `SetBits` |  | Set Bits | FUN | ya | InOut (in-out), Out (output), Sequence (output) | 2-66 |
| `ResetBits` |  | Reset Bits | FUN | ya | InOut (in-out), Out (output), Sequence (output) | 2-66 |
| `SetABit` |  | Set A Bit | FUN | ya | InOut (in-out), Pos (input), Out (output), Sequence (output) | 2-69 |
| `ResetABit` |  | Reset A Bit | FUN | ya | InOut (in-out), Pos (input), Out (output), Sequence (output) | 2-69 |
| `OutABit` |  | Output A Bit | FUN | ya | InOut (in-out), Out (output), Sequence (output) | 2-71 |

## Sequence Control Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `End` |  | End | FUN | ya |  | 2-74 |
| `MC` |  | Master Control Start | — |  |  | 2-77 |
| `MCR` |  | Master Control End | — |  |  | 2-77 |
| `JMP` |  | Jump | — |  |  | 2-90 |
| `NEXT` |  | Repeat End | — |  |  | 2-92 |
| `BREAK` |  | Break Loop | — |  |  | 2-99 |

## Comparison Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `EQ` | `=` | Equal | FUN | tidak | In1 to InN (input), Out (output) | 2-102 |
| `NE` | `<>` | Not Equal | FUN | tidak | In1 to InN (input), Out (output) | 2-105 |
| `LT` | `<` | Less Than | FUN | tidak | In1 to InN (input), Out (output) | 2-108 |
| `LE` | `<=` | Less Than Or Equal | FUN | tidak | In1 to InN (input), Out (output) | 2-108 |
| `GT` | `>` | Greater Than | FUN | tidak | In1 to InN (input), Out (output) | 2-108 |
| `GE` | `>=` | Greater Than Or Equal | FUN | tidak | In1 to InN (input), Out (output) | 2-108 |
| `EQascii` |  | Text String Compari- son Equal Determines if | FUN |  |  | 2-111 |
| `NEascii` |  | Text String Compari- son Not Equal Determine | FUN |  |  | 2-113 |
| `LTascii` |  | Text String Compari- son Less Than Performs | FUN |  |  | 2-115 |
| `LEascii` |  | Text String Compari- son Less Than or Equal | FUN |  |  | 2-115 |
| `GTascii` |  | Text String Compari- son Greater Than Perfor | FUN |  |  | 2-115 |
| `GEascii` |  | Text String Compari- son Greater Than or Equ | FUN |  |  | 2-115 |
| `Cmp` |  | Compare | FUN | ya | In1 (input) | 2-118 |
| `ZoneCmp` |  | Zone Compari- son | FUN | tidak | Out (output) | 2-120 |
| `TableCmp` |  | Table Compari- son | FUN | tidak | results (in-out), Out (output) | 2-122 |
| `AryCmpEQ` |  | Array Compari- son Equal | FUN | ya | ray (in-out), Out (output) | 2-125 |
| `AryCmpNE` |  | Array Compari- son Not Equal | FUN | ya | ray (in-out), Out (output) | 2-125 |
| `AryCmpLT` |  | Array Compari- son Less Than | FUN | ya | ray (in-out), Out (output) | 2-127 |
| `AryCmpLE` |  | Array Comparison Less Than Or Equal Performs | FUN |  |  | 2-127 |
| `AryCmpGT` |  | Array Comparison Greater Than Performs a gre | FUN |  |  | 2-127 |
| `AryCmpGE` |  | Array Comparison Greater Than Or Equal Perfo | FUN |  |  | 2-127 |
| `AryCmpEQV` |  | Array Value Compar- ison Equal Determines if | FUN |  |  | 2-130 |
| `AryCmpNEV` |  | Array Value Compar- ison Not Equal Determine | FUN |  |  | 2-130 |
| `AryCmpLTV` |  | Array Value Compar- ison Less Than Performs | FUN |  |  | 2-132 |
| `AryCmpLEV` |  | Array Value Compar- ison Less Than Or Equal | FUN |  |  | 2-132 |
| `AryCmpGTV` |  | Array Value Compar- ison Greater Than Perfor | FUN |  |  | 2-132 |
| `AryCmpGEV` |  | Array Value Compar- ison Greater Than Or Equ | FUN |  |  | 2-132 |

## Timer Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `TON` |  | On-Delay Timer | FB | tidak |  | 2-136 |
| `TOF` |  | Off-Delay Timer | FB | tidak |  | 2-142 |
| `TP` |  | Timer Pulse | FB | tidak |  | 2-145 |
| `AccumulationTimer` |  | Accumulation Timer Accumulates the period of | FB |  |  | 2-148 |
| `Timer` |  | Hundred-ms Timer Outputs TRUE when the set t | FB |  |  | 2-152 |

## Counter Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `CTD` |  | Down-counter | FB | tidak |  | 2-156 |
| `CTD_**` |  | Down-counter Group | FB | tidak |  | 2-158 |
| `CTU` |  | Up-counter | FB | tidak |  | 2-161 |
| `CTU_**` |  | Up-counter Group | FB | tidak |  | 2-164 |
| `CTUD` |  | Up-down Coun- ter | FB | tidak |  | 2-167 |
| `CTUD_**` |  | Up-down Coun- ter Group | FB | tidak |  | 2-172 |

## Math Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `ADD` | `+` | (+) Addition | FUN | ya | In1 to InN (input), Out (output) | 2-179 |
| `AddOU` | `+OU` | Addition with Over- flow Check Adds integers | FUN |  |  | 2-183 |
| `SUB` | `-` | (-) Subtraction | FUN | ya | Out (output) | 2-187 |
| `SubOU` | `-OU` | Subtraction with Overflow Check Subtracts in | FUN |  |  | 2-190 |
| `MUL` | `*` | (*) Multiplication | FUN | ya | In1 to InN (input), Out (output) | 2-194 |
| `MulOU` | `*OU` | Multiplication with Overflow Check Multiplie | FUN |  |  | 2-198 |
| `MOD` |  | Modulo-division | FUN | ya | Out (output) | 2-205 |
| `ABS` |  | Absolute Value | FUN | ya | In (input), Out (output) | 2-207 |
| `RadToDeg` |  | Radians to De- grees | FUN | ya | In (input), Out (output) | 2-209 |
| `DegToRad` |  | Degrees to Ra- dians | FUN | ya | In (input), Out (output) | 2-209 |
| `SIN` |  | Sine in Radians | FUN | ya | In (input), Out (output) | 2-211 |
| `COS` |  | Cosine in Radi- ans | FUN | ya | In (input), Out (output) | 2-211 |
| `TAN` |  | Tangent in Ra- dians | FUN | ya | In (input), Out (output) | 2-211 |
| `ASIN` |  | Principal Arc Sine (SIN-1) Calculates the ar | FUN |  |  | 2-214 |
| `ACOS` |  | Principal Arc Cosine (COS-1) Calculates the | FUN |  |  | 2-214 |
| `ATAN` |  | Principal Arc Tan- gent (T AN-1) Calculates | FUN |  |  | 2-214 |
| `SQRT` |  | Square Root | FUN | ya | In (input), Out (output) | 2-217 |
| `LN` |  | Natural Loga- rithm | FUN | ya | In (input), Out (output) | 2-220 |
| `LOG` |  | Logarithm Base 10 | FUN | ya | In (input), Out (output) | 2-220 |
| `EXP` |  | Natural Exponential Operation Performs calcu | FUN |  |  | 2-224 |
| `EXPT` | `**` | (**) Exponentiation | FUN | ya | Out (output) | 2-226 |
| `Inc` |  | Increment | FUN | ya | InOut (in-out), Out (output) | 2-231 |
| `Dec` |  | Decrement | FUN | ya | InOut (in-out), Out (output) | 2-231 |
| `Rand` |  | Random Num- ber | FB | ya | tern (input), Rnd (output) | 2-233 |
| `AryAdd` |  | Array Addition | FUN | ya | ray (in-out), Out (output) | 2-235 |
| `AryAddV` |  | Array Value Ad- dition | FUN | ya | Out (output) | 2-237 |
| `ArySub` |  | Array Subtrac- tion | FUN | ya | ray (in-out), Out (output) | 2-239 |
| `ArySubV` |  | Array Value Subtraction | FUN | ya | ray (in-out), Out (output) | 2-241 |
| `AryMean` |  | Array Mean | FUN | ya | Out (output) | 2-243 |
| `ArySD` |  | Array Element Standard Deviation Calculates | FUN |  |  | 2-245 |
| `ModReal` |  | Real Number Modulo-division | FUN | ya | Out (output) | 2-247 |
| `Fraction` |  | Real Number Fraction | FUN | ya | In (input), Out (output) | 2-249 |
| `CheckReal` |  | Real Number Check | FUN | ya | In (input) | 2-251 |

## BCD Conversion Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `BCDsToBin` |  | Signed BCD-to- Signed Integer Con- version C | FUN |  |  | 2-265 |
| `BinToBCDs_**` |  | Signed Integer-to- BCD Conversion Group Conv | FUN |  |  | 2-268 |
| `AryToBCD` |  | Array BCD Conversion | FUN | ya | Out (output) | 2-271 |
| `AryToBin` |  | Array Unsigned Inte- ger Conversion Converts | FUN |  |  | 2-273 |

## Data Type Conversion Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `RealToFormatString` |  | REAL-to-Formatted T ext String Converts a RE | FUN |  |  | 2-307 |
| `LrealToFormatString` |  | LREAL-to-Formatted T ext String Converts a L | FUN |  |  | 2-313 |
| `STRING_TO_**` | `T ext String-to-Inte- ger Conversion Group` | Text String-to-Inte- ger Conversion Group Co | FUN |  |  | 2-319 |
| `TO_**` | `Integer Con- version Group` | Integer Conver- sion Group | FUN | ya | In (input), Out (output) | 2-327 |
| `EnumToNum` |  | Enumeration-to- Integer | FUN | ya | In (input), Out (output), output (output), If (output), In (output) | 2-333 |
| `NumToEnum` |  | Integer-to-Enu- meration | FUN | tidak | In (input), InOut (in-out), Out (output) | 2-335 |
| `TRUNC` |  | Truncate | FUN | ya | In (input), Out (output) | 2-338 |
| `Round` |  | Round Off Real Number | FUN | ya | In (input), Out (output) | 2-338 |
| `RoundUp` |  | Round Up Real Number | FUN | ya | In (input), Out (output) | 2-338 |

## Bit String Processing Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `XOR` |  | Logical Exclu- sive OR | FUN | ya | In1 to InN (input), Out (output) | 2-342 |
| `XORN` |  | Logical Exclu- sive NOR | FUN | ya | In1 to InN (input), Out (output) | 2-345 |
| `NOT` |  | Bit Reversal | FUN | ya | In (input), Out (output) | 2-347 |
| `AryOr` |  | Array Logical OR | FUN | ya | ray (in-out), Out (output) | 2-349 |
| `AryXor` |  | Array Logical Exclusive OR | FUN | ya | ray (in-out), Out (output) | 2-349 |
| `AryXorN` |  | Array Logical Exclusive NOR | FUN | ya | ray (in-out), Out (output) | 2-349 |

## Selection Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `SEL` |  | Binary Selec- tion | FUN | ya | Out (output) | 2-354 |
| `MUX` |  | Multiplexer | FUN | ya | Out (output) | 2-356 |
| `LIMIT` |  | Limiter | FUN | ya | Out (output) | 2-359 |
| `Band` |  | Deadband Con- trol | FUN | ya | Out (output) | 2-361 |
| `Zone` |  | Dead Zone Control | FUN | ya | Out (output) | 2-363 |
| `MAX` |  | Maximum | FUN | ya | In1 to InN (input), Out (output) | 2-365 |
| `MIN` |  | Minimum | FUN | ya | In1 to InN (input), Out (output) | 2-365 |
| `AryMax` |  | Array Maximum | FUN | ya | InOutPos (in-out) | 2-367 |
| `AryMin` |  | Array Minimum | FUN | ya | InOutPos (in-out) | 2-367 |
| `ArySearch` |  | Array Search | FUN | ya | ber (in-out) | 2-370 |

## Data Movement Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `MOVE` |  | Move | FUN | ya | In (input), Out (output) | 2-374 |
| `MoveBit` |  | Move Bit | FUN | ya | InOut (in-out), Out (output) | 2-377 |
| `MoveDigit` |  | Move Digit | FUN | ya | InOut (in-out), Out (output) | 2-379 |
| `TransBits` |  | Move Bits | FUN | ya | InOut (in-out), Out (output) | 2-381 |
| `MemCopy` |  | Memory Copy | FUN | ya | Out (output) | 2-383 |
| `SetBlock` |  | Block Set | FUN | ya | Out (output) | 2-385 |
| `Exchange` |  | Data Exchange | FUN | ya | InOut2 (in-out), Out (output) | 2-387 |
| `AryExchange` |  | Array Data Ex- change | FUN | ya | Size (input), Arrays to exchange (in-out), Out (output) | 2-389 |
| `AryMove` |  | Array Move | FUN | ya | Out (output) | 2-391 |
| `Clear` |  | Initialize | FUN | ya | InOut (in-out), Out (output) | 2-393 |
| `Copy**ToNum` | `Bit String to Signed In- teger` | Bit Pattern Copy (Bit String to Signed In- t | FUN |  |  | 2-395 |
| `CopyNumTo**` | `Sign- ed Integer to Bit String` | Bit Pattern Copy (Signed Integer to Bit Stri | FUN |  |  | 2-399 |
| `Copy**To***` | `Real Number to Bit String` | Bit Pattern Copy (Real Number to Bit String) | FUN |  |  | 2-403 |

## Shift Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `AryShiftReg` |  | Shift Register | FB | ya | In (input) | 2-408 |
| `AryShiftRegLR` |  | Reversible Shift Register Shifts an array of | FB |  |  | 2-410 |
| `ArySHL` |  | Array N-ele- ment Left Shift | FUN | ya | Out (output) | 2-413 |
| `ArySHR` |  | Array N-ele- ment Right Shift | FUN | ya | Out (output) | 2-413 |
| `SHL` |  | N-bit Left Shift | FUN | ya | Out (output) | 2-416 |
| `SHR` |  | N-bit Right Shift | FUN | ya | Out (output) | 2-416 |
| `NSHLC` |  | Shift N-bits Left with Carry | FUN | ya | register (input), Out (output) | 2-418 |
| `NSHRC` |  | Shift N-bits Right with Carry | FUN | ya | register (input), Out (output) | 2-418 |
| `ROL` |  | Rotate N-bits Left | FUN | ya | Out (output) | 2-421 |
| `ROR` |  | Rotate N-bits Right | FUN | ya | Out (output) | 2-421 |

## Conversion Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `Swap` |  | Swap Bytes | FUN | ya | In (input), Out (output) | 2-427 |
| `Neg` |  | Reverse Sign | FUN | ya | In (input), Out (output) | 2-429 |
| `Encoder` |  | Bit Encoder | FUN | ya | Out (output) | 2-434 |
| `BitCnt` |  | Bit Counter | FUN | ya | In (input), Out (output) | 2-436 |
| `ColmToLine_**` |  | Column to Line Con- version Group Extracts b | FUN |  |  | 2-437 |
| `LineToColm` |  | Line to Column Conversion | FUN | ya | Out (output) | 2-439 |
| `Gray` |  | Gray Code Conversion | FUN | ya | Out (output) | 2-441 |
| `UTF8ToSJIS` |  | UTF-8 to SJIS Char- acter Code Conver- sion | FUN |  |  | 2-446 |
| `SJISToUTF8` |  | SJIS to UTF-8 Char- acter Code Conver- sion | FUN |  |  | 2-448 |
| `PWLApprox` |  | Broken Line Approx- imation with Broken Line | FUN |  |  | 2-450 |
| `PWLLineChk` |  | Broken Line Data Check | FUN | tidak | Out (output) | 2-456 |
| `MovingAverage` |  | Moving Average Calculates a moving average. | FUN |  |  | 2-459 |
| `DispartReal` |  | Separate Mantissa and Exponent Separates a r | FUN |  |  | 2-466 |
| `UniteReal` |  | Combine Real Num- ber Mantissa and Exponent | FUN |  |  | 2-469 |
| `NumToDecString` |  | Fixed-length Deci- mal T ext String Con- ver | FUN |  |  | 2-471 |
| `NumToHexString` |  | Fixed-length Hexa- decimal T ext String Conv | FUN |  |  | 2-471 |
| `HexStringToNum_**` |  | Hexadecimal Text String-to-Number Conversion | FUN |  |  | 2-474 |
| `FixNumToString` |  | Fixed-decimal Num- ber-to-T ext String Conve | FUN |  |  | 2-476 |
| `StringToFixNum` |  | Text String-to-Fixed- decimal Conversion Con | FUN |  |  | 2-478 |
| `DtToString` |  | Date and Time-to- T ext String Conver- sion | FUN |  |  | 2-481 |
| `DateToString` |  | Date-to-Text String Conversion Converts a da | FUN |  |  | 2-483 |
| `GrayToBin_**` |  | Gray Code-to-Binary Code Conversion Group Co | FUN |  |  | 2-487 |
| `BinToGray_**` |  | Binary Code-to-Gray Code Conversion Converts | FUN |  |  | 2-487 |
| `StringToAry` |  | Text String-to-Array Conversion Converts a t | FUN |  |  | 2-490 |
| `AryToString` |  | Array-to-Text String Conversion Converts a B | FUN |  |  | 2-492 |
| `DispartDigit` |  | Four-bit Sepa- ration | FUN | ya | ray (in-out), Out (output) | 2-494 |
| `UniteDigit_**` |  | Four-bit Join Group | FUN | ya | Out (output) | 2-496 |
| `Dispart8Bit` |  | Byte Data Sep- aration | FUN | ya | ray (in-out), Out (output) | 2-498 |
| `Unite8Bit_**` |  | Byte Data Join Group | FUN | ya | Out (output) | 2-500 |
| `ToAryByte` |  | Conversion to Byte Array | FUN | ya | ray (in-out), result (output) | 2-502 |
| `AryByteTo` |  | Conversion from Byte Array | FUN | ya | OutVal (in-out), Out (output) | 2-508 |
| `SizeOfAry` |  | Get Number of Array Elements | FUN | ya | In[] (input), Out (output) | 2-514 |
| `PackWord` |  | 2-byte Join | FUN | ya | Out (output) | 2-516 |
| `PackDword` |  | 4-byte Join | FUN | ya | Out (output) | 2-518 |
| `LOWER_BOUND` |  | Get First Number of Array Gets the first num | FUN |  |  | 2-520 |
| `UPPER_BOUND` |  | Get Last Number of Array Gets the last numbe | FUN |  |  | 2-520 |

## Stack and Table Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `StackPush` |  | Push onto Stack | FUN | ya | In (input), Out (output) | 2-526 |
| `StackFIFO` |  | First In First Out | FUN | ya | ments (input), ta (output), Out (output) | 2-535 |
| `StackLIFO` |  | Last In First Out | FUN | ya | ments (input), ta (output), Out (output) | 2-535 |
| `StackIns` |  | Insert into Stack | FUN | ya | Out (output) | 2-538 |
| `StackDel` |  | Delete from Stack | FUN | ya | Out (output) | 2-541 |
| `RecSearch` |  | Record Search | FUN | ya | matching (in-out) | 2-543 |
| `RecRangeSearch` |  | Range Record Search Searches an array of str | FUN |  |  | 2-548 |
| `RecSort` |  | Record Sort | FB | tidak |  | 2-553 |
| `RecNum` |  | Get Number of Records | FUN | ya | Out (output) | 2-559 |
| `RecMax` |  | Maximum Re- cord Search | FUN | ya |  | 2-561 |
| `RecMin` |  | Minimum Re- cord Search | FUN | ya |  | 2-561 |
| `StringLRC` |  | Calculate Text String LRC | FUN | ya | In (input), Out (output) | 2-568 |
| `StringCRCCCITT` |  | Calculate Text String CRC-CCITT Calculates t | FUN |  |  | 2-570 |
| `StringCRC16` |  | Calculate Text String CRC-16 | FUN | ya | Out (output) | 2-572 |
| `AryLRC_**` |  | Calculate Array LRC Group | FUN | ya |  | 2-574 |
| `AryCRCCCITT` |  | Calculate Array CRC-CCITT Calculates the CRC | FUN |  |  | 2-576 |
| `AryCRC16` |  | Calculate Array CRC-16 | FUN | ya | Out (output) | 2-578 |

## Text String Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `CONCAT` |  | Concatenate String | FUN | ya | In1 to InN (input), Out (output) | 2-582 |
| `LEFT` |  | Get String Left | FUN | ya | Out (output) | 2-584 |
| `RIGHT` |  | Get String Right | FUN | ya | Out (output) | 2-584 |
| `MID` |  | Get String Any | FUN | ya | Out (output) | 2-587 |
| `FIND` |  | Find String | FUN | ya | Out (output) | 2-589 |
| `LEN` |  | String Length | FUN | ya | In (input), Out (output) | 2-591 |
| `REPLACE` |  | Replace String | FUN | ya | Out (output) | 2-593 |
| `DELETE` |  | Delete String | FUN | ya | Out (output) | 2-595 |
| `INSERT` |  | Insert String | FUN | ya | Out (output) | 2-597 |
| `GetByteLen` |  | Get Byte Length | FUN | ya | In (input), Out (output) | 2-599 |
| `ClearString` |  | Clear String | FUN | ya | InOut (in-out), Out (output) | 2-601 |
| `ToUCase` |  | Convert to Up- percase | FUN | ya | In (input), Out (output) | 2-603 |
| `ToLCase` |  | Convert to Low- ercase | FUN | ya | In (input), Out (output) | 2-603 |
| `TrimL` |  | Trim String Left | FUN | ya | In (input), Out (output) | 2-605 |
| `TrimR` |  | Trim String Right | FUN | ya | In (input), Out (output) | 2-605 |
| `AddDelimiter` |  | Put Text Strings with Delimiters | FUN | ya | In (input), Out (output) | 2-607 |
| `SubDelimiter` |  | Get Text Strings Mi- nus Delimiters Reads ou | FUN |  |  | 2-619 |

## Time and Time of Day Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `ADD_TIME` |  | Add Time | FUN | ya | Out (output) | 2-633 |
| `ADD_TOD_TIME` |  | Add Time to Time of Day Adds a time to a tim | FUN |  |  | 2-635 |
| `ADD_DT_TIME` |  | Add Time to Date and T ime Adds a time to a | FUN |  |  | 2-637 |
| `SUB_TIME` |  | Subtract Time | FUN | ya | Out (output) | 2-639 |
| `SUB_TOD_TIME` |  | Subtract Time from T ime of Day Subtracts a | FUN |  |  | 2-641 |
| `SUB_TOD_TOD` |  | Subtract Time of Day Subtracts a time of day | FUN |  |  | 2-643 |
| `SUB_DATE_DATE` |  | Subtract Date Subtracts a date from another | FUN |  |  | 2-645 |
| `SUB_DT_DT` |  | Subtract Date and T ime Subtracts a date and | FUN |  |  | 2-646 |
| `SUB_DT_TIME` |  | Subtract Time from Date and T ime Subtracts | FUN |  |  | 2-648 |
| `MULTIME` |  | Multiply Time | FUN | ya | Out (output) | 2-650 |
| `DIVTIME` |  | Divide Time | FUN | ya | Out (output) | 2-652 |
| `DT_TO_TOD` |  | Extract Time of Day from Date and T ime Extr | FUN |  |  | 2-656 |
| `DT_TO_DATE` |  | Extract Date from Date and T ime Extracts th | FUN |  |  | 2-658 |
| `GetTime` |  | Get Time of Day | FUN | ya | Out (output) | 2-660 |
| `DtToSec` |  | Convert Date and T ime to Seconds Converts a | FUN |  |  | 2-662 |
| `DateToSec` |  | Convert Date to Seconds | FUN | ya | In (input), Out (output) | 2-664 |
| `TodToSec` |  | Convert Time of Day to Seconds | FUN | ya | In (input), Out (output) | 2-666 |
| `SecToDt` |  | Convert Seconds to Date and T ime Converts t | FUN |  |  | 2-668 |
| `SecToDate` |  | Convert Sec- onds to Date | FUN | ya | In (input), Out (output) | 2-670 |
| `SecToTod` |  | Convert Seconds to T ime of Day Converts the | FUN |  |  | 2-672 |
| `TimeToNanoSec` |  | Convert Time to Nanoseconds Converts a time | FUN |  |  | 2-674 |
| `TimeToSec` |  | Convert Time to Seconds | FUN | ya | In (input), Out (output) | 2-675 |
| `NanoSecToTime` |  | Convert Nanosec- onds to T ime Converts nano | FUN |  |  | 2-677 |
| `SecToTime` |  | Convert Seconds to T ime Converts seconds to | FUN |  |  | 2-678 |
| `ChkLeapYear` |  | Check for Leap Year Checks if a specified ye | FUN |  |  | 2-680 |
| `GetDaysOfMonth` |  | Get Days in Month Gets the number of days in | FUN |  |  | 2-681 |
| `DaysToMonth` |  | Convert Days to Month | FUN | ya | Out (output) | 2-684 |
| `GetWeekOfYear` |  | Get Week Number Gets the week number for a s | FUN |  |  | 2-688 |
| `DtToDateStruct` |  | Break Down Date and T ime Converts a date an | FUN |  |  | 2-690 |
| `DateStructToDt` |  | Join Time Joins a year, month, day, hour, mi | FUN |  |  | 2-693 |
| `TruncTime` |  | Truncate Time | FUN | ya | Out (output) | 2-696 |
| `TruncDt` |  | Truncate Date and T ime Truncates a DT varia | FUN |  |  | 2-700 |
| `TruncTod` |  | Truncate Time of Day | FUN | ya | cation (output) | 2-704 |

## Analog Control Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `PIDAT` |  | PID Control with Autotuning | FB | tidak |  | 2-710 |
| `PIDAT_HeatCool` |  | Heating/Cooling PID with Autotuning Performs | FB |  |  | 2-741 |
| `TimeProportionalOut` |  | Time-proportional output Converts a manipula | FB |  |  | 2-779 |
| `LimitAlarm_**` |  | Upper/Lower Limit Alarm Group Outputs an ala | FB |  |  | 2-798 |
| `LimitAlarmDv_**` |  | Upper/Lower Devia- tion Alarm Group Outputs | FB |  |  | 2-803 |
| `ScaleTrans` |  | Scale Transfor- mation | FUN | ya | SclIn (input), X0 (input), Y0 (output), X1 (input), Y1 (output), Out (output) | 2-826 |
| `AC_StepProgram` |  | Step Program Calculates the present set poin | FB |  |  | 2-829 |

## System Control Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `TraceSamp` |  | Data Trace Sampling | FUN | ya | Out (output) | 2-858 |
| `TraceTrig` |  | Data Trace Trigger Generates a trigger for d | FUN |  |  | 2-861 |
| `GetTraceStatus` |  | Read Data Trace Status Reads the execution s | FUN |  |  | 2-864 |
| `SetAlarm` |  | Create User-de- fined Error | FUN | ya | Out (output) | 2-867 |
| `ResetAlarm` |  | Reset User-de- fined Error | FUN | ya | Code (input), Out (output) | 2-872 |
| `ResetPLCError` |  | Reset PLC Control- ler Error Resets errors i | FB |  |  | 2-876 |
| `GetPLCError` |  | Get PLC Controller Error Status Gets the hig | FUN |  |  | 2-880 |
| `GetEIPError` |  | Get EtherNet/IP Error Status | FUN | tidak |  | 2-882 |
| `ResetMCError` |  | Reset Motion Control Error | FB | tidak | Failure (output) | 2-884 |
| `GetMCError` |  | Get Motion Control Error Status Gets the hig | FUN |  |  | 2-889 |
| `ResetECError` |  | Reset EtherCAT Er- ror Resets Controller err | FB |  |  | 2-891 |
| `GetECError` |  | Get EtherCAT Error Status | FUN | tidak | Detected (output) | 2-893 |
| `SetInfo` |  | Create User-defined Information Creates user | FUN |  |  | 2-896 |
| `RestartNXUnit` |  | Restart NX Unit | FB | tidak | UnitProxy (input) | 2-898 |
| `NX_SaveParam` |  | Save NX Unit Pa- rameters Saves the data tha | FB |  |  | 2-908 |

## Program Control Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `PrgStart` |  | Enable Pro- gram | FUN | tidak | Out (output) | 2-924 |
| `PrgStop` |  | Disable Pro- gram | FUN | tidak | PrgName (input), Out (output) | 2-933 |
| `PrgStatus` |  | Read Program Status | FUN | ya | PrgName (input), Out (output) | 2-952 |

## EtherCAT Communications Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `EC_CoESDOWrite` |  | Write EtherCAT CoE SDO Writes a value to a C | FB |  |  | 2-958 |
| `EC_CoESDORead` |  | Read EtherCAT CoE SDO Reads a value from a C | FB |  |  | 2-961 |
| `EC_StartMon` |  | Start EtherCAT Packet Monitor | FB | tidak |  | 2-967 |
| `EC_StopMon` |  | Stop EtherCAT Packet Monitor | FB | tidak |  | 2-973 |
| `EC_CopyMon` |  | Transfer EtherCAT Packets Transfers packet d | FB |  |  | 2-977 |
| `EC_ConnectSlave` |  | Connect EtherCAT Slave Connects the specifie | FB |  |  | 2-987 |
| `NX_WriteObj` |  | Write NX Unit Object | FB | tidak |  | 2-1019 |
| `NX_ReadObj` |  | Read NX Unit Object | FB | tidak | ReadDat (in-out), The (input) | 2-1035 |

## IO-Link Communications Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `IOL_ReadObj` |  | Read IO-Link Device Object | FB | tidak | ReadDat (in-out) | 2-1044 |
| `IOL_WriteObj` |  | Write IO-Link Device Object Writes data to I | FB |  |  | 2-1053 |

## EtherNet/IP Communications Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `CIPOpen` |  | Open CIP Class 3 Connection (Large_For- ward | FB |  |  | 2-1065 |
| `CIPWrite` |  | Write Variable Class 3 Explicit | FB | tidak |  | 2-1085 |
| `CIPSend` |  | Send Explicit Mes- sage Class 3 Sends a clas | FB |  |  | 2-1091 |
| `CIPClose` |  | Close CIP Class 3 Connection Closes the CIP | FB |  |  | 2-1096 |
| `CIPUCMMRead` |  | Read Variable UCMM Explicit Uses a UCMM expl | FB |  |  | 2-1099 |
| `CIPUCMMWrite` |  | Write Variable UCMM Explicit Uses a UCMM exp | FB |  |  | 2-1105 |
| `CIPUCMMSend` |  | Send Explicit Mes- sage UCMM Sends a UCMM CI | FB |  |  | 2-1112 |
| `SktUDPCreate` |  | Create UDP Socket | FB | tidak | ber (input), Socket (output) | 2-1123 |
| `SktUDPRcv` |  | UDP Socket Receive | FB | tidak |  | 2-1131 |
| `SktUDPSend` |  | UDP Socket Send | FB | tidak |  | 2-1134 |
| `SktTCPAccept` |  | Accept TCP Socket | FB | tidak | Socket (output) | 2-1137 |
| `SktTCPConnect` |  | Connect TCP Sock- et Connects to a remote TC | FB |  |  | 2-1140 |
| `SktTCPRcv` |  | TCP Socket Receive | FB | tidak | RcvSize (output) | 2-1149 |
| `SktTCPSend` |  | TCP Socket Send | FB | tidak |  | 2-1152 |
| `SktGetTCPStatus` |  | Read TCP Socket Status Reads the status of a | FB |  |  | 2-1155 |
| `SktClose` |  | Close TCP/UDP Socket Closes the specified TC | FB |  |  | 2-1158 |
| `SktClearBuf` |  | Clear TCP/UDP Socket Receive Buf- fer Clears | FB |  |  | 2-1161 |
| `SktSetOption` |  | Set TCP Socket Option | FB | tidak |  | 2-1164 |
| `ChangeIPAdr` |  | Change IP Ad- dress | FB | tidak |  | 2-1169 |
| `ChangeFTPAccount` |  | Change FTP Ac- count Changes the FTP login n | FB |  |  | 2-1178 |
| `FTPGetFileList` |  | Get FTP Server File List Gets a list of the | FB |  |  | 2-1182 |
| `FTPGetFile` |  | Get File from FTP Server | FB | tidak | Downloaded (in-out) | 2-1197 |
| `FTPPutFile` |  | Put File onto FTP Server | FB | tidak | Uploaded (in-out) | 2-1206 |
| `FTPRemoveFile` |  | Delete FTP Server File Deletes a file from t | FB |  |  | 2-1217 |
| `FTPRemoveDir` |  | Delete FTP Server Directory Deletes a direct | FB |  |  | 2-1227 |

## Serial Communications Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `NX_SerialSend` |  | Send No-protocol Data Sends data in No-proto | FB |  |  | 2-1232 |
| `NX_SerialRcv` |  | Receive No- protocol Data | FB | tidak |  | 2-1244 |
| `NX_ModbusRtuCmd` |  | Send Modbus RTU General Command Sends genera | FB |  |  | 2-1258 |
| `NX_SerialSigCtl` |  | Serial Control Signal ON/OFF Switching Turns | FB |  |  | 2-1290 |
| `NX_SerialBufClear` |  | Clear Buffer Clears the send or receive buff | FB |  |  | 2-1297 |
| `NX_SerialStartMon` |  | Start Serial Line Monitoring Starts serial l | FB |  |  | 2-1307 |
| `NX_SerialStopMon` |  | Stop Serial Line Monitoring Stops serial lin | FB |  |  | 2-1311 |

## SD Memory Card Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `FileWriteVar` |  | Write Variable to File | FB | tidak |  | 2-1316 |
| `FileReadVar` |  | Read Variable from File | FB | tidak | FileName (input), ReadVar (in-out) | 2-1322 |
| `FileOpen` |  | Open File | FB | tidak | FileID (output) | 2-1328 |
| `FileClose` |  | Close File | FB | tidak | FileID (input) | 2-1332 |
| `FileSeek` |  | Seek File | FB | tidak |  | 2-1335 |
| `FileRead` |  | Read File | FB | tidak |  | 2-1338 |
| `FileWrite` |  | Write File | FB | tidak | ments (output) | 2-1346 |
| `FileGets` |  | Get Text String | FB | tidak |  | 2-1354 |
| `FilePuts` |  | Put Text String | FB | tidak |  | 2-1362 |
| `FileCopy` |  | Copy File | FB | tidak |  | 2-1371 |
| `FileRemove` |  | Delete File | FB | tidak | FileName (input) | 2-1378 |
| `FileRename` |  | Change File Name | FB | tidak |  | 2-1383 |
| `DirCreate` |  | Create Directo- ry | FB | tidak | DirName (input) | 2-1389 |
| `DirRemove` |  | Delete Directory | FB | tidak |  | 2-1392 |

## OS Control Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `IPC_GetOSStatus` |  | Read OS status Reads the status of the Indus | FUN |  |  | 2-1426 |
| `IPC_RebootOS` |  | Restart OS Restarts the Industrial PC’s oper | FB |  |  | 2-1429 |
| `IPC_Shutdown` |  | Shut Down Starts the shutdown processing of | FUN |  |  | 2-1432 |

## Other Instructions

| Instruksi | Simbol | Nama | FUN/FB | ENO | Pin | Manual |
|---|---|---|---|---|---|---|
| `ReadNbit_**` |  | N-bit Read Group | FUN | ya | Out (output) | 2-1436 |
| `WriteNbit_**` |  | N-bit Write Group | FUN | ya | InOut (in-out), Out (output) | 2-1438 |
| `ChkRange` |  | Check Subrange V ariable Determines if the v | FUN |  |  | 2-1440 |
| `GetMyTaskStatus` |  | Read Current Task Status Reads the status of | FUN |  |  | 2-1443 |
| `GetMyTaskInterval` |  | Read Current Task Period Reads the task peri | FUN |  |  | 2-1446 |
| `Task_IsActive` |  | Determine Task Status | FUN | tidak | TaskName (input), Out (output) | 2-1448 |
| `Lock` |  | Lock Tasks | FUN | ya | Index (input), Out (output) | 2-1450 |
| `Unlock` |  | Unlock Tasks | FUN | ya | Index (input), Out (output) | 2-1450 |
| `ActEventTask` |  | Activate Event Task Activates an event task. | FUN |  |  | 2-1456 |
| `Get**Clk` |  | Get Clock Pulse Group | FUN | tidak | Out (output) | 2-1463 |
| `Get**Cnt` |  | Get Incrementing Free-running Coun- ter Grou | FUN |  |  | 2-1465 |

---

Instruksi yang di kolom FUN/FB-nya `—` bukan kotak fungsi: itu elemen ladder (kontak, coil, master control) atau pernyataan ST. Tidak pernah ditulis sebagai `<FbdObject xsi:type="Block">`.

