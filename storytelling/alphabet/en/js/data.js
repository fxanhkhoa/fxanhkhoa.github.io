/**
 * Alphabet Odyssey - Educational & Thematic Data for Letters A to Z
 * Comprehensive dataset including phonics, rhymes, stories, vocabulary, colors, and 3D prop identifiers.
 */

export const ALPHABET_DATA = [
  {
    letter: "A",
    title: "A is for Astronaut & Apple",
    phonics: "/æ/ — as in cat, apple, astronaut",
    speechText: "A is for Astronaut and Apple! /æ/!",
    rhyme: "Aim for the stars and take a sweet bite, an astronaut floating in satellite light!",
    story: "Commander Alex glides gently through the cosmos, gazing at constellations while holding a crisp red apple. In zero gravity, curiosity is your greatest rocket fuel!",
    vocab: [
      { word: "Astronaut", emoji: "👨‍🚀", def: "A cosmic voyager traveling beyond the sky" },
      { word: "Apple", emoji: "🍎", def: "A sweet, crunchy fruit grown in sunny orchards" },
      { word: "Acorn", emoji: "🌰", def: "The tiny seed that grows into a mighty oak" },
      { word: "Airplane", emoji: "✈️", def: "A winged vessel gliding across the clouds" },
      { word: "Aurora", emoji: "🌌", def: "Dancing neon ribbons of polar light" }
    ],
    theme: {
      primary: "#FF4757",
      secondary: "#FFA502",
      accent: "#FFD32A",
      bgGradient: "linear-gradient(135deg, #2b1020 0%, #150921 50%, #0d0614 100%)",
      textColor: "#FFEAA7",
      threeColor: 0xff3838,
      threePropColor: 0xffaa00
    },
    noteFreq: 261.63, // C4
    propType: "astronaut"
  },
  {
    letter: "B",
    title: "B is for Butterfly & Bee",
    phonics: "/b/ — as in bear, bee, butterfly",
    speechText: "B is for Butterfly and Bee! /b/!",
    rhyme: "Fluttering wings of sapphire and blue, a busy bee buzzing with nectar for you!",
    story: "Bella the butterfly flutters over a clover meadow, whispering secrets to Benny the bumblebee. Together they paint the morning air with iridescent wings and golden honey.",
    vocab: [
      { word: "Butterfly", emoji: "🦋", def: "A delicate insect with kaleidoscopic wings" },
      { word: "Bee", emoji: "🐝", def: "A hardworking pollinator who crafts sweet honey" },
      { word: "Bicycle", emoji: "🚲", def: "A two-wheeled ride powered by pedals and joy" },
      { word: "Balloon", emoji: "🎈", def: "A lightweight orb rising high into the sky" },
      { word: "Breeze", emoji: "🍃", def: "A gentle wind that whispers through the trees" }
    ],
    theme: {
      primary: "#2ED573",
      secondary: "#1E90FF",
      accent: "#7BED9F",
      bgGradient: "linear-gradient(135deg, #092618 0%, #0a1c2a 50%, #071018 100%)",
      textColor: "#E4FBE8",
      threeColor: 0x2ed573,
      threePropColor: 0x1e90ff
    },
    noteFreq: 293.66, // D4
    propType: "butterfly"
  },
  {
    letter: "C",
    title: "C is for Cosmos & Cat",
    phonics: "/k/ — as in comet, cat, castle",
    speechText: "C is for Cosmos and Cat! /k/!",
    rhyme: "Curious whiskers looking up high, watching bright comets streak through the night sky!",
    story: "Cosmo the galactic kitten sits atop a crescent moon, batting playfully at passing stardust and spinning planetary rings like balls of sparkling yarn.",
    vocab: [
      { word: "Cosmos", emoji: "🪐", def: "The entire universe of stars, planets, and mysteries" },
      { word: "Cat", emoji: "🐱", def: "A graceful, curious companion with soft paws" },
      { word: "Comet", emoji: "☄️", def: "An icy space snowball blazing with a glowing tail" },
      { word: "Castle", emoji: "🏰", def: "A grand fortress with towering stone walls" },
      { word: "Crystal", emoji: "💎", def: "A sparkling mineral forming geometric prisms" }
    ],
    theme: {
      primary: "#9C88FF",
      secondary: "#E84393",
      accent: "#F8A5C2",
      bgGradient: "linear-gradient(135deg, #1b0d2a 0%, #200d23 50%, #0c0515 100%)",
      textColor: "#F1E7FE",
      threeColor: 0x9c88ff,
      threePropColor: 0xe84393
    },
    noteFreq: 329.63, // E4
    propType: "cosmos"
  },
  {
    letter: "D",
    title: "D is for Dolphin & Dinosaur",
    phonics: "/d/ — as in deep, dolphin, dinosaur",
    speechText: "D is for Dolphin and Dinosaur! /d/!",
    rhyme: "Diving down deep where the blue waves roar, stepping back time with the great dinosaur!",
    story: "Deep in the shimmering ocean, Dylan the dolphin leaps into the sunny mist, while prehistoric giant tracks on the beach reveal tales from ancient times.",
    vocab: [
      { word: "Dolphin", emoji: "🐬", def: "An intelligent marine mammal who loves to leap" },
      { word: "Dinosaur", emoji: "🦖", def: "Majestic ancient reptiles that once ruled the Earth" },
      { word: "Diamond", emoji: "💎", def: "The hardest natural gem, forged deep underground" },
      { word: "Dragon", emoji: "🐉", def: "A mythical legendary beast with wings of wonder" },
      { word: "Dawn", emoji: "🌅", def: "The golden moment when night welcomes daylight" }
    ],
    theme: {
      primary: "#00CEC9",
      secondary: "#0984E3",
      accent: "#81ECEC",
      bgGradient: "linear-gradient(135deg, #052328 0%, #06192e 50%, #030d17 100%)",
      textColor: "#DCFAF9",
      threeColor: 0x00cec9,
      threePropColor: 0x0984e3
    },
    noteFreq: 349.23, // F4
    propType: "dolphin"
  },
  {
    letter: "E",
    title: "E is for Earth & Explorer",
    phonics: "/ɛ/ or /iː/ — as in echo, earth, explorer",
    speechText: "E is for Earth and Explorer! /ɛ/!",
    rhyme: "Every adventure begins at dawn, an eager explorer travelling on!",
    story: "Explorer Emma consults her brass compass on a breezy mountain overlook. Far below, rivers curve like silver ribbons across our vibrant, living blue planet Earth.",
    vocab: [
      { word: "Earth", emoji: "🌍", def: "Our home planet teeming with oceans, forests, and life" },
      { word: "Explorer", emoji: "🧭", def: "A brave wanderer seeking new lands and knowledge" },
      { word: "Elephant", emoji: "🐘", def: "A gentle giant with a long trunk and wise memory" },
      { word: "Eclipse", emoji: "🌒", def: "A cosmic alignment casting a shadow across the sky" },
      { word: "Echo", emoji: "🗣️", def: "A playful sound wave bouncing back from cavern walls" }
    ],
    theme: {
      primary: "#00B894",
      secondary: "#00CEC9",
      accent: "#55EFC4",
      bgGradient: "linear-gradient(135deg, #04241b 0%, #051f20 50%, #030f10 100%)",
      textColor: "#D6FBF1",
      threeColor: 0x00b894,
      threePropColor: 0x00cec9
    },
    noteFreq: 392.00, // G4
    propType: "earth"
  },
  {
    letter: "F",
    title: "F is for Firefly & Fox",
    phonics: "/f/ — as in forest, firefly, fox",
    speechText: "F is for Firefly and Fox! /f/!",
    rhyme: "Flashing bright sparks on a summer night, a clever red fox in the amber twilight!",
    story: "Felix the fox sits quietly among mossy ferns as hundreds of fireflies turn the twilight forest into a glowing constellation of miniature lanterns.",
    vocab: [
      { word: "Firefly", emoji: "✨", def: "A beetle that produces bioluminescent flashes of light" },
      { word: "Fox", emoji: "🦊", def: "A clever, agile forest animal with a bushy tail" },
      { word: "Feather", emoji: "🪶", def: "A light, aerodynamic plume enabling birds to soar" },
      { word: "Forest", emoji: "🌲", def: "A majestic expanse filled with tall trees and wildlife" },
      { word: "Fountain", emoji: "⛲", def: "A decorative spout dancing with crystal waters" }
    ],
    theme: {
      primary: "#FA8231",
      secondary: "#FFB142",
      accent: "#FED330",
      bgGradient: "linear-gradient(135deg, #2b1407 0%, #1e1106 50%, #0f0702 100%)",
      textColor: "#FFE9D6",
      threeColor: 0xfa8231,
      threePropColor: 0xfed330
    },
    noteFreq: 440.00, // A4
    propType: "firefly"
  },
  {
    letter: "G",
    title: "G is for Galaxy & Guitar",
    phonics: "/ɡ/ — as in garden, galaxy, guitar",
    speechText: "G is for Galaxy and Guitar! /ɡ/!",
    rhyme: "A giant spiral swirling afar, strumming sweet chords beneath the North Star!",
    story: "Gwen strums a resonant wooden guitar around a midnight campfire, and the acoustic vibrations seem to ripple out into the spiraling arms of the Milky Way.",
    vocab: [
      { word: "Galaxy", emoji: "🌌", def: "A vast gravitationally bound system of billions of stars" },
      { word: "Guitar", emoji: "🎸", def: "A fretted stringed instrument that sings with melody" },
      { word: "Garden", emoji: "🌻", def: "A tranquil plot blooming with flowers and herbs" },
      { word: "Gem", emoji: "💎", def: "A precious cut stone radiating brilliant facets" },
      { word: "Glacier", emoji: "🏔️", def: "A colossal river of crystalline ice carving valleys" }
    ],
    theme: {
      primary: "#8854D0",
      secondary: "#A55EEA",
      accent: "#D980FA",
      bgGradient: "linear-gradient(135deg, #1b0a2c 0%, #170d24 50%, #0b0513 100%)",
      textColor: "#F1E5FD",
      threeColor: 0x8854d0,
      threePropColor: 0xa55eea
    },
    noteFreq: 493.88, // B4
    propType: "galaxy"
  },
  {
    letter: "H",
    title: "H is for Hot-Air Balloon & Heart",
    phonics: "/h/ — as in hope, heart, horizon",
    speechText: "H is for Hot-Air Balloon and Heart! /h/!",
    rhyme: "High in the clouds as the warm breezes blow, holding warm hope wherever you go!",
    story: "A radiant crimson hot-air balloon drifts over mist-covered hills at sunrise. Below, herds of horses gallop through dew-kissed valleys full of harmony.",
    vocab: [
      { word: "Hot-Air Balloon", emoji: "🎈", def: "A majestic aircraft propelled by heated buoyant air" },
      { word: "Heart", emoji: "❤️", def: "The organ that beats with life and symbol of affection" },
      { word: "Harmony", emoji: "🎶", def: "A pleasant combination of musical tones and peace" },
      { word: "Horizon", emoji: "🌅", def: "The distant line where earth meets the limitless sky" },
      { word: "Hummingbird", emoji: "🐦", def: "A tiny bird whose wings beat fifty times a second" }
    ],
    theme: {
      primary: "#FC427B",
      secondary: "#FD7272",
      accent: "#FFB8B8",
      bgGradient: "linear-gradient(135deg, #2b0b18 0%, #210a14 50%, #0f0409 100%)",
      textColor: "#FCE5ED",
      threeColor: 0xfc427b,
      threePropColor: 0xfd7272
    },
    noteFreq: 523.25, // C5
    propType: "balloon"
  },
  {
    letter: "I",
    title: "I is for Iceberg & Island",
    phonics: "/ɪ/ or /aɪ/ — as in island, iceberg, igloo",
    speechText: "I is for Iceberg and Island! /ɪ/!",
    rhyme: "Ice on the peak of a crystal spire, an emerald island that glows like fire!",
    story: "In polar seas of pure turquoise, majestic glaciers tower like floating palaces of blue ice, keeping the timeless secrets of past ages frozen in crystal silence.",
    vocab: [
      { word: "Iceberg", emoji: "🧊", def: "A massive floating chunk of freshwater ice in the sea" },
      { word: "Island", emoji: "🏝️", def: "A tranquil piece of land surrounded by glistening water" },
      { word: "Igloo", emoji: "🛖", def: "A dome-shaped shelter skillfully built of snow blocks" },
      { word: "Infinity", emoji: "♾️", def: "A boundless, limitless concept that never ends" },
      { word: "Instrument", emoji: "🎺", def: "A crafted tool designed to create musical harmony" }
    ],
    theme: {
      primary: "#45AAF2",
      secondary: "#2D98DA",
      accent: "#70A1FF",
      bgGradient: "linear-gradient(135deg, #071f30 0%, #081827 50%, #030b12 100%)",
      textColor: "#E2F2FC",
      threeColor: 0x45aaf2,
      threePropColor: 0x2d98da
    },
    noteFreq: 587.33, // D5
    propType: "iceberg"
  },
  {
    letter: "J",
    title: "J is for Jellyfish & Jungle",
    phonics: "/dʒ/ — as in jump, jellyfish, jungle",
    speechText: "J is for Jellyfish and Jungle! /dʒ/!",
    rhyme: "Joyful and gentle, a deep-sea ballet, deep in the jungle where emerald ferns sway!",
    story: "In the midnight ocean depths, a translucent jellyfish pulses like a living neon umbrella, glowing with violet and teal bioluminescence in the deep abyss.",
    vocab: [
      { word: "Jellyfish", emoji: "🪼", def: "A graceful sea creature with a gelatinous bell body" },
      { word: "Jungle", emoji: "🌴", def: "A lush tropical rainforest thriving with wildlife" },
      { word: "Jewel", emoji: "💎", def: "A rare cut gemstone prized for its brilliant luster" },
      { word: "Journey", emoji: "🚀", def: "An exciting expedition across distant lands or stars" },
      { word: "Jupiter", emoji: "🪐", def: "The largest planet in our solar system with iconic storms" }
    ],
    theme: {
      primary: "#A55EEA",
      secondary: "#00D2D3",
      accent: "#4BCFFA",
      bgGradient: "linear-gradient(135deg, #1b0a2c 0%, #051d27 50%, #030c12 100%)",
      textColor: "#EAE0FC",
      threeColor: 0xa55eea,
      threePropColor: 0x00d2d3
    },
    noteFreq: 659.25, // E5
    propType: "jellyfish"
  },
  {
    letter: "K",
    title: "K is for Kite & Koala",
    phonics: "/k/ — as in king, kite, koala",
    speechText: "K is for Kite and Koala! /k/!",
    rhyme: "Kaleidoscope ribbons dancing so high, a kind little koala asleep in the sky!",
    story: "Kai runs across a windy coastal bluff, letting loose a diamond-shaped kite that swoops, dives, and dances among the sunlit cumulus clouds.",
    vocab: [
      { word: "Kite", emoji: "🪁", def: "A tethered light frame that glides on wind currents" },
      { word: "Koala", emoji: "🐨", def: "A sleepy Australian marsupial fond of eucalyptus" },
      { word: "Kaleidoscope", emoji: "🌀", def: "A mirrored tube reflecting endlessly shifting patterns" },
      { word: "King", emoji: "👑", def: "A sovereign ruler crowned with golden regalia" },
      { word: "Kangaroo", emoji: "🦘", def: "A swift marsupial famous for powerful bounds" }
    ],
    theme: {
      primary: "#FFB142",
      secondary: "#FF5252",
      accent: "#FED330",
      bgGradient: "linear-gradient(135deg, #2b1706 0%, #200f07 50%, #0e0602 100%)",
      textColor: "#FFEBD2",
      threeColor: 0xffb142,
      threePropColor: 0xff5252
    },
    noteFreq: 698.46, // F5
    propType: "kite"
  },
  {
    letter: "L",
    title: "L is for Lighthouse & Lion",
    phonics: "/l/ — as in leaf, lion, lighthouse",
    speechText: "L is for Lighthouse and Lion! /l/!",
    rhyme: "Guiding ships safely across the stormy sea, brave like a lion who roams proud and free!",
    story: "Perched on a rugged granite cliff, the old lighthouse sweeps its golden beam through fog and tempest, ensuring every weary mariner returns safely home.",
    vocab: [
      { word: "Lighthouse", emoji: "🏮", def: "A coastal tower casting light to guide seafaring ships" },
      { word: "Lion", emoji: "🦁", def: "A noble feline known as the king of the savanna" },
      { word: "Lantern", emoji: "🏮", def: "A portable lamp sheltering a steady glowing flame" },
      { word: "Lotus", emoji: "🪷", def: "A sacred blossom rising pure from quiet waters" },
      { word: "Lagoon", emoji: "🏝️", def: "A calm body of shallow water protected by a reef" }
    ],
    theme: {
      primary: "#F7B731",
      secondary: "#FA8231",
      accent: "#FFD32A",
      bgGradient: "linear-gradient(135deg, #271a04 0%, #1a1205 50%, #0d0801 100%)",
      textColor: "#FFF0CE",
      threeColor: 0xf7b731,
      threePropColor: 0xfa8231
    },
    noteFreq: 783.99, // G5
    propType: "lighthouse"
  },
  {
    letter: "M",
    title: "M is for Mountain & Moon",
    phonics: "/m/ — as in mist, moon, mountain",
    speechText: "M is for Mountain and Moon! /m/!",
    rhyme: "Majestic snow peaks touching the midnight sky, a silver moon smiling so softly on high!",
    story: "High atop Mount Solitude, crisp glacial winds whisper over ancient granite cliffs. Overhead, the full moon illuminates the snowy alpine world with pearl luster.",
    vocab: [
      { word: "Mountain", emoji: "🏔️", def: "A towering natural elevation rising steeply from earth" },
      { word: "Moon", emoji: "🌕", def: "Earth's loyal natural satellite reflecting silver light" },
      { word: "Melody", emoji: "🎵", def: "A sequence of musical notes creating a memorable tune" },
      { word: "Meteor", emoji: "🌠", def: "A streak of brilliant light as space rock enters our air" },
      { word: "Magnet", emoji: "🧲", def: "An object producing an invisible magnetic field" }
    ],
    theme: {
      primary: "#778CA3",
      secondary: "#4B6584",
      accent: "#D1D8E0",
      bgGradient: "linear-gradient(135deg, #13171e 0%, #0d1218 50%, #05080b 100%)",
      textColor: "#E8ECF0",
      threeColor: 0xa5b1c2,
      threePropColor: 0x4b6584
    },
    noteFreq: 880.00, // A5
    propType: "mountain"
  },
  {
    letter: "N",
    title: "N is for Nebula & Nautilus",
    phonics: "/n/ — as in night, nest, nebula",
    speechText: "N is for Nebula and Nautilus! /n/!",
    rhyme: "Newborn stars blazing in a velvet haze, a nautilus shell in a golden spirals maze!",
    story: "In a stellar nursery millions of light-years away, an interstellar nebula of glowing hydrogen clouds gives birth to dazzling clusters of newborn infant stars.",
    vocab: [
      { word: "Nebula", emoji: "🌌", def: "A cosmic cloud of dust and gas where stars are born" },
      { word: "Nautilus", emoji: "🐚", def: "A marine cephalopod with an exquisite logarithmic shell" },
      { word: "Nature", emoji: "🌿", def: "The living physical world of plants, animals, and earth" },
      { word: "Navigator", emoji: "🧭", def: "A skilled guide who charts courses across seas or stars" },
      { word: "Nest", emoji: "🪺", def: "A cozy shelter woven by birds to cradle their young" }
    ],
    theme: {
      primary: "#ED4C67",
      secondary: "#B53471",
      accent: "#F8A5C2",
      bgGradient: "linear-gradient(135deg, #2b0c16 0%, #1f0814 50%, #0c0208 100%)",
      textColor: "#FCE5ED",
      threeColor: 0xed4c67,
      threePropColor: 0xb53471
    },
    noteFreq: 987.77, // B5
    propType: "nebula"
  },
  {
    letter: "O",
    title: "O is for Octopus & Owl",
    phonics: "/ɒ/ or /oʊ/ — as in ocean, owl, octopus",
    speechText: "O is for Octopus and Owl! /ɒ/!",
    rhyme: "Ocean depths swirling so deep and profound, a wise old owl keeping watch without sound!",
    story: "Otto the octopus glides gracefully through an underwater coral canyon, changing colors like a master artist, while Ollie the wise owl keeps guard from a hollow oak.",
    vocab: [
      { word: "Octopus", emoji: "🐙", def: "An eight-armed clever cephalopod with three hearts" },
      { word: "Owl", emoji: "🦉", def: "A nocturnal bird of prey with silent wings and wisdom" },
      { word: "Ocean", emoji: "🌊", def: "The vast body of saltwater that covers most of our planet" },
      { word: "Orbit", emoji: "💫", def: "The curved gravitational path of a celestial object" },
      { word: "Origami", emoji: "🦢", def: "The delicate Japanese art of folding paper sculptures" }
    ],
    theme: {
      primary: "#FF6F00",
      secondary: "#FFA000",
      accent: "#FFD54F",
      bgGradient: "linear-gradient(135deg, #291201 0%, #1b0d02 50%, #0d0601 100%)",
      textColor: "#FFE8D1",
      threeColor: 0xff6f00,
      threePropColor: 0xffa000
    },
    noteFreq: 1046.50, // C6
    propType: "octopus"
  },
  {
    letter: "P",
    title: "P is for Planet & Phoenix",
    phonics: "/p/ — as in path, planet, phoenix",
    speechText: "P is for Planet and Phoenix! /p/!",
    rhyme: "Planets that turn in a cosmic ballet, a phoenix rising to greet the bright day!",
    story: "Far beyond the asteroid belt, giant ringed planets revolve in silent cosmic majesty, while in legendary lore, the mythical phoenix spreads wings of pure golden embers.",
    vocab: [
      { word: "Planet", emoji: "🪐", def: "A massive celestial body orbiting a central star" },
      { word: "Phoenix", emoji: "🦅", def: "A legendary immortal bird reborn from golden flames" },
      { word: "Penguin", emoji: "🐧", def: "An aquatic flightless bird suited for polar waters" },
      { word: "Prism", emoji: "📐", def: "A glass block that splits white light into a rainbow" },
      { word: "Pyramid", emoji: "🔺", def: "A monumental ancient stone structure built to touch the sky" }
    ],
    theme: {
      primary: "#8E44AD",
      secondary: "#9B59B6",
      accent: "#E056FD",
      bgGradient: "linear-gradient(135deg, #1c0926 0%, #15061e 50%, #0a020e 100%)",
      textColor: "#F3E2FD",
      threeColor: 0x8e44ad,
      threePropColor: 0x9b59b6
    },
    noteFreq: 1174.66, // D6
    propType: "planet"
  },
  {
    letter: "Q",
    title: "Q is for Queen & Quill",
    phonics: "/kw/ — as in queen, quill, quest",
    speechText: "Q is for Queen and Quill! /kw/!",
    rhyme: "Quietly writing with magical ink, questions that inspire you to wonder and think!",
    story: "In a library of gilded arches, Queen Quinn dips a silver quill into indigo ink, scripting new laws of kindness and courage across ancient parchment scrolls.",
    vocab: [
      { word: "Queen", emoji: "👑", def: "A dignified monarch wearing a crown of jewels" },
      { word: "Quill", emoji: "🪶", def: "A feather pen used for centuries to scribe history" },
      { word: "Quest", emoji: "🗺️", def: "A noble journey in pursuit of knowledge and discovery" },
      { word: "Quasar", emoji: "✨", def: "An extremely luminous active galactic core" },
      { word: "Quartz", emoji: "💎", def: "A hard crystalline mineral found throughout the earth" }
    ],
    theme: {
      primary: "#FD7272",
      secondary: "#EA2027",
      accent: "#FFB8B8",
      bgGradient: "linear-gradient(135deg, #2b0b12 0%, #1f070b 50%, #0d0204 100%)",
      textColor: "#FCE5E8",
      threeColor: 0xfd7272,
      threePropColor: 0xea2027
    },
    noteFreq: 1318.51, // E6
    propType: "queen"
  },
  {
    letter: "R",
    title: "R is for Rocket & Rainbow",
    phonics: "/r/ — as in ring, rocket, rainbow",
    speechText: "R is for Rocket and Rainbow! /r/!",
    rhyme: "Roaring its thrusters up into space, a seven-color rainbow in skyward embrace!",
    story: "3... 2... 1... Liftoff! The silver rocket launches with a thunderous roar, punching through rainclouds to leave a blazing arch of rainbow colors in its wake.",
    vocab: [
      { word: "Rocket", emoji: "🚀", def: "A powerful vehicle thrusting payloads into outer space" },
      { word: "Rainbow", emoji: "🌈", def: "A spectrum of light formed by water droplets in sunlight" },
      { word: "River", emoji: "🌊", def: "A flowing ribbon of freshwater journeying toward the sea" },
      { word: "Ruby", emoji: "💍", def: "A precious deep crimson gemstone of fiery brilliance" },
      { word: "Robot", emoji: "🤖", def: "An automated helper designed to perform complex tasks" }
    ],
    theme: {
      primary: "#EE5253",
      secondary: "#FF9F43",
      accent: "#10AC84",
      bgGradient: "linear-gradient(135deg, #290b0e 0%, #1d0f05 50%, #0b0601 100%)",
      textColor: "#FFE6E7",
      threeColor: 0xee5253,
      threePropColor: 0xff9f43
    },
    noteFreq: 1396.91, // F6
    propType: "rocket"
  },
  {
    letter: "S",
    title: "S is for Star & Supernova",
    phonics: "/s/ — as in sun, star, supernova",
    speechText: "S is for Star and Supernova! /s/!",
    rhyme: "Shining so brightly across time and space, sweet gentle starlight on every child's face!",
    story: "High above the sleeping world, Stella the golden star twinkles in the velvet dark. In deep space, an ancient star finishes its cycle in a spectacular supernova of color.",
    vocab: [
      { word: "Star", emoji: "⭐", def: "A luminous sphere of plasma held together by its gravity" },
      { word: "Supernova", emoji: "💥", def: "The brilliant explosion of a giant star at its finale" },
      { word: "Sun", emoji: "☀️", def: "The star at the center of our solar system giving us life" },
      { word: "Satellite", emoji: "🛰️", def: "A vessel orbiting a celestial body to transmit knowledge" },
      { word: "Sailboat", emoji: "⛵", def: "A vessel catching winds to skim across ocean tides" }
    ],
    theme: {
      primary: "#F368E0",
      secondary: "#FF9FF3",
      accent: "#FECA57",
      bgGradient: "linear-gradient(135deg, #290b25 0%, #1d081b 50%, #0b020b 100%)",
      textColor: "#FCE5FA",
      threeColor: 0xfeca57,
      threePropColor: 0xf368e0
    },
    noteFreq: 1567.98, // G6
    propType: "star"
  },
  {
    letter: "T",
    title: "T is for Telescope & Tree",
    phonics: "/t/ — as in time, tree, telescope",
    speechText: "T is for Telescope and Tree! /t/!",
    rhyme: "Telescope peering at distant new worlds, tomorrow's grand wonders as history unfurls!",
    story: "Toby climbs to the highest branch of an ancient oak tree, pointing his brass telescope toward the Milky Way. Each lens adjustment reveals millions of distant solar systems.",
    vocab: [
      { word: "Telescope", emoji: "🔭", def: "An optical tool magnifying distant celestial marvels" },
      { word: "Tree", emoji: "🌳", def: "A woody perennial plant providing oxygen and shade" },
      { word: "Tiger", emoji: "🐅", def: "A majestic striped big cat prowling with quiet grace" },
      { word: "Treasure", emoji: "🪙", def: "A collection of precious and cherished gems or memories" },
      { word: "Thunder", emoji: "⚡", def: "The booming sonic wave produced by lightning strikes" }
    ],
    theme: {
      primary: "#10AC84",
      secondary: "#1DD1A1",
      accent: "#55EFC4",
      bgGradient: "linear-gradient(135deg, #05241b 0%, #041c16 50%, #020c0a 100%)",
      textColor: "#D8FBF0",
      threeColor: 0x10ac84,
      threePropColor: 0x1dd1a1
    },
    noteFreq: 1760.00, // A6
    propType: "telescope"
  },
  {
    letter: "U",
    title: "U is for Universe & Umbrella",
    phonics: "/ʌ/ or /juː/ — as in umbrella, universe, unicorn",
    speechText: "U is for Universe and Umbrella! /ʌ/!",
    rhyme: "Under the shelter of kindness and care, the infinite universe waiting out there!",
    story: "On a rainy evening, Una opens a vibrant polka-dot umbrella. As rain droplets drum like music, she looks through the clouds and imagines the boundless universe beyond.",
    vocab: [
      { word: "Universe", emoji: "🌌", def: "All of space, time, matter, energy, and physical laws" },
      { word: "Umbrella", emoji: "☂️", def: "A collapsible canopy designed to protect from rain" },
      { word: "Unicorn", emoji: "🦄", def: "A mythical horned equine creature of legend and purity" },
      { word: "Ursa", emoji: "🐻", def: "The famous constellation representing the Great Bear" },
      { word: "Utopia", emoji: "🏰", def: "An envisioned ideal world of peace and harmony" }
    ],
    theme: {
      primary: "#5F27CD",
      secondary: "#341F97",
      accent: "#9B59B6",
      bgGradient: "linear-gradient(135deg, #160a2c 0%, #0d061c 50%, #06020c 100%)",
      textColor: "#EAE0FC",
      threeColor: 0x5f27cd,
      threePropColor: 0x9b59b6
    },
    noteFreq: 1975.53, // B6
    propType: "umbrella"
  },
  {
    letter: "V",
    title: "V is for Volcano & Voyage",
    phonics: "/v/ — as in view, voyage, volcano",
    speechText: "V is for Volcano and Voyage! /v/!",
    rhyme: "Vibrant magma creating new land, a voyage to shores of pure golden sand!",
    story: "Captain Victor steers his vessel past an active volcanic island. Molten orange lava flows slowly into the ocean, cooling into fertile black stone as steam rises to the sky.",
    vocab: [
      { word: "Volcano", emoji: "🌋", def: "A rupture in the crust where magma erupts onto surface" },
      { word: "Voyage", emoji: "⛵", def: "A long and adventurous journey across unknown waters" },
      { word: "Violin", emoji: "🎻", def: "A four-stringed wooden instrument played with a horsehair bow" },
      { word: "Valley", emoji: "🏞️", def: "A peaceful low area of land nestled between hills or peaks" },
      { word: "Velocity", emoji: "⚡", def: "The speed of something moving in a given direction" }
    ],
    theme: {
      primary: "#FF4757",
      secondary: "#FF6B6B",
      accent: "#FF9F43",
      bgGradient: "linear-gradient(135deg, #2b0b0f 0%, #1d070b 50%, #0b0204 100%)",
      textColor: "#FFE6E8",
      threeColor: 0xff4757,
      threePropColor: 0xff6b6b
    },
    noteFreq: 2093.00, // C7
    propType: "volcano"
  },
  {
    letter: "W",
    title: "W is for Whale & Windmill",
    phonics: "/w/ — as in water, wave, whale",
    speechText: "W is for Whale and Windmill! /w/!",
    rhyme: "Whale singing melodies deep in the sea, whispering winds turning windmills with glee!",
    story: "Winston the blue whale breaches the shimmering Pacific waves, sending a misty plume high into the sky. On the distant green headland, towering white windmills spin gracefully.",
    vocab: [
      { word: "Whale", emoji: "🐋", def: "The largest gentle mammal ever to inhabit the earth" },
      { word: "Windmill", emoji: "💨", def: "A structure converting the gentle breeze into clean energy" },
      { word: "Wave", emoji: "🌊", def: "A rolling swell of water traveling across the ocean surface" },
      { word: "Wonder", emoji: "✨", def: "A feeling of amazement and awe caused by the unknown" },
      { word: "Willow", emoji: "🌿", def: "A graceful tree with sweeping branches dancing in breeze" }
    ],
    theme: {
      primary: "#0ABDE3",
      secondary: "#48DBFB",
      accent: "#54A0FF",
      bgGradient: "linear-gradient(135deg, #052028 0%, #04161c 50%, #02090d 100%)",
      textColor: "#D6F6FC",
      threeColor: 0x0abde3,
      threePropColor: 0x48dbfb
    },
    noteFreq: 2349.32, // D7
    propType: "whale"
  },
  {
    letter: "X",
    title: "X is for Xylophone & X-Ray",
    phonics: "/ks/ or /z/ — as in box, xylophone, x-ray",
    speechText: "X is for Xylophone and X-Ray! /ks/!",
    rhyme: "Xylophone tunes making cheerful sweet sound, looking inside where the wonders are found!",
    story: "Xavier taps his wooden mallets on the rainbow xylophone bars, playing a cheerful melody that echoes through the room while a crystal prism refracts hidden light spectrums.",
    vocab: [
      { word: "Xylophone", emoji: "🪕", def: "A musical instrument with tuned bars struck by mallets" },
      { word: "X-Ray", emoji: "🩻", def: "A form of high-energy light revealing hidden inner bones" },
      { word: "Xenon", emoji: "💡", def: "A noble gas that glows with bright blue luminescence" },
      { word: "Xerus", emoji: "🐿️", def: "A lively African ground squirrel with a fluffy tail" },
      { word: "Xiphias", emoji: "🗡️", def: "The scientific genus name for the swift ocean swordfish" }
    ],
    theme: {
      primary: "#00D2D3",
      secondary: "#01A3A4",
      accent: "#10AC84",
      bgGradient: "linear-gradient(135deg, #052626 0%, #031a1a 50%, #010d0d 100%)",
      textColor: "#D7FAFA",
      threeColor: 0x00d2d3,
      threePropColor: 0x01a3a4
    },
    noteFreq: 2637.02, // E7
    propType: "xylophone"
  },
  {
    letter: "Y",
    title: "Y is for Yacht & Yellow Sun",
    phonics: "/j/ — as in yes, yellow, yacht",
    speechText: "Y is for Yacht and Yellow Sun! /j/!",
    rhyme: "Yearning for horizons in golden sunlight, yellow sails catching the breeze day and night!",
    story: "Yasmin unfurls the crisp yellow sails of her yacht, gliding across turquoise waters as dolphins play along the hull under the warm radiance of the midday sun.",
    vocab: [
      { word: "Yacht", emoji: "⛵", def: "A sleek sailing vessel crafted for cruising sunny seas" },
      { word: "Yellow", emoji: "💛", def: "The radiant color of sunflowers, lemons, and dawn light" },
      { word: "Yonder", emoji: "🗺️", def: "A distant place waiting just beyond the next horizon" },
      { word: "Yak", emoji: "🐂", def: "A sturdy, long-haired bovine native to Himalayan slopes" },
      { word: "Year", emoji: "📅", def: "The 365-day orbital lap Earth makes around the sun" }
    ],
    theme: {
      primary: "#FECA57",
      secondary: "#FF9F43",
      accent: "#FED330",
      bgGradient: "linear-gradient(135deg, #2b1d06 0%, #1f1404 50%, #0e0901 100%)",
      textColor: "#FFF0CE",
      threeColor: 0xfeca57,
      threePropColor: 0xff9f43
    },
    noteFreq: 2793.83, // F7
    propType: "yacht"
  },
  {
    letter: "Z",
    title: "Z is for Zeppelin & Zenith",
    phonics: "/z/ — as in buzz, zeppelin, zenith",
    speechText: "Z is for Zeppelin and Zenith! /z/!",
    rhyme: "Zooming up high to the peak of the sky, a zeppelin waving the cosmos goodbye!",
    story: "The majestic zeppelin reaches the zenith of its flight, floating weightlessly among glittering constellations. You've completed the Alphabet Odyssey—from A to Z!",
    vocab: [
      { word: "Zeppelin", emoji: "🛸", def: "A graceful rigid airship navigating through high clouds" },
      { word: "Zenith", emoji: "⭐", def: "The highest, crowning point in the celestial sphere" },
      { word: "Zebra", emoji: "🦓", def: "An African wild horse crowned with bold black and white stripes" },
      { word: "Zero", emoji: "0️⃣", def: "The foundational number representing infinite potential" },
      { word: "Zodiac", emoji: "✨", def: "The ancient circular belt of stars across the heavens" }
    ],
    theme: {
      primary: "#54A0FF",
      secondary: "#5F27CD",
      accent: "#00D2D3",
      bgGradient: "linear-gradient(135deg, #0d1a2f 0%, #10102b 50%, #060515 100%)",
      textColor: "#E2EDFC",
      threeColor: 0x54a0ff,
      threePropColor: 0x5f27cd
    },
    noteFreq: 3135.96, // G7
    propType: "zeppelin"
  }
];

