//getNotPostedRelatedPostsQuery
module.exports.getNotPostedRelatedPostsQuery = function (id) {
    const query = `
    SELECT postUrl, postText, pk
    FROM
        -- 아이디와 관련된 모든 포스트
        (SELECT postUrl, postText, pk, id
        FROM idRelatedPosts
            WHERE id = '`+ id + `') idRelatedPosts
    LEFT JOIN
        -- 아이디에서 이전에 포스팅된 포스트
        (SELECT postPk
    FROM idPostedPosts
    LEFT JOIN instagramId ON instagramId.pk = idPostedPosts.instagramIdPk
    WHERE instagramId.id = '`+ id + `') idPostedPosts
    ON idRelatedPosts.pk = idPostedPosts.postPk
        -- 차집합 병합
    WHERE idPostedPosts.postPk IS NULL;`
    return query;
}

//getInsertIdPostedPostQuery
module.exports.getInsertIdPostedPostQuery = function (instagramIdPk, postPk) {
    const query = `
    INSERT INTO idPostedPosts(instagramIdPk, postPk)
    VALUES(`+ instagramIdPk + `,` + postPk + `);`
    return query;
}

//getIncreseTimesPostedQuery
module.exports.getIncreseTimesPostedQuery = function (postPk) {
    const query = `UPDATE posts SET timesPosted = timesPosted + 1 WHERE pk = ` + postPk + `;`
    return query;
}

//getUpdateCookiesQuery
module.exports.getUpdateCookiesQuery = function (id, cookies) {
    const query = `UPDATE instagramId
    SET cookies = '`+ cookies + `'
    WHERE id = '`+ id + `';`
    return query;
}

//getUpdateActionBlockedQuery
module.exports.getUpdateActionBlockedQuery = function (id, blocked) {
    const query = `UPDATE instagramId
    SET blocked=`+ blocked + `
    WHERE id = '`+ id + `';`
    return query;
}

//getInsertIpQuery
module.exports.getInsertIpQuery = function (ip) {
    const query = `
    INSERT INTO ips
        (ip)
    VALUES
        ('`+ ip + `');`
    return query;
}

//getIpQuery
module.exports.getIpQuery = function (ip) {
    const query = `
    SELECT * 
    FROM ips
    WHERE
        ip = '`+ ip + `';`
    return query;
}

//getInsertIpVisitedIdsQuery
module.exports.getInsertIpVisitedIdsQuery = function (idPk, ipPk) {
    const query = `
    INSERT INTO idVisitedIps
        (instagramIdPk, ipPk)
    VALUES
        ('`+ idPk + `', '` + ipPk + `');`
    return query;
}

//getInsertLogQuery
module.exports.getInsertLogQuery = function (file, ipPk, error, time) {
    const query = `
    INSERT INTO logs
        (file, instagramIdPk, name, message, stack, time)
    VALUES
        ('`+ file + `', '` + ipPk + `', '` + error.name + `', '` + error.message + `', '` + error.stack + `', '` + time + `');`
    return query;
}

//getCategoryUserNamesQuery
module.exports.getCategoryUserNamesQuery = function (category) {
    const query = `
    SELECT userName
    FROM category as c 
    INNER JOIN categoryUserNames as n 
    ON c.pk = n.categoryPk
    WHERE c.category = '`+ category + `';`
    return query;
}

//getInsertKakaoAccountQuery
module.exports.getInsertKakaoAccountQuery = function (id, password, registerEmail) {
    const query = `
    INSERT INTO 
    kakaoId(id,password,registeredEmail)
    VALUE ('`+ id + `','` + password + `','` + registerEmail + `');`
    return query;
}

//getInsertInstaAccountQuery
module.exports.getInsertInstaAccountQuery = function (id, name, password, registerEmail) {
    const query = `
    INSERT INTO 
    instagramId(id,name,password,registeredEmail)
    VALUE ('`+ id + `','` + name + `','` + password + `','` + registerEmail + `');`
    return query;
}
//getInsertInstaAccountByGooglePkQuery
module.exports.getInsertInstaAccountByGooglePkQuery = function (id, name, password, registerEmail, googlePk) {
    const query = `
    INSERT INTO 
    instagramId(id,name,password,registeredEmail,googlePk)
    VALUE ('`+ id + `','` + name + `','` + password + `','` + registerEmail + `','` + googlePk + `');`
    return query;
}

