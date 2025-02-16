import { BadRequestException, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3Service {
  private readonly AWS_S3_BUCKET: string;
  private readonly s3: AWS.S3;

  constructor(private readonly configService: ConfigService) {
    this.AWS_S3_BUCKET = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_S3_BUCKET_ACCESS_KEY'),
      secretAccessKey: this.configService.get<string>('AWS_S3_BUCKET_SECRET_KEY'),
      region: this.configService.get<string>('AWS_S3_BUCKET_REGION'),
    });
  }

  async uploadFile(file: Express.Multer.File, keyPrefix: string = '') {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
      throw new BadRequestException('Invalid file data');
    }

    const key = `${keyPrefix}/${Date.now()}-${file.originalname}`;

    const params: AWS.S3.PutObjectRequest = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const uploadResult = await this.s3.upload(params).promise();
      return uploadResult; // Contains Location (S3 URL)
    } catch (error) {
      console.log(error);
      
      throw new BadRequestException('Failed to upload file to S3');
    }
  }

  async deleteFileFromS3(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.AWS_S3_BUCKET,
        Key: key,
      };

      await this.s3.deleteObject(params).promise();
    } catch (error) {
      throw new BadRequestException('Failed to delete file from S3');
    }
  }
}
