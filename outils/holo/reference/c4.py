from lib import *
x = Ctx('c4'); im, H, W = x.im, x.H, x.W
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); h, s, v = [hsv[...,i].astype(int) for i in range(3)]
Lw = [(0,360),(70,280),(165,200),(262,185),(340,240),(410,320),(450,430),(445,540),(380,660),(340,780),(320,900),(300,1040),(280,1180),(230,1270),(120,1230),(40,1200),(0,1050)]
Rw = [(1342-px,py) for px,py in Lw]
wing_poly = np.maximum(x.poly(Lw), x.poly(Rw))
# body = rembg outside the wing zones + the gold wreath
body = cv2.bitwise_and(x.rem, cv2.bitwise_not(cv2.erode(wing_poly, K(1))))
wbox = np.zeros((H,W),np.uint8); y0,y1,x0,x1 = [int(v_*x.P) for v_ in (1000,1500,100,640)]; wbox[y0:y1,x0:x1] = 255
wreath = ((((h>=15)&(h<=36)&(s>60)&(v>150))).astype(np.uint8)*255) & wbox
wreath = cv2.dilate(cv2.morphologyEx(wreath, cv2.MORPH_CLOSE, K(11)), K(7))
body = np.maximum(body, wreath)
body = solid(body, 9, 4000)
# wings: zone minus blue sky minus body
wing = sky_remove(wing_poly, im, 96, 125, 45, 60)
wing = cv2.morphologyEx(wing, cv2.MORPH_OPEN, K(5)); wing = drop_small(wing, 9000)
wing = cv2.bitwise_and(wing, cv2.bitwise_not(cv2.erode(body, K(5))))
wing_a = np.maximum(wing, cv2.bitwise_and(cv2.dilate(wing, K(81)), cv2.dilate(body, K(7))))
wing_a = cv2.GaussianBlur(wing_a, (0,0), 1.4)
bed_pts = [(0,1790),(100,1700),(250,1590),(430,1530),(620,1520),(800,1510),(960,1520),(1120,1560),(1250,1600),(1342,1610),(1342,2000),(0,2000)]
bed_reg = x.poly(bed_pts); bed_a = cv2.GaussianBlur(bed_reg, (0,0), 1.8)
body_a = cv2.GaussianBlur(body, (0,0), 1.3)
wing_rgb = under_fill(im, body)
bed_rgb = under_fill(im, body)
sky = far_layer(im, np.maximum(np.maximum(wing_a, bed_reg), body))
gold = cv2.GaussianBlur(gold_mask(im, 15, 36, 115, 150), (0,0), 0.9)
gb = (gold.astype(float)*body_a/255).astype(np.uint8)
gw = (gold.astype(float)*(wing_a/255.0)*(1-body_a/255.0)).astype(np.uint8)
gbed = (gold.astype(float)*(bed_a/255.0)*(1-body_a/255.0)).astype(np.uint8)
export_rgb('cards/c4/out/sky.webp', sky)
export_rgba('cards/c4/out/wings.webp', wing_rgb, wing_a)
export_rgba('cards/c4/out/bed.webp', bed_rgb, bed_a)
export_rgba('cards/c4/out/angel.webp', im, body_a)
export_mask('cards/c4/out/m_gold_angel.webp', gb)
export_mask('cards/c4/out/m_gold_wings.webp', gw)
export_mask('cards/c4/out/m_gold_bed.webp', gbed)
export_mask('cards/c4/out/m_prism_wings.webp', wing_a)
thumb('cards/c4/out/thumb.webp', im)
chk = checker(H, W)
save_prev(x, 'prev_wings', comp(chk, wing_rgb, wing_a).astype(np.uint8))
save_prev(x, 'prev_sky', sky)
layers = [(sky,None),(wing_rgb,wing_a),(bed_rgb,bed_a),(im,body_a)]
shift_test(x, layers, [0,0.4,0.6,1.0], 'R', 24)
shift_test(x, layers, [0,0.4,0.6,1.0], 'L', -24)
print('c4 ok')
