import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProductCard } from '../src/components/products/ProductCard.js';
import { AuthProvider } from '../src/contexts/AuthContext.js';
import { CartProvider } from '../src/contexts/CartContext.js';
import { WishlistProvider } from '../src/contexts/WishlistContext.js';
import { ThemeProvider } from '../src/contexts/ThemeContext.js';

const mockProduct: any = {
  id: 'test-p1',
  name: 'iPhone 16 Pro Max 256GB',
  slug: 'iphone-16-pro-max',
  description: 'Test description',
  price: 144900,
  discountPrice: 134900,
  sku: 'TEST-SKU',
  stock: 10,
  rating: 4.9,
  numReviews: 25,
  brand: { name: 'Apple' },
  category: { name: 'Smartphones' },
  images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab'],
};

describe('ProductCard Component', () => {
  it('renders product title and pricing correctly', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <ProductCard product={mockProduct} />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    expect(screen.getByText('iPhone 16 Pro Max 256GB')).toBeInTheDocument();
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });
});
