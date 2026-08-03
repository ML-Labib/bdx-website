// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Vite environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Uploads a cropped 300x300 PNG image Blob to Supabase Storage ('bdx-bucket')
 * 
 * @param {Blob} blob - PNG Blob from cropUtils
 * @param {string} userId - User identifier string
 * @returns {Promise<string>} Public URL of saved PNG avatar
 */
export const uploadAvatarToSupabase = async (blob, userId) => {
    if (!blob) throw new Error("No image blob provided for upload.");

    // Save with .png extension
    const fileName = `players/${userId}-${Date.now()}.png`;

    const { data, error: uploadError } = await supabase.storage
        .from('bdx-bucket')
        .upload(fileName, blob, {
            contentType: 'image/png', // Sets MIME type to image/png
            upsert: true,
        });

    if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        throw uploadError;
    }

    const { data: publicUrlData } = supabase.storage
        .from('bdx-bucket')
        .getPublicUrl(fileName);

    if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to generate public URL from Supabase Storage.");
    }

    return publicUrlData.publicUrl;
};