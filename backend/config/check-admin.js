const admin = require("./firebase-admin.js");

const target = 'mahirlabib914.ml@gmail.com';

async function getUserIdByEmail() {
    try {
        const user = await admin.auth().getUserByEmail(target);
        
        // Correctly log the actual User ID (UID)
        console.log(`User ID for ${target}: ${user.uid}`);
        
        // Correctly log the custom claims object
        console.log(`Custom Claims:`, user.customClaims && user.customClaims.admin ? "User is an admin" : "User is not an admin");
        console.log(`Custom Claims Object:`, user.customClaims);
    } catch (error) {
        console.error(`Error fetching user by email ${target}:`, error.message);
    }
}

getUserIdByEmail();