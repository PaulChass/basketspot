const generateRandomAvatarUrl = (gender: 'male' | 'female') => {
  const topTypes = gender === 'male'
    ? ['ShortHairShortFlat', 'ShortHairShortCurly', 'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairFrizzle', 'ShortHairDreads01', 'ShortHairShortRound']
    : ['LongHairStraight', 'LongHairCurly', 'LongHairStraight2', 'LongHairFrida', 'LongHairBigHair'];

  const accessoriesTypes = ['Blank', 'Prescription01', 'Prescription02', 'Round', 'Sunglasses', 'Wayfarers', 'Kurt'];
  const hairColors = ['Brown', 'Black', 'Blonde', 'Red', 'BrownDark', 'BlondeGolden'];
  const facialHairTypes = gender === 'male' ? ['Blank', 'BeardLight', 'BeardMedium', 'BeardMajestic', 'MoustacheFancy'] : ['Blank'];
  const clotheTypes = ['Hoodie', 'GraphicShirt', 'BlazerShirt', 'ShirtCrewNeck', 'ShirtVNeck', 'BlazerSweater'];
  const eyeTypes = ['Default', 'Happy', 'Wink', 'Squint'];
  const eyebrowTypes = ['Default', 'DefaultNatural', 'RaisedExcited', 'AngryNatural', 'UpDown'];
  const mouthTypes = ['Smile', 'Default', 'Serious'];
  const skinColors = ['Light', 'Brown', 'DarkBrown'];

  return `https://avataaars.io/?avatarStyle=Circle&topType=${randomItem(topTypes)}&accessoriesType=${randomItem(accessoriesTypes)}&hairColor=${randomItem(hairColors)}&facialHairType=${randomItem(facialHairTypes)}&clotheType=${randomItem(clotheTypes)}&eyeType=${randomItem(eyeTypes)}&eyebrowType=${randomItem(eyebrowTypes)}&mouthType=${randomItem(mouthTypes)}&skinColor=${randomItem(skinColors)}`;
};

const randomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];

export const predefinedAvatars = () => {
  console.log('Generating predefined avatars...');
  
  const avatars: string[] = [];
  for (let i = 0; i < 80; i++) {
    avatars.push(generateRandomAvatarUrl('male'));
  }
  for (let i = 0; i < 40; i++) {
    avatars.push(generateRandomAvatarUrl('female'));
  }
  console.log('Predefined avatars:', avatars);
  return avatars;
};