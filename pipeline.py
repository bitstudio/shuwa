import cv2
import sys
import numpy as np
from constants import *
from utils import local2global_keypoints, crop_from_rect, get_face_rect_from_posenet
from scipy.spatial.distance import cdist
from scipy.stats import mode

sys.path.insert(1, 'posenet')
sys.path.insert(1, 'face_landmark')
sys.path.insert(1, 'hand_landmark')
sys.path.insert(1, 'classifier')

from pose_manager import PoseManager
from face_manager import FaceManager
from hand_pipeline import HandPipeline
from classifier_manager import ClassifierManager

class Pipeline:

    def __init__(self):
        super().__init__()
        self.pose_manager = PoseManager()
        self.face_manager = FaceManager()
        self.hand_pipeline = HandPipeline()
        self.classifier = ClassifierManager()
        self.reset_pipeline()
        self.is_recording = True
        
        
    def reset_pipeline(self):               
        self.pose_history = []
        self.face_history = []
        self.left_hand_history = []
        self.right_hand_history = []


    def update(self, frame_rgb):            
        frame_h, frame_w, _ = frame_rgb.shape
        assert frame_h == frame_w      

        # ─── POSENET ────────────────────────────────────────────────────────────────────
        person_score, keypoint_scores, posenet_keypoints = self.pose_manager(frame_rgb)
        if person_score > POSE_THRESHOLD:
            # ─── FACE-LANDMARK ───────────────────────────────────────────────────────────────           
            face_rect = get_face_rect_from_posenet(posenet_keypoints)
            face_rgb = crop_from_rect(frame_rgb, face_rect) 
            face_flag, local_face_keypoints = self.face_manager(face_rgb)
            
            
            if face_flag[0] > FACE_THRESHOLD:
                # use only person 0, 2D keypoints.
                local_face_keypoints = local_face_keypoints[:, :FACE_JOINT_DIMS]

                # Convert local keypoints to global keypoints.
                global_face_keypoints = local2global_keypoints(local_face_keypoints, face_rect)

                # ─── HAND-LANDMARK ───────────────────────────────────────────────────────────────    
                hands_rects, global_hands_keypoints = self.hand_pipeline(frame_rgb, posenet_keypoints, keypoint_scores)                

                # ─── DRAW ───────────────────────────────────────────────────────────────────────               
                cv2.drawContours(frame_rgb, [cv2.boxPoints(face_rect).astype("int")], 0, (0, 255, 0), 2)                
                self.pose_manager.draw_keypoints(frame_rgb, person_score, keypoint_scores, posenet_keypoints)
                self.face_manager.draw_keypoints(frame_rgb, global_face_keypoints)
                self.hand_pipeline.draw(frame_rgb, hands_rects, global_hands_keypoints)

                if self.is_recording:
                    cv2.putText(frame_rgb, "Recording...", (10, 300), cv2.FONT_HERSHEY_DUPLEX, 2, (255, 0, 0), 1)
                    self.pose_history.append(posenet_keypoints[0]/frame_h)
                    self.face_history.append(global_face_keypoints/frame_h)
                    self.left_hand_history.append(global_hands_keypoints[0]/frame_h)
                    self.right_hand_history.append(global_hands_keypoints[1]/frame_h)
                

    def run_classifier(self):
        """Run sign classifier.

        Returns:
            np.ndarray: 832 feats.
            np.ndarray: cls score of 100 classes.
        """
        feats, cls = self.classifier([self.pose_history, self.face_history, self.left_hand_history, self.right_hand_history])
        self.reset_pipeline()
        return feats, cls
    
    
    def run_knn_classifier(self):    
        feats, cls = self.run_classifier()            
   
        
        distances = np.sum(np.square(self.database - feats), axis=-1)        
    
        # top 3 nearst samples.
        k = 3
        indices = np.argpartition(distances, k)[:k]        
        top3class_name = self.labels[indices]
        result_class_name = mode(top3class_name)[0][0]      
       
        template_feats = self.database[indices[0]]
        template_pose, template_face, template_hands = template_feats[:256], template_feats[256:320], template_feats[320:]               
        feats_pose, feats_face, feats_hands = feats[:256], feats[256:320], feats[320:]
        
        pose_disttance = np.sum(np.square(template_pose-feats_pose), axis=-1)
        face_distance = np.sum(np.square(template_face-feats_face), axis=-1)
        hands_distance = np.sum(np.square(template_hands-feats_hands), axis=-1)
                
        total_dist = pose_disttance+face_distance+hands_distance

        return result_class_name, total_dist, pose_disttance, face_distance, hands_distance

        

        
        
    