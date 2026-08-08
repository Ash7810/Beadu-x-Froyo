export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  category: 'Bracelets' | 'Earrings' | 'Keychains' | 'Necklaces' | 'Charms & Trinkets' | 'Custom Builder';
  material: 'Wooden Beads' | 'Terracotta Clay' | 'Glass Beads' | 'Gemstones & Cat Eye' | 'Hand-Painted Pastels';
  image: string;
  images: string[];
  description: string;
  details: string[];
  inStock: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
}

export interface ReviewItem {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  productName: string;
}

export const PRODUCT_CATEGORIES = [
  'All',
  'Bracelets',
  'Earrings',
  'Keychains',
  'Necklaces',
  'Charms & Trinkets',
] as const;

export const MATERIAL_FILTERS = [
  'All Materials',
  'Wooden Beads',
  'Terracotta Clay',
  'Glass Beads',
  'Gemstones & Cat Eye',
  'Hand-Painted Pastels',
] as const;

export const PRODUCTS_CATALOG: Product[] = [
  {
    id: 'b-earth-cats-eye',
    name: "Earth & Cat's Eye Harmony Bracelet",
    price: 499,
    originalPrice: 699,
    rating: 4.9,
    reviewsCount: 42,
    category: 'Bracelets',
    material: 'Gemstones & Cat Eye',
    image: '/beads/pomelli_photoshoot_image_1_1_0726.png',
    images: [
      '/beads/pomelli_photoshoot_image_1_1_0726.png',
      '/beads/pomelli_photoshoot-3.png',
      '/beads/pomelli_photoshoot_image_9_16_0726.png',
      '/beads/newimg.png',
    ],
    description: "Carved Indian rosewood barrels interspersed with luminescent green cat's eye spheres and terracotta discs. Handcrafted with elastic durability.",
    details: [
      'Material: Sustainable Indian Wood & Natural Cat Eye Gemstones',
      'Bead Size: 8mm - 12mm mixed barrels',
      'Handcrafted by Indian Artisans',
      'Stretchable durable elastic fit for all wrist sizes',
      'Includes Beadu velvet pouch',
    ],
    inStock: true,
    isBestSeller: true,
  },
  {
    id: 'b-pastel-cubes',
    name: 'Hand-Painted Pastel Cubes Strand',
    price: 399,
    originalPrice: 549,
    rating: 4.8,
    reviewsCount: 38,
    category: 'Bracelets',
    material: 'Hand-Painted Pastels',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (1).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (1).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (2).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (7).png',
    ],
    description: 'Artisan-painted wooden cube beads in vibrant spring pastel hues, strung on durable elastic cord. A cheery addition to any wrist stack.',
    details: [
      'Material: Hand-Painted Non-Toxic Wood Cubes',
      'Bright boho color palette',
      'Lightweight and comfortable for daily wear',
      '100% Eco-Friendly Materials',
    ],
    inStock: true,
    isNewArrival: true,
  },
  {
    id: 'b-rosewood-ebony',
    name: 'Carved Rosewood & Ebony Sphere Bracelet',
    price: 599,
    originalPrice: 799,
    rating: 5.0,
    reviewsCount: 56,
    category: 'Bracelets',
    material: 'Wooden Beads',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (2).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (2).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (3).png',
      '/beads/pomelli_photoshoot_image_1_1_0726.png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (7).png',
    ],
    description: 'Deeply engraved rosewood spheres paired with light natural wood accents and pearl highlights. Rich earthy texture and timeless elegance.',
    details: [
      'Material: Engraved Indian Rosewood & Pearl Accents',
      'Natural wood grain variations make every piece unique',
      'Finished with natural wax coating',
    ],
    inStock: true,
    isBestSeller: true,
  },
  {
    id: 'b-terracotta-sun',
    name: 'Terracotta Sunburst Artisan Bracelet',
    price: 449,
    originalPrice: 599,
    rating: 4.7,
    reviewsCount: 29,
    category: 'Bracelets',
    material: 'Terracotta Clay',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (4).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (4).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (5).png',
      '/beads/pomelli_photoshoot-3.png',
    ],
    description: 'Fired terracotta clay disc beads blended with warm amber wood turned beads. Soulful, grounded cultural aesthetic.',
    details: [
      'Material: Fired Clay & Turned Wood',
      'Traditional Indian pottery bead technique',
      'Hypoallergenic & lead-free',
    ],
    inStock: true,
  },
  {
    id: 'b-jade-gemstone',
    name: 'Jade Gemstone & Golden Wood Strand',
    price: 649,
    originalPrice: 899,
    rating: 4.9,
    reviewsCount: 31,
    category: 'Bracelets',
    material: 'Gemstones & Cat Eye',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (5).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (5).png',
      '/beads/pomelli_photoshoot_image_1_1_0726.png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (3).png',
      '/beads/newimg.png',
    ],
    description: 'Natural green jade gemstones set against golden-turned wood beads on an earthy strand.',
    details: [
      'Material: Natural Jade Gemstones & Golden Wood',
      'Calming energy stone properties',
      'Hand-strung with high-tension cord',
    ],
    inStock: true,
    isBestSeller: true,
  },
  {
    id: 'e-terracotta-drop',
    name: 'Handcrafted Terracotta Clay Drop Earrings',
    price: 349,
    originalPrice: 499,
    rating: 4.8,
    reviewsCount: 24,
    category: 'Earrings',
    material: 'Terracotta Clay',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (3).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (3).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (4).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (7).png',
    ],
    description: 'Lightweight hand-sculpted terracotta clay drop earrings painted with intricate artisan motifs.',
    details: [
      'Material: Hand-molded Fired Clay',
      'Hypoallergenic brass ear hooks',
      'Super lightweight for day-long wear',
    ],
    inStock: true,
  },
  {
    id: 'k-cute-clay-keychain',
    name: 'Artisan Clay & Wood Charm Keychain',
    price: 299,
    originalPrice: 399,
    rating: 4.9,
    reviewsCount: 50,
    category: 'Keychains',
    material: 'Terracotta Clay',
    image: '/beads/pomelli_photoshoot_image_9_16_0726 (4).png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726 (4).png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (1).png',
      '/beads/pomelli_photoshoot-3.png',
    ],
    description: 'Playful charm keychain strung with painted clay beads, wooden cubes, and tassel accents.',
    details: [
      'Sturdy stainless steel keyring',
      'Handmade with non-toxic clay sealant',
      'Perfect for bags, keys, or gift toppers',
    ],
    inStock: true,
    isBestSeller: true,
  },
  {
    id: 'n-boho-wood-pendant',
    name: 'Boho Rosewood & Glass Bead Necklace',
    price: 799,
    originalPrice: 1099,
    rating: 5.0,
    reviewsCount: 19,
    category: 'Necklaces',
    material: 'Glass Beads',
    image: '/beads/pomelli_photoshoot-3.png',
    images: [
      '/beads/pomelli_photoshoot-3.png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (5).png',
      '/beads/pomelli_photoshoot_image_1_1_0726.png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (2).png',
    ],
    description: 'Statement necklace pairing hand-blown glass beads with carved Indian rosewood elements.',
    details: [
      'Material: Glass & Indian Rosewood',
      'Length: 18-inch adjustable strand',
      'Signature Beadu metallic clasp',
    ],
    inStock: true,
    isNewArrival: true,
  },
  {
    id: 'c-hand-carved-charm',
    name: 'Artisan Wooden Heart & Clay Trinket Charm',
    price: 199,
    originalPrice: 299,
    rating: 4.9,
    reviewsCount: 65,
    category: 'Charms & Trinkets',
    material: 'Wooden Beads',
    image: '/beads/pomelli_photoshoot_image_9_16_0726.png',
    images: [
      '/beads/pomelli_photoshoot_image_9_16_0726.png',
      '/beads/pomelli_photoshoot_image_9_16_0726 (7).png',
      '/beads/newimg.png',
    ],
    description: 'Individual hand-carved charm accessory compatible with custom bracelets or bag clips.',
    details: [
      'Universal lobster clasp attachment',
      'Finely carved Indian wood',
    ],
    inStock: true,
  },
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'r-1',
    userName: 'Ananya Sharma',
    rating: 5,
    date: 'August 3, 2026',
    title: 'Exquisite Craftsmanship!',
    comment: 'The Earth & Cat\'s Eye bracelet is even prettier in person! The wooden beads have a smooth natural finish and the elastic is super sturdy. Love Beadu!',
    verifiedPurchase: true,
    productName: "Earth & Cat's Eye Harmony Bracelet",
  },
  {
    id: 'r-2',
    userName: 'Rohan Mehta',
    rating: 5,
    date: 'July 28, 2026',
    title: 'Perfect Gift Packaging',
    comment: 'Ordered as a surprise with the ₹20 gift wrapping option. The handwritten note and velvet box made it feel so personal and luxurious.',
    verifiedPurchase: true,
    productName: 'Carved Rosewood & Ebony Sphere Bracelet',
  },
  {
    id: 'r-3',
    userName: 'Priya Iyer',
    rating: 5,
    date: 'July 22, 2026',
    title: 'Unique Boho Vibe',
    comment: 'Super lightweight and authentic clay work! Got so many compliments at work. Express delivery was super fast too.',
    verifiedPurchase: true,
    productName: 'Hand-Painted Pastel Cubes Strand',
  },
];
