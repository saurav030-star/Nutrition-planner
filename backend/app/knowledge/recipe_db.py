"""
Enterprise Culinary & Clinical Nutrition Database
Grounded in clinical nutritional guidelines (Mifflin-St Jeor, WHO macronutrient guidelines)
and verified culinary recipes across diverse dietary frameworks:
- Strict Vegetarian (Lacto-Vegetarian: dairy allowed, strictly NO eggs, NO meat, NO fish/seafood)
- 100% Plant-Based Vegan (Zero animal products, zero dairy, zero eggs)
- Balanced Whole Foods
- High-Protein Hypertrophy
- Low-Carb / Ketogenic
"""

from typing import List, Dict, Any

# Authoritative Allergen to Ingredient Substring Mapping for rigorous cross-contact audit
ALLERGEN_INGREDIENT_MAP: Dict[str, List[str]] = {
    "peanuts": ["peanut", "groundnut", "peanut butter"],
    "tree_nuts": ["almond", "walnut", "cashew", "pistachio", "pecan", "hazelnut", "brazil nut", "macadamia"],
    "dairy": ["milk", "dairy", "cheese", "yogurt", "paneer", "butter", "ghee", "whey", "curd", "cream", "ricotta", "feta", "parmigiano", "parmesan"],
    "gluten": ["gluten", "wheat", "sourdough", "bread", "farro", "pasta", "barley", "rye", "flour", "penne"],
    "shellfish": ["shellfish", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
    "eggs": ["egg", "eggs", "albumin", "mayonnaise", "poached egg", "omelet"],
    "soy": ["soy", "soya", "tofu", "edamame", "tempeh", "miso", "tamari"],
    "fish": ["fish", "salmon", "tuna", "cod", "tilapia", "trout", "halibut", "sardine", "anchovy"]
}

# Strict dietary framework exclusions
FRAMEWORK_FORBIDDEN_KEYWORDS: Dict[str, List[str]] = {
    "vegetarian": [
        "chicken", "beef", "turkey", "pork", "fish", "salmon", "tuna", "cod", "bacon", 
        "meat", "seafood", "shrimp", "egg", "eggs", "duck", "lamb", "anchovy"
    ],
    "vegan": [
        "chicken", "beef", "turkey", "pork", "fish", "salmon", "tuna", "cod", "bacon", 
        "meat", "seafood", "shrimp", "egg", "eggs", "duck", "lamb", "anchovy",
        "milk", "dairy", "cheese", "yogurt", "paneer", "butter", "ghee", "whey", "curd", "cream", "ricotta", "feta"
    ]
}

PLANT_MILK_KEYWORDS = ["almond milk", "coconut milk", "soy milk", "oat milk", "plant milk", "cashew milk"]

RECIPE_DATABASE: List[Dict[str, Any]] = [
    # =========================================================================
    # STRICT VEGETARIAN (LACTO-VEGETARIAN) - PURE VEG (NO EGGS, NO MEAT, NO FISH)
    # =========================================================================
    {
        "id": "veg_paneer_bhurji_roti",
        "name": "High-Protein Scrambled Paneer Bhurji with Whole Wheat Roti",
        "meal_type": "breakfast",
        "diet_types": ["vegetarian", "balanced", "high_protein"],
        "allergens": ["dairy", "gluten"],
        "calories": 445.0,
        "protein": 26.0,
        "carbs": 38.0,
        "fats": 23.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 12,
        "description": "Crumbled fresh malai paneer sautéed with cumin seeds, ginger, onions, tomatoes, and turmeric, served with two soft whole wheat rotis.",
        "ingredients": [
            {"name": "Fresh Crumbled Paneer", "quantity": 110, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 290.0, "protein": 20.0, "carbs": 4.0, "fats": 22.0},
            {"name": "Whole Wheat Roti", "quantity": 2, "unit": "pieces", "aisle": "Grains & Bakery", "calories": 140.0, "protein": 5.0, "carbs": 30.0, "fats": 1.0},
            {"name": "Diced Onions & Tomatoes", "quantity": 60, "unit": "g", "aisle": "Vegetables", "calories": 15.0, "protein": 1.0, "carbs": 4.0, "fats": 0.0}
        ],
        "instructions": [
            "Heat a non-stick pan, temper cumin seeds and grated ginger in a dash of oil.",
            "Add finely chopped onions and tomatoes, sautéing until soft and aromatic.",
            "Add turmeric, chili powder, and crumbled fresh paneer. Toss gently for 3-4 minutes.",
            "Garnish with freshly chopped cilantro and serve hot with two whole wheat rotis."
        ]
    },
    {
        "id": "veg_dal_tadka_brown_rice",
        "name": "Homestyle Yellow Moong & Masoor Dal Tadka with Steamed Brown Rice",
        "meal_type": "lunch",
        "diet_types": ["vegetarian", "vegan", "balanced", "gluten_free"],
        "allergens": [],
        "calories": 510.0,
        "protein": 22.5,
        "carbs": 82.0,
        "fats": 10.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 25,
        "description": "Slow-simmered yellow moong and pink masoor lentils tempered with cumin, garlic, and ripe tomatoes, served alongside fluffy brown basmati rice.",
        "ingredients": [
            {"name": "Yellow Moong & Masoor Dal", "quantity": 80, "unit": "g", "aisle": "Pulses & Legumes", "calories": 270.0, "protein": 19.0, "carbs": 46.0, "fats": 1.5},
            {"name": "Steamed Brown Basmati Rice", "quantity": 140, "unit": "g", "aisle": "Grains & Bakery", "calories": 175.0, "protein": 3.5, "carbs": 36.0, "fats": 1.5},
            {"name": "Cold-Pressed Mustard Oil & Cumin Tadka", "quantity": 8, "unit": "ml", "aisle": "Spices & Oils", "calories": 65.0, "protein": 0.0, "carbs": 0.0, "fats": 7.0}
        ],
        "instructions": [
            "Pressure cook yellow lentils with water, turmeric, and sea salt until smooth and creamy.",
            "In a small pan, temper cumin seeds, minced garlic, and chopped tomatoes in cold-pressed oil.",
            "Pour hot tempering over cooked dal and simmer for 3 minutes.",
            "Serve hot poured over a bed of warm steamed brown basmati rice."
        ]
    },
    {
        "id": "veg_chickpea_protein_bowl",
        "name": "Spiced Roasted Chickpea Protein Bowl with Quinoa & Lemon Tahini",
        "meal_type": "lunch",
        "diet_types": ["vegetarian", "vegan", "balanced", "high_protein", "gluten_free"],
        "allergens": [],
        "calories": 490.0,
        "protein": 23.0,
        "carbs": 82.0,
        "fats": 14.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Oven-roasted spiced kabuli chana, nutty tri-color quinoa, roasted sweet potatoes, and massaged kale dressed in creamy lemon tahini.",
        "ingredients": [
            {"name": "Cooked Chickpeas (Kabuli Chana)", "quantity": 160, "unit": "g", "aisle": "Pulses & Legumes", "calories": 240.0, "protein": 14.0, "carbs": 40.0, "fats": 3.5},
            {"name": "Cooked Tri-Color Quinoa", "quantity": 110, "unit": "g", "aisle": "Grains & Bakery", "calories": 130.0, "protein": 4.5, "carbs": 24.0, "fats": 2.0},
            {"name": "Roasted Sweet Potato & Kale", "quantity": 100, "unit": "g", "aisle": "Vegetables", "calories": 70.0, "protein": 2.0, "carbs": 16.0, "fats": 0.5},
            {"name": "Lemon Tahini Dressing", "quantity": 15, "unit": "ml", "aisle": "Spices & Oils", "calories": 50.0, "protein": 2.5, "carbs": 2.0, "fats": 8.0}
        ],
        "instructions": [
            "Toss chickpeas and diced sweet potato with cumin, paprika, and light olive oil.",
            "Roast at 200°C for 20 minutes until chickpeas are crisp and potatoes tender.",
            "Layer cooked quinoa and massaged kale into a bowl.",
            "Top with warm roasted chickpeas, sweet potatoes, and drizzle creamy lemon tahini."
        ]
    },
    {
        "id": "veg_tofu_tikka_curry",
        "name": "Aromatic Coconut Tofu Curry with Sautéed Bell Peppers",
        "meal_type": "dinner",
        "diet_types": ["vegetarian", "vegan", "balanced", "high_protein", "gluten_free", "low_carb", "keto"],
        "allergens": ["soy"],
        "calories": 475.0,
        "protein": 32.0,
        "carbs": 28.0,
        "fats": 26.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Pan-seared organic firm tofu cubes simmered in a coconut-tomato masala reduction with crisp bell peppers and green peas.",
        "ingredients": [
            {"name": "Organic Extra Firm Tofu", "quantity": 180, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 250.0, "protein": 26.0, "carbs": 5.0, "fats": 15.0},
            {"name": "Bell Peppers & Sweet Peas", "quantity": 110, "unit": "g", "aisle": "Vegetables", "calories": 65.0, "protein": 4.0, "carbs": 13.0, "fats": 0.5},
            {"name": "Light Coconut Milk & Tomato Curry", "quantity": 120, "unit": "ml", "aisle": "Spices & Oils", "calories": 160.0, "protein": 2.0, "carbs": 10.0, "fats": 10.5}
        ],
        "instructions": [
            "Press tofu, cut into cubes, and sear in a hot skillet until golden on all sides.",
            "Add bell peppers and peas, sauteing for 3 minutes.",
            "Pour in simmered tomato coconut sauce and season with garam masala and ginger.",
            "Simmer for 5 minutes until flavors meld; serve warm."
        ]
    },
    {
        "id": "veg_palak_paneer_rice",
        "name": "Classic Palak Paneer with Brown Basmati Rice & Cucumber Kachumber",
        "meal_type": "dinner",
        "diet_types": ["vegetarian", "balanced", "high_protein", "gluten_free"],
        "allergens": ["dairy"],
        "calories": 535.0,
        "protein": 31.0,
        "carbs": 43.0,
        "fats": 27.5,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Fresh cottage cheese paneer cubes simmered in spiced pureed baby spinach and fenugreek gravy, served with brown rice and cucumber kachumber.",
        "ingredients": [
            {"name": "Fresh Paneer Cubes", "quantity": 130, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 340.0, "protein": 24.0, "carbs": 4.0, "fats": 26.0},
            {"name": "Blanched Pureed Spinach (Palak)", "quantity": 140, "unit": "g", "aisle": "Vegetables", "calories": 35.0, "protein": 4.0, "carbs": 5.0, "fats": 0.5},
            {"name": "Steamed Brown Basmati Rice", "quantity": 120, "unit": "g", "aisle": "Grains & Bakery", "calories": 150.0, "protein": 3.0, "carbs": 32.0, "fats": 1.0},
            {"name": "Kachumber Cucumber & Lemon", "quantity": 50, "unit": "g", "aisle": "Vegetables", "calories": 10.0, "protein": 0.0, "carbs": 2.0, "fats": 0.0}
        ],
        "instructions": [
            "Blanch baby spinach in boiling water for 2 minutes, plunge into ice water, and puree with green chilies.",
            "In a pan, temper cumin and garlic in a teaspoon of ghee; add tomato onion paste.",
            "Pour pureed spinach, add cubed paneer, and simmer gently on low heat for 5 minutes.",
            "Serve hot paired with steamed brown basmati rice and refreshing cucumber kachumber."
        ]
    },
    {
        "id": "veg_soya_chunks_curry",
        "name": "High-Protein Soya Chunks Curry with Whole Wheat Roti & Salad",
        "meal_type": "lunch",
        "diet_types": ["vegetarian", "vegan", "balanced", "high_protein"],
        "allergens": ["soy", "gluten"],
        "calories": 480.0,
        "protein": 36.0,
        "carbs": 62.0,
        "fats": 10.5,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Nutrela high-protein soya chunks rehydrated and simmered in an aromatic onion-tomato curry with peas, served with two whole wheat rotis.",
        "ingredients": [
            {"name": "Nutrela Soya Chunks (dry wt 50g)", "quantity": 50, "unit": "g", "aisle": "Pulses & Legumes", "calories": 175.0, "protein": 26.0, "carbs": 16.0, "fats": 0.5},
            {"name": "Whole Wheat Roti", "quantity": 2, "unit": "pieces", "aisle": "Grains & Bakery", "calories": 140.0, "protein": 5.0, "carbs": 30.0, "fats": 1.0},
            {"name": "Green Peas & Tomato Onion Gravy", "quantity": 120, "unit": "g", "aisle": "Vegetables", "calories": 95.0, "protein": 5.0, "carbs": 16.0, "fats": 1.5},
            {"name": "Cold-Pressed Olive Oil & Spices", "quantity": 8, "unit": "ml", "aisle": "Spices & Oils", "calories": 70.0, "protein": 0.0, "carbs": 0.0, "fats": 7.5}
        ],
        "instructions": [
            "Boil soya chunks in salted water for 5 minutes, rinse in cold water, and squeeze out excess moisture thoroughly.",
            "Sauté onions, ginger-garlic paste, and tomatoes with turmeric and coriander powder until fragrant.",
            "Add soya chunks and green peas, coat in spices, and pour 150ml water.",
            "Simmer for 10 minutes until thick and luscious; serve warm with whole wheat rotis."
        ]
    },
    {
        "id": "veg_moong_sprouts_salad",
        "name": "Tangy Moong & Kala Chana Sprouts Salad with Pomegranate",
        "meal_type": "snack",
        "diet_types": ["vegetarian", "vegan", "balanced", "high_protein", "gluten_free", "low_carb", "keto"],
        "allergens": [],
        "calories": 210.0,
        "protein": 13.0,
        "carbs": 34.0,
        "fats": 2.5,
        "prep_time_minutes": 10,
        "cook_time_minutes": 0,
        "description": "Crisp sprouted green moong and black chana tossed with diced cucumbers, ruby pomegranate arils, roasted cumin, and fresh lemon juice.",
        "ingredients": [
            {"name": "Sprouted Green Moong & Black Chana", "quantity": 120, "unit": "g", "aisle": "Pulses & Legumes", "calories": 130.0, "protein": 11.0, "carbs": 21.0, "fats": 1.0},
            {"name": "Pomegranate Arils", "quantity": 30, "unit": "g", "aisle": "Fruits", "calories": 25.0, "protein": 0.5, "carbs": 6.0, "fats": 0.5},
            {"name": "Diced Cucumbers & Tomatoes", "quantity": 60, "unit": "g", "aisle": "Vegetables", "calories": 15.0, "protein": 0.5, "carbs": 3.0, "fats": 0.0},
            {"name": "Roasted Cumin & Fresh Lemon Dressing", "quantity": 15, "unit": "ml", "aisle": "Spices & Oils", "calories": 40.0, "protein": 1.0, "carbs": 4.0, "fats": 1.0}
        ],
        "instructions": [
            "In a salad bowl, combine freshly sprouted moong and black chana.",
            "Add diced cucumbers, ripe tomatoes, and sweet pomegranate arils.",
            "Sprinkle roasted cumin powder, chaat masala, and squeeze fresh lemon juice.",
            "Toss well and serve immediately as a crisp, protein-rich snack."
        ]
    },
    {
        "id": "veg_roasted_makhana_cashews",
        "name": "Himalayan Pink Salt Roasted Makhana & Crisp Cashews",
        "meal_type": "snack",
        "diet_types": ["vegetarian", "vegan", "balanced", "gluten_free", "low_carb", "keto"],
        "allergens": ["tree_nuts"],
        "calories": 235.0,
        "protein": 6.5,
        "carbs": 26.0,
        "fats": 10.5,
        "prep_time_minutes": 3,
        "cook_time_minutes": 5,
        "description": "Organic lotus seeds (foxnuts/makhana) and whole cashews slow-roasted in cold-pressed oil with Himalayan pink salt, turmeric, and cracked black pepper.",
        "ingredients": [
            {"name": "Organic Lotus Seeds (Makhana)", "quantity": 35, "unit": "g", "aisle": "Other Items", "calories": 125.0, "protein": 3.5, "carbs": 22.0, "fats": 0.5},
            {"name": "Raw Whole Cashews", "quantity": 15, "unit": "g", "aisle": "Other Items", "calories": 85.0, "protein": 3.0, "carbs": 4.0, "fats": 7.0},
            {"name": "Cold-Pressed Oil, Turmeric & Pink Salt", "quantity": 3, "unit": "g", "aisle": "Spices & Oils", "calories": 25.0, "protein": 0.0, "carbs": 0.0, "fats": 3.0}
        ],
        "instructions": [
            "Heat a flat-bottom pan over medium-low heat with a drop of cold-pressed oil.",
            "Add makhana and cashews, stirring continuously for 4-5 minutes until audibly crispy.",
            "Dust with Himalayan pink salt, turmeric, and cracked black pepper; toss evenly and serve."
        ]
    },
    {
        "id": "veg_masala_besan_chilla",
        "name": "High-Protein Spiced Besan Chilla with Paneer & Mint Chutney",
        "meal_type": "breakfast",
        "diet_types": ["vegetarian", "balanced", "gluten_free", "high_protein"],
        "allergens": ["dairy"],
        "calories": 420.0,
        "protein": 26.0,
        "carbs": 40.0,
        "fats": 16.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Savory gram flour (chickpea) crepes loaded with grated carrots, bell peppers, fresh coriander, stuffed with crumbled paneer and paired with cooling mint yogurt chutney.",
        "ingredients": [
            {"name": "Gram Flour (Besan)", "quantity": 60, "unit": "g", "aisle": "Grains & Bakery", "calories": 225.0, "protein": 13.0, "carbs": 35.0, "fats": 3.0},
            {"name": "Crumbled Fresh Paneer", "quantity": 60, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 160.0, "protein": 11.0, "carbs": 2.0, "fats": 12.0},
            {"name": "Mint & Cilantro Yogurt Chutney", "quantity": 30, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 35.0, "protein": 2.0, "carbs": 3.0, "fats": 1.0}
        ],
        "instructions": [
            "Whisk besan with water, grated vegetables, ajwain, turmeric, and sea salt into a smooth batter.",
            "Pour batter onto a hot skillet and spread into a thin crepe; cook 2 minutes per side.",
            "Sprinkle crumbled paneer across the center, fold, and serve hot with fresh mint yogurt chutney."
        ]
    },
    {
        "id": "veg_greek_yogurt_berry_bowl",
        "name": "Greek Yogurt & Berry Granola Protein Bowl",
        "meal_type": "breakfast",
        "diet_types": ["vegetarian", "balanced", "high_protein"],
        "allergens": ["dairy", "tree_nuts"],
        "calories": 410.0,
        "protein": 29.0,
        "carbs": 46.0,
        "fats": 12.2,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Rich 0% Greek yogurt layered with whole rolled oat granola, organic blueberries, chia seeds, crushed almonds, and a drizzle of raw forest honey.",
        "ingredients": [
            {"name": "0% Strained Greek Yogurt", "quantity": 200, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 130.0, "protein": 22.0, "carbs": 8.0, "fats": 0.5},
            {"name": "Whole Rolled Oat Granola", "quantity": 45, "unit": "g", "aisle": "Grains & Bakery", "calories": 180.0, "protein": 4.0, "carbs": 28.0, "fats": 6.0},
            {"name": "Fresh Organic Blueberries", "quantity": 60, "unit": "g", "aisle": "Fruits", "calories": 35.0, "protein": 0.5, "carbs": 8.0, "fats": 0.2},
            {"name": "Chia Seeds & Sliced Almonds", "quantity": 15, "unit": "g", "aisle": "Other Items", "calories": 65.0, "protein": 2.5, "carbs": 2.0, "fats": 5.5}
        ],
        "instructions": [
            "Spoon chilled Greek yogurt into a bowl.",
            "Top with golden oat granola, fresh blueberries, and sliced almonds.",
            "Finish with a sprinkle of chia seeds."
        ]
    },
    {
        "id": "med_avocado_toast_poached_eggs",
        "name": "Artisan Sourdough Avocado Toast with Poached Eggs",
        "meal_type": "breakfast",
        "diet_types": ["balanced", "high_protein", "mediterranean"],
        "allergens": ["gluten", "eggs"],
        "calories": 485.0,
        "protein": 26.0,
        "carbs": 38.0,
        "fats": 25.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Toasted sourdough bread topped with freshly mashed Hass avocado, microgreens, chili flakes, and two pasture-raised poached eggs.",
        "ingredients": [
            {"name": "Artisan Sourdough Bread", "quantity": 2, "unit": "slices", "aisle": "Grains & Bakery", "calories": 160.0, "protein": 6.0, "carbs": 30.0, "fats": 1.0},
            {"name": "Hass Avocado", "quantity": 70, "unit": "g", "aisle": "Vegetables", "calories": 115.0, "protein": 1.5, "carbs": 6.0, "fats": 10.5},
            {"name": "Pasture-Raised Poached Eggs", "quantity": 2, "unit": "whole", "aisle": "Dairy & Plant Milks", "calories": 140.0, "protein": 12.5, "carbs": 1.0, "fats": 9.5},
            {"name": "Microgreens & Hemp Seeds", "quantity": 15, "unit": "g", "aisle": "Vegetables", "calories": 70.0, "protein": 6.0, "carbs": 1.0, "fats": 4.0}
        ],
        "instructions": [
            "Toast sourdough bread slices until golden brown and crisp.",
            "Mash fresh Hass avocado with lemon juice, sea salt, and black pepper; spread evenly over toast.",
            "Poach two eggs in gently simmering water for 3 minutes until whites are firm and yolks soft.",
            "Top toast with poached eggs, hemp seeds, and fresh microgreens."
        ]
    },
    {
        "id": "veg_paneer_avocado_toast",
        "name": "Artisan Sourdough Avocado Toast with Spiced Grilled Paneer",
        "meal_type": "breakfast",
        "diet_types": ["vegetarian"],
        "allergens": ["gluten", "dairy"],
        "calories": 485.0,
        "protein": 22.5,
        "carbs": 38.0,
        "fats": 27.5,
        "prep_time_minutes": 10,
        "cook_time_minutes": 8,
        "description": "Crisp artisan sourdough toast spread with zesty mashed Hass avocado, crowned with golden pan-seared spiced paneer cubes, hemp seeds, and fresh microgreens.",
        "ingredients": [
            {"name": "Artisan Sourdough Bread", "quantity": 2, "unit": "slices", "aisle": "Grains & Bakery", "calories": 160.0, "protein": 6.0, "carbs": 30.0, "fats": 1.0},
            {"name": "Hass Avocado", "quantity": 70, "unit": "g", "aisle": "Vegetables", "calories": 115.0, "protein": 1.5, "carbs": 6.0, "fats": 10.5},
            {"name": "Fresh Paneer (Cubed)", "quantity": 80, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 210.0, "protein": 15.0, "carbs": 2.0, "fats": 16.0}
        ],
        "instructions": [
            "Toast sourdough slices until crisp and golden.",
            "Lightly sear cubed paneer in a non-stick pan until edges are golden.",
            "Mash avocado with lime juice and spread over toast, topping with warm spiced paneer."
        ]
    },
    {
        "id": "veg_paneer_tikka_quinoa_bowl",
        "name": "Tandoori Spiced Paneer & Tri-Color Quinoa Bowl",
        "meal_type": "lunch",
        "diet_types": ["vegetarian", "balanced", "high_protein", "gluten_free"],
        "allergens": ["dairy"],
        "calories": 550.0,
        "protein": 32.0,
        "carbs": 38.0,
        "fats": 30.7,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Succulent cubes of paneer marinated in roasted cumin, turmeric, and Greek yogurt, grilled with bell peppers and layered over fluffy quinoa with cucumbers and mint dressing.",
        "ingredients": [
            {"name": "Fresh Paneer", "quantity": 140, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 365.0, "protein": 25.0, "carbs": 4.0, "fats": 28.0},
            {"name": "Tri-Color Quinoa (Cooked)", "quantity": 130, "unit": "g", "aisle": "Grains & Bakery", "calories": 155.0, "protein": 5.5, "carbs": 28.0, "fats": 2.5},
            {"name": "Bell Peppers & Cucumber Ribbons", "quantity": 80, "unit": "g", "aisle": "Vegetables", "calories": 30.0, "protein": 1.5, "carbs": 6.0, "fats": 0.2}
        ],
        "instructions": [
            "Toss paneer cubes and bell pepper chunks in tandoori yogurt marinade.",
            "Sear paneer on a hot griddle for 3 minutes per side until charred and tender.",
            "Layer warm cooked quinoa into bowl, add fresh crisp cucumber ribbons, and top with paneer."
        ]
    },
    {
        "id": "veg_mediterranean_falafel_hummus_bowl",
        "name": "Herbed Falafel & Creamy Tahini Hummus Mediterranean Bowl",
        "meal_type": "lunch",
        "diet_types": ["vegetarian", "vegan", "balanced"],
        "allergens": ["gluten"],
        "calories": 520.0,
        "protein": 22.0,
        "carbs": 68.0,
        "fats": 18.5,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Crisp baked parsley-chickpea falafels nestled on smooth house-made garlic hummus, heirloom tomatoes, and whole grain pita wedges.",
        "ingredients": [
            {"name": "Baked Chickpea Falafels", "quantity": 5, "unit": "pieces", "aisle": "Pulses & Legumes", "calories": 250.0, "protein": 12.0, "carbs": 30.0, "fats": 9.0},
            {"name": "Garlic Tahini Hummus", "quantity": 70, "unit": "g", "aisle": "Pulses & Legumes", "calories": 140.0, "protein": 5.0, "carbs": 12.0, "fats": 8.5},
            {"name": "Whole Wheat Pita", "quantity": 1, "unit": "whole", "aisle": "Grains & Bakery", "calories": 130.0, "protein": 5.0, "carbs": 26.0, "fats": 1.0}
        ],
        "instructions": [
            "Warm falafels and whole wheat pita in oven for 8 minutes at 180°C.",
            "Spread velvety hummus across base of bowl, arrange falafels and fresh tomatoes, serve with warm pita."
        ]
    },
    {
        "id": "veg_lentil_paneer_curry",
        "name": "Yellow Dal Tadka with Pan-Seared Paneer & Brown Basmati",
        "meal_type": "dinner",
        "diet_types": ["vegetarian", "balanced", "high_protein", "gluten_free"],
        "allergens": ["dairy"],
        "calories": 665.0,
        "protein": 40.0,
        "carbs": 72.0,
        "fats": 24.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Slow-simmered protein-dense yellow lentils tempered with cumin, garlic, and ginger, crowned with pan-seared paneer cubes and served with fragrant brown basmati rice.",
        "ingredients": [
            {"name": "Yellow Lentils (Moong & Masoor)", "quantity": 70, "unit": "g", "aisle": "Pulses & Legumes", "calories": 235.0, "protein": 17.0, "carbs": 40.0, "fats": 1.0},
            {"name": "Fresh Paneer Cubes", "quantity": 110, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 290.0, "protein": 20.0, "carbs": 3.0, "fats": 22.0},
            {"name": "Steamed Brown Basmati Rice", "quantity": 110, "unit": "g", "aisle": "Grains & Bakery", "calories": 140.0, "protein": 3.0, "carbs": 29.0, "fats": 1.0}
        ],
        "instructions": [
            "Simmer yellow lentils in vegetable broth with turmeric and sea salt until velvety.",
            "In a skillet, sear paneer cubes until golden brown.",
            "Pour hot dal over warm brown basmati rice and crown with seared paneer."
        ]
    },
    {
        "id": "veg_ricotta_spinach_pasta",
        "name": "Whole Wheat Penne with Fresh Spinach & Italian Ricotta",
        "meal_type": "dinner",
        "diet_types": ["vegetarian", "balanced"],
        "allergens": ["gluten", "dairy"],
        "calories": 515.0,
        "protein": 25.0,
        "carbs": 64.0,
        "fats": 18.5,
        "prep_time_minutes": 12,
        "cook_time_minutes": 15,
        "description": "Al dente whole wheat penne pasta tossed in garlic olive oil, wilted tender spinach, creamy Italian ricotta, and cracked black pepper.",
        "ingredients": [
            {"name": "Whole Wheat Penne Pasta", "quantity": 85, "unit": "g", "aisle": "Grains & Bakery", "calories": 290.0, "protein": 12.0, "carbs": 58.0, "fats": 2.0},
            {"name": "Fresh Whole Milk Ricotta", "quantity": 90, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 140.0, "protein": 10.0, "carbs": 4.0, "fats": 9.5},
            {"name": "Baby Spinach & Olive Oil", "quantity": 90, "unit": "g", "aisle": "Vegetables", "calories": 85.0, "protein": 3.0, "carbs": 2.0, "fats": 7.0}
        ],
        "instructions": [
            "Boil penne pasta in salted water for 9 minutes until al dente.",
            "Sauté minced garlic in olive oil, wilt baby spinach, and toss with pasta and creamy ricotta."
        ]
    },

    # =========================================================================
    # 100% PLANT-BASED VEGAN (ZERO ANIMAL / ZERO DAIRY / ZERO EGGS)
    # =========================================================================
    {
        "id": "vegan_tofu_veggie_stirfry",
        "name": "Crispy Sesame Tofu & Edamame Soba Stir-Fry",
        "meal_type": "dinner",
        "diet_types": ["vegan", "vegetarian", "balanced", "high_protein"],
        "allergens": ["soy", "gluten"],
        "calories": 540.0,
        "protein": 41.0,
        "carbs": 57.0,
        "fats": 18.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Organic firm tofu cubes pan-crisped with shelled edamame, broccoli florets, and bell peppers tossed with buckwheat soba noodles in a ginger-tamari glaze.",
        "ingredients": [
            {"name": "Organic Extra Firm Tofu", "quantity": 180, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 250.0, "protein": 26.0, "carbs": 5.0, "fats": 15.0},
            {"name": "Buckwheat Soba Noodles", "quantity": 70, "unit": "g", "aisle": "Grains & Bakery", "calories": 210.0, "protein": 8.0, "carbs": 44.0, "fats": 1.0},
            {"name": "Broccoli & Shelled Edamame", "quantity": 100, "unit": "g", "aisle": "Vegetables", "calories": 80.0, "protein": 7.0, "carbs": 8.0, "fats": 2.0}
        ],
        "instructions": [
            "Press tofu to remove moisture and cube. Sear in hot wok until golden brown.",
            "Add broccoli, bell peppers, and edamame, stir-frying for 3-4 minutes.",
            "Toss with boiled soba noodles and ginger tamari glaze."
        ]
    },
    {
        "id": "vegan_overnight_chia_oats",
        "name": "Vanilla Almond Chia Overnight Oats with Wild Berries",
        "meal_type": "breakfast",
        "diet_types": ["vegan", "vegetarian", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 390.0,
        "protein": 13.0,
        "carbs": 52.0,
        "fats": 15.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Gluten-free rolled oats soaked overnight in unsweetened almond milk with chia seeds, pure Madagascar vanilla, topped with fresh blueberries and sliced almonds.",
        "ingredients": [
            {"name": "Rolled Oats (Gluten-Free)", "quantity": 50, "unit": "g", "aisle": "Grains & Bakery", "calories": 190.0, "protein": 6.0, "carbs": 34.0, "fats": 3.0},
            {"name": "Chia Seeds & Sliced Almonds", "quantity": 25, "unit": "g", "aisle": "Other Items", "calories": 125.0, "protein": 4.5, "carbs": 6.0, "fats": 10.0},
            {"name": "Unsweetened Almond Milk & Berries", "quantity": 200, "unit": "ml", "aisle": "Dairy & Plant Milks", "calories": 75.0, "protein": 2.5, "carbs": 12.0, "fats": 2.0}
        ],
        "instructions": [
            "In a mason jar, combine rolled oats, chia seeds, and almond milk.",
            "Seal and chill in refrigerator overnight.",
            "In the morning, top with fresh berries and sliced almonds."
        ]
    },
    {
        "id": "vegan_tofu_scramble_toast",
        "name": "Turmeric Herb Tofu Scramble with Whole Grain Toast",
        "meal_type": "breakfast",
        "diet_types": ["vegan", "vegetarian", "balanced", "high_protein"],
        "allergens": ["soy", "gluten"],
        "calories": 420.0,
        "protein": 25.0,
        "carbs": 44.0,
        "fats": 15.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Crumbled organic tofu scrambled with nutritional yeast, turmeric, garlic, baby spinach, and tomatoes, served with whole grain toast.",
        "ingredients": [
            {"name": "Organic Extra Firm Tofu", "quantity": 160, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 220.0, "protein": 22.0, "carbs": 4.0, "fats": 13.0},
            {"name": "Whole Grain Toast", "quantity": 2, "unit": "slices", "aisle": "Grains & Bakery", "calories": 150.0, "protein": 6.0, "carbs": 28.0, "fats": 1.5},
            {"name": "Baby Spinach & Tomatoes", "quantity": 80, "unit": "g", "aisle": "Vegetables", "calories": 50.0, "protein": 2.0, "carbs": 6.0, "fats": 0.5}
        ],
        "instructions": [
            "Crumble firm tofu into a hot pan with olive oil, turmeric, and black pepper.",
            "Fold in baby spinach and tomatoes until wilted.",
            "Serve hot with toasted whole grain slices."
        ]
    },
    {
        "id": "vegan_chickpea_buddha_bowl",
        "name": "Golden Turmeric Chickpea & Sweet Potato Buddha Bowl",
        "meal_type": "lunch",
        "diet_types": ["vegan", "vegetarian", "gluten_free"],
        "allergens": [],
        "calories": 460.0,
        "protein": 20.0,
        "carbs": 68.0,
        "fats": 12.2,
        "prep_time_minutes": 15,
        "cook_time_minutes": 25,
        "description": "Roasted spiced chickpeas with cinnamon sweet potato wedges, massaged kale, cucumber ribbons, and a creamy lemon tahini drizzle.",
        "ingredients": [
            {"name": "Cooked Chickpeas (rinsed)", "quantity": 150, "unit": "g", "aisle": "Pulses & Legumes", "calories": 225.0, "protein": 13.0, "carbs": 38.0, "fats": 3.0},
            {"name": "Roasted Sweet Potato", "quantity": 130, "unit": "g", "aisle": "Vegetables", "calories": 115.0, "protein": 2.0, "carbs": 26.0, "fats": 0.2},
            {"name": "Lacinato Tuscan Kale & Tahini", "quantity": 80, "unit": "g", "aisle": "Vegetables", "calories": 120.0, "protein": 5.0, "carbs": 4.0, "fats": 9.0}
        ],
        "instructions": [
            "Toss chickpeas and sweet potato wedges with cumin and olive oil; roast at 200°C for 25 minutes.",
            "Massage kale leaves with sea salt and assemble bowl with crispy chickpeas and sweet potato."
        ]
    },

    # =========================================================================
    # KETO & LOW CARB RECIPES
    # =========================================================================
    {
        "id": "keto_spinach_feta_omelet",
        "name": "Fluffy Spinach & Herb Feta Omelet with Sliced Avocado",
        "meal_type": "breakfast",
        "diet_types": ["keto", "low_carb", "gluten_free"],
        "allergens": ["eggs", "dairy"],
        "calories": 440.0,
        "protein": 24.0,
        "carbs": 6.0,
        "fats": 36.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Three farm eggs whisked with baby spinach and dill, cooked in butter and folded over creamy feta and fresh sliced avocado.",
        "ingredients": [
            {"name": "Large Farm Fresh Eggs", "quantity": 3, "unit": "whole", "aisle": "Other Items", "calories": 210.0, "protein": 18.0, "carbs": 1.5, "fats": 15.0},
            {"name": "Crumbled Goat Feta", "quantity": 35, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 95.0, "protein": 5.0, "carbs": 1.5, "fats": 8.0},
            {"name": "Hass Avocado & Baby Spinach", "quantity": 90, "unit": "g", "aisle": "Vegetables", "calories": 135.0, "protein": 1.0, "carbs": 3.0, "fats": 13.0}
        ],
        "instructions": [
            "Whisk eggs with sea salt and pepper. Pour into a heated skillet with butter.",
            "Add spinach, fold over crumbled feta, and serve with sliced avocado."
        ]
    },
    {
        "id": "keto_chia_hemp_seed_bowl",
        "name": "Keto Chia & Hemp Heart Breakfast Pudding with Walnuts",
        "meal_type": "breakfast",
        "diet_types": ["keto", "low_carb", "vegan", "vegetarian", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 395.0,
        "protein": 18.0,
        "carbs": 7.0,
        "fats": 32.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Chia seeds and shelled hemp hearts soaked in unsweetened almond milk, dusted with Ceylon cinnamon and crowned with crushed raw walnuts.",
        "ingredients": [
            {"name": "Shelled Hemp Hearts", "quantity": 30, "unit": "g", "aisle": "Other Items", "calories": 170.0, "protein": 10.0, "carbs": 2.0, "fats": 14.0},
            {"name": "Chia Seeds", "quantity": 20, "unit": "g", "aisle": "Other Items", "calories": 100.0, "protein": 3.5, "carbs": 2.0, "fats": 6.5},
            {"name": "Unsweetened Almond Milk", "quantity": 180, "unit": "ml", "aisle": "Dairy & Plant Milks", "calories": 30.0, "protein": 1.0, "carbs": 1.0, "fats": 2.5},
            {"name": "Raw Walnuts", "quantity": 15, "unit": "g", "aisle": "Other Items", "calories": 95.0, "protein": 2.5, "carbs": 2.0, "fats": 9.0}
        ],
        "instructions": [
            "Whisk hemp hearts, chia seeds, and almond milk with a pinch of cinnamon.",
            "Chill for 15 minutes to thicken, top with raw walnuts, and enjoy cold."
        ]
    },
    {
        "id": "keto_steak_chimichurri",
        "name": "Grass-Fed Flank Steak with Fresh Chimichurri & Zucchini",
        "meal_type": "dinner",
        "diet_types": ["low_carb", "keto", "high_protein", "gluten_free"],
        "allergens": [],
        "calories": 595.0,
        "protein": 48.0,
        "carbs": 8.0,
        "fats": 42.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Char-grilled grass-fed flank steak sliced thin with herb chimichurri and sautéed zucchini ribbons.",
        "ingredients": [
            {"name": "Grass-Fed Beef Flank Steak", "quantity": 190, "unit": "g", "aisle": "Other Items", "calories": 380.0, "protein": 45.0, "carbs": 0.0, "fats": 20.0},
            {"name": "Zucchini Ribbons & Olive Oil", "quantity": 160, "unit": "g", "aisle": "Vegetables", "calories": 140.0, "protein": 2.5, "carbs": 6.0, "fats": 14.0},
            {"name": "Fresh Herb Chimichurri", "quantity": 30, "unit": "ml", "aisle": "Spices & Oils", "calories": 75.0, "protein": 0.5, "carbs": 2.0, "fats": 8.0}
        ],
        "instructions": [
            "Grill flank steak over high heat for 4 minutes per side. Sauté zucchini ribbons and serve topped with fresh chimichurri."
        ]
    },
    {
        "id": "keto_caesar_chicken_salad",
        "name": "Crispy Romaine Grilled Chicken Caesar",
        "meal_type": "lunch",
        "diet_types": ["low_carb", "keto", "high_protein", "gluten_free"],
        "allergens": ["dairy"],
        "calories": 540.0,
        "protein": 48.5,
        "carbs": 5.0,
        "fats": 30.0,
        "prep_time_minutes": 12,
        "cook_time_minutes": 10,
        "description": "Tender chicken breast sliced over crisp chopped romaine, shaved parmesan, and olive oil Caesar dressing.",
        "ingredients": [
            {"name": "Chicken Breast", "quantity": 170, "unit": "g", "aisle": "Other Items", "calories": 280.0, "protein": 42.0, "carbs": 0.0, "fats": 6.0},
            {"name": "Romaine Hearts & Parmesan", "quantity": 150, "unit": "g", "aisle": "Vegetables", "calories": 110.0, "protein": 6.0, "carbs": 3.0, "fats": 8.0},
            {"name": "Avocado Oil Caesar Dressing", "quantity": 30, "unit": "ml", "aisle": "Spices & Oils", "calories": 150.0, "protein": 0.5, "carbs": 2.0, "fats": 16.0}
        ],
        "instructions": [
            "Pan-sear chicken breast until done. Toss romaine with Caesar dressing and top with sliced chicken and parmesan."
        ]
    },
    {
        "id": "keto_avocado_walnut_snack",
        "name": "Hass Avocado Wedges with Sea Salt & Roasted Walnuts",
        "meal_type": "snack",
        "diet_types": ["keto", "low_carb", "vegan", "vegetarian", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 220.0,
        "protein": 4.5,
        "carbs": 4.0,
        "fats": 21.0,
        "prep_time_minutes": 2,
        "cook_time_minutes": 0,
        "description": "Fresh creamy avocado wedges seasoned with flaky sea salt, crushed red pepper, and paired with roasted walnut halves.",
        "ingredients": [
            {"name": "Hass Avocado", "quantity": 80, "unit": "g", "aisle": "Vegetables", "calories": 130.0, "protein": 1.5, "carbs": 2.0, "fats": 12.0},
            {"name": "Raw Walnuts", "quantity": 15, "unit": "g", "aisle": "Other Items", "calories": 90.0, "protein": 3.0, "carbs": 2.0, "fats": 9.0}
        ],
        "instructions": [
            "Slice avocado into crescents, sprinkle flaky Maldon sea salt and serve with raw walnuts."
        ]
    },

    # =========================================================================
    # SNACKS & RECOVERY (VEGETARIAN / VEGAN SAFE)
    # =========================================================================
    {
        "id": "snack_greek_yogurt_berry",
        "name": "High-Protein Greek Yogurt Parfait with Walnuts",
        "meal_type": "snack",
        "diet_types": ["balanced", "vegetarian", "high_protein", "gluten_free"],
        "allergens": ["dairy", "tree_nuts"],
        "calories": 260.0,
        "protein": 22.0,
        "carbs": 21.0,
        "fats": 9.7,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Authentic strained 0% Greek yogurt layered with raspberries, raw walnut halves, and raw honey.",
        "ingredients": [
            {"name": "0% Strained Greek Yogurt", "quantity": 170, "unit": "g", "aisle": "Dairy & Plant Milks", "calories": 110.0, "protein": 19.0, "carbs": 6.0, "fats": 0.5},
            {"name": "Fresh Raspberries & Honey", "quantity": 60, "unit": "g", "aisle": "Fruits", "calories": 55.0, "protein": 0.5, "carbs": 13.0, "fats": 0.2},
            {"name": "Raw Walnuts", "quantity": 15, "unit": "g", "aisle": "Other Items", "calories": 95.0, "protein": 2.5, "carbs": 2.0, "fats": 9.0}
        ],
        "instructions": [
            "Spoon chilled Greek yogurt into a bowl, top with fresh raspberries, crushed walnuts, and honey."
        ]
    },
    {
        "id": "snack_apple_almond_butter",
        "name": "Crisp Honeycrisp Apple Slices with Almond Butter",
        "meal_type": "snack",
        "diet_types": ["vegan", "vegetarian", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 225.0,
        "protein": 5.5,
        "carbs": 26.0,
        "fats": 12.8,
        "prep_time_minutes": 3,
        "cook_time_minutes": 0,
        "description": "Crisp sweet Honeycrisp apple wedges paired with all-natural creamy almond butter and cinnamon.",
        "ingredients": [
            {"name": "Honeycrisp Apple", "quantity": 1, "unit": "whole", "aisle": "Fruits", "calories": 80.0, "protein": 0.5, "carbs": 20.0, "fats": 0.3},
            {"name": "Natural Creamy Almond Butter", "quantity": 25, "unit": "g", "aisle": "Other Items", "calories": 145.0, "protein": 5.0, "carbs": 6.0, "fats": 12.5}
        ],
        "instructions": [
            "Core and slice apple into wedges; serve with almond butter for dipping."
        ]
    },
    {
        "id": "snack_edamame_sea_salt",
        "name": "Steamed Sea Salt Edamame Pods",
        "meal_type": "snack",
        "diet_types": ["vegan", "vegetarian", "balanced", "gluten_free", "high_protein"],
        "allergens": ["soy"],
        "calories": 180.0,
        "protein": 17.0,
        "carbs": 12.0,
        "fats": 7.0,
        "prep_time_minutes": 2,
        "cook_time_minutes": 5,
        "description": "Young green soybeans in pod, steamed tender and tossed with sea salt.",
        "ingredients": [
            {"name": "Whole Edamame in Pod", "quantity": 150, "unit": "g", "aisle": "Vegetables", "calories": 180.0, "protein": 17.0, "carbs": 12.0, "fats": 7.0}
        ],
        "instructions": [
            "Steam edamame pods for 4-5 minutes, drain, toss with sea salt, and serve warm."
        ]
    },

    # =========================================================================
    # BALANCED / OMNIVORE / MEDITERRANEAN (FOR NON-VEGETARIAN FRAMEWORKS)
    # =========================================================================
    {
        "id": "med_lemon_herb_salmon",
        "name": "Pan-Seared Lemon Herb Salmon with Quinoa & Asparagus",
        "meal_type": "dinner",
        "diet_types": ["balanced", "high_protein", "gluten_free"],
        "allergens": ["fish"],
        "calories": 564.0,
        "protein": 43.5,
        "carbs": 31.0,
        "fats": 25.5,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Wild Alaskan salmon filet seared with olive oil and dill, served atop quinoa and roasted asparagus.",
        "ingredients": [
            {"name": "Salmon Filet", "quantity": 180, "unit": "g", "aisle": "Other Items", "calories": 374.0, "protein": 36.0, "carbs": 0.0, "fats": 22.0},
            {"name": "Tri-Color Quinoa", "quantity": 60, "unit": "g", "aisle": "Grains & Bakery", "calories": 140.0, "protein": 5.0, "carbs": 26.0, "fats": 2.0},
            {"name": "Asparagus & Lemon Herb Glaze", "quantity": 120, "unit": "g", "aisle": "Vegetables", "calories": 50.0, "protein": 2.5, "carbs": 5.0, "fats": 1.5}
        ],
        "instructions": [
            "Rinse quinoa and simmer for 15 minutes. Season salmon with salt, pepper, and dill.",
            "Sear salmon in a hot skillet for 4 minutes per side; toss asparagus for 3 minutes."
        ]
    },
    {
        "id": "med_greek_chicken_bowl",
        "name": "Mediterranean Herb Chicken & Farro Bowl",
        "meal_type": "lunch",
        "diet_types": ["balanced", "high_protein"],
        "allergens": ["dairy", "gluten"],
        "calories": 520.0,
        "protein": 51.0,
        "carbs": 39.0,
        "fats": 13.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Grilled marinated chicken breast sliced over nutty farro, Persian cucumbers, cherry tomatoes, and feta.",
        "ingredients": [
            {"name": "Chicken Breast", "quantity": 170, "unit": "g", "aisle": "Other Items", "calories": 280.0, "protein": 42.0, "carbs": 0.0, "fats": 6.0},
            {"name": "Cooked Farro", "quantity": 120, "unit": "g", "aisle": "Grains & Bakery", "calories": 160.0, "protein": 5.0, "carbs": 33.0, "fats": 1.0},
            {"name": "Cucumbers, Tomatoes & Feta", "quantity": 100, "unit": "g", "aisle": "Vegetables", "calories": 80.0, "protein": 4.0, "carbs": 6.0, "fats": 6.0}
        ],
        "instructions": [
            "Grill chicken breast for 6-7 minutes per side. Layer warm farro and diced cucumbers in bowl, topping with sliced chicken."
        ]
    },
    {
        "id": "athletic_turkey_sweet_potato",
        "name": "Lean Ground Turkey Hash with Roasted Sweet Potato",
        "meal_type": "lunch",
        "diet_types": ["balanced", "high_protein", "gluten_free"],
        "allergens": [],
        "calories": 510.0,
        "protein": 48.0,
        "carbs": 48.0,
        "fats": 12.7,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "93% lean ground turkey browned with bell peppers and caramelized onions, folded into roasted diced sweet potatoes.",
        "ingredients": [
            {"name": "93% Lean Ground Turkey", "quantity": 180, "unit": "g", "aisle": "Other Items", "calories": 290.0, "protein": 44.0, "carbs": 0.0, "fats": 12.0},
            {"name": "Roasted Diced Sweet Potato", "quantity": 160, "unit": "g", "aisle": "Vegetables", "calories": 160.0, "protein": 2.5, "carbs": 36.0, "fats": 0.2},
            {"name": "Bell Peppers & Green Beans", "quantity": 100, "unit": "g", "aisle": "Vegetables", "calories": 60.0, "protein": 2.0, "carbs": 12.0, "fats": 0.5}
        ],
        "instructions": [
            "Brown turkey with paprika and sea salt. Roast sweet potatoes until caramelized and toss together with peppers."
        ]
    }
]

# Guarantee exact mathematical identity: recipe nutrition == sum of ingredient nutrition
for _recipe in RECIPE_DATABASE:
    _recipe["calories"] = round(sum(i.get("calories", 0.0) for i in _recipe.get("ingredients", [])), 1)
    _recipe["protein"] = round(sum(i.get("protein", 0.0) for i in _recipe.get("ingredients", [])), 1)
    _recipe["carbs"] = round(sum(i.get("carbs", 0.0) for i in _recipe.get("ingredients", [])), 1)
    _recipe["fats"] = round(sum(i.get("fats", 0.0) for i in _recipe.get("ingredients", [])), 1)

def search_recipes(
    diet_type: str = "balanced",
    meal_type: str = None,
    exclude_allergens: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Search and filter recipes matching dietary protocol and allergen exclusion boundaries.
    Enforces strict ingredient-level checking for vegetarians (no eggs, no meat, no seafood).
    """
    exclude_set = {a.strip().lower() for a in (exclude_allergens or []) if a.strip()}
    dt = diet_type.lower()

    # Map dietary frameworks to strict exclusion boundaries
    if dt in FRAMEWORK_FORBIDDEN_KEYWORDS:
        forbidden_words = FRAMEWORK_FORBIDDEN_KEYWORDS[dt]
    else:
        forbidden_words = []

    # Map exclude_allergens to ingredient keywords
    allergen_forbidden_keywords = {}
    for allergen in exclude_set:
        mapped = ALLERGEN_INGREDIENT_MAP.get(allergen, [allergen])
        allergen_forbidden_keywords[allergen] = mapped

    results = []
    for r in RECIPE_DATABASE:
        # 1. Filter by meal_type if requested
        if meal_type and r.get("meal_type") != meal_type:
            continue
            
        # 2. Check recipe top-level allergen tags
        recipe_allergens = {a.lower() for a in r.get("allergens", [])}
        if exclude_set.intersection(recipe_allergens):
            continue

        # 3. Check ingredient-level names against allergen exclusions (with plant milk exemption)
        has_allergen_conflict = False
        ingredients = r.get("ingredients", [])
        for ing in ingredients:
            ing_name = ing.get("name", "").lower()
            for allergen, keywords in allergen_forbidden_keywords.items():
                for kw in keywords:
                    if kw in ing_name:
                        # Plant milk exemption for dairy
                        if allergen == "dairy" and kw == "milk":
                            if any(pm in ing_name for pm in PLANT_MILK_KEYWORDS):
                                continue
                        has_allergen_conflict = True
                        break
                if has_allergen_conflict:
                    break
            if has_allergen_conflict:
                break
        if has_allergen_conflict:
            continue

        # 4. Check dietary framework restrictions (strict vegetarian / vegan)
        if forbidden_words:
            has_forbidden_ingredient = False
            for ing in ingredients:
                ing_name = ing.get("name", "").lower()
                for forbidden in forbidden_words:
                    if forbidden in ing_name:
                        if dt == "vegan" and forbidden == "milk":
                            if any(pm in ing_name for pm in PLANT_MILK_KEYWORDS):
                                continue
                        has_forbidden_ingredient = True
                        break
                if has_forbidden_ingredient:
                    break
            if has_forbidden_ingredient:
                continue

        # 5. Check diet type tag compatibility
        r_diets = r.get("diet_types", [])
        if dt == "vegetarian":
            if "vegetarian" not in r_diets:
                continue
        elif dt == "vegan":
            if "vegan" not in r_diets:
                continue
        elif dt == "high_protein":
            if "high_protein" not in r_diets and "balanced" not in r_diets:
                continue
        elif dt == "low_carb":
            if "low_carb" not in r_diets and "keto" not in r_diets:
                continue
        elif dt == "keto":
            if "keto" not in r_diets and "low_carb" not in r_diets:
                continue
        elif dt != "balanced" and dt not in r_diets:
            continue
            
        results.append(r)

    # For balanced and high_protein diets without animal allergen exclusions, prioritize complete balanced proteins (chicken, salmon, turkey, eggs)
    if dt in ["balanced", "high_protein", "mediterranean"]:
        has_egg_fish_exclusion = any(a in exclude_set for a in ["eggs", "fish", "shellfish"])
        def recipe_priority(recipe):
            name_lower = recipe.get("name", "").lower()
            if "poached egg" in name_lower and "eggs" not in exclude_set:
                return 0
            if "mediterranean herb chicken" in name_lower and not has_egg_fish_exclusion:
                return 0
            if "lemon herb salmon" in name_lower and "fish" not in exclude_set:
                return 0
            if "greek yogurt parfait" in name_lower and "dairy" not in exclude_set:
                return 0

            is_signature_omnivore = any(k in name_lower for k in [
                "chicken", "salmon", "turkey", "steak", "poached egg", "omelet", "beef", "fish"
            ])
            if is_signature_omnivore and not has_egg_fish_exclusion:
                return 1
            if "high_protein" in recipe.get("diet_types", []):
                return 2
            return 3
        results.sort(key=recipe_priority)

    return results
