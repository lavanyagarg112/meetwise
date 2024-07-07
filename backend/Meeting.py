from datetime import datetime
import json
import time
from typing import List
import os

from dotenv import load_dotenv
from groq import Groq




load_dotenv('.env')
client = Groq(
    api_key='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' #os.environ["groq_ai_key"]
)


class Task:
    def __init__(self, description: str, deadline: str = ""):
        self.description = description
        self.deadline = self.parse_datetime(deadline)

    def parse_datetime(self, deadline):
        try:
            deadline_datetime = datetime.strptime(deadline, "%Y-%m-%d %H:%M:%S")
            return deadline_datetime
        except ValueError:
            return None
            


# class Task:
#     def __init__(self, description: str, deadline: str = ""):
#         self.description = description
#         self.deadline = parse_deadline(deadline)

#     def __repr__(self):
#         return f"Task(description={self.description}, deadline={self.deadline})"


class Meeting:
    def __init__(self, transcription: str):
        self.transcription = transcription
        self.summary = ""
        self.todo: List[Task] = []
        self.uncommon_words: List[str] = []

    def generate_uncommon_words(self) -> List[str]:
        try :
            prompt = """
            In strict JSON format {"word" : word} generate a list of all weird/uncommon/niche words that occured 
            in this meeting in strict JSON format {"word" : word}. If no weird/uncommon/niche terms are mentioned, return
            empty JSON array. For example if the uncommon words are "apple" and "orange", then you should return [{"word": "apple"}, {"word": "orange"}].
            Your output should only be a JSON array of weird/uncommon/niche. No other comments needed.
            Here is the transcript : 
            """

            combined_response = self._send_prompt_chunks(prompt, self.transcription)

            max_retries = 5
            uncommon_words = []
            for attempt in range(max_retries):
                try:
                    json_data = json.loads(combined_response)
                    for word in json_data:
                        uncommon_words.append(word["word"])
                    break 
                except json.JSONDecodeError as e:
                    print(f"Attempt {attempt + 1}: Failed to decode uncommon_words JSON: {e}")
                    if attempt < max_retries - 1:
                        uncommon_words = []
                        time.sleep(1) 
                    else:
                        json_data = []

            self.uncommon_words = uncommon_words
        except:
            self.uncommon_words = []
        return self.uncommon_words

    def generate_summary(self) -> str:
        try:
            prompt = ("In Standard Markdown, generate a summary consisting of key discussion points of this meeting for "
                      "the participant to refer to in the future. It must also include the decisions made if any."
                      "Do not start the summary with phrases like 'Here is the summary' or 'In conclusion."
                      "Use Standard Markdown only."
                       "Your response should just contain the summary from start to finish."
                       
                      "Here is the transcript:")
            combined_response = self._send_prompt_chunks(prompt, self.transcription)
            self.summary = combined_response
        except:
            self.summary = "Summary not generated due to internal error."
        return self.summary

    def generate_todo(self) -> List[Task]:
        print('IN GENERATE TODO')
        try :
            prompt = '''
            "You are a to-do generator that outputs in JSON from meeting trasncription that the user will provide in chunks.\n"
            Output todos after the user indicates \"transcript ends here\".\n" The JSON has 2 fields, "descirption" which is str and "deadline" which is datetime. If no deadline, then use empty string.\n
            An example of what is expected is [{"description": "Email Sarah about agreement", "deadline" : 2023-07-07 15:30:00}, {"description": "Remind Josh about report", "deadline" : ""}]\n
            return just the json as the user will be passing your entire output directly into the JSON parser.\n
            '''
            
            combined_response = self._todo_send_prompt_chunks(prompt, self.transcription)
            combined_response = combined_response[combined_response.index("[") : combined_response.index("]")+1]

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

            print('TASK LIST: ', task_list)

            self.todo = task_list
        except e:
            print('HI IM IN EXCEPT: ', e)
            self.todo = []
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
    
    def _todo_send_prompt_chunks(self, prompt: str, transcription: str, chunk_size: int = 2048):
    
        transcription_chunks = [transcription[i:i + chunk_size] for i in range(0, 17000, chunk_size)]
        transcription_chunks[-1] = transcription_chunks[-1] + "\n transcription ends here."
        
        messages=[
            {
                "role": "system",
                "content": prompt,
            }
        ]
        
        for chunk in transcription_chunks:
            messages.append(
                {
                    "role" : "user",
                    "content" : chunk,
                }
            )


        chat_completion = client.chat.completions.create(
            messages=messages,
            model="mixtral-8x7b-32768", 
            temperature=0,
        )

        return chat_completion.choices[0].message.content 
