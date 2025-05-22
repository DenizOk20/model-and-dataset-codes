import cv2
import numpy as np
image = cv2.imread("tumor-glioma.jpg")

resized = cv2.resize(image,(400,400))
cv2.imshow("resized_image",resized)
resized_gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)

# erozyon

kernel = np.ones((5,5),dtype=np.uint8)
result = cv2.erode(resized, kernel,iterations=1)
cv2.imshow("erode",result)

#acma baya güzel oldu 
acma = cv2.morphologyEx(resized, cv2.MORPH_OPEN, kernel)
cv2.imshow("acma",acma)


kapama= cv2.morphologyEx(resized, cv2.MORPH_CLOSE, kernel)
cv2.imshow("kapama",kapama)


cv2.waitKey(0)
cv2.destroyAllWindows()