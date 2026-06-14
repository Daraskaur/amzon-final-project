import products from '../data/products.json';

const occasionMap = {
  'movie night': {
    healthy: [17, 8, 1, 11],           // nuts, strawberries, bananas, yogurt
    junk: [15, 21, 20, 16, 23],        // popcorn, chips, cola, chocolate, ice cream
    mix: [15, 21, 20, 16, 23, 17, 8],
    description: 'Snacks, drinks, and treats for a cozy movie night',
  },
  'breakfast': {
    essentialIds: [4, 3, 7, 19, 1, 14, 24, 25],
    description: 'Fresh breakfast essentials to start your day right',
  },
  'brunch': {
    essentialIds: [2, 19, 4, 8, 14, 11],
    description: 'Perfect brunch spread for a relaxed morning',
  },
  'dinner': {
    essentialIds: [5, 12, 10, 18, 13, 22, 26],
    description: 'Fresh ingredients for a hearty home-cooked dinner',
  },
  'party': {
    healthy: [17, 8, 11, 9, 1, 14],
    junk: [20, 15, 21, 23, 16],
    mix: [20, 15, 21, 17, 5, 12, 23],
    description: 'Food and drinks to keep the party going',
  },
  'date night': {
    essentialIds: [6, 22, 16, 23, 19],
    description: 'Special ingredients for a romantic dinner at home',
  },
  'healthy': {
    essentialIds: [1, 2, 9, 11, 6, 17, 30, 29],
    description: 'Nutritious options for a healthy lifestyle',
  },
  'bbq': {
    essentialIds: [5, 18, 20, 10, 21],
    description: 'Everything you need for a great BBQ',
  },
  'snack': {
    healthy: [17, 8, 1, 11, 2],
    junk: [15, 21, 16, 20, 23],
    mix: [15, 21, 16, 17, 8],
    description: 'Quick bites and munchies',
  },
  'meal prep': {
    essentialIds: [5, 4, 12, 26, 30, 29, 9],
    description: 'Protein-rich staples for weekly meal prep',
  },
  'fitness': {
    essentialIds: [28, 29, 30, 4, 5, 11, 1],
    description: 'High-protein items for your fitness goals',
  },
};

export function getSmartCartRecommendations(occasion, options = {}) {
  const { budget = null, people = 2, urgency = 'medium', snackMode = 'mix' } = options;
  const numPeople = people || 2;

  const query = occasion.toLowerCase().trim();
  let matchedOccasion = null;
  let matchKey = null;

  for (const [key, value] of Object.entries(occasionMap)) {
    if (query.includes(key) || key.includes(query)) {
      matchedOccasion = value;
      matchKey = key;
      break;
    }
  }

  if (!matchedOccasion) {
    const tagMatches = products.filter((p) =>
      p.tags.some((tag) => tag.includes(query) || query.includes(tag))
    );
    if (tagMatches.length > 0) {
      matchedOccasion = {
        essentialIds: tagMatches.slice(0, 6).map((p) => p.id),
        description: `Items matching "${occasion}"`,
      };
      matchKey = query;
    }
  }

  if (!matchedOccasion) return null;

  // Determine which IDs to use
  let ids;
  if (matchedOccasion.healthy && matchedOccasion.junk) {
    // This is a snack-type occasion with modes
    ids = matchedOccasion[snackMode] || matchedOccasion.mix;
  } else {
    ids = matchedOccasion.essentialIds;
  }

  let recommendedProducts = ids
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  let items = recommendedProducts.map((product) => {
    let quantity = 1;
    if (numPeople > 6) quantity = 3;
    else if (numPeople > 4) quantity = 2;
    else if (numPeople > 2) quantity = Math.ceil(numPeople / 2);
    return { product, quantity };
  });

  // Apply budget constraint
  if (budget && budget > 0) {
    let totalCost = items.reduce(
      (sum, item) => sum + (item.product.deal ? item.product.dealPrice : item.product.price) * item.quantity,
      0
    );

    while (totalCost > budget && items.length > 2) {
      const canReduce = items.find((item) => item.quantity > 1);
      if (canReduce) {
        canReduce.quantity -= 1;
      } else {
        items.sort(
          (a, b) =>
            (b.product.deal ? b.product.dealPrice : b.product.price) -
            (a.product.deal ? a.product.dealPrice : a.product.price)
        );
        items.pop();
      }
      totalCost = items.reduce(
        (sum, item) => sum + (item.product.deal ? item.product.dealPrice : item.product.price) * item.quantity,
        0
      );
    }
  }

  if (urgency === 'high') {
    items.sort((a, b) => (b.product.deal ? 1 : 0) - (a.product.deal ? 1 : 0));
  }

  const totalCost = items.reduce(
    (sum, item) => sum + (item.product.deal ? item.product.dealPrice : item.product.price) * item.quantity,
    0
  );

  return {
    items,
    totalCost,
    occasion: matchKey,
    description: matchedOccasion.description,
  };
}

export function getAvailableOccasions() {
  return Object.keys(occasionMap);
}
