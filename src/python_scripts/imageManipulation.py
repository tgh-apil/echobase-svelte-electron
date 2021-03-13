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
img_quality = 100

# Starting point for cropping digits is the 10's digit position:
w = 11
h = 12
x = 3
y = 125

ones_x_offset = x + 12
decimal_x_offset = x + 31

roi_tens_file_path = save_path + '/roi_tens.jpeg'
roi_ones_file_path = save_path + '/roi_ones.jpeg'
roi_decimal_file_path = save_path + '/roi_decimal.jpeg'

while(cap.isOpened()):
    ret, frame = cap.read()
    if ret == False:
        break
    
    cv2.imwrite(roi_tens_file_path, frame[y:y+h, x:x+w],)
    cv2.imwrite(roi_ones_file_path, frame[y:y+h, ones_x_offset: ones_x_offset + w],)
    cv2.imwrite(roi_decimal_file_path, frame[y:y+h, decimal_x_offset: decimal_x_offset + w],)
    
    i += 1

cap.release()
cv2.destroyAllWindows()

roi_tens = cv2.imread(save_path + '/roi_tens.jpeg')
roi_ones = cv2.imread(save_path + '/roi_ones.jpeg')
roi_decimal = cv2.imread(save_path + '/roi_decimal.jpeg')

imgs = [roi_tens, roi_ones, roi_decimal]

# image manipulation
# first, we scale the crop to 20 px then we pad to 28 (as per mnist)
scale_pert = round(20/h, 3)
# print(scale_pert)

width = int(11 * scale_pert)
height = int(12 * scale_pert)

dim = (width, height)

# our model is expecting the images to be 28 x 28
x_padding = int((28 - width) / 2)
y_padding = int((28 - height) / 2)

img_file_paths = [roi_tens_file_path, roi_ones_file_path, roi_decimal_file_path]

for i, image in enumerate(imgs):
    image = cv2.resize(image, dim, interpolation=cv2.INTER_AREA)
    image = cv2.copyMakeBorder(
        image, 
        y_padding, 
        y_padding, 
        x_padding, 
        x_padding, 
        cv2.BORDER_CONSTANT)

    cv2.imwrite(img_file_paths[i], image)

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
        img = tf.image.decode_jpeg(img, channels=1)
        img = img / 255

        img = tf.reshape(img, [1, 28, 28])
        prediction_list.append(img)

imgs_to_pred(prediction_list)

pred_class = probability_model.predict_classes(np.array(prediction_list), batch_size=3, verbose=1)

# combine the digits and get back a float value for the depth of imaging
number = float(str(pred_class[0]) + str(pred_class[1]) + str(pred_class[2])) /10

print(f'depth: {number} cm')
