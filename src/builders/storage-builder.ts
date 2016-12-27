import { FunctionBuilder, TriggerDefinition, CloudFunction } from '../builder';
import { Event } from '../event';
import { FirebaseEnv } from '../env';

export interface StorageObjectAccessControl {
  kind: string;
  id: string;
  role: string;
  selfLink?: string;
  bucket?: string;
  object?: string;
  generation?: number;
  entity?: string;
  email?: string;
  entityId?: string;
  domain?: string;
  projectTeam?: {
    projectNumber?: string,
    team?: string,
  };
  etag?: string;
}

export interface StorageObject {
  kind: string;
  id: string;
  selfLink?: string;
  name?: string;
  bucket: string;
  generation?: number;
  metageneration?: number;
  contentType?: string;
  timeCreated?: string;
  updated?: string;
  timeDeleted?: string;
  storageClass?: string;
  size?: number;
  md5Hash?: string;
  mediaLink?: string;
  contentEncoding?: string;
  contentDisposition?: string;
  contentLanguage?: string;
  cacheControl?: string;
  metadata?: {
    [key: string]: string,
  };
  acl?: Array<StorageObjectAccessControl>;
  owner?: {
    entity?: string,
    entityId?: string,
  };
  crc32c?: string;
  componentCount?: number;
  etag?: string;
  customerEncryption?: {
    encryptionAlgorithm?: string,
    keySha256?: string,
  };
}

export default class CloudStorageBuilder extends FunctionBuilder {
  bucket: string;

  constructor(env: FirebaseEnv, bucket: string) {
    super(env);
    this.bucket = bucket;
  }

  onChange(
    handler: (event: Event<StorageObject>) => PromiseLike<any>
  ): CloudFunction {
    return this._makeHandler(handler, 'object.change');
  }

  protected _toTrigger(event: string): TriggerDefinition {
    let bucket;
    if (this.bucket) {
      const format = new RegExp('^(projects/_/buckets/)?([^/]+)$');
      let match = this.bucket.match(format);
      if (!match) {
        const errorString = 'bucket names must either have the format of'
        + ' "bucketId" or "projects/_/buckets/<bucketId>".';
        throw new Error(errorString);
      }
      bucket = match[2];
    }
    return {
      eventTrigger: {
        eventType: 'providers/cloud.storage/eventTypes/' + event,
        resource: this.bucket? 'projects/_/buckets/' + bucket: null,
      },
    };
  }
}
