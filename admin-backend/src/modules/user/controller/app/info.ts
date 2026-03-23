import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoService } from '../../service/info';

/**
 * 用户信息
 */
@CoolController({
  serviceApis: ['person', 'updatePerson'],
  service: UserInfoService,
})
export class AppUserInfoController extends BaseController {}
