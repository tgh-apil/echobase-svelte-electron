import pathlib
import numpy as np
import cv2
import os
import sys
from pathlib import Path

# get our video storage directory path
path = sys.argv[1]

# fix the back-slash, forward-slash confusion
path = pathlib.Path(rf'{path}')

storage_path = pathlib.Path.joinpath(path, 'storage')

# get all the videos in this path and find any files without __anon__ in the name
videos = os.listdir(storage_path)

for vid in videos:
    if '__anon__' not in vid:
        fourcc = cv2.VideoWriter_fourcc(*'H264')
        # openCV doesn't like a path object, must be string
        full_file_path = str(pathlib.Path.joinpath(storage_path, str(vid)))
        
        cap = cv2.VideoCapture(full_file_path)
        
        frame_rate = cap.get(cv2.CAP_PROP_FPS)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))

        output_path = str(pathlib.Path.joinpath(storage_path, '__anon__' + vid))
        out = cv2.VideoWriter(output_path, fourcc, frame_rate, (width, height))

        while(cap.isOpened()):
            ret, frame = cap.read()
            if ret == False:
                break
            
            # color argument uses BGR
            cv2.rectangle(frame, (0, 0), (width, 60), (0, 0, 0), -1)
            out.write(frame)

        print('done!')

        cap.release()
        cv2.destroyAllWindows()
        
        # cleanup the non-anon files
        os.remove(full_file_path)
    else:
        print('skip')

print('clean')
