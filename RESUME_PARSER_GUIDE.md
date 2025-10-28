# Resume Parser System - Documentation

## Overview
The Resume Parser system automatically extracts candidate information from uploaded resumes (PDF/DOCX) and auto-fills the employee registration form.

## Features
- **Multi-format Support**: PDF, DOCX, and DOC files
- **Auto-Extraction**: Extracts 9 key fields from resumes
- **Smart Parsing**: Uses regex patterns and NLP for accurate extraction
- **Confidence Scores**: Each extracted field has a confidence score (0-1)
- **Form Auto-Fill**: Automatically populates form fields after parsing

## Extracted Fields

| Field | Description | Example |
|-------|-------------|---------|
| EmployeeName | Candidate's full name | "Vishnu Kumar" |
| FathersName | Father's name (from "F/O", "Son/Daughter of") | "Rajesh Kumar" |
| Email | Email address | "vishnu@example.com" |
| ContactNumber | Primary contact number | "+91-9876543210" |
| AlternateContact | Secondary contact number | "9876500000" |
| Gender | Detected gender | "Male" / "Female" |
| PAN | PAN card number | "ABCDE1234F" |
| Aadhaar | Aadhaar number | "123456789012" |
| DOB | Date of birth | "12/03/1999" |

## Installation & Setup

### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### Required Packages
- `pdfplumber` - PDF text extraction
- `python-docx` - DOCX file handling
- `docx2txt` - Alternative DOCX parsing
- `spacy` - NLP for entity recognition

## API Endpoint

### Upload & Parse Resume
```
POST /api/peoples/parse-resume/
```

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Request Body:**
```
FormData with 'resume' field containing the file
```

**Response:**
```json
{
  "EmployeeName": "Vishnu Kumar",
  "FathersName": "Rajesh Kumar",
  "Email": "vishnu@example.com",
  "ContactNumber": "+91-9876543210",
  "AlternateContact": "9876500000",
  "Gender": "Male",
  "PAN": "ABCDE1234F",
  "Aadhaar": "123456789012",
  "DOB": "12/03/1999",
  "confidences": {
    "EmployeeName": 0.80,
    "FathersName": 0.75,
    "Email": 0.95,
    "ContactNumber": 0.90,
    "AlternateContact": 0.80,
    "Gender": 0.70,
    "PAN": 0.95,
    "Aadhaar": 0.90,
    "DOB": 0.85
  }
}
```

## Frontend Usage

### In AddEmployee.jsx

1. **Upload Button**: Click "Upload Resume to Auto-Fill" button
2. **Select File**: Choose a PDF or DOCX file
3. **Auto-Parse**: System extracts information automatically
4. **Auto-Fill**: Form fields populate with extracted data
5. **Review & Submit**: Review extracted data, fill remaining fields, and submit

### User Experience Flow
```
User clicks "Upload Resume" 
→ Selects PDF/DOCX file
→ System shows "Parsing Resume..." loader
→ Extracted data auto-fills form fields
→ Success message shows: "Resume parsed successfully! X fields extracted."
→ User reviews and submits form
```

## How It Works

### 1. Text Extraction
- **PDF**: Uses `pdfplumber` to extract text from each page
- **DOCX**: Uses `docx2txt` (primary) or `python-docx` (fallback)

### 2. Field Extraction

#### Email
- **Pattern**: Standard email regex
- **Confidence**: 95% (high accuracy)

#### Contact Numbers
- **Patterns**: Multiple patterns for Indian phone numbers
  - `+91-9876543210`
  - `91-9876543210`
  - `9876543210`
- **Validation**: 10-13 digits
- **Confidence**: 90% (main), 80% (alternate)

#### PAN Card
- **Pattern**: `[A-Z]{5}[0-9]{4}[A-Z]{1}`
- **Example**: "ABCDE1234F"
- **Confidence**: 95%

#### Aadhaar Number
- **Pattern**: 12 digits (may be grouped with spaces/hyphens)
- **Examples**: "1234 5678 9012", "1234-5678-9012"
- **Confidence**: 90%

#### Date of Birth
- **Patterns**: Multiple date formats
  - DD/MM/YYYY
  - DD-MM-YYYY
  - YYYY/MM/DD
- **Conversion**: Standardized to DD/MM/YYYY
- **Confidence**: 85%

#### Name (Employee)
- **Methods**:
  - Context-based: After "Name:", "Candidate:", "Resume of"
  - NLP (spaCy): Named Entity Recognition for PERSON entities
- **Confidence**: 75-80%

#### Father's Name
- **Keywords**: "Father's Name", "F/O", "Son of", "Daughter of"
- **Pattern**: Extracts name after these keywords
- **Confidence**: 75%

#### Gender
- **Keywords**:
  - Male: "male", "m", "man", "boy", "he", "his"
  - Female: "female", "f", "woman", "girl", "she", "her", "ms", "mrs"
- **Logic**: Count occurrences, return majority
- **Confidence**: 70%

## File Structure

```
backend/project_management/employee/
├── resume_parser.py          # Core parsing logic
├── views.py                   # API endpoint
└── urls.py                    # URL routing

frontend/src/pages/Employee/
└── AddEmployee.jsx            # Form with upload functionality
```

## Error Handling

### Missing Fields
- Returns `null` for fields that couldn't be extracted
- No errors thrown for missing data
- Form allows manual entry for missing fields

### File Errors
- Invalid file type: Returns error message
- Parsing failure: Returns error with empty fields
- File corruption: Handled gracefully

### Backend Errors
```python
try:
    # Parse resume
except Exception as e:
    # Return error response with empty fields
```

## Confidence Scores

Each extracted field includes a confidence score indicating extraction accuracy:

| Confidence Range | Quality |
|-----------------|---------|
| 0.9 - 1.0 | High (Very reliable) |
| 0.75 - 0.89 | Medium (Usually reliable) |
| 0.6 - 0.74 | Low (Review recommended) |
| 0.0 - 0.59 | Very Low (Manual entry required) |

## Best Practices

### Resume Format Recommendations
1. Use standard resume templates
2. Include clear section headings (Personal Details, Contact Information)
3. Place name at the top
4. Use consistent date formats
5. Include all contact information in one section

### For Developers
1. **Test with sample resumes** before production
2. **Monitor confidence scores** to improve patterns
3. **Add logging** for debugging
4. **Handle edge cases** for different resume formats
5. **Update regex patterns** based on common formats

## Future Enhancements

1. **More Fields**: Skills, Education, Work Experience
2. **OCR Support**: Extract from scanned PDFs
3. **Image Processing**: Extract info from embedded images
4. **ML Models**: Train custom models for higher accuracy
5. **Batch Processing**: Parse multiple resumes at once
6. **Export Options**: Export parsed data to CSV/Excel

## Troubleshooting

### Issue: spaCy model not found
**Solution**: Run `python -m spacy download en_core_web_sm`

### Issue: PDF extraction fails
**Solution**: Check if PDF is text-based (not scanned image)

### Issue: Date format not recognized
**Solution**: Add custom pattern for specific date format

### Issue: Name extraction poor
**Solution**: Adjust context-based patterns or improve NLP preprocessing

## Testing

### Sample Resume Format for Testing
```
CANDIDATE NAME
Vishnu Kumar

PERSONAL DETAILS
Name: Vishnu Kumar
Father's Name: Rajesh Kumar
Email: vishnu@example.com
Phone: +91-9876543210
Alternate Phone: 9876500000
PAN: ABCDE1234F
Aadhaar: 1234 5678 9012
Date of Birth: 12/03/1999
Gender: Male

...
```

## Support
For issues or enhancements, contact the development team.

