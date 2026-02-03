function getDiff(oldData, newData, excludedKeys = ['_id', '__v', 'updatedAt', 'createdAt']) {
    const diff = {};
    for (const key in newData) {
        if (excludedKeys.includes(key)) continue;
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
            diff[key] = {
                Ancien: oldData[key],
                Nouveau: newData[key]
            };
        }
    }
    return diff;
}

module.exports = getDiff