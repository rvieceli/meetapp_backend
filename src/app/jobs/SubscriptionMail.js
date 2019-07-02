import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Mail from '../../lib/Mail';

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { subscription } = data;

    await Mail.sendMail({
      to: `${subscription.meetup.user.name} <${subscription.meetup.user.email}>`,
      subject: `Nova inscrição no meetup: ${subscription.meetup.title}`,
      template: 'subscription',
      context: {
        onwer: subscription.meetup.user.name,
        subscriber: subscription.user.name,
        meetup: subscription.meetup.title,
        date: format(
          parseISO(subscription.meetup.date),
          "iiii, dd 'de' MMMM', às' h:mm'h'",
          {
            locale: pt,
          }
        ),
        location: subscription.meetup.location,
      },
    });
  }
}

export default new SubscriptionMail();
