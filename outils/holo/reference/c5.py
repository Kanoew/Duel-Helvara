from lib import *
x = Ctx('c5'); im, H, W = x.im, x.H, x.W
rem = solid(x.rem, 9, 3000)
# --- table: top surface (below the sleeve) + front edge + apron, nearest to the viewer
table_p = x.poly([(318,1403),(400,1381),(450,1391),(500,1400),(600,1409),(680,1413),(790,1418),
                  (850,1250),(1342,1150),(1342,2000),(1060,2000),(1060,1792),(1000,1768),(600,1598),(318,1450)])
# hole: the arm, the hand and the cup-hand lie ON the table -> they stay in the woman layer
hole = x.poly([(790,1230),(1000,1230),(1000,1040),(1290,1040),(1342,1100),(1342,1300),(1250,1330),(1160,1330),
               (1150,1500),(1130,1540),(900,1540),(790,1480)])
table_front = drop_small(cv2.bitwise_and(table_p, cv2.bitwise_not(hole)), 1500)
# --- bench on the left (she sits on it) + the start of the shadow-tail
bench_p = np.maximum(x.poly([(0,1525),(150,1515),(240,1530),(300,1600),(300,2000),(0,2000)]),
                     x.poly([(115,1440),(185,1440),(185,1535),(115,1535)]))
# --- woman layer: rembg without the table, + table pixels inside the hole, + bench,
#     + a 13 px band under the table edge so that nothing opens up when the table slides
woman = cv2.bitwise_and(rem, cv2.bitwise_not(table_front))
woman = np.maximum(woman, cv2.bitwise_and(table_p, hole))
woman = np.maximum(woman, cv2.bitwise_and(table_p, cv2.dilate(cv2.bitwise_not(table_p), K(27))))
woman = np.maximum(woman, cv2.bitwise_and(table_p, cv2.dilate(hole, K(41))))
woman = np.maximum(woman, bench_p)
woman = drop_small(woman, 2500)
woman_a = cv2.GaussianBlur(woman, (0,0), 1.2)
front_a = cv2.GaussianBlur(table_front, (0,0), 1.4)
covered = np.maximum(woman, table_front)
far = far_layer(im, covered)
# --- electric foil: bright blue-white veins, only inside hand-drawn zones (800-wide preview coords x 1.6775 = display coords)
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); h_, s_, v_ = [hsv[...,i].astype(int) for i in range(3)]
z = lambda pts: x.poly([(px*1.6775, py*1.6775) for px, py in pts])
skin_z = np.maximum.reduce([
    z([(215,420),(300,415),(340,365),(480,365),(490,560),(380,560),(300,540),(215,520)]),
    z([(470,770),(660,770),(670,880),(560,890),(470,830)])])
blue_z = np.maximum.reduce([
    z([(590,640),(758,640),(758,748),(590,748)]),
    z([(570,330),(650,330),(650,460),(570,460)])])
core = ((v_ > 205) & (s_ < 100)) | ((h_ >= 92) & (h_ <= 130) & (s_ > 50) & (v_ > 140))
blue = (h_ >= 92) & (h_ <= 130) & (s_ > 55) & (v_ > 130)
vein = np.zeros((H, W), np.uint8)
vein[(core & (skin_z > 0))] = 255
vein[(blue & (blue_z > 0))] = 255
vein = drop_small(cv2.morphologyEx(vein, cv2.MORPH_OPEN, K(2)), 20)
vein_a = cv2.GaussianBlur(cv2.dilate(vein, K(5)), (0,0), 1.6)
vw = (vein_a.astype(float) * woman_a / 255).astype(np.uint8)
export_rgb('cards/c5/out/far.webp', far)
export_rgba('cards/c5/out/woman.webp', im, woman_a)
export_rgba('cards/c5/out/table.webp', im, front_a)
export_mask('cards/c5/out/m_volt_woman.webp', vw)
thumb('cards/c5/out/thumb.webp', im)
prev = im.copy(); prev[vw>110] = (0,255,0); save_prev(x, 'prev_vein', prev, 800)
chk = checker(H, W)
save_prev(x, 'prev_woman', comp(chk, im, woman_a).astype(np.uint8), 700)
save_prev(x, 'prev_table', comp(chk, im, front_a).astype(np.uint8), 700)
save_prev(x, 'prev_far', far, 700)
for tag, d in (('R', 28), ('L', -28)):
    shift_test(x, [(far, None), (im, woman_a), (im, front_a)], [-0.3, 1.0, 1.5], tag, d)
print('c5 ok')
