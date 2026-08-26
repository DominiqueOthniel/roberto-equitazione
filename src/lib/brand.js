export const BRAND = {
  name: 'Madison Equestrian',
  shortName: 'Madison',
  email: 'madisoncook906@gmail.com',
  whatsapp: '+17327559815',
  whatsappDisplay: '+1 732 755 9815',
  whatsappUrl: 'https://wa.me/17327559815',
  instagramUrl: 'https://www.instagram.com/madison_____equestrian?igsi=MWFybnJweDV5dGMzdQ==',
  country: 'United States',
  logo: '/assets/images/madison-logo.png',
};

export function formatPrice(price) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(parseFloat(price || 0));
}
