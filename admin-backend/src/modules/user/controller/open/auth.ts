import { CoolController, BaseController } from '@cool-midway/core';
import { UserInfoService } from '../../service/info';

/**
 * 认证
 */
@CoolController({
  serviceApis: ['login', 'register'],
  service: UserInfoService,
})
export class OpenUserAuthController extends BaseController {}
