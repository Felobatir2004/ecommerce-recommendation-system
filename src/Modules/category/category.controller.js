import {Router}from 'express'
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import * as categorys from './services/category.service.js'
import { asyncHandler } from '../../utils/error handling/asyncHandler.js';
import { uploadCloud } from '../../utils/fileUploading/multerCloud.js';
const router= Router()
router.post(
    '/addcategory',
    authentication(),
    allowTo('Admin'),
    uploadCloud().single('image'),
    asyncHandler(categorys.addcategory)
)
router.get(
    '/getcategory/:id',
    authentication(),
    asyncHandler(categorys.getcategory)
)
router.get(
    '/getallcategory',
    authentication(),
    asyncHandler(categorys.getallcategory)
)
router.put(
    '/updatecategory/:id',
    authentication(),
    asyncHandler(categorys.updatecategory)
)
router.delete(
    '/deletecategory/:id',
    authentication(),
    asyncHandler(categorys.deletecategory)
)
export default router