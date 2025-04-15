from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Dict, Any, Optional
import OpenSSL.crypto as crypto
import os
import json
from datetime import datetime

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000", "https://shahmeetk.github.io"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Routes
@app.route('/')
def root():
    return jsonify({"message": "Welcome to CSR Generator API"})

@app.route('/generate', methods=['POST'])
def generate_csr():
    try:
        data = request.json

        # Validate required fields
        required_fields = ['common_name', 'organization', 'country', 'service', 'environment']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        # Create a key pair
        key = crypto.PKey()
        key.generate_key(crypto.TYPE_RSA, data.get('key_size', 2048))

        # Create a CSR
        req = crypto.X509Req()
        subject = req.get_subject()

        # Set subject fields
        subject.CN = data['common_name']
        subject.O = data['organization']
        if data.get('organizational_unit'):
            subject.OU = data['organizational_unit']
        if data.get('locality'):
            subject.L = data['locality']
        if data.get('state'):
            subject.ST = data['state']
        subject.C = data['country']
        if data.get('email'):
            subject.emailAddress = data['email']

        # Sign the CSR with the private key
        req.set_pubkey(key)
        req.sign(key, 'sha256')

        # Convert to PEM format
        csr_pem = crypto.dump_certificate_request(crypto.FILETYPE_PEM, req).decode('utf-8')
        key_pem = crypto.dump_privatekey(crypto.FILETYPE_PEM, key).decode('utf-8')

        return jsonify({
            "csr": csr_pem,
            "private_key": key_pem
        })

    except Exception as e:
        return jsonify({"error": f"Error generating CSR: {str(e)}"}), 500

@app.route('/validate', methods=['POST'])
def validate_csr():
    try:
        data = request.json
        csr_data = data.get('csr_data')

        if not csr_data:
            # Try alternative key
            csr_data = data.get('csr')
            if not csr_data:
                return jsonify({"error": "Missing CSR data"}), 400

        # Parse the CSR
        csr = crypto.load_certificate_request(crypto.FILETYPE_PEM, csr_data)

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

        return jsonify({
            "subject": subject_dict,
            "key_size": key_size,
            "signature_algorithm": sig_algo,
            "is_valid": is_valid
        })

    except Exception as e:
        return jsonify({"error": f"Invalid CSR: {str(e)}"}), 400

@app.route('/health')
def health_check():
    return jsonify({"status": "healthy", "timestamp": datetime.now().isoformat()})

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=False)
