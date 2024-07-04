from datetime import datetime
import json
from pathlib import Path
from typing import List

import os
from groq import Groq

client = Groq(
    api_key=os.environ["groq_ai_key"],
)


class Task:
    def __init__(self, description: str, deadline: str = "", assignee: str = None):
        self.description = description
        self.deadline = deadline
        self.assignee = assignee

    def __repr__(self):
        return f"Task(description={self.description}, deadline={self.deadline}, assignee={self.assignee})"


class Meeting:
    def __init__(self, transcription: str):
        self.transcription = transcription
        self.summary = ""
        self.todo: List[Task] = []

    def generate_summary(self) -> str:
        prompt = "Generate a summary consisting of key discussion points of this meeting in a bulleted list for the participant to refer to in the future. It must also include the decisions made if any. Here is the transcript "
        combined_response = self._send_prompt_chunks(prompt, self.transcription)
        self.summary = combined_response
        return self.summary

    def generate_todo(self) -> List[Task]:
        prompt = '''
        Create a todo list of all assigned tasks in this meeting in JSON format 
        with fields description, deadline and assignee
        deadline has the format yyyy/mm/dd hh:mm or yyyy/mm/dd if no time is specified.
        both deadline and assignee may have null value if no appropriate value is found. 
        Do not implement your own deadlines or create your own teams. Always refer to
        the actual transcription content. If no assigned tasks are mentioned, return
        empty JSON array. Your output should only be a JSON array. No other comments needed.
        Here is the transcript : 
        '''
        combined_response = self._send_prompt_chunks(prompt, self.transcription)
        json_data = json.loads(combined_response)

        task_list = []
        for task_data in json_data:
            task = Task(
                description=task_data["description"],
                deadline=task_data["deadline"],
                assignee=task_data["assignee"]
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
