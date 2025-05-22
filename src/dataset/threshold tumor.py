import cv2
import matplotlib.pyplot as plt




image = cv2.imread("tumor-glioma.jpg")

resized = cv2.resize(image,(400,400))
cv2.imshow("resized_image",resized)
resized_gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)


plt.figure()
plt.imshow(resized, cmap="gray")
plt.axis("off")
plt.show()

_,thresh = cv2.threshold(resized_gray, thresh=70, maxval=100, type= cv2.THRESH_BINARY)


plt.figure()
plt.imshow(thresh, cmap="gray")
plt.axis("off")
plt.show()


cv2.waitKey(0)
cv2.destroyAllWindows()