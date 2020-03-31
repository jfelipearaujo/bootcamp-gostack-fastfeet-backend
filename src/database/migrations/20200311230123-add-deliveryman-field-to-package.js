module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('packages', 'deliveryman_id', {
      type: Sequelize.INTEGER,
      references: { model: 'deliverymans', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('packages', 'deliveryman_id');
  },
};
