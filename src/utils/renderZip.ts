// import * as JSZip from 'jszip';
const JSZip = require('jszip');

type File = {
  data: number[];
  type: BufferSource;
};
type fileItem = {
  dir: boolean;
  name: string;
  blobUrl?: string;
};
export const renderZipTree = async (file: File) => {
  const zip = new JSZip();
  const zipData = await zip.loadAsync(file.data); // 将文件转化为zip格式

  // 将zip文件中的所有文件名存入fileList中
  let fileList: fileItem[] = []; // 文件列表
  for (const key in zipData.files) {
    const element = zipData.files[key];
    if (element.dir) continue;
    // 如果是css文件,则声明为 text/css
    // 如果是js文件,则声明为 text/javascript
    // 如果是html文件,则声明为 text/html
    // 如果是图片文件,则声明为 image/png
    // 如果是其他文件,则声明为 text/plain
    const type = element.name.split('.')[element.name.split('.').length - 1];
    let blobType = 'text/plain';
    switch (type) {
      case 'css':
        blobType = 'text/css';
        break;

      case 'js':
        blobType = 'application/javascript; charset=UTF-8';
        break;

      case 'html':
        blobType = 'text/html';
        break;

      case 'png':
        blobType = 'image/png';
        break;

      default:
        break;
    }

    const blobData = await element.async('blob');
    const blob = new Blob([blobData], { type: blobType });

    fileList.push({
      dir: element.dir,
      name: element.name,
      blobUrl: URL.createObjectURL(blob),
    });
  }

  // 找到zip文件中的index.html文件
  const indexHtml = zipData.files['index.html'];
  console.log('🚀  file: renderZip.ts:66  renderZipTree  zipData.files:', zipData.files);
  // 将index.html文件转化为字符串
  const indexHtmlStr = await indexHtml.async('string');
  const newFileStr = parseLink(indexHtmlStr, '/appStore/', fileList);
  return newFileStr;
};

// 解析文件字符串中的所有链接,并重定向到本地
export const parseLink = (fileStr: string, originPath: string, fileList: fileItem[]) => {
  // 遍历所有字符串,如果匹配到了fileList中的文件,则将其重定向到本地
  let newFileStr = fileStr;
  for (let i = 0; i < fileList.length; i++) {
    const item = fileList[i];
    const reg = new RegExp(`/${item.name}`, 'g');
    if (reg.test(fileStr)) {
      // 匹配到了
      if (item.blobUrl) {
        const blobUrl = item.blobUrl;
        // 将文件重定向到本地
        newFileStr = newFileStr.replace(reg, blobUrl);
      }
    }

    const reg2 = new RegExp(`defer(=|\\s*|=\\s*)("|')defer("|')`, 'g');
    if (reg2.test(fileStr)) {
      // 匹配到了
      if (item.blobUrl) {
        newFileStr = newFileStr.replace(reg2, `async`);
      }
    }
  }

  // 测试代码--start
  const slBlob = new Blob(['console.log("hello world")'], { type: 'text/javascript' });
  const slBlobUrl = URL.createObjectURL(slBlob);
  // 找到body标签
  const bodyReg = /<body.*?>/;
  const bodyMatch = newFileStr.match(bodyReg);
  if (bodyMatch) {
    const bodyStr = bodyMatch[0];
    const newBodyStr = bodyStr + `<script src="${slBlobUrl}"></script>`;
    newFileStr = newFileStr.replace(bodyReg, newBodyStr);
  }
  // 测试代码--end

  return newFileStr;
};
