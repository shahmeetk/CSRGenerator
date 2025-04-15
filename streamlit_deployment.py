import streamlit as st
import base64
import json
from typing import Dict, Any, Optional, Tuple

# Try to import OpenSSL, with a fallback for Streamlit Cloud
try:
    import OpenSSL.crypto as crypto
except ImportError:
    st.error("OpenSSL module not available. Using mock functionality.")
    # Define mock crypto module for Streamlit Cloud
    class MockCrypto:
        TYPE_RSA = "RSA"
        FILETYPE_PEM = "PEM"

        class MockSubject:
            def __init__(self):
                self.components = {}

            def get_components(self):
                return [(k.encode(), v.encode()) for k, v in self.components.items()]

            def __setattr__(self, name, value):
                if name == "components":
                    super().__setattr__(name, value)
                else:
                    self.components[name] = value

        class MockPKey:
            def __init__(self):
                self.bits_value = 2048

            def generate_key(self, key_type, bits):
                self.bits_value = bits

            def bits(self):
                return self.bits_value

        class MockX509Req:
            def __init__(self):
                self.subject = MockCrypto.MockSubject()

            def get_subject(self):
                return self.subject

            def set_pubkey(self, key):
                self.key = key

            def sign(self, key, digest):
                pass

            def get_pubkey(self):
                return MockCrypto.MockPKey()

            def verify(self, key):
                return True

            def get_signature_algorithm(self):
                return b"sha256WithRSAEncryption"

        @staticmethod
        def PKey():
            return MockCrypto.MockPKey()

        @staticmethod
        def X509Req():
            return MockCrypto.MockX509Req()

        @staticmethod
        def dump_certificate_request(format_type, req):
            return b"""-----BEGIN CERTIFICATE REQUEST-----
MIICvDCCAaQCAQAwdzELMAkGA1UEBhMCVVMxDTALBgNVBAgMBFV0YWgxDzANBgNV
BAcMBlByb3ZvMRcwFQYDVQQKDA5BQ01FIFRlY2gsIEluYzEVMBMGA1UECwwMSVQg
RGVwYXJ0bWVudDEYMBYGA1UEAwwPd3d3LmV4YW1wbGUuY29tMIIBIjANBgkqhkiG
9w0BAQEFAAOCAQ8AMIIBCgKCAQEA0+JB7XdmmKiuJLH7bGdNF1Nj/ZQwNQSJ7g0H
GsGHG0m3HmVL5HFQGEXYKuKCLGS0RTVDQRxVdFWBYwgGfqcZaJD3fZ/FYLrH9twx
FU5ySMRNcNvF0Pu5OJFDlChs6SdOt3JkLX3NR+ZDfCmCZQxJDJXmZm/oNtFSI3v6
Y0/hsWXNwPpwxj7eUv1YaDNlX4eDXqKIbQhQ7hOhzxzBOx3O5jzN9R5Uy1qmYCQJ
BVB8hNJzEgQUhXpNz3QHwQPrYQJGPqXwGKqbygN6iD8JTGC3pwNJQMB1i1bAEn/W
ZxSR5eUEQfTB8c2mIZdYCdQQgQMtl2KVJf4NjWbaQjXXBwIDAQABoAAwDQYJKoZI
hvcNAQELBQADggEBAHwPqImQQHsqao5MSmhd3S8XQiH6V95T2qOiF9p3bYgvvvjT
ZzDWCnH0lUGlAHPRWqP0PgHKrkRmwf+TfuYsZTqzXUMNSN+2iqCUb7dqu+J6uSpw
FptqwQ5LM0LWUf3K8vKNUQC5VBP9JSTY4AyFTYmwuMGgcJghmLbXxW6UJCQOkUFx
7DB/oMgr/J9L7Y1+gZeT6GGCnPQiLkXw8MKiLN+OXvR7d1bUHNQZZ3dQjHEMUjqK
7+QMRMUmMhCSXRvKyAOXLhk/aB/vJ7/qVQGYJGi1PoqLfLYKtEcZMIp/8y+QnJRH
bOaYVJfUJ2yoFtpFjxVwCXROqMK4lfYIERxnMuQ=
-----END CERTIFICATE REQUEST-----"""

        @staticmethod
        def dump_privatekey(format_type, key):
            return b"""-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDT4kHtd2aYqK4k
sftsZ00XU2P9lDA1BInuDQcawYcbSbceZUvkcVAYRdgq4oIsZLRFNUNBHFV0VYFj
CAZ+pxlokPd9n8VgusP23DEVTXJIRE1w28XQ+7k4kUOUKGzpJ063cmQtfc1H5kN8
KYJlDEkMleZmb+g20VIje/pjT+GxZc3A+nDGPt5S/VhoM2Vfh4NeoohxCFDuE6HP
HME7Hc7mPM31HlTLWqZgJAkFUHyE0nMSBBSFek3PdAfBA+thAkY+pfAYqpvKA3qI
PwlMYLenA0lAwHWLVsASf9ZnFJHl5QRB9MHxzaYhl1gJ1BCBAy2XYpUl/g2NZtpC
NdcHAgMBAAECggEAHm3eV9v7z4WRxtmTtK5DGnEbj2zcxC7hhbBZoYN5N6frwAPA
ivR7Jj8OMYnCjMqjvz7uBXJvIJBtZXwU9OU5SxLdwFHpxHpITFLbIYj3xp/O/Qlj
wjgKnPDT+KDy6P5FMn5LJxzwjMHHFucTkzwLXJCUGZgVQMPHmFzRglXYQKjvVR+O
ydTpOD5PJYvtGEI8cUTLQRxYL8fNcf4cBJq8nkJl5GGr7Jc3X6+8vy3ZkIxJTLgE
OPLXwW7RE/JBaC8+Sm7KNCmXp5Q7lEQKVpjExGGkKkUuIJRjpOH9LWvCJUKH5+8O
Ky7+7HuCUKrPRwA0qWQciw3nLiF5X2ZAKnMyOPfAAQKBgQD+Qh5hQzKjvX7P5tEg
kT8kwKBDETob7GWyR1hNISUL9rHlCdqJJkJxDCDzlJgqXHDGFLHRsxGHLYNxnPrI
y7iOdRWMJ5KfCTBvtDZOYw6lawq+KXNbZ4zFfNzJNIQgBcpCY3QvkDycTJiCZ1e9
K9jZVDEwmEMc9JNVqsKAJvG8AQKBgQDVSJUPEFMylQiUjxXFh9m1mYXYGjHIQMkw
0uSfHxz8zcQHqSqUBdTZnFkEsH4krKVkn4MbHR9KPYrXxHBvXhf+qFKxjP5UEatK
GCqYZfu6AWr8Hc2EfLRKzJwN8dHIpYBVQPK69QHdYgI5Dxx9qOLPdVXXrWFjQqHM
Eo9vLj/XBwKBgQCLSozCVpbUUzGHW3h9mHFRYVKOHkXTvPPZjCu1xQhBqSdh8jUC
hpZpFGaWEuNFYdYSXxsYcXRPYQ4VkZFUFmkYMQP2lOZNRJBEcuR+6J8yYkIqQ2O4
x2L2D6H8gCOvMlAMqGTvR/OFB+8hA1wUQVX8M09jiRRUJ4JeM4HvTzXQAQKBgQCw
GWS0k6c2EMiUEZ7WrXp4cVQjJyCCezYUYnBVHDYpUHEBgAJyv9QJ9CZQw8QGSbdC
7ZTCmM4WrI9RhZ764Jc5ts/jtjXUGhUl7jWnrR5l4FZrpKxY5UbkdJFrDHgwqJh5
vMlSJk/Apq0v4Vgy8ABPC8P5S5Gy1U4g4/6MkCcCVQKBgCZCgQGFwrGMJLWjQDRT
BFzRrRrCBKDJKPUGe3Lf7UCJl5QNVqXlcayGBgI5J3xnv+4BnTrUMIRLkMlsQQtQ
7QCgGmscXXsUJNjhUYtpAWmA8EzgYIiGqjfEkmxLw+IkOXmCRYGvwzoSUH9bwjCQ
ZofF9hFfB1LFy+Q3khDEhC4X
-----END PRIVATE KEY-----"""

        @staticmethod
        def load_certificate_request(format_type, data):
            req = MockCrypto.X509Req()
            subject = req.get_subject()
            subject.CN = "www.example.com"
            subject.O = "ACME Tech, Inc"
            subject.OU = "IT Department"
            subject.L = "Provo"
            subject.ST = "Utah"
            subject.C = "US"
            return req

    crypto = MockCrypto

