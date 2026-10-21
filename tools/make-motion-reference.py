"""New pose diagram, not a modification of any generated character image."""
from pathlib import Path
from PIL import Image, ImageDraw
root = Path(__file__).resolve().parent.parent
out = root / "assets/generated/sprites/captain/references/walk-motion-guide.png"
im = Image.new("RGB", (1000, 330), "#f3eee2")
d = ImageDraw.Draw(im)
# Legs are colored only to communicate identity; generated boots stay brown.
poses = [
    ([(107,190),(83,231),(70,286)], [(138,190),(156,215),(151,246)]),
    ([(107,190),(109,233),(111,286)], [(138,190),(151,218),(134,251)]),
    ([(107,190),(86,213),(89,246)], [(138,190),(157,233),(173,286)]),
    ([(107,190),(90,217),(109,251)], [(138,190),(136,234),(137,286)]),
]
for i,(left,right) in enumerate(poses):
    x=i*250
    d.text((x+14,12),["A: LEFT FOOT FORWARD","B: RIGHT KNEE LIFTS","C: RIGHT FOOT FORWARD","D: LEFT KNEE LIFTS"][i],fill="#27374b")
    d.ellipse((x+90,40,x+157,105),fill="#d6b998",outline="#27374b",width=3)
    d.polygon([(x+96,114),(x+151,114),(x+145,190),(x+100,190)],fill="#b84743",outline="#27374b")
    for points,color in [(left,"#2984bb"),(right,"#d47d31")]:
        pts=[(x+a,b) for a,b in points]
        d.line(pts,fill=color,width=15)
        a,b=pts[-1]
        d.ellipse((a-13,b-7,a+15,b+6),fill=color)
    d.line([(x+24,300),(x+225,300)],fill="#a3a3a3",width=2)
im.save(out)
prompt=root/"assets/generated/sprites/captain/prompts/walk.txt"
text=prompt.read_text(encoding="utf8")
text+="\n\nADDITIONAL MOTION REFERENCE: The THIRD attached image is a pose diagram with four ordered walk phases. It is the authoritative LEG POSE reference only. Copy its four distinct leg poses from left to right exactly. Blue means the same anatomical leg across all frames; orange means the other leg. Do NOT copy the diagram colors or stickfigure style: dress both legs in the original dark trousers and brown pirate boots. In frame A the screen LEFT foot is low and forward and screen RIGHT foot is higher and back. In frame C the screen RIGHT foot is low and forward and screen LEFT foot is higher and back. Do not exchange these instructions. Frames B and D have narrow stance with a raised passing knee. First image owns appearance, second image owns slot count, third image owns pose. No diagram text, no colored legs, no guide lines in output.\n"
prompt.write_text(text,encoding="utf8")
print(out)
