import unittest
import json
from main import app

class TestCSRGenerator(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_root_endpoint(self):
        """Test the root endpoint returns the expected message"""
        response = self.app.get('/')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['message'], 'Welcome to CSR Generator API')

    def test_health_endpoint(self):
        """Test the health endpoint returns healthy status"""
        response = self.app.get('/health')
        data = json.loads(response.data)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data['status'], 'healthy')
        self.assertIn('timestamp', data)

    def test_generate_csr_endpoint(self):
        """Test the generate CSR endpoint"""
        payload = {
            "common_name": "test.example.com",
            "organization": "Test Organization",
            "organizational_unit": "IT Department",
            "locality": "Test City",
            "state": "Test State",
            "country": "US",
            "email": "test@example.com",
            "key_size": 2048,
            "service": "NI-3DS",
            "environment": "PROD"
        }
        response = self.app.post('/generate', json=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('csr', data)
        self.assertIn('private_key', data)
        self.assertIn('-----BEGIN CERTIFICATE REQUEST-----', data['csr'])
        self.assertIn('-----END CERTIFICATE REQUEST-----', data['csr'])
        self.assertIn('-----BEGIN PRIVATE KEY-----', data['private_key'])
        self.assertIn('-----END PRIVATE KEY-----', data['private_key'])

    def test_validate_csr_endpoint(self):
        """Test the validate CSR endpoint"""
        # First generate a CSR to validate
        generate_payload = {
            "common_name": "test.example.com",
            "organization": "Test Organization",
            "country": "US",
            "service": "NI-3DS",
            "environment": "PROD"
        }
        generate_response = self.app.post('/generate', json=generate_payload)
        generate_data = json.loads(generate_response.data)

        # Now validate the generated CSR
        validate_payload = {
            "csr_data": generate_data['csr']
        }
        validate_response = self.app.post('/validate', json=validate_payload)
        validate_data = json.loads(validate_response.data)

        self.assertEqual(validate_response.status_code, 200)
        self.assertIn('subject', validate_data)
        self.assertIn('key_size', validate_data)
        self.assertIn('signature_algorithm', validate_data)
        self.assertEqual(validate_data['subject']['CN'], 'test.example.com')
        self.assertEqual(validate_data['subject']['O'], 'Test Organization')
        self.assertEqual(validate_data['subject']['C'], 'US')

if __name__ == '__main__':
    unittest.main()
