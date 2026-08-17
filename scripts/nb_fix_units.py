#!/usr/bin/env python3
"""Alamati ulang screen unit 04xx di project NB-Designer supaya cocok formula.

Kenapa ada alat ini. Di project produksi (Prepare HMI CE INSERT) screen 0431,
0441, 0442, 0451 itu copy-paste satu screen yang tidak pernah dialamati ulang:
keempatnya menulis W465 bit per bit sama persis. Tekan tombol di screen UNIT 4
atau UNIT 5, yang bergerak aktuator UNIT 3. Tidak ada yang protes - NB tidak
punya pemeriksaan tabrakan alamat, dan PLC cuma melihat bit yang berubah.

Alamat di sini TIDAK ditebak dari urutan widget di XML (urutan itu acak, ikut
urutan orang menggambar). Yang dipakai POSISI PIKSEL slot grid, karena itu yang
dilihat operator: tombol kiri-atas selalu slot 0, dan slot 0 selalu bit terendah.
Peta posisi->slot di bawah dibaca balik dari screen 0461/0471/0481 yang alamatnya
sudah benar.

    word tombol unit n = PB_BASE + n          (default 460)
    word lampu  unit n = word tombol + 23
    page 1 -> bit .00-.07,  page 2 -> bit .08-.15

Dipakai:
    python scripts/nb_fix_units.py "<project dir>"            # dry-run, cuma laporan
    python scripts/nb_fix_units.py "<project dir>" --apply    # tulis (bikin .whe.bak)

JANGAN jalankan langsung ke project produksi. Kerjakan di salinan, buka hasilnya
di NB-Designer, baru pakai.
"""
import os
import re
import shutil
import sys
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.expanduser("~"), ".claude", "skills", "nb-designer", "scripts"))
import nbproject  # noqa: E402

# Nama window di project ini bahasa Jepang; console cp1252 langsung crash tanpa ini.
nbproject.safe_stdout()

PB_BASE = 460
RD_OFFSET = 23
# Posisi di project asli meleset antar screen - paling jauh 8 px (0421 slot 3A di x=128, bukan 136).
# Jarak antar slot >= 50 px, jadi toleransi 9 masih tidak mungkin salah tebak slot. Jangan dinaikkan
# lagi tanpa mengecek ulang: 0411 punya tombol di x=56 yang cuma 11 px dari slot x=67, dan tombol itu
# memang BUKAN slot grid (layout unit 1 tidak standar).
TOL = 9

# Peta slot grid -> offset bit dalam page. Dibaca dari 0461 (unit 6) yang bersih.
SLOTS = [
    ((6, 89), 0), ((67, 89), 1),
    ((136, 89), 2), ((197, 89), 3),
    ((6, 178), 4), ((67, 178), 5),
    ((136, 178), 6), ((197, 178), 7),
]
# Nama window unit: "0431:UNIT_ 3-1(...)" -> unit 3, page 1.
# Angka "4" sesudah nol itu KONSTANTA penanda blok individual, bukan nomor unit -
# sempat kebaca sebagai unit dan bikin semua screen dialamati ke word yang salah.
WIN_RE = re.compile(r"^04(\d)(\d):\s*UNIT")


def slot_of(left, top):
    for (sl, st), bit in SLOTS:
        if abs(left - sl) <= TOL and abs(top - st) <= TOL:
            return bit
    return None


def pos_of(part):
    p = part.find("Position")
    if p is None:
        return None
    try:
        return int(p.findtext("Left")), int(p.findtext("Top"))
    except (TypeError, ValueError):
        return None


def addr_nodes(part):
    """[(Function, RegAddr)] buat tiap Address di satu Part."""
    out = []
    for ad in part.iter("Address"):
        fn = ad.get("Function") or ad.findtext("Function") or ""
        ra = ad.find(".//RegAddr")
        if ra is not None:
            out.append((fn, ra))
    return out


def set_addr(ra, word, bit):
    """Tulis DUA representasi sekaligus. Kalau cuma salah satu diubah, widget baca
    memori yang lain dari yang tertulis di layar - persis kegagalan diam yang paling
    mahal di NB (lihat catatan address encoding di SKILL.md)."""
    av = ra.find("AddressValue")
    if av is None:
        return False
    av.text = "%d.%02d" % (word, bit)
    ra.set("MasterValue", str(word * 16 + bit))
    return True


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    proj = sys.argv[1]
    apply_ = "--apply" in sys.argv
    nbp, whe = nbproject.find(proj)

    ET.register_namespace("", "")
    tree = ET.parse(whe)
    root = tree.getroot()

    changes, dropped, problems = [], [], []

    for win in root.iter("Window"):
        name = win.get("Name") or ""
        m = WIN_RE.match(name)
        if not m:
            continue
        unit, page = int(m.group(1)), int(m.group(2))
        wid = win.get("ProjectID") or "?"
        wr_word = PB_BASE + unit
        rd_word = wr_word + RD_OFFSET
        base = 0 if page == 1 else 8

        used = {}
        for part in win.iter("Part"):
            if part.get("Type") != "Switch":
                continue
            xy = pos_of(part)
            if xy is None:
                continue
            bit = slot_of(*xy)
            if bit is None:
                continue  # bukan switch grid (mis. toggle page W479.xx di header) - tidak disentuh
            bit += base
            key = (xy, bit)
            if key in used:
                # Dua widget di piksel yang sama: yang bawah tak pernah bisa ditekan. Tetap
                # dialamati SAMA dengan yang atas, bukan dilewati - kalau dilewati, alamat
                # lamanya (mis. W464 nyasar dari copy-paste) tertinggal di file dan bikin
                # siapa pun yang membaca peta alamat nanti mengira word itu masih dipakai.
                dropped.append("win %s %s: switch kembar bertumpuk di %s (slot bit %d)" % (wid, name[:18], xy, bit))
            used[key] = True
            for fn, ra in addr_nodes(part):
                word = rd_word if fn == "Read" else wr_word
                before = (ra.findtext("AddressValue") or "").strip()
                after = "%d.%02d" % (word, bit)
                if before != after:
                    if set_addr(ra, word, bit):
                        changes.append("win %-3s %-22s %-5s W%-9s -> W%s" % (wid, name[:22], fn, before, after))
                    else:
                        problems.append("win %s: RegAddr tanpa AddressValue" % wid)

    print("== RENCANA PERUBAHAN (%d) ==" % len(changes))
    for c in changes:
        print("  " + c)
    if dropped:
        print("\n== WIDGET BERTUMPUK, TIDAK DIALAMATI (%d) ==" % len(dropped))
        print("   hapus manual di NB-Designer - skrip ini sengaja tidak menghapus widget")
        for d in dropped:
            print("  " + d)
    if problems:
        print("\n== MASALAH (%d) ==" % len(problems))
        for p in problems:
            print("  " + p)

    if not apply_:
        print("\nDRY-RUN. Tambahkan --apply buat menulis.")
        return 0
    if not changes:
        print("\nTidak ada yang perlu diubah.")
        return 0

    bak = whe + ".bak"
    if not os.path.exists(bak):
        shutil.copy2(whe, bak)
        print("\nBACKUP " + bak)
    tree.write(whe, encoding="utf-8", xml_declaration=True)
    print("DITULIS %s (%d perubahan)" % (whe, len(changes)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