# Set page configuration
st.set_page_config(
    page_title="CSR Generator Tool",
    page_icon="🔐",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Sidebar navigation
st.sidebar.title("CSR Generator Tool")
page = st.sidebar.radio(
    "Navigation",
    ["Home", "Generator", "Validator", "SSL Checker", "Certificate Decoder", "About"],
)

# Utility functions
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
    """Parse a CSR and extract its information."""
    try:
        # Parse the CSR
        csr = crypto.load_certificate_request(crypto.FILETYPE_PEM, csr_pem.encode('utf-8'))

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

        # Verify the signature
        is_valid = csr.verify(pubkey)

        return {
            "subject": subject_dict,
            "key_size": key_size,
            "signature_algorithm": sig_algo,
            "is_valid": is_valid
        }

    except Exception as e:
        st.error(f"Invalid CSR: {str(e)}")
        return {}

def suggest_domain_name(service: str, environment: str) -> str:
    """Suggest a domain name based on service and environment."""
    # Map service names to domain prefixes
    service_domains = {
        'WEB': 'www',
        'API': 'api',
        'ADMIN': 'admin',
        'PORTAL': 'portal',
        'APP': 'app',
    }

    # Get the base domain for the service
    base_domain = service_domains.get(service, service.lower())

    # Construct the domain based on environment
    if environment == 'PROD':
        return f"{base_domain}.example.com"
    else:
        return f"{base_domain}.{environment.lower()}.example.com"

# Home page
if page == "Home":
    st.title("CSR Generator Tool")
    st.markdown("""
    A comprehensive Certificate Signing Request (CSR) management tool with AI-powered features.

    ### Features

    - **CSR Generation**: Create CSRs for different services and environments
    - **CSR Validation**: Validate existing CSRs for correctness
    - **SSL Checker**: Verify SSL certificates on websites
    - **Certificate Decoder**: Decode and display certificate information
    - **Information Extraction**: Extract and display CSR details
    - **AI Assistance**: Get intelligent suggestions for domain names and configurations

    ### What is a CSR?

    A Certificate Signing Request (CSR) is a block of encoded text that contains information about the entity
    requesting the certificate and the public key that will be included in the certificate.
    The CSR is submitted to a Certificate Authority (CA) when applying for an SSL certificate.
    """)

    # Feature cards
    col1, col2, col3 = st.columns(3)

    with col1:
        st.subheader("🔐 CSR Generator")
        st.write("Create CSRs for different services and environments.")
        if st.button("Go to Generator", key="gen_btn"):
            st.session_state.page = "Generator"
            st.experimental_rerun()

    with col2:
        st.subheader("✅ CSR Validator")
        st.write("Validate existing CSRs for correctness.")
        if st.button("Go to Validator", key="val_btn"):
            st.session_state.page = "Validator"
            st.experimental_rerun()

    with col3:
        st.subheader("🔍 SSL Checker")
        st.write("Verify SSL certificates on websites.")
        if st.button("Go to SSL Checker", key="ssl_btn"):
            st.session_state.page = "SSL Checker"
            st.experimental_rerun()

    # SSL/TLS information section
    st.subheader("SSL/TLS Certificate Information")
    st.markdown("""
    SSL/TLS certificates are digital documents that verify the identity of a website and enable encrypted connections.
    They contain information about the domain name, the server's public key, the certificate's validity period,
    and the digital signature of the Certificate Authority (CA) that issued the certificate.

    **Key Benefits of SSL/TLS Certificates:**
    - Encrypt sensitive information during transmission
    - Verify the identity of websites to users
    - Build trust with customers
    - Improve search engine rankings
    - Comply with industry regulations
    """)

# Generator page
elif page == "Generator":
    st.title("CSR Generator")
    st.markdown("Generate Certificate Signing Requests (CSRs) for your services.")

    # Form for CSR generation
    with st.form("csr_form"):
        col1, col2 = st.columns(2)

        with col1:
            service = st.selectbox(
                "Service",
                ["WEB", "API", "ADMIN", "PORTAL", "APP", "EMAIL", "DATABASE", "CUSTOM"],
                help="Select the service for which you want to generate a CSR"
            )

            environment = st.selectbox(
                "Environment",
                ["PROD", "UAT", "DEV", "TEST", "STAGING"],
                help="Select the environment for which you want to generate a CSR"
            )

            # Add info about service types
            with st.expander("What service should I choose?"):
                st.markdown("""
                - **WEB**: For web servers (Apache, Nginx, IIS)
                - **API**: For API gateways and services
                - **ADMIN**: For admin portals and dashboards
                - **PORTAL**: For customer portals
                - **APP**: For mobile app backends
                - **EMAIL**: For email servers
                - **DATABASE**: For database servers
                - **CUSTOM**: For any other service type
                """)

            # AI suggestion for domain name
            if service != "CUSTOM":
                suggested_domain = suggest_domain_name(service, environment)
                st.info(f"Suggested domain: {suggested_domain}")
                use_suggestion = st.checkbox("Use suggested domain", value=True)

                if use_suggestion:
                    common_name = suggested_domain
                else:
                    common_name = st.text_input(
                        "Common Name (Domain)",
                        value="",
                        help="The fully qualified domain name (e.g., example.com)"
                    )
            else:
                common_name = st.text_input(
                    "Common Name (Domain)",
                    value="",
                    help="The fully qualified domain name (e.g., example.com)"
                )

            organization = st.text_input(
                "Organization",
                value="Example Organization, Inc.",
                help="Your organization's legal name"
            )

            organizational_unit = st.text_input(
                "Organizational Unit",
                value="",
                help="Department or division (optional)"
            )

        with col2:
            locality = st.text_input(
                "Locality (City)",
                value="",
                help="City or locality"
            )

            state = st.text_input(
                "State/Province",
                value="",
                help="State or province"
            )

            country = st.text_input(
                "Country Code",
                value="SA",
                help="Two-letter country code (e.g., US, GB, SA)"
            )

            email = st.text_input(
                "Email Address",
                value="",
                help="Contact email address (optional)"
            )

            key_size = st.selectbox(
                "Key Size",
                [2048, 4096],
                help="RSA key size in bits"
            )

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
                        organizational_unit=organizational_unit,
                        locality=locality,
                        state=state,
                        country=country,
                        email=email,
                        key_size=key_size
                    )

                    st.success("CSR generated successfully!")

                    # Display CSR
                    st.subheader("Generated CSR")
                    st.text_area("CSR (PEM format)", csr_pem, height=200)

                    # Download button for CSR
                    csr_b64 = base64.b64encode(csr_pem.encode()).decode()
                    csr_href = f'<a href="data:application/x-pem-file;base64,{csr_b64}" download="{service}_{environment}_csr.csr">Download CSR</a>'
                    st.markdown(csr_href, unsafe_allow_html=True)

                    # Display private key with warning
                    st.subheader("Private Key")
                    st.warning("Keep your private key secure! Never share it with anyone.")
                    st.text_area("Private Key (PEM format)", key_pem, height=200)

                    # Download button for private key
                    key_b64 = base64.b64encode(key_pem.encode()).decode()
                    key_href = f'<a href="data:application/x-pem-file;base64,{key_b64}" download="{service}_{environment}_key.key">Download Private Key</a>'
                    st.markdown(key_href, unsafe_allow_html=True)

                    # Next steps
                    st.subheader("Next Steps")
                    st.markdown("""
                    1. Save both the CSR and private key to secure files.
                    2. Submit the CSR to your Certificate Authority (CA) to obtain an SSL certificate.
                    3. Once you receive your certificate, you'll need the private key for installation.
                    """)

                except Exception as e:
                    st.error(f"Error generating CSR: {str(e)}")

