import sys, os
import glob
import time
import cv2

import numpy as np
from common import crop_square
from constants import *
from gui import DemoGUI
from pipeline import Pipeline



cap = cv2.VideoCapture(0)

KNN_DATASET_PATH = "knn_dataset"

class Application(DemoGUI, Pipeline):

    def __init__(self):
        super().__init__()
        
        self.result_class_name = ""        
        self.database = []
        self.labels = []
        self.records = []
        self.load_database()
        self.video_loop()


    def load_database(self):
        self.database = []
        self.labels= []
        all_folder = glob.glob(os.path.join(KNN_DATASET_PATH, "*")) 
    
        for folder in all_folder:
            all_file = glob.glob(os.path.join(folder, "*.txt"))
            class_label = os.path.split(folder)[-1]
            for f in all_file:
                self.database.append(np.loadtxt(f))
                self.labels.append(class_label)
            
        self.database = np.stack(self.database)
        self.labels = np.array(self.labels)

        

    def show_frame(self, frame_rgb):
        cv2.imshow("posenet", cv2.cvtColor(frame_rgb, cv2.COLOR_RGB2BGR))
        key = cv2.waitKey(1)

        if key == ord("q"):
            self.close_all()
        if key == ord("r"):
            self.toggle_record_button()     

          
    def change_mode_on_tab(self, event):
        super().change_mode_on_tab(event)
 
        self.result_class_name = ""
        
        if self.is_play_mode:
            print("[INFO] Entered play mode.")        
            print("[INFO] Reading database...")
            self.load_database()
      
            
    def toggle_record_button(self):
        super().toggle_record_button()
        
        if not self.is_recording:
            if len(self.pose_history) > NUM_FRAME_SAMPLES:
                # playmode
                if self.is_play_mode:
                    result_class_name, total_dist, pose_disttance, face_distance, hands_distance = self.run_knn_classifier()
                    self.console_box.delete('1.0', 'end')
                    self.console_box.insert('end',
                        "Nearest class: {:s} - {:.2f}\n| Pose distance: {:.2f}\n| Face distance: {:.2f}\n| Hands distance: {:.2f}"
                        .format(result_class_name, total_dist, pose_disttance, face_distance, hands_distance))
                                
                        
                # record mode.
                else:
                    # add video track.                
                    self.records.append(self.run_classifier()[0])
                    self.num_records_text.set("num records: "+ str(len(self.records)))
                    
            else:
                print("[ERROR] Video too short.")
                
        self.reset_pipeline()                
        
        
                
 
    def save_template(self):
        super().save_template()
        
        # read texbox entry.
        if self.name_box.get() != "" and len(self.records) > 0:                
            folder_name = self.name_box.get()            
            folder_path = os.path.join(KNN_DATASET_PATH, folder_name)
                    
            if not os.path.exists(folder_path):
                os.mkdir(folder_path)
            
            for i, a in enumerate(self.records):      
                np.savetxt(folder_path+"\\"+str(i)+".txt", a)
            print("[INFO] Template saved.")
            # clear.
            self.records = []
            self.num_records_text.set("num records: "+ str(len(self.records)))            
            self.name_box.delete(0, 'end')            
                        
            
        

    def video_loop(self):

        _, frame = cap.read()
        frame = crop_square(frame)
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)        
        t1 = time.time()

        self.update(frame_rgb)


        t2 = time.time() - t1
        cv2.putText(frame_rgb, "FPS: {:.0f}".format(1 / t2), (10, 50), cv2.FONT_HERSHEY_DUPLEX, 1, (203, 52, 247), 1)
        self.show_frame(frame_rgb)        

        self.root.after(1, self.video_loop)
        
        
    def close_all(self):           
            
        cap.release()           
        cv2.destroyAllWindows()       
        sys.exit()
        
        
if __name__ == "__main__":
    app = Application()       
    app.root.mainloop()