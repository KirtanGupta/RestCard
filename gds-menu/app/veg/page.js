import MenuGallery from '@/components/MenuGallery';

export const metadata = {
  title: "GD's Fast Food — Veg Menu",
  description:
    "Browse the complete vegetarian menu of GD's Fast Food, Tilak Nagar, Chembur Mumbai. Pure veg delights since 1986.",
};

// Veg menu images stored in public/menu/
const VEG_IMAGES = [
  { src: '/menu/1.png',    alt: "GD's Fast Food — Menu Cover & Contact Info" },
  { src: '/menu/Veg1.png', alt: "GD's Fast Food Veg Menu Page 1" },
  { src: '/menu/Veg2.png', alt: "GD's Fast Food Veg Menu Page 2" },
  { src: '/menu/Veg3.png', alt: "GD's Fast Food Veg Menu Page 3" },
];

export default function VegMenuPage() {
  return <MenuGallery images={VEG_IMAGES} />;
}
