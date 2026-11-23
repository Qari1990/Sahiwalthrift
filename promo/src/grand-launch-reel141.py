# Reel 141: 11 stills from grand-launch-nov23.js -> 15.7s 9:16 with slow push-in + slide/fade transitions. Usage: python3 grand-launch-reel141.py <frames_dir> <out.mp4>
import subprocess, sys
S, OUT = sys.argv[1].rstrip('/') + '/', sys.argv[2]
d = [1.6, 1.3, 1.6, 1.3, 1.6, 1.0, 1.0, 1.0, 1.0, 1.4, 2.6]
ins, fl = [], []
for i, t in enumerate(d):
    ins += ['-loop', '1', '-framerate', '30', '-t', f'{t+0.3:.2f}', '-i', f'{S}{i:02d}.jpg']
    fl.append(f"[{i}:v]scale=1188:2112,zoompan=z='min(1+0.002*on,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30,setsar=1,format=yuv420p,settb=AVTB[v{i}]")
prev, off = 'v0', 0
for i in range(1, len(d)):
    off += d[i-1]; tr = 'slideleft' if i in (1, 3, 5, 6, 7, 8) else 'fade'
    fl.append(f"[{prev}][v{i}]xfade=transition={tr}:duration=0.3:offset={off:.2f}[x{i}]"); prev = f'x{i}'
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error'] + ins + ['-filter_complex', ';'.join(fl), '-map', f'[{prev}]', '-c:v', 'libx264', '-crf', '22', '-preset', 'medium', '-r', '30', '-movflags', '+faststart', OUT], check=True)
