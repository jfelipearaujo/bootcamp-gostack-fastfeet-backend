import { isBefore, isAfter, setHours, setMinutes, setSeconds } from 'date-fns';

import { Op } from 'sequelize';

import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';

class StartDeliveryService {
  async run({ deliveryman_id, package_id }) {
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      throw new Error('Package not found');
    }

    if (packageData.start_date !== null) {
      throw new Error('Delivery already started');
    }

    const today = new Date();
    const todayStartDay = setSeconds(setMinutes(setHours(today, 0), 0), 0);
    const todayStart = setSeconds(setMinutes(setHours(today, 8), 0), 0);
    const todayEnd = setSeconds(setMinutes(setHours(today, 18), 0), 0);

    if (isBefore(today, todayStart) || isAfter(today, todayEnd)) {
      throw new Error('A delivery can only start between 08:00 and 18:00');
    }

    const countOfDayDeliveries = await Package.count({
      where: {
        deliveryman_id,
        start_date: {
          [Op.gt]: todayStartDay,
        },
      },
    });

    if (countOfDayDeliveries >= 5) {
      throw new Error('Only 5 deliveries per day are allowed');
    }

    packageData.start_date = new Date();

    await packageData.save();

    return packageData;
  }
}

export default new StartDeliveryService();
