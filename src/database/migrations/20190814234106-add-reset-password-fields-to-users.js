module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn('users', 'reset_password_token', {
        type: Sequelize.UUID,
        allowNull: true,
      }),
      queryInterface.addColumn('users', 'reset_password_expires', {
        type: Sequelize.DATE,
        allowNull: true,
      }),
    ]);
  },

  down: queryInterface => {
    return Promise.all([
      queryInterface.removeColumn('users', 'reset_password_token'),
      queryInterface.removeColumn('users', 'reset_password_expires'),
    ]);
  },
};
