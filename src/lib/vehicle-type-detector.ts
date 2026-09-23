export type VehicleType = 'Sedan' | 'SUV' | 'Truck' | 'Coupe' | 'Motorcycle' | 'Marine';

const MOTORCYCLE_MODELS = [
  'ninja', 'hayabusa', 'gsxr', 'gsx-r', 'cbr', 'r1', 'r6', 'zx', 'yzf', 'ducati', 'monster',
  'sportster', 'softail', 'street glide', 'road king', 'fat boy', 'iron 883', 'forty-eight',
  'vulcan', 'boulevard', 'v-star', 'shadow', 'rebel', 'scout', 'chief', 'fxdr', 'breakout',
  'nightster', 'roadster', 'diavel', 'panigale', 'multistrada', 'scrambler', 'mt-07', 'mt-09',
  'mt-10', 'fz', 'tracer', 'tenere', 'versys', 'z900', 'z650', 'z400', 'ninja 400', 'ninja 650',
  'ninja zx', 'street triple', 'speed triple', 'tiger', 'bonneville', 'thruxton', 'rocket',
  'goldwing', 'africa twin', 'crf', 'klr', 'dr-z', 'wr', 'ktm', 'duke', 'rc', 'adventure',
  'super duke', 'aprilia', 'rsv4', 'tuono', 'shiver', 'dorsoduro', 'mv agusta', 'brutale',
  'f3', 'f4', 'indian', 'chieftain', 'challenger', 'pursuit', 'bmw', 'gs', 'r1250', 's1000',
  'k1600', 'harley', 'davidson', 'honda', 'yamaha', 'kawasaki', 'suzuki', 'triumph', 'grom',
  'monkey', 'ct125', 'cub', 'navi', 'metropolitan', 'ruckus', 'pcx', 'adv', 'forza', 'burgman',
];

const MARINE_MODELS = [
  'boat', 'yacht', 'pontoon', 'bass boat', 'fishing boat', 'ski boat', 'wakeboard', 'bowrider',
  'cruiser', 'cabin cruiser', 'center console', 'deck boat', 'jet boat', 'runabout', 'skiff',
  'catamaran', 'sailboat', 'trawler', 'houseboat', 'airboat', 'jon boat', 'canoe', 'kayak',
  'pwc', 'jet ski', 'waverunner', 'sea-doo', 'seadoo', 'personal watercraft', 'dinghy',
  'inflatable', 'rib', 'tender', 'bayliner', 'boston whaler', 'chaparral', 'cobalt', 'crest',
  'four winns', 'grady white', 'mastercraft', 'malibu', 'nautique', 'regal', 'sea ray',
  'skeeter', 'starcraft', 'stingray', 'tahoe', 'tracker', 'triton', 'wellcraft', 'yamaha boat',
  'zodiac', 'marine', 'vessel', 'watercraft', 'outboard', 'inboard', 'sterndrive',
];

const TRUCK_MODELS = [
  'f-150', 'f150', 'f-250', 'f250', 'f-350', 'f350', 'f-450', 'f450', 'ranger', 'maverick',
  'silverado', 'colorado', 'sierra', 'canyon', 's10', 's-10', 'avalanche',
  'ram', '1500', '2500', '3500', 'dakota', 'power wagon',
  'tundra', 'tacoma', 'titan', 'frontier', 'ridgeline',
  'gladiator', 'comanche', 'scrambler',
  'cybertruck', 'rivian', 'r1t', 'lightning', 'hummer ev',
  'santa cruz', 'maverick', 'colorado zr2', 'raptor', 'tremor', 'trx',
];

const SUV_MODELS = [
  'explorer', 'expedition', 'bronco', 'escape', 'edge', 'flex',
  'tahoe', 'suburban', 'blazer', 'traverse', 'equinox', 'trax', 'trailblazer',
  'yukon', 'acadia', 'terrain', 'envoy',
  'durango', 'grand cherokee', 'cherokee', 'wrangler', 'compass', 'renegade', 'wagoneer', 'grand wagoneer',
  '4runner', 'sequoia', 'highlander', 'rav4', 'venza', 'land cruiser', 'gx', 'lx', 'rx', 'nx', 'ux',
  'pathfinder', 'armada', 'murano', 'rogue', 'kicks', 'xterra', 'qx', 'qx50', 'qx55', 'qx60', 'qx80',
  'pilot', 'passport', 'cr-v', 'crv', 'hr-v', 'hrv', 'mdx', 'rdx',
  'sorento', 'telluride', 'sportage', 'seltos', 'soul',
  'santa fe', 'palisade', 'tucson', 'kona', 'venue',
  'outback', 'forester', 'ascent', 'crosstrek',
  'cx-5', 'cx5', 'cx-9', 'cx9', 'cx-30', 'cx30', 'cx-50', 'cx50', 'cx-90', 'cx90',
  'x3', 'x5', 'x7', 'x1', 'x2', 'x4', 'x6',
  'q3', 'q5', 'q7', 'q8', 'e-tron',
  'glc', 'gle', 'gls', 'glb', 'gla', 'g-class', 'g-wagon',
  'xc40', 'xc60', 'xc90',
  'cayenne', 'macan',
  'range rover', 'defender', 'discovery', 'evoque', 'velar',
  'urus', 'bentayga', 'cullinan', 'dbx',
  'model x', 'model y',
  'escalade', 'xt4', 'xt5', 'xt6', 'lyriq',
  'aviator', 'navigator', 'nautilus', 'corsair',
  'enclave', 'encore', 'envision',
];

