"""
Echo Component - Email Confirmation Pipeline Component
Sends RMA confirmation emails to technicians

This component wraps the echo API endpoint in a Vertex AI Pipeline component.
"""

import json
import requests
from typing import NamedTuple
from kfp.v2.dsl import component, Output, OutputPath


@component(
    base_image="python:3.9",
    packages_to_install=["requests"],
)
def echo_component(
    rma_id: str,
    vendor_rma_id: str,
    success_output_path: OutputPath(str)
) -> NamedTuple('Outputs', [
    ('success', bool)
]):
    """Sends a confirmation email for an RMA request.
    
    Args:
        rma_id: UUID of the RMA request
        vendor_rma_id: Vendor-provided RMA ID
        success_output_path: Path to store the output success status
        
    Returns:
        NamedTuple with the success status
    """
    from collections import namedtuple
    
    # API endpoint URL
    url = "https://claimr.example.com/api/agents/echo"
    
    # Request payload
    payload = {
        "id": rma_id,
        "vendor_rma_id": vendor_rma_id
    }
    
    # Make the API call
    response = requests.post(url, json=payload)
    
    # Validate the response
    if response.status_code != 200:
        raise Exception(f"Echo API failed with status {response.status_code}: {response.text}")
        
    # Extract the success status
    response_data = response.json()
    success = response_data.get('success', False)
    
    # Write the success status to the output file
    with open(success_output_path, 'w') as f:
        f.write(str(success).lower())
        
    # Return the output
    output = namedtuple('Outputs', ['success'])
    return output(success=success)
