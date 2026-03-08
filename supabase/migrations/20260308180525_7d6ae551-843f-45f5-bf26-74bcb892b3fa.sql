
-- Add logo_url column to shops
ALTER TABLE public.shops ADD COLUMN logo_url text DEFAULT NULL;

-- Create public storage bucket for shop logos
INSERT INTO storage.buckets (id, name, public) VALUES ('shop-logos', 'shop-logos', true);

-- Allow authenticated users to upload to shop-logos
CREATE POLICY "Authenticated users can upload shop logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'shop-logos');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update shop logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'shop-logos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete shop logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'shop-logos');

-- Allow public read access
CREATE POLICY "Public read access for shop logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'shop-logos');
