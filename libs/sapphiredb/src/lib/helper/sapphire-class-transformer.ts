import {ClassType} from '../models/types';

export abstract class SapphireClassTransformer {
  abstract plainToClass<T>(value: any, classType: ClassType<T>): T|T[];

  abstract classToPlain<T>(value: T|T[]): any;
}