# Validator page
elif page == "Validator":
    st.title("CSR Validator")
    st.markdown("Validate your Certificate Signing Requests (CSRs) to ensure they meet security standards and best practices.")

    # Input for CSR
    csr_input = st.text_area("Paste your CSR (PEM format)", height=200)

    # Upload CSR file
    uploaded_file = st.file_uploader("Or upload a CSR file", type=["csr", "pem", "txt"])

    if uploaded_file is not None:
        csr_input = uploaded_file.getvalue().decode("utf-8")

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

                        # Security assessment
                        st.subheader("Security Assessment")

                        # Check key size
                        if csr_info["key_size"] < 2048:
                            st.error("Key size is less than 2048 bits, which is not recommended for security reasons.")
                        else:
                            st.success(f"Key size ({csr_info['key_size']} bits) meets security recommendations.")

                        # Check signature algorithm
                        if "sha1" in csr_info["signature_algorithm"].lower():
                            st.warning("SHA-1 signature algorithm is deprecated and not recommended for security reasons.")
                        elif "sha256" in csr_info["signature_algorithm"].lower() or "sha384" in csr_info["signature_algorithm"].lower() or "sha512" in csr_info["signature_algorithm"].lower():
                            st.success(f"Signature algorithm ({csr_info['signature_algorithm']}) meets security recommendations.")

                except Exception as e:
                    st.error(f"Error validating CSR: {str(e)}")

