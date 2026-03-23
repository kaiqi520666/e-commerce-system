import { Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { CatalogCategoryEntity } from '../entity/category';

@Provide()
export class CatalogCategoryService extends BaseService {
  @InjectEntityModel(CatalogCategoryEntity)
  categoryEntity: Repository<CatalogCategoryEntity>;

  async list() {
    const rows = await this.categoryEntity.find({
      where: { status: 1 },
      order: { sort: 'DESC', id: 'ASC' },
      select: ['id', 'name', 'thumb', 'parentId', 'sort'],
    });

    const map = new Map<number, any>();
    const tree: any[] = [];

    for (const row of rows) {
      map.set(row.id, {
        id: row.id,
        name: row.name,
        thumb: row.thumb,
        parentId: row.parentId || 0,
        sort: row.sort,
        children: [],
      });
    }

    for (const row of rows) {
      const node = map.get(row.id);

      if (!row.parentId || row.parentId === 0) {
        tree.push(node);
      } else {
        const parent = map.get(row.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    }

    return tree;
  }
}
