import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt-BR';

import Mail from '../../lib/Mail';

class UnsubscriptionMail {
  get key() {
    return 'UnsubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, user } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}>`,
      subject: `Inscrição cancelada no meetup ${meetup.title}`,
      template: 'unsubscription',
      context: {
        onwer: meetup.user.name,
        subscriber: user.name,
        meetup: meetup.title,
        date: format(
          parseISO(meetup.date),
          "iiii, dd 'de' MMMM', às' h:mm'h'",
          {
            locale: pt,
          }
        ),
        location: meetup.location,
      },
    });
  }
}

export default new UnsubscriptionMail();
