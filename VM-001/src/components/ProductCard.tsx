import React, { useRef } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  stock: number;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
  onAddToCart: (product: Product, element: HTMLElement) => void;
}

const getImageUrl = (image: string) => {
 // If the image path is already a full URL, use it directly.
 if (image && (image.startsWith('http://') || image.startsWith('https://')))
   return image;

 // For relative paths from the backend, prepend the backend URL.
 // This now handles paths like '/<tenant-id>/Inventory/product_images/...'
 if (image && image.startsWith('/')) {
   return `http://localhost:3005${image}`;
 }

 // Fallback for any other case.
 return image;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, quantity, onQuantityChange, onAddToCart }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleIncrease = () => {
    if (quantity < product.stock) {
      onQuantityChange(product.id, quantity + 1);
      if (imageRef.current) {
        const startRect = imageRef.current.getBoundingClientRect();
        onAddToCart(product, imageRef.current);
      }
    }
  };

  const handleDecrease = () => {
    if (quantity > 0) {
      onQuantityChange(product.id, quantity - 1);
    }
  };

  return (
    <motion.div
      className={`bg-card border rounded-xl p-3 group relative ${
        product.stock === 0 ? 'border-red-500/50 opacity-60' :
        product.stock <= 2 ? 'border-orange-500/50' :
        product.stock <= 5 ? 'border-yellow-500/50' :
        'border-border'
      }`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, type: 'spring', stiffness: 400, damping: 25 }}
      whileHover={{ scale: 1.05 }}
    >
      {product.stock === 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
          OUT OF STOCK
        </div>
      )}
      {product.stock > 0 && product.stock <= 2 && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold z-10">
          LOW STOCK
        </div>
      )}
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-lg mb-3 overflow-hidden">
        <img
          ref={imageRef}
          src={getImageUrl(product.image)}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold text-sm text-foreground">{product.name}</h3>
          <p className="text-xs text-muted-foreground">{product.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-primary">₹{product.price}</span>
          <div className="flex items-center gap-1">
            <span className={`text-xs ${
              product.stock === 0 ? 'text-red-500 font-semibold' :
              product.stock <= 2 ? 'text-orange-500 font-semibold' :
              product.stock <= 5 ? 'text-yellow-500 font-semibold' :
              'text-muted-foreground'
            }`}>
              Stock: {product.stock}
            </span>
            {product.stock === 0 && (
              <span className="text-xs text-red-500 font-semibold">• Out of Stock</span>
            )}
            {product.stock > 0 && product.stock <= 2 && (
              <span className="text-xs text-orange-500 font-semibold">• Low</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={quantity === 0}
              className="h-7 w-7 p-0 rounded-full"
            >
              <Minus className="h-3 w-3" />
            </Button>
            
            <span className="w-8 text-center font-medium">{quantity}</span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={quantity >= product.stock}
              className="h-7 w-7 p-0 rounded-full"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {quantity > 0 && (
            <div className="text-sm font-medium text-primary">
              ₹{(product.price * quantity).toFixed(2)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
