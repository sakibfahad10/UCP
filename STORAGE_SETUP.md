# Supabase Storage Setup Guide for Avatars

## Step 1: Create the Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Enter the following details:
   - **Name**: `avatars`
   - **Public bucket**: ✅ Check this box (important!)
5. Click **Create bucket**

## Step 2: Set Bucket Policies

After creating the bucket, we need to set up policies:

1. Click on the **avatars** bucket
2. Go to the **Policies** tab
3. Click **New Policy**
4. For each policy below, click **Create policy** → **For custom SQL**

### Policy 1: Allow authenticated users to insert their own avatars
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 2: Allow authenticated users to update their own avatars
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 3: Allow authenticated users to delete their own avatars
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

### Policy 4: Allow public read access
```sql
CREATE POLICY "Public read access to avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Step 3: Verify Setup

After setting up the bucket and policies, test the upload functionality:
1. Open the Edit Profile dialog
2. Select an image file
3. Click Save Changes
4. Check if the avatar appears in your profile

## Troubleshooting

If you still get errors:
- Make sure the bucket is marked as **Public**
- Verify all 4 policies are created
- Check browser console for specific error messages
- Ensure you're logged in when testing
