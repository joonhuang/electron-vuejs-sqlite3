exports.up = function (knex,) {
    return knex('products').insert(
        [{ name: 'Potato (1KG)', price: 1.50 },
        { name: 'Potato (2KG)', price: 2.00 },
        { name: 'Strawberry (1KG)', price: 12.00 },
        { name: 'Strawberry (2KG)', price: 20.50 }]
    )
};

exports.down = function (knex,) {
    return knex('products').del()
};
