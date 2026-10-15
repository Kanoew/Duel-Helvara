import numpy as np, cv2
from PIL import Image
from rembg import remove, new_session
s = new_session("isnet-general-use")
for c in ('c2','c3','c4'):
    im = Image.open(f'cards/{c}/src.webp').convert('RGB')
    m = remove(im, session=s, only_mask=True, post_process_mask=True)
    m.save(f'cards/{c}/rem.png')
    a = np.array(m); print(c, 'coverage', round((a>128).mean(),3))
    bg = Image.new('RGB', im.size, (255,0,255)); bg.paste(im, mask=m)
    bg.resize((600,894)).save(f'cards/{c}/prev_rem.jpg')
