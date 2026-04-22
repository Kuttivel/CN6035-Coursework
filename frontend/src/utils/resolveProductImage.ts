export default function resolveProductImage(product: {
  imageCid?: string;
  imageUrl?: string;
}) {
  if (product.imageUrl) {
    return product.imageUrl;
  }

  if (!product.imageCid) {
    return "";
  }

  if (product.imageCid.startsWith("data:")) {
    return product.imageCid;
  }

  if (product.imageCid.startsWith("local://")) {
    return product.imageUrl || "";
  }

  return `https://ipfs.io/ipfs/${product.imageCid}`;
}
