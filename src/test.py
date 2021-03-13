import sys
import cv2
import os

file = 'C:/Users/Josh/Documents/Coding_Projects/stuff/storage/18-10-25-095636-20181025095636_20181025_100637_0005-264.mp4'

path = 'C:/Users/Josh/Documents/Coding_Projects/stuff/storage/'

cap = cv2.VideoCapture(file)
i = 0

while(cap.isOpened()):
    ret, frame = cap.read()
    if ret == False:
        break
    cv2.imwrite(path + 'test.png', frame)
    i += 1
    
cap.release()
cv2.destroyAllWindows()
