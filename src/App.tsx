import { useEffect, useState } from 'react'
import './App.css'
import Comments from './Comments';

// Defining the API key and URL for fetching random images from Unsplash
const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
const URL = `https://api.unsplash.com/photos/random?client_id=${API_KEY}&count=5`

// Defining the TypeScript interface for the Unsplash image structure
interface UnsplashImage {
  id: string;
  user: {
    name: string;
  }
  urls: {
    thumb: string;
    regular: string;
  };
  alt_description: string;
  imageId: string;
}

// Main component that fetches and displays a gallery of random Unsplash images
const UnsplashGallery = () => {
  // Defining the initial state to store the fetched Unsplash images
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [selectedImg, setSelectedImg] = useState<UnsplashImage | null>(null);

  // Making a fetch request to the Unsplash API to get random images
  useEffect(() => {
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        setImages(data)
      })
      .catch(error => console.error('Error when getting images', error));
  }, []);

  // Function to extract keywords from the image description for tags
  const getKeywords = (description: string) => {
    return description
      ?.toLowerCase()
      .split(" ")
      .filter(word => word.length > 3 && !word.match(/very|with|through/)) // Filter to ignore common words
      .slice(0, 5); // 5 tags max
  };

  // Rendering the fetched images and displaying their descriptions and authors
  return (
    <div>
      <h1>Gallery Images</h1>
      <div className="gallery">
        {images.map((image) => (
          <figure key={image.id}>
            <img src={image.urls.thumb} alt={image.alt_description} onClick={() => setSelectedImg(image)} />
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
            <span className="close" onClick={() => setSelectedImg(null)}>
              &times;
            </span>
            <img src={selectedImg.urls.regular} alt={selectedImg.alt_description} />
            <h2>{selectedImg.alt_description}</h2>
            <h3>Author: {selectedImg.user.name}</h3>
            <p>Tags: {getKeywords(selectedImg.alt_description).join(", ")}</p>
            <Comments imageId={selectedImg.id}/>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnsplashGallery
