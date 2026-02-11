-- Seed recipes: diverse cuisines for a good starting library
INSERT INTO recipes (user_id, title, description, ingredients, instructions, servings, prep_time_minutes, cook_time_minutes, tags, is_ai_generated) VALUES

('seed', 'Classic Spaghetti Bolognese', 'A hearty Italian pasta with rich, slow-simmered meat sauce.',
  ARRAY['400g spaghetti','500g ground beef','1 onion, diced','3 cloves garlic, minced','400g canned crushed tomatoes','2 tbsp tomato paste','1 tsp dried oregano','1 tsp dried basil','Salt and pepper to taste','2 tbsp olive oil','Parmesan cheese for serving'],
  ARRAY['Cook spaghetti according to package directions. Drain and set aside.','Heat olive oil in a large pan over medium-high heat. Add ground beef and cook until browned, breaking it up.','Add onion and garlic, sauté for 3 minutes until softened.','Stir in crushed tomatoes, tomato paste, oregano, and basil.','Reduce heat and simmer for 20 minutes, stirring occasionally.','Season with salt and pepper. Serve sauce over spaghetti topped with Parmesan.'],
  4, 10, 30, ARRAY['italian','pasta','dinner','comfort food'], false),

('seed', 'Chicken Stir-Fry with Vegetables', 'Quick and colorful stir-fry with tender chicken and crisp veggies in a savory sauce.',
  ARRAY['500g chicken breast, sliced thin','1 red bell pepper, sliced','1 broccoli head, cut into florets','2 carrots, julienned','3 tbsp soy sauce','1 tbsp sesame oil','1 tbsp cornstarch','2 cloves garlic, minced','1 tbsp fresh ginger, grated','2 tbsp vegetable oil','Steamed rice for serving'],
  ARRAY['Mix soy sauce, sesame oil, and cornstarch in a small bowl. Set aside.','Heat vegetable oil in a wok over high heat.','Add chicken and stir-fry for 4-5 minutes until cooked through. Remove and set aside.','Add garlic and ginger, stir for 30 seconds.','Add bell pepper, broccoli, and carrots. Stir-fry for 3-4 minutes until crisp-tender.','Return chicken to the wok. Pour sauce over and toss to coat.','Cook for 1-2 minutes until sauce thickens. Serve over steamed rice.'],
  4, 15, 15, ARRAY['asian','chicken','quick','dinner','healthy'], false),

('seed', 'Greek Salad', 'Fresh and vibrant Mediterranean salad with creamy feta and tangy dressing.',
  ARRAY['4 large tomatoes, chopped','1 cucumber, sliced','1 red onion, thinly sliced','200g feta cheese, cubed','100g Kalamata olives','1 green bell pepper, sliced','3 tbsp extra virgin olive oil','1 tbsp red wine vinegar','1 tsp dried oregano','Salt and pepper to taste'],
  ARRAY['Combine tomatoes, cucumber, red onion, bell pepper, and olives in a large bowl.','Top with feta cheese cubes.','Whisk together olive oil, red wine vinegar, oregano, salt, and pepper.','Drizzle dressing over salad. Toss gently and serve immediately.'],
  4, 15, 0, ARRAY['greek','salad','vegetarian','healthy','lunch','quick'], false),

('seed', 'Creamy Tomato Soup', 'Velvety smooth tomato soup with a touch of cream—perfect with crusty bread.',
  ARRAY['800g canned whole tomatoes','1 onion, diced','3 cloves garlic, minced','2 tbsp butter','500ml vegetable broth','100ml heavy cream','1 tsp sugar','Salt and pepper to taste','Fresh basil for garnish'],
  ARRAY['Melt butter in a large pot over medium heat. Add onion and sauté for 5 minutes.','Add garlic and cook for 1 minute.','Add canned tomatoes with juice, vegetable broth, and sugar.','Bring to a boil, then reduce heat and simmer for 15 minutes.','Blend soup with an immersion blender until smooth.','Stir in heavy cream. Season with salt and pepper.','Serve garnished with fresh basil leaves.'],
  4, 10, 25, ARRAY['soup','vegetarian','comfort food','lunch','dinner'], false),