//getInsertFacebookAccountQuery
module.exports.getInsertFacebookAccountQuery = function (id, name, password, registerEmail) {
    const query = `
    INSERT INTO 
    facebookId(id,name,password,registeredEmail)
    VALUE ('`+ id + `','` + name + `','` + password + `','` + registerEmail + `');`
    return query;
}

//getCategoryRelatedTags
module.exports.getCategoryRelatedTags = function (categoryPk) {
    const query = `
    SELECT tag
    FROM tags
    INNER JOIN
    (SELECT tagPk
    FROM category
    INNER JOIN categoryRelatedTags
    ON category.pk = categoryRelatedTags.categoryPk
    WHERE category.pk = '`+ categoryPk + `') AS b
    ON tags.pk = b.tagPk;`
    return query;
}

//getInsertGoogleId
module.exports.getInsertGoogleId = function (id, password, firstName, lastName, device, createTime) {
    const query = `
    INSERT INTO 
    googleId(id,password,firstName,lastName,device,createTime)
    VALUE ('`+ id + `','` + password + `','` + firstName + `','` + lastName + `','` + device + `','` + createTime + `');`
    return query;
}

//getGoogleIds
module.exports.getGoogleIds = function () {
    return `
    SELECT id,password FROM instaWatch.googleId ORDER BY pk DESC;`
}

//getRemoveGoogleId
module.exports.getRemoveGoogleId = function (id) {
    return `
    DELETE FROM instaWatch.googleId WHERE id = '`+ id + `';`
}

//getInstagramIdQuery
module.exports.getInstagramIdQuery = function (id) {
    const query = 'SELECT * FROM instagramId WHERE id =\'' + id + '\''
    return query;
}

//getInstagramCreatableGoogleAccount
module.exports.getInstagramCreatableGoogleAccount = function () {
    return `
    SELECT * FROM instaWatch.googleId
    WHERE instaPk is null
    ORDER BY pk ASC
    LIMIT 1
    `
}

//getInstagramCreatableGoogleAccount
module.exports.getUpdateGoogleInstagramPk = function (googlePk, instaPk) {
    return `
    UPDATE instaWatch.googleId
    SET instaPk = '`+ instaPk + `'
    WHERE pk = '`+ googlePk + `';
    `
}

//getMostWaitedInstagramAccount
module.exports.getMostWaitedInstagramAccount = function () {
    const query = `
    SELECT * FROM instaWatch.instagramId
    WHERE blocked = 0
    ORDER BY lastActionTime ASC
    LIMIT 1;
    `
    return query;
}

//getUpdateInstagramActionTime
module.exports.getUpdateInstagramActionTime = function (pk) {
    const query = `
    UPDATE instaWatch.instagramId
    SET lastActionTime=CURRENT_TIME()
    WHERE pk = '`+ pk + `';
    `
    return query;
}

//getAllUnassignedIncognitonId
module.exports.getAllUnassignedIncognitonId = function () {
    const query = `
    SELECT * FROM instaWatch.incognitonId
    WHERE assignedAmount < 10;
    `
    return query;
}

//getNullIncognitonPkInstagramId
module.exports.getNullIncognitonPkInstagramId = function () {
    const query = `
    SELECT * FROM instaWatch.instagramId
    WHERE incognitonPk IS NULL
    LIMIT 1
    `
    return query;
}

//getSetInstagramIdIncognitonPk
module.exports.getSetInstagramIdIncognitonPk = function (instagramPk, incognitonPk) {
    const query = `
    UPDATE instaWatch.instagramId
    SET incognitonPk = `+ incognitonPk + `
    WHERE  pk = `+ instagramPk + `
    `
    return query;
}