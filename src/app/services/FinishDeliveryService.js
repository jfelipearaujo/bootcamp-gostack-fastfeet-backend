import Package from '../models/Package';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class FinishDeliveryService {
  async run({ deliveryman_id, signature_id, package_id }) {
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      throw new Error('Deliveryman not found');
    }

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      throw new Error('Signature picture not found');
    }

    const packageData = await Package.findByPk(package_id);

    if (!packageData) {
      throw new Error('Package not found');
    }

    if (packageData.start_date === null) {
      throw new Error('Delivery not started - Impossible to finalize it');
    }

    if (packageData.end_date !== null) {
      throw new Error('Delivery already finalized');
    }

    packageData.end_date = new Date();
    packageData.signature_id = signature_id;

    await packageData.save();

    return packageData;
  }
}

export default new FinishDeliveryService();
