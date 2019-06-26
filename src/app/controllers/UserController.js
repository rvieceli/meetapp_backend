import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: err.errors,
      });
    }

    if (await User.findByEmail(req.body.email)) {
      return res.status(400).json({ error: 'User email already exists' });
    }

    const user = await User.create(req.body);

    return res.status(201).json(user.format());
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: err.errors,
      });
    }

    const { name, email } = req.body;
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      if (await User.findByEmail(email)) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }

    await user.update({ name, email });

    return res.json(user.format());
  }
}

export default new UserController();
