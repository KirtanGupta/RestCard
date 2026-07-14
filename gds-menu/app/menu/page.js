import MenuGallery from '@/components/MenuGallery';

export const metadata = {
  title: "GD's Fast Food — Menu",
  description:
    "Browse the complete menu of GD's Fast Food, Chembur Mumbai. Non-veg specialties, biryani, and more since 1986.",
};

// Menu images stored in public/menu/
const MENU_IMAGES = [
  { src: '/menu/1.png', alt: "GD's Fast Food Menu Page 1 — Introduction & Contact" },
  { src: '/menu/2.png', alt: "GD's Fast Food Menu Page 2" },
  { src: '/menu/3.png', alt: "GD's Fast Food Menu Page 3" },
  { src: '/menu/4.png', alt: "GD's Fast Food Menu Page 4" },
  { src: '/menu/5.png', alt: "GD's Fast Food Menu Page 5" },
  { src: '/menu/6.png', alt: "GD's Fast Food Menu Page 6" },
  { src: '/menu/7.png', alt: "GD's Fast Food Menu Page 7" },
  { src: '/menu/8.png', alt: "GD's Fast Food Menu Page 8 — Thank You" },
];

export default function MenuPage() {
  return <MenuGallery images={MENU_IMAGES} />;
}
