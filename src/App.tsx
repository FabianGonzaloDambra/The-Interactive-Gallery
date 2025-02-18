import { useEffect, useState } from 'react'
import './App.css'

//Getting the needed information from Unsplash
const API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
const URL = `https://api.unsplash.com/photos/random?client_id=${API_KEY}&count=5`

//Setting variable types
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
}

//Main Function
const UnsplashGallery = () => {
  //Defining Initial State for the images
  const [images, setImages] = useState<UnsplashImage[]>([]);

  //Requesting fetch
  useEffect(() => {
    fetch(URL)
      .then(response => response.json())
      .then(data => {
        setImages(data)
        console.log(data)
      })
      .catch(error => console.error("Error when getting images", error));
  }, []);

  return <>
    {images.map(image =>
      <figure key={image.id}>
        <img
          src={image.urls.thumb}
          alt={image.alt_description}
        />
        <figcaption>
          <h2>{image.alt_description}</h2>
          <p>{image.user.name}</p>
        </figcaption>
      </figure>
    )}
  </>
}

export default UnsplashGallery
