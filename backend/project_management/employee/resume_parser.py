"""
Resume Parser Module
Extracts key information from PDF/DOCX resumes and returns structured data.

This module uses a multi-strategy approach with comprehensive edge case handling:

1. Name Extraction (5 strategies):
   - Context-based (after headers like "Name:", "Resume of")
   - Position-based (first few lines, title case)
   - ALL CAPS names
   - spaCy Named Entity Recognition
   - Email context (name near email)
   - Filters: CV headers, locations, companies, professional titles, dates

2. Contact Numbers:
   - Multiple country codes (91, 92, 880, etc.)
   - Formats: +91 9876543210, (123) 456-7890, etc.
   - Validation: Skips years, pin codes, repeated digits

3. Gender Detection:
   - Keyword-based with prefix detection (Mr./Mrs./Ms.)
   - Explicit gender markers
   - Contextual hints

4. Date of Birth:
   - Age extraction and calculation
   - Multiple date formats
   - Context keywords (DOB, birth date, etc.)

5. Edge Cases Handled:
   - Single letter initials (M Shoaib)
   - CV headers in different languages
   - Location/company name filtering
   - Professional title skipping
   - Year/pin code exclusion
   - Name prefixes (Mr., Dr., etc.)
   - Multiple phone number formats
"""

import re
import pdfplumber
from docx import Document
import docx2txt
from typing import Dict, Optional, Tuple
import logging

# Import spacy optionally
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("spacy not installed. Some name extraction features will be disabled.")

# Import PAN validator
try:
    from .pan_validator import is_valid_pan
