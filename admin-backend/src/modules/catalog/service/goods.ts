import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';

import { CatalogCategoryEntity } from '../entity/category';
import { CatalogGoodsEntity } from '../entity/goods';

@Provide()
export class CatalogGoodsService extends BaseService {
  @InjectEntityModel(CatalogGoodsEntity)
  goodsEntity: Repository<CatalogGoodsEntity>;

  @InjectEntityModel(CatalogCategoryEntity)
  categoryEntity: Repository<CatalogCategoryEntity>;

  private getLeafCategoryIds(
    categoryId: number,
    childrenMap: Map<number, number[]>
  ): number[] {
    const children = childrenMap.get(categoryId) || [];

    if (children.length === 0) {
      return [categoryId];
    }

    const leafIds: number[] = [];

    for (const childId of children) {
      leafIds.push(...this.getLeafCategoryIds(childId, childrenMap));
    }

    return leafIds;
  }

  async page(query: any) {
    const { page = 1, size = 10, categoryId } = query;
    const currentPage = Number(page);
    const pageSize = Number(size);

    const queryBuilder = this.goodsEntity
      .createQueryBuilder('goods')
      .select([
        'goods.id',
        'goods.name',
        'goods.thumb',
        'goods.price',
        'goods.stock',
        'goods.isClose',
        'goods.goodsType',
        'goods.minOrderNum',
        'goods.maxOrderNum',
      ]);

    queryBuilder.where('goods.status = :status', { status: 1 });
    // queryBuilder.andWhere('goods.isClose = :isClose', { isClose: 0 });

    if (categoryId || categoryId === 0) {
      const currentCategoryId = Number(categoryId);

      if (!Number.isNaN(currentCategoryId)) {
        const categories = await this.categoryEntity.find({
          select: ['id', 'parentId', 'status'],
          where: { status: 1 },
        });

        const categoryIds = new Set(categories.map(item => item.id));

        if (!categoryIds.has(currentCategoryId)) {
          return {
            list: [],
            pagination: {
              page: currentPage,
              size: pageSize,
              total: 0,
            },
          };
        }

        const childrenMap = new Map<number, number[]>();

        for (const category of categories) {
          const parentId = category.parentId || 0;
          const siblings = childrenMap.get(parentId) || [];
          siblings.push(category.id);
          childrenMap.set(parentId, siblings);
        }

        const leafCategoryIds = this.getLeafCategoryIds(
          currentCategoryId,
          childrenMap
        );

        queryBuilder.andWhere('goods.categoryId IN (:...categoryIds)', {
          categoryIds: leafCategoryIds,
        });
      }
    }

    queryBuilder.orderBy('goods.id', 'DESC');
    queryBuilder.skip((currentPage - 1) * pageSize);
    queryBuilder.take(pageSize);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      pagination: {
        page: currentPage,
        size: pageSize,
        total,
      },
    };
  }
}
