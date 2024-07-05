from datetime import datetime
import json
import time
from typing import List
import os

from dotenv import load_dotenv
from groq import Groq


load_dotenv('.env')
client = Groq(
    api_key=os.environ["groq_ai_key"]
)


class Task:
    def __init__(self, description: str, deadline: str = ""):
        self.description = description
        self.deadline = self.parse_deadline(deadline)
        self.deadline = deadline

    def parse_deadline(self, deadline: str):
        if deadline:
            try:
                return datetime.strptime(deadline, '%Y/%m/%d %H:%M')
            except ValueError:
                return datetime.strptime(deadline, '%Y/%m/%d')
        return None

    def __repr__(self):
        return f"Task(description={self.description}, deadline={self.deadline})"


class Meeting:
    def __init__(self, transcription: str):
        self.transcription = transcription
        self.summary = ""
        self.todo: List[Task] = []
        self.uncommon_words: List[str] = []

    def generate_uncommon_words(self) -> List[str]:
        prompt = """
        In strict JSON format {word : word} generate a list of all weird/uncommon/niche words that occured 
        in this meeting in strict JSON format {word : word}. If no weird/uncommon/niche terms are mentioned, return
        empty JSON array. Your output should only be a JSON array of weird/uncommon/niche. No other comments needed.
        Here is the transcript : 
        """
        combined_response = self._send_prompt_chunks(prompt, self.transcription)

        max_retries = 5
        for attempt in range(max_retries):
            try:
                json_data = json.loads(combined_response)
                break
            except json.JSONDecodeError as e:
                print(f"Attempt {attempt + 1}: Failed to decode uncommon_words JSON: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    json_data = []

        uncommon_words = []
        for word in json_data:
            uncommon_words.append(word)

        self.uncommon_words = uncommon_words
        return self.uncommon_words

    def generate_summary(self) -> str:
        try:
            prompt = ("Generate a summary consisting of key discussion points of this meeting in a bulleted list for "
                      "the participant to refer to in the future. It must also include the decisions made if any. "
                      "Here is the transcript:")
            combined_response = self._send_prompt_chunks(prompt, self.transcription)
            self.summary = combined_response
        except:
            self.summary = "Summary not generated due to internal error."
        return self.summary

    def generate_todo(self) -> List[Task]:
        prompt = '''
        Create a todo list of all assigned tasks in this meeting in JSON format 
        with fields description and deadline
        deadline has the format yyyy/mm/dd hh:mm or yyyy/mm/dd if no time is specified.
        deadline may have null value if no appropriate value is found. 
        Do not implement your own deadlines or create your own teams. Always refer to
        the actual transcription content. If no assigned tasks are mentioned, return
        empty JSON array. Your output should only be a JSON array. No other comments needed.
        Here is the transcript : 
        '''
        combined_response = self._send_prompt_chunks(prompt, self.transcription)

        max_retries = 5
        for attempt in range(max_retries):
            try:
                json_data = json.loads(combined_response)
                break
            except json.JSONDecodeError as e:
                print(f"Attempt {attempt + 1}: Failed to decode task_list JSON: {e}")
                if attempt < max_retries - 1:
                    time.sleep(1)
                else:
                    json_data = []

        task_list = []
        for task_data in json_data:
            task = Task(
                description=task_data["description"],
                deadline=task_data["deadline"]
            )
            task_list.append(task)

        self.todo = task_list
        return self.todo

    def _send_prompt_chunks(self, prompt: str, transcription: str, chunk_size: int = 2048):
        prompt_chunks = [prompt[i:i + chunk_size] for i in range(0, len(prompt), chunk_size)]
        transcription_chunks = [transcription[i:i + chunk_size] for i in range(0, len(transcription), chunk_size)]

        responses = []

        for prompt_chunk, transcription_chunk in zip(prompt_chunks, transcription_chunks):
            chat_completion = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt_chunk + transcription_chunk,
                    }
                ],
                model="llama3-8b-8192",
            )
            responses.append(chat_completion.choices[0].message.content)

        combined_response = "".join(responses)
        return combined_response

    #for commit
