import { CoolController, BaseController } from '@cool-midway/core';
import { CatalogCategoryEntity } from '../../entity/category';
import { CatalogCategoryService } from '../../service/category';

@CoolController({
  api: ['list'],
  entity: CatalogCategoryEntity,
  service: CatalogCategoryService,
})
export class OpenCatalogCategoryController extends BaseController {}
