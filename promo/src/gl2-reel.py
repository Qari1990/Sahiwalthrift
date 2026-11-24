# Reel 144 from promo/gl2/reel/s*.jpg: slow push-in per scene + slide transitions, 1080x1920 30fps, silent
import glob, subprocess
S = sorted(glob.glob("promo/gl2/reel/s*.jpg"))
D = [1.7] + [1.45] * (len(S) - 2) + [2.6]
T = 0.3
inp, f = [], []
for i, (s, d) in enumerate(zip(S, D)):
    inp += ["-i", s]
    n = int(d * 30)
    f.append(f"[{i}:v]scale=1188:2112,zoompan=z='min(1+0.0016*on,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={n}:s=1080x1920:fps=30,setsar=1,format=yuv420p[v{i}]")
prev, off = "v0", 0
tr = ["slideleft", "slideup", "slideleft", "slideup", "smoothleft", "smoothright", "smoothleft", "smoothright", "fade"]
for i in range(1, len(S)):
    off += D[i - 1] - T
    f.append(f"[{prev}][v{i}]xfade=transition={tr[(i-1)%len(tr)]}:duration={T}:offset={off:.2f}[x{i}]")
    prev = f"x{i}"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *inp, "-filter_complex", ";".join(f), "-map", f"[{prev}]", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "promo/gl2/144-gl2-reel.mp4"], check=True)
print("ok")
