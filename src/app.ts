import * as config from './config'
import HttpServer from './lib/http';
import routes from './routes';
import { DatabaseError, Pool } from 'pg';
import setUpAuthenticationStratagies from './services/authentication';
import { DataBase } from './lib/database';



class App {
  private _server: HttpServer
  private _db: Pool;

  constructor() {
    // to do validateConfig(config)
    this._db = new DataBase().pool
    this._server = new HttpServer({
      routes
      // static: {
      //   dir: path.join(__dirname, './public'),
      // },
    });

    setUpAuthenticationStratagies()
    //to do setup acces control strategy

    //this._db = new Pool();
    
  }

  public async start() {
    try {
      console.log('Подключаюсь к пострес');
      await this.db.connect()
      console.info('Подключение успешно');
      
      this.server.listen(config.PORT, () => {
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

