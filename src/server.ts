process.env['NODE_CONFIG_DIR'] = __dirname + '/configs';

import 'dotenv/config';
import App from '@/app';
import validateEnv from '@utils/validateEnv';
import IndexRoute from '@routes/index.route';
import QuestionRoute from '@routes/question.route';
import ResponseRoute from './routes/response.route';
import CommentRoute from './routes/comment.route';
import MatchRoute from './routes/match.route';
import UserRoute from './routes/user.route';

validateEnv();

const app = new App([new IndexRoute(), new QuestionRoute(), new ResponseRoute(), new CommentRoute(), new MatchRoute(), new UserRoute()]);

app.listen();
