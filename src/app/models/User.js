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
        reset_password_token: Sequelize.UUID,
        reset_password_expires: Sequelize.DATE,
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
