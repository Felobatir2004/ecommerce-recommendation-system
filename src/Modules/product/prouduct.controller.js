import { Router } from "express";
import { allowTo, authentication } from "../../middlewares/auth.middleware.js";
import * as products from './services/product.service.js';
import { uploadCloud } from '../../utils/fileUploading/multerCloud.js';
import { asyncHandler } from "../../utils/error handling/asyncHandler.js";

const router=Router()
router.post(
    '/addproduct',
    authentication(),
    allowTo('Admin'),
    uploadCloud().single('image'),
    asyncHandler(products.addproduct)
)
router.get(
    '/getproductById/:id',
    authentication(),
    asyncHandler(products.getproductById)
)
router.get(
    '/getProductByName',
    //authentication(),
    asyncHandler(products.getproductbyName)
)
router.get(
    '/getProductsByCategory',
    asyncHandler(products.getproductsbycategory)
)
router.get(
    '/getallproduct',
    //authentication(),
    asyncHandler(products.getallproduct)
)
router.delete(
    'deleteproduct/:id',
    //allowTo('Admin'),
    //authentication(),
    asyncHandler(products.deleteproduct)
)
router.put(
    '/updateproduct/:id',
    allowTo('Admin'),
    authentication(),
    asyncHandler(products.updateproduct)
)
export default router


