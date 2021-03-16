
import tensorflow as tf
import tensorflow_addons as tfa
import numpy as np

alpha = 0.25
gamma = 2.
class Losses:       
    
    def __init__(self):
        self.cce = tf.keras.losses.CategoricalCrossentropy(reduction=tf.keras.losses.Reduction.NONE)

        self.reset()
        
        
    def reset(self):
        self.triplet_cum = 0.
        self.cls_cum = 0.
        
        
    def calc_avg(self):
        triplet_avg = np.average(self.triplet_cum)
        clst_avg = np.average(self.cls_cum)
        self.reset()
        
        return triplet_avg, clst_avg
        
        
        

    def categorical_focal_loss(self, y_true, y_pred):
        cross_entropy = -y_true * tf.math.log(y_pred + 1e-5)
        loss = alpha * tf.math.pow(1 - y_pred, gamma) * cross_entropy
        return tf.math.reduce_sum(loss, axis=-1)
    
    

    def calc_losses(self,  y_true, y_pred):
        feats_true, cls_true = y_true
        feats_pred, cls_pred = y_pred
        triplet_loss = tfa.losses.triplet_hard_loss(feats_true, feats_pred)
        cls_loss = self.cce(cls_true, cls_pred)
    
        return triplet_loss, cls_loss

    def __call__(self, y_true, y_pred):
        

        self.triplet_loss, self.cls_loss = self.calc_losses( y_true, y_pred)
        
        
        self.cls_loss_mean = tf.reduce_mean(self.cls_loss)
        self.total_loss = self.triplet_loss + self.cls_loss_mean
        
        self.triplet_cum += self.triplet_loss
        self.cls_cum += self.cls_loss_mean
    
        
        
        
        
        