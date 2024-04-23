import numpy as np
import torch as tp

from rag_utilities import embedd, load_pickle, semantic_search, save_pickle
from utilities import file_checker, customized_response, voice_transcription, text_to_speech, get_audio_file, \
    image_generation, image_to_text, history_maintenance


def get_all_files():
    files = load_pickle()
    return [{"file_id": key, "file_name": value["title"], "file_content": value["content"]}
            for key, value in files.items()]


def reset_rag_data():
    files = load_pickle()
    key = '5cb0d123-c917-4e11-a735-a70cb7fd09a7'
    file = {}
    for key, value in files.items():
        if key == '5cb0d123-c917-4e11-a735-a70cb7fd09a7':
            file = files[key]
            break
    save_pickle({key: file})
    return "data has been reset to default"


def delete_file_from_rag(file_id):
    files = load_pickle()
    try:
        file = None
        for key, value in files.items():
            if key == file_id:
                file = files[key]
                break
        if file:
            files.pop(file_id)
            save_pickle(files)
            return f"Successfully Deleted File: {file_id}"
        else:
            return "Failed to delete file or file does not exist"
    except Exception as exc:
        print(exc)
        return "Failed to delete file"


async def freestyle_service(prompt, history, notes, file, temp, pres, freq, api_key):
    if file:
        file_content = await file_checker(file)
    else:
        file_content = ""
    prompt = f"INSTRUCTIONS: {prompt}.\n" \
             f"NOTES: {notes}.\n" \
             f"FILE: {file_content}.\n" \
             f"OUTPUT: "
    return customized_response(prompt, history, api_key, temp=temp, presc_pen=pres, freq_pen=freq)


def file_semantic_search(query):
    refs = dict()
    # Load all file data
    files = load_pickle()
    try:
        # Embedd Query
        query_embedding = embedd(query)

        key_title_content = []
        # have an array of title and content embeddings
        for key, value in files.items():
            key_title_content.append([key, value["title_embeddings"], value["content_embeddings"]])
        #print("Appended Embeddings")
        # Title Embedding Corpus
        title_embeddings = tp.stack([x[1].to(device="mps") for x in key_title_content])
        content_embeddings = tp.stack([x[2].to(device="mps") for x in key_title_content])
        #print("Got to torch stacks")
        # Semantic Search for top 2 of Title Embeddings > 50% add to matches
        matches = [hit for hit in semantic_search(query_embedding, title_embeddings, 3) if hit['score'] >= .2]
        # Semantic Search for top 2 of Content Embeddings > 40% add to matches
        matches.extend([hit for hit in semantic_search(query_embedding, content_embeddings, 3) if hit['score'] >= .2])
        #print("got to hits")
        #  Insert Matches into a dictionary using corpus_id as key and score as value
        for match in matches:
            corp_id = match.get('corpus_id', "not found")
            score = match.get('score', 0)
            refs.update({corp_id: refs.get(corp_id) if score < refs.get(corp_id, 0) else score})
        # Sort the entries based on score from highest to smallest and get top 2
        hits = sorted(refs.items(), key=lambda x: x[1], reverse=True)[:3]
        print(hits)
        # return references to user
        references = []
        for hit in hits:
            file = files.get(key_title_content[hit[0]][0])
            references.append({
                "title": file["title"],
                "content": file["content"]
            })
        return references
    except Exception as exc:
        print(exc)
        return exc


async def file_to_text(file, rag_toggle, api_key):
    if rag_toggle == "y":
        if file:
            try:
                await file_checker(file, api_key, rag_toggle)
                return "File is ready to query"
            except Exception as exc:
                print(exc)
                return exc
        else:
            file_content = ""
    else:
        if file:
            file_content = await file_checker(file)
        else:
            file_content = ""
    return file_content


async def transcribe_voice_service(file, api_key):
    try:
        return voice_transcription(file, api_key)
    except Exception as exc:
        return f"failed to transcribe voice error: {exc}"


def text_to_voice_service(text, api_key):
    return text_to_speech(text, api_key)


def image_generation_service(prompt, api_key):
    return image_generation(prompt, api_key)


async def get_audio_file_service(filename):
    return get_audio_file(filename)


def image_to_text_service(prompt, image, api_key):
    return image_to_text(prompt, image, api_key)


def history_management_service(history_log, api_key):
    return history_maintenance(history_log, api_key)