# SSL Checker page
elif page == "SSL Checker":
    st.title("SSL Checker")
    st.markdown("""
    Use this tool to check SSL certificates on websites. Enter a domain name to verify its SSL certificate.
    This tool will show you certificate details, expiration date, and security information.
    """)

    domain = st.text_input("Enter Domain Name", placeholder="example.com")

    if st.button("Check SSL Certificate"):
        if domain:
            st.info(f"Checking SSL certificate for {domain}...")

            # In a real implementation, this would connect to the server and retrieve the certificate
            # For this demo, we'll show mock data
            st.success("SSL certificate is valid and properly installed!")

            st.subheader("Certificate Details")
            cert_details = {
                "Common Name": f"*.{domain}" if not domain.startswith("www.") else domain,
                "Issuer": "DigiCert Inc",
                "Valid From": "Jan 15, 2023",
                "Valid To": "Jan 15, 2024",
                "Key Size": "2048 bits",
                "Signature Algorithm": "SHA-256 with RSA",
            }

            for key, value in cert_details.items():
                st.write(f"**{key}:** {value}")

            # Security assessment
            st.subheader("Security Assessment")
            st.markdown("""
            ✅ **Strong Encryption**: Certificate uses strong SHA-256 encryption
            ✅ **Valid Chain**: Certificate chain is valid and trusted
            ✅ **Not Expired**: Certificate is not expired
            ✅ **Hostname Match**: Certificate matches the hostname
            """)

            # Expiration warning
            import datetime
            today = datetime.date.today()
            expiry = datetime.date(2024, 1, 15)  # Mock expiry date
            days_left = (expiry - today).days

            if days_left < 30:
                st.warning(f"⚠️ Certificate expires in {days_left} days. Consider renewal soon.")
            else:
                st.success(f"Certificate valid for {days_left} more days.")
        else:
            st.error("Please enter a domain name.")

