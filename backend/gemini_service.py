import os
import json
import re

from google import genai
from google.genai.types import Tool, GenerateContentConfig, GoogleSearch
from dotenv import load_dotenv

load_dotenv()

print(os.getenv('GEMINI_API_KEY'))

def generate_content(claim: str, date: str):
    api_key = os.getenv('GEMINI_API_KEY')

    if api_key is None:
        raise ValueError("API key not found in environment variables")

    client = genai.Client(api_key=api_key)
    model_id = "gemini-2.0-flash-exp"

    google_search_tool = Tool(google_search=GoogleSearch())

    # Get the URLs from the second function
    urls = get_urls(claim, date)

    response = client.models.generate_content(
        model=model_id,
        contents=f"""
        You are a professional fact-checker tasked with verifying the accuracy of claims in a given text. Your goal is to maintain information integrity and combat misinformation. Here's the text you need to fact-check:

        {claim}. This was claimed on {date}.

        Your task is to analyze this text, identify specific claims, research their accuracy, and provide a detailed fact-check report. Follow these steps:

        1. Read the text carefully and list all claims that can be fact-checked in <extracted_claims> tags. For each claim, include the exact quote from the text.

        2. For each claim, perform a detailed analysis. Wrap your analysis in <analysis> tags and structure your analysis using the following format:

        a. Claim: [Write the claim here]
        b. Relevant quote: "[Provide the exact quote from the text containing the claim]"
        c. Research process: [Briefly describe your research process]
        d. Counterarguments: [Note any potential alternative interpretations or opposing viewpoints]
        e. Evidence strength: [Assess the quality and quantity of evidence supporting or refuting the claim]
        f. Determination: [State whether the claim is True, False, Partially True, Misleading]
        g. Reasoning: [Explain your reasoning for the determination]
        h. Sources: [List and describe multiple reliable sources you used, explaining why they are credible]
        i. Context and bias: [Reflect on any relevant context or potential biases in the sources]
        j. Limitations: [Consider any potential biases or limitations in your own analysis]

        3. After analyzing all claims, compile your findings into a text format that mimics JSON structure. Use the following format:

         ```
        {{
            "claims": [
            {{
                "claim": "The exact claim text",
                "relevant_quote": "The exact quote from the text",
                "determination": "True/False/Partially True/Misleading",
                "explanation": "Your reasoning for the determination",
                "research_process": "Brief description of your research process",
                "counterarguments": "Any potential alternative interpretations or opposing viewpoints",
                "evidence_strength": "Assessment of the quality and quantity of evidence",
                "sources": [
                {{
                    "url": "URL to a reliable source",
                    "description": "Brief description of the source and its credibility",
                    "reliability": "Assessment of the source's reliability and potential biases"
                }},
                {{
                    "url": "URL to another reliable source",
                    "description": "Brief description of the source and its credibility",
                    "reliability": "Assessment of the source's reliability and potential biases"
                }}
                ],
                "context_and_bias": "Relevant context or potential biases in the sources",
                "limitations": "Potential biases or limitations in the analysis"
            }},
            // Additional claims...
            ],
            "summary": "A brief overall summary of your findings"
        }}
        ```

        IMPORTANT: Ensure that your output is a valid string that can be parsed by Python's json.loads() function. This means you should escape any quotation marks within the text and use proper line breaks.

        Important guidelines:
        - If a claim is ambiguous or you cannot find reliable information to verify it, and explain why. 

        Begin your fact-checking process now. Start by listing the claims with their quotes, then analyze each one in detail, and finally present your findings in the specified text format that mimics JSON structure.

        Here are some relevant URLs to consider in your research:
        {urls}
        """,
        config=GenerateContentConfig(
            tools=[google_search_tool],
            response_modalities=["TEXT"]
        )
    )

    print(response)

    # Check if grounding_metadata is available, and if it is, check search_entry_point
    if response.candidates and response.candidates[0].grounding_metadata:
        if response.candidates[0].grounding_metadata.search_entry_point:
            print("Main Function URLs", response.candidates[0].grounding_metadata.search_entry_point.rendered_content)
        else:
            print("Main function: No search_entry_point found in grounding metadata")
    else:
        print("Main function: No grounding metadata found in response")


    match = re.search(r'```json\n({.*})\n```', response.text, re.DOTALL)

    if match:
        json_string = match.group(1)
        parsed_data = json.loads(json_string)
        print(parsed_data)
        print("success dickhead")
        return parsed_data
    else:
        print("No valid JSON found in the response")

    return "Error: No valid JSON found in the response"

def get_urls(claim: str, date: str):
    api_key = os.getenv('GEMINI_API_KEY')

    if api_key is None:
        raise ValueError("API key not found in environment variables")

    client = genai.Client(api_key=api_key)
    model_id = "gemini-2.0-flash-exp"

    google_search_tool = Tool(google_search=GoogleSearch())

    response = client.models.generate_content(
        model=model_id,
        contents=f"""
        You are a professional fact-checker tasked with verifying the accuracy of claims in a given text. Your goal is to maintain information integrity and combat misinformation. Here's the text you need to fact-check:

        {claim}. This was claimed on {date}.
        """,
        config=GenerateContentConfig(
            tools=[google_search_tool],
            response_modalities=["TEXT"]
        )
    )

    print(response)

    if response.candidates and response.candidates[0].grounding_metadata:
        if response.candidates[0].grounding_metadata.search_entry_point:
          # Extract URLs if available
            urls = response.candidates[0].grounding_metadata.search_entry_point.rendered_content
            print(f"get_urls function found these urls {urls}")
            return urls
        else:
          print("get_urls function: No search_entry_point found in grounding metadata")
          return ""
    else:
      print("get_urls function: No grounding metadata found in response")
      return ""