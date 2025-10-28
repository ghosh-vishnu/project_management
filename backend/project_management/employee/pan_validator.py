"""
PAN Card Number Validator for Indian PAN
Validates Permanent Account Number according to Income Tax Department rules
"""

import re
from typing import Tuple, Optional


def is_valid_pan(pan_number: str) -> bool:
    """
    Validate an Indian PAN (Permanent Account Number).
    
    Requirements:
    - Must be exactly 10 characters long
    - First 5 characters: uppercase alphabets (A-Z)
    - Next 4 characters: digits (0-9)
    - Last character: uppercase alphabet (A-Z)
    - Format: AAAAA9999A
    
    Args:
        pan_number: String representing the PAN number
        
    Returns:
        True if valid, False otherwise
        
    Examples:
        >>> is_valid_pan("ABCDE1234F")
        True
        >>> is_valid_pan("ab1234efg")
        True  # Converted to uppercase
        >>> is_valid_pan("AB1234EFG")
        False
        >>> is_valid_pan("ABCDE12345")
        False
    """
    if not pan_number:
        return False
    
    # Convert to uppercase
    pan_upper = pan_number.upper().strip()
    
    # Remove any spaces or special characters
    pan_clean = re.sub(r'[^A-Z0-9]', '', pan_upper)
    
    # Check if exactly 10 characters
    if len(pan_clean) != 10:
        return False
    
    # PAN pattern: 5 letters + 4 digits + 1 letter
    pan_pattern = r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$'
    
    if re.match(pan_pattern, pan_clean):
        return True
    
    return False


def validate_pan_with_details(pan_number: str) -> Tuple[bool, str]:
    """
    Validate PAN and return detailed reason for failure.
    
    Args:
        pan_number: String representing the PAN number
        
    Returns:
        Tuple of (is_valid, message)
        
    Examples:
        >>> validate_pan_with_details("ABCDE1234F")
        (True, "Valid PAN")
        >>> validate_pan_with_details("ABCD1234E")
        (False, "Invalid length: should be 10 characters")
        >>> validate_pan_with_details("12345ABCDE")
        (False, "Invalid format: First 5 characters must be alphabets")
    """
    if not pan_number:
        return False, "PAN number is empty"
    
    # Convert to uppercase
    pan_upper = pan_number.upper().strip()
    
    # Remove any spaces or special characters
    pan_clean = re.sub(r'[^A-Z0-9]', '', pan_upper)
    
    # Check length
    if len(pan_clean) != 10:
        return False, f"Invalid length: expected 10 characters, got {len(pan_clean)}"
    
    # Check first 5 characters are alphabets
    if not pan_clean[:5].isalpha():
        return False, "Invalid format: First 5 characters must be alphabets (A-Z)"
    
    # Check next 4 characters are digits
    if not pan_clean[5:9].isdigit():
        return False, "Invalid format: Characters 6-9 must be digits (0-9)"
    
    # Check last character is alphabet
    if not pan_clean[9].isalpha():
        return False, "Invalid format: Last character must be alphabet (A-Z)"
    
    # If all checks pass, it's valid
    return True, "Valid PAN"


def extract_and_validate_pan(text: str) -> Tuple[Optional[str], bool]:
    """
    Extract PAN from text and validate it.
    
    Args:
        text: Text to search for PAN
        
    Returns:
        Tuple of (pan_number, is_valid)
    """
    # PAN pattern
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'
    
    matches = re.findall(pan_pattern, text.upper())
    
    if matches:
        pan = matches[0]
        is_valid = is_valid_pan(pan)
        return pan, is_valid
    
    return None, False


# Test cases
if __name__ == "__main__":
    print("=" * 70)
    print("PAN Card Number Validation - Test Cases")
    print("=" * 70)
    
    # Valid PAN numbers
    valid_pans = [
        "ABCDE1234F",
        "ABCDE1234F",
        "abcde1234f",  # lowercase should be converted
        "PANKA9999A",
        "ABCDE5678M",
        "GHJKL9999Z",
    ]
    
    print("\n✓ Valid PAN Numbers:")
    print("-" * 70)
    for pan in valid_pans:
        result = is_valid_pan(pan)
        status = "✓" if result else "✗"
        print(f"{status} {pan:15} → {result}")
    
    # Invalid PAN numbers
    invalid_pans = [
        ("AB1234EFG", "Wrong pattern"),
        ("ABCDE12345", "Last char is digit"),
        ("12345ABCDE", "Starts with numbers"),
        ("ABCD1234EF", "Wrong length"),
        ("ABCDE1234", "Too short"),
        ("ABCDE1234FA", "Too long"),
        ("ABCD1234E", "First 5 not all alphabets"),
        ("ABCDE12E4F", "Middle not all digits"),
        ("ABCDE1234", "Missing last character"),
        ("", "Empty string"),
    ]
    
    print("\n✗ Invalid PAN Numbers:")
    print("-" * 70)
    for pan, reason in invalid_pans:
        result = is_valid_pan(pan)
        print(f"  {pan:15} → {result:5} ({reason})")
    
    # Detailed validation examples
    print("\n" + "=" * 70)
    print("Detailed Validation Examples:")
    print("=" * 70)
    
    test_cases = [
        "ABCDE1234F",
        "ABCD1234E",
        "abcde1234f",
        "ABCDE12345",
    ]
    
    for pan in test_cases:
        is_valid, message = validate_pan_with_details(pan)
        status = "✓" if is_valid else "✗"
        print(f"{status} {pan:15} → {message}")
    
    # Extraction test
    print("\n" + "=" * 70)
    print("Extract PAN from Text:")
    print("=" * 70)
    
    sample_texts = [
        "My PAN number is ABCDE1234F and Aadhaar is 1234 5678 9012",
        "PAN: abcde1234f, Contact: 9876543210",
        "Invalid PAN ABCDE12345 in the document",
    ]
    
    for text in sample_texts:
        pan, is_valid = extract_and_validate_pan(text)
        if pan:
            status = "✓" if is_valid else "✗"
            print(f"{status} Extracted: {pan} (from: {text[:50]}...)")
        else:
            print(f"✗ No PAN found (from: {text[:50]}...)")

