"""
Enterprise Culinary & Clinical Nutrition Database
Grounded in clinical nutritional guidelines (Mifflin-St Jeor, WHO macronutrient guidelines)
and verified culinary recipes across diverse dietary frameworks.
"""

from typing import List, Dict, Any

RECIPE_DATABASE: List[Dict[str, Any]] = [
    # --- BALANCED / MEDITERRANEAN ---
    {
        "id": "med_lemon_herb_salmon",
        "name": "Pan-Seared Lemon Herb Salmon with Quinoa",
        "meal_type": "dinner",
        "diet_types": ["balanced", "mediterranean", "gluten_free"],
        "allergens": ["fish"],
        "calories": 540,
        "protein": 42.0,
        "carbs": 38.0,
        "fats": 22.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "Wild Alaskan salmon filet seared with extra virgin olive oil, fresh dill, lemon zest, served atop fluffy tri-color quinoa and roasted asparagus.",
        "ingredients": [
            {"name": "Salmon Filet", "quantity": 180, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Tri-Color Quinoa", "quantity": 60, "unit": "g", "aisle": "Bakery & Grains"},
            {"name": "Asparagus Spears", "quantity": 120, "unit": "g", "aisle": "Produce"},
            {"name": "Extra Virgin Olive Oil", "quantity": 15, "unit": "ml", "aisle": "Pantry & Spices"},
            {"name": "Fresh Lemon Juice & Dill", "quantity": 15, "unit": "ml", "aisle": "Produce"}
        ],
        "instructions": [
            "Rinse quinoa and simmer in 120ml water for 15 minutes until tender.",
            "Season salmon filet with salt, pepper, and fresh dill.",
            "Heat olive oil in a skillet over medium-high heat and sear salmon for 4 minutes per side.",
            "Toss asparagus in pan for 3 minutes until vibrant and tender-crisp.",
            "Plate quinoa, top with seared salmon and drizzle fresh lemon juice."
        ]
    },
    {
        "id": "med_greek_chicken_bowl",
        "name": "Mediterranean Herb Chicken & Farro Bowl",
        "meal_type": "lunch",
        "diet_types": ["balanced", "mediterranean"],
        "allergens": ["dairy"],
        "calories": 510,
        "protein": 45.0,
        "carbs": 44.0,
        "fats": 16.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Grilled marinated chicken breast sliced over nutty farro, Persian cucumbers, cherry tomatoes, kalamata olives, and light sheep's feta.",
        "ingredients": [
            {"name": "Chicken Breast", "quantity": 170, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Cooked Farro", "quantity": 120, "unit": "g", "aisle": "Bakery & Grains"},
            {"name": "Persian Cucumbers", "quantity": 80, "unit": "g", "aisle": "Produce"},
            {"name": "Cherry Tomatoes", "quantity": 60, "unit": "g", "aisle": "Produce"},
            {"name": "Kalamata Olives", "quantity": 25, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Crumbled Feta Cheese", "quantity": 30, "unit": "g", "aisle": "Dairy & Refrigerated"},
            {"name": "Olive Oil & Oregano Vinaigrette", "quantity": 15, "unit": "ml", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Season chicken breast with oregano, garlic, salt, and black pepper.",
            "Grill over medium heat for 6-7 minutes per side until internal temperature reaches 74°C (165°F).",
            "In a bowl, layer warm farro, diced cucumber, and halved cherry tomatoes.",
            "Slice chicken breast and arrange on top.",
            "Garnish with kalamata olives, crumbled feta, and light oregano vinaigrette."
        ]
    },
    {
        "id": "med_avocado_berry_toast",
        "name": "Artisan Sourdough Avocado Toast with Poached Eggs",
        "meal_type": "breakfast",
        "diet_types": ["balanced", "mediterranean", "vegetarian"],
        "allergens": ["gluten", "eggs"],
        "calories": 420,
        "protein": 21.0,
        "carbs": 36.0,
        "fats": 20.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Toasted sourdough topped with freshly mashed Hass avocado, microgreens, chili flakes, and two pasture-raised soft poached eggs.",
        "ingredients": [
            {"name": "Artisan Sourdough Bread", "quantity": 2, "unit": "slices", "aisle": "Bakery & Grains"},
            {"name": "Hass Avocado", "quantity": 70, "unit": "g", "aisle": "Produce"},
            {"name": "Pasture-Raised Eggs", "quantity": 2, "unit": "whole", "aisle": "Dairy & Refrigerated"},
            {"name": "Microgreens & Hemp Seeds", "quantity": 15, "unit": "g", "aisle": "Produce"},
            {"name": "Red Pepper Flakes & Sea Salt", "quantity": 2, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Toast sourdough slices until golden and crisp.",
            "Mash avocado with a squeeze of fresh lemon, pinch of sea salt, and chili flakes.",
            "Gently poach eggs in simmering water with a dash of white vinegar for 3 minutes.",
            "Spread mashed avocado over toast, crown each slice with a poached egg, and scatter microgreens."
        ]
    },

    # --- VEGETARIAN & VEGAN ---
    {
        "id": "vegan_tofu_veggie_stirfry",
        "name": "Crispy Sesame Tofu & Edamame Soba Stir-Fry",
        "meal_type": "dinner",
        "diet_types": ["vegan", "vegetarian", "balanced"],
        "allergens": ["soy"],
        "calories": 480,
        "protein": 34.0,
        "carbs": 52.0,
        "fats": 14.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Organic firm tofu cubes pan-crisped with shelled edamame, broccoli florets, and bell peppers tossed with buckwheat soba noodles in a ginger-tamari glaze.",
        "ingredients": [
            {"name": "Organic Extra Firm Tofu", "quantity": 180, "unit": "g", "aisle": "Dairy & Refrigerated"},
            {"name": "Buckwheat Soba Noodles", "quantity": 70, "unit": "g", "aisle": "Bakery & Grains"},
            {"name": "Shelled Edamame", "quantity": 60, "unit": "g", "aisle": "Produce"},
            {"name": "Broccoli & Bell Peppers", "quantity": 120, "unit": "g", "aisle": "Produce"},
            {"name": "Tamari & Ginger Glaze", "quantity": 20, "unit": "ml", "aisle": "Pantry & Spices"},
            {"name": "Toasted Sesame Seeds", "quantity": 5, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Press tofu to remove excess moisture and cube into bite-sized pieces.",
            "Boil soba noodles for 4 minutes, drain and rinse under cold water.",
            "Sear tofu in a hot wok with a touch of sesame oil until all sides are golden brown.",
            "Add broccoli, bell peppers, and edamame, stir-frying for 3-4 minutes.",
            "Add soba noodles and ginger-tamari glaze, toss vigorously for 1 minute, sprinkle with sesame seeds."
        ]
    },
    {
        "id": "vegan_chickpea_buddha_bowl",
        "name": "Golden Turmeric Chickpea & Sweet Potato Buddha Bowl",
        "meal_type": "lunch",
        "diet_types": ["vegan", "vegetarian", "gluten_free"],
        "allergens": ["sesame"],
        "calories": 460,
        "protein": 20.0,
        "carbs": 66.0,
        "fats": 12.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 25,
        "description": "Roasted spiced chickpeas with cinnamon sweet potato wedges, massaged kale, cucumber ribbons, and a creamy lemon tahini drizzle.",
        "ingredients": [
            {"name": "Canned Chickpeas (rinsed)", "quantity": 150, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Sweet Potato", "quantity": 130, "unit": "g", "aisle": "Produce"},
            {"name": "Lacinato Tuscan Kale", "quantity": 60, "unit": "g", "aisle": "Produce"},
            {"name": "Tahini Paste", "quantity": 20, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Lemon Juice & Cumin", "quantity": 10, "unit": "ml", "aisle": "Produce"}
        ],
        "instructions": [
            "Preheat oven to 200°C (400°F).",
            "Toss chickpeas and sweet potato wedges with cumin, turmeric, sea salt, and olive oil.",
            "Roast on a baking sheet for 25 minutes until sweet potato is fork-tender and chickpeas are crisp.",
            "Massage kale leaves with a drop of olive oil and sea salt until softened.",
            "Assemble bowl with kale base, sweet potato, crispy chickpeas, and drizzle whisked lemon tahini."
        ]
    },
    {
        "id": "vegan_overnight_chia_oats",
        "name": "Vanilla Almond Chia Overnight Oats with Wild Berries",
        "meal_type": "breakfast",
        "diet_types": ["vegan", "vegetarian", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 390,
        "protein": 17.0,
        "carbs": 55.0,
        "fats": 11.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Gluten-free rolled oats soaked overnight in unsweetened almond milk with chia seeds, pure Madagascar vanilla, topped with fresh blueberries and sliced almonds.",
        "ingredients": [
            {"name": "Rolled Oats (Gluten-Free)", "quantity": 50, "unit": "g", "aisle": "Bakery & Grains"},
            {"name": "Chia Seeds", "quantity": 15, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Unsweetened Almond Milk", "quantity": 180, "unit": "ml", "aisle": "Dairy & Refrigerated"},
            {"name": "Fresh Blueberries & Strawberries", "quantity": 70, "unit": "g", "aisle": "Produce"},
            {"name": "Sliced Toasted Almonds", "quantity": 15, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Plant Protein Powder (Vanilla)", "quantity": 15, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "In a mason jar, combine rolled oats, chia seeds, plant protein powder, and almond milk.",
            "Stir well until smooth, seal and chill in refrigerator overnight (or at least 4 hours).",
            "In the morning, top with fresh berries, sliced almonds, and a drizzle of pure maple syrup if desired."
        ]
    },

    # --- KETO / LOW CARB ---
    {
        "id": "keto_steak_chimichurri",
        "name": "Grass-Fed Flank Steak with Fresh Chimichurri & Zucchini",
        "meal_type": "dinner",
        "diet_types": ["keto", "low_carb", "paleo", "gluten_free"],
        "allergens": [],
        "calories": 580,
        "protein": 48.0,
        "carbs": 8.0,
        "fats": 40.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 15,
        "description": "Char-grilled grass-fed flank steak sliced against the grain, topped with vibrant hand-chopped parsley and oregano chimichurri, served with butter-seared zucchini ribbons.",
        "ingredients": [
            {"name": "Grass-Fed Beef Flank Steak", "quantity": 190, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Fresh Italian Parsley & Oregano", "quantity": 30, "unit": "g", "aisle": "Produce"},
            {"name": "Zucchini Ribbons", "quantity": 150, "unit": "g", "aisle": "Produce"},
            {"name": "Extra Virgin Olive Oil", "quantity": 25, "unit": "ml", "aisle": "Pantry & Spices"},
            {"name": "Red Wine Vinegar & Garlic", "quantity": 10, "unit": "ml", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Whisk finely chopped parsley, garlic, oregano, red wine vinegar, olive oil, and red pepper flakes.",
            "Season flank steak generously with coarse sea salt and cracked black pepper.",
            "Grill or cast-iron sear over high heat for 4 minutes per side until medium-rare. Rest for 5 minutes.",
            "Saute zucchini ribbons in pan drippings with a pinch of salt for 2 minutes.",
            "Slice steak thinly against the grain, spoon chimichurri on top, and serve with zucchini."
        ]
    },
    {
        "id": "keto_spinach_feta_omelet",
        "name": "Fluffy Spinach & Herb Feta Omelet with Avocado",
        "meal_type": "breakfast",
        "diet_types": ["keto", "low_carb", "vegetarian", "gluten_free"],
        "allergens": ["eggs", "dairy"],
        "calories": 440,
        "protein": 24.0,
        "carbs": 6.0,
        "fats": 36.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Three farm eggs whisked with baby spinach and dill, cooked in ghee and folded over creamy goat feta and fresh sliced avocado.",
        "ingredients": [
            {"name": "Large Farm Fresh Eggs", "quantity": 3, "unit": "whole", "aisle": "Dairy & Refrigerated"},
            {"name": "Baby Spinach", "quantity": 60, "unit": "g", "aisle": "Produce"},
            {"name": "Crumbled Goat Feta", "quantity": 35, "unit": "g", "aisle": "Dairy & Refrigerated"},
            {"name": "Hass Avocado", "quantity": 60, "unit": "g", "aisle": "Produce"},
            {"name": "Grass-Fed Butter or Ghee", "quantity": 10, "unit": "g", "aisle": "Dairy & Refrigerated"}
        ],
        "instructions": [
            "Whisk eggs with a splash of water, salt, pepper, and chopped fresh dill.",
            "Melt butter in non-stick pan over medium-low heat; add spinach and wilt for 60 seconds.",
            "Pour beaten eggs over spinach, swirling the pan to cover evenly.",
            "When eggs are nearly set, crumble feta across one half, fold in half, and slide onto plate.",
            "Serve immediately with fresh sliced avocado alongside."
        ]
    },
    {
        "id": "keto_caesar_chicken_salad",
        "name": "Crispy Romaine Grilled Chicken Caesar with Bacon",
        "meal_type": "lunch",
        "diet_types": ["keto", "low_carb", "gluten_free"],
        "allergens": ["dairy", "eggs", "fish"],
        "calories": 520,
        "protein": 46.0,
        "carbs": 5.0,
        "fats": 35.0,
        "prep_time_minutes": 12,
        "cook_time_minutes": 10,
        "description": "Tender seasoned chicken breast sliced over crisp chopped romaine hearts, uncured bacon lardons, shaved Parmigiano-Reggiano, and house-made avocado oil Caesar dressing.",
        "ingredients": [
            {"name": "Chicken Breast", "quantity": 170, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Crisp Romaine Hearts", "quantity": 140, "unit": "g", "aisle": "Produce"},
            {"name": "Uncured Bacon Crumbles", "quantity": 25, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Shaved Parmigiano-Reggiano", "quantity": 30, "unit": "g", "aisle": "Dairy & Refrigerated"},
            {"name": "Avocado Oil Caesar Dressing", "quantity": 30, "unit": "ml", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Pan-sear or grill chicken breast until cooked through; slice diagonally.",
            "Chop crisp romaine hearts, rinse thoroughly and spin dry.",
            "In a large bowl, toss romaine with half the Caesar dressing until lightly coated.",
            "Top with sliced warm chicken breast, crispy bacon lardons, and shaved parmesan.",
            "Drizzle remaining Caesar dressing and crack fresh black pepper over top."
        ]
    },

    # --- HIGH PROTEIN / ATHLETIC PERFORMANCE / BULKING ---
    {
        "id": "athletic_turkey_sweet_potato",
        "name": "Lean Ground Turkey Hash with Roasted Sweet Potato",
        "meal_type": "lunch",
        "diet_types": ["balanced", "paleo", "gluten_free"],
        "allergens": [],
        "calories": 560,
        "protein": 48.0,
        "carbs": 54.0,
        "fats": 16.0,
        "prep_time_minutes": 15,
        "cook_time_minutes": 20,
        "description": "93% lean ground turkey browned with smoked paprika, bell peppers, and caramelized onions, folded into roasted diced sweet potatoes and green beans.",
        "ingredients": [
            {"name": "93% Lean Ground Turkey", "quantity": 180, "unit": "g", "aisle": "Meat & Seafood"},
            {"name": "Roasted Diced Sweet Potato", "quantity": 160, "unit": "g", "aisle": "Produce"},
            {"name": "Bell Peppers & Onions", "quantity": 90, "unit": "g", "aisle": "Produce"},
            {"name": "French Green Beans", "quantity": 80, "unit": "g", "aisle": "Produce"},
            {"name": "Olive Oil & Smoked Paprika", "quantity": 12, "unit": "ml", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Brown ground turkey in a large skillet over medium-high heat with smoked paprika, cumin, and sea salt.",
            "In parallel, roast diced sweet potatoes at 200°C for 20 minutes until caramelized.",
            "Add diced bell peppers and onions to the turkey, sauteing for 5 minutes until tender.",
            "Steam green beans for 3 minutes until crisp-tender.",
            "Toss roasted sweet potatoes with turkey hash and serve warm."
        ]
    },
    {
        "id": "athletic_protein_pancakes",
        "name": "Fluffy Whey Protein Oat Pancakes with Maple Berries",
        "meal_type": "breakfast",
        "diet_types": ["balanced", "vegetarian"],
        "allergens": ["dairy", "eggs", "gluten"],
        "calories": 490,
        "protein": 40.0,
        "carbs": 60.0,
        "fats": 9.0,
        "prep_time_minutes": 10,
        "cook_time_minutes": 10,
        "description": "Golden fluffy pancakes made from whole oat flour, egg whites, and isolate vanilla whey, stacked high and topped with warm berry compote.",
        "ingredients": [
            {"name": "Whole Oat Flour", "quantity": 60, "unit": "g", "aisle": "Bakery & Grains"},
            {"name": "Vanilla Whey Protein Isolate", "quantity": 30, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Liquid Egg Whites", "quantity": 100, "unit": "ml", "aisle": "Dairy & Refrigerated"},
            {"name": "Baking Powder & Cinnamon", "quantity": 5, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Mixed Wild Berries & Pure Maple", "quantity": 80, "unit": "g", "aisle": "Produce"}
        ],
        "instructions": [
            "Blend oat flour, whey protein, egg whites, baking powder, cinnamon, and 50ml water into a smooth batter.",
            "Warm a non-stick griddle over medium heat, spray with light oil.",
            "Pour batter into 3 equal circles; flip when bubbles form on the surface (approx. 2-3 minutes).",
            "Simmer mixed berries in a small saucepan for 3 minutes until soft and saucy.",
            "Stack pancakes and pour warm berries over top."
        ]
    },

    # --- SNACKS & RECOVERY ---
    {
        "id": "snack_greek_yogurt_berry",
        "name": "High-Protein Greek Yogurt Parfait with Walnuts",
        "meal_type": "snack",
        "diet_types": ["balanced", "mediterranean", "vegetarian", "gluten_free"],
        "allergens": ["dairy", "tree_nuts"],
        "calories": 250,
        "protein": 22.0,
        "carbs": 18.0,
        "fats": 9.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Authentic strained 0% Greek yogurt layered with antioxidant-rich raspberries, raw walnut halves, and raw wildflower honey.",
        "ingredients": [
            {"name": "0% Strained Greek Yogurt", "quantity": 170, "unit": "g", "aisle": "Dairy & Refrigerated"},
            {"name": "Fresh Raspberries", "quantity": 50, "unit": "g", "aisle": "Produce"},
            {"name": "Raw Walnuts", "quantity": 15, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Raw Wildflower Honey", "quantity": 10, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Spoon cold Greek yogurt into a glass or bowl.",
            "Top with fresh raspberries and crushed raw walnuts.",
            "Drizzle with raw honey and enjoy immediately."
        ]
    },
    {
        "id": "snack_apple_almond_butter",
        "name": "Crisp Honeycrisp Apple Slices with Almond Butter",
        "meal_type": "snack",
        "diet_types": ["vegan", "vegetarian", "paleo", "gluten_free"],
        "allergens": ["tree_nuts"],
        "calories": 220,
        "protein": 5.0,
        "carbs": 26.0,
        "fats": 12.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Crisp sweet Honeycrisp apple wedges paired with all-natural creamy almond butter and a pinch of Ceylon cinnamon.",
        "ingredients": [
            {"name": "Honeycrisp Apple", "quantity": 1, "unit": "whole", "aisle": "Produce"},
            {"name": "Natural Creamy Almond Butter", "quantity": 25, "unit": "g", "aisle": "Pantry & Spices"},
            {"name": "Ground Ceylon Cinnamon", "quantity": 1, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Core and slice apple into wedges.",
            "Serve with almond butter dusted with Ceylon cinnamon for dipping."
        ]
    },
    {
        "id": "snack_edamame_sea_salt",
        "name": "Steamed Sea Salt Edamame Pods",
        "meal_type": "snack",
        "diet_types": ["vegan", "vegetarian", "balanced", "gluten_free"],
        "allergens": ["soy"],
        "calories": 180,
        "protein": 17.0,
        "carbs": 12.0,
        "fats": 7.0,
        "prep_time_minutes": 2,
        "cook_time_minutes": 5,
        "description": "Young green soybeans in pod, steamed until tender and sprinkled with flaky Maldon sea salt.",
        "ingredients": [
            {"name": "Whole Edamame in Pod", "quantity": 150, "unit": "g", "aisle": "Produce"},
            {"name": "Flaky Sea Salt", "quantity": 3, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Steam or boil edamame pods for 4-5 minutes.",
            "Drain well, toss with flaky sea salt, and serve warm."
        ]
    },
    {
        "id": "snack_hard_boiled_eggs_almonds",
        "name": "Omega-3 Boiled Eggs & Smoked Almonds",
        "meal_type": "snack",
        "diet_types": ["keto", "low_carb", "paleo", "gluten_free"],
        "allergens": ["eggs", "tree_nuts"],
        "calories": 240,
        "protein": 16.0,
        "carbs": 3.0,
        "fats": 18.0,
        "prep_time_minutes": 5,
        "cook_time_minutes": 0,
        "description": "Two seasoned omega-3 pasture-raised hard-boiled eggs paired with roasted smoked almonds.",
        "ingredients": [
            {"name": "Hard Boiled Pasture-Raised Eggs", "quantity": 2, "unit": "whole", "aisle": "Dairy & Refrigerated"},
            {"name": "Roasted Smoked Almonds", "quantity": 15, "unit": "g", "aisle": "Pantry & Spices"}
        ],
        "instructions": [
            "Peel eggs, slice in half and dust with sea salt and cracked pepper.",
            "Serve alongside roasted almonds."
        ]
    }
]

def search_recipes(
    diet_type: str = "balanced",
    meal_type: str = None,
    exclude_allergens: List[str] = None
) -> List[Dict[str, Any]]:
    """
    Search and filter recipes matching dietary protocol and allergen exclusion boundaries.
    """
    exclude_set = {a.strip().lower() for a in (exclude_allergens or []) if a.strip()}
    
    results = []
    for r in RECIPE_DATABASE:
        # Filter by meal_type if requested
        if meal_type and r.get("meal_type") != meal_type:
            continue
            
        # Check allergen exclusion
        recipe_allergens = {a.lower() for a in r.get("allergens", [])}
        if exclude_set.intersection(recipe_allergens):
            continue
            
        # Check diet type compatibility
        # If diet is 'balanced', it matches broadly; if specific (keto/vegan), matches tags
        dt = diet_type.lower()
        if dt != "balanced" and dt not in r.get("diet_types", []):
            continue
            
        results.append(r)
        
    return results
