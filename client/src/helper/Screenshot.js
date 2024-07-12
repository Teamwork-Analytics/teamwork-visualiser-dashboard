import html2canvas from "html2canvas";

const exportAsImage = async (el, imageFileName) => {
  const canvas = await html2canvas(el, { scale: 5 });
  const image = canvas.toDataURL("image/png", 1.0);
  // download the image
  console.log(image); //TODO: prints in console log for debugging.
};

export default exportAsImage;
