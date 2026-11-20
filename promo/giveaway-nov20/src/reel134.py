import subprocess
sc=[('r0',2.6)]+[x for i in range(1,5) for x in ((f'r{i}a',2.0),(f'r{i}b',1.4))]+[('r5',3.6),('r6',2.6)]
T=0.25; inp=[];f=[]
for k,(n,d) in enumerate(sc):
    inp+=['-i',f'reel/{n}.png']
    fr=int((d+T)*30)
    zx = "0.0012" if n.endswith('b') else "0.0006"
    f.append(f"[{k}:v]scale=2160:3840,zoompan=z='1+{zx}*on':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={fr}:s=1080x1920:fps=30,setsar=1,format=yuv420p[v{k}]")
last='v0'; off=0
for k in range(1,len(sc)):
    off+=sc[k-1][1]
    tr='slideleft' if sc[k][0].endswith('a') else ('fade' if not sc[k][0].endswith('b') else 'zoomin')
    f.append(f"[{last}][v{k}]xfade=transition={tr}:duration={T}:offset={off:.2f}[x{k}]"); last=f'x{k}'
subprocess.run(['ffmpeg','-y','-loglevel','error',*inp,'-filter_complex',';'.join(f),'-map',f'[{last}]','-c:v','libx264','-crf','22','-preset','medium','-pix_fmt','yuv420p','-movflags','+faststart','out/137-giveaway-reel.mp4'],check=True)
