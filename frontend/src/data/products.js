import hoodieImg from "../assets/products/hoodies.jpg";
import iphoneImg from "../assets/products/iphone.jpg";
import samsungImg from "../assets/products/samsung.jpg";
import sareeImg from "../assets/products/saree.jpg";

export const products = [
  {
    sku: "ELEC-001",
    name: "iPhone",
    slug: "iphone",
    category: "Electronics",
    description: "Latest Apple iPhone with advanced camera system.",
    price: 79999,
    imageUrl: iphoneImg,
    isActive: true
  },
  {
    sku: "ELEC-002",
    name: "Samsung Phone",
    slug: "samsung-phone",
    category: "Electronics",
    description: "Samsung smartphone with high performance and AMOLED display.",
    price: 59999,
    imageUrl: samsungImg,
    isActive: true
  },
  {
    sku: "FASH-001",
    name: "Hoodie",
    slug: "hoodie",
    category: "Clothing",
    description: "Comfortable hoodie for daily wear.",
    price: 1499,
    imageUrl: hoodieImg,
    isActive: true
  },
  {
    sku: "FASH-002",
    name: "Saree",
    slug: "saree",
    category: "Clothing",
    description: "Elegant saree perfect for functions and events.",
    price: 2499,
    imageUrl: sareeImg,
    isActive: true
  }
];
