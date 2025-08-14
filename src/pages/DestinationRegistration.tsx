import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export default function DestinationRegistration() {
  const navigate = useNavigate();
  const [destinationName, setDestinationName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // For uploaded images
  const [permits, setPermits] = useState([]); // For uploaded permits
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userId = "CURRENT_USER_ID"; // Replace with actual auth context

  const handleImagesUploaded = (uploadedImages) => {
    setImages((prev) => [...prev, ...uploadedImages]);
  };

  const handlePermitsUploaded = (uploadedPermits) => {
    setPermits((prev) => [...prev, ...uploadedPermits]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // 1. Create destination
      const { data: destinationData, error: destinationError } = await supabase
        .from("destinations")
        .insert({
          name: destinationName,
          description,
          user_id: userId,
        })
        .select()
        .single();

      if (destinationError) throw destinationError;

      // 2. Link uploaded images to this destination
      if (images.length > 0) {
        const imageIds = images.map((img) => img.id);
        const { error: updateImagesError } = await supabase
          .from("destination_images")
          .update({ destination_id: destinationData.id })
          .in("id", imageIds);

        if (updateImagesError) throw updateImagesError;
      }

      // 3. Link uploaded permits to this destination
      if (permits.length > 0) {
        const permitIds = permits.map((p) => p.id);
        const { error: updatePermitsError } = await supabase
          .from("destination_permits")
          .update({ destination_id: destinationData.id })
          .in("id", permitIds);

        if (updatePermitsError) throw updatePermitsError;
      }

      navigate("/success");
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navigation />
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Register Destination</h1>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Destination Images Upload */}
          <ImageUpload userId={userId} onImagesUploaded={handleImagesUploaded} />

          {/* Permits Upload */}
          <PermitUpload userId={userId} onPermitsUploaded={handlePermitsUploaded} />

          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </div>
      <Footer />
    </>
  );
}

function ImageUpload({ userId, onImagesUploaded }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedImages = [];

    try {
      for (const file of files) {
        const filePath = `${userId}/${Date.now()}-${file.name}`;
        const { error: storageError } = await supabase.storage
          .from("destination-images")
          .upload(filePath, file);

        if (storageError) throw storageError;

        const { data: insertedImage, error: insertError } = await supabase
          .from("destination_images")
          .insert({
            user_id: userId,
            file_path: filePath,
            destination_id: null,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        uploadedImages.push(insertedImage);
      }

      onImagesUploaded(uploadedImages);
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Upload Destination Images</Label>
      <Input type="file" accept="image/*" multiple onChange={handleFileChange} />
      {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}

function PermitUpload({ userId, onPermitsUploaded }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const permitType = file.name.split(".")[0].toLowerCase();

    try {
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from("permits")
        .upload(filePath, file);

      if (storageError) throw storageError;

      const { data: insertedPermit, error: insertError } = await supabase
        .from("destination_permits")
        .insert({
          user_id: userId,
          permit_type: permitType,
          file_path: filePath,
          destination_id: null,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onPermitsUploaded([insertedPermit]);
    } catch (err) {
      console.error("Permit upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label>Upload Permit</Label>
      <Input type="file" accept="image/*" onChange={handleFileChange} />
      {isUploading && <p className="text-sm text-gray-500">Uploading...</p>}
    </div>
  );
}
