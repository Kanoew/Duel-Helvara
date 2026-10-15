from lib import *
x = Ctx('c3'); im, H, W = x.im, x.H, x.W
subj = cv2.morphologyEx(x.rem, cv2.MORPH_CLOSE, K(7))
subj = drop_small(subj, 1500)
subj_a = cv2.GaussianBlur(subj, (0,0), 1.3)
far = far_layer(im, subj)
gold = cv2.GaussianBlur(gold_mask(im, 14, 34, 90, 110), (0,0), 0.9)
gs = (gold.astype(float)*subj_a/255).astype(np.uint8)
gf = (gold.astype(float)*(1-subj_a/255.0)).astype(np.uint8)
# scales: coloured, mid-dark pixels on the subject that are not gold
hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV)
sc = ((hsv[...,1] > 70) & (hsv[...,2] > 70) & (hsv[...,2] < 200)).astype(np.uint8)*255
sc = cv2.bitwise_and(sc, subj); sc = cv2.bitwise_and(sc, cv2.bitwise_not(cv2.dilate(gold_mask(im,14,34,90,110), K(5))))
sc = cv2.GaussianBlur(cv2.morphologyEx(sc, cv2.MORPH_OPEN, K(3)), (0,0), 2.0)
export_rgb('cards/c3/out/far.webp', far)
export_rgba('cards/c3/out/subject.webp', im, subj_a)
export_mask('cards/c3/out/m_gold_subject.webp', gs)
export_mask('cards/c3/out/m_gold_far.webp', gf)
export_mask('cards/c3/out/m_prism_subject.webp', sc)
thumb('cards/c3/out/thumb.webp', im)
prev = im.copy(); prev[gold>128] = (0,255,0); prev[sc>150] = (prev[sc>150]*0.4 + np.array([255,0,255])*0.6).astype(np.uint8); save_prev(x, 'prev_gold', prev)
save_prev(x, 'prev_far', far)
shift_test(x, [(far, None), (im, subj_a)], [0, 1.0], 'R', 26)
print('c3 ok')
