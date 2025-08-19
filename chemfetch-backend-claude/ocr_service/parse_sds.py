#!/usr/bin/env python3
"""
Enhanced SDS Parser for ChemFetch System
Integrates the improved sds_extractor.py with the existing chemfetch backend.
"""

import sys
import json
import argparse
import tempfile
import requests
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any
import logging

# Import the new SDS extractor
from sds_parser_new.sds_extractor import parse_pdf

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def download_pdf(url: str, temp_dir: Path) -> Optional[Path]:
    """Download PDF from URL to temporary file."""
    try:
        logger.info(f"Downloading PDF from: {url}")
        response = requests.get(url, timeout=30, stream=True)
        response.raise_for_status()
        
        # Check content type
        content_type = response.headers.get('content-type', '').lower()
        if 'pdf' not in content_type:
            logger.warning(f"Content type is not PDF: {content_type}")
        
        # Save to temporary file
        temp_file = temp_dir / f"sds_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        with open(temp_file, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        logger.info(f"Downloaded PDF to: {temp_file}")
        return temp_file
        
    except Exception as e:
        logger.error(f"Failed to download PDF: {e}")
        return None


def transform_to_chemfetch_format(parsed_data: Dict[str, Any], product_id: int) -> Dict[str, Any]:
    """Transform the parsed data to match chemfetch's expected format."""
    
    def get_value(field_name: str) -> Optional[str]:
        """Extract value from confidence-based field."""
        field = parsed_data.get(field_name, {})
        if isinstance(field, dict) and field.get('confidence', 0) > 0:
            return field.get('value')
        return None
    
    # Map dangerous goods class to boolean
    dangerous_goods_class = get_value('dangerous_goods_class')
    is_dangerous_good = False
    
    if dangerous_goods_class:
        dangerous_goods_class = dangerous_goods_class.strip()
        # Consider it a dangerous good if it has a class number/code and is not "none" or "not applicable"
        if dangerous_goods_class.lower() not in ['none', 'not applicable', 'n/a', 'na']:
            is_dangerous_good = True
    
    # Determine if it's a hazardous substance (simple heuristic)
    # In a real implementation, this would use more sophisticated logic
    product_name = get_value('product_name') or ''
    manufacturer = get_value('manufacturer') or ''
    is_hazardous = is_dangerous_good  # Basic heuristic
    
    # Format subsidiary risks as array
    subsidiary_risk = get_value('subsidiary_risk')
    subsidiary_risks = []
    if subsidiary_risk and subsidiary_risk.lower() not in ['none', 'not applicable', 'n/a', 'na']:
        subsidiary_risks = [subsidiary_risk]
    
    result = {
        'product_id': product_id,
        'product_name': get_value('product_name'),
        'vendor': manufacturer,
        'issue_date': get_value('issue_date'),
        'hazardous_substance': is_hazardous,
        'dangerous_good': is_dangerous_good,
        'dangerous_goods_class': dangerous_goods_class,
        'packing_group': get_value('packing_group'),
        'subsidiary_risks': subsidiary_risks,
        'hazard_statements': [],  # Not extracted by current parser
        'raw_json': parsed_data
    }
    
    return result


def parse_sds_pdf(pdf_url: str, product_id: int) -> Dict[str, Any]:
    """
    Main function to parse SDS PDF from URL.
    
    Args:
        pdf_url: URL of the PDF to parse
        product_id: ID of the product in the database
        
    Returns:
        Dictionary with parsed SDS data in chemfetch format
    """
    
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)
        
        # Download PDF
        pdf_file = download_pdf(pdf_url, temp_path)
        if not pdf_file:
            raise Exception("Failed to download PDF")
        
        # Parse PDF
        logger.info(f"Parsing PDF: {pdf_file}")
        parsed_data = parse_pdf(pdf_file)
        
        # Transform to chemfetch format
        result = transform_to_chemfetch_format(parsed_data, product_id)
        
        logger.info(f"Successfully parsed SDS for product {product_id}")
        return result


def main():
    """Command line interface for SDS parsing."""
    parser = argparse.ArgumentParser(description='Parse SDS PDF for ChemFetch')
    parser.add_argument('--product-id', type=int, required=True, help='Product ID')
    parser.add_argument('--url', required=True, help='PDF URL')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose logging')
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    try:
        result = parse_sds_pdf(args.url, args.product_id)
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return 0
        
    except Exception as e:
        error_result = {
            'error': str(e),
            'product_id': args.product_id
        }
        print(json.dumps(error_result, indent=2))
        logger.error(f"Failed to parse SDS: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
