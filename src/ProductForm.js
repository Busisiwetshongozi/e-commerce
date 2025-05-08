import React, { useState } from 'react';

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    description: '',
    price: '',
    stockQuantity: '',
    condition: 'NEW',
    batteryHealth: '',
    storage: '',
    color: '',
    imageUrls: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestData = {
      ...product,
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const data = await response.json();
        alert('Product created: ' + data.name);
      } else {
        alert('Failed to create product.');
      }
    } catch (error) {
      console.error('Error creating product', error);
      alert('Failed to create product.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="form-control"
            placeholder="Name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="brand" className="form-label">Brand</label>
          <input
            type="text"
            name="brand"
            id="brand"
            className="form-control"
            placeholder="Brand"
            value={product.brand}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="model" className="form-label">Model</label>
          <input
            type="text"
            name="model"
            id="model"
            className="form-control"
            placeholder="Model"
            value={product.model}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            name="category"
            id="category"
            className="form-control"
            placeholder="Category"
            value={product.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            name="description"
            id="description"
            className="form-control"
            placeholder="Description"
            value={product.description}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="price" className="form-label">Price</label>
          <input
            type="number"
            name="price"
            id="price"
            className="form-control"
            placeholder="Price"
            value={product.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="stockQuantity" className="form-label">Stock Quantity</label>
          <input
            type="number"
            name="stockQuantity"
            id="stockQuantity"
            className="form-control"
            placeholder="Stock Quantity"
            value={product.stockQuantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="condition" className="form-label">Condition</label>
          <select
            name="condition"
            id="condition"
            className="form-control"
            value={product.condition}
            onChange={handleChange}
          >
            <option value="NEW">New</option>
            <option value="REFURBISHED">Refurbished</option>
            <option value="USED_GOOD">Used - Good</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="batteryHealth" className="form-label">Battery Health (%)</label>
          <input
            type="number"
            name="batteryHealth"
            id="batteryHealth"
            className="form-control"
            placeholder="Battery Health"
            value={product.batteryHealth}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="storage" className="form-label">Storage</label>
          <input
            type="text"
            name="storage"
            id="storage"
            className="form-control"
            placeholder="Storage (e.g., 128GB)"
            value={product.storage}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="color" className="form-label">Color</label>
          <input
            type="text"
            name="color"
            id="color"
            className="form-control"
            placeholder="Color"
            value={product.color}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="imageUrls" className="form-label">Image URLs</label>
          <input
            type="text"
            name="imageUrls"
            id="imageUrls"
            className="form-control"
            placeholder="Image URLs"
            value={product.imageUrls}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">Create Product</button>
      </form>
    </div>
  );
};

export default ProductForm;
