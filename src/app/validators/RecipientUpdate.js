import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string(),
      number: Yup.number(),
      complement: Yup.string(),
      state: Yup.string()
        .min(2)
        .max(2),
      city: Yup.string(),
      cep: Yup.string()
        .min(8)
        .max(8),
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
