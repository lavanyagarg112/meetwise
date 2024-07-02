from datetime import datetime
import json
from pathlib import Path
from typing import List

import os
from groq import Groq

client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
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
        prompt = "Generate a summary consisting of key discussion points of this meeting in a bulleted list for the participant to refer to in the future. It must also include the decisions made if any. Here is the diarised transcript "
        
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt + self.transcription, 
                }
            ],
            model="mixtral-8x7b-32768",
        )
        summary = chat_completion.choices[0].message.content
        return self.summary

    def generate_todo(self) -> List[Task]:
        prompt = '''
        Create a todo list by picking out all assigned tasks in this meeting in JSON format 
        with fields description, deadline and assignee
        deadline has the format yyyy/mm/dd hh:mm or yyyy/mm/dd if no time is specified.
        both deadline and assignee may have null value if no appropriate value is found. 
        Here is the diarised transcript : 
        '''
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt + self.transcription, 
                }
            ],
            model="mixtral-8x7b-32768",
        )
         
        json_data = json.loads(chat_completion.choices[0].message.content)
        task_list = []
        for task_data in json_data:
            task = Task(
                description=task_data["description"],
                deadline=task_data["deadline"],
                assignee=task_data["assignee"]
            )
            task_list.append(task)
       
        return self.todo