from lib import *
x = Ctx('c2'); im, H, W = x.im, x.H, x.W
# woman: rembg minus floor leakage below the feet
woman = solid(x.rem, 9, 3000)
woman[int(1862*x.P):, :] = 0
# bed + floor region (everything under the bed line)
bed_line = [(0,880),(150,866),(300,880),(450,900),(600,862),(700,842),(850,836),(940,792),(1000,762),(1100,746),(1250,736),(1342,730),(1342,610),(1270,610),(1270,736)]
mid_reg = x.poly(bed_line[:-3] + [(1342,2000),(0,2000)] )
nightstand = x.poly([(1270,610),(1342,610),(1342,740),(1270,740)])
mid_reg = np.maximum(mid_reg, nightstand)
mid_a = cv2.GaussianBlur(mid_reg, (0,0), 1.8)
woman_a = cv2.GaussianBlur(woman, (0,0), 1.4)
# far layer: everything covered by bed or woman replaced with a smooth fill
far = far_layer(im, np.maximum(mid_reg, woman))
# mid layer: bed + floor with the woman filled out
mid = under_fill(im, woman)
gold = gold_mask(im, 16, 34, 175, 165)
gold = cv2.GaussianBlur(gold, (0,0), 1.0)
gw = (gold.astype(float)*woman_a/255).astype(np.uint8)
gm = (gold.astype(float)*(mid_a/255.0)*(1-woman_a/255.0)).astype(np.uint8)
export_rgb('cards/c2/out/far.webp', far)
export_rgba('cards/c2/out/mid.webp', mid, mid_a)
export_rgba('cards/c2/out/woman.webp', im, woman_a)
export_mask('cards/c2/out/m_gold_mid.webp', gm)
export_mask('cards/c2/out/m_gold_woman.webp', gw)
thumb('cards/c2/out/thumb.webp', im)
# previews
prev = im.copy(); prev[gold>128] = (0,255,0); save_prev(x, 'prev_gold', prev)
chk = checker(H, W)
save_prev(x, 'prev_mid', comp(chk, mid, mid_a).astype(np.uint8))
save_prev(x, 'prev_far', far)
shift_test(x, [(far, None), (mid, mid_a), (im, woman_a)], [0, 0.5, 1.0], 'R', 26)
shift_test(x, [(far, None), (mid, mid_a), (im, woman_a)], [0, 0.5, 1.0], 'L', -26)
print('c2 ok')
