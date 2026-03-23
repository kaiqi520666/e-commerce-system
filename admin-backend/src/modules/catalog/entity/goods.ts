import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../base/entity/base';

@Entity('catalog_goods')
export class CatalogGoodsEntity extends BaseEntity {
  @Index()
  @Column({ type: 'bigint', comment: '分类ID' })
  categoryId: number;

  @Index()
  @Column({ length: 200, comment: '商品名称' })
  name: string;

  @Column({ length: 255, nullable: true, comment: '商品主图' })
  thumb: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 7,
    default: 0,
    comment: '商品价格',
  })
  price: string;

  @Column({ type: 'int', default: 0, comment: '库存' })
  stock: number;

  @Column({
    type: 'tinyint',
    default: 1,
    comment: '状态',
    dict: ['下架', '上架'],
  })
  status: number;

  @Column({ type: 'tinyint', default: 0, comment: '第三方关闭状态' })
  isClose: number;

  @Column({ type: 'tinyint', default: 0, comment: '商品类型' })
  goodsType: number;

  @Column({ type: 'int', default: 1, comment: '最小下单数' })
  minOrderNum: number;

  @Column({ type: 'int', default: 0, comment: '最大下单数，0不限' })
  maxOrderNum: number;

  @Column({ type: 'json', nullable: true, comment: '参数模板' })
  paramsTemplate: string;

  @Column({ type: 'json', nullable: true, comment: '原始数据' })
  rawJson: string;

  @Column({ length: 100, default: '', comment: '商品标签' })
  label: string;

  @Column({ length: 30, default: '', comment: '商品单位' })
  unit: string;

  @Column({ type: 'text', nullable: true, comment: '商品描述' })
  desc: string;

  @Column({ type: 'longtext', nullable: true, comment: '商品详情' })
  detail: string;

  @Column({ length: 100, default: '', comment: '注意事项标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '注意事项内容' })
  content: string;
}
