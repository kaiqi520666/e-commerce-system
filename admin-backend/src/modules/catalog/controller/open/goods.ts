import { CoolController, BaseController } from '@cool-midway/core';
import { CatalogGoodsEntity } from '../../entity/goods';
import { CatalogGoodsService } from '../../service/goods';

@CoolController({
  api: ['page', 'list', 'info'],
  entity: CatalogGoodsEntity,
  service: CatalogGoodsService,
  infoIgnoreProperty: ['rawJson', 'createTime', 'updateTime', 'tenantId'],
})
export class OpenCatalogGoodsController extends BaseController {}
