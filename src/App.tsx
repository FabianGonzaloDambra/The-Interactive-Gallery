import { useEffect, useState } from 'react';
import './App.css';
import Comments from './Comments';
import AuthApp from './AuthApp';

// API key and URL for fetching random images from Unsplash
const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
const URL = `https://api.unsplash.com/photos/random?client_id=${API_KEY}&count=5`; // Removed page from URL for continuous fetch

// TypeScript interface for Unsplash image structure
interface UnsplashImage {
  id: string;
  user: {
    name: string;
  };
  urls: {
    thumb: string;
    regular: string;
  };
  alt_description: string;
  imageId: string;
  likes: number; // Add likes field
}

// Main component for displaying a gallery of random Unsplash images
const UnsplashGallery = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImg, setSelectedImg] = useState<UnsplashImage | null>(null);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(""); // Error message

  // Fetch random images from Unsplash API
  const fetchImages = async () => {
    if (loading) return; // Don't fetch if already loading

    setLoading(true);
    setError(""); // Reset any previous errors

    try {
      const response = await fetch(URL);
      if (!response.ok) throw new Error("Error fetching images");

      const data = await response.json();
      if (data.length === 0) {
        setError("No more images available.");
        return;
      }

      setImages(prevImages => [...prevImages, ...data]); // Add new images to the state
    } catch (err) {
      setError(`Error loading images: ${err}`);
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  useEffect(() => {
    fetchImages(); // Initial fetch
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(storedUser); // Load user from localStorage
  }, []);

  // Detect when the user scrolls to the bottom with a margin of 100px
  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Calculate the distance from the bottom of the container
    const scrollBottom = target.scrollHeight - target.scrollTop;
    const distanceToBottom = target.clientHeight; // Height of the visible area

    // Define a margin, e.g., 100px before the bottom to start loading more images
    const margin = 100;

    // Check if we are within the margin of the bottom
    if (scrollBottom <= distanceToBottom + margin && !loading && !error) {
      await fetchImages(); // Fetch images when we reach the bottom
    }
  };

  // Function to handle likes
  // Function to handle likes and update the selected image
const handleLike = (imageId: string) => {
  setImages(prevImages => {
    // Update the images array and update the selected image if it's the same
    const updatedImages = prevImages.map(image =>
      image.id === imageId
        ? { ...image, likes: image.likes + 1 } // Increment likes if image matches
        : image
    );

    // If the selected image is the one being liked, update it too
    if (selectedImg?.id === imageId) {
      setSelectedImg(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    }

    return updatedImages;
  });
};


  // Extract keywords from image description to generate tags
  const getKeywords = (description: string) => {
    return description
      ?.toLowerCase()
      .split(" ")
      .filter(word => word.length > 3 && !word.match(/very|with|through/)) // Ignore common words
      .slice(0, 5); // Limit to 5 tags max
  };

  return (
    <div>
      <h1>Gallery Images</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div
        style={{ maxHeight: "80vh", overflowY: "auto" }}
        onScroll={handleScroll} // Add scroll event listener
      >
        <div className="gallery">
          {images.map((image) => (
            <figure key={image.id}>
              {/* Clicking on an image opens the modal */}
              <img
                src={image.urls.thumb}
                alt={image.alt_description}
                onClick={() => setSelectedImg(image)}
              />
              <figcaption>
                <h2>{image.alt_description}</h2>
                <p>{image.user.name}</p>

                {/* Like button */}
                <button onClick={() => handleLike(image.id)}>
                  👍 Like ({image.likes})
                </button>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Show loading indicator when fetching more images */}
        {loading && <p>Loading more images...</p>}
      </div>

      {/* Modal for displaying selected image details */}
      {selectedImg && (
        <div className="modal">
          <div className="modal-content">
            {/* Close button */}
            <span className="close" onClick={() => setSelectedImg(null)}>
              &times;
            </span>
            <h2>{selectedImg.alt_description}</h2>
            <img src={selectedImg.urls.regular} alt={selectedImg.alt_description} />
            <h3>Author: {selectedImg.user.name}</h3>
            <p>Tags: {getKeywords(selectedImg.alt_description).join(", ")}</p>

            {/* Like button in modal */}
            <button onClick={() => handleLike(selectedImg.id)}>
              👍 Like ({selectedImg.likes})
            </button>

            {/* Comments component with the selected image ID */}
            <AuthApp user={user} setUser={setUser} />
            {user && <Comments user={user} imageId={selectedImg.id} />}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnsplashGallery;
