/**
 * Digital Signature utilities for PDF generation
 * This is a stub implementation for build purposes
 */

export interface DigitalSignature {
  id: string
  name: string
  timestamp: string
  content: string
}

export interface SignIncidentReportOptions {
  incidentId: string
  signerName: string
  signerRole: string
  timestamp?: Date
}

/**
 * Mock digital signature generator
 */
export function signIncidentReport(options: SignIncidentReportOptions): DigitalSignature {
  const timestamp = options.timestamp || new Date()
  
  return {
    id: `sig_${options.incidentId}_${timestamp.getTime()}`,
    name: options.signerName,
    timestamp: timestamp.toISOString(),
    content: `Digital signature for incident ${options.incidentId} signed by ${options.signerName} (${options.signerRole})`
  }
}

/**
 * Verify digital signature (mock implementation)
 */
export function verifySignature(signature: DigitalSignature): boolean {
  // Mock verification - always returns true
  return Boolean(signature.id && signature.name && signature.timestamp)
}

/**
 * Generate signature hash (mock implementation)
 */
export function generateSignatureHash(data: string): string {
  // Mock hash generation
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}
