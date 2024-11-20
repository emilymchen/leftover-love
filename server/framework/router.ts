import express, { Request, Response } from "express";
import "reflect-metadata";

import { ZodSchema } from "zod";

export type HttpMethod = "all" | "get" | "post" | "put" | "delete" | "patch" | "options" | "head";

/**
 * A formattable error. Use `{0}`, `{1}`, etc. in the error message to format it with the arguments passed to the constructor.
 * The `formatWith` method can be used to create a new error with the same format but different arguments.
 *
 * Example:
 * ```
 * let error = new FormattableError("{0} is not the author of post {1}!", author, _id);
 * let errorWithUsername = e.formatWith(username, _id);
 * ```
 */
export class FormattableError extends Error {
  public HTTP_CODE: number = 500;

  constructor(
    public readonly format: string,
    ...args: unknown[]
  ) {
    super(
      format.replace(/{(\d+)}/g, (match, number) => {
        return typeof args[number] !== "undefined" ? (args[number] as string) : match;
      }),
    );
  }

  formatWith(...args: unknown[]) {
    const e = new FormattableError(this.format, ...args);
    e.HTTP_CODE = this.HTTP_CODE;
    return e;
  }
}

/**
 * This class an abstraction over the express router, used to decorate methods in your concept classes.
 * It will automatically convert actions into express handlers.
 *
 * For error handling, `message` and `HTTP_CODE` properties of errors are used to send responses.
 */
export class Router {
  public readonly expressRouter = express.Router();
  private static readonly errorHandlers: Map<new (...args: never[]) => Error, (e: Error) => Error | Promise<Error>> = new Map();

  constructor() {}

  public static registerError<EType>(etype: new (...args: never[]) => EType, handler: (e: EType) => Error | Promise<Error>) {
    this.errorHandlers.set(etype as new (...args: never[]) => Error, handler as (e: Error) => Error | Promise<Error>);
  }

  private static async handleError(err: Error) {
    try {
      for (const [etype, handler] of this.errorHandlers) {
        if (err instanceof etype) {
          return await handler(err);
        }
      }
      return err;
    } catch (e: unknown) {
      return new Error(`While handling below error:\n${err}\n\nAnother error occurred:\n${e}`);
    }
  }

  public registerRoute(method: HttpMethod, path: string, action: Function, validator?: ZodSchema) {
    this.expressRouter[method](path, this.makeRoute(action, validator));
  }

  public all(path: string, action: Function) {
    this.registerRoute("all", path, action);
  }
  public get(path: string, action: Function) {
    this.registerRoute("get", path, action);
  }
  public post(path: string, action: Function) {
    this.registerRoute("post", path, action);
  }
  public put(path: string, action: Function) {
    this.registerRoute("put", path, action);
  }
  public delete(path: string, action: Function) {
    this.registerRoute("delete", path, action);
  }
  public patch(path: string, action: Function) {
    this.registerRoute("patch", path, action);
  }
  public options(path: string, action: Function) {
    this.registerRoute("options", path, action);
  }
  public head(path: string, action: Function) {
    this.registerRoute("head", path, action);
  }

  private makeRoute(f: Function, validator?: ZodSchema) {
    const argNames = getParamNames(f);

    return async (req: Request, res: Response) => {
      const reqMap = (name: string) => {
        if (name === "session" || name == "param" || name == "query" || name == "body") {
          return req[name];
        }
        const ret = req.params[name] || req.query[name] || req.body[name];
        if (ret === undefined || ret === null) {
          // TODO: Can we know if this param was required?
          return undefined;
        }
        return ret;
      };

      let args = Object.fromEntries(
        argNames.map((arg) => {
          return [arg, reqMap(arg)];
        }),
      );

      // make object from argNames and args
      if (validator) {
        try {
          args = validator.parse(args);
        } catch (e: unknown) {
          res.status(400).json({ msg: "Bad Request: validation failed" });
          return;
        }
      }

      let result;
      try {
        result = f.call(null, ...Object.values(args));
        if (result instanceof Promise) {
          result = await result;
        }
      } catch (e: unknown) {
        const error = (await Router.handleError(e as Error)) as Error & { HTTP_CODE?: number };
        res.status(error.HTTP_CODE ?? 500).json({ msg: error.message ?? "Internal Server Error" });
        return;
      }
      res.json(result);
    };
  }

