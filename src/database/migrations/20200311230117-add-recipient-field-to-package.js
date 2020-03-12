module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('packages', 'recipient_id', {
      type: Sequelize.INTEGER,
      references: { model: 'recipients', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: false,
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('packages', 'recipient_id');
  },
};
