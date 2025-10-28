"""
Custom Token Authentication that supports both 'Bearer' and 'Token' prefixes
"""
from rest_framework.authentication import TokenAuthentication


class BearerTokenAuthentication(TokenAuthentication):
    """
    Token authentication using bearer tokens.
    
    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Bearer ".  For example:
    
        Authorization: Bearer 401f7ac837da42b97f613d789819ff93537bee6a
    """
    
    keyword = 'Bearer'