  /** (called as a decorator) Add a handler for all requests. */
  static all(route: string) {
    return this.httpDecorator("get", route);
  }
  /** (called as a decorator) Add a handler for `GET` requests. */
  static get(route: string) {
    return this.httpDecorator("get", route);
  }
  /** (called as a decorator) Add a handler for `POST` requests. */
  static post(route: string) {
    return this.httpDecorator("post", route);
  }
  /** (called as a decorator) Add a handler for `PUT` requests. */
  static put(route: string) {
    return this.httpDecorator("put", route);
  }
  /** (called as a decorator) Add a handler for `DELETE` requests. */
  static delete(route: string) {
    return this.httpDecorator("delete", route);
  }
  /** (called as a decorator) Add a handler for `PATCH` requests. */
  static patch(route: string) {
    return this.httpDecorator("patch", route);
  }
  /** (called as a decorator) Add a handler for `OPTIONS` requests. */
  static options(route: string) {
    return this.httpDecorator("options", route);
  }
  /** (called as a decorator) Add a handler for `HEAD` requests. */
  static head(route: string) {
    return this.httpDecorator("head", route);
  }

  /**
   * (called as a decorator) Add a validator for client inputs.
   * @param zodSchema Zod "schema" describing types, constraints, and/or coercions
   */
  static validate(zodSchema: ZodSchema) {
    return function (originalMethod: Function, context: ClassMethodDecoratorContext<Object>) {
      context.addInitializer(function () {
        Reflect.defineMetadata("zodSchema", zodSchema, this, context.name);
      });
    };
  }

  private static httpDecorator(method: HttpMethod, route: string) {
    return function (originalMethod: Function, context: ClassMethodDecoratorContext<Object>) {
      context.addInitializer(function () {
        // For each method decorated with this decorator, save the method and path metadata.
        // This metadata can be accessed later to build the express router.
        Reflect.defineMetadata("method", method, this, context.name);
        Reflect.defineMetadata("path", route, this, context.name);
      });
    };
  }
}

function getParamNames(f: Function) {
  return f
    .toString()
    .match(/\((.*?)\)/)![1] // Get list of parameters between the brackets
    .split(",")
    .map((param: string) => param.split("=")[0].trim()); // Delete default values and remove whitespaces
}

/**
 * Build an Express router.
 * @param routes object where functions have been decorated with e.g. `@Router.get`, etc.
 * @returns router to be mounted in an Express app
 */
export function getExpressRouter(routes: Object) {
  const router = new Router();

  // Get all methods in the Routes class (e.g., getUsers, createUser, etc).
  const endpoints = Object.getOwnPropertyNames(Object.getPrototypeOf(routes));

  // Register the methods as routes in `router`.
  for (const endpoint of endpoints) {
    // Get the method and path metadata from the routes object.
    // These come from decorators in the Routes class.
    const method = Reflect.getMetadata("method", routes, endpoint) as HttpMethod;
    const path = Reflect.getMetadata("path", routes, endpoint) as string;
    const zodSchema = Reflect.getMetadata("zodSchema", routes, endpoint) as ZodSchema | undefined;

    // Skip if the method or path is not defined (e.g., when endpoint is the constructor)
    if (!method || !path) {
      continue;
    }

    // The ugly cast is because TypeScript doesn't know that `routes[endpoint]` is a correct method.
    const action = (routes as Record<string, Function>)[endpoint];

    router.registerRoute(method, path, action, zodSchema);
  }

  return router.expressRouter;
}
