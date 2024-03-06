const { mulberry32 } = require('./customrandom.js');
const { DateTime } = require('luxon');

const PINKROLE = '1119327148411457657';
const CHEEID = '535483016546615302';

const isChee = (member) => {
  return member.id == CHEEID;
};

const handlePinkChee = async (guild) => {
  const mightyPeruDate = DateTime.now().setZone('America/New_York');
  const date = parseInt(mightyPeruDate.toISO().split('T')[0].replace(/-/g, ''));
  const rng = mulberry32(date);
  const shouldBePink = rng < 1/7;

  // console.log('Chee pink check...');
  // console.log(`Date: ${mightyPeruDate}, rng: ${rng}`);
  console.log(`Chee should be pink: ${shouldBePink}`);

  const chee = await guild.members.fetch(CHEEID);

  if (!chee) {
    console.warn('CHEE IS NOT IN THE SERVER!');
  }

  const roleManager = chee.roles;

  if (shouldBePink) {
    await roleManager.add(PINKROLE);
    console.log('Chee is now pink');
  } else {
    await roleManager.remove(PINKROLE);
    console.log('Chee is not pink');
  }
};

module.exports = { isChee, handlePinkChee };
