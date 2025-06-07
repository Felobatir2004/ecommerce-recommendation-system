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
    asyncHandler(categorys.addcategory)
)
router.get(
    '/getCategoryById/:id',
    asyncHandler(categorys.getcategoryById)
)
router.get(
    '/getCategorybyName',
    authentication(),
    asyncHandler(categorys.getCategorybyName)
)

router.get(
    '/getallcategory',
    asyncHandler(categorys.getallcategory)
)
router.put(
    '/updatecategory/:id',
    asyncHandler(categorys.updatecategory)
)
router.delete(
    '/deletecategory/:id',
    asyncHandler(categorys.deletecategory)
)
export default router