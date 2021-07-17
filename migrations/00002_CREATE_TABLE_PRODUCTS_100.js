exports.up = function (knex,) {
    return knex.schema.createTable('products', function (table) {
        table.increments();
        table.string('name').unique().notNullable();
        table.decimal('price').notNullable();
        table.timestamps();
    });
};

exports.down = function (knex,) {
    return knex.schema.dropTable('products');
};
