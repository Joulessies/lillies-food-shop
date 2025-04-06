import React from 'react';

const Burgers = [
  {
    name: 'Classic',
    ingredients:
      'Potato bun, smashed Swiss beef patty, cheddar cheese, diced onions, ketchup, mustard',
    prices: { single: 10, double: 20, triple: 25 },
    image: '1.webp',
    isAvailable: true,
  },
  {
    name: 'Fancy',
    ingredients:
      'Potato bun, smashed Swiss beef patty, salad leaves, tomatoes, onion slice, cheddar cheese, secret sauce.',
    prices: { single: 14, double: 24, triple: 29 },
    image: '1.webp',
    isAvailable: true,
  },
  {
    name: 'Elegant',
    ingredients:
      'Potato bun, smashed Swiss Beef patty, salad leaves, tomatoes, onion slice, cheddar cheese, secret sauce, and packed with cheese!',
    prices: { single: 16, double: 18, triple: 39 },
    image: '1.webp',
    isAvailable: true,
  },
];

const fries = [
  {
    name: 'Classic Fries',
    size: 'Medium',
    price: 2.99,
    isAvailable: true,
    ingredients: ['Potatoes', 'Salt', 'Vegetable Oil'],
    image: 'images/classic-fries.jpg',
  },
  {
    name: 'Cheesy Fries',
    size: 'Large',
    price: 3.99,
    isAvailable: true,
    ingredients: ['Potatoes', 'Cheddar Cheese', 'Salt', 'Butter'],
    image: 'images/cheesy-fries.jpg',
  },
  {
    name: 'Spicy Fries',
    size: 'Medium',
    price: 3.49,
    isAvailable: false,
    ingredients: ['Potatoes', 'Cayenne Pepper', 'Paprika', 'Salt', 'Oil'],
    image: 'images/spicy-fries.jpg',
  },
];

const drinks = [
  {
    name: 'Cola',
    size: 'Regular',
    price: 1.99,
    isAvailable: true,
    ingredients: ['Carbonated Water', 'Sugar', 'Caramel Color', 'Caffeine'],
    image: 'images/cola.jpg',
  },
  {
    name: 'Lemonade',
    size: 'Large',
    price: 2.49,
    isAvailable: true,
    ingredients: ['Water', 'Lemon Juice', 'Sugar'],
    image: 'images/lemonade.jpg',
  },
  {
    name: 'Iced Tea',
    size: 'Medium',
    price: 2.29,
    isAvailable: false,
    ingredients: ['Black Tea', 'Sugar', 'Lemon Flavor'],
    image: 'images/iced-tea.jpg',
  },
  {
    name: 'Homemade Lemonade',
    size: 'Large',
    price: 2.99,
    isAvailable: true,
    ingredients: ['Fresh Lemons', 'Water', 'Honey', 'Mint Leaves'],
    image: 'images/homemade-lemonade.jpg',
  },
  {
    name: 'Apple Juice',
    size: 'Medium',
    price: 2.79,
    isAvailable: true,
    ingredients: ['Apple Extract', 'Water', 'Vitamin C'],
    image: 'images/apple-juice.jpg',
  },
  {
    name: 'Grape Juice',
    size: 'Medium',
    price: 2.89,
    isAvailable: true,
    ingredients: ['Grape Extract', 'Water', 'Natural Sweetener'],
    image: 'images/grape-juice.jpg',
  },
];
