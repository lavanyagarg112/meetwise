import os
import requests
import time

def upload_to_assemblyai(file_obj, headers):
    upload_url = "https://api.assemblyai.com/v2/upload"
    response = requests.post(upload_url, headers=headers, files={"file": ("audio.mp3", file_obj, "audio/mpeg")})
        
    response.raise_for_status() 
    return response.json()['upload_url']

def request_transcription(audio_url, headers):
    transcription_url = "https://api.assemblyai.com/v2/transcript"
    json = {
        "audio_url": audio_url
    }
    response = requests.post(transcription_url, json=json, headers=headers)
    return response.json()['id']

def get_transcription_result(transcription_id, headers):
    transcription_url = f"https://api.assemblyai.com/v2/transcript/{transcription_id}"
    while True:
        response = requests.get(transcription_url, headers=headers)
        transcription_result = response.json()
        
        if transcription_result['status'] == 'completed':
            return transcription_result['text']
        elif transcription_result['status'] == 'failed':
            return "Transcription failed"
        else:
            time.sleep(10)

def transcribe(file_obj):

    ASSEMBLY_AI_KEY = os.environ["assembly_ai_key"]

    headers = {
        "authorization": f"{ASSEMBLY_AI_KEY}" 
    }

    audio_url = upload_to_assemblyai(file_obj, headers)
    transcription_id = request_transcription(audio_url, headers)
    transcription_text = get_transcription_result(transcription_id, headers)

    return transcription_text

#dummy commit by Sarthak