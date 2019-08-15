import Mail from '../../lib/Mail';

class PasswordResetMail {
  get key() {
    return 'PasswordResetMail';
  }

  async handle({ data }) {
    const { user, endpoint } = data;

    await Mail.sendMail({
      to: `${user.name} <${user.email}>`,
      subject: `Recuperação de senha`,
      template: 'password_reset',
      context: {
        name: user.name,
        link: `${endpoint}/${user.reset_password_token}`,
      },
    });
  }
}

export default new PasswordResetMail();
