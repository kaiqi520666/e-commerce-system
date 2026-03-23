import { categoryApi } from './category.api'
import { goodsApi } from './goods.api'

export const catalogApi = {
  categoryList: (...args) => categoryApi.list(...args),
  goodsList: (...args) => goodsApi.list(...args),
  goodsPage: (...args) => goodsApi.page(...args),
  goodsInfo: (...args) => goodsApi.info(...args),
}