('seed', 'Fluffy Pancakes', 'Light and fluffy breakfast pancakes—a weekend morning staple.',
  ARRAY['250g all-purpose flour','2 tbsp sugar','1 tbsp baking powder','1/2 tsp salt','300ml milk','2 eggs','3 tbsp melted butter','1 tsp vanilla extract','Maple syrup and fresh berries for serving'],
  ARRAY['Whisk together flour, sugar, baking powder, and salt in a large bowl.','In a separate bowl, whisk milk, eggs, melted butter, and vanilla.','Pour wet ingredients into dry and stir until just combined. Do not overmix.','Heat a non-stick pan over medium heat. Lightly grease with butter.','Pour 1/4 cup batter per pancake. Cook until bubbles form on surface, then flip.','Cook for 1-2 more minutes until golden. Serve with maple syrup and berries.'],
  4, 10, 15, ARRAY['breakfast','sweet','quick','american'], false),

('seed', 'Vegetable Curry', 'Aromatic and warming curry loaded with vegetables in a creamy coconut sauce.',
  ARRAY['2 potatoes, cubed','1 can chickpeas, drained','200g green beans, trimmed','1 red bell pepper, chopped','400ml coconut milk','3 tbsp curry paste','1 onion, diced','3 cloves garlic, minced','1 tbsp vegetable oil','Fresh cilantro for garnish','Steamed rice for serving'],
  ARRAY['Heat oil in a large pot over medium heat. Sauté onion for 5 minutes.','Add garlic and curry paste, cook for 1 minute until fragrant.','Add potatoes and stir to coat. Cook for 3 minutes.','Pour in coconut milk and bring to a simmer.','Add chickpeas and green beans. Cover and cook for 15 minutes.','Add bell pepper and cook for 5 more minutes until all vegetables are tender.','Garnish with cilantro and serve over steamed rice.'],
  4, 15, 25, ARRAY['indian','vegetarian','vegan','curry','dinner','healthy'], false),

('seed', 'Salmon with Lemon Dill Sauce', 'Pan-seared salmon fillets topped with a bright and creamy lemon dill sauce.',
  ARRAY['4 salmon fillets (150g each)','2 tbsp olive oil','Salt and pepper to taste','100ml heavy cream','Juice of 1 lemon','2 tbsp fresh dill, chopped','1 clove garlic, minced','1 tbsp butter'],
  ARRAY['Season salmon fillets with salt and pepper.','Heat olive oil in a large skillet over medium-high heat.','Place salmon skin-side up. Cook for 4 minutes until golden. Flip and cook 3 more minutes.','Remove salmon and set aside. Reduce heat to medium.','Add butter and garlic to the same pan. Cook for 30 seconds.','Add cream, lemon juice, and dill. Simmer for 2 minutes until slightly thickened.','Pour sauce over salmon and serve immediately.'],
  4, 10, 15, ARRAY['fish','seafood','dinner','quick','healthy'], false),

('seed', 'Banana Oat Smoothie', 'Creamy and energizing breakfast smoothie packed with oats, banana, and honey.',
  ARRAY['2 ripe bananas','60g rolled oats','400ml milk','2 tbsp honey','1 tsp cinnamon','4 ice cubes'],
  ARRAY['Add all ingredients to a blender.','Blend on high for 60 seconds until smooth and creamy.','Pour into glasses and serve immediately.'],
  2, 5, 0, ARRAY['breakfast','smoothie','quick','healthy','snack'], false),

('seed', 'Beef Tacos', 'Seasoned beef tacos with fresh toppings—a crowd-pleasing weeknight dinner.',
  ARRAY['500g ground beef','8 taco shells','1 packet taco seasoning','1 tomato, diced','1 cup shredded lettuce','100g shredded cheddar cheese','100ml sour cream','1 avocado, sliced','Lime wedges','Hot sauce (optional)'],
  ARRAY['Cook ground beef in a skillet over medium-high heat until browned. Drain excess fat.','Add taco seasoning and water according to packet directions. Simmer for 5 minutes.','Warm taco shells according to package directions.','Fill each shell with seasoned beef.','Top with lettuce, tomato, cheese, avocado, and sour cream.','Serve with lime wedges and hot sauce on the side.'],
  4, 10, 15, ARRAY['mexican','beef','dinner','quick','tacos'], false),

('seed', 'Overnight Oats', 'No-cook breakfast oats that you prep the night before—grab and go in the morning.',
  ARRAY['200g rolled oats','400ml milk','200g Greek yogurt','2 tbsp chia seeds','2 tbsp maple syrup','1 tsp vanilla extract','Fresh fruit for topping'],
  ARRAY['Mix oats, milk, yogurt, chia seeds, maple syrup, and vanilla in a bowl.','Divide into 4 jars or containers.','Cover and refrigerate overnight (at least 6 hours).','In the morning, top with fresh fruit and enjoy cold.'],
  4, 10, 0, ARRAY['breakfast','healthy','meal prep','quick','no-cook'], false);
