import * as config from './config'
import HttpServer from './lib/http';
import routes from './routes';
import { DatabaseError, Pool } from 'pg';
import setUpAuthenticationStratagies from './services/authentication';
import { DataBase } from './components/users/models/Db';


class App {
  private _server: HttpServer
  private _db: Pool;

  constructor() {
    // to do validateConfig(config)
    this._server = new HttpServer({
      routes,
      port: config.PORT,
      // static: {
      //   dir: path.join(__dirname, './public'),
      // },
    });

    setUpAuthenticationStratagies()
    //to do setup acces control strategy

    //this._db = new Pool();
    this._db = new DataBase().pool
  }

  public async start() {
    try {
      console.log('Подключаюсь к пострес');
      await this.db.connect()
      console.info('Подключение успешно');
      
      this.server.listen(() => {
        console.log(`Server listening on port ${config.PORT}`)
      })
    } catch (error) {
      console.log(error)
      process.exit(1)
    }
  }

  private async stop() {
    //to-do stop services
  }

  get server() {
    return this._server
  }

  get db() {
    return this._db
  }
}

export default new App()

