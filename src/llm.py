import config
import re
from openai import OpenAI


async def generate_website(task):

    ai_config:config.Config = config.load_or_create_config()

    client = OpenAI(
        base_url=ai_config.ai_endpoint,
        api_key= config.get_key(),
        )

    content = task["content"]
    print(f"Generating Website~\n\n Prompt: {content}")
    
    completion = client.chat.completions.create(
    model=ai_config.base_llm,
    messages=[
        {
        "role": "system",
        "content": ai_config.system_note
        },
        {
        "role": "user",
        "content": f"Make me a website with the following description: {content}"
        },
        {
        "role": "assistant",
        "content": "Understood, here's the requested site: ```html\n"
        }
    ]
    )
    result = completion.choices[0].message.content
    return result