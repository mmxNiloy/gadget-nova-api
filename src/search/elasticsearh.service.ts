// src/search/elasticsearch.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

export interface ProductES {
  id: string; // must match what you index (string)
  title: string;
  brand?: string;
  category?: string;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: process.env.ES_NODE,
      auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.ES_REJECT_UNAUTHORIZED === 'true',
      },
    });
    
  }

  async onModuleInit() {
    try {
      const isAlive = await this.client.ping();
      console.log('✅ Elasticsearch connected:', isAlive);
    } catch (error) {
      console.error('❌ Elasticsearch connection failed:', error);
    }
  }

  /**
   * Index or update a single product
   */
  async indexProduct(product: { id: string; title: string; brand?: string; category?: string }) {
    return this.client.index({
      index: 'products',
      id: product.id.toString(), // id must be string
      document: {
        id: product.id.toString(), // ensure ES document has id field
        title: product.title,
        brand: product.brand,
        category: product.category,
      },
      refresh: true, // searchable immediately
    });
  }

  /**
   * Bulk index products
   */
  async bulkIndexProducts(products: { id: string; title: string }[]) {
    if (!products.length) return;
  
    const body = products.flatMap((product) => [
      { index: { _index: 'products', _id: product.id } },  // ✅ id stays string
      {
        id: product.id,   // ✅ store id as string in _source too
        title: product.title,
      },
    ]);
  
    return this.client.bulk({
      refresh: true,
      operations: body,
    });
  }
  

  /**
   * Search products by title only
   */
  async searchProducts(query: string, page: number, limit: number) {
    const { hits } = await this.client.search<{ id: string; title: string }>({
      index: 'products',
      from: (page - 1) * limit,
      size: limit,
      query: {
        match: {
          title: query,
        },
      },
    });

    return hits.hits.map((hit) => {
      const source = hit._source as ProductES;
      return {
        id: source.id, // ✅ keep as string
        title: source.title,
        score: hit._score,
      };
    });    
  }

  /**
   * Delete product by ID
   */
  async deleteProduct(id: string) {
    return this.client.delete({
      index: 'products',
      id: id.toString(),
      refresh: true,
    });
  }
}
