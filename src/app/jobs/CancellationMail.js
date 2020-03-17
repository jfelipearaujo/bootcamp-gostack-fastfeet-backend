import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { name, email, product } = data;

    await Mail.sendMail({
      to: `${name} <${email}>`,
      subject: 'Entrega cancelada',
      template: 'cancellation',
      context: {
        name,
        product,
      },
    });
  }
}

export default new CancellationMail();
