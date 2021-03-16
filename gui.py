import tkinter as tk
from tkinter import ttk
from tkinter import *



class DemoGUI:
    def __init__(self):
        super().__init__()
      
        self.root = tk.Tk()
        self.root.title("GUI")    
        # self.root.protocol('WM_DELETE_WINDOW', self.close_all)
        self.root.geometry("400x150")
        
        self.TAB_CONTROL = ttk.Notebook(self.root)

        # self.TAB0 = Frame(self.TAB_CONTROL, bg="#00766c")
        # self.TAB_CONTROL.add(self.TAB0, text='Process videos')
        # self.TAB_CONTROL.bind("<<NotebookTabChanged>>", self.change_mode_on_tab)
        
        
        self.TAB1 = Frame(self.TAB_CONTROL, bg="#00766c")
        self.TAB_CONTROL.add(self.TAB1, text='Record')
        self.TAB_CONTROL.bind("<<NotebookTabChanged>>", self.change_mode_on_tab)
        

        self.TAB2 = Frame(self.TAB_CONTROL, bg="#00766c")
        self.TAB_CONTROL.add(self.TAB2, text='Play mode')
        self.TAB_CONTROL.pack(expand=2, fill="both")
        
        
        
        self.is_play_mode = 0
        self.is_recording = False
    
    
        # # ─── PRCESS VIDEOS MODE ─────────────────────────────────────────────────
        # self.record_button_text = StringVar(self.TAB0, name="record_button_text")
        # self.record_button_text.set("Open")

        # ─── RECORD MODE ─────────────────────────────────────────────────
             
        # record button.     
        self.record_button_text = StringVar(self.TAB1, name="record_button_text")
        self.record_button_text.set("Record")
        self.is_recording = False
        record_button = Button(self.TAB1, textvariable=self.record_button_text,
                               command=self.toggle_record_button,
                               bg="#f6695b", fg="#e5edb6").grid(columnspan=2, sticky=W)
        
        
        # name box.
        self.name_box = Entry(self.TAB1, text="Sign name")
        self.name_box.grid(row=2, column=0, sticky=E)
        
        
        # num recoreds
        self.num_records_text = StringVar(self.TAB1, name="num_records_text")        
        num_records_text_box = Label(self.TAB1, textvariable=self.num_records_text).grid(row=0, column=1)
        self.num_records_text.set("num records: 0")            
        
        
        # save button.
        self.save_button = Button(self.TAB1, text="Save", command=self.save_template)
        self.save_button.grid(row=2, column=1, sticky=W)
        
        
        
        # ─── PLAY MODE ───────────────────────────────────────────────────
        
        # record button.     
        self.record_button_text = StringVar(self.TAB2, name="record_button_text")
        self.record_button_text.set("Record")
        self.is_recording = False
        record_button_p = Button(self.TAB2, textvariable=self.record_button_text,
                               command=self.toggle_record_button,
                               bg="#f6695b", fg="#e5edb6").grid(columnspan=2, sticky=W)


        

        
        # Show console.
        self.console_box = Text(self.TAB2, bg = "#44a18e")
        self.console_box.grid(columnspan=2, sticky=W)

        
 
        
    def toggle_record_button(self):        
        self.is_recording = not self.is_recording
        tab_id = self.TAB_CONTROL.index(self.TAB_CONTROL.select())
        if self.is_recording:
            self.record_button_text.set("Stop")                       
            self.TAB_CONTROL.tab(not tab_id, state="disabled")
            self.name_box["state"] = DISABLED
            self.save_button["state"] = DISABLED

        else:
            self.record_button_text.set("Record")
            self.TAB_CONTROL.tab(not tab_id, state="normal")
            self.name_box["state"] = NORMAL
            self.save_button["state"] = NORMAL           
     
            
        print("button click", self.is_recording)
        
            
    def change_mode_on_tab(self, event):
        self.is_play_mode = self.TAB_CONTROL.index("current")
        print("mode changed.", self.is_play_mode)
        
        
    def save_template(self):    
        print("save", self.name_box.get())
        
        
        
        
        
        
        
        
        

                                            

 

        
        
        
if __name__ == "__main__":
    config_dialog = DemoGUI()       
    config_dialog.root.mainloop()