except ImportError:
    # Fallback if import fails
    def is_valid_pan(pan: str) -> bool:
        return bool(re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan.upper()))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load spaCy model (you'll need to download it first: python -m spacy download en_core_web_sm)
nlp = None
if SPACY_AVAILABLE:
    try:
        nlp = spacy.load("en_core_web_sm")
    except OSError:
        logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
        nlp = None
    except Exception as e:
        logger.warning(f"Could not load spaCy model: {e}")
        nlp = None


def extract_text(file_path: str) -> str:
    """
    Extract plain text from PDF or DOCX file.
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        Plain text content of the resume
    """
    try:
        if file_path.endswith('.pdf'):
            text = ""
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
            return text
        
        elif file_path.endswith(('.docx', '.doc')):
            # Try docx2txt first (more reliable for complex formats)
            try:
                text = docx2txt.process(file_path)
            except:
                # Fallback to python-docx
                doc = Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
            return text
        
        else:
            logger.error(f"Unsupported file format: {file_path}")
            return ""
    except Exception as e:
        logger.error(f"Error extracting text from file: {e}")
        return ""


def extract_email(text: str) -> Tuple[Optional[str], float]:
    """
    Extract email address using regex.
    
    Returns:
        (email, confidence) tuple
    """
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(email_pattern, text)
    
    if matches:
        return matches[0], 0.95
    return None, 0.0


def extract_contact_numbers(text: str) -> Tuple[Optional[str], Optional[str], float, float]:
    """
    Extract contact number and alternate contact number.
    
    Returns:
        (contact, alternate_contact, confidence, alt_confidence) tuple
    """
    # Phone patterns - comprehensive formats
    patterns = [
        # Indian phone patterns
        r'\b[+]?91[-.\s]?[6-9]\d{9}\b',  # +91 9876543210, 91-9876543210, 9876543210
        r'\b[+]?92[-.\s]?[0-9]\d{9}\b',  # Pakistan numbers +92 3021913946
        r'\b[+]?880[-.\s]?[0-9]\d{9}\b',  # Bangladesh numbers
        r'\b[6-9]\d{9}\b',  # 10 digit Indian numbers
        # General phone patterns
        r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b',  # 123-456-7890
        r'\(\d{3}\)\s?\d{3}[-.\s]?\d{4}',  # (123) 456-7890
        r'\+\d{1,3}[-.\s]?\d{1,14}',  # International format
        r'\d{10,11}',  # Any 10-11 digit number (fallback)
    ]
    
    contacts = []
    for pattern in patterns:
        matches = re.findall(pattern, text)
        contacts.extend(matches)
    
    # Clean and filter valid contacts
    clean_contacts = []
    for contact in contacts:
        # Remove non-digit characters except +
        cleaned = re.sub(r'[^\d+]', '', str(contact))
        
        # Skip if too short or too long
        if len(cleaned) < 10 or len(cleaned) > 15:
            continue
            
        # Skip if it looks like a year (1900-2100 range)
        if re.match(r'^(19|20)\d{2}$', cleaned):
            continue
            
        # Skip if it looks like a postal/pin code (especially 6 digits starting with specific patterns)
        if len(cleaned) == 6 and re.match(r'^[1-9]\d{5}$', cleaned):
            # Could be Indian PIN code, skip for now
            # Consider it only if no other contacts found
            pass
            
        # Skip if all same digits (like 0000000000)
        if len(set(cleaned)) <= 2:
            continue
            
        clean_contacts.append(cleaned)
    
    # Remove duplicates while preserving order
    clean_contacts = list(dict.fromkeys(clean_contacts))
    
    if len(clean_contacts) >= 1:
        main_contact = clean_contacts[0]
        confidence_main = 0.90
        
        # Strip country codes: Only if length is 12 digits and starts with 91
        if len(main_contact) == 12 and main_contact.startswith('91'):
            # Check if after removing 91, we have a valid 10-digit Indian number
            stripped = main_contact[2:]
            if stripped[0] in '6789':  # Indian number starts with 6,7,8,9
                main_contact = stripped
        
        # Also handle other country codes for completeness (but only if length matches)
        elif len(main_contact) > 10:
            # Pakistan: 92 + 10 digits = 12 digits
            if len(main_contact) == 12 and main_contact.startswith('92'):
                main_contact = main_contact[2:]
            # Bangladesh: 880 + 10 digits = 13 digits
            elif len(main_contact) == 13 and main_contact.startswith('880'):
                main_contact = main_contact[3:]
        
        alternate_contact = clean_contacts[1] if len(clean_contacts) > 1 else None
        if alternate_contact:
            # Strip country codes: Only if length is 12 digits and starts with 91
            if len(alternate_contact) == 12 and alternate_contact.startswith('91'):
                # Check if after removing 91, we have a valid 10-digit Indian number
                stripped = alternate_contact[2:]
                if stripped[0] in '6789':  # Indian number starts with 6,7,8,9
                    alternate_contact = stripped
            
            # Also handle other country codes for completeness (but only if length matches)
            elif len(alternate_contact) > 10:
                # Pakistan: 92 + 10 digits = 12 digits
                if len(alternate_contact) == 12 and alternate_contact.startswith('92'):
                    alternate_contact = alternate_contact[2:]
                # Bangladesh: 880 + 10 digits = 13 digits
                elif len(alternate_contact) == 13 and alternate_contact.startswith('880'):
                    alternate_contact = alternate_contact[3:]
            
            confidence_alt = 0.80
        else:
            confidence_alt = 0.0
        
        return main_contact, alternate_contact, confidence_main, confidence_alt
    
    return None, None, 0.0, 0.0


def extract_pan(text: str) -> Tuple[Optional[str], float]:
    """
    Extract and validate PAN Card number.
    
    Returns:
        (pan, confidence) tuple
    """
    pan_pattern = r'\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b'
    matches = re.findall(pan_pattern, text)
    
    # Find the first valid PAN
    for match in matches:
        if is_valid_pan(match):
            return match, 0.95  # High confidence for validated PAN
    
    # If no valid PAN found, return None
    return None, 0.0


def extract_aadhaar(text: str) -> Tuple[Optional[str], float]:
    """
    Extract Aadhaar number (12 digits, may be grouped).
    
    Returns:
        (aadhaar, confidence) tuple
    """
    # Pattern for Aadhaar: 1234 5678 9012 or 123456789012
    aadhaar_pattern = r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b'
    matches = re.findall(aadhaar_pattern, text)
    
    if matches:
        # Clean spaces and hyphens
        aadhaar = re.sub(r'[-\s]', '', matches[0])
        return aadhaar, 0.90
    
    return None, 0.0


def extract_dob(text: str) -> Tuple[Optional[str], float]:
    """
    Extract Date of Birth in various formats.
    
    Returns:
        (dob in DD/MM/YYYY format, confidence) tuple
    """
    # First, try to find age and calculate approximate DOB
    age_pattern = r'\b(age|aged)[:\s]+(\d{1,2})\b'
    age_match = re.search(age_pattern, text, re.IGNORECASE)
    if age_match:
        try:
            age = int(age_match.group(2))
            if 18 <= age <= 100:  # Reasonable age range
                import datetime
                current_year = datetime.datetime.now().year
                estimated_birth_year = current_year - age
                # Return approximate DOB (using Jan 1st as placeholder)
                return f"01/01/{estimated_birth_year}", 0.50  # Lower confidence as it's estimated
        except:
            pass
    
    # Try to extract explicit date of birth
    dob_keywords = ['date of birth', 'd.o.b', 'dob', 'birth date', 'born on', 'birthday', 'born']
    for keyword in dob_keywords:
        # Look for pattern after these keywords
        pattern = rf'\b{keyword}[:\s]+(\d{{1,2}}[/-]\d{{1,2}}[/-]\d{{4}})\b'
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            dob = match.group(1)
            # Standardize format
            if '/' in dob:
                return dob, 0.90
            elif '-' in dob:
                return dob.replace('-', '/'), 0.90
    
    # Multiple date patterns
    patterns = [
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{4}\b',  # DD/MM/YYYY, DD-MM-YYYY
        r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2}\b',  # DD/MM/YY
        r'\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b',  # YYYY/MM/DD
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        if matches:
            dob = matches[0]
            # Convert to DD/MM/YYYY format
            parts = re.split(r'[/-]', dob)
            if len(parts) == 3:
                if len(parts[2]) == 4:  # Full year
                    # Check if format is YYYY/MM/DD
                    if int(parts[0]) > 31:
                        return f"{parts[2]}/{parts[1]}/{parts[0]}", 0.85
                    else:
                        return dob.replace('-', '/'), 0.85
                elif len(parts[2]) == 2:  # Short year
                    year = int(parts[2])
                    full_year = 1900 + year if year > 50 else 2000 + year
                    return f"{parts[0]}/{parts[1]}/{full_year}", 0.75
    
    return None, 0.0


def extract_gender(text: str) -> Tuple[Optional[str], float]:
    """
    Extract gender hints from text using keywords and patterns.
    
    Returns:
        (gender, confidence) tuple
    """
    text_lower = text.lower()
    
    # More comprehensive keyword lists
    male_keywords = [
        'male', 'm', 'man', 'boy', 'he', 'his', 'him', 'groom',
        'mr', 'sir', 'father', 'son', 'brother', 'uncle', 'nephew'
    ]
    female_keywords = [
        'female', 'f', 'woman', 'girl', 'she', 'her', 'miss', 'mrs',
        'ms', 'miss', 'madam', 'maam', 'bride', 'mother', 'daughter',
        'sister', 'aunt', 'niece'
    ]
    
    # Count occurrences
    male_count = sum(text_lower.count(keyword) for keyword in male_keywords)
    female_count = sum(text_lower.count(keyword) for keyword in female_keywords)
    
    # Check for explicit gender markers
    if re.search(r'\b(male|man|boy)\b', text_lower) and not re.search(r'\b(female|woman|girl)\b', text_lower):
        return "Male", 0.75
    if re.search(r'\b(female|woman|girl)\b', text_lower) and not re.search(r'\b(male|man|boy)\b', text_lower):
        return "Female", 0.75
    
    # Check title prefixes
    if re.search(r'\bmr\.?\b', text_lower) and not re.search(r'\b(mrs|ms|miss)\.?\b', text_lower):
        return "Male", 0.70
    if re.search(r'\b(mrs|ms|miss)\.?\b', text_lower):
        return "Female", 0.70
    
    # Weighted comparison
    if male_count > female_count and male_count > 0:
        return "Male", 0.65
    elif female_count > male_count and female_count > 0:
        return "Female", 0.65
    
    return None, 0.0


def extract_name(text: str) -> Tuple[Optional[str], float]:
    """
    Extract candidate name using multiple strategies:
    1. Context-based patterns (after headers like "Name:", "Resume of")
    2. Line position heuristics (first few lines, centered, etc.)
    3. NLP Named Entity Recognition
    4. Format-based detection (all caps, title case)
    
    Returns:
        (name, confidence) tuple
    """
    # Strategy 1: Context-based extraction (after common headers)
    context_patterns = [
        r'(?:^|\n)\s*name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'candidate[:\s]+name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'resume\s+of\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'personal\s+(?:details|information)[:\s]+name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
        r'about\s+me[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
    ]
    
    for pattern in context_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            name = match.group(1).strip()
            # Validate name: should have at least 2 words and reasonable length
            if len(name.split()) >= 2 and 3 <= len(name) <= 50:
                return name, 0.85
    
    # Strategy 2: First few lines position-based detection
    lines = text.split('\n')[:15]  # First 15 lines
    
    for line in lines:
        line = line.strip()
        
        # Skip empty lines and common non-name content
        if not line or len(line) < 3:
            continue
        
        # Skip common headers and professional titles (comprehensive list)
        skip_keywords = [
            # CV headers in different languages/forms
            'resume', 'curriculum', 'curriculam', 'vitae', 'cv', 'biodata', 'bio data',
            'personal profile', 'profile', 'personal information', 'personal detail',
            # Common sections
            'personal', 'contact', 'email', 'phone', 'mobile', 'address', 'objective', 
            'summary', 'profile summary', 'professional summary', 'career objective',
            # Experience and education
            'experience', 'work experience', 'employment', 'employment history',
            'education', 'educational', 'qualification', 'academic', 'certificate', 'certification',
            # Skills and other sections
            'skills', 'technical skills', 'professional skills', 'strengths',
            'projects', 'project', 'achievement', 'achievements', 'award', 'awards',
            'language', 'languages', 'hobby', 'hobbies', 'interest', 'interests',
            'reference', 'references', 'declaration',
            # Professional titles
            'developer', 'engineer', 'manager', 'specialist', 'analyst', 'consultant',
            'executive', 'director', 'coordinator', 'assistant', 'lead', 'head',
            'senior', 'junior', 'intern', 'internship', 'trainee', 'administrator',
            'associate', 'officer', 'representative', 'agent', 'executive',
            # Additional common words
            'looking for', 'seeking', 'current', 'previous', 'past', 'present', 'from',
            'at', 'with', 'and', 'to', 'the', 'for', 'of', 'in', 'on', 'date', 'year'
        ]
        if any(keyword in line.lower() for keyword in skip_keywords):
            continue
        
        # Skip lines that look like professional titles or sections
        title_indicators = ['software', 'web', 'mobile', 'full stack', 'backend', 'frontend',
                           'ui/ux', 'product', 'data', 'cloud', 'devops', 'quality',
                           'assurance', 'qa', 'test', 'support', 'sales', 'marketing',
                           'human resources', 'hr', 'finance', 'accounting', 'operations']
        if any(indicator in line.lower() for indicator in title_indicators) and len(line.split()) <= 3:
            continue
        
        # Skip location names and addresses (comprehensive)
        location_keywords = [
            # Educational institutions
            'campus', 'college', 'university', 'school', 'institute', 'academy',
            'high school', 'public school', 'private school', 'international school',
            # Address components
            'street', 'road', 'avenue', 'block', 'sector', 'area', 'colony', 'nagar',
            'city', 'state', 'country', 'pin code', 'pincode', 'postal', 'zip code',
            'address', 'located', 'situated', 'based in', 'residence', 'current address',
            'permanent address', 'correspondence address',
            # Geographic indicators
            'india', 'usa', 'uk', 'pakistan', 'bangladesh', 'sri lanka', 'nepal',
            'uttar pradesh', 'maharashtra', 'karnataka', 'tamil nadu', 'gujarat',
            'delhi', 'mumbai', 'bangalore', 'chennai', 'kolkata', 'hyderabad',
            'pune', 'surat', 'jaipur', 'lucknow', 'nagpur', 'patna', 'indore'
        ]
        if any(keyword in line.lower() for keyword in location_keywords):
            continue
        
        # Skip company/organization names
        company_keywords = ['pvt ltd', 'limited', 'private limited', 'inc', 'incorporated',
                           'llc', 'ltd', 'corp', 'corporation', 'industries', 'solutions',
                           'technologies', 'services', 'group', 'holdings', 'enterprise',
                           'company', 'com', 'dot com']
        if any(keyword in line.lower() for keyword in company_keywords):
            continue
        
        # Skip dates and years (standalone lines)
        if re.match(r'^\d{4}$', line) or re.match(r'^\d{1,2}[/-]\d{1,2}[/-]\d{4}$', line):
            continue
        
        # Pattern 2.1: Title case with 2-4 words (e.g., "John Michael Smith" or "M Shoaib")
        # Allow single letters (initials) and skip prefixes
        name_pattern = r'^[A-Z][a-z]*\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3}\s*$'
        if re.match(name_pattern, line):
            # Additional validation: should not look like a sentence
            if not any(char in line for char in [',', ':', ';']) and len(line.split()) >= 2 and len(line.split()) <= 5:
                # Remove common prefixes if present
                prefixes = ['mr', 'mrs', 'ms', 'miss', 'dr', 'prof', 'professor', 'sir', 'mr.', 'mrs.', 'ms.', 'dr.', 'prof.']
                words = line.split()
                if words[0].lower().strip('.') in prefixes:
                    # Skip line if starts with prefix - might be part of a sentence
                    continue
                return line, 0.80
        
        # Pattern 2.2: All caps name (less common but possible)
        if re.match(r'^[A-Z]{2,}(?:\s+[A-Z]{2,}){1,3}\s*$', line):
            # Validate it's not a common CV header
            if 3 <= len(line) <= 50:
                # Additional check: skip if it looks like a header or title
                if not any(keyword in line.lower() for keyword in ['curriculum', 'curriculam', 'vitae', 'resume', 'cv']):
                    return line.title(), 0.75
        
        # Pattern 2.3: Mixed case but clearly a name format
        if re.match(r'^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+', line):
            # Take first 3 words if more exist
            words = line.split()
            if len(words) >= 2:
                return ' '.join(words[:min(4, len(words))]), 0.75
    
    # Strategy 3: spaCy NER (Named Entity Recognition)
    if nlp:
        try:
            # Process text in chunks for better performance
            first_part = text[:2000]  # First 2000 characters typically contain name
            
            doc = nlp(first_part)
            person_entities = []
            
            # Get all entity labels to filter out locations
            location_entities = set()
            for ent in doc.ents:
                if ent.label_ in ["GPE", "LOC", "ORG", "FAC"]:
                    location_entities.add(ent.text.lower())
            
            for ent in doc.ents:
                if ent.label_ == "PERSON":
                    # Validate entity
                    words = ent.text.split()
                    if len(words) >= 2:  # At least first and last name
                        # Check if it looks like a proper name
                        if all(re.match(r'^[A-Z][a-z]+$', word) for word in words[:3]):
                            # Skip if this entity was also tagged as a location
                            if ent.text.lower() not in location_entities:
                                person_entities.append(ent.text)
            
            # If multiple person entities found, prefer the first or longest one
            if person_entities:
                # Filter out very short or very long names
                valid_names = [name for name in person_entities if 3 <= len(name) <= 50]
                if valid_names:
                    # Prefer the first occurrence
                    return valid_names[0], 0.75
        except Exception as e:
            logger.debug(f"spaCy NER error: {e}")
    
    # Strategy 4: Look for patterns with email context
    # Often resumes have name near email
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_pattern, text)
    if email_match:
        email_start = email_match.start()
        # Look for text before the email (typically name is above email)
        context_before = text[max(0, email_start-150):email_start]
        
        # Pattern: Name in the last 1-5 lines before email
        lines_before = context_before.split('\n')[-5:]
        for line in reversed(lines_before):
            line = line.strip()
            
            # Skip if it's a header or title
            if any(skip in line.lower() for skip in ['email', 'contact', 'phone', 'mobile', 'developer', 'engineer', 'resume', 'cv']):
                continue
            
            # Check if it matches name pattern
            if re.match(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\s*$', line):
                words = line.split()
                # Additional validation: should be 2-4 words
                if 2 <= len(words) <= 4:
                    # Check if words don't look like professional titles
                    title_words = ['software', 'web', 'developer', 'engineer', 'manager', 
                                 'specialist', 'analyst', 'consultant', 'designer', 'tester']
                    if not any(word.lower() in title_words for word in words):
                        return line, 0.70
    
    # Strategy 5: Look for patterns in the very beginning (CV title position)
    first_100 = text[:100].strip()
    lines_start = first_100.split('\n')[:3]
    
    for line in lines_start:
        line = line.strip()
        # Check if it's a standalone title-like name
        if re.match(r'^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+$', line):
            if 3 <= len(line) <= 40 and (line.count(' ') == 0 or line.count(' ') <= 3):
                return line, 0.70
    
    return None, 0.0


def extract_father_name(text: str) -> Tuple[Optional[str], float]:
    """
    Extract Father's Name using context keywords.
    
    Returns:
        (father_name, confidence) tuple
    """
    patterns = [
        r"father'?s?\s+name[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"father[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"f\/o[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"son\s+of[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
        r"daughter\s+of[:\s]+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)",
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(1).strip(), 0.75
    
    return None, 0.0


def parse_resume(file_path: str) -> Dict:
    """
    Main function to parse resume and extract all fields.
    
    Args:
        file_path: Path to the resume file
        
    Returns:
        Dictionary with extracted data and confidence scores
    """
    logger.info(f"Processing resume: {file_path}")
    
    # Extract text
    text = extract_text(file_path)
    
    if not text:
        return {
            "error": "Could not extract text from file",
            "EmployeeName": None, "FathersName": None, "Email": None,
            "ContactNumber": None, "AlternateContact": None,
            "Gender": None, "PAN": None, "Aadhaar": None, "DOB": None,
            "confidences": {}
        }
    
    # Extract all fields
    employee_name, name_conf = extract_name(text)
    fathers_name, father_conf = extract_father_name(text)
    email, email_conf = extract_email(text)
    contact, alt_contact, contact_conf, alt_conf = extract_contact_numbers(text)
    gender, gender_conf = extract_gender(text)
    pan, pan_conf = extract_pan(text)
    aadhaar, aadhaar_conf = extract_aadhaar(text)
    dob, dob_conf = extract_dob(text)
    
    result = {
        "EmployeeName": employee_name,
        "FathersName": fathers_name,
        "Email": email,
        "ContactNumber": contact,
        "AlternateContact": alt_contact,
        "Gender": gender,
        "PAN": pan,
        "Aadhaar": aadhaar,
        "DOB": dob,
        "confidences": {
            "EmployeeName": name_conf,
            "FathersName": father_conf,
            "Email": email_conf,
            "ContactNumber": contact_conf,
            "AlternateContact": alt_conf,
            "Gender": gender_conf,
            "PAN": pan_conf,
            "Aadhaar": aadhaar_conf,
            "DOB": dob_conf,
        }
    }
    
    logger.info(f"Resume parsed successfully. Extracted {sum(1 for v in result.values() if v and v != 'confidences')} fields.")
    
    return result


if __name__ == "__main__":
    # Test the parser
    import sys
    
    if len(sys.argv) > 1:
        result = parse_resume(sys.argv[1])
        import json
        print(json.dumps(result, indent=2))
    else:
        print("Usage: python resume_parser.py <path_to_resume_file>")

