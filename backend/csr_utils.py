import OpenSSL.crypto as crypto
from typing import Dict, Any, Optional, Tuple

def generate_csr(
    common_name: str,
    organization: str,
    organizational_unit: Optional[str] = None,
    locality: Optional[str] = None,
    state: Optional[str] = None,
    country: str = "US",
    email: Optional[str] = None,
    key_size: int = 2048
) -> Tuple[str, str]:
    """
    Generate a Certificate Signing Request (CSR) and private key.
    
    Args:
        common_name: The domain name for the certificate
        organization: The organization name
        organizational_unit: The organizational unit (optional)
        locality: The city or locality (optional)
        state: The state or province (optional)
        country: The two-letter country code
        email: The email address (optional)
        key_size: The RSA key size in bits (default: 2048)
        
    Returns:
        A tuple containing (csr_pem, key_pem)
    """
    # Create a key pair
    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, key_size)
    
    # Create a CSR
    req = crypto.X509Req()
    subject = req.get_subject()
    
    # Set subject fields
    subject.CN = common_name
    subject.O = organization
    if organizational_unit:
        subject.OU = organizational_unit
    if locality:
        subject.L = locality
    if state:
        subject.ST = state
    subject.C = country
    if email:
        subject.emailAddress = email
    
    # Sign the CSR with the private key
    req.set_pubkey(key)
    req.sign(key, 'sha256')
    
    # Convert to PEM format
    csr_pem = crypto.dump_certificate_request(crypto.FILETYPE_PEM, req).decode('utf-8')
    key_pem = crypto.dump_privatekey(crypto.FILETYPE_PEM, key).decode('utf-8')
    
    return csr_pem, key_pem

def parse_csr(csr_pem: str) -> Dict[str, Any]:
    """
    Parse a CSR and extract its information.
    
    Args:
        csr_pem: The CSR in PEM format
        
    Returns:
        A dictionary containing CSR information
    """
    try:
        # Parse the CSR
        csr = crypto.load_certificate_request(crypto.FILETYPE_PEM, csr_pem)
        
        # Extract subject information
        subject = csr.get_subject()
        subject_dict = {}
        for key, value in subject.get_components():
            subject_dict[key.decode('utf-8')] = value.decode('utf-8')
        
        # Get public key information
        pubkey = csr.get_pubkey()
        key_size = pubkey.bits()
        
        # Get signature algorithm
        sig_algo = csr.get_signature_algorithm().decode('utf-8')
        
        # Verify the signature
        is_valid = csr.verify(pubkey)
        
        return {
            "subject": subject_dict,
            "key_size": key_size,
            "signature_algorithm": sig_algo,
            "is_valid": is_valid
        }
    
    except Exception as e:
        raise ValueError(f"Invalid CSR: {str(e)}")

def validate_csr(csr_pem: str) -> bool:
    """
    Validate a CSR.
    
    Args:
        csr_pem: The CSR in PEM format
        
    Returns:
        True if the CSR is valid, False otherwise
    """
    try:
        # Parse the CSR
        csr = crypto.load_certificate_request(crypto.FILETYPE_PEM, csr_pem)
        
        # Get public key
        pubkey = csr.get_pubkey()
        
        # Verify the signature
        return csr.verify(pubkey)
    
    except Exception:
        return False

def compare_csrs(csr1_pem: str, csr2_pem: str) -> Dict[str, Any]:
    """
    Compare two CSRs and identify differences.
    
    Args:
        csr1_pem: The first CSR in PEM format
        csr2_pem: The second CSR in PEM format
        
    Returns:
        A dictionary containing the differences between the CSRs
    """
    try:
        # Parse the CSRs
        csr1_info = parse_csr(csr1_pem)
        csr2_info = parse_csr(csr2_pem)
        
        # Compare subject fields
        subject_diffs = {}
        for key in set(csr1_info["subject"].keys()) | set(csr2_info["subject"].keys()):
            val1 = csr1_info["subject"].get(key)
            val2 = csr2_info["subject"].get(key)
            if val1 != val2:
                subject_diffs[key] = {"csr1": val1, "csr2": val2}
        
        # Compare other fields
        other_diffs = {}
        for key in ["key_size", "signature_algorithm"]:
            if csr1_info[key] != csr2_info[key]:
                other_diffs[key] = {"csr1": csr1_info[key], "csr2": csr2_info[key]}
        
        return {
            "subject_differences": subject_diffs,
            "other_differences": other_diffs,
            "are_identical": len(subject_diffs) == 0 and len(other_diffs) == 0
        }
    
    except Exception as e:
        raise ValueError(f"Error comparing CSRs: {str(e)}")

def suggest_domain_name(service: str, environment: str) -> str:
    """
    Suggest a domain name based on service and environment.
    
    Args:
        service: The service name
        environment: The environment (PROD, UAT, DEV)
        
    Returns:
        A suggested domain name
    """
    # Map service names to domain prefixes
    service_domains = {
        'NI-3DS': 'paypage',
        'NI-API': 'api-gateway',
        'NI-3DS-CALLBACK': 'spg.internal',
        'NI-MLE': 'portal',
    }
    
    # Get the base domain for the service
    base_domain = service_domains.get(service, service.lower())
    
    # Construct the domain based on environment
    if environment == 'PROD':
        return f"{base_domain}.ksa.ngenius-payments.com"
    else:
        return f"{base_domain}.{environment.lower()}.ksa.ngenius-payments.com"
