exports.up = function (knex,) {
    return knex.schema.createTable('transaction', function (table) {
        table.increments();
        table.string('invoiceName').notNullable();
        table.string('productName').notNullable();
        table.integer('quantity').notNullable();
        table.decimal('unitPrice').notNullable();
        table.decimal('totalPrice').notNullable();
        table.timestamps();
        table.foreign('invoiceName').references('invoice.name')
    });
};

exports.down = function (knex,) {
    return knex.schema.dropTable('transaction');
};
