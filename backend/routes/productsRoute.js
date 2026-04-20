import {
  createProductSchema,
  updateProductSchema,
  deleteProductSchema,
  getProductsSchema,
  getProductSchema,
  rateProductSchema,
} from "../schemas/product.schema.js";
import { buffer } from "stream/consumers";
import { v4 } from "uuid";
import Product from "../models/product.js";
import { getProductCount } from "../contract/services/getProductCount.js";
import { File } from "buffer";
import Review from "../models/review.js";

function hasPinataConfig() {
  return Boolean(process.env.PINATA_JWT && process.env.PINATA_GATEWAY_URL);
}

function buildLocalImageUrl(image) {
  return `data:${image.metadata.mimetype};base64,${image.buffer.toString(
    "base64"
  )}`;
}

async function uploadProductImage(pinata, image, fields) {
  if (hasPinataConfig()) {
    const file = new File([image.buffer], v4(), {
      type: image.metadata.mimetype,
    });

    const { id, cid } = await pinata.upload.public.file(file).keyvalues(fields);

    return {
      imageId: id,
      imageCid: cid,
      imageUrl: "",
    };
  }

  const localImageId = `local-${v4()}`;
  const localImageCid = `local://${localImageId}`;
  const localImageUrl = buildLocalImageUrl(image);

  return {
    imageId: localImageId,
    imageCid: localImageCid,
    imageUrl: localImageUrl,
  };
}

function getErrorMessage(error) {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message?.message) {
    return error.message.message;
  }

  if (error?.message) {
    return error.message;
  }

  return "Unknown error";
}

export default async function productRoutes(fastify) {
  const { pinata } = fastify;

  fastify.post(
    "/create-product",
    {
      schema: createProductSchema,
      preValidation: async (request, reply) => {
        if (!request.isMultipart()) {
          return reply.status(400).send({ message: "Multipart required" });
        }

        let fileBuffer;
        let fileMeta;
        const fields = {};

        for await (const part of request.parts()) {
          if (part.type === "file") {
            fileMeta = part;
            fileBuffer = await buffer(part.file);
          } else {
            fields[part.fieldname] = part.value;
          }
        }

        if (!fileBuffer) {
          return reply.status(400).send({ message: "Image file required" });
        }

        request.body = {
          ...fields,
          file: {
            buffer: fileBuffer,
            metadata: fileMeta,
          },
        };
      },
    },
    async (request, reply) => {
      try {
        const { file: image, ...fields } = request.body;

        const productCount = await getProductCount(fastify);
        const imageData = await uploadProductImage(pinata, image, fields);

        const product = await Product.create({
          ...fields,
          seller: fields.seller.toLowerCase(),
          active: false,
          ...imageData,
          productId: (productCount + 1n).toString(),
        });

        return reply.send({ success: true, product });
      } catch (err) {
        const message = getErrorMessage(err);
        request.log.error(err);

        return reply.status(500).send({
          message: `Upload failed: ${message}`,
        });
      }
    }
  );

  fastify.put(
    "/update-product",
    { schema: updateProductSchema },
    async (request, reply) => {
      try {
        const { id, ...fields } = request.body;

        const updatedFields = { ...fields };

        if (updatedFields.seller) {
          updatedFields.seller = updatedFields.seller.toLowerCase();
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          updatedFields,
          { new: true }
        );

        return reply.send({ success: true, product: updatedProduct });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to update product" });
      }
    }
  );

  fastify.get(
    "/get-products",
    { schema: getProductsSchema },
    async (request, reply) => {
      try {
        const { page, limit, search: searchQuery } = request.query;

        const search = searchQuery
          ? {
              $or: [
                { name: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
              ],
              active: true,
            }
          : { active: true };

        const products = await Product.find(search)
          .populate("reviews")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 });

        const total = await Product.countDocuments(search);

        return reply.send({
          success: true,
          meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
          products,
        });
      } catch (err) {
        request.log.error(err);
        return reply
          .status(500)
          .send({ success: false, message: "Failed to get products" });
      }
    }
  );

  fastify.get(
    "/get-product",
    { schema: getProductSchema },
    async (request, reply) => {
      try {
        const { productId, id } = request.query;

        const result = await Product.findOne(id ? { _id: id } : { productId })
          .populate("reviews");

        return reply.send({ success: true, product: result });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get product" });
      }
    }
  );

  fastify.delete(
    "/delete-product",
    { schema: deleteProductSchema },
    async (request, reply) => {
      try {
        const { id } = request.body;

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
          return reply.status(404).send({
            success: false,
            message: "Product not found",
          });
        }

        if (
          hasPinataConfig() &&
          deletedProduct.imageId &&
          !deletedProduct.imageId.startsWith("local-")
        ) {
          await pinata.files.public.delete([deletedProduct.imageId]);
        }

        return reply.send({
          success: true,
          message: "Product deleted successfully",
        });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to delete product" });
      }
    }
  );

  fastify.put(
    "/rate-product/:id",
    { schema: rateProductSchema },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { rating, comment, reviewer } = request.body;

        const product = await Product.findById(id);

        if (!product) {
          return reply.status(404).send({ message: "Product not found" });
        }

        if (product.seller === reviewer.toLowerCase()) {
          return reply.status(403).send({
            message: "You cannot rate your own product",
          });
        }

        const existingReview = await Review.findOne({
          reviewer: reviewer.toLowerCase(),
          product: id,
        });

        if (existingReview) {
          return reply.status(409).send({
            message: "You have already rated this product",
          });
        }

        const review = await Review.create({
          product: id,
          reviewer: reviewer.toLowerCase(),
          rating,
          comment,
        });

        await Product.findByIdAndUpdate(id, {
          $push: { reviews: review._id },
        });

        const stats = await Review.aggregate([
          { $match: { product: review.product } },
          {
            $group: {
              _id: "$product",
              averageRating: { $avg: "$rating" },
              ratingCount: { $sum: 1 },
            },
          },
        ]);

        const averageRating = stats[0]?.averageRating || 0;
        const ratingCount = stats[0]?.ratingCount || 0;

        const finalProduct = await Product.findByIdAndUpdate(
          id,
          {
            averageRating,
            ratingCount,
          },
          { new: true }
        ).populate("reviews");

        return reply.send({
          success: true,
          product: finalProduct,
        });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to rate product" });
      }
    }
  );
}