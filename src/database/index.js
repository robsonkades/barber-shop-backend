import Sequelize from 'sequelize';

import configDatabase from '../config/database';

import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(configDatabase);
    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && models.associate(this.connection.models)
    );
  }
}

export default new Database();