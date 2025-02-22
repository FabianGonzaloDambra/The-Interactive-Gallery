import { useEffect, useState } from 'react';
import './App.css';
import Comments from './Comments';
import AuthApp from './AuthApp';

// API key and URL for fetching random images from Unsplash
const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
const URL = `https://api.unsplash.com/photos/random?client_id=${API_KEY}&count=5`;

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
}

// Main component for displaying a gallery of random Unsplash images
const UnsplashGallery = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImg, setSelectedImg] = useState<UnsplashImage | null>(null);
  const [user, setUser] = useState<string | null>(null);

  // Fetch random images from Unsplash API on component mount
  useEffect(() => {
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        setImages(data);
      })
      .catch(error => console.error('Error fetching images:', error));
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(storedUser); // Load user from localStorage
  }, []);

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
            </figcaption>
          </figure>
        ))}
      </div>

      {/* Modal for displaying selected image details */}
      {selectedImg && (
        <div className="modal">
          <div className="modal-content">
            {/* Close button */}
            <span className="close" onClick={() => setSelectedImg(null)}>
              &times;
            </span>
            <img src={selectedImg.urls.regular} alt={selectedImg.alt_description} />
            <h2>{selectedImg.alt_description}</h2>
            <h3>Author: {selectedImg.user.name}</h3>
            <p>Tags: {getKeywords(selectedImg.alt_description).join(", ")}</p>
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
