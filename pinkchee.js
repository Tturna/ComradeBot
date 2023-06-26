const { mulberry32 } = require('./customrandom.js');
const { DateTime } = require('luxon');

const PINKROLE = "1119327148411457657";
const CHEEID = "535483016546615302";

module.exports = {
    isChee: (guild, member) => {
        return new Promise((resolve, reject) => {
            guild.members.fetch(CHEEID)
            .then(found => {
            const result = member.id == found.id;
            resolve(result);
            })
            .catch(e => {
                console.error(e);
                reject('Something went wrong. Maybe chee is not in the server?');
            })
        })
    },

    handlePinkChee: (guild) => {
        const nyDate = DateTime.now().setZone('America/New_York');
        const date = parseInt(nyDate.toISO().split('T')[0].replace(/-/g, ''));
        const rng = mulberry32(date);
        const shouldBePink = rng < 1/7;

        console.log("Chee pink check...");
        console.log(`Date: ${nyDate}, rng: ${rng}`);
        console.log(`Chee should be pink: ${shouldBePink}`)

        guild.members.fetch(CHEEID)
        .then(chee => {
            const roleManager = chee.roles;
        
            if (shouldBePink) {
                roleManager.add(PINKROLE)
                .then(pinkchee => {
                    console.log("Chee is now pink.");
                })
                .catch(e => {
                    console.log(e);
                });
            } else {
                roleManager.remove(PINKROLE)
                .then(normalchee => {
                    console.log("Chee is not pink.");
                })
                .catch(e => {
                    console.log(e);
                });
            }
        })
        .catch(e => {
            console.log(e);
        });
    }
}