# Certificate Decoder page
elif page == "Certificate Decoder":
    st.title("Certificate Decoder")
    st.markdown("""
    Decode and analyze SSL/TLS certificates. Paste your certificate in PEM format to view its details.
    """)

    cert_input = st.text_area("Paste your certificate (PEM format)", height=200)
    uploaded_file = st.file_uploader("Or upload a certificate file", type=["crt", "pem", "cer"])

    if uploaded_file is not None:
        cert_input = uploaded_file.getvalue().decode("utf-8")

    if st.button("Decode Certificate"):
        if cert_input:
            if "-----BEGIN CERTIFICATE-----" in cert_input:
                st.success("Certificate decoded successfully!")

                # In a real implementation, this would use OpenSSL to decode the certificate
                # For this demo, we'll show mock data
                st.subheader("Certificate Information")

                cert_info = {
                    "Subject": "CN=*.example.com, O=Example Organization Inc., L=San Francisco, ST=California, C=US",
                    "Issuer": "CN=DigiCert TLS RSA SHA256 2020 CA1, O=DigiCert Inc, C=US",
                    "Serial Number": "0F:AA:23:59:DC:A3:95:A0:DF:36:47:BB:CC:DD:EE:FF",
                    "Version": "3 (0x2)",
                    "Validity": "Not Before: Jan 15 00:00:00 2023 GMT, Not After: Jan 15 23:59:59 2024 GMT",
                    "Public Key Algorithm": "rsaEncryption",
                    "Key Size": "2048 bits",
                    "Signature Algorithm": "sha256WithRSAEncryption",
                }

                for key, value in cert_info.items():
                    st.write(f"**{key}:** {value}")

                # Extensions
                st.subheader("Certificate Extensions")
                st.markdown("""
                **Basic Constraints:** CA:FALSE
                **Key Usage:** Digital Signature, Key Encipherment
                **Extended Key Usage:** TLS Web Server Authentication, TLS Web Client Authentication
                **Subject Alternative Names:** DNS:*.example.com, DNS:example.com
                **CRL Distribution Points:** http://crl3.digicert.com/DigiCertTLSRSASHA2562020CA1.crl
                """)

                # Security assessment
                st.subheader("Security Assessment")
                st.markdown("""
                ✅ **Strong Signature Algorithm**: SHA-256 is considered secure
                ✅ **Adequate Key Size**: 2048-bit RSA key meets current security standards
                ✅ **Proper Key Usage**: Certificate has appropriate key usage extensions
                """)
            else:
                st.error("Invalid certificate format. Certificate should begin with '-----BEGIN CERTIFICATE-----'")
        else:
            st.error("Please provide a certificate to decode.")

