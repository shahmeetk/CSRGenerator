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
    initial_sidebar_state="expanded",
)

# Sidebar navigation
st.sidebar.title("CSR Generator Tool")
page = st.sidebar.radio(
    "Navigation",
    ["Home", "Generator", "Validator", "Extractor", "About"],
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

# Home page
if page == "Home":
    st.title("CSR Generator Tool")
    st.markdown("""
    A comprehensive Certificate Signing Request (CSR) management tool with AI-powered features.

    ### Features

    - **CSR Generation**: Create CSRs for different services and environments
    - **CSR Validation**: Validate existing CSRs for correctness
    - **Information Extraction**: Extract and display CSR details
    - **AI Assistance**: Get intelligent suggestions for domain names and configurations

    ### Getting Started

    Use the sidebar to navigate between different features of the tool.
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
        st.subheader("🔍 Information Extractor")
        st.write("Extract and display CSR details.")
        if st.button("Go to Extractor", key="ext_btn"):
            st.session_state.page = "Extractor"
            st.experimental_rerun()

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
                ["NI-3DS", "NI-API", "NI-3DS-CALLBACK", "NI-MLE", "CUSTOM"],
                help="Select the service for which you want to generate a CSR"
            )

            environment = st.selectbox(
                "Environment",
                ["PROD", "UAT", "DEV"],
                help="Select the environment for which you want to generate a CSR"
            )

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
                value="Network International Arabia Limited Co.",
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

# Extractor page
elif page == "Extractor":
    st.title("CSR Information Extractor")
    st.markdown("Extract and display detailed information from your Certificate Signing Requests (CSRs).")

    # Input for CSR
    csr_input = st.text_area("Paste your CSR (PEM format)", height=200)

    # Upload CSR file
    uploaded_file = st.file_uploader("Or upload a CSR file", type=["csr", "pem", "txt"])

    if uploaded_file is not None:
        csr_input = uploaded_file.getvalue().decode("utf-8")

    if st.button("Extract Information"):
        if not csr_input:
            st.error("Please provide a CSR to extract information from")
        else:
            with st.spinner("Extracting information..."):
                try:
                    csr_info = parse_csr(csr_input)

                    if csr_info:
                        # Display CSR information
                        st.subheader("CSR Information")

                        # Subject information
                        st.write("**Subject Information**")
                        for key, value in csr_info["subject"].items():
                            st.write(f"- {key}: {value}")

                        # Key information
                        st.write(f"**Key Size**: {csr_info['key_size']} bits")
                        st.write(f"**Signature Algorithm**: {csr_info['signature_algorithm']}")

                        # JSON representation
                        st.subheader("JSON Representation")
                        st.json(csr_info)

                        # Download JSON
                        json_str = json.dumps(csr_info, indent=2)
                        json_b64 = base64.b64encode(json_str.encode()).decode()
                        json_href = f'<a href="data:application/json;base64,{json_b64}" download="csr_info.json">Download JSON</a>'
                        st.markdown(json_href, unsafe_allow_html=True)

                except Exception as e:
                    st.error(f"Error extracting information: {str(e)}")

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
