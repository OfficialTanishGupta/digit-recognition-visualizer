import sys
from unittest.mock import MagicMock

# 1. THE FIX: Fake the libraries that are causing VS Code/Python crashes
mock_modules = [
    "tensorflow_decision_forests",
    "tensorflow_hub",
    "tensorflow.compat.v1.estimator",
    "tensorflow.estimator"
]
for mod in mock_modules:
    sys.modules[mod] = MagicMock()

import tensorflow as tf
import tensorflowjs as tfjs
import os

# 2. Load your model
model = tf.keras.models.load_model('mnist_model.h5')

# 3. Path to your React public folder
output_path = os.path.join('..', 'public', 'model')
if not os.path.exists(output_path):
    os.makedirs(output_path)

# 4. Convert
print("Converting... please wait...")
tfjs.converters.save_keras_model(model, output_path)

print(f"✅ SUCCESS! Files are now in: {os.path.abspath(output_path)}")
