from enum import IntEnum
import re
class Mods(IntEnum):
    NoMod           = 0,
    NF         = 1,
    EZ           = 2,
    TD        = 4,
    HD         = 8,
    HR       = 16,
    SD    = 32,
    DT     = 64,
    Relax          = 128,
    HT       = 256,
    NC     = 512, # Only set along with DoubleTime. i.e: NC only gives 576
    FL     = 1024,
    Autoplay       = 2048,
    SO        = 4096,
    Relax2         = 8192,  # Autopilot?
    PF        = 16384,
    Key4           = 32768,
    Key5           = 65536,
    Key6           = 131072,
    Key7           = 262144,
    Key8           = 524288,
    FadeIn         = 1048576,
    Random         = 2097152,
    LastMod        = 4194304,
    Key9           = 16777216,
    Key10          = 33554432,
    Key1           = 67108864,
    Key3           = 134217728,
    Key2           = 268435456
def main(bina):
    bina = bin(bina)
    p = re.compile("0b")
    a = p.sub('',bina)
    pos = []
    for m in re.finditer("1",a):
        pos.append(len(a)-m.start())
    mods = ""
    ind = 0
    for hey in pos:
        i = 0
        bit = "1"
        while i < hey-1:
            bit += "0"
            i += 1
        p = re.compile("Mods.")
        mod = p.sub('',str(Mods(int(bit,2))))
        mods = mod + mods
        ind += 1
    return mods
