import tensorflow as tf
import sys
import cv2
import pathlib
import numpy as np

file_name = sys.argv[1]
path = sys.argv[2]

# fix the back-slash, forward-slash confusion
path = pathlib.Path(rf'{path}')

# openCV doesn't like a path object, must be string
full_path = str(pathlib.Path.joinpath(path, 'done', file_name))
save_path = str(pathlib.Path.joinpath(path,  'image_recognition'))

cap = cv2.VideoCapture(full_path)
i = 0

while(cap.isOpened()):
    ret, frame = cap.read()
    if ret == False:
        break
    cv2.imwrite(save_path + '/frame.jpeg', frame)
    i += 1

cap.release()
cv2.destroyAllWindows()

# For the 10's digit:

w = 12
h = 20
x = 2
y = 120

ones_x_offset = x + 11
decimal_x_offset = x + 29

img = cv2.imread(save_path + '/frame.jpeg')

roi_tens = img[y:y+h, x:x+w]
roi_ones = img[y:y+h, ones_x_offset : ones_x_offset + w]
roi_decimal = img[y:y+h, decimal_x_offset : decimal_x_offset + w]

# our model is expecting the images to be 28 x 28
y_padding = int((28 - h) / 2)
x_padding = int((28 - w) / 2)

roi_tens = cv2.copyMakeBorder(
    roi_tens, 
    y_padding, 
    y_padding, 
    x_padding, 
    x_padding, 
    cv2.BORDER_CONSTANT)

# hand-tune this one because the wasn't centered enough
roi_ones = cv2.copyMakeBorder(
    roi_ones,
    y_padding,
    y_padding,
    x_padding - 1,
    x_padding + 1,
    cv2.BORDER_CONSTANT)

# hand-tune this one because the wasn't centered enough
roi_decimal = cv2.copyMakeBorder(
    roi_decimal,
    y_padding,
    y_padding,
    x_padding - 2, 
    x_padding + 2,
    cv2.BORDER_CONSTANT)

roi_tens_file_path = save_path + '/roi_tens.jpeg'
roi_ones_file_path = save_path + '/roi_ones.jpeg'
roi_decimal_file_path = save_path + '/roi_decimal.jpeg'

cv2.imwrite(roi_tens_file_path, roi_tens)
cv2.imwrite(roi_ones_file_path, roi_ones)
cv2.imwrite(roi_decimal_file_path, roi_decimal)

img_file_paths = [roi_tens_file_path, roi_ones_file_path, roi_decimal_file_path]
prediction_list = []

model = tf.keras.models.load_model(save_path + '/saved_model/mnist_model')

# too lazy to make my own labels.  Will just use the mnist ones.
mnist = tf.keras.datasets.mnist
(_, y_test), (_, _) = mnist.load_data()
probability_model = tf.keras.Sequential([model, tf.keras.layers.Softmax()])

def imgs_to_pred(file_names):
    for i in range(len(img_file_paths)):
        # get images to a form that tensorflow wants
        img = tf.io.read_file(img_file_paths[i])
        img = tf.image.decode_png(img, channels=1)
        img = img / 255

        img = tf.reshape(img, [1, 28, 28])
        prediction_list.append(img)

imgs_to_pred(prediction_list)

pred_class = probability_model.predict_classes(np.array(prediction_list), batch_size=3, verbose=1)

# combine the digits and get back a float value for the depth of imaging
number = float(str(pred_class[0]) + str(pred_class[1]) + str(pred_class[2])) /10

print(f'depth: {number} cm')