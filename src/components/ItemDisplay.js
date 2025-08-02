import React from 'react';
import { roundToDollar } from '../utils/feedbackUtils';
import ImageGallery from './ImageGallery';
import '../styles/ItemDisplay.css';

const ItemDisplay = ({ item, showPrice }) => {
  return (
    <div className="item-display">
      <div className="item-image">
        <ImageGallery 
          key={item?.id || 'no-id'} 
          images={item?.images || [item?.image]} 
        />
      </div>
      <div className="item-details">
        <h2>{item.title}</h2>
        <div className="item-condition">Condition: Used</div>
        
        {showPrice && (
          <div className="actual-price">
            <div>Original Price: ${item.price.toFixed(2)}</div>
            <div className="rounded-price">
              Rounded Price: ${roundToDollar(item.price)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDisplay;