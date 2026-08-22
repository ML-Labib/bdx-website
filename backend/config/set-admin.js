const admin = require("./firebase-admin.js");

const target = '';

async function setAdminStatus() {
    try {
        const user = await admin.auth().getUserByEmail(target);
        if (user.customClaims && user.customClaims.admin) {
            console.log(`User ${target} is already an admin.`);
        } else {
            await admin.auth().setCustomUserClaims(user.uid, { admin: true });
            console.log(`Admin status set for user ${target}.`);
        }
    } catch (error) {
        console.error(`Error fetching user by email ${target}:`, error.message);
    }
}

setAdminStatus();