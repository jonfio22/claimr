"""
TraceRoute Component - Vendor Routing Pipeline Component
Determines which agent should process an RMA based on the vendor

This component wraps the traceroute API endpoint in a Vertex AI Pipeline component.
"""

import json
import requests
from typing import NamedTuple
from kfp.v2.dsl import component, Output, OutputPath


@component(
    base_image="python:3.9",
    packages_to_install=["requests"],
)
def traceroute_component(
    rma_id: str,
    next_step_output_path: OutputPath(str)
) -> NamedTuple('Outputs', [
    ('next_step', str)
]):
    """Routes an RMA request to the appropriate handler based on vendor.
    
    Args:
        rma_id: UUID of the RMA request to route
        next_step_output_path: Path to store the output next step
        
    Returns:
        NamedTuple with the next step (agent name)
    """
    from collections import namedtuple
    
    # API endpoint URL
    url = "https://claimr.example.com/api/agents/traceroute"
    
    # Request payload
    payload = {
        "id": rma_id
    }
    
    # Make the API call
    response = requests.post(url, json=payload)
    
    # Validate the response
    if response.status_code != 200:
        raise Exception(f"TraceRoute API failed with status {response.status_code}: {response.text}")
        
    # Extract the next step
    response_data = response.json()
    next_step = response_data.get('next_step')
    
    if not next_step:
        raise Exception("Failed to get next_step from response")
    
    # Write the next step to the output file
    with open(next_step_output_path, 'w') as f:
        f.write(next_step)
        
    # Return the output
    output = namedtuple('Outputs', ['next_step'])
    return output(next_step=next_step)
