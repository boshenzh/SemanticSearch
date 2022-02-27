import datetime
import torch
import torchvision.transforms as transforms
from model import EncoderCNN
from model import DecoderRNN
from PIL import Image
import pickle
import glob
import sys
import re
import os
import sys
from socket import *

def load_image(image_file, transform=None):
    image = Image.open(image_file).convert('RGB')
    image = image.resize([224, 224], Image.LANCZOS)
    if transform is not None:
        image = transform(image).unsqueeze(0)
    return image

if __name__ == "__main__":
    # Import (hyper)parameters
    BEAM_SIZE = 1
    EMBEDDING_DIM = 256
    HIDDEN_DIM = 512
    NUM_LAYERS = 2
    with open("./id_to_word.pkl", 'rb') as f:
        ID_TO_WORD = pickle.load(f)
    MAX_SEG_LENGTH = 20
    END_ID = [k for k, v in ID_TO_WORD.items() if v == '<end>'][0]

    ENCODER_PATH = "./encoder.pth"
    DECODER_PATH = "./decoder.pth"

    VOCAB_SIZE = len(ID_TO_WORD)

    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print("Running in %s." % device)

    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.485, 0.456, 0.406), (0.229, 0.224, 0.225))
    ])

    # Build models
    encoder = EncoderCNN(EMBEDDING_DIM)
    encoder = encoder.to(device).eval()

    decoder = DecoderRNN(EMBEDDING_DIM, HIDDEN_DIM, VOCAB_SIZE, NUM_LAYERS, MAX_SEG_LENGTH)
    decoder = decoder.to(device).eval()

    # Load the trained model parameters
    encoder.load_state_dict(torch.load(ENCODER_PATH))
    decoder.load_state_dict(torch.load(DECODER_PATH))

    serverSocket = socket(AF_INET, SOCK_DGRAM)
    serverSocket.bind(('127.0.0.1', 12000))


    while True:
        message, address = serverSocket.recvfrom(1024)
        image_file = message.decode()
        print("Processing: " + image_file)

        # Prepare an image
        image = load_image(image_file, transform).to(device)

        # Generate an caption from the image
        with torch.no_grad():
            feature = encoder(image)
            sampled_ids = decoder.beam_search(feature, BEAM_SIZE, END_ID)

        # Convert word_ids to words
        for i, (sampled_id, prob) in enumerate(sampled_ids):
            sampled_id = sampled_id.cpu().numpy()
            sampled_caption = []
            for word_id in sampled_id:
                word = ID_TO_WORD[word_id]
                sampled_caption.append(word)
                if word == '<end>':
                    break
            sentence = ' '.join(sampled_caption)
            sentence = os.path.basename(image_file) + ":" + sentence.replace("<start> ", "").replace(" <end>", "")
            serverSocket.sendto(sentence.encode(), address)
            os.remove(image_file)
            break
