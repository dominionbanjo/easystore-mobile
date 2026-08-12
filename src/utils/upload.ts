import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface UploadedImage {
  url: string;
  public_id: string;
}

const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/{cloud}/image/upload';

async function uploadToCloudinaryWithSignature(
  uri: string,
  signature: {
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  },
): Promise<UploadedImage> {
  const formData = new FormData();
  const filename = uri.split('/').pop() ?? `upload-${Date.now()}.jpg`;

  formData.append('file', {
    uri,
    name: filename,
    type: 'image/jpeg',
  } as unknown as Blob);
  formData.append('api_key', signature.apiKey);
  formData.append('timestamp', String(signature.timestamp));
  formData.append('signature', signature.signature);
  formData.append('folder', signature.folder);

  const response = await fetch(
    CLOUDINARY_UPLOAD_URL.replace('{cloud}', signature.cloudName),
    {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || 'Upload failed');
  }

  const data = (await response.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url || !data.public_id) {
    throw new Error('Upload response missing URL');
  }
  return { url: data.secure_url, public_id: data.public_id };
}

export async function pickImage(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: false,
    quality: 0.7,
  });
  if (result.canceled || result.assets.length === 0) {
    return null;
  }
  return result.assets[0];
}

export async function takePhoto(): Promise<ImagePicker.ImagePickerAsset | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    quality: 0.7,
  });
  if (result.canceled || result.assets.length === 0) {
    return null;
  }
  return result.assets[0];
}

export async function uploadImage(
  uri: string,
  getSignature: () => Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  }>,
): Promise<UploadedImage> {
  const signature = await getSignature();
  const normalizedUri = Platform.OS === 'android' && uri.startsWith('file://') ? uri : uri;
  return uploadToCloudinaryWithSignature(normalizedUri, signature);
}

export async function pickAndUploadImage(
  getSignature: () => Promise<{
    signature: string;
    timestamp: number;
    cloudName: string;
    apiKey: string;
    folder: string;
  }>,
): Promise<UploadedImage | null> {
  const asset = await pickImage();
  if (!asset) {
    return null;
  }
  return uploadImage(asset.uri, getSignature);
}
