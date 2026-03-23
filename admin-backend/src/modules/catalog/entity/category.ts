import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

/**
 * 分类实体
 */
@Entity('catalog_category')
export class CatalogCategoryEntity extends BaseEntity {
  @Index()
  @Column({ length: 50, comment: '分类名称' })
  name: string;

  @Column({ type: 'int', nullable: true, comment: '父分类ID' })
  parentId: number;

  //thumb
  @Column({ length: 100, nullable: true, comment: '分类图标' })
  thumb: string;

  @Column({ type: 'tinyint', default: 0, comment: '排序' })
  sort: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态',
    dict: ['隐藏', '显示'],
  })
  status: number;
}
