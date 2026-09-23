import { NextRequest, NextResponse } from 'next/server';

const VEHICLE_DATA: Record<string, { models: string[], types: string[] }> = {
  'Toyota': { models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner', 'Prius', 'Sienna', 'Avalon', 'GR86', 'Supra', 'Venza', 'C-HR', 'Land Cruiser', 'Sequoia'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Honda': { models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'Ridgeline', 'Passport', 'Insight', 'Fit', 'Element', 'S2000', 'Prelude'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Ford': { models: ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Bronco', 'Ranger', 'Expedition', 'Maverick', 'Focus', 'Fusion', 'Taurus', 'Transit'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Chevrolet': { models: ['Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Suburban', 'Traverse', 'Colorado', 'Camaro', 'Corvette', 'Blazer', 'Trailblazer', 'Impala', 'Cruze', 'Spark'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Dodge': { models: ['Ram', 'Charger', 'Challenger', 'Durango', 'Journey', 'Grand Caravan', 'Dart', 'Hornet'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Ram': { models: ['1500', '2500', '3500', 'ProMaster'], types: ['Truck'] },
  'Jeep': { models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Wagoneer', 'Grand Wagoneer'], types: ['SUV', 'Truck'] },
  'GMC': { models: ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Hummer EV'], types: ['SUV', 'Truck'] },
  'BMW': { models: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'M3', 'M4', 'M5', 'Z4', 'i4', 'iX'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Mercedes-Benz': { models: ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS', 'AMG GT', 'A-Class', 'CLA', 'G-Class'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Audi': { models: ['A3', 'A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Lexus': { models: ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'RC', 'LC', 'UX'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Nissan': { models: ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Pathfinder', 'Murano', 'Armada', 'Frontier', 'Titan', '370Z', 'GT-R', 'Leaf', 'Kicks', 'Versa'], types: ['Sedan', 'SUV', 'Truck', 'Coupe'] },
  'Hyundai': { models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Ioniq', 'Veloster', 'Genesis Coupe'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Kia': { models: ['Forte', 'K5', 'Stinger', 'Sportage', 'Sorento', 'Telluride', 'Seltos', 'Soul', 'Carnival', 'EV6'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Subaru': { models: ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'BRZ', 'Solterra'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Mazda': { models: ['Mazda3', 'Mazda6', 'CX-30', 'CX-5', 'CX-9', 'CX-50', 'MX-5 Miata', 'MX-30'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Volkswagen': { models: ['Jetta', 'Passat', 'Golf', 'GTI', 'Tiguan', 'Atlas', 'ID.4', 'Arteon', 'Taos'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Tesla': { models: ['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck'], types: ['Sedan', 'SUV', 'Truck'] },
  'Volvo': { models: ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C40'], types: ['Sedan', 'SUV'] },
  'Porsche': { models: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Acura': { models: ['ILX', 'TLX', 'RDX', 'MDX', 'Integra', 'NSX'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Infiniti': { models: ['Q50', 'Q60', 'QX50', 'QX55', 'QX60', 'QX80'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Cadillac': { models: ['CT4', 'CT5', 'XT4', 'XT5', 'XT6', 'Escalade', 'Lyriq'], types: ['Sedan', 'SUV'] },
  'Lincoln': { models: ['Corsair', 'Nautilus', 'Aviator', 'Navigator'], types: ['SUV'] },
  'Buick': { models: ['Encore', 'Envision', 'Enclave'], types: ['SUV'] },
  'Chrysler': { models: ['300', 'Pacifica', 'Voyager'], types: ['Sedan', 'SUV'] },
  'Land Rover': { models: ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Evoque', 'Velar'], types: ['SUV'] },
  'Jaguar': { models: ['XE', 'XF', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Genesis': { models: ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'], types: ['Sedan', 'SUV'] },
  'Mini': { models: ['Cooper', 'Countryman', 'Clubman', 'Convertible'], types: ['Coupe', 'SUV'] },
  'Mitsubishi': { models: ['Outlander', 'Eclipse Cross', 'Mirage', 'Outlander Sport'], types: ['Sedan', 'SUV'] },
  'Alfa Romeo': { models: ['Giulia', 'Stelvio', 'Tonale'], types: ['Sedan', 'SUV'] },
  'Maserati': { models: ['Ghibli', 'Quattroporte', 'Levante', 'MC20', 'Grecale'], types: ['Sedan', 'SUV', 'Coupe'] },
  'Harley-Davidson': { models: ['Street Glide', 'Road King', 'Sportster', 'Iron 883', 'Fat Boy', 'Road Glide', 'Softail', 'Electra Glide', 'Pan America', 'LiveWire'], types: ['Motorcycle'] },
  'Honda Motorcycle': { models: ['Gold Wing', 'Africa Twin', 'CBR1000RR', 'CBR600RR', 'CB500X', 'Rebel 500', 'Rebel 1100', 'CRF450R', 'Grom', 'PCX'], types: ['Motorcycle'] },
  'Yamaha': { models: ['YZF-R1', 'YZF-R6', 'MT-07', 'MT-09', 'Tenere 700', 'VMAX', 'Bolt', 'FZ-07', 'Tracer 900'], types: ['Motorcycle'] },
  'Kawasaki': { models: ['Ninja ZX-10R', 'Ninja 650', 'Z900', 'Z650', 'Versys 650', 'Vulcan S', 'Ninja 400', 'KLR 650'], types: ['Motorcycle'] },
  'Suzuki': { models: ['GSX-R1000', 'GSX-R750', 'Hayabusa', 'V-Strom 650', 'V-Strom 1050', 'Boulevard M109R', 'DR650'], types: ['Motorcycle'] },
  'Ducati': { models: ['Panigale V4', 'Monster', 'Multistrada', 'Scrambler', 'Streetfighter', 'Hypermotard', 'Diavel'], types: ['Motorcycle'] },
  'BMW Motorrad': { models: ['R 1250 GS', 'S 1000 RR', 'R nineT', 'K 1600', 'F 850 GS', 'G 310 R', 'R 1250 RT'], types: ['Motorcycle'] },
  'Triumph': { models: ['Bonneville', 'Street Triple', 'Tiger 900', 'Speed Triple', 'Thruxton', 'Trident 660', 'Rocket 3'], types: ['Motorcycle'] },
  'Indian': { models: ['Chief', 'Scout', 'Chieftain', 'Springfield', 'Challenger', 'FTR 1200'], types: ['Motorcycle'] },
  'KTM': { models: ['1290 Super Duke', '890 Duke', '390 Duke', '1290 Super Adventure', '890 Adventure'], types: ['Motorcycle'] },
  'Sea-Doo': { models: ['Spark', 'GTI', 'GTX', 'RXP-X', 'Fish Pro', 'Wake Pro', 'Switch'], types: ['Marine'] },
  'Yamaha Marine': { models: ['WaveRunner VX', 'FX Cruiser', 'GP1800R', 'EX Deluxe', 'SuperJet'], types: ['Marine'] },
  'Kawasaki Marine': { models: ['Ultra 310', 'STX 160', 'SX-R', 'Ultra LX'], types: ['Marine'] },
  'Boston Whaler': { models: ['Montauk', 'Outrage', 'Dauntless', 'Conquest', 'Vantage'], types: ['Marine'] },
  'Grady-White': { models: ['Freedom', 'Fisherman', 'Canyon', 'Express', 'Seafarer'], types: ['Marine'] },
  'Bayliner': { models: ['Element', 'VR5', 'VR6', 'Trophy', 'Bowrider'], types: ['Marine'] },
  'Sea Ray': { models: ['Sundancer', 'SLX', 'SPX', 'SDX', 'Sundeck'], types: ['Marine'] },
  'Tracker': { models: ['Pro Team', 'Classic XL', 'Targa', 'Pro Guide'], types: ['Marine'] },
  'Malibu': { models: ['Wakesetter', 'Response', 'M220'], types: ['Marine'] },
  'MasterCraft': { models: ['X22', 'X24', 'NXT22', 'ProStar'], types: ['Marine'] },
  'Ranger Boats': { models: ['Z520L', 'Z519', 'RT198P', 'VS1882'], types: ['Marine'] },
  'Lund': { models: ['Fury', 'Pro-V', 'Crossover', 'Impact', 'Rebel'], types: ['Marine'] },
  'Polaris': { models: ['Slingshot', 'RZR', 'Ranger', 'General', 'Sportsman'], types: ['Motorcycle', 'Marine'] },
  'Can-Am': { models: ['Spyder', 'Ryker', 'Maverick', 'Defender', 'Outlander'], types: ['Motorcycle'] },
};

const VALID_US_STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'];

function findClosestMatch(input: string, options: string[]): { match: string | null; suggestion: string | null } {
  const normalizedInput = input.toLowerCase().trim();
  const exactMatch = options.find(opt => opt.toLowerCase() === normalizedInput);
  if (exactMatch) return { match: exactMatch, suggestion: null };
  
  const partialMatch = options.find(opt => opt.toLowerCase().includes(normalizedInput) || normalizedInput.includes(opt.toLowerCase()));
  if (partialMatch) return { match: partialMatch, suggestion: null };
  
  let closestMatch: string | null = null;
  let minDistance = Infinity;
  
  for (const option of options) {
    const distance = levenshteinDistance(normalizedInput, option.toLowerCase());
    if (distance < minDistance && distance <= 3) {
      minDistance = distance;
      closestMatch = option;
    }
  }
  
  return { match: null, suggestion: closestMatch };
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function detectVehicleType(make: string, model: string): string {
  const normalizedMake = make.toLowerCase();
  const normalizedModel = model.toLowerCase();
  
  const motorcycleBrands = ['harley-davidson', 'honda motorcycle', 'yamaha', 'kawasaki', 'suzuki', 'ducati', 'bmw motorrad', 'triumph', 'indian', 'ktm', 'can-am', 'polaris'];
  const marineBrands = ['sea-doo', 'yamaha marine', 'kawasaki marine', 'boston whaler', 'grady-white', 'bayliner', 'sea ray', 'tracker', 'malibu', 'mastercraft', 'ranger boats', 'lund'];
  
  if (motorcycleBrands.some(b => normalizedMake.includes(b.split(' ')[0]))) return 'Motorcycle';
  if (marineBrands.some(b => normalizedMake.includes(b.split(' ')[0]))) return 'Marine';
  
  const motorcycleKeywords = ['ninja', 'sportster', 'goldwing', 'street glide', 'road king', 'cbr', 'yzf', 'gsx'];
  const marineKeywords = ['waverunner', 'jet ski', 'pwc', 'boat', 'whaler', 'wakesetter'];
  
  if (motorcycleKeywords.some(k => normalizedModel.includes(k))) return 'Motorcycle';
  if (marineKeywords.some(k => normalizedModel.includes(k))) return 'Marine';
  
  const brandData = VEHICLE_DATA[make];
  if (brandData?.types?.length === 1) return brandData.types[0];
  
  if (normalizedModel.includes('suv') || normalizedModel.includes('crossover')) return 'SUV';
  if (normalizedModel.includes('truck') || normalizedModel.includes('pickup')) return 'Truck';
  if (normalizedModel.includes('coupe') || normalizedModel.includes('sport')) return 'Coupe';
  
  return 'Sedan';
}

interface ValidationErrors {
  email?: string;
  fullName?: string;
  phone?: string;
  vehicle?: string;
  address?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: ValidationErrors;
  suggestions: {
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleType?: string;
    addressCorrection?: string;
    autoDetectedType?: string;
  };
  autoDetectedType?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, fullName, phone, vehicle, address } = body;
    
    const errors: ValidationErrors = {};
    const suggestions: ValidationResult['suggestions'] = {};
    
    if (email) {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!emailRegex.test(email)) {
        errors.email = `"${email}" is not a valid email address. Please use format: name@domain.com`;
      }
      const domainPart = email.split('@')[1];
      if (domainPart && !domainPart.includes('.')) {
        errors.email = `Email domain "${domainPart}" is invalid. Did you mean "${domainPart}.com"?`;
      }
    }
    
    if (fullName) {
      const names = fullName.trim().split(/\s+/);
      if (names.length < 2) {
        errors.fullName = `Please enter your full legal name (first and last name required). You entered: "${fullName}"`;
      } else {
        for (const name of names) {
          if (name.length < 2) {
            errors.fullName = `Each name must be at least 2 characters. "${name}" is too short.`;
            break;
          }
          if (!/^[a-zA-Z'-]+$/.test(name)) {
            errors.fullName = `Name "${name}" contains invalid characters. Only letters, hyphens, and apostrophes are allowed.`;
            break;
          }
        }
      }
    }
    
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, '');
      if (digitsOnly.length !== 10) {
        errors.phone = `Phone number must be exactly 10 digits. You entered ${digitsOnly.length} digits: "${phone}"`;
      } else if (digitsOnly.startsWith('0') || digitsOnly.startsWith('1')) {
        errors.phone = `Invalid area code. US phone numbers cannot start with 0 or 1. You entered: "${phone}"`;
      }
    }
    
    if (vehicle && vehicle.make && vehicle.model) {
      const makes = Object.keys(VEHICLE_DATA);
      const makeResult = findClosestMatch(vehicle.make, makes);
      
      if (!makeResult.match) {
        if (makeResult.suggestion) {
          errors.vehicle = `"${vehicle.make}" is not a recognized vehicle make. Did you mean "${makeResult.suggestion}"?`;
          suggestions.vehicleMake = makeResult.suggestion;
        } else {
          errors.vehicle = `"${vehicle.make}" is not a recognized vehicle make.`;
        }
      } else {
        const brandModels = VEHICLE_DATA[makeResult.match]?.models || [];
        const modelResult = findClosestMatch(vehicle.model, brandModels);
        
        if (!modelResult.match) {
          const wrongBrandModel = Object.entries(VEHICLE_DATA).find(([, data]) => 
            data.models.some(m => m.toLowerCase() === vehicle.model.toLowerCase())
          );
          
          if (wrongBrandModel) {
            const [correctMake] = wrongBrandModel;
            const correctModel = wrongBrandModel[1].models.find(m => m.toLowerCase() === vehicle.model.toLowerCase());
            errors.vehicle = `"${vehicle.model}" is not a ${makeResult.match} model. The ${correctModel} is made by ${correctMake}. Did you mean ${correctMake} ${correctModel}?`;
            suggestions.vehicleMake = correctMake;
            suggestions.vehicleModel = correctModel;
          } else if (modelResult.suggestion) {
            errors.vehicle = `"${vehicle.model}" is not a valid ${makeResult.match} model. Did you mean "${modelResult.suggestion}"?`;
            suggestions.vehicleModel = modelResult.suggestion;
          }
        }
        
        const detectedType = detectVehicleType(makeResult.match, vehicle.model);
        suggestions.autoDetectedType = detectedType;
      }
      
      if (vehicle.year) {
        const year = parseInt(vehicle.year);
        const currentYear = new Date().getFullYear();
        if (isNaN(year) || year < 1950 || year > currentYear + 2) {
          errors.vehicle = (errors.vehicle || '') + ` Year "${vehicle.year}" is invalid. Please enter a year between 1950 and ${currentYear + 1}.`;
        }
      }
    }
    
    if (address) {
      if (address.state) {
        const stateUpper = address.state.toUpperCase().trim();
        if (!VALID_US_STATES.includes(stateUpper)) {
          const stateMatch = findClosestMatch(stateUpper, VALID_US_STATES);
          if (stateMatch.suggestion) {
            errors.address = `"${address.state}" is not a valid US state code. Did you mean "${stateMatch.suggestion}"?`;
            suggestions.addressCorrection = stateMatch.suggestion;
          } else {
            errors.address = `"${address.state}" is not a valid US state code. Please use a 2-letter state abbreviation (e.g., CO, CA, TX).`;
          }
        }
      }
      
      if (address.zip_code) {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(address.zip_code)) {
          errors.address = (errors.address || '') + ` Zip code "${address.zip_code}" is invalid. Please use format: 12345 or 12345-6789.`;
        }
      }
      
      if (address.street) {
        if (address.street.length < 5) {
          errors.address = (errors.address || '') + ` Street address "${address.street}" seems too short. Please enter a complete address.`;
        }
        if (!/\d/.test(address.street)) {
          errors.address = (errors.address || '') + ` Street address should include a street number.`;
        }
      }
      
      if (address.city && address.city.length < 2) {
        errors.address = (errors.address || '') + ` City name "${address.city}" is too short.`;
      }
    }
    
    const valid = Object.keys(errors).length === 0;
    
    return NextResponse.json({
      valid,
      errors,
      suggestions,
      autoDetectedType: suggestions.autoDetectedType
    });
    
  } catch (err) {
    console.error('Validation error:', err);
    return NextResponse.json({ valid: false, errors: { general: 'Validation failed' }, suggestions: {} }, { status: 500 });
  }
}
