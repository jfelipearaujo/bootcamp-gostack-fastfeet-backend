import File from '../models/File';

class FileController {
  async store(req, res) {
    if (!req.isAdmin) {
      return res.status(401).json({ error: 'Access denied' });
    }

    const { originalname: name, filename: path } = req.file;

    const file = await File.create({ name, path });

    return res.json(file);
  }
}

export default new FileController();
