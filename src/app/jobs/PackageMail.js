import Mail from '../../lib/Mail';

class PackageMail {
  get key() {
    return 'PackageMail';
  }

  async handle({ data }) {
    const { deliveryman, product } = data;

    await Mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Encomenda cadastrada - Pronto para retirada',
      template: 'package',
      context: {
        deliveryman: deliveryman.name,
        product,
      },
    });
  }
}

export default new PackageMail();
