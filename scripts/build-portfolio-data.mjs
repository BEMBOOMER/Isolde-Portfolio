import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const portfolioDir = path.join(rootDir, 'assets', 'Portfolio');
const thumbsDir = path.join(portfolioDir, '.thumbs');
const outputFile = path.join(rootDir, 'js', 'portfolio-data.js');

const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

const categoryOrder = ['Fotografie', 'Illustraties', 'Projecten', 'Videografie'];

function toSlug(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function encodePathSegments(relativePath) {
  return relativePath.split(path.sep).map(encodeURIComponent).join('/');
}

function getImageFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getImageFiles(fullPath);
      }

      return imageExtensions.has(path.extname(entry.name).toLowerCase()) ? [fullPath] : [];
    })
    .sort((left, right) => left.localeCompare(right, 'nl'));
}

function createImageItem(absolutePath, categoryName, projectName) {
  const relativePath = path.relative(rootDir, absolutePath);
  const absoluteThumbPath = path.join(thumbsDir, path.relative(portfolioDir, absolutePath));
  const relativeThumbPath = path.relative(rootDir, absoluteThumbPath);
  const thumbPath = fs.existsSync(absoluteThumbPath)
    ? encodePathSegments(relativeThumbPath)
    : encodePathSegments(relativePath);

  return {
    type: 'image',
    src: encodePathSegments(relativePath),
    thumb: thumbPath,
    alt: `${categoryName} - ${projectName}`
  };
}

function createProject(projectName, categoryName, files, index) {
  const items = files.map((filePath) => createImageItem(filePath, categoryName, projectName));
  const coverItem = items[0] || null;

  return {
    slug: toSlug(projectName),
    name: projectName,
    label: `Project ${String(index + 1).padStart(2, '0')}`,
    description: `${items.length} ${items.length === 1 ? 'werk' : 'werken'} uit ${projectName}.`,
    type: 'image',
    cover: coverItem ? coverItem.thumb : '',
    items
  };
}

function parseVideoId(urlString) {
  try {
    const url = new URL(urlString);
    return url.searchParams.get('v') || '';
  } catch (error) {
    return '';
  }
}

function parseVideoGroups(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const groups = [];
  let currentGroup = null;

  lines.forEach((line) => {
    if (line.endsWith(':')) {
      currentGroup = {
        name: line.slice(0, -1),
        urls: []
      };
      groups.push(currentGroup);
      return;
    }

    if (currentGroup) {
      currentGroup.urls.push(line);
    }
  });

  return groups;
}

function buildPhotographyCategory() {
  const categoryName = 'Fotografie';
  const categoryDir = path.join(portfolioDir, categoryName);
  const projectDirectories = fs.readdirSync(categoryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'nl'));

  return {
    slug: 'fotografie',
    name: categoryName,
    projects: projectDirectories.map((projectName, index) => {
      const files = getImageFiles(path.join(categoryDir, projectName));
      return createProject(projectName, categoryName, files, index);
    })
  };
}

function buildIllustrationsCategory() {
  const categoryName = 'Illustraties';
  const categoryDir = path.join(portfolioDir, categoryName);
  const titleMap = {
    crowtransparant: 'DIGITAAL',
    ifacucuchristmasnocred: 'DIGITAAL',
    img6676: 'SCHETS',
    kattttv2: 'DIGITAAL',
    nocredtransparent: 'DIGITAAL'
  };
  const files = fs.readdirSync(categoryDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => path.join(categoryDir, entry.name))
    .sort((left, right) => left.localeCompare(right, 'nl'));

  return {
    slug: 'illustraties',
    name: categoryName,
    projects: files.map((filePath, index) => {
      const baseName = path.basename(filePath, path.extname(filePath));
      const normalizedName = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '');
      const projectName = titleMap[normalizedName] || 'DIGITAAL';
      const item = createImageItem(filePath, categoryName, projectName);

      return {
        slug: toSlug(baseName),
        name: projectName,
        label: `Project ${String(index + 1).padStart(2, '0')}`,
        description: '',
        type: 'image',
        cover: item.thumb,
        items: [item]
      };
    })
  };
}

function buildProjectsCategory() {
  const categoryName = 'Projecten';
  const categoryDir = path.join(portfolioDir, categoryName);
  const projectDirectories = fs.readdirSync(categoryDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, 'nl'));

  return {
    slug: 'projecten',
    name: categoryName,
    projects: projectDirectories.map((projectName, index) => {
      const files = getImageFiles(path.join(categoryDir, projectName));
      return createProject(projectName, categoryName, files, index);
    })
  };
}

function buildVideoCategory() {
  const categoryName = 'Videografie';
  const linksFile = path.join(portfolioDir, categoryName, 'LinksYT.txt');
  const groups = parseVideoGroups(linksFile);

  return {
    slug: 'videografie',
    name: categoryName,
    projects: groups.map((group, index) => {
      const items = group.urls.map((url, itemIndex) => {
        const videoId = parseVideoId(url);
        return {
          type: 'video',
          url,
          videoId,
          title: `${group.name} ${String(itemIndex + 1).padStart(2, '0')}`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
        };
      });

      return {
        slug: toSlug(group.name),
        name: group.name,
        label: `Project ${String(index + 1).padStart(2, '0')}`,
        description: `${items.length} video${items.length === 1 ? '' : '\'s'} in ${group.name}.`,
        type: 'video',
        cover: items[0] ? items[0].thumbnail : '',
        items
      };
    })
  };
}

const builders = {
  Fotografie: buildPhotographyCategory,
  Illustraties: buildIllustrationsCategory,
  Projecten: buildProjectsCategory,
  Videografie: buildVideoCategory
};

const portfolioData = categoryOrder.reduce((result, categoryName) => {
  const category = builders[categoryName]();
  result[category.slug] = category;
  return result;
}, {});

const fileContents = `window.PORTFOLIO_DATA = ${JSON.stringify(portfolioData, null, 2)};\n`;
fs.writeFileSync(outputFile, fileContents, 'utf8');

console.log(`Generated ${path.relative(rootDir, outputFile)}`);
