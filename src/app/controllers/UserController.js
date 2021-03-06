import Cache from '../../lib/Cache';
import Queue from '../../lib/Queue';

import File from '../models/File';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({
      where: { email: req.body.email },
    });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe.' });
    }
    const { id, name, email, provider } = await User.create(req.body);
    const user = { id, name, email, provider };
    Queue.add('UserRegistration', { user });

    if (provider) {
      await Cache.invalidate('providers');
    }

    return res.json(user);
  }

  async update(req, res) {
    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.user.id);

    if (email && email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ error: `Já existe um usuário com o email: ${email}` });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Senha inválida' });
    }

    await User.update(req.body);

    const { id, name, provider, avatar } = await User.findByPk(req.user.id, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json({ id, name, email, provider, avatar });
  }
}

export default new UserController();
