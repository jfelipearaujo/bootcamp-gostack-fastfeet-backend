import { isBefore, isAfter, setHours, setMinutes, setSeconds } from 'date-fns';
import { Op } from 'sequelize';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliveryController {
  /**
   * List the registered deliveries of deliveryman
   */
  async index(req, res) {
    const { deliverymanId } = req.params.deliverymanId;

    if (!deliverymanId) {
      return res.status(400).json({ error: 'Deliveryman Id not provided' });
    }

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    let { delivered = 0 } = req.query;

    if (delivered !== 0 && delivered !== 1) {
      delivered = 0;
    }

    // Retuns only packages delivered
    if (delivered === 1) {
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
        where: {
          deliveryman_id: deliverymanId,
          canceled_at: null,
          end_date: {
            [Op.not]: null,
          },
        },
      });

      return res.json(packages);
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
      where: {
        deliveryman_id: deliverymanId,
        canceled_at: null,
        end_date: null,
      },
    });

    return res.json(packages);
  }

  /**
   * Start a delivery
   */
  async start(req, res) {
    const today = new Date();
    const todayStartDay = setSeconds(setMinutes(setHours(today, 0), 0), 0);
    const todayStart = setSeconds(setMinutes(setHours(today, 8), 0), 0);
    const todayEnd = setSeconds(setMinutes(setHours(today, 18), 0), 0);

    if (isBefore(today, todayStart) || isAfter(today, todayEnd)) {
      return res.status(400).json({
        error: 'A delivery can only start between 08:00 and 18:00',
      });
    }

    const { deliverymanId } = req.params.deliverymanId;

    if (!deliverymanId) {
      return res.status(400).json({ error: 'Deliveryman Id not provided' });
    }

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const countOfDayDeliveries = await Package.count({
      where: {
        deliveryman_id: deliverymanId,
        start_date: {
          [Op.gt]: todayStartDay,
        },
      },
    });

    if (countOfDayDeliveries >= 5) {
      return res
        .status(400)
        .json({ error: 'Only 5 deliveries per day are allowed' });
    }

    const { package_id } = req.body;

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    if (packageData.start_date !== null) {
      return res.status(400).json({
        error: 'Delivery already started',
      });
    }

    packageData.start_date = new Date();

    await packageData.save();

    return res.json(packageData);
  }

  /**
   * Finish a delivery
   */
  async finish(req, res) {
    const { deliverymanId } = req.params.deliverymanId;

    if (!deliverymanId) {
      return res.status(400).json({ error: 'Deliveryman Id not provided' });
    }

    const deliveryman = await Deliveryman.findByPk(deliverymanId);

    if (!deliveryman) {
      return res.status(404).json({ error: 'Deliveryman not found' });
    }

    const { package_id, signature_id } = req.body;

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(404).json({ error: 'Signature picture not found' });
    }

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      return res.status(404).json({ error: 'Package not found' });
    }

    if (packageData.start_date === null) {
      return res.status(400).json({
        error: 'Delivery not started - Impossible to finalize it',
      });
    }

    if (packageData.end_date !== null) {
      return res.status(400).json({
        error: 'Delivery already finalized',
      });
    }

    packageData.end_date = new Date();
    packageData.signature_id = signature_id;

    await packageData.save();

    return res.json(packageData);
  }
}

export default new DeliveryController();
