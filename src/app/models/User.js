import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: {
          type: Sequelize.STRING,
          set(value) {
            this.setDataValue('password', bcrypt.hashSync(value, 8));
          },
        },
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    return this;
  }

  static findByEmail(email) {
    return this.findOne({ where: { email } });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password);
  }

  format() {
    const { id, name, email, provider } = this;
    return { id, name, email, provider };
  }
}

export default User;
