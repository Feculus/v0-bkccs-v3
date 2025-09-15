-- Add signature column to vehicles table to store base64 signature data
ALTER TABLE vehicles ADD COLUMN signature_data TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN vehicles.signature_data IS 'Base64 encoded signature image for liability waiver';
