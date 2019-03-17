const fs = require('fs');

const readFile = fileName => {
  return new Promise((fulfill, reject) => {
    const data = fs.readFileSync(fileName, 'utf8').trim().split('\n');
    const numberOfPhotos = data[0];
    const photos = data.splice(1);
    
    fulfill({ numberOfPhotos, photos });
  });
};

const parsePhotos = ({ numberOfPhotos, photos }) => {
  const photoObjects = [];

  for (let i in photos) {
    let photo = {
      id: i,
      position: photos[i][0],
      tags: photos[i].split(' ').splice(2)
    };

    photoObjects.push(photo);
  }

  const vPhotos = photoObjects.filter(item => item.position === 'V');
  const hPhotos = photoObjects.filter(item => item.position === 'H');

  const vPhotoPairs = [];

  let slides = hPhotos;

  if ( vPhotos.length > 0 ) {
    vPhotos.reduce((a, b, index, src) => {
      const found = a.tags.some(r => {
        let check = b.tags.indexOf(r) >= 1;

        if (check) {
          b.tags.splice(b.tags.indexOf(r), 1);
        }

        return check;
      });

      if (found) {
        let slide = {
          position: a.position + b.position,
          tags: a.tags.concat(b.tags),
          id: a.id + ' ' + b.id
        };

        if ( vPhotoPairs.indexOf(slide) === -1 ) {
          let index1 = vPhotos.indexOf(a);
          let index2 = vPhotos.indexOf(b);

          vPhotos.splice(index1, 1);
          vPhotos.splice(index2, 1);

          vPhotoPairs.push(slide);
        }
      }

      return src[index];
    });

    slides = hPhotos.concat(vPhotoPairs);
  }

  if ( slides.length > 0 ) {
    function compare(a, b) {
      let indexSame = 0;
      let indexDiff = 0;
      let check = -1;
      let minIndexSame = 0;
      let maxIndexSame = 0;
      let minIndexDiff = 0;
      let maxIndexDiff = 0;

      a.tags.some(r => {
        check = b.tags.indexOf(r) >= 1 ? 1 : -1;

        if (check == 1) {
          indexSame++;
          minIndexSame = minIndexSame == 0 ? indexSame : Math.min(minIndexSame, indexSame);
          maxIndexSame = maxIndexSame == 0 ? indexSame : Math.max(maxIndexSame, indexSame);
        } else {
          indexDiff++;
          minIndexDiff = minIndexDiff == 0 ? indexDiff : Math.min(minIndexDiff, indexDiff);
          maxIndexDiff = maxIndexDiff == 0 ? indexDiff : Math.max(maxIndexDiff, indexDiff);
        }
      });

      return minIndexSame == 1 ? 1 : -1;
    }

    slides.sort(compare);
  }

  saveFile(slides);
};

function saveFile(slides) {
  const numberOfSlides = Object.values(slides).length;

  let output = '';
  let idArr = [];

  for (let i = 0; i < slides.length; i++) {
    idArr.push(slides[i].id);
  }

  output = numberOfSlides + '\n' + idArr.join('\n');

  fs.writeFile('a_example_output.txt', output, 'utf8', err => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

readFile('a_example.txt')
.then(data => {
  parsePhotos(data);
});
