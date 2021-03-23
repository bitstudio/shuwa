
## Train Classifier
1. Prepare your dataset.  
A video of person performing sing language. You can get the dataset from this [Gdrive]()

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
2. Prepare keypoints data for training.

```
python ../create_dataset.py my_dataset_folder output_folder
```

3. Train  
See [notebook](classifier/train_knn_classifier.ipynb)