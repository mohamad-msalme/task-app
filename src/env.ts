if (process.env.NODE_ENV === 'production') {
        require('dotenv').config({ path: '.env.production' });
      } else {
        require('dotenv').config({ path: '.env.development' });
}
      