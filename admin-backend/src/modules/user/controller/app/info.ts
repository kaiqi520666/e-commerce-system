import { CoolController, BaseController } from '@cool-midway/core';

/**
 * 用户信息
 */
@CoolController({
  serviceApis: ['person', 'updatePerson'],
})
export class AppUserInfoController extends BaseController {}
