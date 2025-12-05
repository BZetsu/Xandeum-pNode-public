import { Request, Response, NextFunction } from 'express';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

/**
 * Middleware to verify Ed25519 signatures from pNodes
 * 
 * The pNode should sign the report data (without signature field) using their keypair.
 * This ensures the report actually comes from the claimed pNode.
 * 
 * Currently optional - can be enabled when xandminerd supports signing.
 */
export function verifySignature(req: Request, res: Response, next: NextFunction): void {
  const { signature, pnode, ...reportData } = req.body;

  // Signature verification mode
  const REQUIRE_SIGNATURE = process.env.REQUIRE_SIGNATURE === 'true';
  
  // If no signature provided
  if (!signature) {
    if (REQUIRE_SIGNATURE) {
      // In production, require signatures
      res.status(401).json({ ok: false, error: 'Signature required for report submission' });
      return;
    }
    // In development, allow unsigned reports for testing
    console.log('[Auth] No signature provided, skipping verification (dev mode)');
    next();
    return;
  }

  if (!pnode?.publicKey) {
    res.status(400).json({ ok: false, error: 'Missing pnode.publicKey' });
    return;
  }

  try {
    // Decode the public key and signature
    const publicKeyBytes = bs58.decode(pnode.publicKey);
    const signatureBytes = bs58.decode(signature);

    // Create the message that was signed (report without signature)
    const message = JSON.stringify({ ...reportData, pnode });
    const messageBytes = new TextEncoder().encode(message);

    // Verify the signature
    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isValid) {
      res.status(401).json({ ok: false, error: 'Invalid signature' });
      return;
    }

    console.log(`[Auth] Valid signature from ${pnode.publicKey.substring(0, 8)}...`);
    next();
  } catch (error) {
    console.error('[Auth] Signature verification error:', error);
    res.status(400).json({ ok: false, error: 'Invalid signature format' });
  }
}



