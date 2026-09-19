import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const photos = [
  ['imperial.jpg', 'Imperial College London', 'https://commons.wikimedia.org/wiki/Special:FilePath/Imperial%20College%20London%20down%20Exhibition%20Road.jpg', 'https://commons.wikimedia.org/wiki/File:Imperial_College_London_down_Exhibition_Road.jpg'],
  ['lse.jpg', 'London School of Economics', 'https://www.lse.ac.uk/all-images/london-westminster-june-24-0012.x26beb190.jpg', 'https://www.lse.ac.uk/'],
  ['ucl.jpg', 'University College London', 'https://commons.wikimedia.org/wiki/Special:FilePath/Wilkins%20Building%201%2C%20UCL%2C%20London%20-%20Diliff.jpg', 'https://commons.wikimedia.org/wiki/File:Wilkins_Building_1,_UCL,_London_-_Diliff.jpg'],
  ['cambridge.jpg', 'University of Cambridge', 'https://commons.wikimedia.org/wiki/Special:FilePath/St%20John%27s%20College%20Second%20Court%2C%20Cambridge%2C%20UK%20-%20Diliff.jpg', 'https://commons.wikimedia.org/wiki/File:St_John%27s_College_Second_Court,_Cambridge,_UK_-_Diliff.jpg'],
  ['edinburgh.jpg', 'University of Edinburgh', 'https://commons.wikimedia.org/wiki/Special:FilePath/Old%20College%20Quad.jpg', 'https://commons.wikimedia.org/wiki/File:Old_College_Quad.jpg'],
  ['udk.jpg', 'Berlin University of the Arts', 'https://commons.wikimedia.org/wiki/Special:FilePath/CharlottenburgHardenbergstra%C3%9FeUDK.jpg', 'https://commons.wikimedia.org/wiki/File:CharlottenburgHardenbergstra%C3%9FeUDK.jpg'],
  ['constructor.jpg', 'Constructor University', 'https://constructor.university/sites/default/files/2025-07/Campus.jpg', 'https://constructor.university/blog/living-on-and-off-campus'],
  ['heidelberg.jpg', 'Heidelberg University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Alte%20Universitaet.JPG', 'https://commons.wikimedia.org/wiki/File:Alte_Universitaet.JPG'],
  ['lmu.jpg', 'LMU Munich', 'https://cms-cdn.lmu.de/media/archiv-mediapool-easydb/newsroom-easydb/lmu_4841_winter_hg_pano_full_1_1_format_l.jpg', 'https://www.lmu.de/en/newsroom/news-overview/news/a-tour-of-lmu-munichs-main-building-3053f01a.html'],
  ['rhine-waal.jpg', 'Rhine-Waal University of Applied Sciences', 'https://commons.wikimedia.org/wiki/Special:FilePath/FH%20Rhein-Waal%20Kleve%20%283%29.jpg', 'https://commons.wikimedia.org/wiki/File:FH_Rhein-Waal_Kleve_(3).jpg'],
  ['bocconi.jpg', 'Bocconi University', 'https://beyondborders.dtu.dk/bb_library/Bocconi%20University/Bocconi%20University%20-%20University%20Wide/Images/IMG_2938_Bocconi2.jpg', 'https://beyondborders.dtu.dk/pages/university.aspx?uid=17235e9e-86bc-f011-9172-005056b29981'],
  ['naba.jpg', 'NABA Milan', 'https://p6.itc.cn/images01/20230811/5985253a5fb44013be96e829fdf1387e.png', 'https://www.naba.it/'],
  ['polimi.jpg', 'Politecnico di Milano', 'https://commons.wikimedia.org/wiki/Special:FilePath/Polimi%20Leonardo%20campus%20main%20building.jpg', 'https://commons.wikimedia.org/wiki/File:Polimi_Leonardo_campus_main_building.jpg'],
  ['sapienza.jpg', 'Sapienza University of Rome', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sapienza%20entrance%20%2820040201351%29.jpg', 'https://commons.wikimedia.org/wiki/File:Sapienza_entrance_(20040201351).jpg'],
  ['bologna.jpg', 'University of Bologna', 'https://commons.wikimedia.org/wiki/Special:FilePath/Palazzo%20Poggi%20UniBo.jpg', 'https://commons.wikimedia.org/wiki/File:Palazzo_Poggi_UniBo.jpg'],
  ['pavia.jpg', 'University of Pavia', 'https://commons.wikimedia.org/wiki/Special:FilePath/Aula%20magna-University-Pavia-Italy.jpg', 'https://commons.wikimedia.org/wiki/File:Aula_magna-University-Pavia-Italy.jpg'],
  ['aitu.jpg', 'Astana IT University', 'https://astanait.edu.kz/media/892e733b_dsc01589.jpg', 'https://astanait.edu.kz/kz/about-aitu'],
  ['kimep.jpg', 'KIMEP University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Aerial-view-kimep.jpg', 'https://commons.wikimedia.org/wiki/File:Aerial-view-kimep.jpg'],
  ['narxoz.jpg', 'Narxoz University', 'https://narxoz.edu.kz/og-image.jpg', 'https://narxoz.edu.kz/'],
  ['ubc.jpg', 'University of British Columbia', 'https://commons.wikimedia.org/wiki/Special:FilePath/Irving%20K.%20Barber%20Library.jpg', 'https://commons.wikimedia.org/wiki/File:Irving_K._Barber_Library.jpg'],
  ['toronto.jpg', 'University of Toronto', 'https://commons.wikimedia.org/wiki/Special:FilePath/Facing%20North.jpg', 'https://commons.wikimedia.org/wiki/File:Facing_North.jpg'],
  ['erasmus.jpg', 'Erasmus University Rotterdam', 'https://commons.wikimedia.org/wiki/Special:FilePath/EURbuilding.jpg', 'https://commons.wikimedia.org/wiki/File:EURbuilding.jpg'],
  ['leiden.jpg', 'Leiden University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Leiden%20-%20Rapenburg%2073.jpg', 'https://commons.wikimedia.org/wiki/File:Leiden_-_Rapenburg_73.jpg'],
  ['twente.jpg', 'University of Twente', 'https://commons.wikimedia.org/wiki/Special:FilePath/University%20of%20Twente.jpg', 'https://commons.wikimedia.org/wiki/File:University_of_Twente.jpg'],
  ['wageningen.jpg', 'Wageningen University & Research', 'https://commons.wikimedia.org/wiki/Special:FilePath/WUR%20forum%20building.JPG', 'https://commons.wikimedia.org/wiki/File:WUR_forum_building.JPG'],
  ['jagiellonian.jpg', 'Jagiellonian University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Collegium%20Maius%202017.jpg', 'https://commons.wikimedia.org/wiki/File:Collegium_Maius_2017.jpg'],
  ['kozminski.jpg', 'Kozminski University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Akademia%20Leona%20Ko%C5%BAmi%C5%84skiego%202014%2001.JPG', 'https://commons.wikimedia.org/wiki/File:Akademia_Leona_Ko%C5%BAmi%C5%84skiego_2014_01.JPG'],
  ['pjatk.jpg', 'Polish-Japanese Academy of Information Technology', 'https://pja.edu.pl/wp-content/uploads/2026/04/PJATK_Warszawa_Budynek_A_2-edited-scaled.jpg', 'https://pja.edu.pl/'],
  ['warsaw.jpg', 'University of Warsaw', 'https://commons.wikimedia.org/wiki/Special:FilePath/Warszawa%2C%20ul.%20Krakowskie%20Przedmie%C5%9Bcie%2026%2C%2028%2020170517%20001.jpg', 'https://commons.wikimedia.org/wiki/File:Warszawa,_ul._Krakowskie_Przedmie%C5%9Bcie_26,_28_20170517_001.jpg'],
  ['warsaw-tech.jpg', 'Warsaw University of Technology', 'https://commons.wikimedia.org/wiki/Special:FilePath/Gmach%20G%C5%82%C3%B3wny%20Politechniki%20Warszawskiej%202018.jpg', 'https://commons.wikimedia.org/wiki/File:Gmach_G%C5%82%C3%B3wny_Politechniki_Warszawskiej_2018.jpg'],
  ['babson.jpg', 'Babson College', 'https://commons.wikimedia.org/wiki/Special:FilePath/Tomasso%20Hall%2C%20Babson%20College.jpg', 'https://commons.wikimedia.org/wiki/File:Tomasso_Hall,_Babson_College.jpg'],
  ['boston.jpg', 'Boston University', 'https://commons.wikimedia.org/wiki/Special:FilePath/BU%20College%20of%20Communication.jpg', 'https://commons.wikimedia.org/wiki/File:BU_College_of_Communication.jpg'],
  ['nyu.jpg', 'New York University', 'https://commons.wikimedia.org/wiki/Special:FilePath/NYU07.JPG', 'https://commons.wikimedia.org/wiki/File:NYU07.JPG'],
  ['parsons.jpg', 'Parsons School of Design', 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20University%20Center%20for%20the%20New%20School%20%2848072770027%29.jpg', 'https://commons.wikimedia.org/wiki/File:The_University_Center_for_the_New_School_(48072770027).jpg'],
  ['berkeley.jpg', 'University of California, Berkeley', 'https://commons.wikimedia.org/wiki/Special:FilePath/Berkeley%20glade%20afternoon.jpg', 'https://commons.wikimedia.org/wiki/File:Berkeley_glade_afternoon.jpg'],
  ['sciences-po.jpg', 'Sciences Po', 'https://commons.wikimedia.org/wiki/Special:FilePath/Sciences%20Po%20Paris%2C%2028%20rue%20des%20Saints-P%C3%A8res%2C%20Paris%207e.jpg', 'https://commons.wikimedia.org/wiki/File:Sciences_Po_Paris,_28_rue_des_Saints-P%C3%A8res,_Paris_7e.jpg'],
  ['ecole-polytechnique.jpg', 'École Polytechnique', 'https://programmes.polytechnique.edu/sites/default/files/2019-05/0341-campus-072008PL.jpg', 'https://programmes.polytechnique.edu/en/about'],
  ['charles.jpg', 'Charles University', 'https://commons.wikimedia.org/wiki/Special:FilePath/Praha%2C%20Univerzita%20Karlova%20-%20Karolinum.jpg', 'https://commons.wikimedia.org/wiki/File:Praha,_Univerzita_Karlova_-_Karolinum.jpg'],
  ['ctu.jpg', 'Czech Technical University in Prague', 'https://commons.wikimedia.org/wiki/Special:FilePath/CVUT%20Karlovo%20namesti.jpg', 'https://commons.wikimedia.org/wiki/File:CVUT_Karlovo_namesti.jpg'],
  ['kaist.jpg', 'KAIST', 'https://kis.kaist.ac.kr/layouts/jit_basic_resources/common/images/sub/01/06_5.gif', 'https://kis.kaist.ac.kr/index.php?document_srl=375&mid=KI_Building'],
  ['korea.jpg', 'Korea University', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Korea_University_Anam_Campus.jpg/1280px-Korea_University_Anam_Campus.jpg', 'https://commons.wikimedia.org/wiki/File:Korea_University_Anam_Campus.jpg'],
  ['suny-korea.jpg', 'SUNY Korea', 'https://uploaded.kcampus.kr/Kakao_Talk_20230420_121537232_04_5fa65af102.jpg', 'https://www.sunykorea.ac.kr/'],
  ['yonsei.jpg', 'Yonsei University International Campus', 'https://www.kunwon.com/cn/board/perform.fileDown.php?BBS_GUBUN=1&SC_LOCAL=&SC_LP=&SC_SUPPLY=&SC_YEAR=&SC_word=&code=17623&mode=tn2&page=1', 'https://www.kunwon.com/cn/board/perform.read.php?BBS_GUBUN=1&BBS_IDX=186'],
];

const outputDir = path.resolve('public/universities');
await fs.mkdir(outputDir, { recursive: true });

const wait = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));
function downloadableUrl(imageUrl) {
  const marker = '/wiki/Special:FilePath/';
  if (!imageUrl.includes(marker)) return imageUrl;
  const file = decodeURIComponent(imageUrl.split(marker)[1]).replaceAll(' ', '_');
  const hash = createHash('md5').update(file).digest('hex');
  const encoded = encodeURIComponent(file).replaceAll('%2F', '/');
  return `https://thumb.wikimedia.org/wikipedia/commons/thumb/${hash[0]}/${hash.slice(0, 2)}/${encoded}/1280px-${encoded}`;
}

for (const [file, subject, imageUrl] of photos) {
  const destination = path.join(outputDir, file);
  try {
    await fs.access(destination);
    console.log(`kept ${file}`);
    continue;
  } catch {}
  let response;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await fetch(downloadableUrl(imageUrl), { headers: { 'User-Agent': 'ContinueAdmissions/1.0' }, redirect: 'follow' });
    if (response.ok || response.status !== 429) break;
    await wait(2000 * (attempt + 1));
  }
  if (!response.ok) throw new Error(`${subject}: ${response.status}`);
  const input = Buffer.from(await response.arrayBuffer());
  await sharp(input).rotate().resize(1280, 720, { fit: 'cover', position: 'attention' }).jpeg({ quality: 79, mozjpeg: true }).toFile(destination);
  console.log(`saved ${file}`);
  await wait(350);
}

const currentSources = await fs.readFile(path.join(outputDir, 'SOURCES.md'), 'utf8');
const baseSources = currentSources.split('\n## Added campus photos')[0].trimEnd();
const rows = photos.map(([file, subject, , source]) => `| \`${file}\` | ${subject} | [Source](${source}) |`).join('\n');
await fs.writeFile(path.join(outputDir, 'SOURCES.md'), `${baseSources}\n\n## Added campus photos\n\n| Local file | Subject | Source |\n| --- | --- | --- |\n${rows}\n`);
