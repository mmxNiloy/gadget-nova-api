import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isBuffer } from 'util';

@Injectable()
export class SanitizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    let sanitizedValue = value;

    if (this.isFile(value)) {
      return value;
    }

    if (typeof value === 'string') {
      sanitizedValue = value.trim();
    } else if (Array.isArray(value)) {
      sanitizedValue = this.trimArray(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitizedValue = this.trimObject(value);
    }

    return sanitizedValue;
  }

  private trimObject(obj: any): any {
    const trimmedObj = {};
    for (const key in obj) {
      if (this.isFile(obj[key])) {
        trimmedObj[key] = obj[key];
      } else if (typeof obj[key] === 'string') {
        trimmedObj[key] = obj[key].trim();
      } else if (Array.isArray(obj[key])) {
        trimmedObj[key] = this.trimArray(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        trimmedObj[key] = this.trimObject(obj[key]);
      } else {
        trimmedObj[key] = obj[key];
      }
    }
    return trimmedObj;
  }

  private trimArray(arr: any[]): any[] {
    return arr.map(item => {
      if (this.isFile(item)) {
        return item;
      } else if (typeof item === 'string') {
        return item.trim();
      } else if (Array.isArray(item)) {
        return this.trimArray(item);
      } else if (typeof item === 'object' && item !== null) {
        return this.trimObject(item);
      }
      return item;
    });
  }

  private isFile(value: any): boolean {
    return isBuffer(value) || this.isStream(value);
  }

  private isStream(value: any): boolean {
    return value !== null && typeof value === 'object' && typeof value.pipe === 'function';
  }
}
