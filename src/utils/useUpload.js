import { useState } from 'react';
import { Alert } from 'react-native';

const useUpload = () => {
  const [loading, setLoading] = useState(false);

  const upload = async ({ reactNativeAsset }) => {
    setLoading(true);

    // 1. Get Keys (with fallbacks for safety)
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "daksmmbli";
    const preset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "campusone_unsigned";
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log("Starting XHR Upload to:", cloudName);

    return new Promise((resolve) => {
      // 2. Use XMLHttpRequest instead of fetch
      // This bypasses the "Unsupported FormDataPart" error in Expo
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadUrl);

      // 3. Handle Success
      xhr.onload = () => {
        setLoading(false);
        if (xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          console.log("XHR Success:", result.secure_url);
          resolve({ url: result.secure_url, error: null });
        } else {
          // Parse Cloudinary Error
          try {
            const errorResp = JSON.parse(xhr.responseText);
            const msg = errorResp.error?.message || "Unknown Cloudinary Error";
            console.error("XHR Failed:", msg);
            Alert.alert("Upload Failed", msg);
            resolve({ url: null, error: msg });
          } catch (e) {
            console.error("XHR Parse Error:", xhr.responseText);
            Alert.alert("Upload Error", "Invalid response from server");
            resolve({ url: null, error: "Invalid response" });
          }
        }
      };

      // 4. Handle Network Errors
      xhr.onerror = (e) => {
        setLoading(false);
        console.error("XHR Network Error:", e);
        Alert.alert("Connection Error", "Check your internet connection.");
        resolve({ url: null, error: "Network request failed" });
      };

      // 5. Construct Data (Standard RN Format)
      const data = new FormData();
      data.append('file', {
        uri: reactNativeAsset.uri,
        type: 'image/jpeg', // Hardcoded to ensure compatibility
        name: 'upload.jpg',
      });
      data.append('upload_preset', preset);
      data.append('cloud_name', cloudName);

      // 6. Send
      xhr.send(data);
    });
  };

  return [upload, { loading }];
};

export default useUpload;