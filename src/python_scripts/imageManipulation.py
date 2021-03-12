import tensorflow as tf
import sys
import cv2
import pathlib

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
    # too lazy to pathlib then reconvert to a fucking string
    cv2.imwrite(save_path + '/frame.jpeg', frame)
    i += 1

cap.release()
cv2.destroyAllWindows()

w = 10
h = 20
x = 4
y = 120

img = cv2.imread(save_path + '/frame.jpeg')
roi_tens = img[y:y+h, x:x+w]
roi_tens = cv2.copyMakeBorder(roi_tens, 4, 4, 9, 9, cv2.BORDER_CONSTANT)

# roi_ones = img[y:y+h, x:x+w]
# roi_decimal = img[y:y+h, x:x+w]

cv2.imwrite(save_path + '/roi_tens.jpeg', roi_tens)

# get images to a form that tensorflow wants
img = tf.io.read_file(save_path + '/roi_tens.jpeg')
img = tf.image.decode_png(img, channels=1)
img = img / 255

img = tf.reshape(img, [1, 28, 28])
model = tf.keras.models.load_model(save_path + '/saved_model/mnist_model')

# too lazy to make my own labels.  Will just use the mnist ones.
mnist = tf.keras.datasets.mnist
(_, y_test), (_, _) = mnist.load_data()

probability_model = tf.keras.Sequential([model, tf.keras.layers.Softmax()])
predictions = probability_model(img)
print(predictions)
print('done')
