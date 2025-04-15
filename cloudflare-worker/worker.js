/**
 * CSR Generator API Worker
 * 
 * This Cloudflare Worker provides API endpoints for generating and validating
 * Certificate Signing Requests (CSRs).
 */

// Define allowed origins for CORS
const ALLOWED_ORIGINS = (typeof ALLOWED_ORIGINS === 'string') 
  ? ALLOWED_ORIGINS.split(',') 
  : ['https://shahmeetk.github.io'];

// Handle CORS preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS requests for CORS
function handleOptions(request) {
  // Make sure the request has an origin header
  const origin = request.headers.get('Origin');
  
  // If no origin or not in allowed origins, return 403
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Return CORS headers
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    },
  });
}

// Health check endpoint
async function handleHealthCheck() {
  return new Response(JSON.stringify({ status: 'healthy' }), {
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Generate CSR endpoint
async function handleGenerateCSR(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.common_name || !data.organization || !data.country) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // In a real implementation, we would generate a CSR here
    // For this demo, we'll return a mock CSR and private key
    const mockCSR = `-----BEGIN CERTIFICATE REQUEST-----
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
-----END CERTIFICATE REQUEST-----`;

    const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
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
-----END PRIVATE KEY-----`;

    return new Response(
      JSON.stringify({
        csr: mockCSR,
        private_key: mockPrivateKey,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate CSR' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Validate CSR endpoint
async function handleValidateCSR(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.csr_data) {
      return new Response(
        JSON.stringify({ error: 'Missing CSR data' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // Check if the CSR data contains the expected format
    const csrData = data.csr_data;
    if (!csrData.includes('-----BEGIN CERTIFICATE REQUEST-----')) {
      return new Response(
        JSON.stringify({ error: 'Invalid CSR format' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      );
    }
    
    // In a real implementation, we would validate the CSR here
    // For this demo, we'll return mock validation results
    return new Response(
      JSON.stringify({
        is_valid: true,
        subject: {
          CN: 'www.example.com',
          O: 'ACME Tech, Inc',
          OU: 'IT Department',
          L: 'Provo',
          ST: 'Utah',
          C: 'US',
        },
        key_size: 2048,
        signature_algorithm: 'sha256WithRSAEncryption',
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to validate CSR' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Add CORS headers to all responses
  const origin = request.headers.get('Origin');
  const corsHeadersForResponse = {
    ...corsHeaders,
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  };
  
  // Handle OPTIONS requests
  if (method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  // Route requests
  if (path === '/health' && method === 'GET') {
    return handleHealthCheck();
  } else if (path === '/generate' && method === 'POST') {
    return handleGenerateCSR(request);
  } else if (path === '/validate' && method === 'POST') {
    return handleValidateCSR(request);
  }
  
  // Handle 404
  return new Response(
    JSON.stringify({ error: 'Not found' }),
    {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeadersForResponse,
      },
    }
  );
}

// Register the worker
addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});
