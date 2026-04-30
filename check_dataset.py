import os

dataset_path = "."

for root, dirs, files in os.walk(dataset_path):
    print("Folder:", root)
    print("Files:", len(files))
    print("-"*40)