export class InitiateSslCommerzPaymentDto {
    store_id: string;
    store_passwd: string;
    total_amount: number;
    currency: string;
    tran_id: string;
    success_url: string;
    fail_url: string;
    cancel_url: string;
    product_category: string;
    emi_option: number;
    cus_name: string;
    cus_email: string;
    cus_add1: string;
    cus_city: string;
    cus_postcode: string;
    cus_country: string;
    cus_phone: string;
    shipping_method: string;
    num_of_item: number;
    product_name: string;
    product_profile: string;
    value_a?: string;
    value_b?: string;
    value_c?: string;
    value_d?: string;
  }
  