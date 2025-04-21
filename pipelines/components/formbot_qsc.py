"""
FormBot QSC Component - Form Submission Pipeline Component
Handles submission of RMA data to QSC's vendor portal

This component wraps the formbot_qsc API endpoint in a Vertex AI Pipeline component.
"""

import json
import requests
from typing import NamedTuple
from kfp.v2.dsl import component, Output, OutputPath


@component(
    base_image="python:3.9",
    packages_to_install=["requests"],
)
def formbot_qsc_component(
    rma_id: str,
    vendor_rma_id_output_path: OutputPath(str)
) -> NamedTuple('Outputs', [
    ('vendor_rma_id', str)
]):
    """Submits an RMA request to QSC's vendor portal.
    
    Args:
        rma_id: UUID of the RMA request to submit
        vendor_rma_id_output_path: Path to store the output vendor RMA ID
        
    Returns:
        NamedTuple with the vendor RMA ID
    """
    from collections import namedtuple
    
    # API endpoint URL
    url = "https://claimr.example.com/api/agents/formbot_qsc"
    
    # Request payload
    payload = {
        "id": rma_id
    }
    
    # Make the API call
    response = requests.post(url, json=payload)
    
    # Validate the response
    if response.status_code != 200:
        raise Exception(f"FormBot QSC API failed with status {response.status_code}: {response.text}")
        
    # Extract the vendor RMA ID
    response_data = response.json()
    vendor_rma_id = response_data.get('vendor_rma_id')
    
    if not vendor_rma_id:
        raise Exception("Failed to get vendor_rma_id from response")
    
    # Write the vendor RMA ID to the output file
    with open(vendor_rma_id_output_path, 'w') as f:
        f.write(vendor_rma_id)
        
    # Return the output
    output = namedtuple('Outputs', ['vendor_rma_id'])
    return output(vendor_rma_id=vendor_rma_id)
