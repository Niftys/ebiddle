import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import '../styles/ImageGallery.css';

const ImageGallery = ({ images = [] }) => {
  const [selected, setSelected] = useState(0);

  // Reset selected image when images array changes
  useEffect(() => {
    setSelected(0);
  }, [images]);

  const prevImage = () => setSelected((selected - 1 + images.length) % images.length);
  const nextImage = () => setSelected((selected + 1) % images.length);

  return (
    <div className="image-gallery">
      <div className="thumbnails">
        {images.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`Thumbnail ${idx + 1}`}
            className={selected === idx ? 'thumb selected' : 'thumb'}
            onClick={() => setSelected(idx)}
          />
        ))}
      </div>
      <div className="main-image-container">
      <button className="arrow left" onClick={prevImage}>
        <FiChevronLeft className="gallery-chevron" />
        </button>
        <img className="main-image" src={images[selected]} alt={`Main ${selected + 1}`} />
        <button className="arrow right" onClick={nextImage}>
        <FiChevronRight className="gallery-chevron" />
        </button>
      </div>
    </div>
  );
};

export default ImageGallery;