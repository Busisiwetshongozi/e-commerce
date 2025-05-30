import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './Products.css';

const Products = () => {
  // ... (keep all your existing state and effect hooks) ...

  return (
    <div className="container my-4">
      <h2 className="mb-3">All Products</h2>

      <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3">
        {filteredProducts.map((product) => {
          const discountedPrice =
            product.discountPercentage > 0
              ? product.price * (1 - product.discountPercentage / 100)
              : product.price;

          return (
            <div key={product.id} className="col">
              <div
                className="card h-100 shadow-sm product-card"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {product.imageUrls?.[0] && (
                  <img
                    src={product.imageUrls[0]}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '150px', objectFit: 'cover' }}
                  />
                )}
                <div className="card-body p-2">
                  <span
                    className={`badge mb-1 ${
                      product.condition === 'new'
                        ? 'bg-success'
                        : product.condition === 'used'
                        ? 'bg-warning text-dark'
                        : product.condition === 'damaged'
                        ? 'bg-danger'
                        : 'bg-secondary'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    {product.condition.replace('_', ' ')}
                  </span>

                  <h6 className="card-title mb-1" style={{ fontSize: '0.9rem' }}>
                    {product.name}
                  </h6>
                  <p className="card-subtitle mb-1 text-muted" style={{ fontSize: '0.75rem' }}>
                    {product.brand} {product.model}
                  </p>

                  <div className="product-pricing mb-1">
                    {product.discountPercentage > 0 ? (
                      <div style={{ fontSize: '0.8rem' }}>
                        <span className="badge bg-danger me-1" style={{ fontSize: '0.6rem' }}>
                          {product.discountPercentage}% OFF
                        </span>
                        <div>
                          <span className="text-decoration-line-through text-muted me-2">
                            R{product.price.toFixed(2)}
                          </span>
                          <span className="fw-bold">R{discountedPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                        R{product.price.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="discount-controls mt-2">
                    <div className="input-group input-group-sm">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="%"
                        min="1"
                        max="90"
                        style={{ fontSize: '0.75rem' }}
                        value={discountInputs[product.id] ?? product.discountPercentage ?? ''}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleInputChange(product.id, e.target.value)}
                      />
                      <button
                        className={`btn btn-sm ${
                          product.discountPercentage > 0
                            ? 'btn-outline-danger'
                            : 'btn-outline-primary'
                        }`}
                        style={{ fontSize: '0.7rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const value = discountInputs[product.id] || 0;
                          handleApplyDiscount(product.id, value);
                        }}
                      >
                        {product.discountPercentage > 0 ? 'Update' : 'Apply'}
                      </button>
                      {product.discountPercentage > 0 && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          style={{ fontSize: '0.7rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyDiscount(product.id, 0);
                            handleInputChange(product.id, '');
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="card-footer bg-transparent p-2">
                  <button
                    className="btn btn-success btn-sm w-100"
                    style={{ fontSize: '0.8rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({
                        ...product,
                        originalPrice: product.price,
                        price: discountedPrice,
                      });
                      alert(`${product.name} added to cart!`);
                    }}
                    disabled={product.stockQuantity === 0}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Products;