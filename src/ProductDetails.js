import React, { useState } from 'react';

const ProductForm = () => {
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    // other fields...
  });

  const [images, setImages] = useState([]); // for file input

  const handleChange = (e) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]); // support multiple images
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(productData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    images.forEach((img, i) => {
      formData.append('images', img); // "images" must match backend param
    });

    try {
      const res = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Product upload failed');

      alert('Product created!');
    } catch (err) {
      alert('❌ ' + err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="text" name="name" value={productData.name} onChange={handleChange} />
      <textarea name="description" value={productData.description} onChange={handleChange} />
      <input type="number" name="price" value={productData.price} onChange={handleChange} />

      {/* Multiple images */}
      <input type="file" name="images" accept="image/*" multiple onChange={handleImageChange} />

      <button type="submit">Create Product</button>
    </form>
  );
};

export default ProductForm;
