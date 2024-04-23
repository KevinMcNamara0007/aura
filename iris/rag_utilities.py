import os
import pickle
import random
import time

from sentence_transformers import SentenceTransformer, util

# Global Variables
os.environ["TOKENIZERS_PARALLELISM"] = "false"
pickle_location = './files/files.pickle'
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')


def semantic_search(text_embedding, corpus_embeddings, top_k=2):
    return util.semantic_search(text_embedding, corpus_embeddings, top_k)[0]


def embedd(text):
    embeddings = model.encode(text, convert_to_tensor=True)
    return embeddings


def load_pickle():
    try:
        with open(pickle_location, "rb") as inFile:
            dictionary = pickle.load(inFile)
        return dictionary
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"{exc} not found from current dir: {os.getcwd()}") from exc


def save_pickle(data):
    try:
        with open(pickle_location, "wb") as outFile:
            pickle.dump(data, outFile, protocol=pickle.HIGHEST_PROTOCOL)
    except FileNotFoundError as exc:
        raise FileNotFoundError(f"{exc} not found from current dir: {os.getcwd()}") from exc
    except IOError as exc:
        time.sleep(random.randint(1, 10))
        save_pickle(data)