// src/search/elasticsearch.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';

export interface ProductES {
  id: string;
  title: string;
  description?: string;
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
  async indexProduct(product: { id: string; title: string; description?: string; brand?: string; category?: string }) {
    return this.client.index({
      index: 'products',
      id: product.id.toString(),
      document: {
        id: product.id.toString(),
        title: product.title,
        description: product.description, // ✅ add description
        brand: product.brand,
        category: product.category,
      },
      refresh: true,
    });
  }
  

  /**
   * Bulk index products
   */
  async bulkIndexProducts(products: { id: string; title: string; description?: string }[]) {
    if (!products.length) return;
  
    const body = products.flatMap((product) => [
      { index: { _index: 'products', _id: product.id } },
      {
        id: product.id,
        title: product.title,
        description: product.description, // ✅ include description
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
    const { hits } = await this.client.search<ProductES>({
      index: 'products',
      from: (page - 1) * limit,
      size: limit,
      query: {
        multi_match: {
          query,
          fields: ['title', 'description'], // ✅ search both title & description
          type: 'best_fields', // default, good for OR logic
          operator: 'or',       // match if query appears in any field
        },
      },
    });
  
    return hits.hits.map((hit) => {
      const source = hit._source as ProductES;
      return {
        id: source.id,
        title: source.title,
        description: source.description,
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
