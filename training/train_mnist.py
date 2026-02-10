import tensorflow as tf
import keras
from keras import layers, models
import os

# 1. Load and Preprocess MNIST
print("Loading data...")
(x_train, y_train), (x_test, y_test) = keras.datasets.mnist.load_data()

# Normalize and Flatten (28x28 -> 784)
x_train = x_train.reshape(-1, 784).astype("float32") / 255.0
x_test = x_test.reshape(-1, 784).astype("float32") / 255.0


# 2. Build the Model (Keras 3 / TFJS Compatible Way)
model = models.Sequential([
    # Move the input shape directly into the first Dense layer
    layers.Dense(128, activation='relu', input_shape=(784,)), 
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 3. Train the Model
print("Starting training...")
model.fit(x_train, y_train, epochs=5, validation_split=0.1)

# 4. Save Native Keras Model
model.save("mnist_model.h5")



