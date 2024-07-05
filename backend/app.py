import io
import os
import time
from audio_transcription import transcribe
import Meeting

file_path = "backend/testFiles/meetingTest2.mp3"
file_size = os.path.getsize(file_path)

start = time.time()
with open(file_path, "rb") as f:
    mp3_data = f.read()

file_obj = io.BytesIO(mp3_data)
end_read = time.time()

transcription_text = transcribe(file_obj)
end_transcription = time.time()

with open("backend/testFiles/transcription.txt", "w") as t_file:
    t_file.write(transcription_text)

transcription_size = len(transcription_text)

meeting = Meeting.Meeting(transcription_text)
print("meeting made")
uncommon_words = meeting.generate_uncommon_words()
end_uncommon_words = time.time()

summary = meeting.generate_summary()
end_summary = time.time()


todo = meeting.generate_todo()
end_todo = time.time()

report_content = (
    
    f"mp3 file size: {file_size / (1024 * 1024):.2f} MB\n"
    f"Transcription size: {int(transcription_size)} characters\n\n"
    f"------------------------------------------------------------------------------------------------------------------------\n"
    f"+ mp3 file read time: {end_read - start:.2f} seconds\n"
    f"| Transcription time: {end_transcription - end_read:.2f} seconds\n"
    f"| Uncommon words generation time: {end_uncommon_words - end_transcription:.2f} seconds\n"
    f"| Summary generation time: {end_summary - end_uncommon_words:.2f} seconds\n"
    f"| To-do generation time: {end_todo - end_summary:.2f} seconds\n"
    f"+ Total time taken: {end_todo - start:.2f} seconds\n"
    f"------------------------------------------------------------------------------------------------------------------------\n\n"
    

    f"Uncommon Words List:\n{uncommon_words}\n\n"
    f"Summary:\n{summary}\n\n"
    f"To-do List:\n{todo}\n\n"
)

with open("backend/testFiles/REPORT.txt", "w") as report_file:
    report_file.write(report_content)


print("Report written to REPORT.txt")