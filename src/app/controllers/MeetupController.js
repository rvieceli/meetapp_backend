import * as Yup from 'yup';
import { parseISO, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import User from '../models/User';
import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  /**
   * List all meetups of logged user
   * @param {Request} req
   * @param {Response} res
   */
  async index(req, res) {
    const where = {};
    const { date, page = 1 } = req.query;

    if (date) {
      const searchDate = parseISO(date);
      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }

    const meetups = await Meetup.findAll({
      where,
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['path', 'url'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'name'],
        },
      ],
    });

    return res.json(meetups);
  }

  async show(req, res) {
    const meetup = await Meetup.findByPk(req.params.id, {
      attributes: ['id', 'title', 'description', 'location', 'date'],
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!meetup) {
      return res.status(404).json({ error: 'Meetup to update does not found' });
    }

    return res.json(meetup);
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