const COUPE_MODELS = [
  'mustang', 'camaro', 'challenger', 'charger', 'corvette', 'viper',
  'supra', '86', 'brz', 'miata', 'mx-5', 'mx5', '370z', '350z', 'z',
  'm2', 'm4', 'm8', '2 series', '4 series', '8 series',
  'tt', 'r8', 'a5', 's5', 'rs5',
  'c-class coupe', 'e-class coupe', 's-class coupe', 'amg gt', 'slc', 'sl',
  '911', 'cayman', 'boxster', '718',
  'lc', 'rc', 'rc f', 'lc 500',
  'genesis coupe', 'g70',
  'wrx', 'sti',
  'integra', 'nsx',
  'q60', 'g37', 'g35',
  'huracan', 'aventador', 'gallardo',
  '488', 'f8', 'roma', 'portofino', '812', 'sf90',
  'gt-r', 'gtr', 'nissan z',
  'continental gt', 'flying spur',
  'granturismo', 'mc20',
  'vantage', 'db11', 'dbs',
  'chiron', 'veyron',
  'pagani', 'koenigsegg', 'mclaren', '720s', '570s', 'artura', 'gt',
];

const SEDAN_MODELS = [
  'accord', 'civic', 'insight', 'clarity',
  'camry', 'corolla', 'avalon', 'prius',
  'altima', 'maxima', 'sentra', 'versa', 'leaf',
  'malibu', 'impala', 'cruze', 'spark', 'bolt',
  'fusion', 'focus', 'taurus',
  '3 series', '5 series', '7 series', 'm3', 'm5',
  'a3', 'a4', 'a6', 'a8', 's3', 's4', 's6', 's8', 'rs3', 'rs6', 'rs7',
  'c-class', 'e-class', 's-class', 'a-class', 'cla', 'cls', 'eqe', 'eqs',
  's60', 's90', 's40',
  'is', 'es', 'gs', 'ls',
  'g80', 'g90',
  'stinger', 'k5', 'forte', 'rio',
  'sonata', 'elantra', 'accent', 'ioniq',
  'legacy', 'impreza',
  'mazda3', 'mazda6',
  'jetta', 'passat', 'arteon', 'golf',
  'ct4', 'ct5', 'ct6',
  'mkz', 'continental',
  'regal', 'lacrosse',
  'intrepid', 'neon', 'stratus', 'avenger', '200', '300',
  'model 3', 'model s',
  'panamera', 'taycan',
  'ghibli', 'quattroporte',
  'ghost', 'phantom', 'wraith',
  'a7', 'e-tron gt',
  'flying spur',
];

export function detectVehicleType(model: string): VehicleType {
  if (!model) return 'Sedan';
  
  const normalizedModel = model.toLowerCase().trim();
  
  for (const motorcycleModel of MOTORCYCLE_MODELS) {
    if (normalizedModel.includes(motorcycleModel)) {
      return 'Motorcycle';
    }
  }
  
  for (const marineModel of MARINE_MODELS) {
    if (normalizedModel.includes(marineModel)) {
      return 'Marine';
    }
  }
  
  for (const truckModel of TRUCK_MODELS) {
    if (normalizedModel.includes(truckModel)) {
      return 'Truck';
    }
  }
  
  for (const suvModel of SUV_MODELS) {
    if (normalizedModel.includes(suvModel)) {
      return 'SUV';
    }
  }
  
  for (const coupeModel of COUPE_MODELS) {
    if (normalizedModel.includes(coupeModel)) {
      return 'Coupe';
    }
  }
  
  for (const sedanModel of SEDAN_MODELS) {
    if (normalizedModel.includes(sedanModel)) {
      return 'Sedan';
    }
  }
  
  return 'Sedan';
}
