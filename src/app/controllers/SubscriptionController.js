import { isBefore } from 'date-fns';

import User from '../models/User';
import Meetup from '../models/Meetup';
import Subscription from '../models/Subscription';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';
import UnsubscriptionMail from '../jobs/UnsubscriptionMail';

class SubscriptionController {
  /**
   * Subscribe in a meetup
   * @param {Request} req
   * @param {Response} res
   */
  async store(req, res) {
    const { meetup_id } = req.params;

    const meetup = await Meetup.findByPk(meetup_id);

    if (!meetup) {
      return res
        .status(404)
        .json({ error: 'Meetup to subscribe does not found' });
    }

    if (meetup.user_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'You cannot subscribe in yours meetups' });
    }

    if (isBefore(meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot subscribe in past meetups' });
    }

    const isSubscribed = await Subscription.findOne({
      where: {
        user_id: req.userId,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          where: { date: meetup.date },
          required: true,
        },
      ],
    });

    if (isSubscribed) {
      return res.status(400).json({ error: 'You cannot subscribe two times' });
    }

    const subscription = await Subscription.create({
      meetup_id,
      user_id: req.userId,
    });

    const email_data = await Subscription.findByPk(subscription.id, {
      include: [
        {
          model: User,
          as: 'user',
        },
        {
          model: Meetup,
          as: 'meetup',
          include: [
            {
              model: User,
              as: 'user',
            },
          ],
        },
      ],
    });

    /**
     * Send e-mail about subscription
     */
    await Queue.add(SubscriptionMail.key, {
      subscription: email_data,
    });

    return res.json(subscription);
  }

  /**
   * Unsubscribe
   * @param {Request} req
   * @param {Response} res
   */
  async delete(req, res) {
    const { meetup_id } = req.params;

    const subscribe = await Subscription.findOne({
      where: {
        user_id: req.userId,
        meetup_id,
      },
      include: [
        {
          model: Meetup,
          as: 'meetup',
          required: true,
        },
      ],
    });

    if (!subscribe) {
      return res.json({ message: 'You are not subscribed' });
    }

    if (isBefore(subscribe.meetup.date, new Date())) {
      return res
        .status(400)
        .json({ error: 'You cannot unsubscribe in past meetups' });
    }

    await subscribe.destroy();

    /**
     * Send e-mail about subscription
     */
    const meetup = await Meetup.findByPk(meetup_id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });

    const user = await User.findByPk(req.userId);

    await Queue.add(UnsubscriptionMail.key, {
      meetup,
      user,
    });

    return res.json();
  }
}

export default new SubscriptionController();
