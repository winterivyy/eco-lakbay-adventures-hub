import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

const fallbackImage = "/placeholder.svg?height=200&width=300";

interface Destination {
  id: string;
  business_name: string;
  description: string;
  images: string[] | null;
}

interface Review {
  id: string;
  rating: number;
  review: string;
  created_at: string;
  profiles?: { full_name: string; avatar_url: string | null };
}

export default function DestinationsPreview() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsCache, setReviewsCache] = useState<Record<string, Review[]>>({});

  const getImage = (images: string[] | null) =>
    Array.isArray(images) && images.length > 0 ? images[0] : fallbackImage;

  const fetchDestinations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("destinations")
      .select("*")
      .eq("approval_status", "approved");

    if (!error && data) setDestinations(data as Destination[]);
    setLoading(false);
  };

  const fetchReviews = async (destinationId: string) => {
    if (reviewsCache[destinationId]) {
      setReviews(reviewsCache[destinationId]);
      return;
    }
    setReviewsLoading(true);
    const { data, error } = await supabase
      .from("destination_ratings")
      .select(`*, profiles (full_name, avatar_url)`)
      .eq("destination_id", destinationId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as Review[]);
      setReviewsCache((prev) => ({ ...prev, [destinationId]: data as Review[] }));
    }
    setReviewsLoading(false);
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const handleOpenModal = (destination: Destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(true);
    fetchReviews(destination.id);
  };

  return (
    <div className="p-6">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden">
              <img
                src={getImage(destination.images)}
                alt={destination.business_name}
                className="h-48 w-full object-cover"
              />
              <CardHeader>
                <CardTitle>{destination.business_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3">
                  {destination.description}
                </p>
                <button
                  onClick={() => handleOpenModal(destination)}
                  className="mt-4 text-primary underline"
                >
                  View Details & Reviews
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDestination?.business_name}</DialogTitle>
          </DialogHeader>
          <p>{selectedDestination?.description}</p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Reviews</h3>
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="flex items-start gap-3 mb-4">
                  <Avatar>
                    <AvatarImage src={review.profiles?.avatar_url || ""} />
                    <AvatarFallback>
                      {review.profiles?.full_name
                        ? review.profiles.full_name.charAt(0).toUpperCase()
                        : "🌱"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{review.profiles?.full_name || "Anonymous"}</p>
                    <p className="text-sm text-muted-foreground">{review.review}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
