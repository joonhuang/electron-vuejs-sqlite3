exports.up = function (knex,) {
    return knex('users').insert({ name: 'Slaughterhouse Five' })
};

exports.down = function (knex,) {
    return knex('users')
        .where('name', 'Slaughterhouse Five')
        .del()
};
