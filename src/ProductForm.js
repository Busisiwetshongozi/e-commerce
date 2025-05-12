import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './Firebase';

const ProductForm = () => {
  const [product, setProduct] = useState({
    name: '',
    brand: '',
    model: '',
    category: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    condition: 'NEW',
    batteryHealth: 0,
    storage: '',
    color: '',
    imageUrls: []
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' || name === 'batteryHealth' 
        ? Number(value) 
        : value
    }));
  };

  const handleFileChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const uploadImages = async () => {
    setIsUploading(true);
    const uploadedUrls = [];
    
    try {
      for (const file of imageFiles) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        uploadedUrls.push(url);
        setUploadProgress(Math.round((uploadedUrls.length / imageFiles.length) * 100));
      }
      return uploadedUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let imageUrls = [...product.imageUrls];
      if (imageFiles.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const response = await fetch('http://localhost:8080/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, imageUrls })
      });

      if (response.ok) {
        const data = await response.json();
        showAlert(`Product "${data.name}" created successfully with ${imageUrls.length} images!`, 'success');
        resetForm();
      } else {
        throw new Error(await response.text());
      }
    } catch (error) {
      showAlert(error.message || 'Failed to create product', 'danger');
    }
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const resetForm = () => {
    setProduct({
      name: '',
      brand: '',
      model: '',
      category: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      condition: 'NEW',
      batteryHealth: 0,
      storage: '',
      color: '',
      imageUrls: []
    });
    setImageFiles([]);
    setUploadProgress(0);
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Create Product</h2>

      {alert.show && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
          {alert.message}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setAlert({ ...alert, show: false })}
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row mb-3">
          <div className="col-md-6">
            <label htmlFor="brand" className="form-label">Brand</label>
            <input
              type="text"
              className="form-control"
              id="brand"
              name="brand"
              value={product.brand}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="model" className="form-label">Model</label>
            <input
              type="text"
              className="form-control"
              id="model"
              name="model"
              value={product.model}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="category" className="form-label">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="3"
            value={product.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="price" className="form-label">Price ($)</label>
            <input
              type="number"
              className="form-control"
              id="price"
              name="price"
              step="0.01"
              min="0"
              value={product.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="stockQuantity" className="form-label">Stock Quantity</label>
            <input
              type="number"
              className="form-control"
              id="stockQuantity"
              name="stockQuantity"
              min="0"
              value={product.stockQuantity}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="condition" className="form-label">Condition</label>
            <select
              className="form-select"
              id="condition"
              name="condition"
              value={product.condition}
              onChange={handleChange}
            >
              <option value="NEW">New</option>
              <option value="REFURBISHED">Refurbished</option>
              <option value="USED_GOOD">Used - Good</option>
            </select>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-md-4">
            <label htmlFor="batteryHealth" className="form-label">Battery Health (%)</label>
            <input
              type="number"
              className="form-control"
              id="batteryHealth"
              name="batteryHealth"
              min="0"
              max="100"
              value={product.batteryHealth}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="storage" className="form-label">Storage</label>
            <input
              type="text"
              className="form-control"
              id="storage"
              name="storage"
              value={product.storage}
              onChange={handleChange}
              placeholder="e.g., 128GB"
            />
          </div>
          <div className="col-md-4">
            <label htmlFor="color" className="form-label">Color</label>
            <input
              type="text"
              className="form-control"
              id="color"
              name="color"
              value={product.color}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="images" className="form-label">Product Images</label>
          <input
            type="file"
            className="form-control"
            id="images"
            multiple
            onChange={handleFileChange}
            accept="image/*"
          />
          <div className="form-text">Upload multiple images (max 5MB each)</div>

          {imageFiles.length > 0 && (
            <div className="mt-2">
              <strong>Selected files:</strong>
              <ul className="list-unstyled">
                {imageFiles.map((file, index) => (
                  <li key={index}>{file.name} ({Math.round(file.size / 1024)}KB)</li>
                ))}
              </ul>
            </div>
          )}

          {isUploading && (
            <div className="mt-2">
              <div className="progress">
                <div 
                  className="progress-bar progress-bar-striped" 
                  role="progressbar" 
                  style={{ width: `${uploadProgress}%` }}
                >
                  {uploadProgress}%
                </div>
              </div>
              <small>Uploading images...</small>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label htmlFor="imageUrls" className="form-label">OR Enter Image URLs (comma separated)</label>
          <input
            type="text"
            className="form-control"
            id="imageUrls"
            value={product.imageUrls.join(', ')}
            onChange={(e) => setProduct({
              ...product,
              imageUrls: e.target.value.split(',').map(url => url.trim())
            })}
            placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
          />
        </div>

        <div className="d-grid">
          <button 
            type="submit" 
            className="btn btn-primary btn-lg"
            disabled={isUploading}
          >
            {isUploading ? 'Creating Product...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
