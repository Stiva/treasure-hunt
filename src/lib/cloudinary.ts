import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
}

/**
 * Upload a file to Cloudinary
 */
export async function uploadToCloudinary(
  buffer: Buffer,
  resourceType: "image" | "video",
  filename?: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "treasure-hunt-support",
        public_id: filename
          ? `${Date.now()}-${filename.replace(/\.[^/.]+$/, "")}`
          : undefined,
        // Optimize for web
        transformation:
          resourceType === "image"
            ? [{ quality: "auto", fetch_format: "auto" }]
            : undefined,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            resourceType: result.resource_type as "image" | "video",
          });
        } else {
          reject(new Error("Upload failed: no result returned"));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: "image" | "video"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

/**
 * Validate file type
 */
export function getResourceType(
  mimeType: string
): "image" | "video" | null {
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  if (mimeType.startsWith("video/")) {
    return "video";
  }
  return null;
}

/**
 * Max file sizes in bytes
 */
export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
};
