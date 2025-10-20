// server/data/cardData.js
const cardData = {
  deck: [

    // Action Cards (cyan) - 5 cards
    { 
      id: 1, 
      type: 'action', 
      subtype: 'exchange', 
      name: 'تبادل', 
      description: 'تبادل بطاقة مع لاعب آخر',
      image: '/images/cards/exchange.jpg'
    },
    { 
      id: 2, 
      type: 'action', 
      subtype: 'skip', 
      name: 'تخطي', 
      description: 'تخطي دور لاعب آخر',
      image: '/images/cards/skip.jpg'
    },
    { 
      id: 3, 
      type: 'action', 
      subtype: 'lose_cards', 
      name: 'خسارة البطاقات', 
      description: 'اجعل لاعب يخسر كل بطاقاته',
      image: '/images/cards/lose.jpg'
    },
    { 
      id: 4, 
      type: 'action', 
      subtype: 'joker', 
      name: 'جوكر', 
      description: 'استخدمه كبطاقة ثالثة لإكمال الفئة',
      image: '/images/cards/joker.jpg'
    },
    { 
      id: 5, 
      type: 'action', 
      subtype: 'give_me_card', 
      name: 'أعطني بطاقة', 
      description: 'خذ بطاقة من أي لاعب',
      image: '/images/cards/give.jpg'
    },


    // Actors
    // { id: 6, type: 'actor', name: 'Leonardo DiCaprio', image: '/images/cards/acmilan.jpg' },
    // { id: 7, type: 'actor', name: 'Meryl Streep', image: '/images/cards/africa cup .jpg' },
    // { id: 8, type: 'actor', name: 'Tom Hanks', image: '/images/cards/Africa Map.jpg' },
    // { id: 9, type: 'actor', name: 'Jennifer Lawrence', image: '/images/cards/ajax.jpg' },
    // { id: 10, type: 'actor', name: 'Brad Pitt', image: '/images/cards/alex ferg.jpg' },
    // { id: 11, type: 'actor', name: 'Angelina Jolie', image: '/images/cards/Argentina.jpg' },
    // { id: 12, type: 'actor', name: 'Robert De Niro', image: '/images/cards/ahmed_barada.jpg' },
    // { id: 13, type: 'actor', name: 'Emma Watson', image: '/images/cards/ahmed_diab.jpg' },
    // { id: 14, type: 'actor', name: 'Johnny Depp', image: '/images/cards/ahmed_farahat.webp' },
    // { id: 15, type: 'actor', name: 'Scarlett Johansson', image: '/images/cards/ahmed_haroon.jpg' },
    // { id: 16, type: 'actor', name: 'Will Smith', image: '/images/cards/Ahmed_Kamal.png' },
    // { id: 17, type: 'actor', name: 'Nicolas Cage', image: '/images/cards/Ahmed_Magdy.jpg' },
    // { id: 18, type: 'actor', name: 'Morgan Freeman', image: '/images/cards/Ahmed_Malek.jpg' },
    // { id: 19, type: 'actor', name: 'Denzel Washington', image: '/images/cards/Ahmed_Mazhar.jpg' },
    // { id: 20, type: 'actor', name: 'Julia Roberts', image: '/images/cards/Ahmed_Mekky.jpg' },
    // { id: 21, type: 'actor', name: 'Chris Evans', image: '/images/cards/Ahmed_Wafiq.png' },
    // { id: 22, type: 'actor', name: 'Robert Downey Jr.', image: '/images/cards/Ahmed_Zaki.jpg' },
    // { id: 23, type: 'actor', name: 'Samuel L. Jackson', image: '/images/cards/amgad_abed.png' },
    // { id: 19, type: 'actor', name: 'Mark Wahlberg', image: '/images/cards/mark.jpg' },
    // { id: 20, type: 'actor', name: 'Matt Damon', image: '/images/cards/matt.jpg' },

    // Movies
    // { id: 21, type: 'movie', name: 'The Godfather', image: '/images/cards/godfather.jpg' },
    // { id: 22, type: 'movie', name: 'Titanic', image: '/images/cards/titanic.jpg' },
    // { id: 23, type: 'movie', name: 'Inception', image: '/images/cards/inception.jpg' },
    // { id: 24, type: 'movie', name: 'The Dark Knight', image: '/images/cards/darkknight.jpg' },
    // { id: 25, type: 'movie', name: 'Pulp Fiction', image: '/images/cards/pulp.jpg' },
    // { id: 26, type: 'movie', name: 'Forrest Gump', image: '/images/cards/forrest.jpg' },
    // { id: 27, type: 'movie', name: 'The Matrix', image: '/images/cards/matrix.jpg' },
    // { id: 28, type: 'movie', name: 'Star Wars', image: '/images/cards/starwars.jpg' },
    // { id: 29, type: 'movie', name: 'Avatar', image: '/images/cards/avatar.jpg' },
    // { id: 30, type: 'movie', name: 'Jurassic Park', image: '/images/cards/jurassic.jpg' },
    // { id: 31, type: 'movie', name: 'The Shawshank Redemption', image: '/images/cards/shawshank.jpg' },
    // { id: 32, type: 'movie', name: 'Fight Club', image: '/images/cards/fightclub.jpg' },
    // { id: 33, type: 'movie', name: 'The Lord of the Rings', image: '/images/cards/lotr.jpg' },
    // { id: 34, type: 'movie', name: 'Harry Potter', image: '/images/cards/harrypotter.jpg' },
    // { id: 35, type: 'movie', name: 'The Avengers', image: '/images/cards/avengers.jpg' },
    // { id: 36, type: 'movie', name: 'Black Panther', image: '/images/cards/blackpanther.jpg' },
    // { id: 37, type: 'movie', name: 'Interstellar', image: '/images/cards/interstellar.jpg' },
    // { id: 38, type: 'movie', name: 'The Wolf of Wall Street', image: '/images/cards/wolf.jpg' },
    // { id: 39, type: 'movie', name: 'La La Land', image: '/images/cards/lalaland.jpg' },
    // { id: 40, type: 'movie', name: 'Joker', image: '/images/cards/joker.jpg' },

    // Directors
    // { id: 41, type: 'director', name: 'Steven Spielberg', image: '/images/cards/spielberg.jpg' },
    // { id: 42, type: 'director', name: 'Christopher Nolan', image: '/images/cards/nolan.jpg' },
    // { id: 43, type: 'director', name: 'Martin Scorsese', image: '/images/cards/scorsese.jpg' },
    // { id: 44, type: 'director', name: 'Quentin Tarantino', image: '/images/cards/tarantino.jpg' },
    // { id: 45, type: 'director', name: 'James Cameron', image: '/images/cards/cameron.jpg' },
    // { id: 46, type: 'director', name: 'Alfred Hitchcock', image: '/images/cards/hitchcock.jpg' },
    // { id: 47, type: 'director', name: 'Stanley Kubrick', image: '/images/cards/kubrick.jpg' },
    // { id: 48, type: 'director', name: 'Tim Burton', image: '/images/cards/burton.jpg' },
    // { id: 49, type: 'director', name: 'Ridley Scott', image: '/images/cards/ridley.jpg' },
    // { id: 50, type: 'director', name: 'Peter Jackson', image: '/images/cards/peter.jpg' },
    // { id: 51, type: 'director', name: 'David Fincher', image: '/images/cards/fincher.jpg' },
    // { id: 52, type: 'director', name: 'Francis Ford Coppola', image: '/images/cards/coppola.jpg' },
    // { id: 53, type: 'director', name: 'George Lucas', image: '/images/cards/lucas.jpg' },
    // { id: 54, type: 'director', name: 'Clint Eastwood', image: '/images/cards/eastwood.jpg' },
    // { id: 55, type: 'director', name: 'Woody Allen', image: '/images/cards/allen.jpg' },

    // Add more cards to reach 60 total
    // { id: 56, type: 'actor', name: 'Keanu Reeves', image: '/images/cards/keanu.jpg' },
    // { id: 57, type: 'actor', name: 'Charlize Theron', image: '/images/cards/charlize.jpg' },
    // { id: 58, type: 'movie', name: 'Mad Max: Fury Road', image: '/images/cards/madmax.jpg' },
    // { id: 59, type: 'movie', name: 'The Silence of the Lambs', image: '/images/cards/silence.jpg' },
    // { id: 60, type: 'director', name: 'Guillermo del Toro', image: '/images/cards/deltoro.jpg' }
  ]
};

module.exports = cardData;

