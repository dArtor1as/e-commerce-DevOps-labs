module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/film-details',
        'http://localhost:3000/films',
        'http://localhost:3000/login',
        'http://localhost:3000/register',
        'http://localhost:3000/reviews',
      ],
      numberOfRuns: 2, // Кількість прогонів тестів
    },
    upload: {
      target: 'temporary-public-storage', // Тимчасове збереження звітів
    },
  },
};
