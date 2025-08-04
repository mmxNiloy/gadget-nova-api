import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SslCommerzResponseDto {
  @IsString()
  tran_id: string;

  @IsString()
  status: string;

  @IsString()
  val_id: string;

  @IsString()
  amount: string;

  @IsString()
  store_amount: string;

  @IsString()
  currency: string;

  @IsString()
  bank_tran_id: string;

  @IsString()
  card_type: string;

  @IsString()
  card_no: string;

  @IsString()
  card_issuer: string;

  @IsString()
  card_brand: string;

  @IsString()
  card_sub_brand: string;

  @IsString()
  card_issuer_country: string;

  @IsString()
  card_issuer_country_code: string;

  @IsString()
  store_id: string;

  @IsString()
  verify_sign: string;

  @IsString()
  verify_key: string;

  @IsString()
  cus_fax: string;

  @IsString()
  currency_type: string;

  @IsString()
  currency_amount: string;

  @IsString()
  currency_rate: string;

  @IsString()
  base_fair: string;

  @IsString()
  value_a: string;

  @IsString()
  value_b: string;

  @IsString()
  value_c: string;

  @IsString()
  value_d: string;

  @IsString()
  risk_title: string;

  @IsString()
  risk_level: string;

  @IsString()
  APIConnect: string;

  @IsString()
  validated_on: string;

  @IsString()
  gw_version: string;

  @IsString()
  @IsOptional()
  emi_instalment?: string;

  @IsString()
  @IsOptional()
  emi_amount?: string;

  @IsString()
  @IsOptional()
  emi_description?: string;

  @IsString()
  @IsOptional()
  emi_issuer?: string;

  @IsString()
  @IsOptional()
  error?: string;

  @IsString()
  @IsOptional()
  error_code?: string;
} 