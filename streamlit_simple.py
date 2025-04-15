import streamlit as st
import OpenSSL.crypto as crypto
import base64
import json
from typing import Dict, Any, Optional, Tuple

# Set page configuration
st.set_page_config(
    page_title="CSR Generator Tool",
    page_icon="🔐",
    layout="wide",
)

st.title("CSR Generator Tool")
st.markdown("A simple Certificate Signing Request (CSR) management tool.")

# Utility functions
def generate_csr(
    common_name: str,
    organization: str,
    country: str = "US",
    key_size: int = 2048
) -> Tuple[str, str]:
    """Generate a CSR and private key."""
    # Create a key pair
    key = crypto.PKey()
    key.generate_key(crypto.TYPE_RSA, key_size)
    
    # Create a CSR
    req = crypto.X509Req()
    subject = req.get_subject()
    
    # Set subject fields
    subject.CN = common_name
    subject.O = organization
    subject.C = country
    
    # Sign the CSR with the private key
    req.set_pubkey(key)
    req.sign(key, 'sha256')
    
    # Convert to PEM format
    csr_pem = crypto.dump_certificate_request(crypto.FILETYPE_PEM, req).decode('utf-8')
    key_pem = crypto.dump_privatekey(crypto.FILETYPE_PEM, key).decode('utf-8')
    
    return csr_pem, key_pem

def parse_csr(csr_pem: str) -> Dict[str, Any]:
    """Parse a CSR and extract its information."""
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
        try:
            sig_algo = csr.get_signature_algorithm().decode('utf-8')
        except AttributeError:
            # Fallback for older versions of OpenSSL
            sig_algo = "sha256WithRSAEncryption"
        
        return {
            "subject": subject_dict,
            "key_size": key_size,
            "signature_algorithm": sig_algo
        }
    
    except Exception as e:
        st.error(f"Invalid CSR: {str(e)}")
        return {}

# Tabs for different functionalities
tab1, tab2 = st.tabs(["Generator", "Validator"])

# Generator tab
with tab1:
    st.header("CSR Generator")
    
    # Form for CSR generation
    with st.form("csr_form"):
        common_name = st.text_input("Common Name (Domain)", value="example.com")
        organization = st.text_input("Organization", value="Example Organization")
        country = st.text_input("Country Code", value="US")
        key_size = st.selectbox("Key Size", [2048, 4096])
        
        submit_button = st.form_submit_button("Generate CSR")
    
    # Generate CSR when form is submitted
    if submit_button:
        if not common_name:
            st.error("Common Name is required")
        elif not organization:
            st.error("Organization is required")
        elif not country:
            st.error("Country Code is required")
        else:
            with st.spinner("Generating CSR..."):
                try:
                    csr_pem, key_pem = generate_csr(
                        common_name=common_name,
                        organization=organization,
                        country=country,
                        key_size=key_size
                    )
                    
                    st.success("CSR generated successfully!")
                    
                    # Display CSR
                    st.subheader("Generated CSR")
                    st.text_area("CSR (PEM format)", csr_pem, height=200)
                    
                    # Display private key with warning
                    st.subheader("Private Key")
                    st.warning("Keep your private key secure! Never share it with anyone.")
                    st.text_area("Private Key (PEM format)", key_pem, height=200)
                
                except Exception as e:
                    st.error(f"Error generating CSR: {str(e)}")

# Validator tab
with tab2:
    st.header("CSR Validator")
    
    # Input for CSR
    csr_input = st.text_area("Paste your CSR (PEM format)", height=200)
    
    if st.button("Validate CSR"):
        if not csr_input:
            st.error("Please provide a CSR to validate")
        else:
            with st.spinner("Validating CSR..."):
                try:
                    csr_info = parse_csr(csr_input)
                    
                    if csr_info:
                        st.success("CSR is valid!")
                        
                        # Display CSR information
                        st.subheader("CSR Information")
                        
                        # Subject information
                        st.write("**Subject Information**")
                        for key, value in csr_info["subject"].items():
                            st.write(f"- {key}: {value}")
                        
                        # Key information
                        st.write(f"**Key Size**: {csr_info['key_size']} bits")
                        st.write(f"**Signature Algorithm**: {csr_info['signature_algorithm']}")
                
                except Exception as e:
                    st.error(f"Error validating CSR: {str(e)}")
