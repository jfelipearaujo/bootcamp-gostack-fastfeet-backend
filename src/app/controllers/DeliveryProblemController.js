import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
import DeliveryProblem from '../models/DeliveryProblem';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  /**
   * List all the deliveries with problem
   */
  async index(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      include: [
        {
          model: Package,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(deliveryProblems);
  }

  /**
   * List the delivery's problems
   */
  async delivery(req, res) {
    const { deliveryId } = req.params;

    const delivery = await Package.findByPk(deliveryId);

    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      attributes: ['id', 'delivery_id', 'description'],
      include: [
        {
          model: Package,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
      where: {
        delivery_id: delivery.id,
      },
    });

    return res.json(deliveryProblems);
  }

  /**
   * Deliveryman is able to inform a delivery problem
   */
  async store(req, res) {
    const { deliveryId } = req.params;

    const { description } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description not provided' });
    }

    const packageData = await Package.findByPk(deliveryId);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const { id, delivery_id } = await DeliveryProblem.create({
      delivery_id: packageData.id,
      description,
    });

    return res.json({ id, delivery_id, description });
  }

  /**
   * Cancel a delivery
   */
  async delete(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { deliveryProblemId } = req.params;

    const deliveryProblem = await DeliveryProblem.findOne({
      attributes: ['id', 'delivery_id', 'description'],
      where: { id: deliveryProblemId },
      include: [
        {
          model: Package,
          as: 'delivery',
          attributes: ['id', 'deliveryman_id', 'product'],
          include: [
            {
              model: Deliveryman,
              as: 'deliveryman',
              attributes: ['name', 'email'],
            },
          ],
        },
      ],
    });

    if (!deliveryProblem) {
      return res.status(404).json({ error: 'Delivery Problem not found' });
    }

    const packageData = await Package.findByPk(deliveryProblem.delivery.id);

    const deliveryman = await Deliveryman.findByPk(packageData.deliveryman_id);

    if (packageData.canceled_at !== null) {
      return res.status(400).json({ error: 'Delivery already cancelled' });
    }

    packageData.canceled_at = new Date();

    // Send an e-mail to the Deliveryman
    if (process.env.NODE_ENV !== 'test') {
      await Queue.add(CancellationMail.key, {
        name: deliveryman.name,
        email: deliveryman.email,
        product: packageData.product,
      });
    }

    await packageData.save();

    return res.json({ ok: 'Delivery cancelled' });
  }
}

export default new DeliveryProblemController();
