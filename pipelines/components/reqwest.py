"""
Reqwest Component - RMA Intake Pipeline Component
Handles intake of initial RMA information and creates a record

This component wraps the reqwest API endpoint in a Vertex AI Pipeline component.
"""

import json
import requests
from typing import NamedTuple
from kfp.v2.dsl import component, Output, OutputPath


@component(
    base_image="python:3.9",
    packages_to_install=["requests"],
)
def reqwest_component(
    serial_number: str, 
    model_number: str, 
    issue_description: str, 
    vendor: str, 
    submitted_by: str,
    rma_id_output_path: OutputPath(str)
) -> NamedTuple('Outputs', [
    ('rma_id', str)
]):
    """Submits an RMA request to the Claimr reqwest agent.
    
    Args:
        serial_number: Equipment serial number
        model_number: Equipment model number
        issue_description: Description of the issue
        vendor: Equipment vendor name
        submitted_by: Email of the technician submitting the RMA
        rma_id_output_path: Path to store the output RMA ID
        
    Returns:
        NamedTuple with the RMA ID
    """
    from collections import namedtuple
    
    # API endpoint URL
    url = "https://claimr.example.com/api/agents/reqwest"
    
    # Request payload
    payload = {
        "serial_number": serial_number,
        "model_number": model_number,
        "issue_description": issue_description,
        "vendor": vendor,
        "submitted_by": submitted_by
    }
    
    # Make the API call
    response = requests.post(url, json=payload)
    
    # Validate the response
    if response.status_code != 200:
        raise Exception(f"Reqwest API failed with status {response.status_code}: {response.text}")
        
    # Extract the RMA ID
    response_data = response.json()
    rma_id = response_data.get('id')
    
    if not rma_id:
        raise Exception("Failed to get RMA ID from response")
    
    # Write the RMA ID to the output file
    with open(rma_id_output_path, 'w') as f:
        f.write(rma_id)
        
    # Return the output
    output = namedtuple('Outputs', ['rma_id'])
    return output(rma_id=rma_id)
