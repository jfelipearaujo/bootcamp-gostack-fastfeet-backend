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
   * List the delivery's details
   */
  async delivery(req, res) {
    const { deliveryId } = req.params.deliveryId;

    if (!deliveryId) {
      return res.status(400).json({ error: 'Delivery Id not provided' });
    }

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
        id: delivery.id,
      },
    });

    return res.json(deliveryProblems);
  }

  /**
   * Deliveryman is able to inform a delivery problem
   */
  async store(req, res) {
    const { deliveryId } = req.params.deliveryId;

    if (!deliveryId) {
      return res.status(400).json({ error: 'Delivery Id not provided' });
    }

    const { package_id, description } = req.body;

    if (!package_id) {
      return res.status(400).json({ error: 'Package Id not provided' });
    }

    if (!description) {
      return res.status(400).json({ error: 'Description not provided' });
    }

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: package_id,
      description,
    });

    return res.json(deliveryProblem);
  }

  /**
   * Cancel a delivery
   */
  async delete(req, res) {
    const { deliveryProblemId } = req.params.deliveryProblemId;

    if (!deliveryProblemId) {
      return res
        .status(400)
        .json({ error: 'Delivery Problem Id not provided' });
    }

    const deliveryProblem = await DeliveryProblem.findOne({
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

    const packageData = await Package.findByPk(deliveryProblem.Package.id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    packageData.canceled_at = new Date();
    await packageData.save();

    await DeliveryProblem.destroy({ where: { id: deliveryProblemId } });

    // Send an e-mail to the Deliveryman
    await Queue.add(CancellationMail.key, {
      name: deliveryProblem.Deliveryman.name,
      email: deliveryProblem.Deliveryman.email,
      product: deliveryProblem.Package.product,
    });

    return res.json({ ok: 'Delivery Problem deleted' });
  }
}

export default DeliveryProblemController();
