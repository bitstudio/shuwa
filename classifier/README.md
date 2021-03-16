
## Train FC Classifier
1. Prepare your dataset.

```
my_dataset_folder
├───Hksl_bear
│   ├───vid_01.mp4
│   ├───vid_02.mp4
│   ...
├───Hksl_bicycle
│   ├───vid_01.mp4
│   ├───vid_02.mp4
│   ...
├───Hksl_carrot
│   ...
├───Hksl_chef
│   ...
.
.
.
```
2. Detect and save keypoints data for each video.

```
python create_dataset.py my_dataset_folder my_annotations_folder
```
3. Train  
use this [notebook](classifier/train_fc_classifier.ipynb)


## Train KNN Classifier 
use this [notebook](classifier/train_knn_classifier.ipynb)