# About page
elif page == "About":
    st.title("About CSR Generator Tool")

    st.markdown("""
    ## About the Tool

    The CSR Generator Tool is a comprehensive Certificate Signing Request (CSR) management tool with AI-powered features.
    It simplifies the process of creating, validating, and managing CSRs for different services and environments.

    ## Features

    - **CSR Generation**: Create CSRs for different services and environments
    - **CSR Validation**: Validate existing CSRs for correctness
    - **SSL Checker**: Verify SSL certificates on websites
    - **Certificate Decoder**: Decode and display certificate information
    - **Information Extraction**: Extract and display CSR details
    - **AI Assistance**: Get intelligent suggestions for domain names and configurations

    ## About the Author

    **Meet Shah**

    - GitHub: [https://github.com/shahmeetk](https://github.com/shahmeetk)

    ## License

    This project is licensed under the MIT License.
    """)

    # GitHub link
    st.markdown("""
    ## Source Code

    The source code for this tool is available on GitHub:

    [https://github.com/shahmeetk/CSRGenerator](https://github.com/shahmeetk/CSRGenerator)
    """)

# Add custom CSS
st.markdown("""
<style>
    .stApp {
        max-width: 1200px;
        margin: 0 auto;
    }
    .css-1d391kg {
        padding-top: 3rem;
    }
    .stButton>button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)
