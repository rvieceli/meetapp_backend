import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  /**
   * List all meetups of logged user
   * @param {Request} req
   * @param {Response} res
   */
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  /**
   * Create a new meetup
   * @param {Request} req
   * @param {Response} res
   */
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: err.errors,
      });
    }

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const banner = await File.findByPk(banner_id);

    if (!banner) {
      return res
        .status(400)
        .json({ error: `File does not exists with id #${banner_id}` });
    }

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  /**
   * Update a meetup
   * @param {Request} req
   * @param {Response} res
   */
  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    try {
      await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      return res.status(400).json({
        error: 'Validation failed',
        validationErrors: err.errors,
      });
    }

    const { title, description, location, date, banner_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup to update does not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You can only update yours meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'You cannot update past meetups' });
    }

    const banner = await File.findByPk(banner_id);

    if (!banner) {
      return res
        .status(400)
        .json({ error: `File does not exists with id #${banner_id}` });
    }

    await meetup.update({
      title,
      description,
      location,
      date,
      banner_id,
      user_id: req.userId,
    });

    return res.json(meetup);
  }

  /**
   * Cancel a meetup
   * @param {Request} req
   * @param {Response} res
   */
  async delete(req, res) {
    const meetup = await Meetup.findByPk(req.params.id);

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup to cancel does not found' });
    }

    if (meetup.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: 'You can only cancel yours meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res.status(400).json({ error: 'You cannot cancel past meetups' });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
