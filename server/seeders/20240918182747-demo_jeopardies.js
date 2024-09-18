'use strict';

/** @type {import('sequelize-cli').Migration,
        createdAt: timestamp,
        updatedAt: timestamp
      } */
module.exports = {
  async up (queryInterface, Sequelize) {
    const timestamp = new Date(); // Current timestamp for createdAt and updatedAt
    await queryInterface.bulkInsert('Jeopardies', [{'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'HISTORY',
      'Value': 200,
      'Question': "For the last 8 years of his life, Galileo was under house arrest for espousing this man's theory",
      'Answer': 'Copernicus',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': "ESPN's TOP 10 ALL-TIME ATHLETES",
      'Value': 200,
      'Question': 'No. 2: 1912 Olympian; football star at Carlisle Indian School; 6 MLB seasons with the Reds, Giants & Braves',
      'Answer': 'Jim Thorpe',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EVERYBODY TALKS ABOUT IT...',
      'Value': 200,
      'Question': 'The city of Yuma in this state has a record average of 4,055 hours of sunshine each year',
      'Answer': 'Arizona',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'THE COMPANY LINE',
      'Value': 200,
      'Question': 'In 1963, live on "The Art Linkletter Show", this company served its billionth burger',
      'Answer': "McDonald's",
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EPITAPHS & TRIBUTES',
      'Value': 200,
      'Question': 'Signer of the Dec. of Indep., framer of the Constitution of Mass., second President of the United States',
      'Answer': 'John Adams',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': '3-LETTER WORDS',
      'Value': 200,
      'Question': 'In the title of an Aesop fable, this insect shared billing with a grasshopper',
      'Answer': 'the ant',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'HISTORY',
      'Value': 400,
      'Question': "Built in 312 B.C. to link Rome & the South of Italy, it's still in use today",
      'Answer': 'the Appian Way',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': "ESPN's TOP 10 ALL-TIME ATHLETES",
      'Value': 400,
      'Question': 'No. 8: 30 steals for the Birmingham Barons; 2,306 steals for the Bulls',
      'Answer': 'Michael Jordan',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EVERYBODY TALKS ABOUT IT...',
      'Value': 400,
      'Question': 'In the winter of 1971-72, a record 1,122 inches of snow fell at Rainier Paradise Ranger Station in this state',
      'Answer': 'Washington',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'THE COMPANY LINE',
      'Value': 400,
      'Question': 'This housewares store was named for the packaging its merchandise came in & was first displayed on',
      'Answer': 'Crate & Barrel',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EPITAPHS & TRIBUTES',
      'Value': 400,
      'Question': '"And away we go"',
      'Answer': 'Jackie Gleason',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': '3-LETTER WORDS',
      'Value': 400,
      'Question': 'Cows regurgitate this from the first stomach to the mouth & chew it again',
      'Answer': 'the cud',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'HISTORY',
      'Value': 600,
      'Question': 'In 1000 Rajaraja I of the Cholas battled to take this Indian Ocean island now known for its tea',
      'Answer': 'Ceylon (or Sri Lanka)',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': "ESPN's TOP 10 ALL-TIME ATHLETES",
      'Value': 600,
      'Question': 'No. 1: Lettered in hoops, football & lacrosse at Syracuse & if you think he couldn\'t act, ask his 11 "unclean" buddies',
      'Answer': 'Jim Brown',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EVERYBODY TALKS ABOUT IT...',
      'Value': 600,
      'Question': "On June 28, 1994 the nat'l weather service began issuing this index that rates the intensity of the sun's radiation",
      'Answer': 'the UV index',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'THE COMPANY LINE',
      'Value': 600,
      'Question': "This company's Accutron watch, introduced in 1960, had a guarantee of accuracy to within one minute a  month",
      'Answer': 'Bulova',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EPITAPHS & TRIBUTES',
      'Value': 600,
      'Question': 'Outlaw: "Murdered by a traitor and a coward whose name is not worthy to appear here"',
      'Answer': 'Jesse James',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': '3-LETTER WORDS',
      'Value': 600,
      'Question': 'A small demon, or a mischievous child (who might be a little demon!)',
      'Answer': 'imp',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'HISTORY',
      'Value': 800,
      'Question': 'Karl led the first of these Marxist organizational efforts; the second one began in 1889',
      'Answer': 'the International',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': "ESPN's TOP 10 ALL-TIME ATHLETES",
      'Value': 800,
      'Question': 'No. 10: FB/LB for Columbia U. in the 1920s; MVP for the Yankees in \'27 & \'36; "Gibraltar in Cleats"',
      'Answer': '(Lou) Gehrig',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EVERYBODY TALKS ABOUT IT...',
      'Value': 800,
      'Question': "Africa's lowest temperature was 11 degrees below zero in 1935 at Ifrane, just south of Fez in this country",
      'Answer': 'Morocco',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'THE COMPANY LINE',
      'Value': 800,
      'Question': 'Edward Teller & this man partnered in 1898 to sell high fashions to women',
      'Answer': '(Paul) Bonwit',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'EPITAPHS & TRIBUTES',
      'Value': 2000,
      'Question': '1939 Oscar winner: "...you are a credit to your craft, your race and to your family"',
      'Answer': 'Hattie McDaniel (for her role in Gone with the Wind)',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': '3-LETTER WORDS',
      'Value': 800,
      'Question': 'In geologic time one of these, shorter than an eon, is divided into periods & subdivided into epochs',
      'Answer': 'era',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Jeopardy!',
      'Category': 'HISTORY',
      'Value': 1000,
      'Question': 'This Asian political party was founded in 1885 with "Indian National" as part of its name',
      'Answer': 'the Congress Party',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'DR. SEUSS AT THE MULTIPLEX',
      'Value': 400,
      'Question': '<a href="http://www.j-archive.com/media/2004-12-31_DJ_23.mp3">Beyond ovoid abandonment, beyond ovoid betrayal... you won\'t believe the ending when he "Hatches the Egg"</a>',
      'Answer': 'Horton',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'PRESIDENTIAL STATES OF BIRTH',
      'Value': 400,
      'Question': 'California',
      'Answer': 'Nixon',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'AIRLINE TRAVEL',
      'Value': 400,
      'Question': 'It can be a place to leave your puppy when you take a trip, or a carrier for him that fits under an airplane seat',
      'Answer': 'a kennel',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'THAT OLD-TIME RELIGION',
      'Value': 400,
      'Question': "He's considered the author of the Pentateuch, which is hard to believe, as Deuteronomy continues after his death",
      'Answer': 'Moses',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'MUSICAL TRAINS',
      'Value': 400,
      'Question': 'Steven Tyler of this band lent his steamin\' vocals to "Train Kept A-Rollin\'", first popularized by the Yardbirds',
      'Answer': 'Aerosmith',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': '"X"s & "O"s',
      'Value': 400,
      'Question': 'Around 100 A.D. Tacitus wrote a book on how this art of persuasive speaking had declined since Cicero',
      'Answer': 'oratory',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'PRESIDENTIAL STATES OF BIRTH',
      'Value': 800,
      'Question': '1 of the 2 born in Vermont',
      'Answer': 'Coolidge (or Chester Arthur)',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'AIRLINE TRAVEL',
      'Value': 800,
      'Question': "When it began on Pan Am & Qantas in the late '70s, it was basically a roped-off part of the economy cabin with free drinks",
      'Answer': 'business class',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'THAT OLD-TIME RELIGION',
      'Value': 800,
      'Question': "Ali, who married this man's daughter Fatima, is considered by Shia Muslims to be his true successor",
      'Answer': 'Muhammed',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'MUSICAL TRAINS',
      'Value': 800,
      'Question': 'During the 1954-1955 Sun sessions, Elvis climbed aboard this train "sixteen coaches long"',
      'Answer': 'the "Mystery Train"',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': '"X"s & "O"s',
      'Value': 800,
      'Question': 'The shorter glass seen <a href="http://www.j-archive.com/media/2004-12-31_DJ_12.jpg" target="_blank">here</a>, or a quaint cocktail made with sugar & bitters',
      'Answer': 'an old-fashioned',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'DR. SEUSS AT THE MULTIPLEX',
      'Value': 1200,
      'Question': '<a href="http://www.j-archive.com/media/2004-12-31_DJ_26.mp3">Ripped from today\'s headlines, he was a turtle king gone mad; Mack was the one good turtle who\'d bring him down</a>',
      'Answer': 'Yertle',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'AIRLINE TRAVEL',
      'Value': 2000,
      'Question': "In 2003 this airline agreed to buy KLM, creating Europe's largest airline",
      'Answer': 'Air France',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'THAT OLD-TIME RELIGION',
      'Value': 1200,
      'Question': 'Philadelphia got its start as a colony for this religious group of which William Penn was a member',
      'Answer': 'the Quakers',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'MUSICAL TRAINS',
      'Value': 1200,
      'Question': 'This "Modern Girl" first hit the Billboard Top 10 with "Morning Train (Nine To Five)"',
      'Answer': '(Sheena) Easton',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': '"X"s & "O"s',
      'Value': 1200,
      'Question': "This stiff silken fabric is favored for bridal gowns, like Christina Applegate's in 2001",
      'Answer': 'organza',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'DR. SEUSS AT THE MULTIPLEX',
      'Value': 1600,
      'Question': '<a href="http://www.j-archive.com/media/2004-12-31_DJ_25.mp3">Somewhere between truth & fiction lies Marco\'s reality... on Halloween, you won\'t believe you saw it on this St.</a>',
      'Answer': 'Mulberry Street',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'AIRLINE TRAVEL',
      'Value': 1600,
      'Question': 'In 2004 United launched this new service that features low fares & more seats per plane',
      'Answer': 'Ted',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'THAT OLD-TIME RELIGION',
      'Value': 1600,
      'Question': "With Mary I's accession in 1553 he ran to Geneva; he returned in 1559 & reformed the Church of Scotland",
      'Answer': '(John) Knox',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'MUSICAL TRAINS',
      'Value': 1600,
      'Question': 'This band\'s "Train In Vain" was a hidden track on its original 1979 "London Calling" album',
      'Answer': 'The Clash',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': '"X"s & "O"s',
      'Value': 1600,
      'Question': 'Cross-country skiing is sometimes referred to by these 2 letters, the same ones used to denote 90 in Roman numerals',
      'Answer': 'XC',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'DR. SEUSS AT THE MULTIPLEX',
      'Value': 2000,
      'Question': '<a href="http://www.j-archive.com/media/2004-12-31_DJ_24.mp3">"500 Hats"... 500 ways to die.  On July 4th, this young boy will defy a king... & become a legend</a>',
      'Answer': 'Bartholomew Cubbins',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'AIRLINE TRAVEL',
      'Value': 2000,
      'Question': 'In the seat pocket you\'ll find the catalog called "Sky" this, with must-haves like a solar-powered patio umbrella',
      'Answer': 'Mall',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'THAT OLD-TIME RELIGION',
      'Value': 3200,
      'Question': 'In 1534 he & his buddy Francis Xavier founded the Society of Jesus',
      'Answer': '(St. Ignatius) Loyola',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Double Jeopardy!',
      'Category': 'MUSICAL TRAINS',
      'Value': 2000,
      'Question': 'In 1961 James Brown announced "all aboard" for this train',
      'Answer': '"Night Train"',
        createdAt: timestamp,
        updatedAt: timestamp
      },
     {'show_number': 4680,
      'Round': 'Final Jeopardy!',
      'Category': 'THE SOLAR SYSTEM',
      'Value': 0,
      'Question': 'Objects that pass closer to the sun than Mercury have been named for this mythological figure',
      'Answer': 'Icarus',
        createdAt: timestamp,
        updatedAt: timestamp
      }], {});
    },

      async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Jeopardies', null, {});
      }
    };
