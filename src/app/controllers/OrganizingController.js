import { Op } from 'sequelize';

import Subscription from '../models/Subscription';
import Meetup from '../models/Meetup';
import User from '../models/User';

class OrganizingController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const subscriptions = await Subscription.findAll({
      where: {
        user_id: req.userId,
      },
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'email'],
            },
          ],
          where: {
            date: {
              [Op.gte]: new Date(),
            },
          },
        },
      ],
      order: [
        [
          {
            model: Meetup,
            as: 'meetup',
          },
          'date',
          'asc',
        ],
      ],
    });

    return res.json(subscriptions);
  }
}

export default new OrganizingController();
