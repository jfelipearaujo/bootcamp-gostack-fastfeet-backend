import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import File from '../models/File';

import StartDeliveryService from '../services/StartDeliveryService';
import FinishDeliveryService from '../services/FinishDeliveryService';

class DeliveryController {
  /**
   * List the deliveries of deliveryman
   */
  async index(req, res) {
    const { deliveryman_id } = req.params.deliverymanId;
    let { delivered = 0 } = req.query;

    if (delivered !== 0 && delivered !== 1) {
      delivered = 0;
    }

    if (!deliveryman_id) {
      return res.status(400).json({ error: 'Deliveryman Id not provided' });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    let whereOptions;

    if (delivered === 1) {
      whereOptions = {
        deliveryman_id,
        canceled_at: null,
        end_date: {
          [Op.not]: null,
        },
      };
    } else {
      whereOptions = {
        deliveryman_id,
        canceled_at: null,
        end_date: null,
      };
    }

    const packages = await Package.findAll({
      attributes: [
        'id',
        'product',
        'canceled_at',
        'start_date',
        'end_date',
        'recipient_id',
        'deliveryman_id',
        'signature_id',
      ],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name', 'city', 'state'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['name', 'email'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
      ],
      where: whereOptions,
    });

    return res.json(packages);
  }

  /**
   * Start a delivery
   */
  async start(req, res) {
    const { deliveryman_id } = req.params.deliverymanId;
    const { package_id } = req.body;

    const packageData = await StartDeliveryService.run({
      deliveryman_id,
      package_id,
    });

    return res.json(packageData);
  }

  /**
   * Finish a delivery
   */
  async finish(req, res) {
    const { deliveryman_id } = req.params.deliverymanId;
    const { package_id, signature_id } = req.body;

    const packageData = await FinishDeliveryService.run({
      deliveryman_id,
      signature_id,
      package_id,
    });

    return res.json(packageData);
  }
}

export default new DeliveryController();
