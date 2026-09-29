/**
 * NUTRITION FIRE - Product Catalog & Storage Engine
 * Configured with exact core brand lineup:
 * 1. Protein (Nutrition Fire 100% Gold Whey - COMING SOON in 1 single flavor)
 * 2. Creatine (Nutrition Fire Micronized Creatine Monohydrate)
 * 3. Pre-Workout (Nutrition Fire Ignite Pre-Workout)
 * 4. Mass Gainer (Nutrition Fire Titan Mass Gainer)
 * 
 * Product pictures removed for now as requested.
 * Owner can upload pictures in Developer Mode.
 */

const DEFAULT_PRODUCTS = [
  // 1. WHEY PROTEIN (COMING SOON - 1 Single Flavor)
  {
    id: "nf-whey-gold",
    name: "Nutrition Fire 100% Gold Whey Protein",
    brand: "Nutrition Fire",
    section: "proteins-own",
    price: "0000",
    originalPrice: "0000",
    rating: 5.0,
    reviewsCount: 0,
    badge: "COMING SOON",
    isComingSoon: true,
    image: "", // Placeholder - editable by owner in developer mode
    servings: 67,
    flavors: ["lets see"],
    weightOptions: ["1kg kg (2.2 lbs)"],
    nutritionFacts: {
      protein: "25g",
      bcaa: "6.5g",
      calories: "124 kcal",
      sugar: "0g"
    },
    description: "Our flagship 100% ultra-filtered whey protein matrix enriched with DigeZyme digestive enzymes for bloat-free absorption. Launching soon in Rich Chocolate Fudge.",
    inStock: false,
    isFeatured: true
  },

  // 2. CREATINE (1 Product)
  {
    id: "nf-creatine-mono",
    name: "Nutrition Fire Micronized Creatine Monohydrate",
    brand: "Nutrition Fire",
    section: "creatine",
    price: 799,
    originalPrice: 1599,
    rating: 4.9,
    reviewsCount: 184,
    badge: "200 MESH",
    isComingSoon: false,
    image: "assets/images/products/creatine.jpeg",// Placeholder - editable by owner in developer mode
    servings: 100,
    flavors: ["watermelon"],
    weightOptions: ["310g (62 Servings)"],
    nutritionFacts: {
      creatine: "5g",
      calories: "0 kcal",
      purity: "99.9%"
    },
    description: "200 mesh pharmaceutical-grade micronized creatine monohydrate. 20X ATP replenishment, cellular hydration, and raw strength output without grittiness.",
    inStock: true,
    isFeatured: true
  },

  // 3. PRE-WORKOUT (1 Product)
  {
    id: "nf-preworkout-ignite",
    name: "Nutrition Fire Ignite High-Stim Pre-Workout",
    brand: "Nutrition Fire",
    section: "pre-workout",
    price: 999,
    originalPrice: 2000,
    rating: 4.9,
    reviewsCount: 92,
    badge: "CLINICAL DOSED",
    isComingSoon: false,
    image: "assets/images/products/pre.jpeg", // Placeholder - editable by owner in developer mode
    servings: 30,
    flavors: ["Electric Blue Razz"],
    weightOptions: ["210g (30 Servings)"],
    nutritionFacts: {
      citrulline: "4000mg",
      betaAlanine: "3200mg",
      caffeine: "300mg"
    },
    description: "Clinical dosed pre-workout formula engineered for intense mental drive, vascular nitric oxide muscle pumps, and high-stamina endurance.",
    inStock: true,
    isFeatured: true
  },

  // 4. MASS GAINER (1 Product)
  {
    id: "nf-massgainer-titan",
    name: "Nutrition Fire Titan Clean Mass Gainer",
    brand: "Nutrition Fire",
    section: "mass-gainer",
    price: 3999,
    originalPrice: 4599,
    rating: 4.8,
    reviewsCount: 65,
    badge: "CLEAN BULK",
    isComingSoon: false,
    image: "assets/images/products/massgainer.jpeg", // Placeholder - editable by owner in developer mode
    servings: 62,
    flavors: ["Chocolate Milkshake"],
    weightOptions: ["4.5 kg (9.9 lbs)"],
    nutritionFacts: {
      protein: "50g",
      calories: "1050 kcal",
      carbs: "185g"
    },
    description: "High-density clean calorie gainer featuring multi-source proteins and slow-burning complex carbohydrates for quality muscle hypertrophy.",
    inStock: true,
    isFeatured: true
  }
];

const STORAGE_KEY = "nf_catalog_v4";

const ProductStore = {
 getAll: function () {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
      const savedProducts = JSON.parse(data);

      // Update saved products with the latest code values
      return savedProducts.map(savedProduct => {
        const defaultProduct = DEFAULT_PRODUCTS.find(
          p => p.id === savedProduct.id
        );

        if (defaultProduct) {
          return {
            ...savedProduct,
            price: defaultProduct.price,
            originalPrice: defaultProduct.originalPrice,
            image: defaultProduct.image
          };
        }

        return savedProduct;
      });
    }
  } catch (e) {
    console.error("Failed to read from localStorage", e);
  }

  this.saveAll(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
},

  saveAll: function (products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
    }
  },

  getById: function (id) {
    const products = this.getAll();
    return products.find(p => p.id === id);
  },

  saveProduct: function (product) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      products.push(product);
    }
    this.saveAll(products);
    return product;
  },

  deleteProduct: function (id) {
    const products = this.getAll().filter(p => p.id !== id);
    this.saveAll(products);
  },

  resetToDefault: function () {
    localStorage.removeItem(STORAGE_KEY);
    return this.getAll();
  },

  exportJSON: function () {
    const products = this.getAll();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `nutrition_fire_catalog_${Date.now()}.json`);
    dlAnchor.click();
    dlAnchor.remove();
  }
};

window.ProductStore = ProductStore;
