import { Application } from "oak";
import router from "./routes.ts";


const port = 8080;

const app = new Application();

app.use((ctx, next) => {
  const headers = ctx.request.headers;
  
  if(!headers.get("authorization")){
    ctx.response.status = 401;
  }else if(headers.get("authorization")=="bearer dGhlc2VjcmV0dG9rZW4="){
    next()
  }
});
//hook the routes after the middleware
app.use(router.routes());

app.use(router.allowedMethods())



await app.listen({ port })
