const path = require('path');
const fspromises = require('fs').promises;
async function moveDirSafe(src, dest) {
    await fspromises.mkdir(path.dirname(dest), { recursive: true });

    await fspromises.cp(src, dest, { recursive: true });
    await fspromises.rm(src, { recursive: true, force: true });
}
module.exports = { moveDirSafe };