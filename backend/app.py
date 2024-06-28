import io
from audio_transcription import transcribe

file_path = "backend/testing/test2.mp3"

with open(file_path, "rb") as f:
    mp3_data = f.read()

file_obj = io.BytesIO(mp3_data)
transcription_text = transcribe(file_obj)

print("Transcription:", transcription_text)

# can delete this, i was just testing
