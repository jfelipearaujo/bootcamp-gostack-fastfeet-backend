import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      package_id: Yup()
        .number()
        .required(),
      product: Yup.string(),
      recipient_id: Yup.number(),
      deliveryman_id: Yup.number(),
      canceled_at: Yup().Date(),
      start_date: Yup().Date(),
      end_date: Yup().Date(),
    });

    await schema.validate(req.body, { abortEarly: false });

    return next();
  } catch (err) {
    return res.status(400).json({
      error: `Validation fails`,
      messages: err.inner,
    });
  }
};
