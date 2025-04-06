import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const featured = [
  {
    name: 'Classic',
    ingredients:
      'Potato bun, smashed Swiss beef patty, cheddar cheese, diced onions, ketchup, mustard',
    prices: { single: 10, double: 20, triple: 25 },
    image: '1.webp',
  },
  {
    name: 'Fancy',
    ingredients:
      'Potato bun, smashed Swiss beef patty, salad leaves, tomatoes, onion slice, cheddar cheese, secret sauce.',
    prices: { single: 14, double: 24, triple: 29 },
    image: '1.webp',
  },
  {
    name: 'Elegant',
    ingredients:
      'Potato bun, smashed Swiss Beef patty, salad leaves, tomatoes, onion slice, cheddar cheese, secret sauce, and packed with cheese!',
    prices: { single: 16, double: 18, triple: 39 },
    image: '1.webp',
  },
];

export default function FeaturedCarousel() {
  return (
    <div className="burger-carousel container py-5">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView={1}
        loop={true}
      >
        {featured.map((featured, index) => (
          <SwiperSlide key={index}>
            <div className="text-center">
              <img
                src={featured.image}
                alt={featured.name}
                className="img-fluid mb-4"
                style={{ maxHeight: '150px', objectFit: 'contain' }}
              />
              <h4 className="fw-bold">{featured.name}</h4>
              <p>
                <strong>INGREDIENTS:</strong> {featured.ingredients}
              </p>
              <p className="fw-bold">
                SINGLE{' '}
                <span className="text-danger">
                  CHF {featured.prices.single}
                </span>{' '}
                / DOUBLE{' '}
                <span className="text-danger">
                  CHF {featured.prices.double}
                </span>{' '}
                / TRIPLE{' '}
                <span className="text-danger">
                  CHF {featured.prices.triple}
                </span>
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
