import { decode } from 'base64-arraybuffer';
import { File } from 'expo-file-system';
import { supabase } from '../lib/supabase';
import { supabaseUrl } from '../constants';

export const getUserImageSrc = imagePath => {
  if (imagePath) {
    return getSupabaseFileUrl(imagePath);
  } else {
    return require('../assets/images/defaultUser.png')
  }
}

export const getSupabaseFileUrl = filePath => {
  if(filePath){
    return {uri: `${supabaseUrl}/storage/v1/object/public/uploads/${filePath}`}
  }
  return null;
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
  try {
    let fileName = getFilePath(folderName, isImage)
    
    // Use the new File API
    const file = new File(fileUri);
    const fileBase64 = await file.base64();

    let imageData = decode(fileBase64);
    let {data, error} = await supabase
    .storage
    .from('uploads').upload(fileName, imageData, {
      cacheControl: '3600',
      upsert: false,
      contentType: isImage ? 'image/*' : 'video/*',
    });

    if (error) {
       console.log('file upload error: ', error)
        return {
          success: false,
          message: 'Error uploading files'
    }
    } 

    // console.log('data: ', data);

    return {
      success: true,
      data: data.path
    }
  } catch (error) {
    console.log('file upload error: ', error)
    return {
      success: false,
      message: 'Error uploading files'
    }
  }
}

export const getFilePath = (folderName, isImage) => {
  return `${folderName}/${(new Date()).getTime()}${isImage ? '.png' : '.mp4'}`
}