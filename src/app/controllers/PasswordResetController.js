import uuidv4 from 'uuid/v4';
import { addHours, isBefore } from 'date-fns';
import * as Yup from 'yup';
import User from '../models/User';

import PasswordResetMail from '../jobs/PasswordResetMail';
import Queue from '../../lib/Queue';

class PasswordResetController {
  async store(req, res) {
    const { email, endpoint } = req.body;

    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      endpoint: Yup.string()
        .url()
        .required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error:
          'Não foi possível resetar sua senha, tente novamente mais tarde.',
        validationErrors: err.errors,
      });
    }

    const user = await User.findByEmail(email);

    if (user) {
      user.reset_password_token = uuidv4();
      user.reset_password_expires = addHours(new Date(), 1);
      await user.save();

      /**
       * Send e-mail about subscription
       */
      await Queue.add(PasswordResetMail.key, {
        user,
        endpoint,
      });
    }

    return res.json({
      message: `Enviamos as instruções para o email ${email}.`,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
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
        error:
          'Não foi possível resetar sua senha, tente novamente mais tarde.',
        validationErrors: err.errors,
      });
    }

    const { token } = req.params;
    const { email, password } = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      return res.status(400).json({
        error: 'Não foi possível resetar sua senha, solicite novamente.',
      });
    }

    if (
      user.reset_password_token !== token ||
      isBefore(user.reset_password_expires, new Date())
    ) {
      return res.status(400).json({
        error:
          'O token para alteração de senha expirou ou não existe, solicite novamente.',
      });
    }

    await user.update({
      password,
      reset_password_token: null,
      reset_password_expires: null,
    });

    return res.send({
      message: `Senha alterada com sucesso.`,
    });
  }
}

export default new PasswordResetController();
