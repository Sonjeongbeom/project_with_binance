import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

export class App {
  constructor(controllers) {
    this.app = express();
    this.#initializeCors();
    this.#initializeMiddlewares();
    this.#intializeHealthCheck();
    this.#initialzeControllers(controllers);
    // this.#initializeNotFoundMiddleware();
    // this.#initializeErrorHandling();
  }

  listen() {
    this.app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`App listening on ${PORT}`);
    });
  }

  #initializeCors() {
    const domains = JSON.parse(process.env.CORS_LIST);
    this.app.use(
      cors({
        origin(origin, callback) {
          const isTrue = domains.indexOf(origin) !== -1;
          callback(null, isTrue);
        },
        allowHeaders: 'Origin, Content-Type, X-Requested-With, Accept',
        methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
        preflightContinue: false,
        credentials: true,
        optionsSuccessStatus: 200,
      }),
    );
  }

  #intializeHealthCheck() {
    this.app.get('/', (req, res) => {
      res.status(200).send('ok');
    });
  }

  #initialzeControllers(controllers) {
    controllers.forEach((controller) => {
      this.app.use(controller.path, controller.router);
    });
  }

  #initializeMiddlewares() {
    this.app.use(morgan('common'));
    this.app.use(express.json({ extended: true, limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  //   #initializeNotFoundMiddleware() {
  //     this.app.use((req, _res, next) => {
  //       if (!req.route) next(new NotFoundException());
  //       next();
  //     });
  //   }

  //   #initializeErrorHandling() {
  //     this.app.use(errorMiddleware);
  //   }
}
