/**
 * Restaurant Central Configuration
 * Easy config for admin details, contact numbers, ratings, business hours and services.
 */
export const restaurantConfig = {
  // Main administrative settings
  restaurantName: "GD's Fast Food",
  establishedYear: 1986,

  // Main phone number for voice calls (formatted for tel: protocol)
  phone: "+919892323968",

  // WhatsApp Link (Direct Catalog, Message link, or Group invite link)
  whatsappUrl: "https://wa.me/c/919892323968",

  // Google Maps location search URL
  googleMapsUrl: "https://maps.google.com/?q=GD's+Fast+Food+Tilak+Nagar+Chembur+Mumbai",

  // Average Google Rating & Reviews
  googleRating: 4.7,
  reviewsCount: 328,

  // Business Hours (24h format "HH:MM")
  openingTime: "11:00",
  closingTime: "23:30",

  // Service availability list
  services: ["Home Delivery", "Dine In", "Take Away"],

  // Chef's Daily Recommendations (Today's Specials)
  todaysSpecials: [
    {
      name: "Chicken Tikka Biryani",
      price: "290",
      description: "Aromatic basmati rice layered with juicy, spiced tandoori chicken tikka pieces.",
      type: "nonveg"
    },
    {
      name: "Paneer Cheese Roll",
      price: "180",
      description: "Buttery paratha loaded with spiced tandoori paneer cubes, fresh onions, and melted cheese.",
      type: "veg"
    },
    {
      name: "Special Chicken Burger",
      price: "170",
      description: "Crispy seasoned chicken patty topped with fresh lettuce, double cheese, and chef's spicy house sauce.",
      type: "nonveg"
    }
  ]
};
