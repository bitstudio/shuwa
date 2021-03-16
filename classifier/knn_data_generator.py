import glob
import os
import pickle
import random
import sys
sys.path.insert(1, '../')

import numpy as np
from classifier_utils import normalize_keypoints, augment, uniform_sampling, random_sampling
from tensorflow.python.keras.utils.data_utils import Sequence

from constants import *
from tqdm import tqdm

def softmax(x):    
    return np.exp(x) / np.sum(np.exp(x), axis=0)

class KNNDataGenerator(Sequence):

    def __init__(self, root_folder, batch_size=2, use_augment=True):   
     
        self.batch_size = batch_size
        self.all_labels = self.load_keypoints(root_folder)
        self.use_augment = use_augment
        
        for k in self.all_labels.keys():
            print(k, len(self.all_labels[k]))
            
            
        self.sign_hard_count = np.ones(len(LABELS), dtype=np.int32)
        self.hard_idxs = [0,1,2,3,4,5,6,7,8,9]
        

    def update_hard_count(self, hard_sign_idxs):        
        self.sign_hard_count[hard_sign_idxs.astype(np.int32)] += 1
        
        
    def update_hard_idxs(self):
        # update hard indicies for next epoch.
        self.hard_idxs = np.argsort(self.sign_hard_count)[-10:]
        self.sign_hard_count = np.ones(len(LABELS), dtype=np.int32)
       
       
      
                
  
  
    def __iter__(self):
        return self

    def __len__(self):
        count = 0
        for k in self.all_labels.keys():
            count += len(self.all_labels[k])
        return count // self.batch_size
             
    
    def load_keypoints(self, root_folder):
        
        # print("[INFO] Loading all label in to memory...")
        root_folder = os.path.normpath(root_folder)                
        label_paths = glob.glob(root_folder+'\\*')        
        
        all_labels = {}
        for folder in tqdm(label_paths):
            name_txt = folder.split(os.sep)[-1]
            file_pattern = os.path.join(folder, '*.pkl')
            all_pkl = glob.glob(file_pattern)
            
            samples = []
            for pkl in all_pkl:
                # load picle file.         
                with open(pkl, 'rb') as f:
                    pose_frames, face_frames, left_hand_frames, right_hand_frames = pickle.load(f)                

                samples.append([pose_frames, face_frames, left_hand_frames, right_hand_frames])                
            all_labels[name_txt] = samples
            
        return all_labels
    

    
    def random_train_sample(self):
        """
        random pick one sample from the datset.
        """
        
        prob = np.random.random()
        if prob < 0.85:
            random_class_name = random.choice(list(self.all_labels.keys()))
            label_idx = LABELS[random_class_name]
        else:
            label_idx = random.choice(self.hard_idxs)
            random_class_name = LABELS_NAME[label_idx]
        

          
        pose_frames, face_frames, left_hand_frames, right_hand_frames = random.choice(self.all_labels[random_class_name])            
        assert len(pose_frames) > 12
        

        # sampling frames.
        sampling_method = random.choice([uniform_sampling, random_sampling])
        pose_frames, face_frames, left_hand_frames, right_hand_frames = sampling_method(pose_frames, face_frames, left_hand_frames, right_hand_frames)

        # normalize
        nose_location = pose_frames[:, POSENET_CENTER_INDEX].copy().reshape(pose_frames.shape[0], 1, pose_frames.shape[2])
        
        pose_frames = normalize_keypoints(pose_frames, center_location=nose_location)
        face_frames = normalize_keypoints(face_frames, center_location=nose_location)
        left_hand_frames = normalize_keypoints(left_hand_frames, center_location=nose_location)
        right_hand_frames = normalize_keypoints(right_hand_frames, center_location=nose_location)


        # augment
        if self.use_augment:
            pose_frames, face_frames, left_hand_frames, right_hand_frames = augment(pose_frames,
                                                                                    face_frames,
                                                                                    left_hand_frames,
                                                                                    right_hand_frames)
            
        # filter unuse keypoints.
        pose_frames = pose_frames[:, SELECTED_POSENET_JOINTS]
        face_frames = face_frames[:, SELECTED_FACE_JOINTS]

        
        return  [pose_frames, face_frames, left_hand_frames, right_hand_frames], label_idx
        
    
       
    def __getitem__(self, item):

        # anchor.
        pose_frames_batch = np.empty([self.batch_size, NUM_FRAME_SAMPLES, NUM_SELECTED_POSENET_JOINTS, POSENET_JOINT_DIMS], dtype=np.float32)
        face_frames_batch = np.empty([self.batch_size, NUM_FRAME_SAMPLES, NUM_SELECTED_FACE_JOINTS, FACE_JOINT_DIMS], dtype=np.float32)
        left_hand_frames_batch = np.empty([self.batch_size, NUM_FRAME_SAMPLES, NUM_HAND_JOINTS, HAND_JOINT_DIMS], dtype=np.float32)
        right_hand_frames_batch = np.empty([self.batch_size, NUM_FRAME_SAMPLES, NUM_HAND_JOINTS, HAND_JOINT_DIMS], dtype=np.float32)
        
 

        y_batch = np.zeros([self.batch_size, 1], dtype=np.float32)
        cls_batch = np.zeros([self.batch_size, NUM_CLASSES], dtype=np.float32)

        for i in range(self.batch_size):
        
            [pose_frames, face_frames, left_hand_frames, right_hand_frames], label_idx = self.random_train_sample()          
              
            pose_frames_batch[i] = pose_frames
            face_frames_batch[i] = face_frames
            left_hand_frames_batch[i] = left_hand_frames
            right_hand_frames_batch[i] = right_hand_frames      
            
            
            
            y_batch[i] = label_idx
            cls_batch[i,label_idx] = 1.
            
  
            

        return [pose_frames_batch, face_frames_batch, left_hand_frames_batch, right_hand_frames_batch], [y_batch, cls_batch]


