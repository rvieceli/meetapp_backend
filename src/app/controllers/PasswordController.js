import * as Yup from 'yup';
import User from '../models/User';

class PasswordController {
  async update(req, res) {
    const schema = Yup.object().shape({
      oldPassword: Yup.string()
        .required()
        .min(6),
      password: Yup.string()
        .required()
        .min(6),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: err.errors,
      });
    }

    const { password, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (!(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update({ password });

    return res.send(user.format());
  }
}

export default new PasswordController();
